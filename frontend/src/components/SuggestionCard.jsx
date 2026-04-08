import React from 'react';
import { useATC } from '../context/ATCContext';

const SuggestionCard = ({ suggestion, onApply }) => {
  const { dispatch } = useATC();
  
  const getIcon = () => {
    switch (suggestion.type) {
      case 'altitude': return '📈';
      case 'heading': return '🔄';
      case 'speed': return '⚡';
      default: return '💡';
    }
  };
  
  const handleApply = () => {
    const aircraftId = suggestion.aircraft;
    const action = suggestion.action;
    
    if (action.includes('Descend')) {
      const match = action.match(/(\d+)/);
      if (match) {
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { altitude: parseInt(match[0]) },
          },
        });
      }
    } else if (action.includes('Climb')) {
      const match = action.match(/(\d+)/);
      if (match) {
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { altitude: parseInt(match[0]) },
          },
        });
      }
    } else if (action.includes('Turn right')) {
      const match = action.match(/(\d+)°/);
      if (match) {
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { heading: parseInt(match[0]) },
          },
        });
      }
    } else if (action.includes('Turn left')) {
      const match = action.match(/(\d+)°/);
      if (match) {
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { heading: parseInt(match[0]) },
          },
        });
      }
    }
    
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'ACTION',
        message: `✅ Applied: ${suggestion.action}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    
    if (onApply) onApply(suggestion.id);
  };
  
  return (
    <div className="bg-gradient-to-r from-atc-darker to-atc-dark border border-atc-green/30 rounded-lg p-3 mb-2 hover:border-atc-green/60 transition-all">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-atc-green font-bold text-sm">
              Priority {suggestion.priority}
            </span>
            <span className="text-xs text-gray-500">
              Change: {suggestion.deviation} units
            </span>
          </div>
          <p className="text-sm font-mono text-white mb-1">{suggestion.action}</p>
          <p className="text-xs text-gray-400 mb-2">{suggestion.reasoning}</p>
          <button
            onClick={handleApply}
            className="w-full text-xs px-3 py-2 bg-atc-green text-black rounded hover:bg-atc-green/80 transition-colors font-bold"
          >
            APPLY RESOLUTION
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;