import React from 'react';

const LiveSidebar = ({ matches, selectedMatch, setSelectedMatch }) => {
    return (
        <aside className="w-80 border-r-2 border-black/5 overflow-y-auto p-6 space-y-4 bg-[#FBFBFD]">
            <p className="text-[10px] font-black text-black/20 uppercase tracking-[0.3em] mb-6">Live Intel Feed</p>
            {matches.length > 0 ? matches.map((m, i) => (
                <div 
                    key={i} 
                    onClick={() => setSelectedMatch(m)} 
                    className={`p-5 rounded-[20px] cursor-pointer transition-all border-2 ${selectedMatch?.id === m.id ? 'bg-white shadow-xl border-[#D61C22]' : 'border-transparent opacity-40 hover:opacity-80'}`}
                >
                    <span className="text-[8px] font-black text-[#D61C22] uppercase tracking-widest">
                        {m.seriesName || "INTERNATIONAL"}
                    </span>
                    <h5 className="text-[14px] font-[1000] uppercase italic mt-1 text-black">
                        {m.team1} v {m.team2}
                    </h5>
                    <p className="text-[10px] font-bold opacity-30 mt-2 uppercase">{m.state || "LIVE"}</p>
                </div>
            )) : (
                <p className="text-[10px] font-black opacity-20 uppercase">Scanning for signals...</p>
            )}
        </aside>
    );
};

export default LiveSidebar;