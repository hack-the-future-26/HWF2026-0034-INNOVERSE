from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.enums import LocationType, UserRole

# Admin Analytics Schemas
class AdminOverviewOut(BaseModel):
    total_locations: int
    total_services: int
    total_staff: int
    total_customers_served: int
    average_wait_time_minutes: float
    cancellation_rate: float
    no_show_rate: float
    counter_utilization_rate: float

class QueueVolumeHourOut(BaseModel):
    hour: str  # e.g., "08:00"
    volume: int
    completed: int
    cancelled: int

class WaitTimesAnalysisOut(BaseModel):
    service_id: int
    service_name: str
    location_name: str
    avg_wait_minutes: float
    target_wait_minutes: float

class PeakHoursOut(BaseModel):
    hour: str
    people_count: int
    peak_factor: float
    busy_level: str  # "Normal", "Moderate", "Peak", "High Demand"

class MetricsSummaryOut(BaseModel):
    cancellation_rate_percent: float
    no_show_rate_percent: float
    counter_utilization_percent: float
    total_entries_analyzed: int
    avg_service_duration_minutes: float

# Organization Schemas
class OrganizationOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class OrganizationCreate(BaseModel):
    name: str = Field(..., example="Metro Health System")
    code: str = Field(..., example="ORG-HEALTH")
    description: Optional[str] = Field(default=None, example="Healthcare network")

# CRUD Schemas
class LocationCreateUpdate(BaseModel):
    name: str = Field(..., example="Northside Clinic")
    type: LocationType = Field(..., example=LocationType.HOSPITAL)
    address: str = Field(..., example="456 Healthcare Way")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str = Field(default="active", example="active")
    organization_id: Optional[int] = None

class ServiceCreateUpdate(BaseModel):
    location_id: int
    name: str = Field(..., example="General Consultation")
    description: Optional[str] = None
    average_service_time: int = Field(default=10, example=15)
    status: str = Field(default="active", example="active")

class StaffCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole = UserRole.STAFF
    organization_id: Optional[int] = None

class CounterCreateUpdate(BaseModel):
    location_id: int
    name: str
    staff_id: Optional[int] = None
    status: str = "open"

class CounterOut(BaseModel):
    id: int
    location_id: int
    location_name: Optional[str] = None
    name: str
    staff_id: Optional[int] = None
    staff_name: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
