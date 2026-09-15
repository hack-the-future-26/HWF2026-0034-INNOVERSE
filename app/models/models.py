from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database.database import Base
from app.models.enums import UserRole, LocationType, QueueEntryStatus

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="organization")
    locations = relationship("Location", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="users")
    counters = relationship("Counter", back_populates="staff_user")
    queue_entries = relationship("QueueEntry", back_populates="user")
    notifications = relationship("Notification", back_populates="user")


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    type = Column(SQLEnum(LocationType), nullable=False)
    address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="locations")
    services = relationship("Service", back_populates="location", cascade="all, delete-orphan")
    queues = relationship("Queue", back_populates="location", cascade="all, delete-orphan")
    counters = relationship("Counter", back_populates="location", cascade="all, delete-orphan")
    histories = relationship("QueueHistory", back_populates="location", cascade="all, delete-orphan")


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    average_service_time = Column(Integer, default=10, nullable=False)  # in minutes
    status = Column(String(50), default="active", nullable=False)

    # Relationships
    location = relationship("Location", back_populates="services")
    queues = relationship("Queue", back_populates="service", cascade="all, delete-orphan")
    histories = relationship("QueueHistory", back_populates="service", cascade="all, delete-orphan")


class Queue(Base):
    __tablename__ = "queues"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="active", nullable=False)
    current_token = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    location = relationship("Location", back_populates="queues")
    service = relationship("Service", back_populates="queues")
    entries = relationship("QueueEntry", back_populates="queue", cascade="all, delete-orphan")


class QueueEntry(Base):
    __tablename__ = "queue_entries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    queue_id = Column(Integer, ForeignKey("queues.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    token_number = Column(String(50), nullable=False)
    position = Column(Integer, nullable=False)
    status = Column(SQLEnum(QueueEntryStatus), default=QueueEntryStatus.WAITING, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    estimated_wait = Column(Integer, default=0, nullable=False)  # in minutes

    # Relationships
    queue = relationship("Queue", back_populates="entries")
    user = relationship("User", back_populates="queue_entries")
    notifications = relationship("Notification", back_populates="queue_entry", cascade="all, delete-orphan")


class Counter(Base):
    __tablename__ = "counters"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    staff_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="open", nullable=False)

    # Relationships
    location = relationship("Location", back_populates="counters")
    staff_user = relationship("User", back_populates="counters")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    queue_entry_id = Column(Integer, ForeignKey("queue_entries.id", ondelete="CASCADE"), nullable=True)
    message = Column(String(500), nullable=False)
    type = Column(String(50), default="info", nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
    queue_entry = relationship("QueueEntry", back_populates="notifications")


class QueueHistory(Base):
    __tablename__ = "queue_histories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    hour = Column(Integer, nullable=False)  # 0 to 23
    day_of_week = Column(Integer, nullable=False)  # 0 (Mon) to 6 (Sun)
    people_count = Column(Integer, nullable=False)
    active_counters = Column(Integer, nullable=False)
    average_service_time = Column(Float, nullable=False)  # in minutes
    actual_wait_time = Column(Float, nullable=False)     # in minutes
    cancellations = Column(Integer, default=0, nullable=False)
    no_shows = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    location = relationship("Location", back_populates="histories")
    service = relationship("Service", back_populates="histories")
