from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import (
    User, Location, Service, Queue, QueueEntry, QueueEntryStatus,
    Counter, Notification
)
from app.schemas.customer import (
    JoinQueueRequest, QueueEntryOut, NotificationOut
)
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/customer", tags=["Customer Queue"])

from app.ml.client import ml_client

def build_queue_entry_out(entry: QueueEntry, db: Session) -> QueueEntryOut:
    q = db.query(Queue).filter(Queue.id == entry.queue_id).first()
    loc = db.query(Location).filter(Location.id == q.location_id).first() if q else None
    srv = db.query(Service).filter(Service.id == q.service_id).first() if q else None

    # Calculate people ahead in queue (waiting entries joined before this entry)
    people_ahead = 0
    now_serving_token = None
    if q:
        people_ahead = db.query(QueueEntry).filter(
            QueueEntry.queue_id == q.id,
            QueueEntry.status == QueueEntryStatus.WAITING,
            QueueEntry.joined_at < entry.joined_at
        ).count()

        now_serving = db.query(QueueEntry).filter(
            QueueEntry.queue_id == q.id,
            QueueEntry.status.in_([QueueEntryStatus.SERVING, QueueEntryStatus.CALLED])
        ).first()
        if now_serving:
            now_serving_token = now_serving.token_number
        else:
            now_serving_token = f"{srv.name[:2].upper()}001" if srv else "A-001"

    # Calculate timeline stage
    if entry.status == QueueEntryStatus.COMPLETED:
        stage = 6
    elif entry.status == QueueEntryStatus.SERVING:
        stage = 5
    elif entry.status == QueueEntryStatus.CALLED or people_ahead <= 1:
        stage = 4
    elif people_ahead <= 5:
        stage = 3
    elif entry.status == QueueEntryStatus.WAITING:
        stage = 2
    else:
        stage = 1

    active_counters = db.query(Counter).filter(
        Counter.location_id == (loc.id if loc else 0),
        Counter.status == "open"
    ).count() if loc else 1
    if active_counters == 0:
        active_counters = 1

    pred = ml_client.predict_wait_time_sync(
        people_ahead=people_ahead,
        average_service_time=srv.average_service_time if srv else 10,
        active_counters=active_counters
    )

    return QueueEntryOut(
        id=entry.id,
        queue_id=entry.queue_id,
        user_id=entry.user_id,
        location_id=loc.id if loc else 0,
        location_name=loc.name if loc else "Unknown Location",
        service_id=srv.id if srv else 0,
        service_name=srv.name if srv else "Unknown Service",
        token_number=entry.token_number,
        position=entry.position,
        people_ahead=people_ahead,
        now_serving_token=now_serving_token,
        status=entry.status,
        joined_at=entry.joined_at,
        called_at=entry.called_at,
        completed_at=entry.completed_at,
        estimated_wait=pred["predicted_wait_minutes"],
        confidence=pred["confidence"],
        ai_powered=pred["ai_powered"],
        timeline_stage=stage
    )


@router.get("/active-queue", response_model=Optional[QueueEntryOut])
def get_active_queue(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(
        QueueEntry.user_id == current_user.id,
        QueueEntry.status.in_([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED, QueueEntryStatus.SERVING])
    ).order_by(QueueEntry.joined_at.desc()).first()

    if not entry:
        return None

    return build_queue_entry_out(entry, db)

@router.post("/join-queue", response_model=QueueEntryOut, status_code=status.HTTP_201_CREATED)
def join_queue(
    payload: JoinQueueRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if location and service exist
    loc = db.query(Location).filter(Location.id == payload.location_id).first()
    srv = db.query(Service).filter(Service.id == payload.service_id, Service.location_id == payload.location_id).first()

    if not loc or not srv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Specified Location or Service does not exist"
        )

    # Check if user already has an active queue entry
    existing_active = db.query(QueueEntry).filter(
        QueueEntry.user_id == current_user.id,
        QueueEntry.status.in_([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED, QueueEntryStatus.SERVING])
    ).first()

    if existing_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active queue ticket. Please complete or cancel it before joining a new queue."
        )

    # Get or create queue for service
    q = db.query(Queue).filter(Queue.location_id == loc.id, Queue.service_id == srv.id).first()
    if not q:
        q = Queue(location_id=loc.id, service_id=srv.id, status="active", current_token=0)
        db.add(q)
        db.flush()

    # Increment token counter
    q.current_token += 1
    db.flush()

    # Format token e.g., A-104 or OP008
    prefix = "".join([w[0] for w in srv.name.split()]).upper()[:2]
    token_str = f"{prefix}-{q.current_token:03d}"

    # Calculate position and estimated wait
    waiting_count = db.query(QueueEntry).filter(
        QueueEntry.queue_id == q.id,
        QueueEntry.status == QueueEntryStatus.WAITING
    ).count()

    active_counters = db.query(Counter).filter(Counter.location_id == loc.id, Counter.status == "open").count()
    if active_counters == 0:
        active_counters = 1

    pos = waiting_count + 1
    est_wait = int((pos / active_counters) * srv.average_service_time)

    new_entry = QueueEntry(
        queue_id=q.id,
        user_id=current_user.id,
        token_number=token_str,
        position=pos,
        status=QueueEntryStatus.WAITING,
        joined_at=datetime.utcnow(),
        estimated_wait=est_wait
    )
    db.add(new_entry)
    db.flush()

    # Create confirmation notification
    from app.services.notification_service import NotificationService
    NotificationService.trigger_joined_notification(db, current_user.id, token_str, new_entry.id)
    db.commit()
    db.refresh(new_entry)

    return build_queue_entry_out(new_entry, db)

@router.get("/queue-entry/{entry_id}", response_model=QueueEntryOut)
def get_queue_entry_by_id(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Queue entry #{entry_id} not found"
        )
    return build_queue_entry_out(entry, db)

@router.post("/cancel-queue/{entry_id}", response_model=QueueEntryOut)
def cancel_queue_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id, QueueEntry.user_id == current_user.id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Queue entry not found or unauthorized to cancel."
        )

    entry.status = QueueEntryStatus.CANCELLED
    from app.services.notification_service import NotificationService
    NotificationService.trigger_cancelled_notification(db, current_user.id, entry.id)
    db.commit()
    db.refresh(entry)

    return build_queue_entry_out(entry, db)

@router.get("/history", response_model=List[QueueEntryOut])
def get_queue_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entries = db.query(QueueEntry).filter(
        QueueEntry.user_id == current_user.id
    ).order_by(QueueEntry.joined_at.desc()).all()

    return [build_queue_entry_out(e, db) for e in entries]

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()
    return notifs
