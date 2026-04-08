import React, { useState } from 'react';
import { useATC } from '../context/ATCContext';

const FlightPlan = () => {
  const { state, dispatch } = useATC();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState(null);
  const [newAircraft, setNewAircraft] = useState({
    id: '',
    x: 600,
    y: 400,
    altitude: 35000,
    speed: 450,
    heading: 0,
  });
  
  const handleAddAircraft = () => {
    if (!newAircraft.id) {
      alert('Please enter an aircraft ID');
      return;
    }
    
    dispatch({ type: 'ADD_AIRCRAFT', payload: newAircraft });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'ADD',
        message: `✈️ Aircraft ${newAircraft.id} added via flight plan`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    
    setNewAircraft({
      id: '',
      x: Math.random() * 800 + 200,
      y: Math.random() * 500 + 150,
      altitude: 35000,
      speed: 450,
      heading: 0,
    });
    setShowAddForm(false);
  };
  
  const handleRemoveAircraft = (aircraftId) => {
    if (window.confirm(`Are you sure you want to remove ${aircraftId}?`)) {
      dispatch({ type: 'REMOVE_AIRCRAFT', payload: aircraftId });
      dispatch({
        type: 'ADD_LOG',
        payload: {
          id: Date.now(),
          type: 'REMOVE',
          message: `❌ Aircraft ${aircraftId} removed from airspace`,
          timestamp: new Date().toLocaleTimeString(),
        },
      });
    }
  };
  
  const handleUpdateAircraft = (aircraft, updates) => {
    dispatch({
      type: 'UPDATE_AIRCRAFT',
      payload: { id: aircraft.id, updates: updates },
    });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'UPDATE',
        message: `📝 Aircraft ${aircraft.id} updated`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    setEditingAircraft(null);
  };
  
  return (
    <div className="p-6 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-atc-green font-mono">✈️ Flight Plan Management</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-atc-green text-black rounded-md font-bold hover:bg-atc-green/80 transition-colors cursor-pointer"
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
                <label className="block text-xs text-gray-400 mb-1">Initial X Position</label>
                <input
                  type="number"
                  value={newAircraft.x}
                  onChange={(e) => setNewAircraft({ ...newAircraft, x: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Initial Y Position</label>
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
                onClick={handleAddAircraft}
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
              {editingAircraft === aircraft.id ? (
                <>
                  <h3 className="text-atc-green font-bold mb-3">Edit {aircraft.id}</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-400">Altitude (ft)</label>
                      <input
                        type="number"
                        id={`alt-${aircraft.id}`}
                        defaultValue={aircraft.altitude}
                        className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Speed (kts)</label>
                      <input
                        type="number"
                        id={`speed-${aircraft.id}`}
                        defaultValue={aircraft.speed}
                        className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Heading (°)</label>
                      <input
                        type="number"
                        id={`heading-${aircraft.id}`}
                        defaultValue={aircraft.heading}
                        className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button
                        onClick={() => {
                          const newAltitude = parseInt(document.getElementById(`alt-${aircraft.id}`).value);
                          const newSpeed = parseInt(document.getElementById(`speed-${aircraft.id}`).value);
                          const newHeading = parseInt(document.getElementById(`heading-${aircraft.id}`).value);
                          handleUpdateAircraft(aircraft, { altitude: newAltitude, speed: newSpeed, heading: newHeading });
                        }}
                        className="flex-1 px-2 py-1 bg-atc-green text-black rounded text-sm font-bold cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingAircraft(null)}
                        className="flex-1 px-2 py-1 bg-gray-600 rounded text-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-atc-green font-bold text-lg">{aircraft.id}</h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => setEditingAircraft(aircraft.id)}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleRemoveAircraft(aircraft.id)}
                        className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Position:</span>
                      <br />
                      <span className="font-mono">({Math.floor(aircraft.x)}, {Math.floor(aircraft.y)})</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Altitude:</span>
                      <br />
                      <span className="font-mono">{Math.floor(aircraft.altitude)} ft</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Speed:</span>
                      <br />
                      <span className="font-mono">{aircraft.speed} kts</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Heading:</span>
                      <br />
                      <span className="font-mono">{aircraft.heading}°</span>
                    </div>
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