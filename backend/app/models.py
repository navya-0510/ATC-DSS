from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Aircraft(BaseModel):
    id: str
    x: float = Field(..., ge=0, le=1400)
    y: float = Field(..., ge=0, le=900)
    altitude: float = Field(..., ge=0, le=50000)
    speed: float = Field(..., ge=0, le=1000)
    heading: float = Field(..., ge=0, le=360)
    updated_at: Optional[datetime] = None

class AircraftCreate(BaseModel):
    id: str
    x: float = 600
    y: float = 400
    altitude: float = 35000
    speed: float = 450
    heading: float = 0

class AircraftUpdate(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    altitude: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None

class Conflict(BaseModel):
    id: str
    aircraft1: str
    aircraft2: str
    distance: float
    altitude_diff: float
    severity: str
    timestamp: datetime

class Suggestion(BaseModel):
    id: str
    type: str
    aircraft: str
    action: str
    priority: int
    deviation: float
    reasoning: str

class Alert(BaseModel):
    id: str
    severity: str
    aircraft: List[str]
    message: str
    timestamp: datetime

class LogEntry(BaseModel):
    id: str
    type: str
    message: str
    timestamp: str
