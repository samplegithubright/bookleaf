import json
import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger("bookleaf.ws")

class WebSocketManager:
    def __init__(self):
        # ticket_id -> list of active WebSockets
        self.ticket_connections: Dict[str, List[WebSocket]] = {}
        # author_id -> list of active WebSockets
        self.author_connections: Dict[str, List[WebSocket]] = {}
        # Admin queue WebSockets
        self.admin_connections: List[WebSocket] = []

    async def connect_ticket(self, ticket_id: str, websocket: WebSocket):
        await websocket.accept()
        if ticket_id not in self.ticket_connections:
            self.ticket_connections[ticket_id] = []
        self.ticket_connections[ticket_id].append(websocket)
        logger.info(f"WebSocket connected for ticket {ticket_id}")

    def disconnect_ticket(self, ticket_id: str, websocket: WebSocket):
        if ticket_id in self.ticket_connections:
            if websocket in self.ticket_connections[ticket_id]:
                self.ticket_connections[ticket_id].remove(websocket)
            if not self.ticket_connections[ticket_id]:
                del self.ticket_connections[ticket_id]
        logger.info(f"WebSocket disconnected for ticket {ticket_id}")

    async def connect_author(self, author_id: str, websocket: WebSocket):
        await websocket.accept()
        if author_id not in self.author_connections:
            self.author_connections[author_id] = []
        self.author_connections[author_id].append(websocket)
        logger.info(f"WebSocket connected for author {author_id}")

    def disconnect_author(self, author_id: str, websocket: WebSocket):
        if author_id in self.author_connections:
            if websocket in self.author_connections[author_id]:
                self.author_connections[author_id].remove(websocket)
            if not self.author_connections[author_id]:
                del self.author_connections[author_id]

    async def connect_admin(self, websocket: WebSocket):
        await websocket.accept()
        self.admin_connections.append(websocket)
        logger.info("Admin WebSocket connected")

    def disconnect_admin(self, websocket: WebSocket):
        if websocket in self.admin_connections:
            self.admin_connections.remove(websocket)

    async def broadcast_to_ticket(self, ticket_id: str, data: dict):
        """Sends real-time event to everyone currently viewing this ticket"""
        if ticket_id in self.ticket_connections:
            for ws in list(self.ticket_connections[ticket_id]):
                try:
                    await ws.send_text(json.dumps(data, default=str))
                except Exception as e:
                    logger.warning(f"Error sending to ticket ws: {e}")

    async def broadcast_to_author(self, author_id: str, data: dict):
        """Sends real-time event to author dashboard / ticket list"""
        if author_id in self.author_connections:
            for ws in list(self.author_connections[author_id]):
                try:
                    await ws.send_text(json.dumps(data, default=str))
                except Exception as e:
                    logger.warning(f"Error sending to author ws: {e}")

    async def broadcast_to_admin(self, data: dict):
        """Sends real-time event to admin queue dashboard"""
        for ws in list(self.admin_connections):
            try:
                await ws.send_text(json.dumps(data, default=str))
            except Exception as e:
                logger.warning(f"Error sending to admin ws: {e}")

ws_manager = WebSocketManager()
