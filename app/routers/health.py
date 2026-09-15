from fastapi import APIRouter
from app.schemas.health import HealthCheckResponse
from app.services.health_service import get_health_status

router = APIRouter(prefix="/health", tags=["Health"])

@router.get("", response_model=HealthCheckResponse)
def check_health():
    return get_health_status()
