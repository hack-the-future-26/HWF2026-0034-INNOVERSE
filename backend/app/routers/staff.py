from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import (
    User, UserRole, Location, Service, Queue, QueueEntry, QueueEntryStatus,
    Counter, Notification, QueueHistory
)
from app.schemas.staff import (
    StaffDashboardSummary, StaffQueueOut, NextCustomerOut, StaffActionResponse
)
from app.dependencies.auth import get_current_user, require_roles
from app.services.queue_engine import QueueEngineService
from app.websocket.manager import manager as ws_manager
from app.websocket.events import notify_queue_event, QueueEvents

router = APIRouter(prefix="/staff", tags=["Staff Management"])

def build_staff_queue_out(queue: Queue, db: Session) -> StaffQueueOut:
    loc = db.query(Location).filter(Location.id == queue.location_id).first()
    srv = db.query(Service).filter(Service.id == queue.service_id).first()

    # Now serving token
    now_serving = db.query(QueueEntry).filter(
        QueueEntry.queue_id == queue.id,
        QueueEntry.status.in_([QueueEntryStatus.SERVING, QueueEntryStatus.CALLED])
    ).first()

    now_serving_user_name = None
    counter_name = None
    if now_serving:
        if now_serving.user_id:
            usr = db.query(User).filter(User.id == now_serving.user_id).first()
            now_serving_user_name = usr.name if usr else "Registered Customer"
        else:
            now_serving_user_name = "Walk-in Customer"

        # Assigned counter
        cnt = db.query(Counter).filter(Counter.location_id == queue.location_id, Counter.status == "open").first()
        counter_name = cnt.name if cnt else "Counter 1"

    # Waiting entries
    waiting_entries = db.query(QueueEntry).filter(
        QueueEntry.queue_id == queue.id,
        QueueEntry.status == QueueEntryStatus.WAITING
    ).order_by(QueueEntry.joined_at.asc()).all()

    next_customers = []
    for idx, e in enumerate(waiting_entries):
        uname = "Walk-in Customer"
        if e.user_id:
            usr = db.query(User).filter(User.id == e.user_id).first()
            if usr:
                uname = usr.name

        next_customers.append(NextCustomerOut(
            id=e.id,
            token_number=e.token_number,
            user_name=uname,
            joined_at=e.joined_at,
            estimated_wait_minutes=e.estimated_wait,
            position=idx + 1
        ))

    return StaffQueueOut(
        id=queue.id,
        location_id=queue.location_id,
        location_name=loc.name if loc else "Location",
        service_id=queue.service_id,
        service_name=srv.name if srv else "Service",
        status=queue.status,
        current_token=queue.current_token,
        now_serving_id=now_serving.id if now_serving else None,
        now_serving_token=now_serving.token_number if now_serving else None,
        now_serving_user=now_serving_user_name,
        now_serving_counter=counter_name,
        now_serving_status=now_serving.status.value if now_serving else None,
        waiting_count=len(waiting_entries),
        next_customers=next_customers
    )

def verify_organization_access(current_user: User, location_id: int, db: Session):
    if current_user.role == UserRole.STAFF and current_user.organization_id:
        loc = db.query(Location).filter(Location.id == location_id).first()
        if loc and loc.organization_id and loc.organization_id != current_user.organization_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Location '{loc.name}' belongs to a different organization."
            )

