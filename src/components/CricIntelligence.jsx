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
const MOCK_PRED = {
    team1: "India", team2: "Australia", venue: "Wankhede Stadium, Mumbai",
    score: 156, wickets: 3, overs: 14.2, matchType: "t20",
    displayScore: "156/3 (14.2 ov)", aiProbability: 72,
    currentRunRate: 10.9, requiredRunRate: 0,
    pitchLabel: "DRY / SPIN", pitchCondition: "SHOWING WEAR",
    currentPhase: "MIDDLE OVERS", phaseEmoji: "🟡",
    strengths: ["SOLID OPENING STAND", "FAST BOWLING PACE", "SPIN CONTROL"],
    weaknesses: ["VULNERABLE TO SHORT BALL", "DEATH RUN LEAKAGE", "UNSTABLE MID ORDER"],
    nextOvers: [
        { over: 15, phase: "MIDDLE OVERS", expectedRuns: 9.2, wicketProb: 22, confidence: 85, runRange: "7–11", tip: "🟡 Build platform heading into death overs. Target 10 runs minimum." },
        { over: 16, phase: "DEATH OVERS", expectedRuns: 10.8, wicketProb: 32, confidence: 77, runRange: "9–13", tip: "🔴 Death begins — high scoring expected. Yorkers key." },
        { over: 17, phase: "DEATH OVERS", expectedRuns: 11.5, wicketProb: 38, confidence: 69, runRange: "9–14", tip: "🔴 Slog overs — boundaries crucial. Spin bowlers under pressure." },
        { over: 18, phase: "DEATH OVERS", expectedRuns: 10.2, wicketProb: 42, confidence: 61, runRange: "8–13", tip: "⚠️ Wicket risk rising. Batters taking high-risk shots." },
        { over: 19, phase: "DEATH OVERS", expectedRuns: 12.0, wicketProb: 45, confidence: 53, runRange: "10–14", tip: "🔴 Final push — maximum attack. Expect big hits." },
    ],
    weather: { temp: 28, condition: "SUNNY" },
    weatherImpact: { tip: "Bright conditions favour batters.", emoji: "☀️" },
    dataSource: "877 venues · 1.7M records · 78.2% accuracy",
    overHistory: [{ over: 10, runs: 98 }, { over: 11, runs: 108 }, { over: 12, runs: 119 }, { over: 13, runs: 133 }, { over: 14, runs: 156 }],
    powerplay: { expectedScore: 58, expectedRR: 9.6, tip: "Strong powerplay — batting conditions ideal." },
    deathOvers: { expectedRR: 10.8, expectedRuns: 62, tip: "Death overs: expect 10.8 RR. Set a strong total." },
};

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
    "india":        BASE_LOGO + "/381800/381895.png",
    "australia":    BASE_LOGO + "/382700/382733.png",
    "england":      BASE_LOGO + "/381800/381894.png",
    "pakistan":     BASE_LOGO + "/381800/381891.png",
    "new zealand":  BASE_LOGO + "/340500/340503.png",
    "nz":           BASE_LOGO + "/340500/340503.png",
    "south africa": BASE_LOGO + "/340400/340493.png",
    "sa":           BASE_LOGO + "/340400/340493.png",
    "sri lanka":    BASE_LOGO + "/340500/340505.png",
    "sl":           BASE_LOGO + "/340500/340505.png",
    "west indies":  BASE_LOGO + "/317600/317615.png",
    "wi":           BASE_LOGO + "/317600/317615.png",
    "bangladesh":   BASE_LOGO + "/341400/341456.png",
    "afghanistan":  BASE_LOGO + "/381800/381893.png",
    "ireland":      BASE_LOGO + "/349300/349350.png",
    "zimbabwe":     BASE_LOGO + "/383900/383967.png",
    "india women":  BASE_LOGO + "/381800/381895.png",
    "australia women": BASE_LOGO + "/382700/382733.png",
    "england women": BASE_LOGO + "/381800/381894.png",
    "pakistan women": BASE_LOGO + "/381800/381891.png",
    "west indies women": BASE_LOGO + "/317600/317615.png",
    "new zealand women": BASE_LOGO + "/340500/340503.png",
    "south africa women": BASE_LOGO + "/340400/340493.png",
};

