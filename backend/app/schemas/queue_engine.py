from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.enums import LocationType, QueueEntryStatus

class JoinQueueResponse(BaseModel):
    token: str = Field(..., example="A-104")
    position: int = Field(..., example=7)
    people_ahead: int = Field(..., example=6)
    estimated_wait_minutes: int = Field(..., example=18)
    confidence: float = Field(default=0.87, example=0.87)
    ai_powered: bool = Field(default=True, example=True)
    status: str = Field(..., example="WAITING")
    entry_id: Optional[int] = None
    queue_id: Optional[int] = None
    service_id: Optional[int] = None

class QueueDetailOut(BaseModel):
    id: int
    location_id: int
    service_id: int
    status: str
    current_token: int
    total_waiting: int
    active_counters: int
    estimated_wait_minutes: int
    confidence: float = 0.87
    ai_powered: bool = True

class QueueEntryResponse(BaseModel):
    id: int
    queue_id: int
    user_id: Optional[int] = None
    token_number: str
    position: int
    people_ahead: int
    status: QueueEntryStatus
    joined_at: datetime
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_wait_minutes: int
    confidence: float = 0.87
    ai_powered: bool = True

    class Config:
        from_attributes = True

