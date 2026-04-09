import React, { useState } from 'react';
import { useATC } from '../context/ATCContext';

const Alerts = () => {
  const { state, dispatch } = useATC();
  const [filter, setFilter] = useState('ALL');
  
  const filtered = state.alerts.filter(a => filter === 'ALL' || a.severity === filter);
  
  const getColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return 'text-red-400 border-red-500';
      case 'HIGH': return 'text-orange-400 border-orange-500';
      case 'MEDIUM': return 'text-yellow-400 border-yellow-500';
      default: return 'text-blue-400 border-blue-500';
    }
  };
  
  return (
    <div className="p-6 h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-atc-green font-mono">⚠️ Alert History</h1>
          <button onClick={() => dispatch({ type: 'CLEAR_ALL_ALERTS' })} className="px-4 py-2 bg-red-600/20 text-red-400 rounded-md text-sm">CLEAR ALL</button>
        </div>
        
        <div className="flex space-x-2 mb-4">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
            <button key={level} onClick={() => setFilter(level)} className={`px-3 py-1 rounded-md text-xs ${filter === level ? 'bg-atc-green text-black' : 'bg-gray-700/50 text-gray-300'}`}>
              {level}
            </button>
          ))}
        </div>
        
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-atc-darker/50 rounded-lg"><p className="text-gray-500">No alerts</p></div>
          ) : (
            filtered.map(alert => (
              <div key={alert.id} className={`bg-atc-darker/50 rounded-lg p-4 border-l-4 ${getColor(alert.severity)}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${getColor(alert.severity)} bg-opacity-20`}>{alert.severity}</span>
                      <span className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm font-mono mb-2">{alert.message}</p>
                    <div className="flex space-x-2">
                      {alert.aircraft?.map(ac => <span key={ac} className="text-xs bg-atc-green/20 text-atc-green px-2 py-0.5 rounded">{ac}</span>)}
                    </div>
                  </div>
                  <button onClick={() => dispatch({ type: 'CLEAR_ALERT', payload: alert.id })} className="text-gray-500 hover:text-gray-300">✕</button>
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