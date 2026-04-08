import math
from typing import List, Dict
from datetime import datetime
from ..models import Conflict, Suggestion

class ConflictService:
    def __init__(self):
        self.conflicts: Dict[str, Conflict] = {}
        self.suggestions: Dict[str, Suggestion] = {}
    
    def calculate_distance(self, x1: float, y1: float, x2: float, y2: float) -> float:
        return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)
    
    def detect_conflicts(self, aircraft_list) -> List[Conflict]:
        new_conflicts = []
        
        for i in range(len(aircraft_list)):
            for j in range(i + 1, len(aircraft_list)):
                a1 = aircraft_list[i]
                a2 = aircraft_list[j]
                
                distance = self.calculate_distance(a1.x, a1.y, a2.x, a2.y)
                altitude_diff = abs(a1.altitude - a2.altitude)
                
                if distance < 100 or altitude_diff < 2000:
                    if distance < 50:
                        severity = "CRITICAL"
                    elif distance < 80:
                        severity = "HIGH"
                    else:
                        severity = "MEDIUM"
                    
                    conflict_id = f"{a1.id}-{a2.id}"
                    
                    conflict = Conflict(
                        id=conflict_id,
                        aircraft1=a1.id,
                        aircraft2=a2.id,
                        distance=round(distance, 2),
                        altitude_diff=round(altitude_diff, 2),
                        severity=severity,
                        timestamp=datetime.now()
                    )
                    
                    new_conflicts.append(conflict)
                    self.conflicts[conflict_id] = conflict
        
        return new_conflicts
    
    def get_active_suggestions(self) -> List[Suggestion]:
        return list(self.suggestions.values())[:10]
