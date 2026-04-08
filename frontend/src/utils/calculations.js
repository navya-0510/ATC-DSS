export const calculatePosition = (aircraft, deltaTime) => {
  const speedInUnits = aircraft.speed / 3600; // Convert to units per second
  const distance = speedInUnits * deltaTime;
  
  return {
    x: aircraft.x + distance * Math.cos(aircraft.heading * Math.PI / 180),
    y: aircraft.y + distance * Math.sin(aircraft.heading * Math.PI / 180),
  };
};

export const calculateDistance = (aircraft1, aircraft2) => {
  const dx = aircraft1.x - aircraft2.x;
  const dy = aircraft1.y - aircraft2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const detectConflict = (aircraft1, aircraft2, config) => {
  const distance = calculateDistance(aircraft1, aircraft2);
  const altitudeDiff = Math.abs(aircraft1.altitude - aircraft2.altitude);
  
  const isDistanceConflict = distance < config.DISTANCE_THRESHOLD;
  const isAltitudeConflict = altitudeDiff < config.ALTITUDE_THRESHOLD;
  
  if (isDistanceConflict && isAltitudeConflict) {
    const severity = calculateSeverity(distance, altitudeDiff);
    return {
      isConflict: true,
      severity,
      distance,
      altitudeDiff,
      timeToConflict: 0,
    };
  }
  
  return { isConflict: false };
};

export const predictFutureConflicts = (aircraft1, aircraft2, steps, stepTime, config) => {
  const predictions = [];
  
  for (let step = 1; step <= steps; step++) {
    const time = step * stepTime;
    const pos1 = calculatePosition(aircraft1, time);
    const pos2 = calculatePosition(aircraft2, time);
    
    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2)
    );
    
    const altitude1 = aircraft1.altitude;
    const altitude2 = aircraft2.altitude;
    const altitudeDiff = Math.abs(altitude1 - altitude2);
    
    if (distance < config.DISTANCE_THRESHOLD && altitudeDiff < config.ALTITUDE_THRESHOLD) {
      predictions.push({
        timeToConflict: time,
        distance,
        altitudeDiff,
        predictedPositions: { pos1, pos2 },
      });
    }
  }
  
  return predictions;
};

export const calculateSeverity = (distance, altitudeDiff) => {
  const distanceScore = Math.max(0, 1 - distance / 50);
  const altitudeScore = Math.max(0, 1 - altitudeDiff / 1000);
  const totalScore = (distanceScore + altitudeScore) / 2;
  
  if (totalScore > 0.8) return 'CRITICAL';
  if (totalScore > 0.6) return 'HIGH';
  if (totalScore > 0.4) return 'MEDIUM';
  return 'LOW';
};

export const generateSuggestions = (aircraft1, aircraft2, conflict) => {
  const suggestions = [];
  
  // Altitude suggestions
  if (aircraft1.altitude < aircraft2.altitude) {
    suggestions.push({
      id: `alt-${Date.now()}-1`,
      type: 'altitude',
      aircraft: aircraft1.id,
      action: `Descend to ${aircraft2.altitude - 1000} ft`,
      priority: 1,
      deviation: 1000,
      reasoning: 'Descend below conflicting aircraft',
    });
    suggestions.push({
      id: `alt-${Date.now()}-2`,
      type: 'altitude',
      aircraft: aircraft2.id,
      action: `Climb to ${aircraft1.altitude + 1000} ft`,
      priority: 2,
      deviation: 1000,
      reasoning: 'Climb above conflicting aircraft',
    });
  } else {
    suggestions.push({
      id: `alt-${Date.now()}-3`,
      type: 'altitude',
      aircraft: aircraft2.id,
      action: `Descend to ${aircraft1.altitude - 1000} ft`,
      priority: 1,
      deviation: 1000,
      reasoning: 'Descend below conflicting aircraft',
    });
  }
  
  // Heading suggestions
  const currentHeading = aircraft1.heading;
  suggestions.push({
    id: `heading-${Date.now()}-1`,
    type: 'heading',
    aircraft: aircraft1.id,
    action: `Turn right to ${(currentHeading + 30) % 360}°`,
    priority: 3,
    deviation: 30,
    reasoning: 'Turn right to increase separation',
  });
  suggestions.push({
    id: `heading-${Date.now()}-2`,
    type: 'heading',
    aircraft: aircraft1.id,
    action: `Turn left to ${(currentHeading - 30 + 360) % 360}°`,
    priority: 4,
    deviation: 30,
    reasoning: 'Turn left to increase separation',
  });
  
  // Speed suggestions
  suggestions.push({
    id: `speed-${Date.now()}-1`,
    type: 'speed',
    aircraft: aircraft1.id,
    action: `Reduce speed to ${Math.max(150, aircraft1.speed - 50)} knots`,
    priority: 5,
    deviation: 50,
    reasoning: 'Slow down to increase separation time',
  });
  suggestions.push({
    id: `speed-${Date.now()}-2`,
    type: 'speed',
    aircraft: aircraft2.id,
    action: `Increase speed to ${aircraft2.speed + 50} knots`,
    priority: 6,
    deviation: 50,
    reasoning: 'Speed up to pass ahead',
  });
  
  return suggestions.sort((a, b) => a.priority - b.priority);
};

export const generateRandomAircraft = () => {
  const id = `FLT${Math.floor(Math.random() * 900 + 100)}`;
  return {
    id: id,
    x: Math.random() * 800 + 200,
    y: Math.random() * 500 + 150,
    altitude: Math.random() * 30000 + 10000,
    speed: Math.random() * 300 + 200,
    heading: Math.random() * 360,
  };
};