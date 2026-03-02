import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [activeTab, setActiveTab] = useState('ANALYTICS'); // ANALYTICS, NEWS, MEDIA

    // Cricinfo News Data
    const cricinfoNews = [
        {
            id: 1,
            title: "Pitch Analysis: Why the cracks at Oval might favor Ashwin",
            excerpt: "Local curators suggest the dry heat has opened up the surface earlier than expected...",
            url: "https://www.espncricinfo.com/story/pitch-analysis-oval-test-match-1399124",
            source: "ESPN CRICINFO",
            time: "12 MINS AGO"
        },
        {
            id: 2,
            title: "Kohli's tactical masterstroke in the second session",
            excerpt: "The shift in field placements led to three quick wickets before tea...",
            url: "https://www.espncricinfo.com/story/virat-kohli-captaincy-tactics-analysis-1399200",
            source: "ESPN CRICINFO",
            time: "1 HOUR AGO"
        }
    ];

    const fetchIntel = async () => {
        try {
            const res = await axios.get('http://localhost:5145/api/Prediction/live-matches');
            // API నుండి డేటా వస్తే మ్యాపింగ్
            if (res.data && res.data.typeMatches) {
                let all = [];
                res.data.typeMatches.forEach(t => {
                    t.seriesMatches?.forEach(s => {
                        s.seriesAdWrapper?.matches?.forEach(m => {
                            all.push({
                                id: m.matchInfo.matchId,
                                team1: m.matchInfo.team1.teamName,
                                team2: m.matchInfo.team2.teamName,
                                series: m.matchInfo.seriesName,
                                status: m.matchInfo.status,
                                state: m.matchInfo.state,
                                score1: m.matchScore?.team1Score?.inngs1?.runs || 0,
                                score2: m.matchScore?.team2Score?.inngs1?.runs || 0,
                                prob: 68 // Static AI Prob for now
                            });
                        });
                    });
                });
                setMatches(all);
                if (all.length > 0 && !selectedMatch) setSelectedMatch(all[0]);
            }
        } catch (e) { console.log("API Waiting... Static mode active."); }
    };

    useEffect(() => { fetchIntel(); }, []);

    return (
        <div className="h-screen bg-white text-black font-sans overflow-hidden flex flex-col">
            {/* HEADER */}
            <header className="px-12 py-8 border-b-4 border-black flex justify-between items-center bg-white z-10">
                <h1 className="text-5xl font-[1000] italic uppercase tracking-tighter">CRIC<span className="text-[#D61C22]">INTELLIGENCE</span></h1>
                <nav className="flex gap-10">
                    {['ANALYTICS', 'NEWS', 'MEDIA'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} 
                            className={`text-[12px] font-black uppercase tracking-[0.3em] ${activeTab === tab ? 'text-[#D61C22] border-b-2 border-[#D61C22]' : 'opacity-20'}`}>
                            {tab}
                        </button>
                    ))}
                    <span className="text-[#D61C22] text-[12px] font-black animate-pulse uppercase">● UK_TERMINAL_ACTIVE</span>
                </nav>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* SIDEBAR */}
                <aside className="w-80 border-r-4 border-black overflow-y-auto p-6 space-y-4 bg-[#F2F2F2]">
                    <p className="text-[10px] font-[1000] opacity-30 uppercase tracking-[0.4em] mb-6">Live Stream Intel</p>
                    {matches.length > 0 ? matches.map((m, i) => (
                        <div key={i} onClick={() => setSelectedMatch(m)} 
                             className={`p-6 rounded-[25px] cursor-pointer transition-all border-2 ${selectedMatch?.id === m.id ? 'bg-white border-black shadow-2xl scale-105' : 'border-transparent opacity-40 hover:opacity-100'}`}>
                            <span className="text-[8px] font-black text-[#D61C22] uppercase tracking-widest">{m.series}</span>
                            <h5 className="text-[16px] font-[1000] uppercase italic mt-1 leading-tight">{m.team1} <br/> vs {m.team2}</h5>
                        </div>
                    )) : <p className="text-[10px] font-bold opacity-20 uppercase">Scanning for matches...</p>}
                </aside>

                {/* MAIN CONTENT */}
                <section className="flex-1 p-14 overflow-y-auto">
                    {activeTab === 'ANALYTICS' && selectedMatch && (
                        <div className="space-y-16">
                            <div className="flex justify-between items-start">
                                <div className="space-y-6">
                                    <h2 className="text-8xl font-[1000] italic uppercase leading-[0.75] tracking-tighter">
                                        {selectedMatch.team1} <br/> <span className="text-gray-200 text-5xl">VS</span> <br/> {selectedMatch.team2}
                                    </h2>
                                    <div className="flex gap-4">
                                        <div className="bg-black text-white px-6 py-3 rounded-2xl">
                                            <p className="text-[8px] font-black opacity-50 uppercase tracking-widest">Weather & Pitch</p>
                                            <p className="text-sm font-bold uppercase italic">24°C London | Dry Surface, Heavy Cracks</p>
                                        </div>
                                        <div className="border-2 border-black px-6 py-3 rounded-2xl flex items-center">
                                            <span className="text-[10px] font-[1000] uppercase italic">{selectedMatch.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[14px] font-[1000] text-[#D61C22] uppercase italic tracking-widest">AI Win Prob.</p>
                                    <h2 className="text-[160px] font-[1000] text-[#D61C22] italic leading-[0.7] tracking-tighter">{selectedMatch.prob}%</h2>
                                </div>
                            </div>

                            {/* MEME & AI IMAGE SECTION */}
                            <div className="grid grid-cols-2 gap-8 mt-12">
                                <div className="bg-gray-100 rounded-[40px] aspect-video overflow-hidden border-2 border-black/5 relative group">
                                    <img src="https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=600" alt="Cricket" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    <div className="absolute top-4 left-6 bg-black text-white text-[8px] font-black px-3 py-1 uppercase italic">AI_VISUAL_01</div>
                                </div>
                                <div className="bg-black text-white rounded-[40px] p-10 flex flex-col justify-center italic">
                                    <p className="text-[#D61C22] text-[10px] font-black uppercase tracking-[0.5em] mb-4">Meme of the Match</p>
                                    <h4 className="text-3xl font-[1000] uppercase leading-tight">"Batsman: *Exists* <br/> The Pitch: 'I'm about to end this man's whole career.'"</h4>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'NEWS' && (
                        <div className="max-w-4xl space-y-4">
                            {cricinfoNews.map((news) => (
                                <div key={news.id} onClick={() => window.open(news.url, '_blank')} className="group p-10 border-b-4 border-black hover:bg-[#F2F2F2] cursor-pointer transition-all flex justify-between items-center">
                                    <div className="space-y-4">
                                        <div className="flex gap-4 items-center">
                                            <span className="text-[10px] font-black text-[#D61C22] uppercase tracking-[0.3em]">{news.source}</span>
                                            <span className="text-[10px] font-bold opacity-30 uppercase">{news.time}</span>
                                        </div>
                                        <h3 className="text-4xl font-[1000] italic uppercase leading-none group-hover:text-[#D61C22]">"{news.title}"</h3>
                                        <p className="text-sm opacity-50 uppercase font-bold max-w-2xl leading-relaxed">{news.excerpt}</p>
                                    </div>
                                    <span className="text-5xl font-black opacity-10 group-hover:opacity-100 transition-all">→</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* EXECUTION BUTTON */}
                    <div className="mt-16 p-12 bg-black text-white rounded-[60px] flex justify-between items-center">
                        <div>
                            <h4 className="text-4xl font-[1000] italic uppercase leading-none tracking-tighter">Execute Trade Signal</h4>
                            <p className="text-green-400 text-[10px] font-black uppercase mt-3 tracking-[0.4em]">Intelligence Verified • High Probability Entry</p>
                        </div>
                        <button className="bg-[#D61C22] px-16 py-7 rounded-[30px] font-black uppercase italic tracking-[0.3em] text-lg hover:scale-110 active:scale-95 transition-all shadow-[-15px_15px_0px_rgba(214,28,34,0.3)]">
                            Execute £
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;