from typing import Dict, Any

class Config:
    # Radar Configuration
    RADAR_WIDTH: int = 1400
    RADAR_HEIGHT: int = 900
    RADAR_CENTER_X: int = 700
    RADAR_CENTER_Y: int = 450
    RADAR_RANGE: int = 400
    
    # Conflict Detection Thresholds
    DISTANCE_THRESHOLD: float = 100.0
    ALTITUDE_THRESHOLD: float = 2000.0
    CRITICAL_DISTANCE: float = 50.0
    HIGH_DISTANCE: float = 80.0
    
    # Simulation Settings
    UPDATE_INTERVAL: float = 0.1
    SIMULATION_SPEED: float = 1.0
    
    # CORS Settings
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    
    # WebSocket Settings
    WS_PING_INTERVAL: int = 20
    WS_PING_TIMEOUT: int = 30

config = Config()
