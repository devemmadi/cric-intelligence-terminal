import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css'; // ఈ లైన్ యాడ్ చెయ్

// ఒక చిన్న Helper Component క్రియేట్ చేద్దాం
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // ఇది పేజీని ముందుకు పంపిస్తుంది

  const handleLogin = () => {
    setIsLoggedIn(true);
    navigate('/dashboard'); // లాగిన్ అవ్వగానే డ్యాష్‌బోర్డ్‌కి వెళ్తుంది
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route 
        path="/dashboard" 
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} 
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;