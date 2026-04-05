import React from 'react';

const MediaTerminal = () => {
    // ఇవి ప్రస్తుతానికి స్టాటిక్, తర్వాత API కనెక్ట్ చేయొచ్చు
    const weather = { temp: "11°C", condition: "CLOUDY", location: "HARROGATE, UK" };
    const pitch = "GREEN TOP. EXPECT SEAM MOVEMENT IN SESSION 1.";
    
    const memes = [
        { id: 1, text: "When you realize the pitch has more turns than a Christopher Nolan movie", type: "MEME_INTEL" },
        { id: 2, url: "https://via.placeholder.com/600x400?text=AI+MATCH+VISUAL", type: "AI_GENERATION" }
    ];

    return (
        <div className="space-y-12 animate-fadeIn max-w-6xl">
            {/* WEATHER & PITCH SECTION */}
            <div className="grid grid-cols-2 gap-8">
                <div className="p-10 border-2 border-black rounded-[40px] bg-black text-white">
                    <p className="text-[10px] font-black opacity-50 uppercase tracking-[0.4em] mb-4">Atmospheric Conditions</p>
                    <h3 className="text-6xl font-[1000] italic leading-none">{weather.temp}</h3>
                    <p className="text-xl font-black italic uppercase mt-2">{weather.condition} // {weather.location}</p>
                </div>
                
                <div className="p-10 border-2 border-black rounded-[40px] flex flex-col justify-center">
                    <p className="text-[10px] font-black text-[#D61C22] uppercase tracking-[0.4em] mb-4">Surface Intelligence</p>
                    <h4 className="text-2xl font-[1000] italic uppercase leading-tight italic">"{pitch}"</h4>
                </div>
            </div>

            {/* MEMES & AI VISUALS */}
            <div className="space-y-6">
                <p className="text-[10px] font-black opacity-20 uppercase tracking-[0.5em]">Media & Visual Signals</p>
                <div className="grid grid-cols-2 gap-8">
                    {memes.map((item) => (
                        <div key={item.id} className="group relative bg-[#FBFBFD] border-2 border-black/5 rounded-[40px] overflow-hidden aspect-video flex items-center justify-center p-8">
                            {item.url ? (
                                <img src={item.url} alt="AI Visual" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-all" />
                            ) : (
                                <h4 className="text-3xl font-[1000] italic uppercase text-center leading-none">"{item.text}"</h4>
                            )}
                            <span className="absolute top-6 left-6 text-[8px] font-black bg-black text-white px-2 py-1 uppercase">{item.type}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* About Us */}
        <div style={{ marginTop: 32, padding: 24, background: '#0d1b2e', border: '1px solid #1e3a5f', borderRadius: 10 }}>
            <div style={{ color: '#C8961E', fontSize: 12, letterSpacing: 2, marginBottom: 16, fontFamily: 'monospace' }}>ABOUT US</div>
            <p style={{ color: '#8899aa', fontSize: 13, lineHeight: 1.8, margin: '0 0 16px' }}>
                CricIntelligence is an AI-powered cricket prediction platform built on 1.7 million historical matches across 877 venues.
                We provide live win probability, pitch analysis, weather impact, and over-by-over predictions for IPL and international cricket.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', background: '#1a2940', borderRadius: 8, border: '1px solid #2a3f5f' }}>
                <span style={{ color: '#C8961E', fontSize: 16 }}>✉️</span>
                <div>
                    <div style={{ color: '#8899aa', fontSize: 10, letterSpacing: 1, marginBottom: 2 }}>CONTACT</div>
                    <a href="mailto:emmadi.dev@gmail.com" style={{ color: '#00d4ff', fontSize: 14, textDecoration: 'none', fontFamily: 'monospace' }}>
                        emmadi.dev@gmail.com
                    </a>
                </div>
            </div>
        </div>

    </div>
    );
};

export default MediaTerminal;