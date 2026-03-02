import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TerminalHeader from './TerminalHeader';
import LiveSidebar from './LiveSidebar';
import CricinfoFeed from './CricinfoFeed';
import MediaTerminal from './MediaTerminal';

const Dashboard = () => {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [activeTab, setActiveTab] = useState('ANALYTICS');

    // AI Logic: Probability calculation based on scores
    const getWinProb = (s1, s2) => {
        const r1 = parseInt(s1) || 0;
        const r2 = parseInt(s2) || 0;
        if (r1 === 0 && r2 === 0) return 50;
        let p = Math.round((r1 / (r1 + r2)) * 100);
        return p > 95 ? 95 : p < 5 ? 5 : p;
    };

    const fetchIntel = async () => {
        try {
            const res = await axios.get('http://localhost:5145/api/Prediction/live-matches');
            if (res.data && res.data.typeMatches) {
                let allMatches = [];
                res.data.typeMatches.forEach(type => {
                    type.seriesMatches?.forEach(series => {
                        series.seriesAdWrapper?.matches?.forEach(m => {
                            allMatches.push({
                                id: m.matchInfo.matchId,
                                team1: m.matchInfo.team1.teamName,
                                team2: m.matchInfo.team2.teamName,
                                seriesName: m.matchInfo.seriesName,
                                status: m.matchInfo.status,
                                state: m.matchInfo.state,
                                score1: m.matchScore?.team1Score?.inngs1?.runs || 0,
                                score2: m.matchScore?.team2Score?.inngs1?.runs || 0,
                                prob: getWinProb(m.matchScore?.team1Score?.inngs1?.runs, m.matchScore?.team2Score?.inngs1?.runs)
                            });
                        });
                    });
                });
                setMatches(allMatches);
                if (allMatches.length > 0 && !selectedMatch) setSelectedMatch(allMatches[0]);
            }
        } catch (e) {
            console.log("Syncing with Local Intel...");
        }
    };

    useEffect(() => {
        fetchIntel();
        const timer = setInterval(fetchIntel, 30000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="h-screen bg-white text-black font-sans overflow-hidden flex flex-col">
            {/* Header Section */}
            <TerminalHeader activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar Section */}
                <LiveSidebar 
                    matches={matches} 
                    selectedMatch={selectedMatch} 
                    setSelectedMatch={setSelectedMatch} 
                />

                {/* Main Content Area */}
                <section className="flex-1 p-12 overflow-y-auto bg-white">
                    
                    {activeTab === 'ANALYTICS' && (
                        selectedMatch ? (
                            <div className="space-y-16 animate-fadeIn">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-6">
                                        <h2 className="text-7xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">
                                            {selectedMatch.team1} <br/> 
                                            <span className="text-gray-200 text-5xl">VS</span> <br/> 
                                            {selectedMatch.team2}
                                        </h2>
                                        <div className="flex gap-4">
                                            <div className="bg-black text-white px-6 py-3 rounded-2xl shadow-2xl">
                                                <p className="text-[8px] font-black opacity-50 uppercase tracking-widest">Live Execution</p>
                                                <p className="text-2xl font-[1000] italic">{selectedMatch.score1} - {selectedMatch.score2}</p>
                                            </div>
                                            <div className="border-2 border-black/5 px-6 py-3 rounded-2xl flex items-center text-center">
                                                <p className="text-[10px] font-black uppercase italic text-[#D61C22]">{selectedMatch.status}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[12px] font-black text-[#D61C22] uppercase italic tracking-[0.2em]">AI Win Prob.</p>
                                        <h2 className="text-[140px] font-[1000] text-[#D61C22] italic leading-[0.7] tracking-tighter">
                                            {selectedMatch.prob}%
                                        </h2>
                                    </div>
                                </div>

                                {/* Trading Box */}
                                <div className="p-12 bg-black text-white rounded-[50px] flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                                    <div>
                                        <h4 className="text-4xl font-[1000] italic uppercase leading-none">Execute Trade</h4>
                                        <p className="opacity-40 text-[10px] font-bold uppercase mt-3 tracking-[0.3em]">Signal Confidence: High // Market Ready</p>
                                    </div>
                                    <button className="bg-[#D61C22] px-14 py-6 rounded-3xl font-[1000] uppercase italic tracking-[0.2em] text-sm hover:scale-105 active:scale-95 transition-all shadow-xl">
                                        Execute £
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-4xl font-[1000] italic uppercase opacity-10">Waiting for Data Signal...</p>
                            </div>
                        )
                    )}

                    {activeTab === 'NEWS' && <CricinfoFeed />}

                    {activeTab === 'MEDIA' && <MediaTerminal />}

                </section>
            </main>
        </div>
    );
};

export default Dashboard;