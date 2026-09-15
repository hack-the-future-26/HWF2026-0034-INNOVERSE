from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from app.middleware.cors import configure_cors
from app.routers.health import router as health_router
from app.websocket.manager import manager
from app.services.health_service import get_health_status

app = FastAPI(
    title="Smart Queue Management API",
    description="Backend microservice providing queue orchestration, JWT authentication, and real-time WebSockets.",
    version="1.0.0"
)

# Apply CORS configuration
configure_cors(app)

from app.routers.auth import router as auth_router
from app.routers.locations import router as locations_router
from app.routers.customer_queue import router as customer_queue_router
from app.routers.queue_engine_router import router as queue_engine_router
from app.routers.staff import router as staff_router
from app.routers.notifications import router as notifications_router
from app.routers.admin import router as admin_router

# Include API Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api")
app.include_router(locations_router, prefix="/api")
app.include_router(locations_router, prefix="/api/v1")
app.include_router(customer_queue_router, prefix="/api")
app.include_router(customer_queue_router, prefix="/api/v1")
app.include_router(queue_engine_router, prefix="/api")
app.include_router(queue_engine_router, prefix="/api/v1")
app.include_router(staff_router, prefix="/api")
app.include_router(staff_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api")
app.include_router(admin_router, prefix="/api/v1")



@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Queue Management API",
        "docs_url": "/docs",
        "health_check": "/api/v1/health"
    }

@app.get("/api/v1/health")
def api_v1_health():
    return get_health_status()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"Echo response: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.websocket("/ws/queue/{queue_id}")
async def websocket_queue_endpoint(websocket: WebSocket, queue_id: int):
    await manager.connect(websocket, queue_id=queue_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, queue_id=queue_id)
