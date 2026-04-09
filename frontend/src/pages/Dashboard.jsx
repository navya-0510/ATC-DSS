import React, { useEffect, useState } from 'react';
import Radar from '../components/Radar';
import ConflictAlert from '../components/ConflictAlert';
import SuggestionCard from '../components/SuggestionCard';
import { useATC } from '../context/ATCContext';

const API_BASE = 'http://localhost:5000/api';
const MAX_AIRCRAFT = 50;

const Dashboard = () => {
  const { state, dispatch } = useATC();
  const [scanInterval, setScanInterval] = useState(3000);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Load aircraft from backend on startup
  useEffect(() => {
    loadAircraftFromBackend();
  }, []);
  
  const loadAircraftFromBackend = async () => {
    try {
      const response = await fetch(`${API_BASE}/aircraft`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Clear existing
        state.aircraft.forEach(ac => {
          dispatch({ type: 'REMOVE_AIRCRAFT', payload: ac.id });
        });
        // Add all from backend
        data.forEach(ac => {
          dispatch({ type: 'ADD_AIRCRAFT', payload: ac });
        });
        console.log(`✅ Loaded ${data.length} aircraft from backend`);
        return data.length;
      }
    } catch (error) {
      console.error('Backend error, using defaults');
    }
    return 0;
  };
  
  // REFRESH BUTTON - Reload from database
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Refreshing aircraft from database...');
    
    try {
      const response = await fetch(`${API_BASE}/aircraft`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Clear existing aircraft
        state.aircraft.forEach(ac => {
          dispatch({ type: 'REMOVE_AIRCRAFT', payload: ac.id });
        });
        
        // Add all aircraft from backend
        data.forEach(ac => {
          dispatch({ type: 'ADD_AIRCRAFT', payload: ac });
        });
        
        dispatch({
          type: 'ADD_LOG',
          payload: {
            id: Date.now(),
            type: 'REFRESH',
            message: `🔄 Refreshed: Loaded ${data.length} aircraft from database`,
            timestamp: new Date().toLocaleTimeString(),
          },
        });
        
        console.log(`✅ Refresh complete: ${data.length} aircraft loaded`);
      } else {
        console.log('No aircraft found in database');
      }
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    
    setIsRefreshing(false);
  };
  
  // SCAN NOW BUTTON - Manually detect conflicts
  const handleScanNow = () => {
    setIsScanning(true);
    console.log('🔍 Manual scan initiated...');
    
    const newConflicts = [];
    const newAlerts = [];
    
    // Check all aircraft pairs for conflicts
    for (let i = 0; i < state.aircraft.length; i++) {
      for (let j = i + 1; j < state.aircraft.length; j++) {
        const a1 = state.aircraft[i];
        const a2 = state.aircraft[j];
        
        const dx = a1.x - a2.x;
        const dy = a1.y - a2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const altDiff = Math.abs(a1.altitude - a2.altitude);
        
        // Conflict detection
        if (distance < 100 || altDiff < 2000) {
          let severity = 'MEDIUM';
          if (distance < 50 && altDiff < 1000) severity = 'CRITICAL';
          else if (distance < 80 && altDiff < 1500) severity = 'HIGH';
          
          const conflictId = `${a1.id}-${a2.id}`;
          
          // Check if conflict already exists
          const existingConflict = state.conflicts.find(c => c.id === conflictId);
          
          if (!existingConflict) {
            newConflicts.push({
              id: conflictId,
              aircraft1: a1.id,
              aircraft2: a2.id,
              distance: Math.round(distance),
              severity: severity
            });
          }
          
          // Create alert
          const alertExists = state.alerts.some(a => 
            a.message.includes(a1.id) && a.message.includes(a2.id)
          );
          
          if (!alertExists && distance < 90) {
            newAlerts.push({
              id: Date.now() + Math.random(),
              severity: severity,
              aircraft: [a1.id, a2.id],
              message: `${severity}: ${a1.id} and ${a2.id} too close! Distance: ${Math.round(distance)} units`,
              timestamp: Date.now(),
            });
          }
        }
      }
    }
    
    // Update state
    if (newConflicts.length > 0) {
      dispatch({ type: 'SET_CONFLICTS', payload: [...state.conflicts, ...newConflicts] });
    }
    
    newAlerts.forEach(alert => {
      dispatch({ type: 'ADD_ALERT', payload: alert });
    });
    
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'SCAN',
        message: `🔍 Scan complete: Found ${newConflicts.length} conflicts, ${newAlerts.length} new alerts`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    
    console.log(`✅ Scan complete: ${newConflicts.length} conflicts found`);
    setIsScanning(false);
    
    // Show temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-atc-green/20 border border-atc-green text-atc-green px-4 py-2 rounded shadow-lg z-50';
    notification.innerText = `🔍 Scan complete! Found ${newConflicts.length} conflicts`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };
  
  // Real-time movement simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isSimulating && state.aircraft.length > 0) {
        state.aircraft.forEach(aircraft => {
          const moveDistance = (aircraft.speed / 3600) * 0.5 * state.simulationSpeed;
          let newX = aircraft.x + moveDistance * Math.cos(aircraft.heading * Math.PI / 180);
          let newY = aircraft.y + moveDistance * Math.sin(aircraft.heading * Math.PI / 180);
          
          // Boundaries
          if (newX < 50) newX = 50;
          if (newX > 1150) newX = 1150;
          if (newY < 50) newY = 50;
          if (newY > 750) newY = 750;
          
          dispatch({
            type: 'UPDATE_AIRCRAFT',
            payload: { id: aircraft.id, updates: { x: newX, y: newY } }
          });
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [state.isSimulating, state.simulationSpeed, state.aircraft, dispatch]);
  
  // Automatic conflict detection
  useEffect(() => {
    const detectConflicts = () => {
      const newConflicts = [];
      
      for (let i = 0; i < state.aircraft.length; i++) {
        for (let j = i + 1; j < state.aircraft.length; j++) {
          const a1 = state.aircraft[i];
          const a2 = state.aircraft[j];
          
          const dx = a1.x - a2.x;
          const dy = a1.y - a2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const altDiff = Math.abs(a1.altitude - a2.altitude);
          
          if (distance < 100 || altDiff < 2000) {
            let severity = 'MEDIUM';
            if (distance < 50 && altDiff < 1000) severity = 'CRITICAL';
            else if (distance < 80 && altDiff < 1500) severity = 'HIGH';
            
            newConflicts.push({
              id: `${a1.id}-${a2.id}`,
              aircraft1: a1.id,
              aircraft2: a2.id,
              distance: Math.round(distance),
              severity: severity
            });
          }
        }
      }
      
      dispatch({ type: 'SET_CONFLICTS', payload: newConflicts });
    };
    
    const interval = setInterval(detectConflicts, scanInterval);
    return () => clearInterval(interval);
  }, [state.aircraft, dispatch, scanInterval]);
  
  const handleAddAircraft = async () => {
    if (state.aircraft.length >= MAX_AIRCRAFT) {
      alert(`Maximum aircraft limit (${MAX_AIRCRAFT}) reached`);
      return;
    }
    
    const newId = `FLT${Math.floor(Math.random() * 900 + 100)}`;
    const newAircraft = {
      id: newId,
      x: Math.random() * 800 + 200,
      y: Math.random() * 500 + 150,
      altitude: 30000 + Math.random() * 10000,
      speed: 400 + Math.random() * 100,
      heading: Math.random() * 360,
    };
    
    try {
      await fetch(`${API_BASE}/aircraft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAircraft)
      });
      dispatch({ type: 'ADD_AIRCRAFT', payload: newAircraft });
      dispatch({
        type: 'ADD_LOG',
        payload: {
          id: Date.now(),
          type: 'ADD',
          message: `✈️ Added ${newId}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    } catch (error) {
      dispatch({ type: 'ADD_AIRCRAFT', payload: newAircraft });
    }
  };
  
  const handleDismissAlert = (alertId) => {
    dispatch({ type: 'CLEAR_ALERT', payload: alertId });
  };
  
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex space-x-6">
          <div className="flex-1">
            <Radar showPredictions={showPredictions} />
            
            {/* Buttons */}
            <div className="mt-4 flex space-x-3">
              <button
                onClick={handleAddAircraft}
                className="px-4 py-2 bg-atc-green/20 hover:bg-atc-green/30 text-atc-green rounded-md text-sm font-mono transition-colors"
              >
                ✈️ ADD AIRCRAFT
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
                  isRefreshing 
                    ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                }`}
              >
                {isRefreshing ? '⟳ REFRESHING...' : '🔄 REFRESH'}
              </button>
              
              <button
                onClick={handleScanNow}
                disabled={isScanning}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
                  isScanning 
                    ? 'bg-gray-600/20 text-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600/20 hover:bg-purple-600/30 text-purple-400'
                }`}
              >
                {isScanning ? '🔍 SCANNING...' : '🔍 SCAN NOW'}
              </button>
              
              <button
                onClick={() => setShowPredictions(!showPredictions)}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-colors ${
                  showPredictions 
                    ? 'bg-yellow-600/20 text-yellow-400' 
                    : 'bg-gray-600/20 text-gray-400 hover:bg-gray-600/30'
                }`}
              >
                📍 {showPredictions ? 'HIDE' : 'SHOW'} PREDICTIONS
              </button>
            </div>
            
            {/* Settings Panel */}
            <div className="mt-3 flex space-x-4 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Scan Interval:</span>
                <select
                  value={scanInterval}
                  onChange={(e) => setScanInterval(parseInt(e.target.value))}
                  className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-atc-green"
                >
                  <option value="1000">1s</option>
                  <option value="3000">3s</option>
                  <option value="5000">5s</option>
                  <option value="10000">10s</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">Aircraft:</span>
                <span className="text-atc-green font-bold">{state.aircraft.length} / {MAX_AIRCRAFT}</span>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-96 space-y-4">
            {/* Alerts */}
            <div className="bg-atc-darker/50 rounded-lg border border-red-500/20">
              <div className="bg-red-500/10 px-4 py-2 border-b border-red-500/20">
                <h2 className="text-red-400 font-bold text-sm">🔴 ACTIVE ALERTS ({state.alerts.length})</h2>
              </div>
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {state.alerts.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">✅ No active alerts</p>
                ) : (
                  state.alerts.map(alert => (
                    <ConflictAlert key={alert.id} alert={alert} onDismiss={handleDismissAlert} />
                  ))
                )}
              </div>
            </div>
            
            {/* Suggestions */}
            <div className="bg-atc-darker/50 rounded-lg border border-atc-green/20">
              <div className="bg-atc-green/10 px-4 py-2 border-b border-atc-green/20">
                <h2 className="text-atc-green font-bold text-sm">💡 DECISION SUPPORT ({state.suggestions.length})</h2>
              </div>
              <div className="p-3 max-h-[400px] overflow-y-auto">
                {state.suggestions.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4"> No active conflicts</p>
                ) : (
                  state.suggestions.map(suggestion => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} onApply={() => {}} />
                  ))
                )}
              </div>
            </div>
            
            {/* Status */}
            <div className="bg-atc-darker/50 rounded-lg p-3 border border-atc-green/20">
              <div className="flex justify-between text-xs"><span>🟢 Status:</span><span className="text-atc-green">OPERATIONAL</span></div>
              <div className="flex justify-between text-xs mt-1"><span>⚠️ Conflicts:</span><span className="text-red-400">{state.conflicts.length}</span></div>
              <div className="flex justify-between text-xs mt-1"><span>✈️ Aircraft:</span><span className="text-atc-green">{state.aircraft.length}</span></div>
              <div className="flex justify-between text-xs mt-1"><span>🎮 Simulation:</span><span className="text-atc-green">{state.isSimulating ? 'RUNNING' : 'PAUSED'}</span></div>
              <div className="flex justify-between text-xs mt-1"><span>🔍 Scan Interval:</span><span className="text-atc-green">{scanInterval/1000}s</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;