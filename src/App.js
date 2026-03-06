import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import CricIntelligence from './components/CricIntelligence';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CricIntelligence />} />
                <Route path="/dashboard" element={<CricIntelligence />} />
                <Route path="*" element={<CricIntelligence />} />
            </Routes>
        </Router>
    );
}

export default App;