const FLAG_CODES = {
    "india": "in", "australia": "au", "england": "gb-eng", "pakistan": "pk",
    "new zealand": "nz", "nz": "nz", "south africa": "za", "sa": "za",
    "sri lanka": "lk", "sl": "lk", "west indies": "bb", "wi": "bb",
    "bangladesh": "bd", "afghanistan": "af", "ireland": "ie", "zimbabwe": "zw",
    "netherlands": "nl", "scotland": "gb-sct", "nepal": "np", "oman": "om",
    "uae": "ae", "united arab emirates": "ae", "usa": "us", "namibia": "na",
    "kenya": "ke", "canada": "ca",
};


const TEAM_COLORS = {
    "tasmania": "#1B5E99", "queensland": "#8B0000", "victoria": "#002B5C",
    "nsw": "#003087", "new south wales": "#003087",
    "western australia": "#C8961E", "wa": "#C8961E",
    "south australia": "#CC0000", "northern territory": "#CC4400",
    "dolphins": "#007A5E", "titans": "#F5A623", "warriors": "#6B0000",
    "boland": "#1A3A5C", "knights": "#004B8D", "lions": "#FFD700",
    "vtex india": "#7B2FBE", "aws world": "#FF9900",
    "botswana": "#75AADB", "lesotho": "#009543",
    "cyprus": "#4A90D9", "austria": "#CC0000",
    "kwazulu-natal inland": "#006400", "kwazulu natal inland": "#006400",
    "north west": "#8B4513",
    "kzn inland": "#006400",
};

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
    const pct = Math.min(Math.max(value, 0), 100) / 100;
    const color = value >= 65 ? C.green : value >= 45 ? C.amber : C.red;
    return (
        <svg width={128} height={80} viewBox="0 0 128 80">
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={C.border} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.text} fontFamily="Inter, system-ui">{value}%</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill={C.muted} fontFamily="Inter, system-ui" letterSpacing={1}>WIN PROB</text>
        </svg>
    );
}

function Spark({ data }) {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d.runs);
    const min = Math.min(...vals), max = Math.max(...vals);
    const w = 160, h = 40;
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 8) - 4]);
    return (
        <svg width={w} height={h}>
            <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={C.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4} fill={C.accent} />
        </svg>
    );
}

