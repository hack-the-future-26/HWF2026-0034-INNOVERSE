from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models import Location, Service, Queue, QueueEntry, Counter, QueueEntryStatus
from app.schemas.customer import LocationOut, ServiceOut

router = APIRouter(prefix="/locations", tags=["Locations"])

from app.ml.client import ml_client

def build_location_out(loc: Location, db: Session) -> LocationOut:
    services_out = []
    total_loc_queue = 0
    total_wait_minutes = 0

    for srv in loc.services:
        # Find queue for service
        q = db.query(Queue).filter(Queue.service_id == srv.id, Queue.location_id == loc.id).first()
        people_in_queue = 0
        if q:
            people_in_queue = db.query(QueueEntry).filter(
                QueueEntry.queue_id == q.id,
                QueueEntry.status.in_([QueueEntryStatus.WAITING, QueueEntryStatus.CALLED, QueueEntryStatus.SERVING])
            ).count()

        active_counters = db.query(Counter).filter(
            Counter.location_id == loc.id,
            Counter.status == "open"
        ).count()
        if active_counters == 0:
            active_counters = 1

        pred = ml_client.predict_wait_time_sync(
            people_ahead=people_in_queue,
            average_service_time=srv.average_service_time,
            active_counters=active_counters
        )
        srv_est_wait = pred["predicted_wait_minutes"]

        services_out.append(ServiceOut(
            id=srv.id,
            location_id=srv.location_id,
            name=srv.name,
            description=srv.description,
            average_service_time=srv.average_service_time,
            status=srv.status,
            people_in_queue=people_in_queue,
            active_counters=active_counters,
            estimated_wait_minutes=srv_est_wait,
            confidence=pred["confidence"],
            ai_powered=pred["ai_powered"]
        ))

        total_loc_queue += people_in_queue
        total_wait_minutes += srv_est_wait

    avg_loc_wait = int(total_wait_minutes / max(len(loc.services), 1))


    org_name = loc.organization.name if loc.organization else None

    return LocationOut(
        id=loc.id,
        organization_id=loc.organization_id,
        organization_name=org_name,
        name=loc.name,
        type=loc.type,
        address=loc.address,
        latitude=loc.latitude,
        longitude=loc.longitude,
        status=loc.status,
        is_open=(loc.status == "active"),
        total_queue_size=total_loc_queue,
        estimated_wait_minutes=avg_loc_wait,
        services_count=len(loc.services),
        services=services_out
    )

@router.get("", response_model=List[LocationOut])
def get_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).filter(Location.status == "active").all()
    return [build_location_out(loc, db) for loc in locations]

@router.get("/{location_id}", response_model=LocationOut)
def get_location_by_id(location_id: int, db: Session = Depends(get_db)):
    loc = db.query(Location).filter(Location.id == location_id).first()
    if not loc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location with ID {location_id} not found"
        )
    return build_location_out(loc, db)
