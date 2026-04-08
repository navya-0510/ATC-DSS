import React, { useEffect } from 'react';
import Radar from '../components/Radar';
import ConflictAlert from '../components/ConflictAlert';
import SuggestionCard from '../components/SuggestionCard';
import { useATC } from '../context/ATCContext';

const API_BASE = 'http://localhost:5000/api';

const Dashboard = () => {
  const { state, dispatch } = useATC();
  
  // Load aircraft from backend database on startup
  useEffect(() => {
    const loadAircraftFromBackend = async () => {
      try {
        console.log('Fetching aircraft from backend...');
        const response = await fetch(`${API_BASE}/aircraft`);
        const aircraftFromBackend = await response.json();
        
        console.log(`Found ${aircraftFromBackend.length} aircraft in database`);
        
        if (aircraftFromBackend.length > 0) {
          // Clear existing mock aircraft
          state.aircraft.forEach(ac => {
            dispatch({ type: 'REMOVE_AIRCRAFT', payload: ac.id });
          });
          
          // Add all aircraft from backend database
          aircraftFromBackend.forEach(ac => {
            dispatch({ type: 'ADD_AIRCRAFT', payload: ac });
          });
          
          console.log(`✅ Loaded ${aircraftFromBackend.length} aircraft from backend`);
        } else {
          console.log('No aircraft found in backend, using defaults');
          // Fallback to default aircraft if backend is empty
          const defaultAircraft = [
            { id: 'ACA101', x: 300, y: 300, altitude: 35000, speed: 450, heading: 45 },
            { id: 'UAL202', x: 700, y: 400, altitude: 37000, speed: 430, heading: 225 },
            { id: 'DAL303', x: 500, y: 600, altitude: 33000, speed: 460, heading: 315 },
            { id: 'SWA404', x: 800, y: 200, altitude: 34000, speed: 440, heading: 135 },
            { id: 'AAL505', x: 400, y: 700, altitude: 36000, speed: 455, heading: 90 },
            { id: 'BAW606', x: 900, y: 500, altitude: 38000, speed: 470, heading: 270 },
          ];
          
          defaultAircraft.forEach(ac => {
            dispatch({ type: 'ADD_AIRCRAFT', payload: ac });
          });
        }
      } catch (error) {
        console.error('Error loading aircraft from backend:', error);
        // Fallback to default aircraft if backend is not reachable
        const defaultAircraft = [
          { id: 'ACA101', x: 300, y: 300, altitude: 35000, speed: 450, heading: 45 },
          { id: 'UAL202', x: 700, y: 400, altitude: 37000, speed: 430, heading: 225 },
          { id: 'DAL303', x: 500, y: 600, altitude: 33000, speed: 460, heading: 315 },
          { id: 'SWA404', x: 800, y: 200, altitude: 34000, speed: 440, heading: 135 },
        ];
        
        defaultAircraft.forEach(ac => {
          dispatch({ type: 'ADD_AIRCRAFT', payload: ac });
        });
      }
    };
    
    loadAircraftFromBackend();
  }, []); // Empty dependency array - runs once on mount
  
  // Real-time movement simulation with boundary keeping
  useEffect(() => {
    const moveInterval = setInterval(() => {
      if (state.isSimulating && state.aircraft.length > 0) {
        state.aircraft.forEach(aircraft => {
          const speedFactor = state.simulationSpeed;
          const moveDistance = (aircraft.speed / 3600) * 0.5 * speedFactor;
          
          let newX = aircraft.x + moveDistance * Math.cos(aircraft.heading * Math.PI / 180);
          let newY = aircraft.y + moveDistance * Math.sin(aircraft.heading * Math.PI / 180);
          
          // Keep within radar view (100-1100 for x, 100-700 for y)
          let newHeading = aircraft.heading;
          
          if (newX < 100) {
            newX = 100;
            newHeading = (180 - aircraft.heading + 360) % 360;
          }
          if (newX > 1100) {
            newX = 1100;
            newHeading = (180 - aircraft.heading + 360) % 360;
          }
          if (newY < 100) {
            newY = 100;
            newHeading = (360 - aircraft.heading) % 360;
          }
          if (newY > 700) {
            newY = 700;
            newHeading = (360 - aircraft.heading) % 360;
          }
          
          // Update heading if changed
          if (newHeading !== aircraft.heading) {
            dispatch({
              type: 'UPDATE_AIRCRAFT',
              payload: { id: aircraft.id, updates: { heading: newHeading } }
            });
          }
          
          // Update position
          dispatch({
            type: 'UPDATE_AIRCRAFT',
            payload: { id: aircraft.id, updates: { x: newX, y: newY } }
          });
        });
      }
    }, 100);
    
    return () => clearInterval(moveInterval);
  }, [state.isSimulating, state.simulationSpeed, state.aircraft, dispatch]);
  
  // Fetch conflicts from backend periodically
  useEffect(() => {
    const fetchConflicts = async () => {
      try {
        const response = await fetch(`${API_BASE}/conflicts`);
        const conflicts = await response.json();
        
        if (conflicts.length > 0) {
          // Update conflicts in state
          dispatch({ type: 'SET_CONFLICTS', payload: conflicts });
          
          // Create alert for each new conflict
          conflicts.forEach(conflict => {
            const alertExists = state.alerts.some(a => 
              a.message.includes(conflict.aircraft1) && a.message.includes(conflict.aircraft2)
            );
            
            if (!alertExists) {
              const alert = {
                id: Date.now(),
                severity: conflict.severity,
                aircraft: [conflict.aircraft1, conflict.aircraft2],
                message: `${conflict.severity} conflict detected between ${conflict.aircraft1} and ${conflict.aircraft2}. Distance: ${conflict.distance} units`,
                timestamp: Date.now(),
              };
              dispatch({ type: 'ADD_ALERT', payload: alert });
            }
          });
        }
      } catch (error) {
        console.error('Error fetching conflicts:', error);
      }
    };
    
    const conflictInterval = setInterval(fetchConflicts, 3000);
    return () => clearInterval(conflictInterval);
  }, [dispatch, state.alerts]);
  
  const handleAddAircraft = async () => {
    const newId = `FLT${Math.floor(Math.random() * 900 + 100)}`;
    const newAircraft = {
      id: newId,
      x: Math.random() * 800 + 200,
      y: Math.random() * 500 + 150,
      altitude: Math.random() * 20000 + 25000,
      speed: Math.random() * 200 + 350,
      heading: Math.random() * 360,
    };
    
    // Add to backend
    try {
      await fetch(`${API_BASE}/aircraft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAircraft)
      });
      
      // Add to frontend state
      dispatch({ type: 'ADD_AIRCRAFT', payload: newAircraft });
      dispatch({
        type: 'ADD_LOG',
        payload: {
          id: Date.now(),
          type: 'ADD',
          message: `✈️ Aircraft ${newId} entered the airspace`,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    } catch (error) {
      console.error('Error adding aircraft:', error);
    }
  };
  
  const handleDismissAlert = (alertId) => {
    dispatch({ type: 'CLEAR_ALERT', payload: alertId });
  };
  
  const handleRefreshFromBackend = async () => {
    try {
      const response = await fetch(`${API_BASE}/aircraft`);
      const aircraftFromBackend = await response.json();
      
      // Clear existing aircraft
      state.aircraft.forEach(ac => {
        dispatch({ type: 'REMOVE_AIRCRAFT', payload: ac.id });
      });
      
      // Add all aircraft from backend
      aircraftFromBackend.forEach(ac => {
        dispatch({ type: 'ADD_AIRCRAFT', payload: ac });
      });
      
      console.log(`✅ Refreshed: Loaded ${aircraftFromBackend.length} aircraft from backend`);
    } catch (error) {
      console.error('Error refreshing from backend:', error);
    }
  };
  
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex space-x-6">
          {/* Main Radar Area */}
          <div className="flex-1">
            <div className="bg-atc-darker/50 rounded-lg p-4 border border-atc-green/20 overflow-auto">
              <Radar />
            </div>
            
            {/* Quick Actions */}
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleAddAircraft}
                className="px-4 py-2 bg-atc-green/20 hover:bg-atc-green/30 text-atc-green rounded-md text-sm font-mono transition-colors cursor-pointer"
              >
                ✈️ + ADD AIRCRAFT
              </button>
              <button
                onClick={handleRefreshFromBackend}
                className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-md text-sm font-mono transition-colors cursor-pointer"
              >
                🔄 REFRESH FROM BACKEND
              </button>
            </div>
          </div>
          
          {/* Sidebar - Alerts and Suggestions */}
          <div className="w-96 space-y-4">
            {/* Active Alerts */}
            <div className="bg-atc-darker/50 rounded-lg border border-red-500/20 overflow-hidden">
              <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/20">
                <h2 className="text-red-400 font-bold text-sm flex items-center">
                  <span className="animate-pulse mr-2">🔴</span>
                  ACTIVE ALERTS ({state.alerts.length})
                </h2>
              </div>
              <div className="p-3 max-h-[450px] overflow-y-auto">
                {state.alerts.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">✅ No active alerts</p>
                ) : (
                  state.alerts.map(alert => (
                    <ConflictAlert
                      key={alert.id}
                      alert={alert}
                      onDismiss={handleDismissAlert}
                    />
                  ))
                )}
              </div>
            </div>
            
            {/* Decision Support Suggestions */}
            <div className="bg-atc-darker/50 rounded-lg border border-atc-green/20 overflow-hidden">
              <div className="bg-atc-green/10 px-4 py-2 border-b border-atc-green/20">
                <h2 className="text-atc-green font-bold text-sm flex items-center">
                  <span className="mr-2">💡</span>
                  DECISION SUPPORT ({state.suggestions.length})
                </h2>
              </div>
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {state.suggestions.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">💚 No active conflicts</p>
                ) : (
                  state.suggestions.map(suggestion => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onApply={() => {}}
                    />
                  ))
                )}
              </div>
            </div>
            
            {/* System Status */}
            <div className="bg-atc-darker/50 rounded-lg p-3 border border-atc-green/20">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">🟢 System Status:</span>
                <span className="text-atc-green">OPERATIONAL</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">⚠️ Active Conflicts:</span>
                <span className="text-red-400 font-bold">{state.conflicts.length}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">✈️ Aircraft Tracked:</span>
                <span className="text-atc-green font-bold">{state.aircraft.length}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">💾 Backend Status:</span>
                <span className="text-atc-green">CONNECTED</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-500">🎮 Simulation:</span>
                <span className="text-atc-green">{state.isSimulating ? 'RUNNING' : 'PAUSED'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;