function isMatchEnded(status) {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === "ended" ||
           s.includes("won") || s.includes("win") || s.includes("tied") ||
           s.includes("draw") || s.includes("no result") || s.includes("abandoned");
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
    const hasHistory = history.length >= 2;
    const bowlerQuality = pred.bowlingFactor ? (pred.bowlingFactor <= 0.82 ? "Elite" : pred.bowlingFactor <= 0.92 ? "Good" : "Average") : "Average";
    const batQuality = pred.battingFactor ? (pred.battingFactor >= 1.15 ? "Strong" : pred.battingFactor >= 0.95 ? "Average" : "Weak") : "Average";
    const wicketColor1 = ov1.wicketProb > 40 ? "#A32D2D" : ov1.wicketProb > 25 ? "#BA7517" : "#3B6D11";
    const wicketLabel1 = ov1.wicketProb > 40 ? "High" : ov1.wicketProb > 25 ? "Medium" : "Low";
    const wicketBg1 = ov1.wicketProb > 40 ? "#E24B4A" : ov1.wicketProb > 25 ? "#EF9F27" : "#639922";
    const wicketColor2 = ov2.wicketProb > 40 ? "#A32D2D" : ov2.wicketProb > 25 ? "#BA7517" : "#3B6D11";
    const wicketLabel2 = ov2.wicketProb > 40 ? "High" : ov2.wicketProb > 25 ? "Medium" : "Low";
    const wicketBg2 = ov2.wicketProb > 40 ? "#E24B4A" : ov2.wicketProb > 25 ? "#EF9F27" : "#639922";
    const phase2 = ov2.phase === "DEATH OVERS" ? "DEATH" : ov2.phase === "POWERPLAY" ? "PP" : "MID";

    const barHeights = history.slice(-4).map(h => {
        const rr = h.over > 0 ? h.runs / h.over : 8;
        return Math.max(8, Math.round((rr / 16) * 44));
    });
    const predBarH = Math.max(8, Math.round((ov1.expectedRuns / 16) * 44));

    const CSS2 = `@keyframes blink2 { 0%,100%{opacity:1} 50%{opacity:0.3} }`;

    return (
        <div style={{ padding:"0 0 4px 0", marginBottom:14 }}>
            <style>{CSS2}</style>

            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#E24B4A", animation:"blink2 1.5s infinite" }}/>
                <span style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>Next over intelligence</span>
                <span style={{ fontSize:12, color:"#64748B" }}>Over {ov1.over} · {ov1.phase}</span>
            </div>

            {/* Over cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>

                {/* Over 1 — highlighted */}
                <div style={{ background:"#fff", border:"2px solid #378ADD", borderRadius:12, padding:14, position:"relative" }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:8, letterSpacing:0.5, textTransform:"uppercase" }}>Over {ov1.over} — now</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
                        <span style={{ fontSize:28, fontWeight:500, color:"#0A0A0A" }}>{ov1.runRange}</span>
                        <span style={{ fontSize:13, color:"#64748B" }}>runs expected</span>
                    </div>
                    <div style={{ background:"#EEF2FF", borderRadius:8, padding:"8px 10px", marginBottom:10 }}>
                        <div style={{ fontSize:11, color:"#64748B", marginBottom:3 }}>Bowling quality</div>
                        <div style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>{bowlerQuality}</div>
                        <div style={{ fontSize:12, color:"#64748B" }}>Factor {pred.bowlingFactor?.toFixed(2)||"1.00"}</div>
                    </div>
                    <div style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                            <span style={{ fontSize:12, color:"#64748B" }}>Wicket risk</span>
                            <span style={{ fontSize:12, fontWeight:500, color:wicketColor1 }}>{wicketLabel1} · {ov1.wicketProb}%</span>
                        </div>
                        <div style={{ height:4, background:"#EEF2FF", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ width:`${ov1.wicketProb}%`, height:"100%", background:wicketBg1, borderRadius:4 }}/>
                        </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {spinBoost > 5 && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#FAEEDA", color:"#854F0B" }}>Spin turn +{spinBoost}%</span>}
                        {!dewSoon && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#EEF2FF", color:"#64748B" }}>No dew yet</span>}
                        {dewSoon && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#E6F1FB", color:"#185FA5" }}>Dew incoming</span>}
                    </div>
                </div>

                {/* Over 2 */}
                <div style={{ background:"#fff", border:"0.5px solid #E2E8F0", borderRadius:12, padding:14 }}>
                    <div style={{ fontSize:11, color:"#64748B", marginBottom:8, letterSpacing:0.5, textTransform:"uppercase" }}>Over {ov2.over} — {phase2}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:12 }}>
                        <span style={{ fontSize:28, fontWeight:500, color:"#0A0A0A" }}>{ov2.runRange}</span>
                        <span style={{ fontSize:13, color:"#64748B" }}>runs expected</span>
                    </div>
                    <div style={{ background:"#EEF2FF", borderRadius:8, padding:"8px 10px", marginBottom:10 }}>
                        <div style={{ fontSize:11, color:"#64748B", marginBottom:3 }}>Batting quality</div>
                        <div style={{ fontSize:13, fontWeight:500, color:"#0A0A0A" }}>{batQuality}</div>
                        <div style={{ fontSize:12, color:"#64748B" }}>Factor {pred.battingFactor?.toFixed(2)||"1.00"}</div>
                    </div>
                    <div style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                            <span style={{ fontSize:12, color:"#64748B" }}>Wicket risk</span>
                            <span style={{ fontSize:12, fontWeight:500, color:wicketColor2 }}>{wicketLabel2} · {ov2.wicketProb}%</span>
                        </div>
                        <div style={{ height:4, background:"#EEF2FF", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ width:`${ov2.wicketProb}%`, height:"100%", background:wicketBg2, borderRadius:4 }}/>
                        </div>
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {ov2.phase === "DEATH OVERS" && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#FCEBEB", color:"#A32D2D" }}>Death overs</span>}
                        {dewSoon && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#E6F1FB", color:"#185FA5" }}>Dew incoming</span>}
                        {!dewSoon && ov2.phase !== "DEATH OVERS" && <span style={{ fontSize:11, padding:"3px 8px", borderRadius:6, background:"#EEF2FF", color:"#64748B" }}>Normal</span>}
                    </div>
                </div>
            </div>

            {/* Run rate trend */}
            {hasHistory && (
                <div style={{ background:"#fff", border:"0.5px solid #E2E8F0", borderRadius:12, padding:14, marginBottom:12 }}>
                    <div style={{ fontSize:12, color:"#64748B", marginBottom:12 }}>Run rate trend</div>
                    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:56 }}>
                        {history.slice(-4).map((h, i) => (
                            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                                <div style={{ width:"100%", borderRadius:"3px 3px 0 0",
                                    background: i===0?"#B5D4F4": i===1?"#85B7EB": i===2?"#378ADD":"#378ADD",
                                    height:`${barHeights[i]}px` }}/>
                                <span style={{ fontSize:10, color:"#64748B" }}>ov {h.over}</span>
                            </div>
                        ))}
                        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, opacity:0.7 }}>
                            <div style={{ width:"100%", borderRadius:"3px 3px 0 0",
                                background:"rgba(24,95,165,0.15)", border:"1.5px dashed #185FA5",
                                height:`${predBarH}px` }}/>
                            <span style={{ fontSize:10, color:"#1E2D6B", fontWeight:600 }}>ov {ov1.over} ↗</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Pitch behaviour */}
            <div style={{ background:"#fff", border:"0.5px solid #E2E8F0", borderRadius:12, padding:14 }}>
                <div style={{ fontSize:12, color:"#64748B", marginBottom:10 }}>Pitch behaviour now</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                    <div style={{ textAlign:"center", padding:"10px 6px", background:"#EEF2FF", borderRadius:8 }}>
                        <div style={{ fontSize:18, fontWeight:500, color: spinBoost > 5 ? "#BA7517" : "#64748B" }}>{spinBoost > 0 ? `+${spinBoost}%` : "—"}</div>
                        <div style={{ fontSize:11, color:"#64748B", marginTop:3 }}>Spin turn</div>
                    </div>
                    <div style={{ textAlign:"center", padding:"10px 6px", background:"#EEF2FF", borderRadius:8 }}>
                        <div style={{ fontSize:18, fontWeight:500, color:"#0A0A0A" }}>{pitchCond.split(" ")[0]}</div>
                        <div style={{ fontSize:11, color:"#64748B", marginTop:3 }}>Surface</div>
                    </div>
                    <div style={{ textAlign:"center", padding:"10px 6px", background: dewSoon?"#E6F1FB":"#EEF2FF", borderRadius:8 }}>
                        <div style={{ fontSize:18, fontWeight:500, color: dewSoon?"#185FA5":"#64748B" }}>{dewSoon?"Soon":"None"}</div>
                        <div style={{ fontSize:11, color:"#64748B", marginTop:3 }}>Dew factor</div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function MatchPill({ m, selected, onClick }) {
    return (
        <div className={`match-pill ${selected?"sel":""}`} onClick={() => { onClick(); window.scrollTo({top:0, behavior:'smooth'}); }}
            style={{ opacity: m.status==="ENDED" ? 0.75 : 1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:10, color:"#64748B" }}>{m.day} · {m.detail?.split("·")[0]?.trim().slice(0,18)}</span>
                <span style={{ fontSize:9, fontWeight:700, padding:"1px 6px", borderRadius:5,
                    background: m.status==="LIVE" ? "#FFF0F0" : m.status==="UPCOMING" ? "#EFF6FF" : "#F0F0F0",
                    color: m.status==="LIVE" ? "#E53E3E" : m.status==="UPCOMING" ? "#1E2D6B" : "#64748B" }}>
                    {m.status==="LIVE" ? "● LIVE" : m.status==="UPCOMING" ? "🗓️ SOON" : "ENDED"}
                </span>
            </div>
            {[{n:m.t1,s:m.t1Score,w:m.t1Wkts,b:true},{n:m.t2,s:m.t2Score,b:false}].map(({n,s,w,b}) => (
                <div key={n} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:3 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                        <TeamLogo name={n} size={16} />
                        <span style={{ fontSize:11,fontWeight:b?600:400,color:b?"#0A0A0A":"#64748B" }}>{n}</span>
                    </div>
                    {s!=null && <span style={{ fontSize:11,fontWeight:b?700:400,color:b?"#0A0A0A":"#64748B" }}>{w!=null?`${s}/${w}`:s}</span>}
                </div>
            ))}
            {m.status==="UPCOMING" && m.detail && (
                <div style={{ fontSize:9, color:"#1E2D6B", marginTop:4, fontWeight:500 }}>
                    {m.detail.split("·")[1]?.trim() || ""}
                </div>
            )}
        </div>
    );
}



function MatchCard({ m, onClick }) {
    return (
        <div className="card" style={{ padding:16,marginBottom:10,cursor:"pointer",opacity:m.status==="ENDED"?0.8:1 }} onClick={onClick}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                <span style={{ fontSize:11,color:"#64748B" }}>{m.day} · {m.detail?.split("·")[0]?.trim()}</span>
                <span style={{ fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,
                    background:m.status==="LIVE"?"#FFF0F0":m.status==="UPCOMING"?"#EFF6FF":"#F0F0F0",
                    color:m.status==="LIVE"?"#E53E3E":m.status==="UPCOMING"?"#1E2D6B":"#64748B" }}>
                    {m.status==="LIVE"?"● LIVE":m.status==="UPCOMING"?"🗓️ UPCOMING":"ENDED"}
                </span>
            </div>
            {[{n:m.t1,s:m.t1Score,w:m.t1Wkts,b:true},{n:m.t2,s:m.t2Score,b:false}].map(({n,s,w,b}) => (
                <div key={n} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <TeamLogo name={n} size={32} />
                        <span style={{ fontSize:16,fontWeight:b?700:400,color:b?"#0A0A0A":"#64748B" }}>{n}</span>
                    </div>
                    {s!=null && <span style={{ fontSize:16,fontWeight:b?700:400,color:b?"#0A0A0A":"#64748B" }}>{w!=null?`${s}/${w}`:s}</span>}
                </div>
            ))}
            <div style={{ fontSize:12,fontWeight:600,marginTop:6,
                color:m.status==="ENDED"?"#64748B":m.status==="UPCOMING"?"#1E2D6B":"#00B894" }}>
                {m.status==="ENDED" ? "View result →" : m.status==="UPCOMING" ? "Pre-match prediction →" : "View live prediction →"}
            </div>
        </div>
    );
}


function BettingInsights({ pred, liveMatches }) {
    const [odds, setOdds] = React.useState("");
    const [selectedTeam, setSelectedTeam] = React.useState("team1");
    const [history, setHistory] = React.useState(() => {
        try { return JSON.parse(localStorage.getItem("ci_pred_history") || "[]"); } catch { return []; }
    });
    const [manualOdds, setManualOdds] = React.useState({ team1: "", team2: "" });
    const [liveOdds, setLiveOdds] = React.useState(null);
    const [oddsLoading, setOddsLoading] = React.useState(false);

    const prob = pred?.aiProbability || 50;
    const team1 = pred?.team1 || "Team 1";
    const team2 = pred?.team2 || "Team 2";
    const prob2 = 100 - prob;

    // Fetch live odds automatically
    React.useEffect(() => {
        if (!pred?.team1) return;
        setOddsLoading(true);
        fetch(`${API_BASE}/odds?team1=${encodeURIComponent(pred.team1)}&team2=${encodeURIComponent(pred.team2)}`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d && d.bookmakers && d.bookmakers.length > 0) {
                    setLiveOdds(d);
                    // Auto-fill best odds
                    if (d.best_team1_odds) setManualOdds(p => ({...p, team1: d.best_team1_odds.toFixed(2)}));
                    if (d.best_team2_odds) setManualOdds(p => ({...p, team2: d.best_team2_odds.toFixed(2)}));
                }
                setOddsLoading(false);
            })
            .catch(() => setOddsLoading(false));
    }, [pred?.team1, pred?.team2]);

    // Value bet calculation
    const calcValue = (aiProb, oddsInput) => {
        const o = parseFloat(oddsInput);
        if (!o || o <= 1) return null;
        const impliedProb = (1 / o) * 100;
        const edge = aiProb - impliedProb;
        const ev = (aiProb / 100) * (o - 1) - (1 - aiProb / 100);
        return { impliedProb: impliedProb.toFixed(1), edge: edge.toFixed(1), ev: ev.toFixed(3), isValue: edge > 2 };
    };

    const v1 = calcValue(prob, manualOdds.team1);
    const v2 = calcValue(prob2, manualOdds.team2);

    // Pre-match betting brief
    const getBettingAngles = () => {
        const angles = [];
        if (pred?.pitchType === "dry_spin") angles.push({ angle: "Back spinners", reason: "Dry/spin pitch — spinners will dominate. Back bowling performance markets.", icon: "🏏", confidence: "High" });
        if (pred?.pitchType === "seam_swing") angles.push({ angle: "Back bowling team", reason: "Seam/swing conditions — bowling team has significant advantage.", icon: "🌀", confidence: "High" });
        if (pred?.weatherImpact?.dewFactor < 0.9) angles.push({ angle: "Favour chasing team", reason: "Dew expected in evening — chasing team gets easier batting conditions.", icon: "💧", confidence: "Medium" });
        if (pred?.weatherImpact?.swingFactor > 1.2) angles.push({ angle: "Under on runs", reason: "Overcast/swing conditions — expect lower scores than usual.", icon: "⛅", confidence: "High" });
        if (pred?.pitchCondition === "HEAVILY WORN") angles.push({ angle: "Back lower totals", reason: "Heavily worn pitch — batting will be difficult, expect low scores.", icon: "📉", confidence: "High" });
        if (angles.length < 3) angles.push({ angle: "Monitor toss", reason: "Toss result will be crucial — check batting/bowling conditions before placing.", icon: "🪙", confidence: "Medium" });
        if (angles.length < 3) angles.push({ angle: "Check team news", reason: "Playing XI not yet confirmed — wait for toss before betting.", icon: "📋", confidence: "Low" });
        return angles.slice(0, 3);
    };

    const angles = getBettingAngles();

    // Save prediction to history
    const savePrediction = (result) => {
        if (!pred?.team1) return;
        const entry = {
            id: Date.now(),
            date: new Date().toLocaleDateString("en-GB"),
            match: `${team1} vs ${team2}`,
            aiProb: prob,
            predictedWinner: prob > 50 ? team1 : team2,
            result: result,
            correct: result === (prob > 50 ? "team1" : "team2"),
        };
        const newHistory = [entry, ...history].slice(0, 50);
        setHistory(newHistory);
        localStorage.setItem("ci_pred_history", JSON.stringify(newHistory));
    };

    const correctCount = history.filter(h => h.correct).length;
    const accuracy = history.length > 0 ? ((correctCount / history.length) * 100).toFixed(0) : 0;

    const C2 = { bg:"#EEF2FF", surface:"#fff", border:"#E2E8F0", accent:"#1E2D6B", muted:"#64748B", text:"#0A0A0A", green:"#00B894", red:"#E53E3E", amber:"#F59E0B", gold:"#C8961E" };

    return (
        <div className="fade" style={{ maxWidth:680, margin:"0 auto", padding:"22px 16px" }}>

            {/* Header */}
            <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>Betting Insights</div>
                <div style={{ fontSize:13, color:C2.muted }}>AI-powered value identification · 18+ · Gamble responsibly</div>
            </div>

            {/* Current match */}
            {pred?.team1 && (
                <div style={{ background:C2.accent, borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:13, fontWeight:600, color:"#fff" }}>{team1} vs {team2}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>{pred?.venue?.split(",")[0]}</span>
                </div>
            )}

            {/* 1. Value Bet Calculator */}
            <div style={{ background:C2.surface, border:`1px solid ${C2.border}`, borderRadius:16, padding:20, marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C2.muted, letterSpacing:1, marginBottom:14 }}>⚡ VALUE BET CALCULATOR</div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
                    {/* Team 1 */}
                    <div style={{ padding:12, background:C2.bg, borderRadius:10 }}>
                        <div style={{ fontSize:11, color:C2.muted, marginBottom:4 }}>{team1}</div>
                        <div style={{ fontSize:18, fontWeight:700, color:C2.accent, marginBottom:8 }}>{prob}%</div>
                        <input
                            type="number" placeholder="Enter odds (e.g. 1.85)"
                            value={manualOdds.team1}
                            onChange={e => setManualOdds(p => ({...p, team1: e.target.value}))}
                            style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C2.border}`, fontSize:13, outline:"none", fontFamily:"Inter,system-ui" }}
                        />
                        {v1 && (
                            <div style={{ marginTop:8, padding:"8px 10px", borderRadius:8,
                                background: v1.isValue ? "#e8f5ee" : "#fff0f0",
                                border: `1px solid ${v1.isValue ? "#b2dfcc" : "#fecaca"}` }}>
                                <div style={{ fontSize:12, fontWeight:700, color: v1.isValue ? C2.green : C2.red }}>
                                    {v1.isValue ? "✅ VALUE BET" : "❌ No Value"}
                                </div>
                                <div style={{ fontSize:11, color:C2.muted, marginTop:3 }}>
                                    Implied: {v1.impliedProb}% · Edge: {v1.edge > 0 ? "+" : ""}{v1.edge}%
                                </div>
                                <div style={{ fontSize:11, color:C2.muted }}>
                                    EV: {v1.ev > 0 ? "+" : ""}{v1.ev} per £1
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div style={{ padding:12, background:C2.bg, borderRadius:10 }}>
                        <div style={{ fontSize:11, color:C2.muted, marginBottom:4 }}>{team2}</div>
                        <div style={{ fontSize:18, fontWeight:700, color:C2.accent, marginBottom:8 }}>{prob2}%</div>
                        <input
                
