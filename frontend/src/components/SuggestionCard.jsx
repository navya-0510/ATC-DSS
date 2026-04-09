import React, { useState } from 'react';
import { useATC } from '../context/ATCContext';
import { useAuth } from '../context/AuthContext';
import { atcVoice } from '../utils/voiceAnnouncements';

const SuggestionCard = ({ suggestion, onApply }) => {
  const { dispatch } = useATC();
  const { user, overrideSuggestion } = useAuth();
  const [isApplying, setIsApplying] = useState(false);
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  
  const getIcon = () => {
    switch (suggestion.type) {
      case 'altitude': return '📈';
      case 'heading': return '🔄';
      case 'speed': return '⚡';
      default: return '💡';
    }
  };
  
  const getActionDescription = () => {
    switch (suggestion.type) {
      case 'altitude':
        return `Change altitude to avoid conflict`;
      case 'heading':
        return `Adjust heading for separation`;
      case 'speed':
        return `Modify speed for spacing`;
      default:
        return suggestion.reasoning;
    }
  };
  
  const handleApply = async () => {
    setIsApplying(true);
    
    const aircraftId = suggestion.aircraft;
    const action = suggestion.action;
    
    // ATC Voice Announcement
    if (action.includes('Descend')) {
      const match = action.match(/(\d+)/);
      if (match) {
        const newAltitude = parseInt(match[0]);
        atcVoice.announceResolution(aircraftId, 'altitude', newAltitude);
        
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { altitude: newAltitude },
          },
        });
      }
    } else if (action.includes('Climb')) {
      const match = action.match(/(\d+)/);
      if (match) {
        const newAltitude = parseInt(match[0]);
        atcVoice.announceResolution(aircraftId, 'altitude', newAltitude);
        
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { altitude: newAltitude },
          },
        });
      }
    } else if (action.includes('Turn right')) {
      const match = action.match(/(\d+)°/);
      if (match) {
        const newHeading = parseInt(match[0]);
        atcVoice.announceResolution(aircraftId, 'heading', `right ${newHeading} degrees`);
        
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { heading: newHeading },
          },
        });
      }
    } else if (action.includes('Turn left')) {
      const match = action.match(/(\d+)°/);
      if (match) {
        const newHeading = parseInt(match[0]);
        atcVoice.announceResolution(aircraftId, 'heading', `left ${newHeading} degrees`);
        
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { heading: newHeading },
          },
        });
      }
    } else if (action.includes('Reduce speed')) {
      const match = action.match(/(\d+)/);
      if (match) {
        const newSpeed = parseInt(match[0]);
        atcVoice.announceResolution(aircraftId, 'speed', newSpeed);
        
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { speed: newSpeed },
          },
        });
      }
    } else if (action.includes('Increase speed')) {
      const match = action.match(/(\d+)/);
      if (match) {
        const newSpeed = parseInt(match[0]);
        atcVoice.announceResolution(aircraftId, 'speed', newSpeed);
        
        dispatch({
          type: 'UPDATE_AIRCRAFT',
          payload: {
            id: aircraftId,
            updates: { speed: newSpeed },
          },
        });
      }
    }
    
    // Log the action with controller info
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'ACTION',
        message: `🎤 ATC: ${suggestion.action} for ${suggestion.aircraft} - Issued by ${user?.name || 'Controller'} (${user?.role || 'ATC'})`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    
    setTimeout(() => {
      setIsApplying(false);
      if (onApply) onApply(suggestion.id);
    }, 1000);
  };
  
  // OVERRIDE SUGGESTION - from class diagram
  const handleOverride = () => {
    if (!overrideReason.trim()) {
      alert('Please provide a reason for override');
      return;
    }
    
    // Call overrideSuggestion from AuthContext
    overrideSuggestion(suggestion.id, overrideReason);
    
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now(),
        type: 'OVERRIDE',
        message: `⚠️ Suggestion overridden by ${user?.name || 'Controller'} (${user?.role}). Reason: ${overrideReason}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    
    // Also log the original suggestion that was overridden
    dispatch({
      type: 'ADD_LOG',
      payload: {
        id: Date.now() + 1,
        type: 'OVERRIDE',
        message: `Original suggestion: ${suggestion.action} for ${suggestion.aircraft}`,
        timestamp: new Date().toLocaleTimeString(),
      },
    });
    
    setShowOverride(false);
    setOverrideReason('');
    
    if (onApply) onApply(suggestion.id);
  };
  
  return (
    <>
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
            
            <div className="flex space-x-2">
              <button
                onClick={handleApply}
                disabled={isApplying}
                className={`flex-1 text-xs px-3 py-2 rounded font-bold transition-all ${
                  isApplying 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-atc-green text-black hover:bg-atc-green/80'
                }`}
              >
                {isApplying ? '📢 ISSUING COMMAND...' : '🎤 ISSUE ATC COMMAND'}
              </button>
              
              <button
                onClick={() => setShowOverride(true)}
                className="px-3 py-2 bg-orange-600/20 text-orange-400 rounded text-xs font-bold hover:bg-orange-600/30 transition-all"
              >
                ⚠️ OVERRIDE
              </button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 italic">
              💡 Voice command will be announced to pilot
            </div>
          </div>
        </div>
      </div>
      
      {/* Override Modal - from class diagram */}
      {showOverride && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-atc-darker border border-orange-500/50 rounded-lg p-6 w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-orange-400 font-bold text-lg">Override Suggestion</h3>
              <button 
                onClick={() => setShowOverride(false)}
                className="text-gray-500 hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-300 mb-2">Original Suggestion:</p>
              <p className="text-sm font-mono text-atc-green bg-black/50 p-2 rounded">
                {suggestion.action}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs text-gray-400 mb-2">Reason for Override:</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g., Conflict resolved by other means, Different heading required due to weather, etc."
                className="w-full bg-black/50 border border-gray-600 rounded p-2 text-sm text-white"
                rows="4"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleOverride}
                className="flex-1 bg-orange-600 text-white py-2 rounded font-bold hover:bg-orange-700"
              >
                Confirm Override
              </button>
              <button
                onClick={() => setShowOverride(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded font-bold hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              <p>⚠️ Override will be logged for audit purposes</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SuggestionCard;