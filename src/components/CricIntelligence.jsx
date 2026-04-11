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
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
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
