import React from 'react';

const TerminalHeader = ({ activeTab, setActiveTab }) => {
    return (
        <header className="px-12 py-6 border-b-2 border-black/5 flex justify-between items-center bg-white">
            <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter text-black">
                CRIC<span className="text-[#D61C22]">INTELLIGENCE</span>
            </h1>
            <div className="flex gap-8 items-center">
                <nav className="flex gap-6">
                    {['ANALYTICS', 'NEWS', 'MEDIA'].map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)} 
                            className={`text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-[#D61C22] border-b-2 border-[#D61C22]' : 'opacity-20 hover:opacity-100'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
                <span className="text-[#D61C22] text-[10px] font-black animate-pulse uppercase tracking-tighter">
                    ● TERMINAL_ACTIVE
                </span>
            </div>
        </header>
    );
};

export default TerminalHeader;