import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded valid controllers
  const validControllers = [
    { username: 'ATC001', password: 'control123', role: 'SUPERVISOR', sector: 'NORTH', name: 'John Smith' },
    { username: 'ATC002', password: 'control123', role: 'TOWER', sector: 'SOUTH', name: 'Sarah Johnson' },
    { username: 'ATC003', password: 'control123', role: 'GROUND', sector: 'EAST', name: 'Mike Davis' },
    { username: 'ATC004', password: 'control123', role: 'APPROACH', sector: 'WEST', name: 'Lisa Wong' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    console.log('Login attempt with:', username, password);
    
    // Simple timeout to show loading state
    setTimeout(() => {
      const controller = validControllers.find(
        c => c.username === username && c.password === password
      );
      
      console.log('Found controller:', controller);
      
      if (controller) {
        console.log('Login SUCCESS');
        onLogin(controller);
      } else {
        console.log('Login FAILED');
        setError('Invalid credentials. Use ATC001 / control123');
      }
      setIsLoading(false);
    }, 500);
  };

  // Quick login buttons for testing
  const quickLogin = (controller) => {
    setUsername(controller.username);
    setPassword(controller.password);
    setTimeout(() => {
      onLogin(controller);
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-atc-dark">
      <div className="bg-atc-darker/90 p-8 rounded-lg border border-atc-green/30 w-96">
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✈️</div>
          <h1 className="text-2xl font-bold text-atc-green">ATC-DSS Login</h1>
          <p className="text-gray-500 text-sm mt-2">Air Traffic Control System</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Controller ID</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-atc-green focus:outline-none"
              placeholder="ATC001"
              autoFocus
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-gray-600 rounded px-3 py-2 text-white focus:border-atc-green focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="mb-4 text-red-400 text-sm text-center bg-red-400/10 p-2 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 rounded font-bold transition-colors ${
              isLoading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-atc-green text-black hover:bg-atc-green/80'
            }`}
          >
            {isLoading ? 'LOGGING IN...' : 'LOGIN TO ATC SYSTEM'}
          </button>
        </form>
        
        {/* Quick Login Buttons for Testing */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center mb-3">Quick Login (Demo):</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => quickLogin(validControllers[0])}
              className="text-xs px-2 py-1 bg-atc-green/20 text-atc-green rounded hover:bg-atc-green/30"
            >
              ATC001 (Supervisor)
            </button>
            <button
              onClick={() => quickLogin(validControllers[1])}
              className="text-xs px-2 py-1 bg-atc-green/20 text-atc-green rounded hover:bg-atc-green/30"
            >
              ATC002 (Tower)
            </button>
            <button
              onClick={() => quickLogin(validControllers[2])}
              className="text-xs px-2 py-1 bg-atc-green/20 text-atc-green rounded hover:bg-atc-green/30"
            >
              ATC003 (Ground)
            </button>
            <button
              onClick={() => quickLogin(validControllers[3])}
              className="text-xs px-2 py-1 bg-atc-green/20 text-atc-green rounded hover:bg-atc-green/30"
            >
              ATC004 (Approach)
            </button>
          </div>
        </div>
        
        <div className="mt-4 text-center text-xs text-gray-500">
          <p>Manual Login:</p>
          <p className="font-mono">ATC001 / control123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;