from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import (
    User, Location, Service, Queue, QueueEntry, QueueEntryStatus,
    Counter, Notification
)
from app.schemas.queue_engine import JoinQueueResponse
from app.websocket.events import notify_queue_event_sync, QueueEvents

class QueueEngineService:
    @staticmethod
    def join_queue(db: Session, queue_id: int, user_id: int) -> JoinQueueResponse:
        # 1. Verify queue exists
        queue = db.query(Queue).filter(Queue.id == queue_id).first()
        if not queue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Queue with ID {queue_id} does not exist."
            )

        # 2. Verify queue is open
        if queue.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This queue is currently closed or inactive."
            )

        # Verify service & location
        srv = db.query(Service).filter(Service.id == queue.service_id).first()
        loc = db.query(Location).filter(Location.id == queue.location_id).first()
        if not srv or not loc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated service or location not found."
            )

        # 3. Verify user isn't already in the same active queue
        existing_active = db.query(QueueEntry).filter(
            QueueEntry.queue_id == queue_id,
            QueueEntry.user_id == user_id,
            QueueEntry.status.in_([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED, QueueEntryStatus.SERVING])
        ).first()

        if existing_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User is already in this active queue with token {existing_active.token_number}."
            )

        # 4. Determine next token number
        queue.current_token += 1
        db.flush()

        prefix = "".join([w[0] for w in srv.name.split()]).upper()[:2]
        if not prefix:
            prefix = "A"
        token_str = f"{prefix}-{queue.current_token:03d}"

        # 5. Determine position & people ahead
        waiting_entries = db.query(QueueEntry).filter(
            QueueEntry.queue_id == queue_id,
            QueueEntry.status == QueueEntryStatus.WAITING
        ).count()

        position = waiting_entries + 1
        people_ahead = waiting_entries

        # 6. Calculate initial estimated wait
        active_counters = db.query(Counter).filter(
            Counter.location_id == loc.id,
            Counter.status == "open"
        ).count()
        if active_counters == 0:
            active_counters = 1

        from app.ml.client import ml_client
        pred = ml_client.predict_wait_time_sync(
            people_ahead=people_ahead,
            average_service_time=srv.average_service_time,
            active_counters=active_counters
        )
        estimated_wait_minutes = pred["predicted_wait_minutes"]

        # 7. Create QueueEntry

        new_entry = QueueEntry(
            queue_id=queue.id,
            user_id=user_id,
            token_number=token_str,
            position=position,
            status=QueueEntryStatus.WAITING,
            joined_at=datetime.utcnow(),
            estimated_wait=estimated_wait_minutes
        )
        db.add(new_entry)
        db.flush()

        # Add notification for user
        from app.services.notification_service import NotificationService
        NotificationService.trigger_joined_notification(db, user_id, token_str, new_entry.id)
        db.commit()

        db.refresh(new_entry)

        # Broadcast WebSocket event
        notify_queue_event_sync(db, queue.id, QueueEvents.CUSTOMER_JOINED, {"token": token_str})
        notify_queue_event_sync(db, queue.id, QueueEvents.QUEUE_UPDATED)

        # 8. Return token and queue information
        return JoinQueueResponse(
            token=new_entry.token_number,
            position=new_entry.position,
            people_ahead=people_ahead,
            estimated_wait_minutes=new_entry.estimated_wait,
            status=new_entry.status.value,
            entry_id=new_entry.id,
            queue_id=queue.id,
            service_id=srv.id
        )

    @staticmethod
    def cancel_queue_entry(db: Session, entry_id: int, user_id: Optional[int] = None) -> QueueEntry:
        query = db.query(QueueEntry).filter(QueueEntry.id == entry_id)
        if user_id is not None:
            query = query.filter(QueueEntry.user_id == user_id)

        entry = query.first()
        if not entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Queue entry #{entry_id} not found or unauthorized."
            )

        if entry.status == QueueEntryStatus.CANCELLED:
            return entry

        # Mark entry CANCELLED
        entry.status = QueueEntryStatus.CANCELLED
        queue_id = entry.queue_id

        if entry.user_id:
            from app.services.notification_service import NotificationService
            NotificationService.trigger_cancelled_notification(db, entry.user_id, entry.id)

        db.commit()

        # Recalculate positions & notify affected users
        QueueEngineService.recalculate_queue_positions(db, queue_id)
        notify_queue_event_sync(db, queue_id, QueueEvents.CUSTOMER_CANCELLED, {"token": entry.token_number})
        notify_queue_event_sync(db, queue_id, QueueEvents.QUEUE_UPDATED)
        db.refresh(entry)
        return entry

    @staticmethod
    def recalculate_queue_positions(db: Session, queue_id: int) -> None:
        queue = db.query(Queue).filter(Queue.id == queue_id).first()
        if not queue:
            return

        srv = db.query(Service).filter(Service.id == queue.service_id).first()
        loc = db.query(Location).filter(Location.id == queue.location_id).first()

        active_counters = db.query(Counter).filter(
            Counter.location_id == loc.id if loc else 0,
            Counter.status == "open"
        ).count() if loc else 1
        if active_counters == 0:
            active_counters = 1

        avg_service_time = srv.average_service_time if srv else 10

        # Fetch remaining WAITING entries ordered by joined_at
        waiting_entries = db.query(QueueEntry).filter(
            QueueEntry.queue_id == queue_id,
            QueueEntry.status == QueueEntryStatus.WAITING
        ).order_by(QueueEntry.joined_at.asc()).all()

        from app.ml.client import ml_client
        from app.services.notification_service import NotificationService

        for idx, entry in enumerate(waiting_entries):
            new_pos = idx + 1
            people_ahead = idx
            pred = ml_client.predict_wait_time_sync(
                people_ahead=people_ahead,
                average_service_time=avg_service_time,
                active_counters=active_counters
            )
            new_est_wait = pred["predicted_wait_minutes"]

            if entry.position != new_pos or entry.estimated_wait != new_est_wait:
                entry.position = new_pos
                entry.estimated_wait = new_est_wait

            # Trigger position notifications (5 away / 1 away) for active waiting users
            if entry.user_id:
                NotificationService.trigger_position_notification(db, entry.user_id, new_pos, entry.id)

        db.commit()


    @staticmethod
    def advance_queue(db: Session, queue_id: int) -> Optional[QueueEntry]:
        """
        Advances the queue when a service completes:
        Moves current serving entry to COMPLETED and calls the next waiting entry.
        """
        # Complete currently serving entry
        serving_entry = db.query(QueueEntry).filter(
            QueueEntry.queue_id == queue_id,
            QueueEntry.status == QueueEntryStatus.SERVING
        ).first()

        if serving_entry:
            serving_entry.status = QueueEntryStatus.COMPLETED
            serving_entry.completed_at = datetime.utcnow()
            db.flush()

        # Get next waiting entry
        next_entry = db.query(QueueEntry).filter(
            QueueEntry.queue_id == queue_id,
            QueueEntry.status == QueueEntryStatus.WAITING
        ).order_by(QueueEntry.joined_at.asc()).first()

        if next_entry:
            next_entry.status = QueueEntryStatus.CALLED
            next_entry.called_at = datetime.utcnow()
            db.flush()

            if next_entry.user_id:
                notif = Notification(
                    user_id=next_entry.user_id,
                    queue_entry_id=next_entry.id,
                    message=f"Your token {next_entry.token_number} is called! Please proceed to counter.",
                    type="token_called",
                    is_read=False
                )
                db.add(notif)

        db.commit()
        QueueEngineService.recalculate_queue_positions(db, queue_id)
        return next_entry
