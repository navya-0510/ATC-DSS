export const calculatePosition = (aircraft, deltaTime) => {   //predicts future position
  const speedInUnits = aircraft.speed / 3600; // Convert to units per second
  const distance = speedInUnits * deltaTime;
  
  return {
    x: aircraft.x + distance * Math.cos(aircraft.heading * Math.PI / 180),
    y: aircraft.y + distance * Math.sin(aircraft.heading * Math.PI / 180),
  };
};

export const calculateDistance = (aircraft1, aircraft2) => {  //distance b/w two planes 
  const dx = aircraft1.x - aircraft2.x;
  const dy = aircraft1.y - aircraft2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const detectConflict = (aircraft1, aircraft2, config) => { //checks for conflicts
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

export const predictFutureConflicts = (aircraft1, aircraft2, steps, stepTime, config) => { //predicts future collision
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

export const calculateSeverity = (distance, altitudeDiff) => { //determines alert level
  const distanceScore = Math.max(0, 1 - distance / 50);
  const altitudeScore = Math.max(0, 1 - altitudeDiff / 1000);
  const totalScore = (distanceScore + altitudeScore) / 2;
  
  if (totalScore > 0.8) return 'CRITICAL';
  if (totalScore > 0.6) return 'HIGH';
  if (totalScore > 0.4) return 'MEDIUM';
  return 'LOW';
};

export const generateSuggestions = (aircraft1, aircraft2, conflict) => { //creates resolution options
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

// === NEW FUNCTIONS FROM CLASS DIAGRAM ===

/**
 * Predict trajectory of an aircraft for given seconds
 * @param {Object} aircraft - Aircraft object
 * @param {number} seconds - Number of seconds to predict (default: 30)
 * @returns {Array} Array of predicted positions
 */
export const predictTrajectory = (aircraft, seconds = 30) => {
  const predictions = [];
  const steps = seconds / 2; // Predict every 2 seconds
  const stepTime = 2; // seconds per step
  
  for (let i = 1; i <= steps; i++) {
    const time = i * stepTime;
    const predictedX = aircraft.x + (aircraft.speed / 3600) * time * Math.cos(aircraft.heading * Math.PI / 180);
    const predictedY = aircraft.y + (aircraft.speed / 3600) * time * Math.sin(aircraft.heading * Math.PI / 180);
    
    predictions.push({
      time: time,
      x: predictedX,
      y: predictedY,
      altitude: aircraft.altitude,
      heading: aircraft.heading
    });
  }
  
  return predictions;
};

/**
 * Validate a route with waypoints
 * @param {Array} waypoints - Array of waypoint objects with heading and altitude
 * @returns {Object} Validation result with issues
 */
export const validateRoute = (waypoints) => {
  const issues = [];
  
  if (!waypoints || waypoints.length < 2) {
    issues.push('Route must have at least 2 waypoints');
    return { isValid: false, issues };
  }
  
  for (let i = 0; i < waypoints.length - 1; i++) {
    const current = waypoints[i];
    const next = waypoints[i + 1];
    
    // Check for unrealistic turns (> 90 degrees)
    const turnAngle = Math.abs((next.heading || 0) - (current.heading || 0));
    if (turnAngle > 90 && turnAngle < 270) {
      const actualTurn = turnAngle > 180 ? 360 - turnAngle : turnAngle;
      if (actualTurn > 90) {
        issues.push(`⚠️ Sharp turn of ${Math.round(actualTurn)}° between waypoint ${i + 1} and ${i + 2}`);
      }
    }
    
    // Check for unrealistic altitude changes (> 5000 ft)
    const altitudeChange = Math.abs((next.altitude || 35000) - (current.altitude || 35000));
    if (altitudeChange > 5000) {
      issues.push(`⚠️ Extreme altitude change of ${Math.round(altitudeChange)}ft between waypoints`);
    }
    
    // Check for unrealistic speed changes (> 100 knots)
    const speedChange = Math.abs((next.speed || 450) - (current.speed || 450));
    if (speedChange > 100) {
      issues.push(`⚠️ Abrupt speed change of ${Math.round(speedChange)} knots between waypoints`);
    }
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
};

/**
 * Scan all aircraft for conflicts (wrapper for detectConflicts)
 * @param {Array} aircraftList - List of all aircraft
 * @param {Object} config - Configuration thresholds
 * @returns {Array} List of conflicts
 */
export const scanAll = (aircraftList, config) => {
  const conflicts = [];
  
  for (let i = 0; i < aircraftList.length; i++) {
    for (let j = i + 1; j < aircraftList.length; j++) {
      const conflict = detectConflict(aircraftList[i], aircraftList[j], config);
      if (conflict.isConflict) {
        conflicts.push({
          aircraft1: aircraftList[i],
          aircraft2: aircraftList[j],
          ...conflict
        });
      }
    }
  }
  
  return conflicts;
};

/**
 * Get formatted route from waypoints
 * @param {Array} waypoints - Array of waypoint objects
 * @returns {Array} Formatted route list
 */
export const getRoute = (waypoints) => {
  if (!waypoints || waypoints.length === 0) {
    return [];
  }
  
  return waypoints.map((wp, index) => ({
    sequence: index + 1,
    lat: wp.lat || wp.x,
    lon: wp.lon || wp.y,
    altitude: wp.altitude || 35000,
    heading: wp.heading || 0,
    distance: index > 0 ? calculateDistance(waypoints[index - 1], wp) : 0
  }));
};

/**
 * Override a suggestion with reason
 * @param {Object} suggestion - Suggestion object
 * @param {string} reason - Reason for override
 * @param {Object} controller - Controller who overrode
 * @returns {Object} Override record
 */
export const overrideSuggestion = (suggestion, reason, controller) => {
  return {
    id: `override-${Date.now()}`,
    suggestionId: suggestion.id,
    originalAction: suggestion.action,
    controller: controller?.username || 'Unknown',
    controllerName: controller?.name || 'Unknown',
    reason: reason,
    timestamp: new Date().toISOString(),
    overridden: true
  };
};

/**
 * Acknowledge an alert with controller info
 * @param {Object} alert - Alert object
 * @param {Object} controller - Controller acknowledging
 * @returns {Object} Acknowledged alert
 */
export const acknowledgeAlert = (alert, controller) => {
  return {
    ...alert,
    acknowledged: true,
    acknowledgedBy: controller?.username || 'Unknown',
    acknowledgedByName: controller?.name || 'Unknown',
    acknowledgedAt: new Date().toISOString(),
    status: 'ACKNOWLEDGED'
  };
};