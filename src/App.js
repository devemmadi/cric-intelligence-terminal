/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CricIntelligence from './components/CricIntelligence';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsAndConditions from './components/TermsAndConditions';
import OddsCalculator from './components/OddsCalculator';
import AboutUs from './components/AboutUs';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import InternationalPredictionPage from './components/InternationalPredictionPage';
import CricketPredictionsUK from './components/CricketPredictionsUK';
import AgeGate from './components/AgeGate';
import IPL2026Predictions from './components/IPL2026Predictions';
import CricketWinProbability from './components/CricketWinProbability';
import T20Predictions from './components/T20Predictions';
import MatchPredictionPage from './components/MatchPredictionPage';
import AccuracyDashboard from './components/AccuracyDashboard';
import './App.css';

function App() {
    return (
        <AgeGate>
            <Router>
                <Routes>
                    <Route path="/" element={<CricIntelligence />} />
                    <Route path="/dashboard" element={<CricIntelligence />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/odds" element={<OddsCalculator />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/how-it-works" element={<HowItWorks />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/predictions/ipl-2026" element={<IPL2026Predictions />} />
                    <Route path="/predictions/cricket-win-probability" element={<CricketWinProbability />} />
                    <Route path="/predictions/t20-predictions" element={<T20Predictions />} />
                    <Route path="/predictions/international/:matchup" element={<InternationalPredictionPage />} />
                    <Route path="/cricket-predictions-uk" element={<CricketPredictionsUK />} />
                    <Route path="/accuracy" element={<AccuracyDashboard />} />
                    <Route path="/predictions/:matchup" element={<MatchPredictionPage />} />
                    <Route path="*" element={<CricIntelligence />} />
                </Routes>
            </Router>
        </AgeGate>
    );
}

export default App;
