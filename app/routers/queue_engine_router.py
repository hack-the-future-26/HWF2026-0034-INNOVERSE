from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import Location, Service, Queue, QueueEntry, Counter, QueueEntryStatus, User
from app.schemas.customer import LocationOut, ServiceOut
from app.schemas.queue_engine import JoinQueueResponse, QueueDetailOut, QueueEntryResponse
from app.services.queue_engine import QueueEngineService
from app.dependencies.auth import get_current_user
from app.routers.locations import build_location_out

router = APIRouter(tags=["Queue Engine"])

@router.get("/locations", response_model=List[LocationOut])
def get_locations_list(db: Session = Depends(get_db)):
    locations = db.query(Location).filter(Location.status == "active").all()
    return [build_location_out(loc, db) for loc in locations]

@router.get("/locations/{location_id}", response_model=LocationOut)
def get_location_by_id(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location #{location_id} not found."
        )
    return build_location_out(loc, db)

@router.get("/locations/{location_id}/services", response_model=List[ServiceOut])
def get_location_services(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location #{location_id} not found."
        )
    loc_out = build_location_out(loc, db)
    return loc_out.services

@router.get("/queues/{queue_id}", response_model=QueueDetailOut)
def get_queue_details(queue_id: int, db: Session = Depends(get_db)):
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Queue #{queue_id} not found."
        )

    srv = db.query(Service).filter(Service.id == queue.service_id).first()
    loc = db.query(Location).filter(Location.id == queue.location_id).first()

    waiting_count = db.query(QueueEntry).filter(
        QueueEntry.queue_id == queue_id,
        QueueEntry.status == QueueEntryStatus.WAITING
    ).count()

    active_counters = db.query(Counter).filter(
        Counter.location_id == queue.location_id,
        Counter.status == "open"
    ).count()
    if active_counters == 0:
        active_counters = 1

    avg_service_time = srv.average_service_time if srv else 10
    est_wait = int((waiting_count / active_counters) * avg_service_time)

    return QueueDetailOut(
        id=queue.id,
        location_id=queue.location_id,
        service_id=queue.service_id,
        status=queue.status,
        current_token=queue.current_token,
        total_waiting=waiting_count,
        active_counters=active_counters,
        estimated_wait_minutes=est_wait
    )

@router.post("/queues/{queue_id}/join", response_model=JoinQueueResponse, status_code=status.HTTP_201_CREATED)
def join_queue_by_id(
    queue_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Join Queue logic:
    1. Verify queue exists.
    2. Verify queue is open.
    3. Verify user isn't already in the same active queue.
    4. Determine next token number.
    5. Determine position.
    6. Determine people ahead.
    7. Calculate initial estimated wait.
    8. Create QueueEntry.
    9. Return token and queue information.
    """
    return QueueEngineService.join_queue(db=db, queue_id=queue_id, user_id=current_user.id)

@router.get("/queue-entries/{entry_id}", response_model=QueueEntryResponse)
def get_queue_entry_details(
    entry_id: int,
    db: Session = Depends(get_db)
):
    entry = db.query(QueueEntry).filter(QueueEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Queue entry #{entry_id} not found."
        )

    people_ahead = db.query(QueueEntry).filter(
        QueueEntry.queue_id == entry.queue_id,
        QueueEntry.status == QueueEntryStatus.WAITING,
        QueueEntry.joined_at < entry.joined_at
    ).count()

    return QueueEntryResponse(
        id=entry.id,
        queue_id=entry.queue_id,
        user_id=entry.user_id,
        token_number=entry.token_number,
        position=entry.position,
        people_ahead=people_ahead,
        status=entry.status,
        joined_at=entry.joined_at,
        called_at=entry.called_at,
        completed_at=entry.completed_at,
        estimated_wait_minutes=entry.estimated_wait
    )

@router.delete("/queue-entries/{entry_id}")
def cancel_queue_entry_by_id(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancellation logic:
    - Mark entry CANCELLED.
    - Recalculate positions for remaining waiting users.
    - Recalculate waiting times.
    - Notify affected users.
    """
    cancelled_entry = QueueEngineService.cancel_queue_entry(db=db, entry_id=entry_id, user_id=current_user.id)
    return {
        "message": f"Queue entry #{entry_id} (Token: {cancelled_entry.token_number}) successfully cancelled.",
        "status": "CANCELLED",
        "entry_id": entry_id
    }
