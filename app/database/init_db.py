import logging
from app.database.database import engine, Base
from app.models import (
    User, Location, Service, Queue, QueueEntry, Counter, Notification, QueueHistory
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("All database tables created successfully!")

if __name__ == "__main__":
    init_db()
