import sqlite3
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
import math
import json

app = Flask(__name__)
CORS(app)

DATABASE = 'atc_dss.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS aircraft (
            id TEXT PRIMARY KEY,
            airline TEXT,
            flight_number TEXT,
            aircraft_type TEXT,
            x REAL,
            y REAL,
            altitude REAL,
            speed REAL,
            heading REAL,
            status TEXT,
            priority INTEGER,
            origin TEXT,
            destination TEXT,
            fuel_remaining REAL,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS conflicts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aircraft1_id TEXT,
            aircraft2_id TEXT,
            distance REAL,
            severity TEXT,
            timestamp TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_type TEXT,
            severity TEXT,
            aircraft_id TEXT,
            message TEXT,
            acknowledged INTEGER,
            timestamp TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def initialize_20_aircraft():
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if already have aircraft
    cursor.execute("SELECT COUNT(*) FROM aircraft")
    count = cursor.fetchone()[0]
    
    if count == 0:
        airlines = ['ACA', 'UAL', 'DAL', 'SWA', 'AAL', 'BAW', 'AFR', 'DLH', 'JAL', 'QTR']
        aircraft_types = ['A320', 'B737', 'A380', 'B787', 'A330', 'B777']
        cities = ['JFK', 'LAX', 'LHR', 'CDG', 'DXB', 'HND', 'PEK', 'SYD', 'FRA', 'AMS']
        
        for i in range(1, 21):
            airline = random.choice(airlines)
            flight_num = random.randint(100, 999)
            aircraft_id = f"{airline}{flight_num:03d}"
            
            cursor.execute('''
                INSERT INTO aircraft VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                aircraft_id,
                airline,
                str(flight_num),
                random.choice(aircraft_types),
                random.uniform(100, 1100),
                random.uniform(100, 800),
                random.uniform(25000, 41000),
                random.uniform(350, 550),
                random.uniform(0, 360),
                random.choices(['ACTIVE', 'ACTIVE', 'ACTIVE', 'EMERGENCY'], weights=[0.85, 0.85, 0.85, 0.15])[0],
                random.choices([1, 2, 3], weights=[0.85, 0.1, 0.05])[0],
                random.choice(cities),
                random.choice(cities),
                random.uniform(2000, 8000),
                datetime.now().isoformat(),
                datetime.now().isoformat()
            ))
        
        conn.commit()
        print(f"✅ Added 20 aircraft to database")
    
    conn.close()

# ============ API ENDPOINTS ============

@app.route('/api/aircraft', methods=['GET'])
def get_all_aircraft():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM aircraft")
    aircraft = cursor.fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in aircraft])

@app.route('/api/aircraft/<aircraft_id>', methods=['GET'])
def get_aircraft(aircraft_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM aircraft WHERE id = ?", (aircraft_id,))
    aircraft = cursor.fetchone()
    conn.close()
    
    if aircraft:
        return jsonify(dict(aircraft))
    return jsonify({'error': 'Aircraft not found'}), 404

@app.route('/api/aircraft', methods=['POST'])
def add_aircraft():
    data = request.json
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if exists
    cursor.execute("SELECT id FROM aircraft WHERE id = ?", (data['id'],))
    if cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Aircraft ID already exists'}), 400
    
    cursor.execute('''
        INSERT INTO aircraft VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data['id'],
        data.get('airline', 'UNK'),
        data.get('flight_number', '000'),
        data.get('aircraft_type', 'A320'),
        data.get('x', random.uniform(100, 1100)),
        data.get('y', random.uniform(100, 800)),
        data.get('altitude', 35000),
        data.get('speed', 450),
        data.get('heading', random.uniform(0, 360)),
        data.get('status', 'ACTIVE'),
        data.get('priority', 1),
        data.get('origin', 'UNK'),
        data.get('destination', 'UNK'),
        data.get('fuel_remaining', 5000),
        datetime.now().isoformat(),
        datetime.now().isoformat()
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify(data), 201

@app.route('/api/aircraft/<aircraft_id>', methods=['PUT'])
def update_aircraft(aircraft_id):
    data = request.json
    
    conn = get_db()
    cursor = conn.cursor()
    
    # Build update query
    updates = []
    values = []
    for key, value in data.items():
        updates.append(f"{key} = ?")
        values.append(value)
    
    values.append(aircraft_id)
    query = f"UPDATE aircraft SET {', '.join(updates)}, updated_at = ? WHERE id = ?"
    values.append(datetime.now().isoformat())
    values.append(aircraft_id)
    
    cursor.execute(query, values)
    conn.commit()
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'error': 'Aircraft not found'}), 404
    
    conn.close()
    return jsonify({'message': 'Aircraft updated'})

@app.route('/api/aircraft/<aircraft_id>', methods=['DELETE'])
def delete_aircraft(aircraft_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM aircraft WHERE id = ?", (aircraft_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': f'Aircraft {aircraft_id} removed'})

@app.route('/api/conflicts', methods=['GET'])
def detect_conflicts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM aircraft WHERE status = 'ACTIVE'")
    aircraft = cursor.fetchall()
    conn.close()
    
    conflicts = []
    aircraft_list = [dict(a) for a in aircraft]
    
    for i in range(len(aircraft_list)):
        for j in range(i + 1, len(aircraft_list)):
            a1 = aircraft_list[i]
            a2 = aircraft_list[j]
            
            distance = math.sqrt((a1['x'] - a2['x'])**2 + (a1['y'] - a2['y'])**2)
            
            if distance < 100:
                if distance < 50:
                    severity = "CRITICAL"
                elif distance < 80:
                    severity = "HIGH"
                else:
                    severity = "MEDIUM"
                
                conflicts.append({
                    'aircraft1': a1['id'],
                    'aircraft2': a2['id'],
                    'distance': round(distance, 2),
                    'severity': severity
                })
                
                # Save to conflicts table
                conn2 = get_db()
                cursor2 = conn2.cursor()
                cursor2.execute('''
                    INSERT INTO conflicts (aircraft1_id, aircraft2_id, distance, severity, timestamp)
                    VALUES (?, ?, ?, ?, ?)
                ''', (a1['id'], a2['id'], distance, severity, datetime.now().isoformat()))
                conn2.commit()
                conn2.close()
    
    return jsonify(conflicts)

@app.route('/api/stats/dashboard', methods=['GET'])
def get_dashboard_stats():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM aircraft")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM aircraft WHERE status = 'ACTIVE'")
    active = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM aircraft WHERE status = 'EMERGENCY'")
    emergency = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM conflicts")
    conflicts = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'total_aircraft': total,
        'active_aircraft': active,
        'emergency_aircraft': emergency,
        'total_conflicts': conflicts,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'ATC-DSS Backend'})

# ============ INITIALIZE AND RUN ============

if __name__ == '__main__':
    init_db()
    initialize_20_aircraft()
    
    print("=" * 50)
    print("🚀 ATC-DSS BACKEND WITH SQLITE")
    print("=" * 50)
    print(f"📍 API: http://localhost:5000")
    print(f"📊 Endpoints:")
    print(f"   GET  /api/aircraft")
    print(f"   POST /api/aircraft")
    print(f"   PUT  /api/aircraft/<id>")
    print(f"   DELETE /api/aircraft/<id>")
    print(f"   GET  /api/conflicts")
    print(f"   GET  /api/stats/dashboard")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
