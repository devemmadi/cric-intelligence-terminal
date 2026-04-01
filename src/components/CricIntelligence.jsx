/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";

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
    const CSS2 = `@keyframes blink2 { 0%,100%{opacity:1} 50%{opacity:0.3} }`;
    return (
        <div style={{ padding: "0 0 4px 0", marginBottom: 14 }}>
            <style>{CSS2}</style>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E24B4A", animation: "blink2 1.5s infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>Next over intelligence</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>Over {ov1.over} - {ov1.phase}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                <div style={{ background: "#fff", border: "2px solid #378ADD", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Over {ov1.over} - now</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 500, color: "#0A0A0A" }}>{ov1.runRange}</span>
                        <span style={{ fontSize: 13, color: "#64748B" }}>runs expected</span>
                    </div>
                    <div style={{ background: "#EEF2FF", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 3 }}>Bowling quality</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>{bowlerQuality}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>Factor {pred.bowlingFactor?.toFixed(2) || "1.00"}</div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: "#64748B" }}>Wicket risk</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: wicketColor1 }}>{wicketLabel1} - {ov1.wicketProb}%</span>
                        </div>
                        <div style={{ height: 4, background: "#EEF2FF", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${ov1.wicketProb}%`, height: "100%", background: wicketBg1, borderRadius: 4 }} />
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {spinBoost > 5 && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#FAEEDA", color: "#854F0B" }}>Spin +{spinBoost}%</span>}
                        {!dewSoon && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#EEF2FF", color: "#64748B" }}>No dew</span>}
                        {dewSoon && <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: "#E6F1FB", color: "#185FA5" }}>Dew incoming</span>}
                    </div>
                </div>
                <div style={{ background: "#fff", border: "0.5px solid #E2E8F0", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" }}>Over {ov2.over} - {phase2}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 500, color: "#0A0A0A" }}>{ov2.runRange}</span>
                        <span style={{ fontSize: 13, color: "#64748B" }}>runs expected</span>
                    </div>
                    <div style={{ background: "#EEF2FF", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 3 }}>Batting quality</div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>{batQuality}</div>
                        <div style={{ fontSize: 12, color: "#64748B" }}>Factor {pred.battingFactor?.toFixed(2) || "1.00"}</div>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: "#64748B" }}>Wicket risk</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: wicketColor2 }}>{wicketLabel2} - {ov2.wicketProb}%</span>
                        </div>
                        <div style={{ height: 4, background: "#EEF2FF", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${ov2.wicketProb}%`, height: "100%", background: wicketBg2, borderRadius: 4 }} />
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
                    <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>Run rate trend</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 56 }}>
                        {history.slice(-4).map((h, i) => (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: i === 0 ? "#B5D4F4" : i === 1 ? "#85B7EB" : "#378ADD", height: `${barHeights[i]}px` }} />
                                <span style={{ fontSize: 10, color: "#64748B" }}>ov {h.over}</span>
                            </div>
                        ))}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.7 }}>
                            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", background: "rgba(24,95,165,0.15)", border: "1.5px dashed #185FA5", height: `${predBarH}px` }} />
                            <span style={{ fontSize: 10, color: "#1E2D6B", fontWeight: 600 }}>ov {ov1.over}</span>
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
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6, color: m.status === "ENDED" ? "#64748B" : m.status === "UPCOMING" ? "#1E2D6B" : "#00B894" }}>
                {m.status === "ENDED" ? "View result" : m.status === "UPCOMING" ? "Pre-match prediction" : "View live prediction"}
            </div>
        </div>
    );
}

function MediaSection() {
    const fallbackNews = [
        { tag: "IPL 2025", title: "IPL 2025: Full schedule and match predictions", time: "2h ago", url: "https://www.espncricinfo.com", source: "ESPNcricinfo" },
        { tag: "T20", title: "NZ vs SA T20I series - match preview and predictions", time: "3h ago", url: "https://www.cricbuzz.com", source: "Cricbuzz" },
        { tag: "ANALYSIS", title: "How AI is transforming cricket match predictions", time: "6h ago", url: "https://cricintelligence.com", source: "CricIntelligence" },
        { tag: "WOMEN", title: "Australia Women dominate WI series - key stats", time: "1d ago", url: "https://www.espncricinfo.com", source: "ESPNcricinfo" },
        { tag: "IPL", title: "IPL 2025 schedule: Complete fixtures and venues", time: "1d ago", url: "https://www.iplt20.com", source: "IPL Official" },
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
            {fallbackNews.map(({ tag, title, time, url, source }, i) => (
                <a key={i} href={url || "#"} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                    <div className="card" style={{ padding: 16, marginBottom: 10, cursor: "pointer" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: C2.accent, letterSpacing: 1, background: `${C2.accent}12`, padding: "2px 8px", borderRadius: 4 }}>{tag}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                {source && <span style={{ fontSize: 10, color: C2.muted }}>{source}</span>}
                                <span style={{ fontSize: 11, color: C2.muted }}>{time}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5, color: C2.text }}>{title}</div>
                        <div style={{ fontSize: 11, color: C2.accent, marginTop: 6 }}>Read more</div>
                    </div>
                </a>
            ))}
        </div>
    );
}

