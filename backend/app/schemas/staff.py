from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.enums import QueueEntryStatus

class StaffDashboardSummary(BaseModel):
    active_queues_count: int = 0
    waiting_customers_count: int = 0
    currently_serving_count: int = 0
    completed_today_count: int = 0
    average_wait_time: int = 0
    active_counters_count: int = 0

class NextCustomerOut(BaseModel):
    id: int
    token_number: str
    user_name: str
    joined_at: datetime
    estimated_wait_minutes: int
    position: int

class StaffQueueOut(BaseModel):
    id: int
    location_id: int
    location_name: str
    service_id: int
    service_name: str
    status: str
    current_token: int
    now_serving_id: Optional[int] = None
    now_serving_token: Optional[str] = None
    now_serving_user: Optional[str] = None
    now_serving_counter: Optional[str] = None
    now_serving_status: Optional[str] = None
    waiting_count: int = 0
    next_customers: List[NextCustomerOut] = []

class StaffActionResponse(BaseModel):
    message: str
    queue_entry_id: int
    token_number: str
    status: QueueEntryStatus
    counter_name: Optional[str] = None
