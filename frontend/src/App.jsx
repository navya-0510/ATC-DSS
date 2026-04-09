import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ATCProvider } from './context/ATCContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FlightPlan from './pages/FlightPlan';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';
import Login from './pages/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user session
    const savedUser = localStorage.getItem('atc_user');
    console.log('Saved user from localStorage:', savedUser);
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('User restored:', userData);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('atc_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log('Login successful:', userData);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('atc_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    console.log('Logging out');
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('atc_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-atc-dark">
        <div className="text-atc-green text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <ATCProvider>
        <Router>
          {!isAuthenticated ? (
            <Login onLogin={handleLogin} />
          ) : (
            <div className="h-screen flex flex-col bg-atc-dark overflow-hidden">
              <Navbar user={user} onLogout={handleLogout} />
              <div className="flex-1 overflow-hidden">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/flight-plan" element={<FlightPlan />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/logs" element={<Logs />} />
                </Routes>
              </div>
            </div>
          )}
        </Router>
      </ATCProvider>
    </AuthProvider>
  );
}

export default App;