function NoMatchesScreen() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}></div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.navy, marginBottom: 10 }}>No Live Matches Right Now</div>
            <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, maxWidth: 380, marginBottom: 24 }}>
                IPL and international matches will appear here automatically when they go live.
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 32 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 20px", minWidth: 120, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>877</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Venues tracked</div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 20px", minWidth: 120, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>1.7M</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Historical matches</div>
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 20px", minWidth: 120, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>78.2%</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Accuracy</div>
                </div>
            </div>
            <div style={{ fontSize: 12, color: C.muted, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 20px" }}>
                Page auto-refreshes every 10 seconds
            </div>
        </div>
    );
}

function LiveScorecard({ batters, bowler }) {
    if (!batters || batters.length === 0) return null;
    return (
        <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: 1.5, marginBottom: 10 }}>{"ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¡ LIVE SCORECARD"}</div>
            <div style={{ marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 32px 52px", gap: 4, marginBottom: 5 }}>
                    <span style={{ fontSize: 9, color: "#64748B", fontWeight: 600 }}>{"BATTER"}</span>
                    <span style={{ fontSize: 9, color: "#64748B", textAlign: "right" }}>{"R"}</span>
                    <span style={{ fontSize: 9, color: "#64748B", textAlign: "right" }}>{"B"}</span>
                    <span style={{ fontSize: 9, color: "#64748B", textAlign: "right" }}>{"SR"}</span>
                </div>
                {batters.map(function(b, i) { return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 32px 32px 52px", gap: 4, padding: "5px 0", borderTop: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {b.isStriker && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />}
                            <span style={{ fontSize: 11, fontWeight: b.isStriker ? 700 : 400, color: b.isStriker ? "#E2E8F0" : "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{b.name}</span>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", textAlign: "right" }}>{b.runs}</span>
                        <span style={{ fontSize: 11, color: "#94A3B8", textAlign: "right" }}>{b.balls}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, textAlign: "right", color: b.sr >= 150 ? "#22C55E" : b.sr >= 100 ? "#F59E0B" : "#EF4444" }}>{b.sr ? Math.round(b.sr) : 0}</span>
                    </div>
                ); })}
            </div>
            {bowler && bowler.name && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 30px 30px 28px 44px", gap: 4, marginBottom: 4 }}>
                        <span style={{ fontSize: 9, color: "#64748B", fontWeight: 600 }}>{"BOWLER"}</span>
                        <span style={{ fontSize: 9, color: "#64748B", textAlign: "right" }}>{"O"}</span>
                        <span style={{ fontSize: 9, color: "#64748B", textAlign: "right" }}>{"R"}</span>
                        <span style={{ fontSize: 9, color: "#64748B", textAlign: "right" }}>{"W"}</span>
                        <span style={{ fontSize: 9, color: "#64748B", textAlign: "right" }}>{"ECO"}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 30px 30px 28px 44px", gap: 4, padding: "5px 0", borderTop: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#E2E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90 }}>{bowler.name}</span>
                        <span style={{ fontSize: 11, color: "#94A3B8", textAlign: "right" }}>{bowler.overs}</span>
                        <span style={{ fontSize: 11, color: "#94A3B8", textAlign: "right" }}>{bowler.runs}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, textAlign: "right", color: bowler.wickets > 0 ? "#22C55E" : "#E2E8F0" }}>{bowler.wickets}</span>
                        <span style={{ fontSize: 11, fontWeight: 600, textAlign: "right", color: bowler.economy <= 7 ? "#22C55E" : bowler.economy <= 10 ? "#F59E0B" : "#EF4444" }}>{bowler.economy ? bowler.economy.toFixed(1) : "0.0"}</span>
                    </div>
                </div>
            )}
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
                <button onClick={askClaude} disabled={loading} style={{ background: loading ? "#334155" : "linear-gradient(135deg,#7C3AED,#6366f1)", border: "none", color: "#fff", padding: "8px 18px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                    {loading ? <><span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span> Analyzing...</> : asked ? "Refresh" : "Get AI Analysis"}
                </button>
            </div>
            {!asked && !loading && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#64748B", fontSize: 13 }}>
                    Click <strong style={{color:"#a78bfa"}}>Get AI Analysis</strong> -- Claude will analyze live match data and give you sharp predictions
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
                <div style={{ fontSize: 13, lineHeight: 1.9, color: "#CBD5E1", whiteSpace: "pre-wrap", borderTop: "1px solid rgba(139,92,246,0.2)", paddingTop: 14 }}>
                    {analysis}
                </div>
            )}
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("predict");
    const [showLanding, setShowLanding] = useState(() => { try { return !localStorage.getItem("ci_v2"); } catch { return false; } });
    const [liveMatches, setLiveMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [pred, setPred] = useState(null);
    const [liveStatus, setLiveStatus] = useState("connecting");
        const [isPremium, setIsPremium] = useState(true);
    const hasUserSelectedRef = React.useRef(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [emailInput, setEmailInput] = useState("");
    const [paymentStep, setPaymentStep] = useState("plans");
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [liveTime, setLiveTime] = useState(new Date());
    const [ticker, setTicker] = useState(0);
    const [activeOver, setActiveOver] = useState(0);

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);

    useEffect(() => {
        const t = setInterval(() => {
            if (!document.hidden) setTicker(p => p + 1);
        }, 10000);
        return () => clearInterval(t);
    }, []);

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

    const fetchPred = useCallback(async (matchId) => {
        try {
            const r = await fetch(`${API_BASE}/predict${(matchId || selectedMatch?.matchId) ? "?match_id=" + (matchId || selectedMatch?.matchId) : ""}`);
            if (r.ok) {
                const d = await r.json();
                if (d && d.team1) {
                    // Merge imageIds from /matches into pred
                    const mList = window.__matchList || [];
                    const mMatch = mList.find(mx => mx.team1 === d.team1 || mx.t1 === d.team1);
                    d.team1ImageId = mMatch?.t1ImageId || mMatch?.team1ImageId || 0;
                    d.team2ImageId = mMatch?.t2ImageId || mMatch?.team2ImageId || 0;
                    setPred(d);
                }
                else setPred(null);
            }
        } catch { }
    }, [selectedMatch]);

    useEffect(() => { fetchPred(); }, [selectedMatch, ticker]);

    const fetchMatches = useCallback(async () => {
        try {
            const r = await fetch(`${API_BASE}/matches`);
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
                const live = mapped.find(m => m.status === "LIVE");
                const upcoming = mapped.find(m => m.status === "UPCOMING");
                const best = live || upcoming;
                if (best && !hasUserSelectedRef.current) setSelectedMatch(best);
            }
        } catch { setLiveStatus("mock"); }
    }, []);

    useEffect(() => { fetchMatches(); }, []);
    useEffect(() => { const t = setInterval(fetchMatches, 30000); return () => clearInterval(t); }, []);

    useEffect(() => {
        if (selectedMatch?.matchId) {
            fetch(`${API_BASE}/match/${selectedMatch.matchId}`)
                .then(r => r.ok ? r.json() : null)
                .then(d => { if (d && !d.error && d.team1) setPred(d); })
                .catch(() => { });
        }
    }, [selectedMatch]);

    const prob = pred?.aiProbability || 50;
    const winMsg = prob >= 65 ? "Strong position" : prob >= 45 ? "Close contest" : "Under pressure";
    const winColor = prob >= 65 ? C.green : prob >= 45 ? C.amber : C.red;

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
.match-pill { transition: all .2s; cursor: pointer; border-radius: 12px; border: 1.5px solid ${C.border}; padding: 12px 14px; background: ${C.surface}; margin-bottom: 8px; }
.match-pill:hover { border-color: ${C.accent}60; }
.match-pill.sel { border-color: ${C.accent}; background: #F0F7FF; }
.tab-btn { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: Inter, system-ui; font-size: 13px; font-weight: 500; transition: all .2s; color: rgba(255,255,255,0.55); }
.tab-btn.on { background: rgba(255,255,255,0.15); color: #fff; }
.over-card { border-radius: 14px; border: 1.5px solid ${C.border}; padding: 14px 10px; text-align: center; background: ${C.surface}; transition: all .2s; cursor: pointer; position: relative; overflow: hidden; }
.over-card:hover { border-color: ${C.accent}60; transform: translateY(-2px); }
.over-card.sel { border-color: ${C.accent}; background: #F0F7FF; }
.lock { position: absolute; inset: 0; border-radius: 14px; background: rgba(249,249,249,0.93); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
.btn-p { background: ${C.text}; color: #fff; border: none; border-radius: 10px; padding: 14px 24px; font-family: Inter, system-ui; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; }
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
            <div style={{ background: "#1E2D6B" }}>
                <nav style={{ padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#fff" }}>CricIntelligence</div>
                    <button onClick={() => { try { localStorage.setItem("ci_v2", "1"); } catch {} setShowLanding(false); }} style={{ background: "#C8961E", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Open App</button>
                </nav>
                <div style={{ maxWidth: 700, margin: "0 auto", padding: "50px 32px 60px" }}>
                    <h1 style={{ fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 16, color: "#fff" }}>
                        Know who wins<br /><span style={{ color: "#C8961E" }}>before the over ends.</span>
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 460, marginBottom: 28 }}>AI predictions built on 1.7M data points across 877 venues. Over-by-over accuracy at 78.2%.</p>
                    <button onClick={() => { try { localStorage.setItem("ci_v2", "1"); } catch {} setShowLanding(false); }} style={{ background: "#C8961E", color: "#000", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Get Free Predictions</button>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>Free - No credit card - Cancel anytime</div>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>
            <nav style={{ background: C.navy, borderBottom: `1px solid ${C.navyLight}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
                        <span style={{ fontWeight: 800, fontSize: 13, color: "#fff", letterSpacing: 2, fontFamily: "Georgia,serif" }}>CRIC</span>
                        <span style={{ fontWeight: 400, fontSize: 9, color: "#C8961E", letterSpacing: 3.5, fontFamily: "Georgia,serif" }}>INTELLIGENCE</span>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                    {[["predict", "Predictions"], ["matches", "Matches"], ["media", "Media"]].map(([k, l]) => (
                        <button key={k} className={`tab-btn ${activeTab === k ? "on" : ""}`} onClick={() => setActiveTab(k)}>{l}</button>
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
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, letterSpacing: 1.5, marginBottom: 12, padding: "6px 10px", background: `${C.navy}10`, borderRadius: 8, display: "inline-block" }}>
                            {liveStatus === "live" ? "LIVE DATA" : "MATCHES"}
                        </div>
                        {liveMatches.filter(m => m.status === "LIVE").length > 0 && (
                            <>
                                <div style={{ fontSize: 9, fontWeight: 700, color: C.red, letterSpacing: 1.5, marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.red, animation: "pulse 2s infinite" }} />LIVE NOW
                                </div>
                                {liveMatches.filter(m => m.status === "LIVE").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => { hasUserSelectedRef.current = true; setSelectedMatch(m); }} />
                                ))}
                            </>
                        )}
                        {liveMatches.filter(m => m.status === "UPCOMING").length > 0 && (
                            <>
                                <div style={{ fontSize: 9, fontWeight: 700, color: C.accent, letterSpacing: 1.5, margin: "10px 0 6px" }}>UPCOMING</div>
                                {liveMatches.filter(m => m.status === "UPCOMING").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => { hasUserSelectedRef.current = true; setSelectedMatch(m); }} />
                                ))}
                            </>
                        )}
                        {liveMatches.filter(m => m.status === "ENDED").length > 0 && (
                            <>
                                <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 1.5, margin: "10px 0 6px" }}>RECENT</div>
                                {liveMatches.filter(m => m.status === "ENDED").map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => { hasUserSelectedRef.current = true; setSelectedMatch(m); }} />
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
                            <NoMatchesScreen />
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
                                          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>{`NEXT ${(pred.nextOvers || []).length} OVERS PREDICTION`}</div>
                                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{pred?.currentPhase || ""}</div>
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
                                                      <span style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>OVER {ov.over}</span>
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
                                                      <div style={{ display: 'inline-block', marginTop: 8, marginBottom: 4, padding: '6px 16px', background: vBg, borderRadius: 20, boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>
                                                        <span style={{ fontSize: 11, fontWeight: 900, color: vColor, letterSpacing: 1.2, textTransform: "uppercase" }}>{vText}</span>
                                                      </div>
                                                    );
                                                  })()}

                                                  {/* Row 2: Batsman + Bowler live stats */}
                                                  <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                                                    {batSR > 0 && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 8, padding: "6px 10px" }}>
                                                        <span style={{ fontSize: 13 }}></span>
                                                        <div>
                                                          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5 }}>BATSMAN SR</div>
                                                          <div style={{ fontSize: 16, fontWeight: 900, color: batSR > 130 ? C.green : batSR < 80 ? C.red : C.amber, lineHeight: 1.1 }}>{batSR}</div>
                                                          <div style={{ fontSize: 9, fontWeight: 800, color: batSR > 130 ? C.green : batSR < 80 ? C.red : C.amber, marginTop: 1 }}>{batSR > 150 ? "EXPLOSIVE" : batSR > 130 ? "AGGRESSIVE" : batSR > 100 ? "STEADY" : "STRUGGLING"}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {bowlEco > 0 && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 8, padding: "6px 10px" }}>
                                                        <span style={{ fontSize: 13 }}></span>
                                                        <div>
                                                          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5 }}>BOWL ECO</div>
                                                          <div style={{ fontSize: 16, fontWeight: 900, color: bowlEco < 7 ? C.green : bowlEco > 10 ? C.red : C.amber, lineHeight: 1.1 }}>{bowlEco}</div>
                                                          <div style={{ fontSize: 9, fontWeight: 800, color: bowlEco < 7 ? C.green : bowlEco > 10 ? C.red : C.amber, marginTop: 1 }}>{bowlEco < 6 ? "TIGHT" : bowlEco < 8 ? "DECENT" : bowlEco < 10 ? "EXPENSIVE" : "HAMMERED"}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {bndPct > 0 && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 8, padding: "6px 10px" }}>
                                                        <span style={{ fontSize: 13 }}></span>
                                                        <div>
                                                          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5 }}>BOUNDARY</div>
                                                          <div style={{ fontSize: 16, fontWeight: 900, color: bndPct > 40 ? C.green : bndPct > 25 ? C.amber : C.muted, lineHeight: 1.1 }}>{bndPct}%</div>
                                                          <div style={{ fontSize: 9, fontWeight: 800, color: bndPct > 40 ? C.green : bndPct > 25 ? C.amber : C.muted, marginTop: 1 }}>{bndPct > 40 ? "FIRING" : bndPct > 25 ? "ACTIVE" : "QUIET"}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {last3r > 0 && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 8, padding: "6px 10px" }}>
                                                        <span style={{ fontSize: 13 }}></span>
                                                        <div>
                                                          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5 }}>LAST 3 OV</div>
                                                          <div style={{ fontSize: 16, fontWeight: 900, color: last3r > 25 ? C.green : last3r > 15 ? C.amber : C.muted, lineHeight: 1.1 }}>{last3r}r {last3w}w</div>
                                                          <div style={{ fontSize: 9, fontWeight: 800, color: last3r > 25 ? C.green : last3r > 15 ? C.amber : C.muted, marginTop: 1 }}>{last3r > 25 ? "HOT" : last3r > 15 ? "MOVING" : "DRY"}</div>
                                                        </div>
                                                      </div>
                                                    )}
                                                    {pship > 0 && (
                                                      <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.navyLight, borderRadius: 8, padding: "6px 10px" }}>
                                                        <span style={{ fontSize: 13 }}></span>
                                                        <div>
                                                          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 0.5 }}>PARTNERSHIP</div>
                                                          <div style={{ fontSize: 16, fontWeight: 900, color: pship > 50 ? C.red : pship > 25 ? C.amber : C.muted, lineHeight: 1.1 }}>{pship}</div>
                                                          <div style={{ fontSize: 9, fontWeight: 800, color: pship > 50 ? C.red : pship > 25 ? C.amber : C.muted, marginTop: 1 }}>{pship > 50 ? "DANGEROUS" : pship > 25 ? "BUILDING" : "NEW"}</div>
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
                                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>WIN PROBABILITY</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: winColor, marginBottom: 8, letterSpacing: 0.3 }}>{winMsg}</div>
                                            <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 10px" }}><WinArc value={prob} /></div>
                                            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                                                <strong style={{ color: C.text }}>{cleanTeam(pred.team1)}</strong> has a <strong style={{ color: winColor }}>{prob}% chance</strong> of winning based on current score, pitch and 1.7M historical matches.
                                            </div>
                                        </div>
                                        <div className="card" style={{ padding: 22 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>MATCH INTEL</div>
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
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, marginBottom: 12 }}>AI ENGINE</div>
                            {[["Accuracy", "78.2%", 78], ["Confidence", `${prob}%`, prob], ["Records", "1.7M", 85], ["Venues", "877", 90]].map(([l, v, p]) => (
                                <div key={l} style={{ marginBottom: 12 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                        <span style={{ fontSize: 11, color: C.muted }}>{l}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700 }}>{v}</span>
                                    </div>
                                    <div style={{ height: 3, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${p}%`, background: C.accent, borderRadius: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                                                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, textAlign: "center", marginTop: "auto" }}>
                            {pred?.dataSource || "877 venues - 1.7M records"}<br />
                            <span style={{ color: C.red, fontWeight: 600 }}>18+ - BeGambleAware.org</span>
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
