import React, { useState } from 'react';
import { useATC } from '../context/ATCContext';

const API_BASE = 'http://localhost:5000/api';

const FlightPlan = () => {
  const { state, dispatch } = useATC();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newAircraft, setNewAircraft] = useState({
    id: '',
    x: 600,
    y: 400,
    altitude: 35000,
    speed: 450,
    heading: 0,
  });
  
  const handleAdd = async () => {
    if (!newAircraft.id) {
      alert('Please enter aircraft ID');
      return;
    }
    
    if (state.aircraft.some(a => a.id === newAircraft.id)) {
      alert('Aircraft ID already exists');
      return;
    }
    
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
          message: `✈️ Added ${newAircraft.id}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
      
      setNewAircraft({ id: '', x: 600, y: 400, altitude: 35000, speed: 450, heading: 0 });
      setShowAddForm(false);
    } catch (error) {
      // Fallback - add locally only
      dispatch({ type: 'ADD_AIRCRAFT', payload: newAircraft });
      setNewAircraft({ id: '', x: 600, y: 400, altitude: 35000, speed: 450, heading: 0 });
      setShowAddForm(false);
    }
  };
  
  const handleRemove = async (id) => {
    if (window.confirm(`Remove ${id}?`)) {
      try {
        await fetch(`${API_BASE}/aircraft/${id}`, { method: 'DELETE' });
      } catch (error) {
        console.error('Backend delete failed');
      }
      
      dispatch({ type: 'REMOVE_AIRCRAFT', payload: id });
      dispatch({
        type: 'ADD_LOG',
        payload: {
          id: Date.now(),
          type: 'REMOVE',
          message: `❌ Removed ${id}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    }
  };
  
  const handleUpdate = async (id, updates) => {
    try {
      await fetch(`${API_BASE}/aircraft/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Backend update failed');
    }
    
    dispatch({ type: 'UPDATE_AIRCRAFT', payload: { id, updates } });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'UPDATE',
        message: `📝 Updated ${id}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    setEditingId(null);
  };
  
  return (
    <div className="p-6 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-atc-green font-mono">✈️ Flight Plan Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-atc-green text-black rounded-md font-bold hover:bg-atc-green/80 cursor-pointer"
          >
            {showAddForm ? '− CANCEL' : '+ NEW FLIGHT PLAN'}
          </button>
        </div>
        
        {showAddForm && (
          <div className="bg-atc-darker/80 border border-atc-green/30 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-atc-green mb-4">Create New Flight Plan</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Aircraft ID</label>
                <input
                  type="text"
                  value={newAircraft.id}
                  onChange={(e) => setNewAircraft({ ...newAircraft, id: e.target.value.toUpperCase() })}
                  placeholder="e.g., AAL123"
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">X Position</label>
                <input
                  type="number"
                  value={newAircraft.x}
                  onChange={(e) => setNewAircraft({ ...newAircraft, x: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Y Position</label>
                <input
                  type="number"
                  value={newAircraft.y}
                  onChange={(e) => setNewAircraft({ ...newAircraft, y: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Altitude (ft)</label>
                <input
                  type="number"
                  value={newAircraft.altitude}
                  onChange={(e) => setNewAircraft({ ...newAircraft, altitude: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Speed (knots)</label>
                <input
                  type="number"
                  value={newAircraft.speed}
                  onChange={(e) => setNewAircraft({ ...newAircraft, speed: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Heading (degrees)</label>
                <input
                  type="number"
                  value={newAircraft.heading}
                  onChange={(e) => setNewAircraft({ ...newAircraft, heading: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-atc-green text-black rounded-md font-bold hover:bg-atc-green/80 cursor-pointer"
              >
                ADD TO AIRSPACE
              </button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.aircraft.map(aircraft => (
            <div key={aircraft.id} className="bg-atc-darker/90 border border-atc-green/30 rounded-lg p-4">
              {editingId === aircraft.id ? (
                <>
                  <h3 className="text-atc-green font-bold mb-3">Edit {aircraft.id}</h3>
                  <input type="number" id={`alt-${aircraft.id}`} defaultValue={aircraft.altitude} className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 mb-2" placeholder="Altitude" />
                  <input type="number" id={`spd-${aircraft.id}`} defaultValue={aircraft.speed} className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 mb-2" placeholder="Speed" />
                  <input type="number" id={`hdg-${aircraft.id}`} defaultValue={aircraft.heading} className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 mb-2" placeholder="Heading" />
                  <div className="flex space-x-2">
                    <button onClick={() => {
                      const newAlt = parseInt(document.getElementById(`alt-${aircraft.id}`).value);
                      const newSpd = parseInt(document.getElementById(`spd-${aircraft.id}`).value);
                      const newHdg = parseInt(document.getElementById(`hdg-${aircraft.id}`).value);
                      handleUpdate(aircraft.id, { altitude: newAlt, speed: newSpd, heading: newHdg });
                    }} className="flex-1 bg-atc-green text-black py-1 rounded">Save</button>
                    <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-600 py-1 rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-atc-green font-bold text-lg">{aircraft.id}</h3>
                    <div className="space-x-2">
                      <button onClick={() => setEditingId(aircraft.id)} className="text-xs px-2 py-1 bg-blue-600 rounded">Edit</button>
                      <button onClick={() => handleRemove(aircraft.id)} className="text-xs px-2 py-1 bg-red-600 rounded">Remove</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Position:<br/><span className="font-mono">({Math.floor(aircraft.x)}, {Math.floor(aircraft.y)})</span></div>
                    <div>Altitude:<br/><span className="font-mono">{Math.floor(aircraft.altitude)} ft</span></div>
                    <div>Speed:<br/><span className="font-mono">{aircraft.speed} kts</span></div>
                    <div>Heading:<br/><span className="font-mono">{aircraft.heading}°</span></div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {state.aircraft.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No aircraft in airspace. Create a flight plan to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightPlan;