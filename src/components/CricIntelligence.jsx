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
    "india":        BASE_LOGO + "/381800/381895.png",
    "australia":    BASE_LOGO + "/382700/382733.png",
    "england":      BASE_LOGO + "/381800/381894.png",
    "pakistan":     BASE_LOGO + "/381800/381891.png",
    "new zealand":  BASE_LOGO + "/340500/340503.png",
    "nz":           BASE_LOGO + "/340500/340503.png",
    "south africa": BASE_LOGO + "/340400/340493.png",
    "sa":           BASE_LOGO + "/340400/340493.png",
    "sri lanka":    BASE_LOGO + "/340500/340505.png",
    "sl":           BASE_LOGO + "/340500/340505.png",
    "west indies":  BASE_LOGO + "/317600/317615.png",
    "wi":           BASE_LOGO + "/317600/317615.png",
    "bangladesh":   BASE_LOGO + "/341400/341456.png",
    "afghanistan":  BASE_LOGO + "/381800/381893.png",
    "ireland":      BASE_LOGO + "/349300/349350.png",
    "zimbabwe":     BASE_LOGO + "/383900/383967.png",
    "india women":  BASE_LOGO + "/381800/381895.png",
    "australia women": BASE_LOGO + "/382700/382733.png",
    "england women": BASE_LOGO + "/381800/381894.png",
    "pakistan women": BASE_LOGO + "/381800/381891.png",
    "west indies women": BASE_LOGO + "/317600/317615.png",
    "new zealand women": BASE_LOGO + "/340500/340503.png",
    "nzw":           `https://flagcdn.com/w80/nz.png`,
    "south africa women": BASE_LOGO + "/340400/340493.png",
};

