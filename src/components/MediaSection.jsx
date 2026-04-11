/* eslint-disable */
import React from "react";

const C2 = { navy: "#1E2D6B", muted: "#64748B", text: "#0A0A0A", accent: "#1E2D6B" };

const fallbackNews = [
    { tag: "IPL 2026", title: "IPL 2026: Full schedule and match predictions", time: "2h ago", url: "https://www.espncricinfo.com", source: "ESPNcricinfo" },
    { tag: "T20", title: "NZ vs SA T20I series - match preview and predictions", time: "3h ago", url: "https://www.cricbuzz.com", source: "Cricbuzz" },
    { tag: "ANALYSIS", title: "How AI is transforming cricket match predictions", time: "6h ago", url: "https://cricintelligence.com", source: "CricIntelligence" },
    { tag: "WOMEN", title: "Australia Women dominate WI series - key stats", time: "1d ago", url: "https://www.espncricinfo.com", source: "ESPNcricinfo" },
    { tag: "IPL", title: "IPL 2026 schedule: Complete fixtures and venues", time: "1d ago", url: "https://www.iplt20.com", source: "IPL Official" },
    { tag: "STATS", title: "T20 death over specialists - top bowlers in 2025", time: "2d ago", url: "https://www.cricbuzz.com", source: "Cricbuzz" },
];

export default function MediaSection() {
    const tagColors = {
        "IPL 2026": ["#1E2D6B", "#EFF6FF"], "T20": ["#185FA5", "#E6F1FB"],
        "ANALYSIS": ["#854F0B", "#FAEEDA"], "WOMEN": ["#6B21A8", "#F3E8FF"],
        "IPL": ["#1E2D6B", "#EFF6FF"], "STATS": ["#166534", "#DCFCE7"]
    };
    const thumbColors = ["#1E2D6B", "#185FA5", "#854F0B", "#166534", "#6B21A8", "#A32D2D"];

    return (
        <div className="fade" style={{ maxWidth: 680, margin: "0 auto", padding: "22px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Cricket News and Insights</div>
                <div style={{ fontSize: 11, color: C2.muted }}>Updated live</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {[
                    { label: "ESPNcricinfo", url: "https://www.espncricinfo.com/cricket-news" },
                    { label: "Cricbuzz", url: "https://www.cricbuzz.com/cricket-news" },
                    { label: "ICC", url: "https://www.icc-cricket.com/media-releases" },
                    { label: "IPL Official", url: "https://www.iplt20.com/news" },
                ].map(({ label, url }) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer"
                        style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, background: C2.navy, color: "#fff", textDecoration: "none", fontWeight: 600 }}>
                        {label}
                    </a>
                ))}
            </div>
            {fallbackNews.map(({ tag, title, time, url, source }, i) => {
                const [tc, tbg] = tagColors[tag] || ["#64748B", "#F1F5F9"];
                return (
                    <a key={i} href={url || "#"} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                        <div className="card" style={{ padding: 0, marginBottom: 10, cursor: "pointer", display: "flex", overflow: "hidden", minHeight: 80 }}>
                            <div style={{ width: 80, minWidth: 80, background: thumbColors[i % thumbColors.length], display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                                <div style={{ fontSize: 20 }}>🏏</div>
                                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", textAlign: "center", padding: "0 4px" }}>{source}</div>
                            </div>
                            <div style={{ padding: "12px 14px", flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: tc, background: tbg, padding: "2px 8px", borderRadius: 4 }}>{tag}</span>
                                    <span style={{ fontSize: 10, color: C2.muted }}>{time}</span>
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.45, color: C2.text }}>{title}</div>
                                <div style={{ fontSize: 11, color: C2.accent, marginTop: 5, fontWeight: 500 }}>Read more →</div>
                            </div>
                        </div>
                    </a>
                );
            })}
        </div>
    );
}
