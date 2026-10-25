import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ws_manager

logger = logging.getLogger("bookleaf.ws_router")
router = APIRouter(prefix="/ws", tags=["Real-time WebSockets"])

@router.websocket("/ticket/{ticket_id}")
async def websocket_ticket_endpoint(websocket: WebSocket, ticket_id: str):
    await ws_manager.connect_ticket(ticket_id, websocket)
    try:
        while True:
            # Keep alive and receive any client pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect_ticket(ticket_id, websocket)
    except Exception as e:
        logger.warning(f"Ticket websocket error: {e}")
        ws_manager.disconnect_ticket(ticket_id, websocket)

@router.websocket("/author/{author_id}")
async def websocket_author_endpoint(websocket: WebSocket, author_id: str):
    await ws_manager.connect_author(author_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect_author(author_id, websocket)
    except Exception as e:
        logger.warning(f"Author websocket error: {e}")
        ws_manager.disconnect_author(author_id, websocket)

@router.websocket("/admin")
async def websocket_admin_endpoint(websocket: WebSocket):
    await ws_manager.connect_admin(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect_admin(websocket)
    except Exception as e:
        logger.warning(f"Admin websocket error: {e}")
        ws_manager.disconnect_admin(websocket)
