from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..services.websocket_manager import ws_manager
from ..services.aircraft_service import AircraftService
from ..services.conflict_service import ConflictService
import asyncio

router = APIRouter(tags=["websocket"])
aircraft_service = AircraftService()
conflict_service = ConflictService()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    
    try:
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=1.0)
                print(f"Received: {data}")
            except asyncio.TimeoutError:
                aircraft_list = aircraft_service.get_all_aircraft()
                conflicts = conflict_service.detect_conflicts(aircraft_list)
                
                await websocket.send_json({
                    "type": "radar_update",
                    "aircraft": [{"id": ac.id, "x": ac.x, "y": ac.y, "altitude": ac.altitude, "speed": ac.speed, "heading": ac.heading} for ac in aircraft_list],
                    "conflicts": [{"id": c.id, "aircraft1": c.aircraft1, "aircraft2": c.aircraft2, "distance": c.distance, "severity": c.severity} for c in conflicts],
                })
                
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
