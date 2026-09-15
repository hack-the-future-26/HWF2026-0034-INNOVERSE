import asyncio
from sqlalchemy.orm import Session
from app.models import Queue, QueueEntry, QueueEntryStatus, Service, Counter
from app.websocket.manager import manager

class QueueEvents:
    CUSTOMER_JOINED = "CUSTOMER_JOINED"
    CUSTOMER_CALLED = "CUSTOMER_CALLED"
    CUSTOMER_STARTED = "CUSTOMER_STARTED"
    CUSTOMER_COMPLETED = "CUSTOMER_COMPLETED"
    CUSTOMER_SKIPPED = "CUSTOMER_SKIPPED"
    CUSTOMER_CANCELLED = "CUSTOMER_CANCELLED"
    QUEUE_UPDATED = "QUEUE_UPDATED"
    WAIT_TIME_UPDATED = "WAIT_TIME_UPDATED"
    NOTIFICATION = "NOTIFICATION"

async def notify_queue_event(db: Session, queue_id: int, event_type: str, extra_data: dict = None):
    queue = db.query(Queue).filter(Queue.id == queue_id).first()
    if not queue:
        return

    srv = db.query(Service).filter(Service.id == queue.service_id).first()
    waiting_count = db.query(QueueEntry).filter(
        QueueEntry.queue_id == queue_id,
        QueueEntry.status == QueueEntryStatus.WAITING
    ).count()

    now_serving = db.query(QueueEntry).filter(
        QueueEntry.queue_id == queue_id,
        QueueEntry.status.in_([QueueEntryStatus.SERVING, QueueEntryStatus.CALLED])
    ).first()

    active_counters = db.query(Counter).filter(
        Counter.location_id == queue.location_id,
        Counter.status == "open"
    ).count()
    if active_counters == 0:
        active_counters = 1

    avg_service_time = srv.average_service_time if srv else 10
    estimated_wait = int((waiting_count / active_counters) * avg_service_time)

    payload = {
        "event": event_type,
        "queue_id": queue_id,
        "now_serving": now_serving.token_number if now_serving else "None",
        "waiting_count": waiting_count,
        "estimated_wait_minutes": estimated_wait,
        "data": extra_data or {}
    }

    if queue_id > 0:
        await manager.broadcast_to_queue(queue_id, payload)
    else:
        await manager.broadcast_to_all(payload)

def notify_queue_event_sync(db: Session, queue_id: int, event_type: str, extra_data: dict = None):
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(notify_queue_event(db, queue_id, event_type, extra_data))
    except RuntimeError:
        asyncio.run(notify_queue_event(db, queue_id, event_type, extra_data))
