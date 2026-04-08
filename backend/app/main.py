from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import aircraft, websocket
from app.config import config

app = FastAPI(
    title="ATC Decision Support System API",
    description="Backend API for ATC-DSS with real-time aircraft tracking and conflict detection",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(aircraft.router)
app.include_router(websocket.router)

@app.get("/")
async def root():
    return {
        "message": "ATC-DSS Backend API",
        "version": "1.0.0",
        "endpoints": {
            "aircraft": "/api/aircraft",
            "websocket": "ws://localhost:8000/ws"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ATC-DSS Backend"}

@app.on_event("startup")
async def startup_event():
    print("🚀 ATC-DSS Backend Started")
    print(f"📍 CORS Origins: {config.CORS_ORIGINS}")
    print(f"🔌 WebSocket endpoint: ws://localhost:8000/ws")
    print(f"📡 API endpoint: http://localhost:8000/api")

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 ATC-DSS Backend Shutting Down")
