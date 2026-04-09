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
MAX_AIRCRAFT = 100  # Maximum aircraft limit from class diagram
CONFLICT_THRESHOLD = 100  # Default conflict threshold
SCAN_INTERVAL = 3  # Default scan interval in seconds

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
            resolved INTEGER DEFAULT 0,
            resolution_action TEXT,
            resolved_at TEXT,
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
            acknowledged INTEGER DEFAULT 0,
            acknowledged_by TEXT,
            acknowledged_at TEXT,
            timestamp TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS action_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            action_type TEXT,
            aircraft_id TEXT,
            controller TEXT,
            details TEXT,
            timestamp TEXT
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS waypoints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aircraft_id TEXT,
            sequence INTEGER,
            lat REAL,
            lon REAL,
            altitude REAL,
            heading REAL,
            FOREIGN KEY (aircraft_id) REFERENCES aircraft(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def initialize_aircraft(count=20):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if already have aircraft
    cursor.execute("SELECT COUNT(*) FROM aircraft")
    existing_count = cursor.fetchone()[0]
    
    if existing_count == 0:
        airlines = ['ACA', 'UAL', 'DAL', 'SWA', 'AAL', 'BAW', 'AFR', 'DLH', 'JAL', 'QTR']
        aircraft_types = ['A320', 'B737', 'A380', 'B787', 'A330', 'B777']
        cities = ['JFK', 'LAX', 'LHR', 'CDG', 'DXB', 'HND', 'PEK', 'SYD', 'FRA', 'AMS']
        
        for i in range(1, count + 1):
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
        print(f"✅ Added {count} aircraft to database")
    
    conn.close()

# ============ NEW FUNCTIONS FROM CLASS DIAGRAM ============

def scan_all():
    """Scan all aircraft for conflicts - from class diagram"""
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
            
            if distance < CONFLICT_THRESHOLD:
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
                
                # Save to conflicts table with resolution tracking
                conn2 = get_db()
                cursor2 = conn2.cursor()
                cursor2.execute('''
                    INSERT INTO conflicts (aircraft1_id, aircraft2_id, distance, severity, resolved, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (a1['id'], a2['id'], distance, severity, 0, datetime.now().isoformat()))
                conn2.commit()
                conn2.close()
    
    return conflicts

def predict_trajectory(aircraft_id, seconds=30):
    """Predict aircraft trajectory - from class diagram"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM aircraft WHERE id = ?", (aircraft_id,))
    aircraft = cursor.fetchone()
    conn.close()
    
    if not aircraft:
        return None
    
    aircraft = dict(aircraft)
    predictions = []
    steps = seconds // 2
    
    for i in range(1, steps + 1):
        time = i * 2
        predicted_x = aircraft['x'] + (aircraft['speed'] / 3600) * time * math.cos(aircraft['heading'] * math.pi / 180)
        predicted_y = aircraft['y'] + (aircraft['speed'] / 3600) * time * math.sin(aircraft['heading'] * math.pi / 180)
        
        predictions.append({
            'time': time,
            'x': round(predicted_x, 2),
            'y': round(predicted_y, 2),
            'altitude': aircraft['altitude']
        })
    
    return predictions

def validate_route(waypoints):
    """Validate a route with waypoints - from class diagram"""
    issues = []
    
    if not waypoints or len(waypoints) < 2:
        issues.append('Route must have at least 2 waypoints')
        return {'isValid': False, 'issues': issues}
    
    for i in range(len(waypoints) - 1):
        current = waypoints[i]
        next_wp = waypoints[i + 1]
        
        # Check turn angles
        if 'heading' in current and 'heading' in next_wp:
            turn_angle = abs(next_wp['heading'] - current['heading'])
            if turn_angle > 90 and turn_angle < 270:
                actual_turn = turn_angle if turn_angle <= 180 else 360 - turn_angle
                if actual_turn > 90:
                    issues.append(f"Sharp turn of {actual_turn}° between waypoint {i + 1} and {i + 2}")
        
        # Check altitude changes
        if 'altitude' in current and 'altitude' in next_wp:
            altitude_change = abs(next_wp['altitude'] - current['altitude'])
            if altitude_change > 5000:
                issues.append(f"Extreme altitude change of {altitude_change}ft between waypoints")
    
    return {
        'isValid': len(issues) == 0,
        'issues': issues
    }

def get_route(aircraft_id):
    """Get formatted route for an aircraft - from class diagram"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM waypoints WHERE aircraft_id = ? ORDER BY sequence", (aircraft_id,))
    waypoints = cursor.fetchall()
    conn.close()
    
    return [dict(wp) for wp in waypoints]

def acknowledge_alert(alert_id, controller_name):
    """Acknowledge an alert - from class diagram"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE alerts 
        SET acknowledged = 1, acknowledged_by = ?, acknowledged_at = ?
        WHERE id = ?
    ''', (controller_name, datetime.now().isoformat(), alert_id))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

def log_action(action_type, aircraft_id, controller, details):
    """Log any action taken by controller"""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO action_logs (action_type, aircraft_id, controller, details, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', (action_type, aircraft_id, controller, details, datetime.now().isoformat()))
    conn.commit()
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
    
    # Check max aircraft limit
    cursor.execute("SELECT COUNT(*) FROM aircraft")
    count = cursor.fetchone()[0]
    
    if count >= MAX_AIRCRAFT:
        conn.close()
        return jsonify({'error': f'Maximum aircraft limit ({MAX_AIRCRAFT}) reached'}), 400
    
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
    
    # Log the action
    log_action('ADD', data['id'], request.headers.get('X-Controller', 'SYSTEM'), f"Aircraft {data['id']} added")
    
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
    
    # Log the action
    log_action('UPDATE', aircraft_id, request.headers.get('X-Controller', 'SYSTEM'), f"Aircraft {aircraft_id} updated")
    
    conn.close()
    return jsonify({'message': 'Aircraft updated'})

@app.route('/api/aircraft/<aircraft_id>', methods=['DELETE'])
def delete_aircraft(aircraft_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM aircraft WHERE id = ?", (aircraft_id,))
    conn.commit()
    
    # Log the action
    log_action('DELETE', aircraft_id, request.headers.get('X-Controller', 'SYSTEM'), f"Aircraft {aircraft_id} removed")
    
    conn.close()
    
    return jsonify({'message': f'Aircraft {aircraft_id} removed'})

@app.route('/api/conflicts', methods=['GET'])
def detect_conflicts():
    conflicts = scan_all()
    return jsonify(conflicts)

@app.route('/api/conflicts/resolve', methods=['POST'])
def resolve_conflict():
    data = request.json
    conflict_id = data.get('conflict_id')
    resolution_action = data.get('resolution_action')
    controller = data.get('controller', 'SYSTEM')
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE conflicts 
        SET resolved = 1, resolution_action = ?, resolved_at = ?
        WHERE id = ?
    ''', (resolution_action, datetime.now().isoformat(), conflict_id))
    conn.commit()
    conn.close()
    
    log_action('RESOLVE', None, controller, f"Conflict {conflict_id} resolved with action: {resolution_action}")
    
    return jsonify({'message': 'Conflict resolved'})

@app.route('/api/predict/<aircraft_id>', methods=['GET'])
def get_prediction(aircraft_id):
    seconds = request.args.get('seconds', 30, type=int)
    predictions = predict_trajectory(aircraft_id, seconds)
    if predictions:
        return jsonify(predictions)
    return jsonify({'error': 'Aircraft not found'}), 404

@app.route('/api/route/validate', methods=['POST'])
def validate_route_endpoint():
    waypoints = request.json.get('waypoints', [])
    result = validate_route(waypoints)
    return jsonify(result)

@app.route('/api/route/<aircraft_id>', methods=['GET'])
def get_aircraft_route(aircraft_id):
    route = get_route(aircraft_id)
    return jsonify(route)

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE acknowledged = 0 ORDER BY timestamp DESC")
    alerts = cursor.fetchall()
    conn.close()
    return jsonify([dict(a) for a in alerts])

@app.route('/api/alerts/<alert_id>/acknowledge', methods=['POST'])
def acknowledge_alert_endpoint(alert_id):
    data = request.json
    controller = data.get('controller', 'SYSTEM')
    result = acknowledge_alert(alert_id, controller)
    if result:
        log_action('ACKNOWLEDGE', None, controller, f"Alert {alert_id} acknowledged")
        return jsonify({'message': 'Alert acknowledged'})
    return jsonify({'error': 'Alert not found'}), 404

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
    
    cursor.execute("SELECT COUNT(*) FROM conflicts WHERE resolved = 0")
    active_conflicts = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM conflicts")
    total_conflicts = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM action_logs")
    total_actions = cursor.fetchone()[0]
    
    conn.close()
    
    return jsonify({
        'total_aircraft': total,
        'active_aircraft': active,
        'emergency_aircraft': emergency,
        'active_conflicts': active_conflicts,
        'total_conflicts': total_conflicts,
        'total_actions': total_actions,
        'max_aircraft': MAX_AIRCRAFT,
        'conflict_threshold': CONFLICT_THRESHOLD,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/logs', methods=['GET'])
def get_action_logs():
    limit = request.args.get('limit', 100, type=int)
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM action_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
    logs = cursor.fetchall()
    conn.close()
    return jsonify([dict(log) for log in logs])

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy', 
        'service': 'ATC-DSS Backend',
        'max_aircraft': MAX_AIRCRAFT,
        'conflict_threshold': CONFLICT_THRESHOLD
    })

@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify({
        'max_aircraft': MAX_AIRCRAFT,
        'conflict_threshold': CONFLICT_THRESHOLD,
        'scan_interval': SCAN_INTERVAL
    })

# ============ INITIALIZE AND RUN ============

if __name__ == '__main__':
    init_db()
    initialize_aircraft(20)  # Initialize with 20 aircraft
    
    print("=" * 50)
    print("🚀 ATC-DSS BACKEND WITH SQLITE")
    print("=" * 50)
    print(f"📍 API: http://localhost:5000")
    print(f"✈️  Max Aircraft: {MAX_AIRCRAFT}")
    print(f"⚠️  Conflict Threshold: {CONFLICT_THRESHOLD}")
    print(f"📊 Endpoints:")
    print(f"   GET  /api/aircraft")
    print(f"   POST /api/aircraft")
    print(f"   PUT  /api/aircraft/<id>")
    print(f"   DELETE /api/aircraft/<id>")
    print(f"   GET  /api/conflicts")
    print(f"   POST /api/conflicts/resolve")
    print(f"   GET  /api/predict/<id>")
    print(f"   POST /api/route/validate")
    print(f"   GET  /api/alerts")
    print(f"   POST /api/alerts/<id>/acknowledge")
    print(f"   GET  /api/logs")
    print(f"   GET  /api/stats/dashboard")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)