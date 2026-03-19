/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "https://cricintel-backend-production.up.railway.app";

const C = {
    bg: "#EEF2FF", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B", accent: "#1E2D6B",
    green: "#00B894", red: "#E53E3E", amber: "#F59E0B", gold: "#C8961E",
    navy: "#1E2D6B", navyMid: "#2A3F82", navyLight: "#4A5FAD",
};

const MOCK_MATCHES = [
    { id: 1, t1: "INDIA", t2: "AUSTRALIA", status: "LIVE", day: "T20", detail: "2nd T20I · Wankhede", t1Score: 156, t2Score: null, t1Wkts: 3, matchId: null },
    { id: 2, t1: "ENGLAND", t2: "PAKISTAN", status: "UPCOMING", day: "ODI", detail: "1st ODI · Lord's", t1Score: null, t2Score: null, matchId: null },
    { id: 3, t1: "NZ", t2: "SA", status: "UPCOMING", day: "TEST", detail: "Cape Town · Day 1", t1Score: null, t2Score: null, matchId: null },
];

function cleanTeam(name) {
    if (!name) return "";
    const shorts = { "south africa": "SA", "new zealand": "NZ", "west indies": "WI", "sri lanka": "SL", "united arab emirates": "UAE" };
    const n = name.split(",")[0].trim();
    const key = n.toLowerCase();
    if (shorts[key]) return shorts[key];
    if (n.length > 12) return n.split(" ").filter(w => w.length > 1).map(w => w[0]).join("").toUpperCase();
    return n.toUpperCase();
}

const BASE_LOGO = "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/db/PICTURES/CMS";
const TEAM_LOGOS = {
    "india": BASE_LOGO + "/381800/381895.png",
    "australia": BASE_LOGO + "/382700/382733.png",
    "england": BASE_LOGO + "/381800/381894.png",
    "pakistan": BASE_LOGO + "/381800/381891.png",
    "new zealand": BASE_LOGO + "/340500/340503.png",
    "nz": BASE_LOGO + "/340500/340503.png",
    "south africa": BASE_LOGO + "/340400/340493.png",
    "sa": BASE_LOGO + "/340400/340493.png",
    "sri lanka": BASE_LOGO + "/340500/340505.png",
    "sl": BASE_LOGO + "/340500/340505.png",
    "west indies": BASE_LOGO + "/317600/317615.png",
    "wi": BASE_LOGO + "/317600/317615.png",
    "bangladesh": BASE_LOGO + "/341400/341456.png",
    "afghanistan": BASE_LOGO + "/381800/381893.png",
    "ireland": BASE_LOGO + "/349300/349350.png",
    "zimbabwe": BASE_LOGO + "/383900/383967.png",
};

const FLAG_CODES = { "india": "in", "australia": "au", "england": "gb-eng", "pakistan": "pk", "new zealand": "nz", "south africa": "za", "sri lanka": "lk", "west indies": "bb", "bangladesh": "bd" };

const TEAM_COLORS = { "tasmania": "#1B5E99", "queensland": "#8B0000", "victoria": "#002B5C", "western australia": "#C8961E" };

function TeamLogo({ name, size = 32 }) {
    const [errorLevel, setErrorLevel] = useState(0);
    const key = (name || "").toLowerCase().trim();
    const hsciUrl = TEAM_LOGOS[key];
    const flagCode = FLAG_CODES[key];
    const flagUrl = flagCode ? `https://flagcdn.com/w80/${flagCode}.png` : null;
    const abbr = cleanTeam(name).slice(0, 3);
    const hue = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    let src = null;
    if (errorLevel === 0 && hsciUrl) src = hsciUrl;
    else if (errorLevel <= 1 && flagUrl) src = flagUrl;
    const handleError = () => setErrorLevel(prev => prev + 1);
    useEffect(() => { setErrorLevel(0); }, [name]);
    if (!src || errorLevel >= 2) {
        const teamBg = TEAM_COLORS[key] || `hsl(${hue},65%,38%)`;
        return (
            <div style={{ width: size, height: size, borderRadius: "50%", background: teamBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}>
                <span style={{ fontFamily: "Inter, system-ui", fontSize: size * 0.32, fontWeight: 700, color: "#fff" }}>{abbr}</span>
            </div>
        );
    }
    return (
        <img src={src} alt={name} onError={handleError}
            style={{ width: size, height: size, objectFit: "contain", borderRadius: errorLevel === 1 ? "4px" : "50%", background: "#fff", padding: errorLevel === 1 ? 0 : 2, flexShrink: 0, border: `1px solid ${C.border}` }} />
    );
}

function WinArc({ value }) {
    const r = 54, cx = 64, cy = 64, circ = Math.PI * r;
    // Fix: rounding the display value to 1 decimal place
    const displayValue = Number(value).toFixed(1);
    const pct = Math.min(Math.max(value, 0), 100) / 100;
    const color = value >= 65 ? C.green : value >= 45 ? C.amber : C.red;
    return (
        <svg width={128} height={80} viewBox="0 0 128 80">
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={C.border} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.text} fontFamily="Inter, system-ui">{displayValue}%</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill={C.muted} fontFamily="Inter, system-ui" letterSpacing={1}>WIN PROB</text>
        </svg>
    );
}

