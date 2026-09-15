from pydantic import BaseModel, Field

class HealthCheckResponse(BaseModel):
    status: str = Field(..., example="ok")
    app_name: str = Field(..., example="Smart Queue Management Backend")
    version: str = Field(..., example="1.0.0")
    environment: str = Field(..., example="development")
    database_status: str = Field(..., example="connected")
    timestamp: str = Field(...)
    cors_allowed: bool = Field(default=True)
