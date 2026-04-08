from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import random
import math

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///atc_dss_20planes.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Aircraft(db.Model):
    __tablename__ = 'aircraft'
    id = db.Column(db.String(10), primary_key=True)
    airline = db.Column(db.String(50))
    flight_number = db.Column(db.String(10))
    aircraft_type = db.Column(db.String(20))
    x = db.Column(db.Float, default=300)
    y = db.Column(db.Float, default=300)
    altitude = db.Column(db.Float, default=35000)
    speed = db.Column(db.Float, default=450)
    heading = db.Column(db.Float, default=0)
    status = db.Column(db.String(20), default='ACTIVE')
    priority = db.Column(db.Integer, default=1)
    origin = db.Column(db.String(10))
    destination = db.Column(db.String(10))
    fuel_remaining = db.Column(db.Float, default=5000)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    def to_dict(self):
        return {
            'id': self.id,
            'airline': self.airline,
            'flight_number': self.flight_number,
            'aircraft_type': self.aircraft_type,
            'x': self.x,
            'y': self.y,
            'altitude': self.altitude,
            'speed': self.speed,
            'heading': self.heading,
            'status': self.status,
            'priority': self.priority,
            'origin': self.origin,
            'destination': self.destination,
            'fuel_remaining': self.fuel_remaining
        }

def initialize_20_aircraft():
    airlines = ['ACA', 'UAL', 'DAL', 'SWA', 'AAL', 'BAW', 'AFR', 'DLH', 'JAL', 'QTR']
    aircraft_types = ['A320', 'B737', 'A380', 'B787', 'A330', 'B777']
    cities = ['JFK', 'LAX', 'LHR', 'CDG', 'DXB', 'HND', 'PEK', 'SYD', 'FRA', 'AMS']
    aircraft_list = []
    
    for i in range(1, 21):
        airline = random.choice(airlines)
        flight_num = random.randint(100, 999)
        aircraft_id = f"{airline}{flight_num:03d}"
        
        aircraft = Aircraft(
            id=aircraft_id,
            airline=airline,
            flight_number=str(flight_num),
            aircraft_type=random.choice(aircraft_types),
            x=random.uniform(100, 1100),
            y=random.uniform(100, 800),
            altitude=random.uniform(25000, 41000),
            speed=random.uniform(350, 550),
            heading=random.uniform(0, 360),
            status=random.choices(['ACTIVE', 'ACTIVE', 'ACTIVE', 'EMERGENCY'], weights=[0.85, 0.85, 0.85, 0.15])[0],
            priority=random.choices([1, 2, 3], weights=[0.85, 0.1, 0.05])[0],
            origin=random.choice(cities),
            destination=random.choice(cities),
            fuel_remaining=random.uniform(2000, 8000)
        )
        aircraft_list.append(aircraft)
    
    return aircraft_list

@app.route('/api/aircraft', methods=['GET'])
def get_all_aircraft():
    aircraft = Aircraft.query.all()
    return jsonify([a.to_dict() for a in aircraft])

@app.route('/api/aircraft', methods=['POST'])
def add_aircraft():
    data = request.json
    if Aircraft.query.get(data['id']):
        return jsonify({'error': 'Aircraft ID already exists'}), 400
    
    aircraft = Aircraft(
        id=data['id'],
        airline=data.get('airline', 'UNK'),
        flight_number=data.get('flight_number', '000'),
        aircraft_type=data.get('aircraft_type', 'A320'),
        x=data.get('x', random.uniform(100, 1100)),
        y=data.get('y', random.uniform(100, 800)),
        altitude=data.get('altitude', 35000),
        speed=data.get('speed', 450),
        heading=data.get('heading', random.uniform(0, 360)),
        status=data.get('status', 'ACTIVE'),
        priority=data.get('priority', 1),
        origin=data.get('origin', 'UNK'),
        destination=data.get('destination', 'UNK'),
        fuel_remaining=data.get('fuel_remaining', 5000)
    )
    db.session.add(aircraft)
    db.session.commit()
    return jsonify(aircraft.to_dict()), 201

@app.route('/api/aircraft/<aircraft_id>', methods=['PUT'])
def update_aircraft(aircraft_id):
    aircraft = Aircraft.query.get(aircraft_id)
    if not aircraft:
        return jsonify({'error': 'Aircraft not found'}), 404
    data = request.json
    for key, value in data.items():
        if hasattr(aircraft, key):
            setattr(aircraft, key, value)
    db.session.commit()
    return jsonify(aircraft.to_dict())

@app.route('/api/aircraft/<aircraft_id>', methods=['DELETE'])
def delete_aircraft(aircraft_id):
    aircraft = Aircraft.query.get(aircraft_id)
    if not aircraft:
        return jsonify({'error': 'Aircraft not found'}), 404
    db.session.delete(aircraft)
    db.session.commit()
    return jsonify({'message': f'Aircraft {aircraft_id} removed'})

@app.route('/api/conflicts', methods=['GET'])
def detect_conflicts():
    aircraft = Aircraft.query.filter_by(status='ACTIVE').all()
    conflicts = []
    for i in range(len(aircraft)):
        for j in range(i + 1, len(aircraft)):
            a1, a2 = aircraft[i], aircraft[j]
            distance = math.sqrt((a1.x - a2.x)**2 + (a1.y - a2.y)**2)
            if distance < 100:
                severity = "CRITICAL" if distance < 50 else "HIGH" if distance < 80 else "MEDIUM"
                conflicts.append({
                    'aircraft1': a1.id,
                    'aircraft2': a2.id,
                    'distance': round(distance, 2),
                    'severity': severity
                })
    return jsonify(conflicts)

@app.route('/api/stats/dashboard', methods=['GET'])
def get_dashboard_stats():
    return jsonify({
        'total_aircraft': Aircraft.query.count(),
        'active_aircraft': Aircraft.query.filter_by(status='ACTIVE').count(),
        'emergency_aircraft': Aircraft.query.filter_by(status='EMERGENCY').count(),
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if Aircraft.query.count() == 0:
            print("Initializing database with 20 aircraft...")
            for aircraft in initialize_20_aircraft():
                db.session.add(aircraft)
            db.session.commit()
            print(f"✅ Added 20 aircraft to database")
    
    print("=" * 50)
    print("🚀 ATC-DSS BACKEND WITH 20 PLANES")
    print("=" * 50)
    print(f"📍 API: http://localhost:5000")
    print(f"✈️  Aircraft: {Aircraft.query.count()}")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)