function NextOverIntelligence({ pred }) {
    if (!pred || !pred.nextOvers || pred.nextOvers.length < 2) return null;
    const ov1 = pred.nextOvers[0];
    const ov2 = pred.nextOvers[1];
    const detr = pred.deteriorationFactor || 1.0;
    const spinBoost = Math.round((detr - 1.0) * 100);
    const dewSoon = pred.weatherImpact?.dewFactor < 0.9;
    const pitchCond = pred.pitchCondition || "FRESH";
    const history = pred.overHistory || [];
    
    // UI Helpers
    const bowlerQuality = pred.bowlingFactor ? (pred.bowlingFactor <= 0.82 ? "Elite" : pred.bowlingFactor <= 0.92 ? "Good" : "Average") : "Average";
    const batQuality = pred.battingFactor ? (pred.battingFactor >= 1.15 ? "Strong" : pred.battingFactor >= 0.95 ? "Average" : "Weak") : "Average";
    const wicketColor1 = ov1.wicketProb > 40 ? "#A32D2D" : ov1.wicketProb > 25 ? "#BA7517" : "#3B6D11";
    
    return (
        <div style={{ padding:"0 0 4px 0", marginBottom:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#E24B4A" }}/>
                <span style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>Next over intelligence</span>
                <span style={{ fontSize:12, color:"#64748B" }}>Over {ov1.over} · {ov1.phase}</span>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
                <div style={{ background:"#fff", border:"2px solid #378ADD", borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:8, textTransform:"uppercase" }}>Over {ov1.over} — now</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
                        <span style={{ fontSize:28, fontWeight:500, color:"#0A0A0A" }}>{ov1.runRange}</span>
                        <span style={{ fontSize:13, color:"#64748B" }}>runs expected</span>
                    </div>
                    <div style={{ background:"#EEF2FF", borderRadius:8, padding:"8px 10px", marginBottom:10 }}>
                        <div style={{ fontSize:11, color:"#64748B", marginBottom:3 }}>Bowling quality</div>
                        <div style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>{bowlerQuality}</div>
                        {/* Fix: Rounding bowling factor */}
                        <div style={{ fontSize:12, color:"#64748B" }}>Factor {Number(pred.bowlingFactor || 1.0).toFixed(2)}</div>
                    </div>
                </div>

                <div style={{ background:"#fff", border:"0.5px solid #E2E8F0", borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:8, textTransform:"uppercase" }}>Over {ov2.over}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
                        <span style={{ fontSize:28, fontWeight:500, color:"#0A0A0A" }}>{ov2.runRange}</span>
                        <span style={{ fontSize:13, color:"#64748B" }}>runs expected</span>
                    </div>
                    <div style={{ background:"#EEF2FF", borderRadius:8, padding:"8px 10px", marginBottom:10 }}>
                        <div style={{ fontSize:11, color:"#64748B", marginBottom:3 }}>Batting quality</div>
                        <div style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>{batQuality}</div>
                        {/* Fix: Rounding batting factor */}
                        <div style={{ fontSize:12, color:"#64748B" }}>Factor {Number(pred.battingFactor || 1.0).toFixed(2)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function BettingInsights({ pred }) {
    const [manualOdds, setManualOdds] = React.useState({ team1: "", team2: "" });
    const [history, setHistory] = React.useState(() => {
        try { return JSON.parse(localStorage.getItem("ci_pred_history") || "[]"); } catch { return []; }
    });

    const prob = pred?.aiProbability || 50;
    const team1 = pred?.team1 || "Team 1";
    const team2 = pred?.team2 || "Team 2";
    const prob2 = 100 - prob;

    // Value bet calculation — CRITICAL DECIMAL FIXES HERE
    const calcValue = (aiProb, oddsInput) => {
        const o = parseFloat(oddsInput);
        if (!o || o <= 1) return null;
        const impliedProb = (1 / o) * 100;
        const edge = aiProb - impliedProb;
        const ev = (aiProb / 100) * (o - 1) - (1 - aiProb / 100);
        
        return { 
            // Fix: All floating point errors rounded for Royal display
            impliedProb: impliedProb.toFixed(1), 
            edge: edge.toFixed(1), 
            ev: ev.toFixed(3), 
            isValue: edge > 2 
        };
    };

    const v1 = calcValue(prob, manualOdds.team1);
    const v2 = calcValue(prob2, manualOdds.team2);

    // Track record calculation — DECIMAL BUG FIX
    const correctCount = history.filter(h => h.correct).length;
    const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0;

    return (
        <div style={{ maxWidth:680, margin:"0 auto", padding:"22px 16px", fontFamily: "Inter, sans-serif" }}>
            <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Betting Insights</div>
                <div style={{ fontSize:13, color:"#64748B" }}>AI-powered value identification · 18+ · Gamble responsibly</div>
            </div>

            {/* 1. Value Bet Calculator */}
            <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:16, padding:20, marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#64748B", letterSpacing:1, marginBottom:14 }}>⚡ VALUE BET CALCULATOR</div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                    <div style={{ padding:12, background:"#EEF2FF", borderRadius:10 }}>
                        <div style={{ fontSize:11, color:"#64748B", marginBottom:4 }}>{team1} AI Win%</div>
                        <div style={{ fontSize:18, fontWeight:700, color:"#1E2D6B", marginBottom:8 }}>{prob.toFixed(1)}%</div>
                        <input
                            type="number" placeholder="Enter odds"
                            value={manualOdds.team1}
                            onChange={e => setManualOdds(p => ({...p, team1: e.target.value}))}
                            style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #E2E8F0", fontSize:13 }}
                        />
                        {v1 && (
                            <div style={{ marginTop:8, padding:"8px 10px", borderRadius:8, background: v1.isValue ? "#e8f5ee" : "#fff0f0" }}>
                                <div style={{ fontSize:11, fontWeight:700, color: v1.isValue ? "#00B894" : "#E53E3E" }}>
                                    {v1.isValue ? "✅ VALUE BET" : "❌ NO VALUE"}
                                </div>
                                <div style={{ fontSize:10, color:"#64748B" }}>Implied: {v1.impliedProb}% · Edge: {v1.edge}%</div>
                            </div>
                        )}
                    </div>

                    <div style={{ padding:12, background:"#EEF2FF", borderRadius:10 }}>
                        <div style={{ fontSize:11, color:"#64748B", marginBottom:4 }}>{team2} AI Win%</div>
                        <div style={{ fontSize:18, fontWeight:700, color:"#1E2D6B", marginBottom:8 }}>{prob2.toFixed(1)}%</div>
                        <input
                            type="number" placeholder="Enter odds"
                            value={manualOdds.team2}
                            onChange={e => setManualOdds(p => ({...p, team2: e.target.value}))}
                            style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:"1px solid #E2E8F0", fontSize:13 }}
                        />
                        {v2 && (
                            <div style={{ marginTop:8, padding:"8px 10px", borderRadius:8, background: v2.isValue ? "#e8f5ee" : "#fff0f0" }}>
                                <div style={{ fontSize:11, fontWeight:700, color: v2.isValue ? "#00B894" : "#E53E3E" }}>
                                    {v2.isValue ? "✅ VALUE BET" : "❌ NO VALUE"}
                                </div>
                                <div style={{ fontSize:10, color:"#64748B" }}>Implied: {v2.impliedProb}% · Edge: {v2.edge}%</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. Track Record Section */}
            <div style={{ background:"#1E2D6B", borderRadius:16, padding:20, color:"#fff" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                        <div style={{ fontSize:11, fontWeight:700, opacity:0.8, letterSpacing:1 }}>AI TRACK RECORD</div>
                        <div style={{ fontSize:24, fontWeight:800, marginTop:4 }}>{accuracy}% <span style={{ fontSize:14, fontWeight:400, opacity:0.7 }}>Accuracy</span></div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:18, fontWeight:700 }}>{history.length}</div>
                        <div style={{ fontSize:10, opacity:0.8 }}>PREDICTIONS</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BettingInsights; // Example export
