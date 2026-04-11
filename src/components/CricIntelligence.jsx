/* eslint-disable */
import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";
import { C, GLOBAL_CSS } from "./shared/constants";
import useMatchData from "./hooks/useMatchData";
import PredictionsTab from "./predictions/PredictionsTab";
import MatchesTab from "./matches/MatchesTab";
import MediaSection from "./MediaSection";
import PitchTab from "./pitch/PitchTab";

export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("predict");
    const [liveTime, setLiveTime] = useState(new Date());

    const { liveMatches, selectedMatch, selectMatch, pred, liveStatus, isFirstLoad, isPredLoading } = useMatchData();

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);

    useEffect(() => {
        document.body.style.background = activeTab === "pitch" ? "#0A0E1A" : C.bg;
        return () => { document.body.style.background = ""; };
    }, [activeTab]);

    useEffect(() => {
        if (pred?.team1 && pred?.team2) {
            const t1 = pred.team1.split(",")[0].trim();
            const t2 = pred.team2.split(",")[0].trim();
            const prob = pred.aiProbability || 50;
            document.title = `${t1} vs ${t2} — AI: ${prob}% Win Probability | CricIntelligence`;
        } else {
            document.title = "CricIntelligence - AI Cricket Predictions | Free IPL 2026";
        }
    }, [pred?.team1, pred?.team2, pred?.aiProbability]);

    // When user clicks a match in Matches tab → go to Predictions tab
    const handleMatchClick = (m) => {
        selectMatch(m);
        setActiveTab("predict");
        window.scrollTo(0, 0);
    };

    const CSS = GLOBAL_CSS(C);

    return (
        <div style={{ minHeight: "100vh", background: activeTab === "pitch" ? "#0A0E1A" : C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>

            {/* NAV */}
            <nav style={{ background: C.navy, borderBottom: `1px solid ${C.navyLight}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <div onClick={() => { setActiveTab("predict"); window.scrollTo(0, 0); }} style={{ cursor: "pointer" }}>
                    <Logo href="/" />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {[["predict", "Predictions"], ["matches", "Matches"], ["pitch", "Pitch 🏟️"], ["media", "Media"], ["odds", "Odds 🎲"]].map(([k, l]) => (
                        <button key={k} className={`tab-btn ${activeTab === k ? "on" : ""}`}
                            onClick={() => { if (k === "odds") { window.location.href = "/odds"; } else { setActiveTab(k); } }}>
                            {l}
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: liveStatus === "live" ? C.green : C.amber, animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                </div>
            </nav>

            {/* HERO TAGLINE BAR — only on predict tab when no match selected */}
            {activeTab === "predict" && !selectedMatch && (
                <div style={{ background: "linear-gradient(90deg, #0D1B2A, #1A2744)", borderBottom: "1px solid #1E293B", padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 11, color: "rgba(226,232,240,0.7)", fontWeight: 500 }}>AI-powered cricket predictions. Live. Free.</span>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[["🏏", "IPL 2026 Live"], ["🤖", "ML Predictions"], ["📊", "Venue Data — 7,500+ matches"]].map(([icon, label]) => (
                            <span key={label} style={{ fontSize: 11, color: "rgba(226,232,240,0.6)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "3px 10px" }}>
                                {icon} {label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* TABS */}
            {activeTab === "predict" && (
                <PredictionsTab
                    liveMatches={liveMatches}
                    selectedMatch={selectedMatch}
                    onMatchSelect={handleMatchClick}
                    pred={pred}
                    liveStatus={liveStatus}
                    isFirstLoad={isFirstLoad}
                    isPredLoading={isPredLoading}
                />
            )}
            {activeTab === "matches" && (
                <MatchesTab
                    liveMatches={liveMatches}
                    onMatchClick={handleMatchClick}
                />
            )}
            {activeTab === "pitch" && (
                <PitchTab
                    pred={pred}
                    selectedMatch={selectedMatch}
                    liveMatches={liveMatches}
                    onMatchSelect={handleMatchClick}
                />
            )}
            {activeTab === "media" && <MediaSection />}

            <RGFooter />

            {/* MOBILE BOTTOM NAV */}
            <nav className="mn">
                {[["Predictions", "predict"], ["Matches", "matches"], ["Pitch", "pitch"], ["Media", "media"]].map(([label, key]) => (
                    <button key={key} className="mt" onClick={() => setActiveTab(key)} style={{ opacity: activeTab === key ? 1 : 0.4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
