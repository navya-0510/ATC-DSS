import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useATC } from '../context/ATCContext';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();
  const { state, dispatch } = useATC();
  
  const navItems = [
    { path: '/', label: 'RADAR', icon: '🛰️' },
    { path: '/flight-plan', label: 'FLIGHT PLAN', icon: '✈️' },
    { path: '/alerts', label: 'ALERTS', icon: '⚠️' },
    { path: '/logs', label: 'LOGS', icon: '📋' },
  ];
  
  return (
    <nav className="bg-atc-darker border-b border-atc-green/30 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-atc-green font-bold text-xl font-mono">
            ATC-DSS
            <span className="text-xs ml-2 text-gray-500">v2.0</span>
          </div>
          <div className="h-6 w-px bg-atc-green/30"></div>
          <div className="flex space-x-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-md text-sm font-mono transition-all ${
                  location.pathname === item.path
                    ? 'bg-atc-green/20 text-atc-green border border-atc-green/50'
                    : 'text-gray-400 hover:text-atc-green hover:bg-atc-green/10'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Info */}
          {user && (
            <div className="flex items-center space-x-3 border-r border-atc-green/30 pr-4">
              <div className="text-right">
                <div className="text-xs text-gray-400">
                  👤 {user.name}
                </div>
                <div className="text-xs">
                  <span className="text-atc-green">{user.role}</span>
                  <span className="text-gray-500 mx-1">|</span>
                  <span className="text-yellow-500">Sector: {user.sector}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="text-xs px-2 py-1 bg-red-600/20 text-red-400 rounded hover:bg-red-600/30"
              >
                Logout
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">SIM SPEED</span>
            <select
              value={state.simulationSpeed}
              onChange={(e) => dispatch({ type: 'SET_SPEED', payload: parseFloat(e.target.value) })}
              className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-xs text-atc-green font-mono"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
            </select>
          </div>
          
          <button
            onClick={() => dispatch({ type: 'SET_SIMULATION', payload: !state.isSimulating })}
            className={`px-3 py-1 rounded-md text-xs font-mono ${
              state.isSimulating
                ? 'bg-red-600/20 text-red-400 border border-red-600/50'
                : 'bg-atc-green/20 text-atc-green border border-atc-green/50'
            }`}
          >
            {state.isSimulating ? '⏸️ PAUSE' : '▶️ START'}
          </button>
          
          <div className="text-xs text-gray-500 font-mono">
            AIRCRAFT: <span className="text-atc-green font-bold">{state.aircraft.length}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;