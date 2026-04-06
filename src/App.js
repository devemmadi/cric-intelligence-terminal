/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CricIntelligence from './components/CricIntelligence';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import OddsCalculator from './components/OddsCalculator';
import AboutUs from './components/AboutUs';
import './App.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CricIntelligence />} />
                <Route path="/dashboard" element={<CricIntelligence />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsAndConditions />} />
                <Route path="/odds" element={<OddsCalculator />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="*" element={<CricIntelligence />} />
            </Routes>
        </Router>
    );
}

export default App;
