/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const API_BASE = "https://web-production-91f0.up.railway.app";

const C = {
    bg: "#EEF2FF", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B", accent: "#1E2D6B",
    green: "#00B894", red: "#E53E3E", amber: "#F59E0B", gold: "#C8961E",
    navy: "#1E2D6B", navyMid: "#2A3F82", navyLight: "#4A5FAD",
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
    "india": BASE_LOGO + "/381800/381895.png",
    "australia": BASE_LOGO + "/382700/382733.png",
    "england": BASE_LOGO + "/381800/381894.png",
    "pakistan": BASE_LOGO + "/381800/381891.png",
    "new zealand": BASE_LOGO + "/340500/340505.png",
    "nz": BASE_LOGO + "/340500/340505.png",
    "south africa": BASE_LOGO + "/382700/382733.png",
    "sa": BASE_LOGO + "/382700/382733.png",
    "sri lanka": BASE_LOGO + "/340500/340505.png",
    "sl": BASE_LOGO + "/340500/340505.png",
    "west indies": BASE_LOGO + "/317600/317615.png",
    "wi": BASE_LOGO + "/317600/317615.png",
    "bangladesh": BASE_LOGO + "/341400/341456.png",
    "afghanistan": BASE_LOGO + "/381800/381893.png",
    "ireland": BASE_LOGO + "/349300/349350.png",
    "zimbabwe": BASE_LOGO + "/383900/383967.png",
    "india women": BASE_LOGO + "/381800/381895.png",
    "australia women": BASE_LOGO + "/382700/382733.png",
    "england women": BASE_LOGO + "/381800/381894.png",
    "pakistan women": BASE_LOGO + "/381800/381891.png",
    "west indies women": BASE_LOGO + "/317600/317615.png",
    "new zealand women": BASE_LOGO + "/340500/340505.png",
    "south africa women": BASE_LOGO + "/382700/382733.png",
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
    "north west": "#8B4513", "kzn inland": "#006400",
};

function TeamLogo({ name, size = 32, imageId = 0 }) {
    const [imgError, setImgError] = React.useState(false);
    const abbr = (name || "?").replace(/[^A-Za-z]/g, "").substring(0, 3).toUpperCase() || "???";
    const colors = ["#1E2D6B","#C8961E","#00B894","#E53E3E","#6B21A8","#DD6B20","#0369A1","#065F46"];
    const teamBg = colors[(abbr.charCodeAt(0) || 65) % colors.length];
    const proxyUrl = imageId ? "https://web-production-91f0.up.railway.app/team-image/" + imageId : null;
    if (!proxyUrl || imgError) {
        return (
            <div style={{ width: size, height: size, borderRadius: "50%", background: teamBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "2px solid rgba(255,255,255,0.25)", boxShadow: "0 2px 8px rgba(0,0,0,0.25)" }}>
                <span style={{ fontFamily: "Inter,system-ui", fontSize: size * 0.32, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>{abbr}</span>
            </div>
        );
    }
    return (
        <img src={proxyUrl} alt={name} onError={() => setImgError(true)}
            style={{ width: size, height: size, objectFit: "contain", borderRadius: "50%", background: "#fff", padding: 2, flexShrink: 0, border: "2px solid " + teamBg, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }} />
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
    const CSS2 = `@keyframes blink2 { 0%,100%{opacity:1} 50%{opacity:0.3} } @keyframes labelPulse { 0%,100%{box-shadow: 0 0 12px currentColor, 0 2px 8px rgba(0,0,0,0.2)} 50%{box-shadow: 0 0 24px currentColor, 0 4px 16px rgba(0,0,0,0.3)} }`;
    return (
        <div style={{ padding: "0 0 4px 0", marginBottom: 14 }}>
            <style>{CSS2}</style>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E24B4A", animation: "blink2 1.5s infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>Next over intelligence</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>Over {ov1.over} - {ov1.phase}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "#1E2D6B", border: "2px solid #60A5FA", borderRadius: 12, padding: 14, boxShadow: "0 0 16px rgba(96,165,250,0.3)" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>NOW · Over {ov1.over}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                        <span style={{ fontSize: 32, fontWeight: 900, color: "#FFFFFF" }}>{ov1.runRange}</span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>runs expected</span>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Bowling</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: pred.bowlingFactor <= 0.85 ? "#3B6D11" : pred.bowlingFactor >= 1.1 ? "#A32D2D" : "#64748B" }}>{bowlerQuality}</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, (pred.bowlingFactor || 1) * 60)}%`, height: "100%", background: pred.bowlingFactor <= 0.85 ? "#22c55e" : pred.bowlingFactor >= 1.1 ? "#ef4444" : "#60A5FA", borderRadius: 3 }} />
                        </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>Wicket risk</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: ov1.wicketProb > 40 ? "#ef4444" : ov1.wicketProb > 25 ? "#f59e0b" : "#22c55e" }}>{wicketLabel1} · {ov1.wicketProb}%</span>
                        </div>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.12)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${ov1.wicketProb}%`, height: "100%", background: ov1.wicketProb > 40 ? "#ef4444" : ov1.wicketProb > 25 ? "#f59e0b" : "#22c55e", borderRadius: 4 }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {spinBoost > 5 && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#FAEEDA", color: "#854F0B" }}>Spin +{spinBoost}%</span>}
                        {!dewSoon && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#EEF2FF", color: "#64748B" }}>No dew</span>}
                        {dewSoon && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#E6F1FB", color: "#185FA5" }}>Dew incoming</span>}
                    </div>
                </div>
                <div style={{ background: "#111A3E", border: "1.5px dashed rgba(255,255,255,0.2)", borderRadius: 12, padding: 14, opacity: 0.85 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>NEXT · Over {ov2.over}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                        <span style={{ fontSize: 32, fontWeight: 900, color: "rgba(255,255,255,0.7)" }}>{ov2.runRange}</span>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>runs expected</span>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Batting</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: pred.battingFactor >= 1.15 ? "#3B6D11" : pred.battingFactor <= 0.85 ? "#A32D2D" : "#64748B" }}>{batQuality}</span>
                        </div>
                        <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, (pred.battingFactor || 1) * 60)}%`, height: "100%", background: pred.battingFactor >= 1.15 ? "#00FF94" : pred.battingFactor <= 0.85 ? "#FF4444" : "#60A5FA", borderRadius: 4 }} />
                        </div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: "#64748B" }}>Wicket risk</span>
                            <span style={{ fontSize: 13, fontWeight: 800, color: ov2.wicketProb > 40 ? "#ef4444" : ov2.wicketProb > 25 ? "#f59e0b" : "#22c55e" }}>{wicketLabel2} · {ov2.wicketProb}%</span>
                        </div>
                        <div style={{ height: 6, background: "#EEF2FF", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${ov2.wicketProb}%`, height: "100%", background: ov2.wicketProb > 40 ? "#ef4444" : ov2.wicketProb > 25 ? "#f59e0b" : "#22c55e", borderRadius: 4 }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {ov2.phase === "DEATH OVERS" && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#FCEBEB", color: "#A32D2D" }}>Death overs</span>}
                        {dewSoon && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#E6F1FB", color: "#185FA5" }}>Dew incoming</span>}
                        {!dewSoon && ov2.phase !== "DEATH OVERS" && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#EEF2FF", color: "#64748B" }}>Normal</span>}
                    </div>
                </div>
            </div>
            {hasHistory && (
                <div style={{ background: "#fff", border: "0.5px solid #E2E8F0", borderRadius: 12, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 12, color: "#64748B" }}>Run rate trend</span>
                        <span style={{ fontSize: 10, color: "#94A3B8" }}>runs / over</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                        {history.slice(-4).map((h, i) => {
                            const rr = h.over > 0 ? (h.runs / h.over).toFixed(1) : "—";
                            const bh = Math.max(12, Math.round((parseFloat(rr) / 16) * 70));
                            return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 600 }}>{rr}</span>
                                <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: i === 0 ? "#B5D4F4" : i === 1 ? "#85B7EB" : "#378ADD", height: `${bh}px` }} />
                                <span style={{ fontSize: 10, color: "#64748B" }}>ov {h.over}</span>
                            </div>
                            );
                        })}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                            <span style={{ fontSize: 9, color: "#60A5FA", fontWeight: 700 }}>{ov1.expectedRuns.toFixed(1)}</span>
                            <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: "rgba(96,165,250,0.15)", border: "1.5px dashed #60A5FA", height: `${predBarH}px` }} />
                            <span style={{ fontSize: 10, color: "#60A5FA", fontWeight: 700 }}>ov {ov1.over}</span>
                        </div>
                    </div>
                </div>
            )}
            <div style={{ background: "#fff", border: "0.5px solid #E2E8F0", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>Pitch behaviour now</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <div style={{ textAlign: "center", padding: "10px 6px", background: "#EEF2FF", borderRadius: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 500, color: spinBoost > 5 ? "#BA7517" : "#64748B" }}>{spinBoost > 0 ? `+${spinBoost}%` : "-"}</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>Spin turn</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "10px 6px", background: "#EEF2FF", borderRadius: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 500, color: "#0A0A0A" }}>{pitchCond.split(" ")[0]}</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>Surface</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "10px 6px", background: dewSoon ? "#E6F1FB" : "#EEF2FF", borderRadius: 8 }}>
                        <div style={{ fontSize: 18, fontWeight: 500, color: dewSoon ? "#185FA5" : "#64748B" }}>{dewSoon ? "Soon" : "None"}</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>Dew factor</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MatchPill({ m, selected, onClick }) {
    return (
        <div className={`match-pill ${selected ? "sel" : ""}`} onClick={() => { onClick(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ opacity: m.status === "ENDED" ? 0.75 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: "#64748B" }}>{m.day} - {m.detail?.split("")[0]?.trim().slice(0, 18)}</span>
                <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 5, background: m.status === "LIVE" ? "#FFF0F0" : m.status === "UPCOMING" ? "#EFF6FF" : "#F0F0F0", color: m.status === "LIVE" ? "#E53E3E" : m.status === "UPCOMING" ? "#1E2D6B" : "#64748B" }}>
                    {m.status === "LIVE" ? "LIVE" : m.status === "UPCOMING" ? "SOON" : "ENDED"}
                </span>
            </div>
            {[{ n: m.t1, s: m.t1Score, w: m.t1Wkts, b: true, imgId: m.t1ImageId || 0 }, { n: m.t2, s: m.t2Score, b: false, imgId: m.t2ImageId || 0 }].map(({ n, s, w, b, imgId }) => (
                <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <TeamLogo name={n} size={16} imageId={imgId} />
                        <span style={{ fontSize: 11, fontWeight: b ? 600 : 400, color: b ? "#0A0A0A" : "#64748B" }}>{n}</span>
                    </div>
                    {s != null && <span style={{ fontSize: 11, fontWeight: b ? 700 : 400, color: b ? "#0A0A0A" : "#64748B" }}>{w != null ? `${s}/${w}` : s}</span>}
                </div>
            ))}
        </div>
    );
}

