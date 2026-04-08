import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ATCProvider } from './context/ATCContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import FlightPlan from './pages/FlightPlan';
import Alerts from './pages/Alerts';
import Logs from './pages/Logs';

function App() {
  return (
    <ATCProvider>
      <Router>
        <div className="h-screen flex flex-col bg-atc-dark overflow-hidden">
          <Navbar />
          <div className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flight-plan" element={<FlightPlan />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ATCProvider>
  );
}

export default App;