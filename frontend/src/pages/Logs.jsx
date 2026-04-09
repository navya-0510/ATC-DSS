import React, { useState } from 'react';
import { useATC } from '../context/ATCContext';

const Logs = () => {
  const { state } = useATC();
  const [filter, setFilter] = useState('ALL');
  
  const getIcon = (type) => {
    switch(type) {
      case 'CONFLICT': return '🔴';
      case 'ACTION': return '✅';
      case 'ADD': return '➕';
      case 'REMOVE': return '➖';
      case 'UPDATE': return '📝';
      case 'SCAN': return '🔍';
      default: return 'ℹ️';
    }
  };
  
  const filtered = state.logs.filter(l => filter === 'ALL' || l.type === filter);
  
  return (
    <div className="p-6 h-screen overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-atc-green font-mono mb-6">📋 System Logs</h1>
        
        <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
          {['ALL', 'CONFLICT', 'ACTION', 'ADD', 'REMOVE', 'UPDATE', 'SCAN'].map(type => (
            <button key={type} onClick={() => setFilter(type)} className={`px-3 py-1 rounded-md text-xs ${filter === type ? 'bg-atc-green text-black' : 'bg-gray-700/50 text-gray-300'}`}>
              {type}
            </button>
          ))}
        </div>
        
        <div className="bg-atc-darker/50 rounded-lg border border-atc-green/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-atc-green/10 border-b border-atc-green/20">
                <tr><th className="text-left p-3 text-xs text-atc-green">TIME</th><th className="text-left p-3 text-xs text-atc-green">TYPE</th><th className="text-left p-3 text-xs text-atc-green">MESSAGE</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="3" className="text-center p-8 text-gray-500">No logs</td></tr>
                ) : (
                  filtered.map(log => (
                    <tr key={log.id} className="border-b border-gray-800 hover:bg-atc-green/5">
                      <td className="p-3 text-xs font-mono text-gray-400">{log.timestamp}</td>
                      <td className="p-3 text-xs"><span className="flex items-center space-x-1"><span>{getIcon(log.type)}</span><span>{log.type}</span></span></td>
                      <td className="p-3 text-sm font-mono">{log.message}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-right">Total: {state.logs.length} | Showing: {filtered.length}</div>
      </div>
    </div>
  );
};

export default Logs;