function MatchCard({ m, onClick }) {
    return (
        <div className="card" style={{ padding: 16, marginBottom: 10, cursor: "pointer", opacity: m.status === "ENDED" ? 0.8 : 1 }} onClick={onClick}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{m.day} - {m.detail?.split("")[0]?.trim()}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: m.status === "LIVE" ? "#FFF0F0" : m.status === "UPCOMING" ? "#EFF6FF" : "#F0F0F0", color: m.status === "LIVE" ? "#E53E3E" : m.status === "UPCOMING" ? "#1E2D6B" : "#64748B" }}>
                    {m.status === "LIVE" ? "LIVE" : m.status === "UPCOMING" ? "UPCOMING" : "ENDED"}
                </span>
            </div>
            {[{ n: m.t1, s: m.t1Score, w: m.t1Wkts, b: true, imgId: m.t1ImageId || 0 }, { n: m.t2, s: m.t2Score, b: false, imgId: m.t2ImageId || 0 }].map(({ n, s, w, b, imgId }) => (
                <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <TeamLogo name={n} size={32} imageId={imgId || 0} />
                        <span style={{ fontSize: 16, fontWeight: b ? 700 : 400, color: b ? "#0A0A0A" : "#64748B" }}>{n}</span>
                    </div>
                    {s != null && <span style={{ fontSize: 16, fontWeight: b ? 700 : 400, color: b ? "#0A0A0A" : "#64748B" }}>{w != null ? `${s}/${w}` : s}</span>}
                </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "0.5px solid #E2E8F0" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: m.status === "ENDED" ? "#64748B" : m.status === "UPCOMING" ? "#1E2D6B" : "#00B894" }}>
                    {m.status === "ENDED" ? "View result →" : m.status === "UPCOMING" ? "Pre-match prediction →" : "View live prediction →"}
                </div>
                {m.status === "LIVE" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#E53E3E", fontWeight: 700 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#E53E3E", animation: "pulse 2s infinite" }} />
                        LIVE
                    </div>
                )}
            </div>
        </div>
    );
}

function MediaSection() {
    const fallbackNews = [
        { tag: "IPL 2026", title: "IPL 2026: Full schedule and match predictions", time: "2h ago", url: "https://www.espncricinfo.com", source: "ESPNcricinfo" },
        { tag: "T20", title: "NZ vs SA T20I series - match preview and predictions", time: "3h ago", url: "https://www.cricbuzz.com", source: "Cricbuzz" },
        { tag: "ANALYSIS", title: "How AI is transforming cricket match predictions", time: "6h ago", url: "https://cricintelligence.com", source: "CricIntelligence" },
        { tag: "WOMEN", title: "Australia Women dominate WI series - key stats", time: "1d ago", url: "https://www.espncricinfo.com", source: "ESPNcricinfo" },
        { tag: "IPL", title: "IPL 2026 schedule: Complete fixtures and venues", time: "1d ago", url: "https://www.iplt20.com", source: "IPL Official" },
        { tag: "STATS", title: "T20 death over specialists - top bowlers in 2025", time: "2d ago", url: "https://www.cricbuzz.com", source: "Cricbuzz" },
    ];
    const C2 = { bg: "#EEF2FF", surface: "#fff", border: "#E2E8F0", accent: "#1E2D6B", muted: "#64748B", text: "#0A0A0A", navy: "#1E2D6B" };
    return (
        <div className="fade" style={{ maxWidth: 680, margin: "0 auto", padding: "22px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>Cricket News and Insights</div>
                <div style={{ fontSize: 11, color: C2.muted }}>Updated live</div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {[{ label: "ESPNcricinfo", url: "https://www.espncricinfo.com/cricket-news" }, { label: "Cricbuzz", url: "https://www.cricbuzz.com/cricket-news" }, { label: "ICC", url: "https://www.icc-cricket.com/media-releases" }, { label: "IPL Official", url: "https://www.iplt20.com/news" }].map(({ label, url }) => (
                    <a key={label} href={url} target="_blank" rel="noreferrer" style={{ fontSize: 12, padding: "6px 14px", borderRadius: 20, background: C2.navy, color: "#fff", textDecoration: "none", fontWeight: 600 }}>{label}</a>
                ))}
            </div>
            {fallbackNews.map(({ tag, title, time, url, source }, i) => {
                const tagColors = { "IPL 2026": ["#1E2D6B","#EFF6FF"], "T20": ["#185FA5","#E6F1FB"], "ANALYSIS": ["#854F0B","#FAEEDA"], "WOMEN": ["#6B21A8","#F3E8FF"], "IPL": ["#1E2D6B","#EFF6FF"], "STATS": ["#166534","#DCFCE7"] };
                const [tc, tbg] = tagColors[tag] || ["#64748B","#F1F5F9"];
                const thumbColors = ["#1E2D6B","#185FA5","#854F0B","#166534","#6B21A8","#A32D2D"];
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

const IPL_2026_SCHEDULE = [
    { t1: "MI", t2: "CSK", venue: "Wankhede Stadium, Mumbai", date: "Mar 22, 2026", time: "7:30 PM IST" },
    { t1: "RCB", t2: "KKR", venue: "M. Chinnaswamy Stadium, Bengaluru", date: "Mar 23, 2026", time: "7:30 PM IST" },
    { t1: "SRH", t2: "DC", venue: "Rajiv Gandhi Intl. Stadium, Hyderabad", date: "Mar 24, 2026", time: "7:30 PM IST" },
    { t1: "PBKS", t2: "RR", venue: "Maharaja Yadavindra Singh Stadium, Mullanpur", date: "Mar 25, 2026", time: "7:30 PM IST" },
    { t1: "GT", t2: "LSG", venue: "Narendra Modi Stadium, Ahmedabad", date: "Mar 26, 2026", time: "7:30 PM IST" },
    { t1: "CSK", t2: "RCB", venue: "MA Chidambaram Stadium, Chennai", date: "Mar 27, 2026", time: "3:30 PM IST" },
];

const CRICKET_INSIGHTS = [
    {
        title: "How AI Predicts Cricket Win Probability",
        summary: "Machine learning models trained on over 1.7 million historical matches can identify patterns humans miss — from pitch conditions to bowling matchups. CricIntelligence uses a multi-layer model that updates every ball.",
        tag: "AI & Cricket",
        readTime: "4 min read",
    },
    {
        title: "IPL 2026 Season Preview: Key Stats & AI Predictions",
        summary: "IPL 2026 promises to be one of the most competitive seasons yet. With teams reshuffled after the mega auction, our AI models have re-trained on latest form data to deliver more accurate over-by-over predictions.",
        tag: "IPL 2026",
        readTime: "5 min read",
    },
    {
        title: "Powerplay vs Death Overs: What the Data Says",
        summary: "Analysis of 50,000+ T20 innings reveals that death-over run rate is 40% more predictable than powerplay. Our model weights this insight to improve accuracy in the final 5 overs of any innings.",
        tag: "Analysis",
        readTime: "3 min read",
    },
    {
        title: "Pitch Conditions & Their Impact on Match Outcomes",
        summary: "From the turning tracks of Chepauk to the pace-friendly surfaces of Perth, venue data accounts for up to 18% of our win probability model's final output.",
        tag: "Venue Intelligence",
        readTime: "4 min read",
    },
];

const TEAM_FORM = [
    { team: "MI", p: 10, w: 7, l: 3, nrr: "+0.82", form: ["W","W","L","W","W"] },
    { team: "CSK", p: 10, w: 6, l: 4, nrr: "+0.45", form: ["L","W","W","W","L"] },
    { team: "RCB", p: 10, w: 6, l: 4, nrr: "+0.31", form: ["W","L","W","W","W"] },
    { team: "KKR", p: 10, w: 5, l: 5, nrr: "+0.12", form: ["W","W","L","L","W"] },
    { team: "SRH", p: 10, w: 5, l: 5, nrr: "-0.05", form: ["L","W","L","W","W"] },
    { team: "DC",  p: 10, w: 4, l: 6, nrr: "-0.28", form: ["L","L","W","L","W"] },
];

function NoMatchesScreen({ upcomingMatches }) {
    const [tab, setTab] = React.useState("schedule");

    // Use live upcoming matches if available, else show message
    const scheduleMatches = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches : [];

    return (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>

            {/* Hero */}
            <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "28px 28px 24px", marginBottom: 24, color: "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#C8961E", letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>IPL 2026 · AI Predictions</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>No Live Matches Right Now</h2>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 20px", lineHeight: 1.6, maxWidth: 480 }}>
                    Live predictions appear automatically when matches go live. Meanwhile, explore upcoming fixtures & cricket analysis below.
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {[["877", "Venues tracked"], ["1.7M", "Matches analysed"], ["78.2%", "AI accuracy"]].map(([v, l]) => (
                        <div key={l} style={{ background: "rgba(255,255,255,0.12)", borderRadius: 10, padding: "10px 16px", textAlign: "center", minWidth: 100 }}>
                            <div style={{ fontSize: 20, fontWeight: 900, color: "#C8961E" }}>{v}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{l}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: `1px solid ${C.border}`, paddingBottom: 0 }}>
                {[["schedule", "📅 Upcoming Matches"], ["form", "📊 Team Form"], ["insights", "💡 Cricket Insights"]].map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)} style={{
                        background: "none", border: "none", cursor: "pointer", padding: "10px 16px",
                        fontSize: 13, fontWeight: tab === k ? 700 : 500,
                        color: tab === k ? C.navy : C.muted,
                        borderBottom: tab === k ? `2px solid ${C.navy}` : "2px solid transparent",
                        marginBottom: -1, transition: "all .15s"
                    }}>{l}</button>
                ))}
            </div>

            {/* Schedule Tab - Live upcoming matches */}
            {tab === "schedule" && (
                <div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>
                        {scheduleMatches.length > 0 ? "Upcoming fixtures — predictions go live at match start" : "No upcoming matches found — check back soon"}
                    </div>
                    {scheduleMatches.length > 0 ? scheduleMatches.map((m, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.navy }}>{m.t1}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.bg, borderRadius: 6, padding: "3px 8px" }}>vs</div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.navy }}>{m.t2}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.detail || m.day || "IPL 2026"}</div>
                                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{m.rawStatus || "Upcoming"}</div>
                            </div>
                            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: C.navy }}>
                                Prediction ready at start
                            </div>
                        </div>
                    )) : (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: C.muted }}>
                            <div style={{ fontSize: 32, marginBottom: 12 }}>🏏</div>
                            <div style={{ fontSize: 15, fontWeight: 600 }}>No upcoming matches scheduled</div>
                            <div style={{ fontSize: 13, marginTop: 8 }}>Live predictions will appear here automatically when IPL 2026 matches are scheduled</div>
                        </div>
                    )}
                </div>
            )}

            {/* Team Form Tab */}
            {tab === "form" && (
                <div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>IPL 2026 points table & recent form (last 5 matches)</div>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 40px 40px 80px 100px", gap: 0, background: C.bg, padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
                            {["Team","P","W","L","NRR","Form"].map(h => (
                                <div key={h} style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>{h}</div>
                            ))}
                        </div>
                        {TEAM_FORM.map((t, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 40px 40px 40px 80px 100px", gap: 0, padding: "13px 20px", borderBottom: i < TEAM_FORM.length - 1 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                                <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>{t.team}</div>
                                <div style={{ fontSize: 13, color: C.text }}>{t.p}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{t.w}</div>
                                <div style={{ fontSize: 13, color: C.red }}>{t.l}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: parseFloat(t.nrr) >= 0 ? C.green : C.red }}>{t.nrr}</div>
                                <div style={{ display: "flex", gap: 3 }}>
                                    {t.form.map((r, j) => (
                                        <div key={j} style={{ width: 16, height: 16, borderRadius: 4, background: r === "W" ? C.green : C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 10, textAlign: "center" }}>* Form and standings are indicative. Live data updates when matches are in progress.</div>
                </div>
            )}

            {/* Insights Tab */}
            {tab === "insights" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {CRICKET_INSIGHTS.map((a, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px", display: "flex", flexDirection: "column", gap: 10 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontSize: 11, fontWeight: 700, background: C.bg, color: C.navy, borderRadius: 6, padding: "3px 9px", border: `1px solid ${C.border}` }}>{a.tag}</span>
                                <span style={{ fontSize: 11, color: C.muted }}>{a.readTime}</span>
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, lineHeight: 1.4 }}>{a.title}</div>
                            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{a.summary}</div>
                        </div>
                    ))}
                </div>
            )}

            <div style={{ marginTop: 28, textAlign: "center", fontSize: 12, color: C.muted }}>
                Page refreshes automatically every 30 seconds · Live predictions activate when a match starts
            </div>
        </div>
    );
}