@router.get("/queues", response_model=List[StaffQueueOut])
def get_staff_queues(
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    query = db.query(Queue).filter(Queue.status == "active")
    if current_user.role == UserRole.STAFF and current_user.organization_id:
        query = query.join(Location, Queue.location_id == Location.id).filter(Location.organization_id == current_user.organization_id)
    queues = query.all()
    return [build_staff_queue_out(q, db) for q in queues]

@router.get("/dashboard-summary", response_model=StaffDashboardSummary)
def get_staff_dashboard_summary(
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    queue_query = db.query(Queue).filter(Queue.status == "active")
    entry_query = db.query(QueueEntry)
    counter_query = db.query(Counter).filter(Counter.status == "open")

    if current_user.role == UserRole.STAFF and current_user.organization_id:
        queue_query = queue_query.join(Location, Queue.location_id == Location.id).filter(Location.organization_id == current_user.organization_id)
        entry_query = entry_query.join(Queue, QueueEntry.queue_id == Queue.id).join(Location, Queue.location_id == Location.id).filter(Location.organization_id == current_user.organization_id)
        counter_query = counter_query.join(Location, Counter.location_id == Location.id).filter(Location.organization_id == current_user.organization_id)

    org_queue_ids = [q.id for q in queue_query.all()]

    active_queues_count = len(org_queue_ids)
    waiting_count = entry_query.filter(QueueEntry.status == QueueEntryStatus.WAITING).count()
    serving_count = entry_query.filter(QueueEntry.status.in_([QueueEntryStatus.SERVING, QueueEntryStatus.CALLED])).count()
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    completed_today = entry_query.filter(
        QueueEntry.status == QueueEntryStatus.COMPLETED,
        QueueEntry.completed_at >= today_start
    ).count()

    active_counters = counter_query.count()

    return StaffDashboardSummary(
        active_queues_count=active_queues_count,
        waiting_customers_count=waiting_count,
        currently_serving_count=serving_count,
        completed_today_count=completed_today,
        average_wait_time=12,
        active_counters_count=active_counters
    )

@router.post("/queues/{queue_id}/next", response_model=StaffActionResponse)
async def call_next_customer(
    queue_id: int,
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """
    CALL NEXT Logic:
    1. Select the next WAITING customer.
    2. Mark them CALLED.
    3. Assign an available counter.
    4. Update queue.
    5. Recalculate waiting times.
    6. Trigger notification.
    7. Broadcast queue update via WebSockets.
    """
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Queue #{queue_id} not found.")

    verify_organization_access(current_user, queue.location_id, db)

    # Select next WAITING customer
    next_entry = db.query(QueueEntry).filter(
        QueueEntry.queue_id == queue_id,
        QueueEntry.status == QueueEntryStatus.WAITING
    ).order_by(QueueEntry.joined_at.asc()).first()

    if not next_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No waiting customers in this queue."
        )

    # Find staff member's counter or location counter
    counter = db.query(Counter).filter(
        Counter.location_id == queue.location_id,
        Counter.staff_id == current_user.id
    ).first()
    if not counter:
        counter = db.query(Counter).filter(Counter.location_id == queue.location_id, Counter.status == "open").first()

    counter_name = counter.name if counter else "Counter 1"

    # Mark CALLED
    next_entry.status = QueueEntryStatus.CALLED
    next_entry.called_at = datetime.utcnow()
    db.flush()

    # Recalculate queue positions for remaining waiting
    QueueEngineService.recalculate_queue_positions(db, queue_id)

    # Trigger notification
    if next_entry.user_id:
        from app.services.notification_service import NotificationService
        NotificationService.trigger_called_notification(db, next_entry.user_id, counter_name, next_entry.id)

    db.commit()


    # Broadcast WebSocket update
    await notify_queue_event(db, queue_id, QueueEvents.CUSTOMER_CALLED, {"token": next_entry.token_number, "counter": counter_name})
    await notify_queue_event(db, queue_id, QueueEvents.QUEUE_UPDATED)

    return StaffActionResponse(
        message=f"Called token {next_entry.token_number} to {counter_name}",
        queue_entry_id=next_entry.id,
        token_number=next_entry.token_number,
        status=next_entry.status,
        counter_name=counter_name
    )

@router.post("/queue-entry/{entry_id}/start", response_model=StaffActionResponse)
async def start_service(
    entry_id: int,
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Queue entry #{entry_id} not found.")

    if entry.queue:
        verify_organization_access(current_user, entry.queue.location_id, db)

    entry.status = QueueEntryStatus.SERVING
    db.commit()

    await notify_queue_event(db, entry.queue_id, QueueEvents.CUSTOMER_STARTED, {"token": entry.token_number})
    await notify_queue_event(db, entry.queue_id, QueueEvents.QUEUE_UPDATED)

    return StaffActionResponse(
        message=f"Started service for token {entry.token_number}",
        queue_entry_id=entry.id,
        token_number=entry.token_number,
        status=entry.status
    )

@router.post("/queue-entry/{entry_id}/complete", response_model=StaffActionResponse)
async def complete_service(
    entry_id: int,
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Queue entry #{entry_id} not found.")

    if entry.queue:
        verify_organization_access(current_user, entry.queue.location_id, db)

    now = datetime.utcnow()
    entry.status = QueueEntryStatus.COMPLETED
    entry.completed_at = now

    start_time = entry.called_at or entry.joined_at
    duration_mins = max(1.0, round((now - start_time).total_seconds() / 60.0, 2))

    queue = db.query(Queue).filter(Queue.id == entry.queue_id).first()
    if queue:
        srv = db.query(Service).filter(Service.id == queue.service_id).first()
        active_counters = db.query(Counter).filter(Counter.location_id == queue.location_id, Counter.status == "open").count()
        waiting_count = db.query(QueueEntry).filter(QueueEntry.queue_id == queue.id, QueueEntry.status == QueueEntryStatus.WAITING).count()

        history = QueueHistory(
            location_id=queue.location_id,
            service_id=queue.service_id,
            hour=now.hour,
            day_of_week=now.weekday(),
            people_count=waiting_count + 1,
            active_counters=max(active_counters, 1),
            average_service_time=duration_mins,
            actual_wait_time=max(0.0, round((now - entry.joined_at).total_seconds() / 60.0, 2)),
            cancellations=0,
            no_shows=0,
            created_at=now
        )
        db.add(history)

    db.commit()

    if queue:
        QueueEngineService.recalculate_queue_positions(db, queue.id)

    await notify_queue_event(db, entry.queue_id, QueueEvents.CUSTOMER_COMPLETED, {"token": entry.token_number})
    await notify_queue_event(db, entry.queue_id, QueueEvents.QUEUE_UPDATED)

    return StaffActionResponse(
        message=f"Completed service for token {entry.token_number} (Duration: {duration_mins} mins)",
        queue_entry_id=entry.id,
        token_number=entry.token_number,
        status=entry.status
    )

@router.post("/queue-entry/{entry_id}/skip", response_model=StaffActionResponse)
async def skip_customer(
    entry_id: int,
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Queue entry #{entry_id} not found.")

    if entry.queue:
        verify_organization_access(current_user, entry.queue.location_id, db)

    entry.status = QueueEntryStatus.SKIPPED
    db.commit()

    QueueEngineService.recalculate_queue_positions(db, entry.queue_id)
    await notify_queue_event(db, entry.queue_id, QueueEvents.CUSTOMER_SKIPPED, {"token": entry.token_number})
    await notify_queue_event(db, entry.queue_id, QueueEvents.QUEUE_UPDATED)

    return StaffActionResponse(
        message=f"Skipped token {entry.token_number}",
        queue_entry_id=entry.id,
        token_number=entry.token_number,
        status=entry.status
    )

@router.post("/queue-entry/{entry_id}/no-show", response_model=StaffActionResponse)
async def no_show_customer(
    entry_id: int,
    current_user: User = Depends(require_roles(UserRole.STAFF, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Queue entry #{entry_id} not found.")

    if entry.queue:
        verify_organization_access(current_user, entry.queue.location_id, db)

    entry.status = QueueEntryStatus.NO_SHOW
    db.commit()

    QueueEngineService.recalculate_queue_positions(db, entry.queue_id)
    await notify_queue_event(db, entry.queue_id, QueueEvents.QUEUE_UPDATED)

    return StaffActionResponse(
        message=f"Marked token {entry.token_number} as NO-SHOW",
        queue_entry_id=entry.id,
        token_number=entry.token_number,
        status=entry.status
    )
