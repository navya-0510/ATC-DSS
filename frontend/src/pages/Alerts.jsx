import React, { useState } from 'react';
import { useATC } from '../context/ATCContext';
import { SEVERITY } from '../utils/constants';

const Alerts = () => {
  const { state, dispatch } = useATC();
  const [filter, setFilter] = useState('ALL');
  
  const filteredAlerts = state.alerts.filter(alert => {
    if (filter === 'ALL') return true;
    return alert.severity === filter;
  });
  
  const getSeverityColor = (severity) => {
    return SEVERITY[severity]?.color || '#gray';
  };
  
  const clearAllAlerts = () => {
    state.alerts.forEach(alert => {
      dispatch({ type: 'CLEAR_ALERT', payload: alert.id });
    });
  };
  
  return (
    <div className="p-6 h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-atc-green font-mono">⚠️ Alert History</h1>
          <button
            onClick={clearAllAlerts}
            className="px-4 py-2 bg-red-600/20 text-red-400 rounded-md text-sm font-mono hover:bg-red-600/30"
          >
            CLEAR ALL
          </button>
        </div>
        
        <div className="flex space-x-2 mb-4">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                filter === level
                  ? 'bg-atc-green text-black'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 bg-atc-darker/50 rounded-lg">
              <p className="text-gray-500">No alerts to display</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="bg-atc-darker/50 rounded-lg p-4 border-l-4"
                style={{ borderLeftColor: getSeverityColor(alert.severity) }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded"
                        style={{ backgroundColor: getSeverityColor(alert.severity), color: '#000' }}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm font-mono mb-2">{alert.message}</p>
                    <div className="flex space-x-2">
                      {alert.aircraft.map(ac => (
                        <span key={ac} className="text-xs bg-atc-green/20 text-atc-green px-2 py-0.5 rounded">
                          {ac}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'CLEAR_ALERT', payload: alert.id })}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;