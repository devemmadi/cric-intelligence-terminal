import React from 'react';

const CricinfoFeed = () => {
    const news = [
        {
            id: 1,
            title: "KL Rahul to lead India in upcoming ODI series against Australia",
            excerpt: "The selection committee has named a 15-member squad with several senior players rested...",
            url: "https://www.espncricinfo.com/story/kl-rahul-to-lead-india-in-odi-series-vs-australia-1399124",
            source: "ESPN CRICINFO",
            time: "10 MINS AGO"
        },
        {
            id: 2,
            title: "Pitch Report: Why the Perth surface might favor extra bounce this time",
            excerpt: "Curators suggest the new moisture levels have altered the soil behavior...",
            url: "https://www.espncricinfo.com/story/perth-pitch-report-test-match-analysis-1399200",
            source: "ESPN CRICINFO",
            time: "2 HOURS AGO"
        }
    ];

    return (
        <div className="space-y-10 max-w-5xl animate-fadeIn">
            <div className="flex justify-between items-end mb-8">
                <h3 className="text-5xl font-[1000] italic uppercase tracking-tighter">Intel Reports</h3>
                <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.5em]">Global Aggregator</p>
            </div>

            {news.map((article) => (
                <div 
                    key={article.id} 
                    onClick={() => window.open(article.url, '_blank')} 
                    className="group p-10 border-b-2 border-black/5 hover:bg-[#FBFBFD] transition-all cursor-pointer flex justify-between items-center"
                >
                    <div className="space-y-4 flex-1">
                        <div className="flex gap-4 items-center">
                            <span className="text-[10px] font-black text-[#D61C22] bg-[#D61C22]/5 px-2 py-1 rounded-md uppercase tracking-widest">{article.source}</span>
                            <span className="text-[10px] font-black opacity-20 uppercase">{article.time}</span>
                        </div>
                        <h4 className="text-3xl font-[1000] italic uppercase leading-none group-hover:text-[#D61C22] transition-colors">
                            "{article.title}"
                        </h4>
                        <p className="text-sm font-medium text-black/40 uppercase tracking-tight max-w-2xl">
                            {article.excerpt}
                        </p>
                    </div>
                    <div className="text-4xl font-[1000] opacity-10 group-hover:opacity-100 group-hover:translate-x-2 transition-all">→</div>
                </div>
            ))}
        </div>
    );
};

export default CricinfoFeed;