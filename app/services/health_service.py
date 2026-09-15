import os
from datetime import datetime
from app.schemas.health import HealthCheckResponse

def get_health_status() -> HealthCheckResponse:
    app_name = os.getenv("APP_NAME", "Smart Queue Management Backend")
    version = os.getenv("VERSION", "1.0.0")
    environment = os.getenv("ENVIRONMENT", "development")
    
    return HealthCheckResponse(
        status="ok",
        app_name=app_name,
        version=version,
        environment=environment,
        database_status="ready",
        timestamp=datetime.utcnow().isoformat() + "Z",
        cors_allowed=True
    )
