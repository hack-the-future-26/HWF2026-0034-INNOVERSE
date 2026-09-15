import json
from typing import List, Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        # Queue specific rooms: queue_id -> List[WebSocket]
        self.queue_rooms: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, queue_id: int = 0):
        await websocket.accept()
        self.active_connections.append(websocket)

        if queue_id > 0:
            if queue_id not in self.queue_rooms:
                self.queue_rooms[queue_id] = []
            self.queue_rooms[queue_id].append(websocket)

    def disconnect(self, websocket: WebSocket, queue_id: int = 0):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

        if queue_id in self.queue_rooms and websocket in self.queue_rooms[queue_id]:
            self.queue_rooms[queue_id].remove(websocket)
            if not self.queue_rooms[queue_id]:
                del self.queue_rooms[queue_id]

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_to_queue(self, queue_id: int, event_data: dict):
        message_str = json.dumps(event_data)
        if queue_id in self.queue_rooms:
            for connection in list(self.queue_rooms[queue_id]):
                try:
                    await connection.send_text(message_str)
                except Exception:
                    self.disconnect(connection, queue_id)

    async def broadcast_to_all(self, event_data: dict):
        message_str = json.dumps(event_data)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message_str)
            except Exception:
                pass

manager = ConnectionManager()
