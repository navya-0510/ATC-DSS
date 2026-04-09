import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

const ATCContext = createContext();

const initialState = {
  aircraft: [],
  conflicts: [],
  suggestions: [],
  alerts: [],
  logs: [],
  isSimulating: true,
  simulationSpeed: 1,
};

//Helper function to calculate distance
const calculateDistance = (a1, a2) => { //calculates distance b/w two aircraft
  const dx = a1.x - a2.x;
  const dy = a1.y - a2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

function atcReducer(state, action) { //manages state changes 
  switch (action.type) {
    case 'SET_AIRCRAFT':
      return { ...state, aircraft: action.payload };
    case 'ADD_AIRCRAFT':
      //Prevent duplicates
      if (state.aircraft.some(a => a.id === action.payload.id)) {
        return state;
      }
      return { ...state, aircraft: [...state.aircraft, action.payload] };
    case 'UPDATE_AIRCRAFT':
      return {
        ...state,
        aircraft: state.aircraft.map(a => 
          a.id === action.payload.id ? { ...a, ...action.payload.updates } : a
        ),
      };
    case 'REMOVE_AIRCRAFT':
      return {
        ...state,
        aircraft: state.aircraft.filter(a => a.id !== action.payload),
        conflicts: state.conflicts.filter(c => c.aircraft1 !== action.payload && c.aircraft2 !== action.payload),
        alerts: state.alerts.filter(a => !a.aircraft?.includes(action.payload)),
      };
    case 'SET_CONFLICTS':
      return { ...state, conflicts: action.payload };
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    case 'ADD_ALERT':
      const exists = state.alerts.some(a => a.message === action.payload.message);
      if (!exists) {
        return { ...state, alerts: [action.payload, ...state.alerts].slice(0, 50) };
      }
      return state;
    case 'CLEAR_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(a => a.id !== action.payload),
      };
    case 'CLEAR_ALL_ALERTS':
      return { ...state, alerts: [] };
    case 'ADD_LOG':
      return { ...state, logs: [action.payload, ...state.logs].slice(0, 100) };
    case 'SET_SIMULATION':
      return { ...state, isSimulating: action.payload };
    case 'SET_SPEED':
      return { ...state, simulationSpeed: action.payload };
    default:
      return state;
  }
}

export function ATCProvider({ children }) {
  const [state, dispatch] = useReducer(atcReducer, initialState);

  const generateSuggestions = (aircraft1, aircraft2) => {  //created resolution suggestions
    const suggestions = [];
    
    suggestions.push({
      id: `sug-${Date.now()}-${Math.random()}`,
      type: 'altitude',
      aircraft: aircraft1.id,
      action: `Descend to ${Math.floor(aircraft2.altitude - 1000)} ft`, //altitude 
      priority: 1,
      deviation: 1000,
      reasoning: `Descend ${aircraft1.id} to avoid ${aircraft2.id}`,
    });
    
    suggestions.push({
      id: `sug-${Date.now()}-${Math.random()}`,
      type: 'heading',
      aircraft: aircraft1.id, //callsign
      action: `Turn right to ${(aircraft1.heading + 45) % 360}°`, //heading 
      priority: 2,
      deviation: 45,
      reasoning: `Turn ${aircraft1.id} right to increase separation`,
    });
    
    suggestions.push({
      id: `sug-${Date.now()}-${Math.random()}`,
      type: 'speed',
      aircraft: aircraft1.id,
      action: `Reduce speed to ${Math.max(200, aircraft1.speed - 50)} knots`, //speed
      priority: 3,
      deviation: 50,
      reasoning: `Slow down to increase separation`,
    });
    
    return suggestions;
  };

  const detectConflicts = useCallback(() => { //detects conflict b/w aircraft
    const newConflicts = [];
    const allSuggestions = [];
    const newAlerts = [];
    const processedPairs = new Set();
    
    for (let i = 0; i < state.aircraft.length; i++) {
      for (let j = i + 1; j < state.aircraft.length; j++) {
        const a1 = state.aircraft[i];
        const a2 = state.aircraft[j];
        
        const distance = calculateDistance(a1, a2);
        const altitudeDiff = Math.abs(a1.altitude - a2.altitude);
        const pairKey = `${a1.id}-${a2.id}`;
        
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);
        
        // Conflict detection
        if (distance < 100 || altitudeDiff < 2000) {
          let severity = 'MEDIUM';
          let message = '';
          
          if (distance < 50 && altitudeDiff < 1000) {
            severity = 'CRITICAL';
            message = `CRITICAL: ${a1.id} and ${a2.id} on collision course! Distance: ${Math.floor(distance)} units`;
          } else if (distance < 80 && altitudeDiff < 1500) {
            severity = 'HIGH';
            message = `HIGH: ${a1.id} and ${a2.id} dangerously close! Distance: ${Math.floor(distance)} units`;
          } else {
            message = `MEDIUM: ${a1.id} and ${a2.id} approaching conflict zone`;
          }
          
          newConflicts.push({
            id: pairKey,
            aircraft1: a1.id,
            aircraft2: a2.id,
            distance: Math.floor(distance),
            altitudeDiff: Math.floor(altitudeDiff),
            severity: severity,
            timestamp: Date.now(),
          });
          
          const suggestions = generateSuggestions(a1, a2);
          allSuggestions.push(...suggestions);
          
          newAlerts.push({
            id: Date.now() + Math.random(),
            severity: severity,
            aircraft: [a1.id, a2.id],
            message: message,
            timestamp: Date.now(),
          });
        }
      }
    }
    
    dispatch({ type: 'SET_CONFLICTS', payload: newConflicts });
    dispatch({ type: 'SET_SUGGESTIONS', payload: allSuggestions.slice(0, 5) });
    
    newAlerts.forEach(alert => {
      dispatch({ type: 'ADD_ALERT', payload: alert });
    });
  }, [state.aircraft]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isSimulating && state.aircraft.length > 1) {
        detectConflicts();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [state.isSimulating, state.aircraft.length, detectConflicts]);

  return (
    <ATCContext.Provider value={{ state, dispatch }}>
      {children}
    </ATCContext.Provider>
  );
}

export function useATC() { //hook to access ATC context
  const context = useContext(ATCContext);
  if (!context) {
    throw new Error('useATC must be used within an ATCProvider');
  }
  return context;
}