from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import math
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

aircraft_db = {
    "ACA101": {"id": "ACA101", "x": 300, "y": 300, "altitude": 35000, "speed": 450, "heading": 45},
    "UAL202": {"id": "UAL202", "x": 700, "y": 400, "altitude": 37000, "speed": 430, "heading": 225},
    "DAL303": {"id": "DAL303", "x": 500, "y": 600, "altitude": 33000, "speed": 460, "heading": 315},
    "SWA404": {"id": "SWA404", "x": 800, "y": 200, "altitude": 34000, "speed": 440, "heading": 135},
}

@app.get("/")
def root():
    return {"message": "ATC-DSS Backend Running!", "status": "online"}

@app.get("/api/aircraft")
def get_all_aircraft():
    return list(aircraft_db.values())

@app.get("/api/aircraft/{aircraft_id}")
def get_aircraft(aircraft_id: str):
    if aircraft_id in aircraft_db:
        return aircraft_db[aircraft_id]
    return {"error": "Aircraft not found"}

@app.post("/api/aircraft")
def add_aircraft(aircraft: dict):
    aircraft_db[aircraft["id"]] = aircraft
    return aircraft

@app.put("/api/aircraft/{aircraft_id}")
def update_aircraft(aircraft_id: str, updates: dict):
    if aircraft_id in aircraft_db:
        aircraft_db[aircraft_id].update(updates)
        return aircraft_db[aircraft_id]
    return {"error": "Aircraft not found"}

@app.delete("/api/aircraft/{aircraft_id}")
def delete_aircraft(aircraft_id: str):
    if aircraft_id in aircraft_db:
        del aircraft_db[aircraft_id]
        return {"message": f"Aircraft {aircraft_id} deleted"}
    return {"error": "Aircraft not found"}

@app.get("/api/conflicts")
def get_conflicts():
    conflicts = []
    aircraft_list = list(aircraft_db.values())
    
    for i in range(len(aircraft_list)):
        for j in range(i + 1, len(aircraft_list)):
            a1 = aircraft_list[i]
            a2 = aircraft_list[j]
            
            distance = math.sqrt((a1["x"] - a2["x"])**2 + (a1["y"] - a2["y"])**2)
            altitude_diff = abs(a1["altitude"] - a2["altitude"])
            
            if distance < 100:
                severity = "CRITICAL" if distance < 50 else "HIGH" if distance < 80 else "MEDIUM"
                conflicts.append({
                    "id": f"{a1['id']}-{a2['id']}",
                    "aircraft1": a1["id"],
                    "aircraft2": a2["id"],
                    "distance": round(distance, 2),
                    "severity": severity
                })
    
    return conflicts

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 ATC-DSS BACKEND RUNNING")
    print("=" * 50)
    print("📍 API: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("✈️ Aircraft in system: 4")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)