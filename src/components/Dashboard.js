import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

function Dashboard() {
    const [match, setMatch] = useState(null);
    const [history, setHistory] = useState([]);

    const fetchData = async () => {
        try {
            const res = await fetch('http://localhost:5145/api/Prediction/live-match');
            const data = await res.json();

            setMatch(data);
            // గ్రాఫ్ కోసం హిస్టరీ సేవ్ చేయడం
            setHistory(prev => [...prev.slice(-10), { time: new Date().toLocaleTimeString(), runs: data.score }]);

            // వాయిస్ అలర్ట్ (స్కోర్ మారినప్పుడు)
            if (match && data.score !== match.score) {
                const msg = new SpeechSynthesisUtterance(`Score updated to ${data.score}`);
                window.speechSynthesis.speak(msg);
            }
        } catch (err) { console.log("Offline"); }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 10000);
        return () => clearInterval(timer);
    }, [match]);

    if (!match) return <div>Connecting to Stadium...</div>;

    return (
        <div style={{ backgroundColor: '#0f172a', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
            <header style={{ textAlign: 'center', borderBottom: '2px solid #334155', paddingBottom: '20px' }}>
                <h1 style={{ color: '#38bdf8' }}>🏏 AI CRICKET TRACKER</h1>
                <h3>{match.team1} <span style={{ color: '#f43f5e' }}>vs</span> {match.team2}</h3>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px' }}>
                {/* Score Card */}
                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
                    <p>CURRENT SCORE</p>
                    <h2 style={{ fontSize: '48px', margin: '10px 0', color: '#fbbf24' }}>{match.displayScore}</h2>
                    <p style={{ color: '#94a3b8' }}>{match.aiWeather}</p>
                </div>

                {/* AI Predictor */}
                <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px' }}>
                    <p>AI WIN PROBABILITY</p>
                    <h2 style={{ fontSize: '36px', color: '#10b981' }}>{match.aiProbability}%</h2>
                    <div style={{ width: '100%', backgroundColor: '#334155', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${match.aiProbability}%`, backgroundColor: '#10b981', height: '100%', transition: '0.5s' }}></div>
                    </div>
                </div>
            </div>

            {/* Live Graph */}
            <div style={{ marginTop: '30px', backgroundColor: '#1e293b', padding: '20px', borderRadius: '15px' }}>
                <p>RUNS TREND (LIVE)</p>
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="time" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                        <Line type="monotone" dataKey="runs" stroke="#38bdf8" strokeWidth={3} dot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Dashboard;