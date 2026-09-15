from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.enums import LocationType, QueueEntryStatus

class ServiceOut(BaseModel):
    id: int
    location_id: int
    name: str
    description: Optional[str] = None
    average_service_time: int
    status: str
    people_in_queue: int = 0
    active_counters: int = 0
    estimated_wait_minutes: int = 0
    confidence: float = 0.87
    ai_powered: bool = True

    class Config:
        from_attributes = True

class LocationOut(BaseModel):
    id: int
    organization_id: Optional[int] = None
    organization_name: Optional[str] = None
    name: str
    type: LocationType
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    is_open: bool = True
    total_queue_size: int = 0
    estimated_wait_minutes: int = 0
    services_count: int = 0
    services: List[ServiceOut] = []

    class Config:
        from_attributes = True

class JoinQueueRequest(BaseModel):
    location_id: int = Field(..., example=1)
    service_id: int = Field(..., example=1)

class QueueEntryOut(BaseModel):
    id: int
    queue_id: int
    user_id: Optional[int] = None
    location_id: int
    location_name: str
    service_id: int
    service_name: str
    token_number: str
    position: int
    people_ahead: int
    now_serving_token: Optional[str] = None
    status: QueueEntryStatus
    joined_at: datetime
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_wait: int
    confidence: float = 0.87
    ai_powered: bool = True
    timeline_stage: int = 1  # 1: Joined, 2: Token Gen, 3: Tracking, 4: Approaching, 5: Your Turn, 6: Completed


    class Config:
        from_attributes = True

class NotificationOut(BaseModel):
    id: int
    user_id: int
    queue_entry_id: Optional[int] = None
    message: str
    type: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
