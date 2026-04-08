import React, { useState } from 'react';
import { useATC } from '../context/ATCContext';

const Aircraft = ({ aircraft, onClose }) => {
  const { dispatch } = useATC();
  const [isEditing, setIsEditing] = useState(false);
  const [editedAircraft, setEditedAircraft] = useState(aircraft);
  
  const handleUpdate = () => {
    dispatch({
      type: 'UPDATE_AIRCRAFT',
      payload: { id: aircraft.id, updates: editedAircraft },
    });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'UPDATE',
        message: `Aircraft ${aircraft.id} updated: Alt ${editedAircraft.altitude}ft, Speed ${editedAircraft.speed}kts, Heading ${editedAircraft.heading}°`,
        timestamp: new Date().toISOString(),
      },
    });
    setIsEditing(false);
  };
  
  const handleRemove = () => {
    dispatch({ type: 'REMOVE_AIRCRAFT', payload: aircraft.id });
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'REMOVE',
        message: `Aircraft ${aircraft.id} removed from airspace`,
        timestamp: new Date().toISOString(),
      },
    });
    if (onClose) onClose();
  };
  
  return (
    <div className="bg-atc-darker/90 border border-atc-green/30 rounded-lg p-4 mb-3">
      {!isEditing ? (
        <>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-atc-green font-bold text-lg">{aircraft.id}</h3>
            <div className="space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Edit
              </button>
              <button
                onClick={handleRemove}
                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
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
      ) : (
        <>
          <h3 className="text-atc-green font-bold mb-3">Edit {aircraft.id}</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-400">Altitude (ft)</label>
              <input
                type="number"
                value={editedAircraft.altitude}
                onChange={(e) => setEditedAircraft({ ...editedAircraft, altitude: parseInt(e.target.value) })}
                className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Speed (kts)</label>
              <input
                type="number"
                value={editedAircraft.speed}
                onChange={(e) => setEditedAircraft({ ...editedAircraft, speed: parseInt(e.target.value) })}
                className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Heading (°)</label>
              <input
                type="number"
                value={editedAircraft.heading}
                onChange={(e) => setEditedAircraft({ ...editedAircraft, heading: parseInt(e.target.value) })}
                className="w-full bg-black/50 border border-gray-600 rounded px-2 py-1 text-sm"
              />
            </div>
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleUpdate}
                className="flex-1 px-2 py-1 bg-atc-green text-black rounded text-sm font-bold"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-2 py-1 bg-gray-600 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Aircraft;