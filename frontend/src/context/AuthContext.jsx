import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const validControllers = [
  { username: 'ATC001', password: 'control123', role: 'SUPERVISOR', sector: 'NORTH', name: 'John Smith' },
  { username: 'ATC002', password: 'control123', role: 'TOWER', sector: 'SOUTH', name: 'Sarah Johnson' },
  { username: 'ATC003', password: 'control123', role: 'GROUND', sector: 'EAST', name: 'Mike Davis' },
  { username: 'ATC004', password: 'control123', role: 'APPROACH', sector: 'WEST', name: 'Lisa Wong' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (username, password) => {
    const controller = validControllers.find(
      c => c.username === username && c.password === password
    );
    
    if (controller) {
      setUser(controller);
      setIsAuthenticated(true);
      localStorage.setItem('atc_user', JSON.stringify(controller));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('atc_user');
  };

  // From Class Diagram: overrideSuggestion()
  const overrideSuggestion = (suggestionId, reason) => {
    console.log(`Controller ${user?.username} (${user?.role}) overrode suggestion ${suggestionId}. Reason: ${reason}`);
    // You can also log this to your backend or add to alerts
    return true;
  };

  // From Class Diagram: respondToAlert()
  const respondToAlert = (alertId, response) => {
    console.log(`Controller ${user?.username} responded to alert ${alertId} with: ${response}`);
    return true;
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('atc_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      logout, 
      overrideSuggestion,
      respondToAlert 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};