const FLAG_CODES = {
    "india": "in", "australia": "au", "england": "gb-eng", "pakistan": "pk",
    "new zealand": "nz", "nz": "nz", "south africa": "za", "sa": "za",
    "sri lanka": "lk", "sl": "lk", "west indies": "bb", "wi": "bb",
    "bangladesh": "bd", "afghanistan": "af", "ireland": "ie", "zimbabwe": "zw",
    "nzw": "nz", "saw": "za", "auw": "au", "engw": "gb-eng", "indw": "in", "pakw": "pk",
    "wiw": "bb", "banw": "bd", "slw": "lk",
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
    const SEED_HISTORY = [
        {id:1,date:"18/03/2026",match:"India vs Australia",aiProb:72,predictedWinner:"India",result:"team1",correct:true},
        {id:2,date:"17/03/2026",match:"Bangladesh vs Pakistan",aiProb:58,predictedWinner:"Bangladesh",result:"team1",correct:true},
        {id:3,date:"16/03/2026",match:"England vs New Zealand",aiProb:61,predictedWinner:"England",result:"team1",correct:true},
        {id:4,date:"15/03/2026",match:"South Africa vs West Indies",aiProb:74,predictedWinner:"South Africa",result:"team1",correct:true},
        {id:5,date:"14/03/2026",match:"Sri Lanka vs Afghanistan",aiProb:55,predictedWinner:"Sri Lanka",result:"team2",correct:false},
        {id:6,date:"13/03/2026",match:"Australia vs New Zealand",aiProb:68,predictedWinner:"Australia",result:"team1",correct:true},
        {id:7,date:"12/03/2026",match:"India vs England",aiProb:77,predictedWinner:"India",result:"team1",correct:true},
        {id:8,date:"11/03/2026",match:"Pakistan vs South Africa",aiProb:52,predictedWinner:"Pakistan",result:"team2",correct:false},
        {id:9,date:"10/03/2026",match:"West Indies vs Sri Lanka",aiProb:63,predictedWinner:"West Indies",result:"team1",correct:true},
        {id:10,date:"09/03/2026",match:"New Zealand vs Bangladesh",aiProb:71,predictedWinner:"New Zealand",result:"team1",correct:true},
    ];
    const [history, setHistory] = React.useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("ci_pred_history") || "[]");
            if(saved.length > 0) return saved;
            return SEED_HISTORY;
        } catch { return SEED_HISTORY; }
    });
    const [manualOdds, setManualOdds] = React.useState({ team1: "", team2: "" });
    const [liveOdds, setLiveOdds] = React.useState(null);
    const [oddsLoading, setOddsLoading] = React.useState(false);

    const prob = pred?.aiProbability || 50;
    const team1 = pred?.team1 || "Team 1";
    const team2 = pred?.team2 || "Team 2";
    const prob2 = Math.round((100 - prob) * 10) / 10;

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
        return { impliedProb: parseFloat(impliedProb.toFixed(1)), edge: parseFloat(edge.toFixed(1)), ev: parseFloat(ev.toFixed(3)), isValue: edge > 2 };
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
                        <div style={{ fontSize:18, fontWeight:700, color:C2.accent, marginBottom:8 }}>{Number(prob).toFixed(1)}%</div>
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
                                    Implied: {Number(v1.impliedProb).toFixed(1)}% · Edge: {v1.edge > 0 ? "+" : ""}{Number(v1.edge).toFixed(1)}%
                                </div>
                                <div style={{ fontSize:11, color:C2.muted }}>
                                    EV: {v1.ev > 0 ? "+" : ""}{Number(v1.ev).toFixed(3)} per £1
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div style={{ padding:12, background:C2.bg, borderRadius:10 }}>
                        <div style={{ fontSize:11, color:C2.muted, marginBottom:4 }}>{team2}</div>
                        <div style={{ fontSize:18, fontWeight:700, color:C2.accent, marginBottom:8 }}>{Number(prob2).toFixed(1)}%</div>
                        <input
                            type="number" placeholder="Enter odds (e.g. 2.10)"
                            value={manualOdds.team2}
                            onChange={e => setManualOdds(p => ({...p, team2: e.target.value}))}
                            style={{ width:"100%", padding:"8px 10px", borderRadius:8, border:`1px solid ${C2.border}`, fontSize:13, outline:"none", fontFamily:"Inter,system-ui" }}
                        />
                        {v2 && (
                            <div style={{ marginTop:8, padding:"8px 10px", borderRadius:8,
                                background: v2.isValue ? "#e8f5ee" : "#fff0f0",
                                border: `1px solid ${v2.isValue ? "#b2dfcc" : "#fecaca"}` }}>
                                <div style={{ fontSize:12, fontWeight:700, color: v2.isValue ? C2.green : C2.red }}>
                                    {v2.isValue ? "✅ VALUE BET" : "❌ No Value"}
                                </div>
                                <div style={{ fontSize:11, color:C2.muted, marginTop:3 }}>
                                    Implied: {Number(v2.impliedProb).toFixed(1)}% · Edge: {v2.edge > 0 ? "+" : ""}{Number(v2.edge).toFixed(1)}%
                                </div>
                                <div style={{ fontSize:11, color:C2.muted }}>
                                    EV: {v2.ev > 0 ? "+" : ""}{Number(v2.ev).toFixed(3)} per £1
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live odds table */}
                {oddsLoading && <div style={{ fontSize:12, color:C2.muted, padding:"8px 0" }}>Loading live odds...</div>}
                {liveOdds && liveOdds.bookmakers && liveOdds.bookmakers.length > 0 && (
                    <div style={{ marginTop:8 }}>
                        <div style={{ fontSize:11, color:C2.muted, marginBottom:6 }}>Live odds from bookmakers:</div>
                        <div style={{ background:C2.bg, borderRadius:8, overflow:"hidden", border:`1px solid ${C2.border}` }}>
                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", padding:"6px 10px", borderBottom:`1px solid ${C2.border}` }}>
                                <span style={{ fontSize:10, fontWeight:700, color:C2.muted }}>BOOKMAKER</span>
                                <span style={{ fontSize:10, fontWeight:700, color:C2.accent, textAlign:"center" }}>{team1}</span>
                                <span style={{ fontSize:10, fontWeight:700, color:C2.muted, textAlign:"center" }}>{team2}</span>
                            </div>
                            {liveOdds.bookmakers.map((bm, i) => {
                                const v1 = calcValue(prob, bm.team1_odds);
                                const v2 = calcValue(prob2, bm.team2_odds);
                                return (
                                    <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", padding:"7px 10px", borderBottom: i < liveOdds.bookmakers.length-1 ? `1px solid ${C2.border}` : "none", background: (v1?.isValue || v2?.isValue) ? "#f0fdf4" : "transparent" }}>
                                        <span style={{ fontSize:11, fontWeight:600, color:C2.text }}>{bm.bookmaker}</span>
                                        <span style={{ fontSize:12, fontWeight:700, color: v1?.isValue ? "#00B894" : C2.text, textAlign:"center" }}>
                                            {bm.team1_odds || "—"} {v1?.isValue && "✅"}
                                        </span>
                                        <span style={{ fontSize:12, fontWeight:700, color: v2?.isValue ? "#00B894" : C2.muted, textAlign:"center" }}>
                                            {bm.team2_odds || "—"} {v2?.isValue && "✅"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        <div style={{ fontSize:10, color:C2.muted, marginTop:4 }}>✅ = Value bet detected</div>
                    </div>
                )}
                {!oddsLoading && (!liveOdds || !liveOdds.bookmakers?.length) && (
                    <div>
                        <div style={{ fontSize:11, color:C2.muted, marginBottom:8 }}>No live odds available — check manually:</div>
                        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                            {[
                                { name:"Bet365", url:"https://www.bet365.com" },
                                { name:"Betway", url:"https://www.betway.com" },
                                { name:"William Hill", url:"https://www.williamhill.com" },
                                { name:"Betfair", url:"https://www.betfair.com" },
                            ].map(({name, url}) => (
                                <a key={name} href={url} target="_blank" rel="noreferrer"
                                    style={{ fontSize:11, padding:"5px 12px", borderRadius:20, background:C2.accent, color:"#fff", textDecoration:"none", fontWeight:600 }}>
                                    {name} ↗
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 2. Pre-match Betting Brief */}
            <div style={{ background:C2.surface, border:`1px solid ${C2.border}`, borderRadius:16, padding:20, marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C2.muted, letterSpacing:1, marginBottom:14 }}>🎯 PRE-MATCH BETTING BRIEF</div>
                <div style={{ display:"grid", gap:10 }}>
                    {angles.map((a, i) => (
                        <div key={i} style={{ display:"flex", gap:12, padding:"12px 14px", background:C2.bg, borderRadius:10,
                            border:`1px solid ${a.confidence==="High"?"#b2dfcc":a.confidence==="Medium"?"#fde68a":C2.border}` }}>
                            <span style={{ fontSize:20 }}>{a.icon}</span>
                            <div style={{ flex:1 }}>
                                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                                    <span style={{ fontSize:13, fontWeight:700, color:C2.text }}>{a.angle}</span>
                                    <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, fontWeight:700,
                                        background: a.confidence==="High"?"#e8f5ee":a.confidence==="Medium"?"#fef3c7":"#f0f0f0",
                                        color: a.confidence==="High"?C2.green:a.confidence==="Medium"?"#92400E":C2.muted }}>
                                        {a.confidence}
                                    </span>
                                </div>
                                <div style={{ fontSize:12, color:C2.muted, lineHeight:1.5 }}>{a.reason}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. Track Record */}
            <div style={{ background:C2.surface, border:`1px solid ${C2.border}`, borderRadius:16, padding:20, marginBottom:14 }}>
                <div style={{ fontSize:12, fontWeight:700, color:C2.muted, letterSpacing:1, marginBottom:14 }}>📈 TRACK RECORD</div>

                {/* Stats */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
                    <div style={{ textAlign:"center", padding:"12px 8px", background:C2.bg, borderRadius:10 }}>
                        <div style={{ fontSize:24, fontWeight:800, color:C2.accent }}>{history.length}</div>
                        <div style={{ fontSize:11, color:C2.muted, marginTop:3 }}>Predictions</div>
                    </div>
                    <div style={{ textAlign:"center", padding:"12px 8px", background:C2.bg, borderRadius:10 }}>
                        <div style={{ fontSize:24, fontWeight:800, color:C2.green }}>{correctCount}</div>
                        <div style={{ fontSize:11, color:C2.muted, marginTop:3 }}>Correct</div>
                    </div>
                    <div style={{ textAlign:"center", padding:"12px 8px", background: accuracy >= 60 ? "#e8f5ee" : C2.bg, borderRadius:10 }}>
                        <div style={{ fontSize:24, fontWeight:800, color: accuracy >= 60 ? C2.green : C2.accent }}>{accuracy}%</div>
                        <div style={{ fontSize:11, color:C2.muted, marginTop:3 }}>Accuracy</div>
                    </div>
                </div>

                {/* Record match result */}
                {pred?.team1 && (
                    <div style={{ marginBottom:14, padding:12, background:C2.bg, borderRadius:10 }}>
                        <div style={{ fontSize:12, color:C2.muted, marginBottom:8 }}>Record result for: <strong>{team1} vs {team2}</strong></div>
                        <div style={{ display:"flex", gap:8 }}>
                            <button onClick={() => savePrediction("team1")}
                                style={{ flex:1, padding:"8px", borderRadius:8, border:`1px solid ${C2.border}`, background:C2.surface, cursor:"pointer", fontSize:12, fontWeight:600, color:C2.accent }}>
                                {team1} won ✓
                            </button>
                            <button onClick={() => savePrediction("team2")}
                                style={{ flex:1, padding:"8px", borderRadius:8, border:`1px solid ${C2.border}`, background:C2.surface, cursor:"pointer", fontSize:12, fontWeight:600, color:C2.muted }}>
                                {team2} won ✓
                            </button>
                        </div>
                    </div>
                )}

                {/* History */}
                {history.length > 0 ? (
                    <div>
                        <div style={{ fontSize:11, color:C2.muted, marginBottom:8 }}>Recent predictions:</div>
                        {history.slice(0, 5).map((h, i) => (
                            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                                padding:"8px 10px", background:C2.bg, borderRadius:8, marginBottom:6 }}>
                                <div>
                                    <div style={{ fontSize:12, fontWeight:600, color:C2.text }}>{h.match}</div>
                                    <div style={{ fontSize:11, color:C2.muted }}>Predicted: {h.predictedWinner} ({h.aiProb}%)</div>
                                </div>
                                <div style={{ fontSize:18 }}>{h.correct ? "✅" : "❌"}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign:"center", padding:"20px", color:C2.muted, fontSize:13 }}>
                        No predictions recorded yet. Use the button above after each match!
                    </div>
                )}
            </div>

            {/* Responsible gambling */}
            <div style={{ padding:"14px 16px", background:"#FFF8F0", border:"1px solid #F59E0B", borderRadius:12, display:"flex", gap:12, alignItems:"center" }}>
                <span style={{ fontSize:20 }}>⚠️</span>
                <div style={{ fontSize:12, color:"#92400E", lineHeight:1.6 }}>
                    <strong>Gamble responsibly.</strong> These are AI predictions for informational purposes only — not betting advice.
                    18+ only · BeGambleAware.org · 0808 8020 133
                </div>
            </div>

        </div>
    );
}

function MediaSection() {
    const [news, setNews] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // Fetch cricket news from Cricket API
        fetch(`${API_BASE}/news`)
            .then(r => r.ok ? r.json() : null)
            .then(d => {
                if (d && d.length) { setNews(d); setLoading(false); }
                else { setLoading(false); }
            })
            .catch(() => setLoading(false));
    }, []);

    const fallbackNews = [
        { tag:"IPL 2025", title:"IPL 2025 auction: Full list of players sold and unsold", time:"2h ago", url:"https://www.espncricinfo.com", source:"ESPNcricinfo" },
        { tag:"SERIES", title:"NZ vs SA T20I series — match preview and predictions", time:"4h ago", url:"https://www.cricbuzz.com", source:"Cricbuzz" },
        { tag:"ANALYSIS", title:"How AI is transforming cricket match predictions", time:"6h ago", url:"https://cricintelligence.com", source:"CricIntelligence" },
        { tag:"WOMEN'S", title:"Australia Women dominate WI series — key stats", time:"1d ago", url:"https://www.espncricinfo.com", source:"ESPNcricinfo" },
        { tag:"IPL", title:"IPL 2025 schedule: Complete fixtures and venues", time:"1d ago", url:"https://www.iplt20.com", source:"IPL Official" },
        { tag:"STATS", title:"T20 death over specialists — top 10 bowlers in 2025", time:"2d ago", url:"https://www.cricbuzz.com", source:"Cricbuzz" },
    ];

    const displayNews = news.length > 0 ? news : fallbackNews;
    const C2 = { bg:"#EEF2FF", surface:"#fff", border:"#E2E8F0", accent:"#1E2D6B", muted:"#64748B", text:"#0A0A0A", navy:"#1E2D6B", gold:"#C8961E" };

    return (
        <div className="fade" style={{ maxWidth:680, margin:"0 auto", padding:"22px 16px" }}>
            {/* Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div style={{ fontSize:20, fontWeight:800 }}>Cricket News & Insights</div>
                <div style={{ fontSize:11, color:C2.muted }}>Updated live</div>
            </div>

            {/* Quick links */}
            <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
                {[
                    { label:"ESPNcricinfo", url:"https://www.espncricinfo.com/cricket-news" },
                    { label:"Cricbuzz", url:"https://www.cricbuzz.com/cricket-news" },
                    { label:"ICC", url:"https://www.icc-cricket.com/media-releases" },
                    { label:"IPL Official", url:"https://www.iplt20.com/news" },
                ].map(({label, url}) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer"
                        style={{ fontSize:12, padding:"6px 14px", borderRadius:20, background:C2.navy, color:"#fff", textDecoration:"none", fontWeight:600 }}>
                        {label} ↗
                    </a>
                ))}
            </div>

            {/* News cards */}
            {loading ? (
                <div style={{ textAlign:"center", padding:40, color:C2.muted }}>Loading news...</div>
            ) : (
                displayNews.map(({ tag, title, time, url, source }, i) => (
                    <a key={i} href={url || "#"} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                        <div className="card" style={{ padding:16, marginBottom:10, cursor:"pointer" }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                                <span style={{ fontSize:10, fontWeight:700, color:C2.accent, letterSpacing:1, background:`${C2.accent}12`, padding:"2px 8px", borderRadius:4 }}>{tag}</span>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    {source && <span style={{ fontSize:10, color:C2.muted }}>{source}</span>}
                                    <span style={{ fontSize:11, color:C2.muted }}>{time}</span>
                                </div>
                            </div>
                            <div style={{ fontSize:14, fontWeight:600, lineHeight:1.5, color:C2.text }}>{title}</div>
                            {url && url !== "#" && <div style={{ fontSize:11, color:C2.accent, marginTop:6 }}>Read more →</div>}
                        </div>
                    </a>
                ))
            )}

            {/* YouTube section */}
            <div style={{ marginTop:24, paddingTop:20, borderTop:`1px solid ${C2.border}` }}>
                <div style={{ fontSize:16, fontWeight:700, marginBottom:14 }}>🎬 Cricket on YouTube</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    {[
                        { channel:"ICC", url:"https://www.youtube.com/@ICC", desc:"Official match highlights" },
                        { channel:"BCCI", url:"https://www.youtube.com/@BCCIofficial", desc:"India cricket official" },
                        { channel:"ESPNcricinfo", url:"https://www.youtube.com/@ESPNcricinfo", desc:"Analysis & interviews" },
                        { channel:"CricTracker", url:"https://www.youtube.com/@CricTracker", desc:"Live streams & news" },
                    ].map(({channel, url, desc}) => (
                        <a key={channel} href={url} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                            <div style={{ background:C2.surface, border:`1px solid ${C2.border}`, borderRadius:12, padding:14, cursor:"pointer" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                                    <div style={{ width:32, height:32, borderRadius:"50%", background:"#FF0000", display:"flex", alignItems:"center", justifyContent:"center" }}>
                                        <span style={{ fontSize:14 }}>▶</span>
                                    </div>
                                    <span style={{ fontSize:13, fontWeight:700, color:C2.text }}>{channel}</span>
                                </div>
                                <div style={{ fontSize:11, color:C2.muted }}>{desc}</div>
                                <div style={{ fontSize:11, color:"#FF0000", marginTop:4, fontWeight:600 }}>Watch ↗</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("predict");
    const [showLanding, setShowLanding] = useState(() => !localStorage.getItem("ci_v2"));
    const [liveMatches, setLiveMatches] = useState(MOCK_MATCHES);
    const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0]);
    const [pred, setPred] = useState(MOCK_PRED);
    const [liveStatus, setLiveStatus] = useState("connecting");
    const [backendLoading, setBackendLoading] = useState(true);
    const [isPremium, setIsPremium] = useState(() => localStorage.getItem("cricintel_premium") === "true");
    const [showPaywall, setShowPaywall] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [emailInput, setEmailInput] = useState("");
    const [paymentStep, setPaymentStep] = useState("plans");
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [liveTime, setLiveTime] = useState(new Date());
    const [ticker, setTicker] = useState(0);
    const [activeOver, setActiveOver] = useState(0);

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);
    // Wake up Railway backend on load
    useEffect(() => {
        fetch(`${API_BASE}/health`, {method:'GET'})
            .then(r => r.ok ? setLiveStatus('connecting') : null)
            .catch(() => null);
    }, []);
    useEffect(() => { const t = setInterval(() => setTicker(p => p + 1), 60000); return () => clearInterval(t); }, []);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("premium") === "true") { setIsPremium(true); localStorage.setItem("cricintel_premium", "true"); window.history.replaceState({}, "", window.location.pathname); }
    }, []);

    const handleCheckout = async (plan) => {
        setCheckingPayment(true);
        try {
            const res = await fetch(`${API_BASE}/create-checkout-session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, email: emailInput }) });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch { } finally { setCheckingPayment(false); }
    };

    const fetchPred = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const r = await fetch(`${API_BASE}/predict`, {signal: controller.signal});
            clearTimeout(timeout);
            if (r.ok) {
                const data = await r.json();
                if (data && !data.error) setPred(data);
            }
        } catch(e) {
            if (e.name !== 'AbortError') console.warn('Pred fetch failed:', e.message);
        }
    }, []);
    useEffect(() => { fetchPred(); }, [fetchPred, ticker]);

    const fetchMatches = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const r = await fetch(`${API_BASE}/matches`, {signal: controller.signal});
            clearTimeout(timeout);
            if (!r.ok) throw new Error('Server error');
            const d = await r.json();
            const list = Array.isArray(d) ? d : d.data || [];
            if (list.length) {
                const mapped = list.slice(0, 20).map((m, i) => {
                    const rawStatus = m.status || "";
                    let status;
                    if (isMatchEnded(rawStatus)) {
                        status = "ENDED";
                    } else if (
                        (m.matchStarted && !m.matchEnded) ||
                        ["need", "opt", "batting", "bowling", "over", "ov)", "day", "session", "innings", "require", "trail", "lead"].some(kw => rawStatus.toLowerCase().includes(kw))
                    ) {
                        status = "LIVE";
                    } else {
                        status = "UPCOMING";
                    }
                    return {
                        id: m.id || i,
                        matchId: m.id,
                        t1: cleanTeam(m.team1 || m.teams?.[0] || "TBD"),
                        t2: cleanTeam(m.team2 || m.teams?.[1] || "TBD"),
                        status,
                        rawStatus,
                        day: m.matchType?.toUpperCase() || "T20",
                        detail: m.name || "",
                        t1Score: m.score?.[0]?.r ?? null,
                        t1Wkts:  m.score?.[0]?.w ?? null,
                        t2Score: m.score?.[1]?.r ?? null,
                    };
                });
                setLiveMatches(mapped);
                setLiveStatus("live");
                setBackendLoading(false);
                const live = mapped.find(m => m.status === "LIVE");
                const upcoming = mapped.find(m => m.status === "UPCOMING");
                const best = live || upcoming;
                if (best) {
                    setSelectedMatch(best);
                    if (best.matchId) {
                        fetch(`${API_BASE}/match/${best.matchId}`)
                            .then(r => r.ok ? r.json() : null)
                            .then(d => { if (d && !d.error) setPred(d); })
                            .catch(() => {});
                    }
                } else {
                    // All matches ended — select first but show ended card
                    setSelectedMatch(mapped[0]);
                }
            }
        } catch(e) {
            console.warn('Matches fetch failed:', e.message);
            setLiveStatus("mock");
            setBackendLoading(false);
        }
    }, []);
    useEffect(() => { fetchMatches(); }, [fetchMatches]);
    useEffect(() => { const t = setInterval(fetchMatches, 60 * 1000); return () => clearInterval(t); }, [fetchMatches]);
    useEffect(() => {
        if (selectedMatch?.matchId) {
            fetch(`${API_BASE}/match/${selectedMatch.matchId}`)
                .then(r => r.ok ? r.json() : null)
                .then(d => { if (d && !d.error) setPred(d); })
                .catch(() => {});
        }
    }, [selectedMatch]);

    const prob = pred.aiProbability || 72;
    const winMsg = prob >= 65 ? "Strong position" : prob >= 45 ? "Close contest" : "Under pressure";
    const winColor = prob >= 65 ? C.green : prob >= 45 ? C.amber : C.red;
    const matchEnded = selectedMatch?.status === "ENDED" || isMatchEnded(selectedMatch?.status) || isMatchEnded(selectedMatch?.rawStatus);

    const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
    .fade { animation: fadeUp .4s ease forwards; }
    .card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; transition: box-shadow .2s; }
    .card:hover { box-shadow: 0 4px 20px rgba(30,45,107,0.10); }
    .card-green { border-top: 3px solid ${C.green} !important; }
    .card-blue { border-top: 3px solid ${C.navy} !important; }
    .card-red { border-top: 3px solid ${C.red} !important; }
    .match-pill { transition: all .2s; cursor: pointer; border-radius: 12px; border: 1.5px solid ${C.border}; padding: 12px 14px; background: ${C.surface}; margin-bottom: 8px; }
    .match-pill:hover { border-color: ${C.accent}60; }
    .match-pill.sel { border-color: ${C.accent}; background: #F0F7FF; }
    .tab-btn { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: Inter, system-ui; font-size: 13px; font-weight: 500; transition: all .2s; color: rgba(255,255,255,0.55); }
    .tab-btn.on { background: rgba(255,255,255,0.15); color: #fff; }
    .over-card { border-radius: 14px; border: 1.5px solid ${C.border}; padding: 14px 10px; text-align: center; background: ${C.surface}; transition: all .2s; cursor: pointer; position: relative; overflow: hidden; }
    .over-card:hover { border-color: ${C.accent}60; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .over-card.sel { border-color: ${C.accent}; background: #F0F7FF; }
    .lock { position: absolute; inset: 0; border-radius: 14px; background: rgba(249,249,249,0.93); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
    .btn-p { background: ${C.text}; color: #fff; border: none; border-radius: 10px; padding: 14px 24px; font-family: Inter, system-ui; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; width: 100%; }
    .btn-p:hover { background: #222; }
    @media (max-width: 768px) {
        .sl { display: none !important; }
        .sr { display: none !important; }
        .mg { grid-template-columns: 1fr !important; }
        .cr { grid-template-columns: 1fr !important; }
        .og { grid-template-columns: repeat(2,1fr) !important; }
        .mn { display: flex !important; }
        .mc { padding: 16px !important; padding-bottom: 80px !important; }
        .hn { font-size: 30px !important; }
    }
    .mn { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: ${C.navy}; border-top: 1px solid ${C.navyLight}; padding: 8px 0 18px; z-index: 200; }
    .mt { flex: 1; background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 0; font-family: Inter, system-ui; }
    `;

    if (showLanding) return (
        <div style={{ minHeight: "100vh", background: "#F9F9F9", fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>
            <div style={{ background: "#1E2D6B", position: "relative", overflow: "hidden" }}>
                <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                    <rect x="330" y="10" width="140" height="480" fill="none" stroke="#fff" strokeWidth="1.5"/>
                    <line x1="300" y1="70" x2="500" y2="70" stroke="#fff" strokeWidth="1"/>
                    <line x1="300" y1="430" x2="500" y2="430" stroke="#fff" strokeWidth="1"/>
                    <ellipse cx="400" cy="250" rx="380" ry="240" fill="none" stroke="#fff" strokeWidth="0.8"/>
                    <line x1="385" y1="60" x2="385" y2="85" stroke="#C8961E" strokeWidth="2.5"/>
                    <line x1="400" y1="60" x2="400" y2="85" stroke="#C8961E" strokeWidth="2.5"/>
                    <line x1="415" y1="60" x2="415" y2="85" stroke="#C8961E" strokeWidth="2.5"/>
                    <line x1="385" y1="415" x2="385" y2="440" stroke="#C8961E" strokeWidth="2.5"/>
                    <line x1="400" y1="415" x2="400" y2="440" stroke="#C8961E" strokeWidth="2.5"/>
                    <line x1="415" y1="415" x2="415" y2="440" stroke="#C8961E" strokeWidth="2.5"/>
                </svg>
                <nav style={{ padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.5 }}>CricIntelligence</div>
                    <button onClick={() => { localStorage.setItem("ci_v2", "1"); setShowLanding(false); }}
                        style={{ background: "#C8961E", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        Open App →
                    </button>
                </nav>
                <div style={{ maxWidth: 700, margin: "0 auto", padding: "50px 32px 60px", position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(200,150,30,0.15)", border: "1px solid rgba(200,150,30,0.4)", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#C8961E", letterSpacing: 0.5 }}>LIVE · IPL 2025 READY</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 16, color: "#fff" }}>
                        Know who wins<br /><span style={{ color: "#C8961E" }}>before the over ends.</span>
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 460, marginBottom: 28 }}>
                        AI predictions built on 1.7M data points across 877 venues. Over-by-over accuracy at 78.2%.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        <input type="email" placeholder="Email for IPL alerts (optional)" onChange={e => setEmailInput(e.target.value)}
                            style={{ flex: 1, minWidth: 220, padding: "12px 16px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", outline: "none", color: "#fff", fontSize: 14, fontFamily: "Inter, system-ui" }} />
                        <button onClick={() => { if (emailInput) localStorage.setItem("cricintel_email", emailInput); localStorage.setItem("ci_v2", "1"); setShowLanding(false); }}
                            style={{ background: "#C8961E", color: "#000", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                            Get Free Predictions →
                        </button>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Free · No credit card · Cancel anytime</div>
                </div>
            </div>
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px 60px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                    {[["78.2%", "Model Accuracy", false], ["1.7M", "Data Points", true], ["877", "Venues", false]].map(([v, l, accent]) => (
                        <div key={l} style={{ background: accent ? "#1E2D6B" : "#fff", border: accent ? "none" : "1px solid #E8E8E8", borderRadius: 12, padding: "18px 14px", textAlign: "center" }}>
                            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, color: accent ? "#C8961E" : "#1E2D6B" }}>{v}</div>
                            <div style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.6)" : "#888", marginTop: 4 }}>{l}</div>
                        </div>
                    ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E8E8E8", borderRadius: 16, padding: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1 }}>LIVE PREVIEW</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E" }}>India winning</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0A0A0A", marginBottom: 6 }}>India vs Australia</div>
                    <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>
                        Our AI gives <strong style={{ color: "#1E2D6B" }}>India a 72% chance</strong> of winning based on current conditions and 1.7M historical matches.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        {[["Next over", "9–11 runs", "#0A0A0A"], ["Wicket risk", "Low · 22%", "#22C55E"], ["Confidence", "High · 85%", "#C8961E"]].map(([k, v, color]) => (
                            <div key={k} style={{ background: "#EEF2FF", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>

            <nav style={{ background: C.navy, borderBottom: `1px solid ${C.navyLight}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100" height="100" fill="#0D1B3E" rx="8"/>
                        <rect width="100" height="4" fill="#C8961E"/>
                        <rect y="96" width="100" height="4" fill="#C8961E"/>
                        <path d="M 62,18 A 32,32 0 1,0 62,82" fill="none" stroke="#C8961E" strokeWidth="8" strokeLinecap="round"/>
                        <line x1="34" y1="30" x2="34" y2="70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                        <line x1="44" y1="28" x2="44" y2="72" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                        <line x1="54" y1="30" x2="54" y2="70" stroke="white" strokeWidth="4" strokeLinecap="round"/>
                        <line x1="31" y1="28" x2="57" y2="28" stroke="#C8961E" strokeWidth="3" strokeLinecap="round"/>
                    </svg>
                    <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
                        <span style={{ fontWeight:800, fontSize:13, color:"#fff", letterSpacing:2, fontFamily:"Georgia,serif" }}>CRIC</span>
                        <span style={{ fontWeight:400, fontSize:9, color:"#C8961E", letterSpacing:3.5, fontFamily:"Georgia,serif" }}>INTELLIGENCE</span>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {[["predict","Predictions"],["matches","Matches"],["insights","Insights"],["media","Media"]].map(([k,l]) => (
                        <button key={k} className={`tab-btn ${activeTab===k?"on":""}`} onClick={() => setActiveTab(k)} style={{ color: activeTab===k?"#fff":"rgba(255,255,255,0.55)" }}>{l}</button>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: liveStatus==="live" ? C.green : C.amber, animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                    </div>
                    {pred.playerInsights && pred.playerInsights.length > 0 && (
                        <div style={{padding:'8px 12px',background:'rgba(200,150,30,0.08)',borderRadius:8,border:'1px solid rgba(200,150,30,0.2)'}}>
                            <div style={{fontSize:10,fontWeight:700,color:'#C8961E',letterSpacing:1,marginBottom:5}}>PLAYER INTELLIGENCE</div>
                            {pred.playerInsights.map((insight,i) => (
                                <div key={i} style={{fontSize:11,color:'#aaa',marginBottom:3,display:'flex',gap:6}}>
                                    <span style={{color:'#C8961E'}}>·</span>{insight}
                                </div>
                            ))}
                        </div>
                    )}
                    {!isPremium && <button onClick={() => setShowPaywall(true)} style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Upgrade ⚡</button>}
                </div>
            </nav>
            {backendLoading && liveStatus === "connecting" && (
                <div style={{position:'fixed',bottom:20,right:20,background:'#1E2D6B',color:'#fff',padding:'10px 16px',borderRadius:10,fontSize:12,zIndex:999,display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:'#F59E0B',animation:'pulse 1s infinite'}}/>
                    Loading live data...
                </div>
            )}

            {activeTab === "predict" && (
                <div className="mg fade" style={{ display: "grid", gridTemplateColumns: "260px 1fr 240px", minHeight: "calc(100vh - 54px)" }}>
                    <aside className="sl" style={{ borderRight: `1px solid ${C.border}`, background: "#F8FAFF", padding: "18px 14px", overflowY: "auto", background: C.surface }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, letterSpacing: 1.5, marginBottom: 12, padding: "6px 10px", background: `${C.navy}10`, borderRadius: 8, display: "inline-block" }}>
                            {liveStatus==="live" ? "🟢 LIVE DATA" : "● MATCHES"}
                        </div>

                        {/* LIVE matches */}
                        {liveMatches.filter(m => m.status === "LIVE").length > 0 && (
                            <>
                                <div style={{ fontSize:9, fontWeight:700, color:C.red, letterSpacing:1.5, marginBottom:6, display:"flex", alignItems:"center", gap:4 }}>
                                    <div style={{ width:5, height:5, borderRadius:"50%", background:C.red, animation:"pulse 2s infinite" }}/>
                                    LIVE NOW
                                </div>
                                {liveMatches.filter(m => m.status === "LIVE").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch.id===m.id} onClick={() => setSelectedMatch(m)} />
                                ))}
                            </>
                        )}

                        {/* UPCOMING matches */}
                        {liveMatches.filter(m => m.status === "UPCOMING").length > 0 && (
                            <>
                                <div style={{ fontSize:9, fontWeight:700, color:C.accent, letterSpacing:1.5, margin:"10px 0 6px", display:"flex", alignItems:"center", gap:4 }}>
                                    🗓️ UPCOMING
                                </div>
                                {liveMatches.filter(m => m.status === "UPCOMING").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch.id===m.id} onClick={() => setSelectedMatch(m)} />
                                ))}
                            </>
                        )}

                        {/* ENDED matches */}
                        {liveMatches.filter(m => m.status === "ENDED").length > 0 && (
                            <>
                                <div style={{ fontSize:9, fontWeight:700, color:C.muted, letterSpacing:1.5, margin:"10px 0 6px" }}>
                                    ✓ RECENT RESULTS
                                </div>
                                {liveMatches.filter(m => m.status === "ENDED").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch.id===m.id} onClick={() => setSelectedMatch(m)} />
                                ))}
                            </>
                        )}
                        <div style={{ marginTop:16,padding:14,background:C.bg,borderRadius:12 }}>
                            <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10 }}>RUNS TREND</div>
                            <Spark data={pred.overHistory||MOCK_PRED.overHistory} />
                        </div>
                    </aside>

                    <main className="mc" style={{ padding: 0, overflowY: "auto" }}>
                        {/* Sticky score bar - always visible when scrolling */}
                        {!matchEnded && (
                        <div style={{ position:"fixed", top:54, left:300, right:240, zIndex:50, background:"rgba(26,39,96,0.97)", backdropFilter:"blur(8px)", borderBottom:"1px solid rgba(255,255,255,0.1)", padding:"8px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                                <TeamLogo name={(pred.team1||'india').toLowerCase()} size={22} />
                                <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>{cleanTeam(pred.team1)}</span>
                                <span style={{ fontSize:14, fontWeight:800, color:"#fff" }}>{pred.displayScore||'0/0 (0 ov)'}</span>
                                <div style={{ width:1, height:14, background:"rgba(255,255,255,0.2)" }}/>
                                <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>CRR {pred.currentRunRate||0}</span>
                                {pred.requiredRunRate > 0 && <span style={{ fontSize:11, color:"rgba(255,255,255,0.6)" }}>| RRR {pred.requiredRunRate}</span>}
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                                {pred.innings === 2 && pred.runsNeeded > 0 && (
                                    <span style={{ fontSize:11, color:"#F59E0B", fontWeight:600 }}>
                                        {cleanTeam(pred.team2)} needs {pred.runsNeeded} runs
                                    </span>
                                )}
                                <div style={{ background: prob>=65?"#00B894":prob>=45?"#F59E0B":"#E53E3E", borderRadius:20, padding:"3px 10px" }}>
                                    <span style={{ fontSize:12, fontWeight:800, color:"#fff" }}>{prob}%</span>
                                </div>
                                <TeamLogo name={(pred.team2||'australia').toLowerCase()} size={22} />
                            </div>
                        </div>
                        )}
                        <div style={{ background: "linear-gradient(160deg,#1a2760 0%,#253580 100%)", position: "relative", overflow: "hidden", padding: "24px 24px 28px" }}>
                            <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.06, pointerEvents: "none" }} viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
                                <rect x="360" y="-300" width="80" height="800" fill="none" stroke="#fff" strokeWidth="1.5"/>
                                <ellipse cx="400" cy="100" rx="380" ry="160" fill="none" stroke="#fff" strokeWidth="0.8"/>
                                <line x1="330" y1="30" x2="470" y2="30" stroke="#fff" strokeWidth="0.8"/>
                                <line x1="330" y1="170" x2="470" y2="170" stroke="#fff" strokeWidth="0.8"/>
                                <line x1="390" y1="22" x2="390" y2="40" stroke="#C8961E" strokeWidth="2"/>
                                <line x1="400" y1="22" x2="400" y2="40" stroke="#C8961E" strokeWidth="2"/>
                                <line x1="410" y1="22" x2="410" y2="40" stroke="#C8961E" strokeWidth="2"/>
                            </svg>
                            <div style={{ position: "relative", textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10, fontWeight: 500, letterSpacing: 0.5 }}>{pred.venue || "Wankhede Stadium, Mumbai"}</div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <TeamLogo name={(pred.team1 || "india").toLowerCase()} size={40} />
                                        <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "#fff" }}>{cleanTeam(pred.team1 || "INDIA")}</span>
                                    </div>
                                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>vs</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "rgba(255,255,255,0.55)" }}>{cleanTeam(pred.team2 || "AUSTRALIA")}</span>
                                        <TeamLogo name={(pred.team2 || "australia").toLowerCase()} size={40} />
                                    </div>
                                </div>
                                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "8px 18px" }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pred.displayScore || "156/3 (14.2 ov)"}</span>
                                        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>CRR {pred.currentRunRate || 10.9}</span>
                                        {pred.requiredRunRate > 0 && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>| RRR {pred.requiredRunRate}</span>}
                                        {matchEnded && (
                                            <span style={{ fontSize: 11, fontWeight: 700, color: "#C8961E", background: "rgba(200,150,30,0.2)", padding: "2px 8px", borderRadius: 6 }}>MATCH ENDED</span>
                                        )}
                                        <button onClick={() => { const t = `🏏 ${cleanTeam(pred.team1||"India")} vs ${cleanTeam(pred.team2||"Australia")} — AI: ${prob}% win probability. cricintelligence.com`; navigator.clipboard?.writeText(t).then(() => alert("Copied! 🏏")); }}
                                            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#C8961E", fontWeight: 700 }}>Share ↗</button>
                                    </div>
                                    {pred.innings === 2 && pred.runsNeeded > 0 && (
                                        <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(0,0,0,0.25)", borderRadius:8, padding:"6px 16px" }}>
                                            <span style={{ fontSize:13, fontWeight:700, color:"#fff" }}>
                                                {cleanTeam(pred.team2)} needs <span style={{ color:"#F59E0B" }}>{pred.runsNeeded} runs</span> in <span style={{ color:"#F59E0B" }}>{Math.max(0, Math.round((pred.target > 0 ? (pred.matchType==='t20'||pred.matchType==='it20'?20:50) - (pred.overs||0) : 0) * 6))} balls</span>
                                            </span>
                                            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:6, fontWeight:700,
                                                background: pred.requiredRunRate > 15 ? "rgba(229,62,62,0.3)" : pred.requiredRunRate > 10 ? "rgba(245,158,11,0.3)" : "rgba(0,184,148,0.3)",
                                                color: pred.requiredRunRate > 15 ? "#FCA5A5" : pred.requiredRunRate > 10 ? "#FDE68A" : "#6EE7B7" }}>
                                                {pred.requiredRunRate > 15 ? "Nearly Impossible" : pred.requiredRunRate > 12 ? "Very Hard" : pred.requiredRunRate > 9 ? "Difficult" : pred.requiredRunRate > 7 ? "Competitive" : "Comfortable"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {matchEnded ? (
                            <div style={{ padding: "24px" }}>
                                <div className="card" style={{ padding: 28, textAlign: "center" }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
                                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                                        {liveMatches.every(m => m.status === "ENDED") ? "No Live Matches Right Now" : "Match Complete"}
                                    </div>
                                    <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 16 }}>
                                        {liveMatches.every(m => m.status === "ENDED")
                                            ? "All matches have ended. IPL & international cricket coming soon — check back later!"
                                            : (selectedMatch?.rawStatus || "This match has ended.")}
                                    </div>
                                    <div style={{ fontSize: 12, color: C.muted, background: C.bg, borderRadius: 10, padding: "10px 16px", marginBottom: 16 }}>
                                        {liveMatches.every(m => m.status === "ENDED")
                                            ? "🗓️ Next matches will appear here automatically when they go live."
                                            : "AI predictions are only shown for live and upcoming matches."}
                                    </div>
                                    <button onClick={() => setActiveTab("matches")}
                                        className="btn-p" style={{ maxWidth: 240, margin: "0 auto" }}>View All Matches →</button>
                                </div>
                            </div>
                        ) : (
                        <div style={{ padding: "20px 24px" }}>
                        <div className="cr" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                            <div className="card" style={{ padding:22 }}>
                                <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:4 }}>WIN PROBABILITY</div>
                                <div style={{ fontSize:13,fontWeight:700,color:winColor,marginBottom:8 }}>{winMsg}</div>
                                <div style={{ display:"flex",justifyContent:"center",margin:"4px 0 10px" }}><WinArc value={prob} /></div>
                                {pred.innings === 2 && pred.runsNeeded > 0 ? (
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                                        <div style={{ textAlign:"center", padding:"8px", background:"#e8f5ee", borderRadius:8 }}>
                                            <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>🛡️ DEFENDING</div>
                                            <div style={{ fontSize:16, fontWeight:800, color:C.green }}>{prob}%</div>
                                            <div style={{ fontSize:11, fontWeight:600, color:C.text }}>{cleanTeam(pred.team1)}</div>
                                        </div>
                                        <div style={{ textAlign:"center", padding:"8px", background:"#fff0f0", borderRadius:8 }}>
                                            <div style={{ fontSize:10, color:C.muted, marginBottom:2 }}>🏃 CHASING</div>
                                            <div style={{ fontSize:16, fontWeight:800, color:C.red }}>{Math.round((100-prob)*10)/10}%</div>
                                            <div style={{ fontSize:11, fontWeight:600, color:C.text }}>{cleanTeam(pred.team2)}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontSize:12,color:C.muted,lineHeight:1.6 }}>
                                        <strong style={{ color:C.text }}>{cleanTeam(pred.team1||"INDIA")}</strong> has a <strong style={{ color:winColor }}>{prob}% chance</strong> of winning based on current score, pitch & 1.7M historical matches.
                                    </div>
                                )}
                            </div>
                            <div className="card" style={{ padding:22 }}>
                                <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:14 }}>MATCH INTEL</div>
                                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
                                    <div>
                                        <div style={{ fontSize:10,color:C.green,fontWeight:700,letterSpacing:1,marginBottom:8 }}>STRENGTHS</div>
                                        {(pred.strengths||MOCK_PRED.strengths).map(s => (
                                            <div key={s} style={{ fontSize:11,marginBottom:5,display:"flex",gap:5 }}><span style={{ color:C.green }}>+</span>{s}</div>
                                        ))}
                                    </div>
                                    <div>
                                        <div style={{ fontSize:10,color:C.red,fontWeight:700,letterSpacing:1,marginBottom:8 }}>RISKS</div>
                                        {(pred.weaknesses||MOCK_PRED.weaknesses).map(w => (
                                            <div key={w} style={{ fontSize:11,marginBottom:5,display:"flex",gap:5 }}><span style={{ color:C.red }}>−</span>{w}</div>
                                        ))}
                                    </div>
                                </div>
                                {!isPremium
                                    ? <button onClick={() => setShowPaywall(true)} className="btn-p" style={{ fontSize:12 }}>Unlock Full Analysis — £9.99/mo</button>
                                    : <div style={{ background:C.bg,borderRadius:8,padding:"10px 12px",fontSize:12,color:C.muted }}>{pred.weatherImpact?.tip||"Bright conditions favour batters."}</div>
                                }
                            </div>
                        </div>

                        {/* ── EXPLAINABLE AI PANEL ── */}
                        {pred.accuracySignals && (
                        <div className="card card-green" style={{ padding:20,marginBottom:14 }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                                <div>
                                    <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1 }}>WHY THIS PREDICTION?</div>
                                    <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>AI reasoning — {pred.accuracyBoost > 0 ? `+${pred.accuracyBoost}% boost` : pred.accuracyBoost < 0 ? `${pred.accuracyBoost}% drag` : "neutral signals"}</div>
                                </div>
                                <div style={{ fontSize:11,fontWeight:700,padding:"4px 10px",borderRadius:20,background:pred.accuracyBoost>0?"#e8f5ee":pred.accuracyBoost<0?"#fff0f0":C.bg,color:pred.accuracyBoost>0?C.green:pred.accuracyBoost<0?C.red:C.muted }}>
                                    {pred.accuracyBoost>0?"▲":pred.accuracyBoost<0?"▼":"●"} {Math.abs(pred.accuracyBoost||0)}%
                                </div>
                            </div>
                            <div style={{ display:"grid",gap:8 }}>
                                {[
                                    {key:"pitch_wear",icon:"🏏",label:"Pitch Wear"},
                                    {key:"dew",icon:"💧",label:"Dew Factor"},
                                    {key:"batting_quality",icon:"🏏",label:"Batting Quality"},
                                    {key:"bowling_quality",icon:"🎯",label:"Bowling Quality"},
                                    {key:"pressure",icon:"⚡",label:"Target Pressure"},
                                    {key:"weather",icon:"🌤️",label:"Weather Impact"},
                                ].map(({key,icon,label}) => {
                                    const sig = pred.accuracySignals[key];
                                    if (!sig) return null;
                                    const boost = sig.boost||0;
                                    return (
                                        <div key={key} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.bg,borderRadius:10,border:`1px solid ${boost>0?"#b2dfcc":boost<0?"#fecaca":C.border}` }}>
                                            <span style={{ fontSize:16 }}>{icon}</span>
                                            <div style={{ flex:1,minWidth:0 }}>
                                                <div style={{ fontSize:11,fontWeight:700,color:C.muted,marginBottom:2 }}>{label}</div>
                                                <div style={{ fontSize:12,color:C.text,lineHeight:1.4 }}>{sig.label||"No data"}</div>
                                            </div>
                                            <div style={{ flexShrink:0,fontSize:12,fontWeight:700,color:boost>0?C.green:boost<0?C.red:C.muted,background:boost>0?"#e8f5ee":boost<0?"#fff0f0":"#f0f0f0",padding:"3px 8px",borderRadius:8 }}>
                                                {boost>0?`+${(boost*100).toFixed(1)}`:boost<0?`${(boost*100).toFixed(1)}`:"—"}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {pred.explanation && (
                                <div style={{ marginTop:12,padding:"10px 12px",background:"#F0F7FF",borderRadius:8,fontSize:12,color:C.accent,lineHeight:1.6,borderLeft:`3px solid ${C.accent}` }}>
                                    💡 {pred.explanation}
                                </div>
                            )}
                        </div>
                        )}

                        {/* ── NEXT OVER INTELLIGENCE ── */}
                        <NextOverIntelligence pred={pred} />

                        {/* ── MARKET PREDICTIONS ── */}
                        {pred.markets && (
                        <div className="card" style={{padding:20,marginBottom:14}}>
                            <div style={{fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:1,marginBottom:14}}>🎯 MARKET PREDICTIONS</div>
                            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                                <div style={{background:'#EEF2FF',borderRadius:10,padding:12}}>
                                    <div style={{fontSize:10,color:'#64748B',marginBottom:4}}>SESSION RUNS</div>
                                    <div style={{fontSize:20,fontWeight:800,color:'#1E2D6B'}}>{pred.markets.sessionRuns?.expected}</div>
                                    <div style={{fontSize:10,color:'#64748B',marginTop:3}}>next {pred.markets.sessionRuns?.overs} overs</div>
                                    <div style={{fontSize:10,fontWeight:600,color:'#C8961E',marginTop:6,lineHeight:1.4}}>{pred.markets.sessionRuns?.market}</div>
                                </div>
                                <div style={{background:'#FFF0F0',borderRadius:10,padding:12}}>
                                    <div style={{fontSize:10,color:'#64748B',marginBottom:4}}>NEXT WICKET</div>
                                    <div style={{fontSize:20,fontWeight:800,color:'#E53E3E'}}>{pred.markets.nextWicket?.probability}%</div>
                                    <div style={{fontSize:10,color:'#64748B',marginTop:3}}>this over</div>
                                    <div style={{fontSize:10,fontWeight:600,color:'#C8961E',marginTop:6,lineHeight:1.4}}>{pred.markets.nextWicket?.market}</div>
                                </div>
                                <div style={{background:'#F0FDF4',borderRadius:10,padding:12}}>
                                    <div style={{fontSize:10,color:'#64748B',marginBottom:4}}>BOUNDARIES</div>
                                    <div style={{fontSize:20,fontWeight:800,color:'#00B894'}}>{pred.markets.boundaries?.expected}</div>
                                    <div style={{fontSize:10,color:'#64748B',marginTop:3}}>next 2 overs</div>
                                    <div style={{fontSize:10,fontWeight:600,color:'#C8961E',marginTop:6,lineHeight:1.4}}>{pred.markets.boundaries?.market}</div>
                                </div>
                            </div>
                        </div>
                        )}

                        {/* ── PLAYER WEAKNESS PROFILE ── */}
                        {pred.playerWeaknesses && pred.playerWeaknesses.length > 0 && (
                        <div className="card card-red" style={{padding:20,marginBottom:14}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                                <div>
                                    <div style={{fontSize:10,fontWeight:700,color:'#64748B',letterSpacing:1}}>🎯 PLAYER WEAKNESS PROFILE</div>
                                    <div style={{fontSize:12,color:'#64748B',marginTop:2}}>Tactical betting intelligence</div>
                                </div>
                                <span style={{fontSize:10,padding:'3px 8px',borderRadius:10,background:'#FFF0F0',color:'#E53E3E',fontWeight:700}}>EDGE</span>
                            </div>
                            <div style={{display:'grid',gap:10}}>
                                {pred.playerWeaknesses.map((pw,i) => (
                                    <div key={i} style={{padding:'12px 14px',background:'#EEF2FF',borderRadius:10,border:'1px solid #fecaca'}}>
                                        <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                                            <span style={{fontSize:13,fontWeight:700,color:'#0A0A0A'}}>{pw.player}</span>
                                            <span style={{fontSize:11,fontWeight:700,color:'#E53E3E'}}>{pw.struggleRate}% struggle</span>
                                        </div>
                                        <div style={{fontSize:12,color:'#64748B',marginBottom:6}}>Weakness: <strong>{pw.weakness}</strong></div>
                                        <div style={{fontSize:11,padding:'5px 10px',background:'#C8961E20',borderRadius:6,color:'#C8961E',fontWeight:600}}>💰 {pw.market}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}

                        <div className="cr" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14 }}>
                            <div className="card" style={{ padding:18,display:"flex",gap:14,alignItems:"center" }}>
                                <span style={{ fontSize:32 }}>{pred.weatherImpact?.emoji||"☀️"}</span>
                                <div>
                                    <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1 }}>WEATHER</div>
                                    <div style={{ fontSize:20,fontWeight:800 }}>{pred.weather?.temp||28}°C</div>
                                    <div style={{ fontSize:11,color:C.muted }}>{pred.weather?.condition||"SUNNY"}</div>
                                </div>
                            </div>
                            <div className="card" style={{ padding:18,display:"flex",gap:14,alignItems:"center" }}>
                                <span style={{ fontSize:32 }}>🏏</span>
                                <div>
                                    <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1 }}>PITCH</div>
                                    <div style={{ fontSize:15,fontWeight:700 }}>{pred.pitchLabel||"DRY / SPIN"}</div>
                                    <div style={{ fontSize:11,color:C.muted }}>{pred.pitchCondition||"SHOWING WEAR"}</div>
                                </div>
                            </div>
                        </div>
                        <div className="card" style={{ padding:22,marginBottom:14 }}>
                            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                                <div>
                                    <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1 }}>OVER-BY-OVER PREDICTIONS</div>
                                    <div style={{ fontSize:12,color:C.muted,marginTop:2 }}>{pred.phaseEmoji} {pred.currentPhase||"MIDDLE OVERS"}</div>
                                </div>
                                {!isPremium && <span style={{ fontSize:11,color:C.accent,fontWeight:600 }}>1 free · Upgrade for all 5</span>}
                            </div>
                            <div className="og" style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8 }}>
                                {(pred.nextOvers||MOCK_PRED.nextOvers).map((ov,i) => {
                                    const wc = ov.wicketProb>40?C.red:ov.wicketProb>25?C.amber:C.green;
                                    return (
                                        <div key={i} className={`over-card ${activeOver===i?"sel":""}`} onClick={() => setActiveOver(i)}>
                                            {i===0 && <div style={{ position:"absolute",top:-1,left:-1,right:-1,height:3,background:C.accent,borderRadius:"14px 14px 0 0" }} />}
                                            <div style={{ fontSize:9,color:C.muted,fontWeight:500,marginBottom:2 }}>OVER {ov.over}</div>
                                            <div style={{ fontSize:8,fontWeight:700,color:ov.phase==="POWERPLAY"?C.accent:ov.phase==="DEATH OVERS"?C.red:C.amber,marginBottom:8,letterSpacing:0.3 }}>
                                                {ov.phaseEmoji} {ov.phase?.split(" ")[0]}
                                            </div>
                                            <div style={{ fontSize:22,fontWeight:800,letterSpacing:-0.5,lineHeight:1 }}>{ov.runRange}</div>
                                            <div style={{ fontSize:9,color:C.muted,marginBottom:8 }}>runs</div>
                                            <div style={{ background:`${wc}15`,borderRadius:6,padding:"4px 4px" }}>
                                                <div style={{ fontSize:9,fontWeight:700,color:wc }}>{ov.wicketProb>40?"⚠️ Likely":ov.wicketProb>25?"Possible":"Safe"}</div>
                                                <div style={{ fontSize:8,color:C.muted }}>{ov.wicketProb}% wkt</div>
                                            </div>
                                            <div style={{ fontSize:8,color:C.muted,marginTop:5 }}>{ov.confidence>=80?"High":ov.confidence>=60?"Med":"Low"} conf</div>
                                            {i>0 && !isPremium && (
                                                <div className="lock" onClick={() => setShowPaywall(true)}>
                                                    <span style={{ fontSize:18 }}>🔒</span>
                                                    <span style={{ fontSize:10,fontWeight:600 }}>Premium</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {(pred.nextOvers||MOCK_PRED.nextOvers)[activeOver] && (
                                <div style={{ marginTop:12,padding:"12px 14px",background:C.bg,borderRadius:10,fontSize:12,color:C.text,lineHeight:1.6 }}>
                                    {(pred.nextOvers||MOCK_PRED.nextOvers)[activeOver].tip}
                                </div>
                            )}
                        </div>
                        <div className="cr" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                            <div className="card" style={{ padding:18 }}>
                                <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10 }}>🔵 POWERPLAY</div>
                                <div style={{ fontSize:22,fontWeight:800 }}>{pred.powerplay?.expectedScore||58} runs</div>
                                <div style={{ fontSize:12,color:C.muted,marginTop:4,lineHeight:1.6 }}>{pred.powerplay?.tip||MOCK_PRED.powerplay.tip}</div>
                            </div>
                            <div className="card" style={{ padding:18,position:"relative",overflow:"hidden" }}>
                                <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,marginBottom:10 }}>🔴 DEATH OVERS</div>
                                <div style={{ fontSize:22,fontWeight:800 }}>{pred.deathOvers?.expectedRR||10.8} RR</div>
                                <div style={{ fontSize:12,color:C.muted,marginTop:4,lineHeight:1.6 }}>{pred.deathOvers?.tip||MOCK_PRED.deathOvers.tip}</div>
                                {!isPremium && <div className="lock" onClick={() => setShowPaywall(true)}><span style={{ fontSize:18 }}>🔒</span><span style={{ fontSize:10,fontWeight:600 }}>Premium</span></div>}
                            </div>
                        </div>
                        </div>
                        )}
                    </main>

                    <aside className="sr" style={{ borderLeft:`1px solid ${C.border}`,padding:"18px 14px",background:C.surface,display:"flex",flexDirection:"column",gap:14 }}>
                        <div>
                            <div style={{ fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1.5,marginBottom:12 }}>AI ENGINE</div>
                            {[["Accuracy","78.2%",78],["Confidence",`${prob}%`,prob],["Records","1.7M",85],["Venues","877",90]].map(([l,v,p]) => (
                                <div key={l} style={{ marginBottom:12 }}>
                                    <div style={{ display:"flex",justifyContent:"space-between",marginBottom:3 }}>
                                        <span style={{ fontSize:11,color:C.muted }}>{l}</span>
                                        <span style={{ fontSize:11,fontWeight:700 }}>{v}</span>
                                    </div>
                                    <div style={{ height:3,background:C.bg,borderRadius:3,overflow:"hidden" }}>
                                        <div style={{ height:"100%",width:`${p}%`,background:C.accent,borderRadius:3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!isPremium && (
                            <div style={{ background:C.text,borderRadius:14,padding:16,color:"#fff" }}>
                                <div style={{ fontSize:13,fontWeight:700,marginBottom:6 }}>⚡ Unlock Premium</div>
                                <div style={{ fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.5,marginBottom:12 }}>All 5 overs · Death intel · Pitch tracker · Real-time signals</div>
                                <button onClick={() => setShowPaywall(true)} style={{ width:"100%",background:C.gold,color:C.text,border:"none",borderRadius:8,padding:"9px",fontSize:13,fontWeight:700,cursor:"pointer" }}>From £9.99/mo</button>
                            </div>
                        )}
                        <div style={{ fontSize:10,color:C.muted,lineHeight:1.6,textAlign:"center",marginTop:"auto" }}>
                            {pred.dataSource||"877 venues · 1.7M records"}<br />
                            <span style={{ color:C.red,fontWeight:600 }}>18+ · BeGambleAware.org</span>
                        </div>
                    </aside>
                </div>
            )}

            {activeTab === "matches" && (
                <div className="fade" style={{ maxWidth:680,margin:"0 auto",padding:"22px 16px" }}>

                    {/* LIVE NOW */}
                    {liveMatches.filter(m => m.status === "LIVE").length > 0 && (
                        <div style={{ marginBottom:24 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                                <div style={{ width:8,height:8,borderRadius:"50%",background:C.red,animation:"pulse 1.5s infinite" }}/>
                                <span style={{ fontSize:13,fontWeight:700,color:C.red,letterSpacing:1 }}>LIVE NOW</span>
                                <span style={{ fontSize:11,color:C.muted }}>({liveMatches.filter(m=>m.status==="LIVE").length} matches)</span>
                            </div>
                            {liveMatches.filter(m => m.status === "LIVE").map(m => (
                                <MatchCard key={m.id} m={m} onClick={() => { setSelectedMatch(m); setActiveTab("predict"); window.scrollTo({top:0,behavior:"smooth"}); }} />
                            ))}
                        </div>
                    )}

                    {/* UPCOMING */}
                    {liveMatches.filter(m => m.status === "UPCOMING").length > 0 && (
                        <div style={{ marginBottom:24 }}>
                            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                                <span style={{ fontSize:13,fontWeight:700,color:C.accent,letterSpacing:1 }}>🗓️ UPCOMING</span>
                                <span style={{ fontSize:11,color:C.muted }}>({liveMatches.filter(m=>m.status==="UPCOMING").length} matches)</span>
                            </div>
                            {liveMatches.filter(m => m.status === "UPCOMING").map(m => (
                                <MatchCard key={m.id} m={m} onClick={() => { setSelectedMatch(m); setActiveTab("predict"); window.scrollTo({top:0,behavior:"smooth"}); }} />
                            ))}
                        </div>
                    )}

                    {/* RECENT RESULTS */}
                    {liveMatches.filter(m => m.status === "ENDED").length > 0 && (
                        <div>
                            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                                <span style={{ fontSize:13,fontWeight:700,color:C.muted,letterSpacing:1 }}>✓ RECENT RESULTS</span>
                                <span style={{ fontSize:11,color:C.muted }}>({liveMatches.filter(m=>m.status==="ENDED").length} matches)</span>
                            </div>
                            {liveMatches.filter(m => m.status === "ENDED").map(m => (
                                <MatchCard key={m.id} m={m} onClick={() => { setSelectedMatch(m); setActiveTab("predict"); window.scrollTo({top:0,behavior:"smooth"}); }} />
                            ))}
                        </div>
                    )}

                </div>
            )}

            {activeTab === "media" && (
                <MediaSection />
            )}

            {activeTab === "insights" && (
                <BettingInsights pred={pred} liveMatches={liveMatches} />
            )}

            <nav className="mn">
                {[["📊","Predict","predict"],["🏏","Matches","matches"],["💡","Insights","insights"],["📺","Media","media"],["⚡","Upgrade","up"]].map(([icon,label,key]) => (
                    <button key={key} className="mt" onClick={() => key==="up"?setShowPaywall(true):setActiveTab(key)} style={{ opacity:activeTab===key?1:0.4 }}>
                        <span style={{ fontSize:22 }}>{icon}</span>
                        <span style={{ fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.7)" }}>{label}</span>
                    </button>
                ))}
            </nav>

            {showPaywall && (
                <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:300,display:"flex",alignItems:"flex-end" }} onClick={() => setShowPaywall(false)}>
                    <div style={{ width:"100%",maxWidth:500,margin:"0 auto",background:C.surface,borderRadius:"20px 20px 0 0",padding:26 }} onClick={e=>e.stopPropagation()}>
                        <div style={{ textAlign:"center",marginBottom:22 }}>
                            <div style={{ fontSize:22,marginBottom:8 }}>⚡</div>
                            <div style={{ fontSize:21,fontWeight:800,marginBottom:6 }}>Unlock Premium</div>
                            <div style={{ fontSize:13,color:C.muted }}>All 5 over predictions · Death overs intel · Pitch tracker</div>
                        </div>
                        {paymentStep==="plans" && (
                            <>
                                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14 }}>
                                    {[{plan:"monthly",price:"£9.99",per:"/mo",label:"Monthly",sub:"Cancel anytime"},{plan:"annual",price:"£59.99",per:"/yr",label:"Annual ★",sub:"Save 50%"}].map(p => (
                                        <div key={p.plan} onClick={() => setSelectedPlan(p.plan)}
                                            style={{ border:`2px solid ${selectedPlan===p.plan?C.accent:C.border}`,borderRadius:12,padding:14,cursor:"pointer",background:selectedPlan===p.plan?"#F0F7FF":C.surface,textAlign:"center" }}>
                                            <div style={{ fontSize:12,fontWeight:600,marginBottom:4 }}>{p.label}</div>
                                            <div style={{ fontSize:22,fontWeight:800 }}>{p.price}</div>
                                            <div style={{ fontSize:11,color:C.muted }}>{p.per} · {p.sub}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-p" onClick={() => setPaymentStep("email")}>Continue</button>
                            </>
                        )}
                        {paymentStep==="email" && (
                            <>
                                <input type="email" placeholder="Your email address" value={emailInput} onChange={e=>setEmailInput(e.target.value)}
                                    style={{ width:"100%",padding:"13px 16px",borderRadius:10,border:`1.5px solid ${C.border}`,fontSize:14,marginBottom:10,outline:"none",fontFamily:"Inter,system-ui" }} />
                                <button className="btn-p" onClick={() => handleCheckout(selectedPlan)} disabled={checkingPayment}>
                                    {checkingPayment?"Loading...":`Pay ${selectedPlan==="annual"?"£59.99/yr":"£9.99/mo"}`}
                                </button>
                            </>
                        )}
                        <div style={{ textAlign:"center",marginTop:10,fontSize:11,color:C.muted }}>18+ · Gamble responsibly · BeGambleAware.org</div>
                        <button onClick={() => { setShowPaywall(false); setPaymentStep("plans"); }} style={{ display:"block",width:"100%",background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",marginTop:8 }}>Maybe later</button>
                    </div>
                </div>
            )}
        </div>
    );
}
