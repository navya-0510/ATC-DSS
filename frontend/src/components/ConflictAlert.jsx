import React from 'react';

const ConflictAlert = ({ alert, onDismiss }) => {
  const getSeverityStyle = (severity) => {
    switch(severity) {
      case 'CRITICAL':
        return { bg: 'bg-red-600/20', border: 'border-red-600', text: 'text-red-400', label: '🔴 CRITICAL' };
      case 'HIGH':
        return { bg: 'bg-orange-600/20', border: 'border-orange-600', text: 'text-orange-400', label: '🟠 HIGH' };
      case 'MEDIUM':
        return { bg: 'bg-yellow-600/20', border: 'border-yellow-600', text: 'text-yellow-400', label: '🟡 MEDIUM' };
      default:
        return { bg: 'bg-blue-600/20', border: 'border-blue-600', text: 'text-blue-400', label: '🔵 LOW' };
    }
  };
  
  const style = getSeverityStyle(alert.severity);
  
  return (
    <div className={`${style.bg} border-l-4 ${style.border} rounded-r-lg p-3 mb-2 animate-pulse`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`text-xs font-bold ${style.text}`}>
              {style.label}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(alert.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm font-mono text-white mb-2">{alert.message}</p>
          <div className="flex space-x-2">
            {alert.aircraft.map(ac => (
              <span key={ac} className="text-xs bg-atc-green/20 text-atc-green px-2 py-1 rounded font-mono">
                ✈️ {ac}
              </span>
            ))}
          </div>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className="text-gray-500 hover:text-gray-300 ml-2 text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ConflictAlert;