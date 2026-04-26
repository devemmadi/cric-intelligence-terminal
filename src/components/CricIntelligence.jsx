/* eslint-disable */
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import RGFooter from "./RGFooter";
import { C, GLOBAL_CSS } from "./shared/constants";
import useMatchData from "./hooks/useMatchData";
import PredictionsTab from "./predictions/PredictionsTab";
import MatchesTab from "./matches/MatchesTab";
import MediaSection from "./MediaSection";
import PitchTab from "./pitch/PitchTab";
import NotifyButton from "./shared/NotifyButton";
import TrackRecord from "./TrackRecord";
import ErrorBoundary from "./shared/ErrorBoundary";

// Inject canonical tag dynamically so each page gets the right one
function setCanonical(url) {
    let el = document.querySelector("link[rel='canonical']");
    if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
    el.setAttribute("href", url);
}

export default function CricIntelligence() {
    const [searchParams, setSearchParams] = useSearchParams();
    const VALID_TABS = ["predict", "matches", "pitch", "record", "media"];
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTabState] = useState(
        VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "predict"
    );
    const [liveTime, setLiveTime] = useState(new Date());
    const [moreOpen, setMoreOpen] = useState(false);
    const navigate = useNavigate();
    const [installPrompt, setInstallPrompt] = useState(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    // Capture the browser's "Add to Home Screen" prompt
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
            // Only show banner if not already installed and not dismissed before
            const dismissed = localStorage.getItem('ci_install_dismissed');
            if (!dismissed) setShowInstallBanner(true);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const setActiveTab = (tab) => {
        setActiveTabState(tab);
        if (tab === "predict") {
            setSearchParams({}, { replace: true });
        } else {
            setSearchParams({ tab }, { replace: true });
        }
    };

    const { liveMatches, selectedMatch, selectMatch, pred, liveStatus, isFirstLoad, isPredLoading } = useMatchData();

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);
    // Close "More" dropdown when clicking outside
    useEffect(() => {
        if (!moreOpen) return;
        const handler = () => setMoreOpen(false);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, [moreOpen]);

    // Set canonical for main app — always points to homepage
    useEffect(() => { setCanonical("https://www.cricintelligence.com/"); }, []);

    useEffect(() => {
        document.body.style.background = (activeTab === "pitch" || activeTab === "record") ? "#0A0E1A" : C.bg;
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

    // When user clicks a match → go to Predictions tab
    const handleMatchClick = (m) => {
        const wasOnDifferentTab = activeTab !== "predict";
        selectMatch(m);
        setActiveTab("predict");
        // Only scroll to top if switching from a different tab, not sidebar clicks
        if (wasOnDifferentTab) window.scrollTo(0, 0);
    };

    const CSS = GLOBAL_CSS(C);

    return (
        <div style={{ minHeight: "100vh", background: (activeTab === "pitch" || activeTab === "record") ? "#0A0E1A" : C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>

            {/* NAV */}
            <nav style={{ background: C.navy, borderBottom: `1px solid ${C.navyLight}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <div onClick={() => { setActiveTab("predict"); window.scrollTo(0, 0); }} style={{ cursor: "pointer" }}>
                    <Logo href="/" />
                </div>
                <div style={{ display: "flex", gap: 2, alignItems: "center", position: "relative" }}>
                    {/* Primary tabs — always visible */}
                    {[["predict", "Predictions"], ["matches", "Matches"]].map(([k, label]) => (
                        <button key={k} className={`tab-btn ${activeTab === k ? "on" : ""}`}
                            onClick={() => { setActiveTab(k); setMoreOpen(false); }}>
                            <span>{label}</span>
                        </button>
                    ))}
                    {/* More ▾ dropdown for secondary tabs */}
                    <div style={{ position: "relative" }}>
                        <button
                            className={`tab-btn ${["pitch","record","media","odds"].includes(activeTab) ? "on" : ""}`}
                            onClick={(e) => { e.stopPropagation(); setMoreOpen(o => !o); }}
                            style={{ gap: 4 }}>
                            <span>More</span>
                            <span style={{ fontSize: 9, opacity: 0.7 }}>{moreOpen ? "▲" : "▼"}</span>
                        </button>
                        {moreOpen && (
                            <div onClick={(e) => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#1E2D6B", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, overflow: "hidden", zIndex: 200, minWidth: 140, boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
                                {[["pitch", "🏟️", "Pitch Analysis"], ["record", "📊", "Track Record"], ["media", "📰", "Media"], ["odds", "🎲", "Odds"]].map(([k, icon, label]) => (
                                    <button key={k}
                                        onClick={() => { if (k === "odds") { navigate("/odds"); setMoreOpen(false); } else { setActiveTab(k); setMoreOpen(false); } }}
                                        style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 16px", background: activeTab === k ? "rgba(255,255,255,0.1)" : "none", border: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === k ? 700 : 500, color: activeTab === k ? "#fff" : "rgba(255,255,255,0.65)", fontFamily: "Inter, system-ui", textAlign: "left" }}>
                                        <span>{icon}</span><span>{label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <NotifyButton />
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: liveStatus === "live" ? C.green : C.amber, animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                    </div>
                </div>
            </nav>


            {/* Add to Home Screen banner */}
            {showInstallBanner && (
                <div style={{ background: "#1E2D6B", borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>🏏</span>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Add to Home Screen</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Get live match alerts &amp; quick access</div>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => { localStorage.setItem('ci_install_dismissed', '1'); setShowInstallBanner(false); }}
                            style={{ background: "none", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "5px 10px", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, system-ui" }}>
                            Not now
                        </button>
                        <button onClick={() => {
                            if (installPrompt) {
                                installPrompt.prompt();
                                installPrompt.userChoice.then(() => { setInstallPrompt(null); setShowInstallBanner(false); });
                            }
                        }}
                            style={{ background: C.gold, border: "none", borderRadius: 8, padding: "5px 14px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "Inter, system-ui" }}>
                            Install
                        </button>
                    </div>
                </div>
            )}

            {/* TABS */}
            {activeTab === "predict" && (
                <ErrorBoundary label="Predictions">
                    <PredictionsTab
                        liveMatches={liveMatches}
                        selectedMatch={selectedMatch}
                        onMatchSelect={handleMatchClick}
                        pred={pred}
                        liveStatus={liveStatus}
                        isFirstLoad={isFirstLoad}
                        isPredLoading={isPredLoading}
                    />
                </ErrorBoundary>
            )}
            {activeTab === "matches" && (
                <ErrorBoundary label="Matches">
                    <MatchesTab
                        liveMatches={liveMatches}
                        onMatchClick={handleMatchClick}
                    />
                </ErrorBoundary>
            )}
            {activeTab === "pitch" && (
                <ErrorBoundary label="Pitch">
                    <PitchTab
                        pred={pred}
                        selectedMatch={selectedMatch}
                        liveMatches={liveMatches}
                        onMatchSelect={handleMatchClick}
                    />
                </ErrorBoundary>
            )}
            {activeTab === "media" && <ErrorBoundary label="Media"><MediaSection /></ErrorBoundary>}
            {activeTab === "record" && <ErrorBoundary label="Record"><TrackRecord /></ErrorBoundary>}

            <RGFooter />

            {/* MOBILE BOTTOM NAV */}
            <nav className="mn">
                {[["Predictions", "predict"], ["Matches", "matches"], ["Pitch", "pitch"], ["Record", "record"], ["Media", "media"]].map(([label, key]) => (
                    <button key={key} className="mt" onClick={() => setActiveTab(key)} style={{ opacity: activeTab === key ? 1 : 0.4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}