function LiveScorecard({ batters, bowler }) {
    if (!batters || batters.length === 0) return null;
    return (
        <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>

            {/* Header */}
            <div style={{ background: "rgba(200,150,30,0.15)", borderBottom: "1px solid rgba(200,150,30,0.25)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "inline-block", boxShadow: "0 0 6px #EF4444", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#C8961E", letterSpacing: 1.5 }}>LIVE SCORECARD</span>
            </div>

            <div style={{ padding: "12px 14px" }}>
                {/* Batting section */}
                <div style={{ marginBottom: 12 }}>
                    {/* Column headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 36px 36px 52px", gap: 4, marginBottom: 6, padding: "0 4px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 0.8 }}>BATTER</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>R</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>B</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>SR</span>
                    </div>

                    {batters.map(function(b, i) {
                        const srColor = b.sr >= 150 ? "#22C55E" : b.sr >= 120 ? "#F59E0B" : b.sr >= 80 ? "#E2E8F0" : "#EF4444";
                        const srBg = b.sr >= 150 ? "rgba(34,197,94,0.12)" : b.sr >= 120 ? "rgba(245,158,11,0.12)" : "transparent";
                        return (
                            <div key={i} style={{
                                display: "grid", gridTemplateColumns: "1fr 36px 36px 52px", gap: 4,
                                padding: "8px 4px", borderRadius: 8,
                                background: b.isStriker ? "rgba(255,255,255,0.05)" : "transparent",
                                marginBottom: 4, alignItems: "center"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {b.isStriker
                                        ? <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 900 }}>▶</span>
                                        : <span style={{ width: 10, display: "inline-block" }} />
                                    }
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: b.isStriker ? 800 : 500, color: b.isStriker ? "#FFFFFF" : "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 85 }}>
                                            {b.name}
                                        </div>
                                        {b.isStriker && <div style={{ fontSize: 9, color: "#22C55E", fontWeight: 600, letterSpacing: 0.5 }}>ON STRIKE</div>}
                                    </div>
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", textAlign: "right" }}>{b.runs ?? 0}</span>
                                <span style={{ fontSize: 12, color: "#94A3B8", textAlign: "right" }}>{b.balls ?? 0}</span>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: srColor, background: srBg, padding: "2px 5px", borderRadius: 5 }}>
                                        {b.sr ? Math.round(b.sr) : 0}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 10 }} />

                {/* Bowling section */}
                {bowler && bowler.name && (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 28px 24px 44px", gap: 4, marginBottom: 6, padding: "0 4px" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 0.8 }}>BOWLER</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>O</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>R</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>W</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>ECO</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 28px 28px 24px 44px", gap: 4, padding: "8px 4px", borderRadius: 8, background: "rgba(255,255,255,0.05)", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontSize: 10, color: "#F59E0B", fontWeight: 900 }}>⚡</span>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 80 }}>{bowler.name}</div>
                                    <div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 600, letterSpacing: 0.5 }}>BOWLING</div>
                                </div>
                            </div>
                            <span style={{ fontSize: 12, color: "#CBD5E1", textAlign: "right" }}>{bowler.overs ?? 0}</span>
                            <span style={{ fontSize: 12, color: "#CBD5E1", textAlign: "right" }}>{bowler.runs ?? 0}</span>
                            <span style={{ fontSize: 15, fontWeight: 900, textAlign: "right", color: bowler.wickets > 0 ? "#22C55E" : "#E2E8F0" }}>{bowler.wickets ?? 0}</span>
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: 12, fontWeight: 700,
                                    color: bowler.economy <= 6 ? "#22C55E" : bowler.economy <= 9 ? "#F59E0B" : "#EF4444",
                                    background: bowler.economy <= 6 ? "rgba(34,197,94,0.12)" : bowler.economy <= 9 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)",
                                    padding: "2px 5px", borderRadius: 5
                                }}>
                                    {bowler.economy ? bowler.economy.toFixed(1) : "0.0"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


function ClaudeAnalysis({ pred, selectedMatch }) {
    const [analysis, setAnalysis] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [asked, setAsked] = React.useState(false);
    const [matchKey, setMatchKey] = React.useState("");

    // Auto-reset when match changes
    React.useEffect(() => {
        const key = (pred?.team1||"") + (pred?.team2||"") + (selectedMatch?.matchId||"");
        if (key !== matchKey) { setAnalysis(""); setAsked(false); setMatchKey(key); }
    }, [pred, selectedMatch]);

    async function askClaude() {
        if (!pred || loading) return;
        setLoading(true);
        setAsked(true);
        setAnalysis("");
        const batters = (pred.batters||[]).map(b=>`${b.name} ${b.runs}(${b.balls}) SR:${b.sr}`).join(", ") || "N/A";
        const bowler = pred.bowler ? `${pred.bowler.name} ${pred.bowler.overs}ov ECO:${pred.bowler.economy} ${pred.bowler.wickets}wkts` : "N/A";
        const prompt = `You are an elite cricket analyst. Analyze this LIVE match and give sharp, specific predictions.

MATCH: ${pred.team1} vs ${pred.team2} (${pred.matchType?.toUpperCase()||"T20"})
VENUE: ${pred.venue||"Unknown"}
SCORE: ${pred.displayScore} | CRR: ${pred.currentRunRate} | Overs: ${pred.overs}
PITCH: ${pred.pitchLabel||"Unknown"} (${pred.pitchCondition||""})
WEATHER: ${pred.weather?.condition||""} ${pred.weather?.temp||""}C Humidity:${pred.weather?.humidity||""}%
AT CREASE: ${batters}
BOWLING: ${bowler}
PRESSURE INDEX: ${pred.pressureScore||50}/100
ML WIN PROBABILITY: ${pred.aiProbability}% for ${pred.team1}
${pred.target ? `TARGET: ${pred.target} runs | Need: ${pred.runsNeeded} in ${pred.overs} overs | RRR: ${pred.requiredRunRate}` : ""}

Give me:
1. **WIN PREDICTION**  who wins and why (be confident, give %)
2. **NEXT 5 OVERS**  exact runs range expected, wicket risk
3. **GAME-CHANGER**  one factor that will decide this match
4. **STRATEGY CALL**  what should batting/bowling team do RIGHT NOW

Be sharp, specific, bold. No vague statements.`;
        try {
            const res = await fetch(API_BASE + "/claude-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            const text = (data.content||[]).map(c=>c.text||"").join("") || data.error || "No response.";
            setAnalysis(text);
        } catch(e) {
            setAnalysis("Error: " + e.message);
        }
        setLoading(false);
    }

    if (!pred || !pred.team1) return null;

    return (
        <div className="card" style={{ margin: "0 20px 16px", padding: 20, border: "1px solid rgba(139,92,246,0.3)", background: "linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05))" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}></span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#7C3AED", letterSpacing: 1 }}>CLAUDE AI ANALYSIS</span>
                    <span style={{ fontSize: 10, background: "rgba(139,92,246,0.15)", color: "#a78bfa", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>BETA</span>
                </div>
                <button onClick={askClaude} disabled={loading} style={{ background: loading ? "#334155" : "#FFB800", border: "none", color: loading ? "#fff" : "#1A1A1A", padding: "8px 18px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
                    {loading ? <><span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span> Analyzing...</> : asked ? "Refresh" : "Get AI Analysis"}
                </button>
            </div>
            {!asked && !loading && pred && (
                <div style={{ padding: "4px 0" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                        {[
                            { icon: "🎯", label: "WIN PROB", value: `${pred.aiProbability || 50}%`, sub: pred.team1?.split(",")[0] || "Team 1", color: pred.aiProbability >= 60 ? "#00FF94" : pred.aiProbability <= 40 ? "#FF4444" : "#FFB800" },
                            { icon: "⚡", label: "PRESSURE", value: `${pred.pressureScore || 0}/100`, sub: pred.pressureScore > 70 ? "Critical" : pred.pressureScore > 45 ? "High" : "Low", color: pred.pressureScore > 70 ? "#FF4444" : pred.pressureScore > 45 ? "#FFB800" : "#00FF94" },
                            { icon: "📈", label: "RUN RATE", value: pred.currentRunRate || "—", sub: "runs / over", color: "#60A5FA" },
                            { icon: "🏏", label: "PHASE", value: pred.currentPhase?.split(" ")[0] || "—", sub: pred.matchType?.toUpperCase() || "T20", color: "#a78bfa" },
                        ].map(({ icon, label, value, sub, color }) => (
                            <div key={label} style={{ background: "rgba(139,92,246,0.1)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(139,92,246,0.25)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                                    <span style={{ fontSize: 14 }}>{icon}</span>
                                    <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 700, letterSpacing: 1 }}>{label}</span>
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 900, color, lineHeight: 1, marginBottom: 3 }}>{value}</div>
                                <div style={{ fontSize: 11, color: "#64748B" }}>{sub}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center" }}>
                        Click <strong style={{color:"#FFB800"}}>Get AI Analysis</strong> for live match breakdown
                    </div>
                </div>
            )}
            {loading && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#a78bfa", fontSize: 13 }}>
                        <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #a78bfa", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                        Claude is analyzing live match data...
                    </div>
                </div>
            )}
            {analysis && (
                <div style={{ borderTop: "1px solid rgba(139,92,246,0.2)", paddingTop: 14 }}>
                    {analysis.split("\n\n").map((block, i) => {
                        // Section headers like ## 1. WIN PREDICTION
                        if (block.startsWith("## ")) {
                            const title = block.replace(/^##\s*\d*\.?\s*/, "");
                            const icons = {"WIN PREDICTION":"win", "NEXT":"over", "GAME-CHANGER":"key", "STRATEGY":"tip"};
                            const icon = Object.entries(icons).find(([k])=>title.toUpperCase().includes(k));
                            const colors = {win:"#00B894", over:"#60a5fa", key:"#fbbf24", tip:"#a78bfa"};
                            const col = colors[icon?.[1]] || "#a78bfa";
                            return (
                                <div key={i} style={{ marginBottom: 14, background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "12px 14px", borderLeft: `3px solid ${col}` }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: col, letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>{title}</div>
                                    {analysis.split("\n\n")[i+1] && !analysis.split("\n\n")[i+1].startsWith("## ") && !analysis.split("\n\n")[i+1].startsWith("---") ? null : null}
                                </div>
                            );
                        }
                        // Separator lines
                        if (block.trim() === "---") return <div key={i} style={{height:1, background:"rgba(139,92,246,0.15)", margin:"8px 0"}} />;
                        // Bold lines **text**
                        const lines = block.split("\n").filter(l => l.trim());
                        if (!lines.length) return null;
                        return (
                            <div key={i} style={{ marginBottom: 10 }}>
                                {lines.map((line, j) => {
                                    // Bold **text**
                                    const isBold = line.startsWith("**") && line.includes("**:");
                                    const isItem = line.startsWith("- ");
                                    if (isBold) {
                                        const [label, ...rest] = line.replace(/\*\*/g,"").split(":");
                                        return (
                                            <div key={j} style={{ marginBottom: 6 }}>
                                                <span style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}: </span>
                                                <span style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.7 }}>{rest.join(":").trim()}</span>
                                            </div>
                                        );
                                    }
                                    if (isItem) return (
                                        <div key={j} style={{ display:"flex", gap: 8, alignItems:"flex-start", marginBottom: 4, paddingLeft: 8 }}>
                                            <span style={{ color:"#a78bfa", marginTop:2, flexShrink:0 }}></span>
                                            <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{line.substring(2)}</span>
                                        </div>
                                    );
                                    return <p key={j} style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.8, margin: "0 0 4px" }}>{line}</p>;
                                })}
                            </div>
                        );
                    })}
                </div>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("predict");
    const [showLanding, setShowLanding] = useState(() => { try { return !localStorage.getItem("ci_v2"); } catch { return false; } });
    // Load cached data instantly on mount
    const [liveMatches, setLiveMatches] = useState(() => {
        try {
            const cached = localStorage.getItem("ci_matches_cache");
            if (cached) return JSON.parse(cached);
        } catch {}
        return [];
    });
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [pred, setPred] = useState(() => {
        try {
            const cached = localStorage.getItem("ci_pred_cache");
            if (cached) return JSON.parse(cached);
        } catch {}
        return null;
    });
    const [liveStatus, setLiveStatus] = useState(() => {
        try { return localStorage.getItem("ci_matches_cache") ? "cached" : "connecting"; } catch { return "connecting"; }
    });
    const [isFirstLoad, setIsFirstLoad] = useState(() => {
        try { return !localStorage.getItem("ci_matches_cache"); } catch { return true; }
    });
    const [isPredLoading, setIsPredLoading] = useState(false);
        const [isPremium, setIsPremium] = useState(true);
    const hasUserSelectedRef = React.useRef(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [emailInput, setEmailInput] = useState("");
    const [paymentStep, setPaymentStep] = useState("plans");
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [liveTime, setLiveTime] = useState(new Date());
    const [activeOver, setActiveOver] = useState(0);
    const selectedMatchRef = React.useRef(selectedMatch);
    React.useEffect(() => { selectedMatchRef.current = selectedMatch; }, [selectedMatch]);

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);

    // Dynamic page title — improves CTR in Google + browser tab
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

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get("premium") === "true") {
                setIsPremium(true);
                localStorage.setItem("cricintel_premium", "true");
                window.history.replaceState({}, "", window.location.pathname);
            }
        } catch {}
    }, []);

    const handleCheckout = async (plan) => {
        setCheckingPayment(true);
        try {
            const res = await fetch(`${API_BASE}/create-checkout-session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, email: emailInput }) });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch { } finally { setCheckingPayment(false); }
    };

    // Single unified fetch — runs every 5s, fetches matches + prediction + scorecard in parallel
    const fetchLiveData = useCallback(async (overrideMatchId) => {
        if (document.hidden) return;
        try {
            const curMatchId = overrideMatchId || selectedMatchRef.current?.matchId;
            if (overrideMatchId) setIsPredLoading(true);

            // Always fetch matches list
            const matchesPromise = fetch(`${API_BASE}/matches`).then(r => r.ok ? r.json() : null).catch(() => null);

            // Fetch prediction and scorecard in parallel if we have a match
            const predPromise = fetch(`${API_BASE}/predict${curMatchId ? "?match_id=" + curMatchId : ""}`)
                .then(r => r.ok ? r.json() : null).catch(() => null);

            const scorecardPromise = curMatchId
                ? fetch(`${API_BASE}/match/${curMatchId}`).then(r => r.ok ? r.json() : null).catch(() => null)
                : Promise.resolve(null);

            // All three fire at the same time
            const [matchesData, predData, scorecardData] = await Promise.all([matchesPromise, predPromise, scorecardPromise]);

            // Update matches list
            if (matchesData) {
                const list = Array.isArray(matchesData) ? matchesData : matchesData.data || [];
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
                            t1ImageId: m.team1ImageId || 0,
                            t2ImageId: m.team2ImageId || 0,
                            status, rawStatus,
                            day: m.matchType?.toUpperCase() || "T20",
                            detail: m.name || "",
                            t1Score: m.score?.[0]?.r ?? null,
                            t1Wkts: m.score?.[0]?.w ?? null,
                            t2Score: m.score?.[1]?.r ?? null,
                        };
                    });
                    setLiveMatches(mapped);
                    window.__matchList = mapped;
                    setLiveStatus("live");
                    setIsFirstLoad(false);
                    try { localStorage.setItem("ci_matches_cache", JSON.stringify(mapped)); } catch {}
                    const live = mapped.find(m => m.status === "LIVE");
                    const upcoming = mapped.find(m => m.status === "UPCOMING");
                    const best = live || upcoming;
                    if (best && !hasUserSelectedRef.current) setSelectedMatch(best);
                }
            }

            // Merge scorecard into pred — both arrive together, no lag
            if (scorecardData && !scorecardData.error && scorecardData.team1) {
                // Scorecard data takes priority (fresher), merge pred on top
                const merged = { ...scorecardData };
                if (predData && predData.team1) {
                    merged.aiProbability = predData.aiProbability ?? scorecardData.aiProbability;
                    merged.nextOvers = predData.nextOvers ?? scorecardData.nextOvers;
                    merged.overHistory = predData.overHistory ?? scorecardData.overHistory;
                    merged.pitchCondition = predData.pitchCondition ?? scorecardData.pitchCondition;
                    merged.weatherImpact = predData.weatherImpact ?? scorecardData.weatherImpact;
                    merged.bowlingFactor = predData.bowlingFactor ?? scorecardData.bowlingFactor;
                    merged.battingFactor = predData.battingFactor ?? scorecardData.battingFactor;
                    merged.deteriorationFactor = predData.deteriorationFactor ?? scorecardData.deteriorationFactor;
                    merged.currentPhase = predData.currentPhase ?? scorecardData.currentPhase;
                    merged.playerContext = predData.playerContext ?? scorecardData.playerContext;
                    // Score always from scorecard (fresher) — never override with pred's 0/0
                    if (scorecardData.score > 0 || scorecardData.overs > 0) {
                        merged.displayScore = scorecardData.displayScore;
                        merged.score = scorecardData.score;
                        merged.wickets = scorecardData.wickets;
                        merged.overs = scorecardData.overs;
                        merged.currentRunRate = scorecardData.currentRunRate;
                    }
                }
                const mList = window.__matchList || [];
                const mMatch = mList.find(mx => mx.t1 === merged.team1 || mx.team1 === merged.team1);
                merged.team1ImageId = mMatch?.t1ImageId || 0;
                merged.team2ImageId = mMatch?.t2ImageId || 0;
                setPred(merged);
                setIsPredLoading(false);
                try {
                    localStorage.setItem("ci_pred_cache", JSON.stringify(merged));
                    if (merged.id) localStorage.setItem("ci_pred_" + merged.id, JSON.stringify(merged));
                } catch {}
            } else if (predData && predData.team1) {
                const mList = window.__matchList || [];
                const mMatch = mList.find(mx => mx.t1 === predData.team1 || mx.team1 === predData.team1);
                predData.team1ImageId = mMatch?.t1ImageId || 0;
                predData.team2ImageId = mMatch?.t2ImageId || 0;
                setPred(predData);
            }
        } catch { setLiveStatus("mock"); }
    }, []);

    // Initial load + 5s refresh (scorecard + prediction always in sync)
    useEffect(() => {
        fetchLiveData();
        const t = setInterval(fetchLiveData, 5000);
        return () => clearInterval(t);
    }, [fetchLiveData]);

    // Re-fetch immediately when user selects a different match
    // Pass matchId directly — don't rely on ref update timing
    useEffect(() => {
        if (selectedMatch?.matchId) {
            selectedMatchRef.current = selectedMatch;
            fetchLiveData(selectedMatch.matchId);
        }
    }, [selectedMatch?.matchId]);

    const prob = pred?.aiProbability || 50;
    const winMsg = prob >= 65 ? "Strong position" : prob >= 45 ? "Close contest" : "Under pressure";
    const winColor = prob >= 65 ? C.green : prob >= 45 ? C.amber : C.red;

    const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${C.bg}; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
.fade { animation: fadeUp .35s cubic-bezier(.22,.68,0,1.2) forwards; }
.card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; transition: box-shadow .25s, transform .25s; }
.card:hover { box-shadow: 0 8px 28px rgba(30,45,107,0.12); transform: translateY(-1px); }
.match-pill { transition: all .2s cubic-bezier(.22,.68,0,1.2); cursor: pointer; border-radius: 10px; border: 1px solid ${C.border}; padding: 8px 12px; background: ${C.surface}; margin-bottom: 5px; }
.match-pill:hover { border-color: ${C.accent}80; background: #F8FAFF; transform: translateX(2px); }
.match-pill.sel { border-color: ${C.accent}; background: linear-gradient(135deg, #F0F7FF, #E8F0FF); box-shadow: 0 2px 12px rgba(30,45,107,0.1); }
.tab-btn { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: Inter, system-ui; font-size: 13px; font-weight: 500; transition: all .2s; color: rgba(255,255,255,0.55); }
.tab-btn:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.08); }
.tab-btn.on { background: rgba(255,255,255,0.18); color: #fff; font-weight: 700; }
.over-card { border-radius: 14px; border: 1.5px solid ${C.border}; padding: 14px 10px; text-align: center; background: ${C.surface}; transition: all .2s cubic-bezier(.22,.68,0,1.2); cursor: pointer; position: relative; overflow: hidden; }
.over-card:hover { border-color: ${C.accent}80; transform: translateY(-3px); box-shadow: 0 6px 20px rgba(30,45,107,0.12); }
.over-card.sel { border-color: ${C.accent}; background: #F0F7FF; box-shadow: 0 4px 16px rgba(30,45,107,0.15); }
.lock { position: absolute; inset: 0; border-radius: 14px; background: rgba(249,249,249,0.93); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; backdrop-filter: blur(2px); }
.btn-p { background: linear-gradient(135deg, ${C.text}, #333); color: #fff; border: none; border-radius: 10px; padding: 14px 24px; font-family: Inter, system-ui; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; transition: opacity .2s, transform .1s; }
.btn-p:hover { opacity: 0.88; transform: translateY(-1px); }
.btn-p:active { transform: translateY(0); }
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
.mn { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: ${C.navy}; border-top: 1px solid ${C.navyLight}; padding: 8px 0 18px; z-index: 200; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
.mt { flex: 1; background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 0; font-family: Inter, system-ui; }
`;


    if (false) return null; // Landing page removed - show app directly

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>
            <nav style={{ background: C.navy, borderBottom: `1px solid ${C.navyLight}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <div onClick={() => { setActiveTab("predict"); window.scrollTo(0,0); }} style={{ cursor: "pointer" }}>
                    <Logo href="/" />
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {[["predict", "Predictions"], ["matches", "Matches"], ["media", "Media"], ["odds", "Odds 🎯"]].map(([k, l]) => (
                        <button key={k} className={`tab-btn ${activeTab === k ? "on" : ""}`} onClick={() => { if (k === "odds") { window.location.href = "/odds"; } else { setActiveTab(k); } }}>{l}</button>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: liveStatus === "live" ? C.green : C.amber, animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                    </div>
                    
                </div>
            </nav>

            {activeTab === "predict" && (
                <div className="mg fade" style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 240px", minHeight: "calc(100vh - 54px)", width: "100%" }}>
                    <aside className="sl" style={{ borderRight: `1px solid ${C.border}`, background: C.surface, padding: "18px 14px", overflowY: "auto" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", letterSpacing: 1, marginBottom: 14, padding: "6px 12px", background: liveStatus === "live" ? C.red : C.navy, borderRadius: 8, display: "inline-flex", alignItems: "center", gap: 6 }}>
                            {liveStatus === "live" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", animation: "pulse 1.5s infinite", display: "inline-block" }} />}
                            {liveStatus === "live" ? "Live Data" : "Matches"}
                        </div>
                        {liveMatches.filter(m => m.status === "LIVE").length > 0 && (
                            <>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.red, letterSpacing: 1, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, animation: "pulse 2s infinite" }} />Live now
                                </div>
                                {liveMatches.filter(m => m.status === "LIVE").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => {
                                            hasUserSelectedRef.current = true;
                                            selectedMatchRef.current = m;
                                            setSelectedMatch(m);
                                            // Show cached pred immediately if available
                                            try {
                                                const cached = localStorage.getItem("ci_pred_" + m.matchId);
                                                if (cached) { setPred(JSON.parse(cached)); setIsPredLoading(false); }
                                                else setIsPredLoading(true);
                                            } catch { setIsPredLoading(true); }
                                            fetchLiveData(m.matchId);
                                        }} />
                                ))}
                            </>
                        )}
                        {liveMatches.filter(m => m.status === "UPCOMING").length > 0 && (
                            <>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: 1, margin: "14px 0 8px" }}>Upcoming</div>
                                {liveMatches.filter(m => m.status === "UPCOMING").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => {
                                            hasUserSelectedRef.current = true;
                                            selectedMatchRef.current = m;
                                            setSelectedMatch(m);
                                            // Show cached pred immediately if available
                                            try {
                                                const cached = localStorage.getItem("ci_pred_" + m.matchId);
                                                if (cached) { setPred(JSON.parse(cached)); setIsPredLoading(false); }
                                                else setIsPredLoading(true);
                                            } catch { setIsPredLoading(true); }
                                            fetchLiveData(m.matchId);
                                        }} />
                                ))}
                            </>
                        )}
                        {liveMatches.filter(m => m.status === "ENDED").length > 0 && (
                            <>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, margin: "14px 0 8px" }}>Recent</div>
                                {liveMatches.filter(m => m.status === "ENDED").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => {
                                            hasUserSelectedRef.current = true;
                                            selectedMatchRef.current = m;
                                            setSelectedMatch(m);
                                            // Show cached pred immediately if available
                                            try {
                                                const cached = localStorage.getItem("ci_pred_" + m.matchId);
                                                if (cached) { setPred(JSON.parse(cached)); setIsPredLoading(false); }
                                                else setIsPredLoading(true);
                                            } catch { setIsPredLoading(true); }
                                            fetchLiveData(m.matchId);
                                        }} />
                                ))}
                            </>
                        )}
                        <div style={{ marginTop: 16, padding: 14, background: C.bg, borderRadius: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>RUNS TREND</div>
                            <Spark data={pred?.overHistory || []} />
                        </div>
                    </aside>

                    <main className="mc" style={{ padding: 0, overflowY: "auto", overflow: "visible" }}>
                        {!pred ? (
                            isFirstLoad || isPredLoading ? (
                                <div style={{ padding: "24px 20px" }}>
                                    {[1,2,3].map(i => (
                                        <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 14, border: "1px solid #E2E8F0" }}>
                                            <div style={{ height: 12, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 6, width: "40%", marginBottom: 12 }} />
                                            <div style={{ height: 32, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 8, width: "70%", marginBottom: 12 }} />
                                            <div style={{ height: 8, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "100%", marginBottom: 8 }} />
                                            <div style={{ height: 8, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "60%" }} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                            <NoMatchesScreen upcomingMatches={liveMatches.filter(m => m.status === "UPCOMING")} />
                            )
                        ) : (
                            <>
                                <div style={{ background: "linear-gradient(160deg,#1a2760 0%,#253580 100%)", padding: "16px 24px 20px", position: "sticky", top: 0, zIndex: 100, color: "#fff" }}>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{pred.venue || ""}</div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <TeamLogo name={(pred.team1 || "").toLowerCase()} size={40} imageId={pred.team1ImageId || 0} />
                                                <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "#fff" }}>{cleanTeam(pred.team1)}</span>
                                            </div>
                                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>vs</span>
                                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "rgba(255,255,255,0.55)" }}>{cleanTeam(pred.team2)}</span>
                                                <TeamLogo name={(pred.team2 || "").toLowerCase()} size={40} imageId={pred.team2ImageId || 0} />
                                            </div>
                                        </div>
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "8px 18px" }}>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pred.displayScore || ""}</span>
                                            <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>CRR {pred.currentRunRate || ""}</span>
                                            {pred.momentum !== undefined && pred.currentRunRate > 0 && (
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: pred.momentum > 0.5 ? "rgba(0,200,150,0.25)" : pred.momentum < -0.5 ? "rgba(229,62,62,0.25)" : "rgba(255,255,255,0.1)", color: pred.momentum > 0.5 ? "#00D4AA" : pred.momentum < -0.5 ? "#FF6B6B" : "rgba(255,255,255,0.7)" }}>
                                                    {pred.momentum > 0.5 ? "+" : ""}{pred.momentum > 0 ? pred.momentum.toFixed(1) : pred.momentum.toFixed(1)} vs avg
                                                </span>
                                            )}
                                            <button onClick={() => { const t = `${cleanTeam(pred.team1)} vs ${cleanTeam(pred.team2)} - AI: ${prob}% win probability. cricintelligence.com`; try { navigator.clipboard?.writeText(t).then(() => alert("Copied!")); } catch {} }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#C8961E", fontWeight: 700 }}>Share</button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: "20px 24px" }}>
                                    <div className="cr" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 14, alignItems: "start" }}>
                                    <div className="card" style={{ padding: 22, marginBottom: 14 }}>
                                      {/* NEXT 3 OVERS - header */}
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                        <div>
                                          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: 0 }}>{`Next ${(pred.nextOvers || []).length} overs prediction`}</div>
                                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3, fontWeight: 500 }}>{pred?.currentPhase || ""}</div>
                                        </div>
                                        
                                      </div>

                                      {/* 3 over cards stacked vertically */}
                                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {(pred.nextOvers || []).slice(0, 3).map((ov, i) => {
                                          const isLocked = false;
                                          const wc = ov.wicketProb > 40 ? C.red : ov.wicketProb > 25 ? C.amber : C.green;
                                          const runFill = Math.min(100, (ov.expectedRuns / 18) * 100);
                                          const batSR = pred?.playerContext?.strikerSR || 0;
                                          const bowlEco = pred?.playerContext?.bowlerEco || 0;
                                          const bndPct = pred?.playerContext?.boundaryPct || 0;
                                          const last3r = pred?.playerContext?.last3Runs || 0;
                                          const last3w = pred?.playerContext?.last3Wkts || 0;
                                          const last3rr = pred?.playerContext?.last3RR || 0;
                                          const pship = pred?.playerContext?.partnershipRuns || 0;
                                          const sincewkt = pred?.playerContext?.oversSinceWkt || 0;
                                          const srColor = batSR >= 150 ? "#22c55e" : batSR >= 100 ? "#f59e0b" : "#ef4444";
                                          const ecoColor = bowlEco <= 6 ? "#22c55e" : bowlEco <= 9 ? "#f59e0b" : "#ef4444";
                                          const phaseColor = ov.phase === "POWERPLAY" ? C.accent : ov.phase === "DEATH OVERS" ? C.red : C.amber;
                                          return (
                                            <div key={i} onClick={() => setActiveOver(i)} style={{
                                              background: activeOver === i ? "#2A3F82" : "#1B2A6B",
                                              border: `2px solid ${activeOver === i ? "#fff" : "rgba(255,255,255,0.18)"}`,
                                              borderLeft: `4px solid ${activeOver === i ? "#fff" : phaseColor}`,
                                              borderRadius: 12, padding: "14px 16px",
                                              cursor: "pointer", opacity: isLocked ? 0.45 : 1,
                                              transition: "all 0.2s"
                                            }}>
                                              {isLocked ? (
                                                <div style={{ textAlign: "center", padding: 8 }}>
                                                  <span style={{ fontSize: 20 }}></span>
                                                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>Premium</div>
                                                </div>
                                              ) : (
                                                <>
                                                  {/* Row 1: Over number + phase */}
                                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                      <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>Over {ov.over}</span>
                                                      <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: phaseColor, padding: "2px 8px", borderRadius: 20, fontWeight: 800 }}>{ov.phase}</span>
                                                    </div>
                                                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{ov.confidence}% conf</span>
                                                  </div>

                                                  {/* VERDICT BADGE - Option B+C */}
                                                  {(() => {
                                                    const sr = pred && pred.playerContext ? (pred.playerContext.strikerSR || 0) : 0;
                                                    const eco = pred && pred.playerContext ? (pred.playerContext.bowlerEco || 8) : 8;
                                                    const bnd = pred && pred.playerContext ? (pred.playerContext.boundaryPct || 0) : 0;
                                                    const l3r = pred && pred.playerContext ? (pred.playerContext.last3Runs || 0) : 0;
                                                    const phase = ov.phase || '';
                                                    let vText, vColor, vBg;
                                                    if (sr > 150 && eco > 8.5) {
                                                      vText = 'BIG SCORING OVER'; vColor = '#FFFFFF'; vBg = '#E53E3E';
                                                    } else if (sr > 150 || (eco > 8 && bnd > 35)) {
                                                      vText = 'RUNS LIKELY'; vColor = '#FFFFFF'; vBg = '#DD6B20';
                                                    } else if (sr < 100 && eco < 6.5) {
                                                      vText = 'TIGHT OVER'; vColor = '#FFFFFF'; vBg = '#276749';
                                                    } else if (l3r > 25 || phase === 'DEATH OVERS') {
                                                      vText = 'HOT MOMENTUM'; vColor = '#FFFFFF'; vBg = '#6B21A8';
                                                    } else {
                                                      vText = 'STEADY OVER'; vColor = '#FFFFFF'; vBg = '#1D4ED8';
                                                    }
                                                    return (
                                                      <div style={{ display: 'inline-block', marginTop: 8, marginBottom: 4, padding: '6px 16px', background: vBg, borderRadius: 20, boxShadow: `0 0 16px ${vBg}88, 0 3px 10px rgba(0,0,0,0.25)`, animation: 'labelPulse 2s ease-in-out infinite' }}>
                                                        <span style={{ fontSize: 11, fontWeight: 900, color: vColor, letterSpacing: 1.2, textTransform: "uppercase" }}>{vText}</span>
                                                      </div>
                                                    );
                                                  })()}

                                                  {/* Row 2: Stats as progress bars */}
                                                  <div style={{ marginBottom: 12 }}>
                                                    {batSR > 0 && (
                                                      <div style={{ marginBottom: 8 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Batter SR</span>
                                                          <span style={{ fontSize: 11, fontWeight: 700, color: batSR >= 150 ? "#00FF94" : batSR >= 100 ? "#FFB800" : "#FF4444" }}>
                                                            {batSR} · {batSR >= 150 ? "Explosive" : batSR >= 100 ? "Aggressive" : "Struggling"}
                                                          </span>
                                                        </div>
                                                        <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                                                          <div style={{ width: `${Math.min(100, batSR / 2)}%`, height: "100%", background: batSR >= 150 ? "#00FF94" : batSR >= 100 ? "#FFB800" : "#FF4444", borderRadius: 6, boxShadow: batSR >= 150 ? "0 0 8px rgba(0,255,148,0.6)" : batSR < 80 ? "0 0 8px rgba(255,68,68,0.6)" : "none" }} />
                                                        </div>
                                                      </div>
                                                    )}
                                                    {bowlEco > 0 && (
                                                      <div style={{ marginBottom: 8 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Bowl eco</span>
                                                          <span style={{ fontSize: 11, fontWeight: 700, color: bowlEco <= 6 ? "#00FF94" : bowlEco <= 9 ? "#FFB800" : "#FF4444" }}>
                                                            {bowlEco} · {bowlEco <= 6 ? "Tight" : bowlEco <= 9 ? "Average" : "Expensive"}
                                                          </span>
                                                        </div>
                                                        <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                                                          <div style={{ width: `${Math.min(100, bowlEco * 7)}%`, height: "100%", background: bowlEco <= 6 ? "#00FF94" : bowlEco <= 9 ? "#FFB800" : "#FF4444", borderRadius: 6, boxShadow: bowlEco <= 6 ? "0 0 8px rgba(0,255,148,0.6)" : bowlEco > 10 ? "0 0 8px rgba(255,68,68,0.6)" : "none" }} />
                                                        </div>
                                                      </div>
                                                    )}
                                                    {bndPct > 0 && (
                                                      <div style={{ marginBottom: 8 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Boundary %</span>
                                                          <span style={{ fontSize: 11, fontWeight: 700, color: bndPct >= 40 ? "#00FF94" : bndPct >= 20 ? "#FFB800" : "#94A3B8" }}>
                                                            {bndPct}% · {bndPct >= 40 ? "Firing" : bndPct >= 20 ? "Active" : "Dry"}
                                                          </span>
                                                        </div>
                                                        <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                                                          <div style={{ width: `${Math.min(100, bndPct * 2)}%`, height: "100%", background: bndPct >= 40 ? "#00FF94" : bndPct >= 20 ? "#FFB800" : "#64748B", borderRadius: 6 }} />
                                                        </div>
                                                      </div>
                                                    )}
                                                    {last3r > 0 && (
                                                      <div style={{ marginBottom: 8 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Last 3 overs</span>
                                                          <span style={{ fontSize: 11, fontWeight: 700, color: last3r > 25 ? "#22c55e" : last3r > 15 ? "#f59e0b" : "#94a3b8" }}>
                                                            {last3r}r {last3w > 0 ? `${last3w}w` : ""} · {last3r > 25 ? "Hot" : last3r > 15 ? "Moving" : "Dry"}
                                                          </span>
                                                        </div>
                                                        <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                                                          <div style={{ width: `${Math.min(100, last3r * 3)}%`, height: "100%", background: last3r > 25 ? "#00FF94" : last3r > 15 ? "#FFB800" : "#64748B", borderRadius: 6 }} />
                                                        </div>
                                                      </div>
                                                    )}
                                                    {pship > 0 && (
                                                      <div>
                                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Partnership</span>
                                                          <span style={{ fontSize: 11, fontWeight: 700, color: pship > 50 ? "#ef4444" : pship > 25 ? "#f59e0b" : "#94a3b8" }}>
                                                            {pship} · {pship > 50 ? "Dangerous" : pship > 25 ? "Building" : "New"}
                                                          </span>
                                                        </div>
                                                        <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                                                          <div style={{ width: `${Math.min(100, pship)}%`, height: "100%", background: pship > 50 ? "#FF4444" : pship > 25 ? "#FFB800" : "#64748B", borderRadius: 6 }} />
                                                        </div>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Row 3: Expected runs bar */}
                                                  <div style={{ marginBottom: 10 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                                                      <span style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", lineHeight: 1, textShadow: "0 2px 12px rgba(255,255,255,0.4)", letterSpacing: -1 }}>{ov.runRange}</span>
                                                      <span style={{ fontSize: 12, color: "#CBD5E1" }}>runs expected</span>
                                                    </div>
                                                    <div style={{ height: 5, background: C.border, borderRadius: 3 }}>
                                                      <div style={{ height: "100%", width: runFill + "%", background: "linear-gradient(90deg, #4A90E2, #00D4AA)", borderRadius: 3, boxShadow: "0 0 8px rgba(0,212,170,0.5)", transition: "width 0.4s" }} />
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                                                      <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>Expected: {ov.expectedRuns} runs</span>
                                                      <span style={{ fontSize: 11, fontWeight: 700, color: wc }}> {ov.wicketProb}% wicket</span>
                                                    </div>
                                                  </div>

                                                                                          {/* LIVE BALL TRACKER */}
                                        {(() => {
                                          const pc = pred && pred.playerContext ? pred.playerContext : null;
                                          const curRuns = pc ? pc.currentOverRuns : null;
                                          const curBalls = pc ? (pc.currentOverBalls || 0) : 0;
                                          const isCurrentOv = curRuns !== null && curBalls > 0 && ov.over === (pred.nextOvers && pred.nextOvers[0] ? pred.nextOvers[0].over : -1);
                                          if (!isCurrentOv) return null;
                                          const projected = curBalls > 0 ? Math.round((curRuns / curBalls) * 6) : 0;
                                          const lo = parseInt((ov.runRange || '0-0').split('-')[0]);
                                          const hi = parseInt((ov.runRange || '0-0').split('-')[1]);
                                          const status = projected > hi ? 'AHEAD' : projected < lo ? 'BEHIND' : 'ON TRACK';
                                          const sc = status === 'AHEAD' ? '#00B894' : status === 'BEHIND' ? '#E53E3E' : '#F59E0B';
                                          return (
                                            <div style={{ marginTop: 8, marginBottom: 6, padding: '7px 10px', background: 'rgba(30,45,107,0.07)', borderRadius: 6, border: '1px solid rgba(30,45,107,0.18)' }}>
                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: 0.3 }}>
                                                  LIVE: {curRuns}r in {curBalls} {curBalls === 1 ? 'ball' : 'balls'}
                                                </span>
                                                <span style={{ fontSize: 11, fontWeight: 800, color: sc, letterSpacing: 0.5 }}>
                                                  {status}
                                                </span>
                                              </div>
                                              <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>
                                                Projected: ~{projected} runs this over
                                              </div>
                                            </div>
                                          );
                                        })()}
{/* Row 4: Pitch + Weather + Wear inline */}
                                                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 6, padding: "3px 8px" }}>
                                                      <span style={{ fontSize: 11 }}></span>
                                                      <span style={{ fontSize: 10, color: C.muted }}>{pred?.pitchLabel || ""}</span>
                                                      <span style={{ fontSize: 9, color: pred?.pitchCondition === "WORN" ? C.red : pred?.pitchCondition === "DRY" ? C.amber : C.green, fontWeight: 700 }}>{pred?.pitchCondition || ""}</span>
                                                    </div>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 6, padding: "3px 8px" }}>
                                                      <span style={{ fontSize: 11 }}></span>
                                                      <span style={{ fontSize: 10, color: C.muted }}>{pred?.weather?.temp}C  {pred?.weather?.condition}</span>
                                                    </div>
                                                    {ov.pitchWear > 0 && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 6, padding: "3px 8px" }}>
                                                        <span style={{ fontSize: 11 }}></span>
                                                        <span style={{ fontSize: 10, color: ov.pitchWear > 10 ? C.red : ov.pitchWear > 5 ? C.amber : C.muted }}>Wear {ov.pitchWear}%</span>
                                                      </div>
                                                    )}
                                                  </div>

                                                  {/* Row 5: Tip */}
                                                  <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 2 }}>
                                                    <span style={{ fontSize: 13, color: C.accent, fontStyle: "italic", fontWeight: 600 }}>{ov.tip && ov.tip.trim() ? '"' + ov.tip + '"' : ""}</span>
                                                  {/* PLAIN ENGLISH - Option D */}
                                                  {(() => {
                                                    const sr = pred && pred.playerContext ? (pred.playerContext.strikerSR || 0) : 0;
                                                    const eco = pred && pred.playerContext ? (pred.playerContext.bowlerEco || 8) : 8;
                                                    const bnd = pred && pred.playerContext ? (pred.playerContext.boundaryPct || 0) : 0;
                                                    const l3r = pred && pred.playerContext ? (pred.playerContext.last3Runs || 0) : 0;
                                                    const wkp = ov.wicketProb || 0;
                                                    let eng;
                                                    if (sr > 150 && eco > 8.5) {
                                                      eng = 'Batter on fire (SR ' + Math.round(sr) + ') vs expensive bowler  -  big over incoming';
                                                    } else if (sr > 150) {
                                                      eng = 'Aggressive batter (SR ' + Math.round(sr) + ') in control  -  expect ' + ov.runRange + ' runs';
                                                    } else if (eco < 6) {
                                                      eng = 'Bowler on top (Eco ' + eco.toFixed(1) + ')  -  tough to score freely';
                                                    } else if (wkp > 25) {
                                                      eng = 'Wicket danger (' + wkp + '%)  -  could be a turning point';
                                                    } else if (l3r > 25) {
                                                      eng = 'Last 3 overs were HOT (' + l3r + 'r)  -  momentum with batting team';
                                                    } else {
                                                      eng = 'Balanced contest  -  ML predicts ' + ov.runRange + ' runs';
                                                    }
                                                    return (
                                                      <div style={{ marginTop: 6, padding: '6px 10px', background: 'rgba(255,255,255,0.07)', borderRadius: 6, borderLeft: '3px solid #4A90D9' }}>
                                                        <span style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 600 }}>{eng}</span>
                                                      </div>
                                                    );
                                                  })()}
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>{/* close over-cards card */}

                                    {/* RIGHT COLUMN */}
                                    <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 14 }}>
                                        {pred && pred.batters && pred.batters.length > 0 && (
                                            <LiveScorecard batters={pred.batters} bowler={pred.bowler || {}} />
                                        )}
                                        <div className="card" style={{ padding: 22 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>Win probability</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: winColor, marginBottom: 8, letterSpacing: 0.3 }}>{winMsg}</div>
                                            <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 10px" }}><WinArc value={prob} /></div>
                                            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                                                Based on current innings, pitch conditions, and 21,300 historical T20 matches — updated every ball.
                                            </div>
                                        </div>
                                        <div className="card" style={{ padding: 22 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>Match intel</div>
                                            {pred.pressureScore !== undefined && (
                                                <div style={{ marginBottom: 14 }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                        <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>PRESSURE INDEX</span>
                                                        <span style={{ fontSize: 13, fontWeight: 900, color: pred.pressureScore > 70 ? C.red : pred.pressureScore > 45 ? C.amber : C.green }}>
                                                            {pred.pressureScore > 75 ? "CRITICAL" : pred.pressureScore > 55 ? "HIGH" : pred.pressureScore > 35 ? "MODERATE" : "LOW"} {pred.pressureScore}/100
                                                        </span>
                                                    </div>
                                                    <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden" }}>
                                                        <div style={{ height: "100%", width: pred.pressureScore + "%", borderRadius: 6, transition: "width 0.6s ease", background: pred.pressureScore > 70 ? "linear-gradient(90deg,#E53E3E,#FF6B6B)" : pred.pressureScore > 45 ? "linear-gradient(90deg,#DD6B20,#F6AD55)" : "linear-gradient(90deg,#276749,#68D391)" }} />
                                                    </div>
                                                </div>
                                            )}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                                                <div>
                                                    <div style={{ fontSize: 10, color: C.green, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>STRENGTHS</div>
                                                    {(pred.strengths || pred.pitchStrengths || []).map((s, i) => (
                                                        <div key={i} style={{ fontSize: 11, marginBottom: 5, display: "flex", gap: 5 }}><span style={{ color: C.green }}>+</span>{s}</div>
                                                    ))}
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 10, color: C.red, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>RISKS</div>
                                                    {(pred.weaknesses || pred.pitchRisks || []).map((w, i) => (
                                                        <div key={i} style={{ fontSize: 11, marginBottom: 5, display: "flex", gap: 5 }}><span style={{ color: C.red }}>-</span>{w}</div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: C.muted }}>{pred.weatherImpact?.tip || "Bright conditions favour batters."}</div>                        </div>
                                    </div>

                                    <NextOverIntelligence pred={pred} />

                                    {pred.toss && (
                                        <div style={{ background: "linear-gradient(135deg,#1E2D6B,#253580)", borderRadius: 14, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 2 }}>TOSS</div>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pred.toss.winner} won - elected to {pred.toss.decision}</div>
                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{pred.tossTip || ""}</div>
                                            </div>
                                        </div>
                                    )}

                                                                        </div>                                </div>
<div className="cr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                        <div className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                                            <span style={{ fontSize: 32 }}>{pred.weatherImpact?.emoji || ""}</span>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>WEATHER</div>
                                                <div style={{ fontSize: 20, fontWeight: 800 }}>{pred.weather?.temp || ""}C</div>
                                                <div style={{ fontSize: 11, color: C.muted }}>{pred.weather?.condition || ""}</div>
                                            </div>
                                        </div>
                                        <div className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                                            <div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>PITCH</div>
                                                <div style={{ fontSize: 15, fontWeight: 700 }}>{pred.pitchLabel || ""}</div>
                                                <div style={{ fontSize: 11, color: C.muted }}>{pred.pitchCondition || ""}</div>
                                            </div>
                                        </div>
                                    </div>


                                {/* ===== CLAUDE AI ANALYSIS SECTION ===== */}
                                <ClaudeAnalysis pred={pred} selectedMatch={selectedMatch} />
                            </>
                        )}
                    </main>

                    <aside className="sr" style={{ borderLeft: `1px solid ${C.border}`, padding: "18px 14px", background: C.surface, display: "flex", flexDirection: "column", gap: 14 }}>

                        {/* Match Context */}
                        {pred && pred.team1 && (
                            <div style={{ background: C.bg, borderRadius: 12, padding: "14px" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, marginBottom: 12 }}>MATCH CONTEXT</div>
                                {[
                                    ["Format", pred.matchType?.toUpperCase() || "T20"],
                                    ["Phase", pred.currentPhase || "—"],
                                    ["Pitch", pred.pitchLabel || "—"],
                                    ["Weather", pred.weatherImpact?.condition || "—"],
                                ].map(([l, v]) => (
                                    <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                                        <span style={{ fontSize: 11, color: C.muted }}>{l}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: C.text, maxWidth: 110, textAlign: "right" }}>{v}</span>
                                    </div>
                                ))}
                                {pred.toss && (
                                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 9, marginTop: 4 }}>
                                        <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>TOSS</div>
                                        <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{pred.toss.winner} won · {pred.toss.decision}</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Betting Widget */}
                        {pred && pred.team1 && (
                            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,184,0,0.3)", background: "linear-gradient(135deg, #1A2560, #1E3A8A)" }}>
                                <div style={{ padding: "12px 14px" }}>
                                    <div style={{ fontSize: 9, color: "rgba(255,184,0,0.7)", fontWeight: 700, letterSpacing: 1.5, marginBottom: 6 }}>LIVE ODDS</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", marginBottom: 2 }}>
                                        {cleanTeam(pred.team1)} win
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                        <div style={{ fontSize: 28, fontWeight: 900, color: prob >= 60 ? "#00FF94" : prob <= 40 ? "#FF4444" : "#FFB800", lineHeight: 1 }}>{prob}%</div>
                                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>AI<br/>probability</div>
                                    </div>
                                    <a href="https://reffpa.com/L?tag=d_5453500m_97c_&site=5453500&ad=97"
                                        target="_blank" rel="noreferrer noopener"
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FFB800", borderRadius: 8, padding: "10px 14px", textDecoration: "none", fontWeight: 800, fontSize: 13, color: "#1A1A1A" }}
                                        onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
                                        onMouseOut={e => e.currentTarget.style.opacity = "1"}
                                    >
                                        Bet on 1xBet →
                                    </a>
                                </div>
                                <div style={{ padding: "6px 14px 10px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.5 }}>
                                        18+ · <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.3)" }}>BeGambleAware.org</a>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, textAlign: "center", marginTop: "auto" }}>
                            <a href="/about" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>About Us</a>
                            <span style={{ color: C.border, margin: "0 6px" }}>·</span>
                            <a href="mailto:emmadi.dev@gmail.com" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>Contact</a>
                        </div>
                    </aside>
                </div>
            )}

            {activeTab === "matches" && (
                <div className="fade" style={{ maxWidth: 680, margin: "0 auto", padding: "22px 16px" }}>
                    {liveMatches.length === 0 && (
                        <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}></div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>Loading matches...</div>
                        </div>
                    )}
                    {liveMatches.filter(m => m.status === "LIVE").length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, animation: "pulse 1.5s infinite" }} />
                                <span style={{ fontSize: 13, fontWeight: 700, color: C.red, letterSpacing: 1 }}>LIVE NOW</span>
                            </div>
                            {liveMatches.filter(m => m.status === "LIVE").map(m => (
                                <MatchCard key={m.id} m={m} onClick={() => { setSelectedMatch(m); setActiveTab("predict"); }} />
                            ))}
                        </div>
                    )}
                    {liveMatches.filter(m => m.status === "UPCOMING").length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 12 }}>UPCOMING</div>
                            {liveMatches.filter(m => m.status === "UPCOMING").map(m => (
                                <MatchCard key={m.id} m={m} onClick={() => { setSelectedMatch(m); setActiveTab("predict"); }} />
                            ))}
                        </div>
                    )}
                    {liveMatches.filter(m => m.status === "ENDED").length > 0 && (
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 12 }}>RECENT RESULTS</div>
                            {liveMatches.filter(m => m.status === "ENDED").map(m => (
                                <MatchCard key={m.id} m={m} onClick={() => { setSelectedMatch(m); setActiveTab("predict"); }} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "media" && <MediaSection />}

            <RGFooter />

            <nav className="mn">
                {[["Predict", "predict"], ["Matches", "matches"], ["Media", "media"]].map(([label, key]) => (
                    <button key={key} className="mt" onClick={() => setActiveTab(key)} style={{ opacity: activeTab === key ? 1 : 0.4 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</span>
                    </button>
                ))}
            </nav>

            
        </div>
    );
}
