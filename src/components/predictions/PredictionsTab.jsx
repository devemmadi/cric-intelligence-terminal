/* eslint-disable */
import React, { useState } from "react";
import { C, API_BASE, cleanTeam, IPL_TEAMS, PSL_TEAMS, getLeague } from "../shared/constants";
import TeamLogo from "../shared/TeamLogo";
import { MatchPill } from "../shared/MatchCard";
import LiveProbabilityGraph from "./LiveProbabilityGraph";

// ─── Small sub-components (only used inside predictions) ──────────────────────

function WinArc({ value }) {
    const r = 54, cx = 64, cy = 64, circ = Math.PI * r;
    const pct = Math.min(Math.max(value, 0), 100) / 100;
    const color = value >= 65 ? C.green : value >= 45 ? C.amber : C.red;
    return (
        <svg width={128} height={80} viewBox="0 0 128 80">
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={C.border} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={900} fill={C.text} fontFamily="Inter, system-ui">{value}%</text>
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

function NextOverIntelligence({ pred }) {
    if (!pred || !pred.nextOvers || pred.nextOvers.length < 2) return null;
    const ov1 = pred.nextOvers[0];
    const ov2 = pred.nextOvers[1];
    const detr = pred.deteriorationFactor || 1.0;
    const spinBoost = Math.round((detr - 1.0) * 100);
    const dewSoon = pred.weatherImpact?.dewFactor < 0.9;
    const pitchCond = pred.pitchCondition || "FRESH";
    const history = pred.overHistory || [];
    const bowlerQuality = pred.bowlingFactor ? (pred.bowlingFactor <= 0.82 ? "Elite" : pred.bowlingFactor <= 0.92 ? "Good" : "Average") : "Average";
    const batQuality = pred.battingFactor ? (pred.battingFactor >= 1.15 ? "Strong" : pred.battingFactor >= 0.95 ? "Average" : "Weak") : "Average";
    const wicketLabel1 = ov1.wicketProb > 40 ? "High" : ov1.wicketProb > 25 ? "Medium" : "Low";
    const wicketLabel2 = ov2.wicketProb > 40 ? "High" : ov2.wicketProb > 25 ? "Medium" : "Low";
    return (
        <div style={{ padding: "0 0 4px 0", marginBottom: 14 }}>
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
                </div>
            </div>
        </div>
    );
}

function LiveScorecard({ batters, bowler }) {
    if (!batters || batters.length === 0) return null;
    return (
        <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ background: "rgba(200,150,30,0.15)", borderBottom: "1px solid rgba(200,150,30,0.25)", padding: "8px 14px", display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "inline-block", boxShadow: "0 0 6px #EF4444", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#C8961E", letterSpacing: 1.5 }}>LIVE SCORECARD</span>
            </div>
            <div style={{ padding: "12px 14px" }}>
                <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 36px 36px 52px", gap: 4, marginBottom: 6, padding: "0 4px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: 0.8 }}>BATTER</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>R</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>B</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#64748B", textAlign: "right" }}>SR</span>
                    </div>
                    {batters.map((b, i) => {
                        const srColor = b.sr >= 150 ? "#22C55E" : b.sr >= 120 ? "#F59E0B" : b.sr >= 80 ? "#E2E8F0" : "#EF4444";
                        const srBg = b.sr >= 150 ? "rgba(34,197,94,0.12)" : b.sr >= 120 ? "rgba(245,158,11,0.12)" : "transparent";
                        return (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 36px 36px 52px", gap: 4, padding: "8px 4px", borderRadius: 8, background: b.isStriker ? "rgba(255,255,255,0.05)" : "transparent", marginBottom: 4, alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {b.isStriker ? <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 900 }}>▶</span> : <span style={{ width: 10, display: "inline-block" }} />}
                                    <div>
                                        <div style={{ fontSize: 12, fontWeight: b.isStriker ? 800 : 500, color: b.isStriker ? "#FFFFFF" : "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 85 }}>{b.name}</div>
                                        {b.isStriker && <div style={{ fontSize: 9, color: "#22C55E", fontWeight: 600, letterSpacing: 0.5 }}>ON STRIKE</div>}
                                    </div>
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 900, color: "#FFFFFF", textAlign: "right" }}>{b.runs ?? 0}</span>
                                <span style={{ fontSize: 12, color: "#94A3B8", textAlign: "right" }}>{b.balls ?? 0}</span>
                                <div style={{ textAlign: "right" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: srColor, background: srBg, padding: "2px 5px", borderRadius: 5 }}>{b.sr ? Math.round(b.sr) : 0}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 10 }} />
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
                                <span style={{ fontSize: 12, fontWeight: 700, color: bowler.economy <= 6 ? "#22C55E" : bowler.economy <= 9 ? "#F59E0B" : "#EF4444", background: bowler.economy <= 6 ? "rgba(34,197,94,0.12)" : bowler.economy <= 9 ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)", padding: "2px 5px", borderRadius: 5 }}>
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
    React.useEffect(() => {
        const key = (pred?.team1 || "") + (pred?.team2 || "") + (selectedMatch?.matchId || "");
        if (key !== matchKey) { setAnalysis(""); setAsked(false); setMatchKey(key); }
    }, [pred, selectedMatch]);
    async function askClaude() {
        if (!pred || loading) return;
        setLoading(true); setAsked(true); setAnalysis("");
        const batters = (pred.batters || []).map(b => `${b.name} ${b.runs}(${b.balls}) SR:${b.sr}`).join(", ") || "N/A";
        const bowler = pred.bowler ? `${pred.bowler.name} ${pred.bowler.overs}ov ECO:${pred.bowler.economy} ${pred.bowler.wickets}wkts` : "N/A";
        const prompt = `You are an elite cricket analyst. Analyze this LIVE match and give sharp, specific predictions.
MATCH: ${pred.team1} vs ${pred.team2} (${pred.matchType?.toUpperCase() || "T20"})
SCORE: ${pred.displayScore} | CRR: ${pred.currentRunRate} | Overs: ${pred.overs}
PITCH: ${pred.pitchLabel || "Unknown"} (${pred.pitchCondition || ""})
AT CREASE: ${batters}
BOWLING: ${bowler}
ML WIN PROBABILITY: ${pred.aiProbability}% for ${pred.team1}
Give me:
1. **WIN PREDICTION** - who wins and why (be confident, give %)
2. **NEXT 5 OVERS** - exact runs range expected, wicket risk
3. **GAME-CHANGER** - one factor that will decide this match
4. **STRATEGY CALL** - what should batting/bowling team do RIGHT NOW
Be sharp, specific, bold. No vague statements.`;
        try {
            const res = await fetch(API_BASE + "/claude-analysis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
            const data = await res.json();
            const text = (data.content || []).map(c => c.text || "").join("") || data.error || "No response.";
            setAnalysis(text);
        } catch (e) { setAnalysis("Error: " + e.message); }
        setLoading(false);
    }
    if (!pred || !pred.team1) return null;
    return (
        <div className="card" style={{ margin: "0 20px 16px", padding: 20, border: "1px solid rgba(139,92,246,0.3)", background: "linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05))" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>🤖</span>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "#7C3AED", letterSpacing: 1 }}>CLAUDE AI ANALYSIS</span>
                    <span style={{ fontSize: 10, background: "rgba(139,92,246,0.15)", color: "#a78bfa", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>BETA</span>
                </div>
                <button onClick={askClaude} disabled={loading} style={{ background: loading ? "#334155" : "#FFB800", border: "none", color: loading ? "#fff" : "#1A1A1A", padding: "8px 18px", borderRadius: 8, cursor: loading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 800 }}>
                    {loading ? "Analyzing..." : asked ? "Refresh" : "Get AI Analysis"}
                </button>
            </div>
            {!asked && !loading && (
                <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center" }}>Click <strong style={{ color: "#FFB800" }}>Get AI Analysis</strong> for live match breakdown</div>
            )}
            {loading && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#a78bfa", fontSize: 13 }}>
                    Claude is analyzing live match data...
                </div>
            )}
            {analysis && (
                <div style={{ borderTop: "1px solid rgba(139,92,246,0.2)", paddingTop: 14 }}>
                    {analysis.split("\n\n").map((block, i) => {
                        const lines = block.split("\n").filter(l => l.trim());
                        if (!lines.length) return null;
                        return (
                            <div key={i} style={{ marginBottom: 10 }}>
                                {lines.map((line, j) => {
                                    if (line.startsWith("- ")) return (
                                        <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4, paddingLeft: 8 }}>
                                            <span style={{ color: "#a78bfa", marginTop: 2 }}>▸</span>
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
        </div>
    );
}

function NoMatchesScreen({ upcomingMatches }) {
    const scheduleMatches = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches : [];
    return (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>
            <div style={{ textAlign: "center", padding: "48px 24px", maxWidth: 400, margin: "0 auto" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                    No live matches right now
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
                    CricIntelligence tracks all IPL, PSL and international T20 matches.<br/>
                    Check back when a match goes live.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                        { icon: "🤖", label: "ML Predictions" },
                        { icon: "📊", label: "Pitch Analysis" },
                        { icon: "💡", label: "Bet Signals" },
                    ].map((f, i) => (
                        <div key={i} style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: C.text }}>
                            {f.icon} {f.label}
                        </div>
                    ))}
                </div>
            </div>
            {scheduleMatches.length > 0 && (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 14 }}>UPCOMING FIXTURES</div>
                    {scheduleMatches.slice(0, 6).map((m, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 20px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.navy }}>{m.t1}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.bg, borderRadius: 6, padding: "3px 8px" }}>vs</div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.navy }}>{m.t2}</div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{m.detail || m.rawStatus || "Upcoming"}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Sidebar section header ────────────────────────────────────────────────────
function SidebarSection({ label, count, color, dot }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 7, margin: "16px 0 8px" }}>
            {dot && <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0, animation: dot === "pulse" ? "pulse 1.5s infinite" : "none" }} />}
            <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: 1.2 }}>{label}</span>
            {count > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, background: color + "22", color, borderRadius: 20, padding: "1px 7px" }}>{count}</span>
            )}
            <div style={{ flex: 1, height: 1, background: color + "22" }} />
        </div>
    );
}

// ─── Sidebar with all live matches grouped by IPL/PSL/International ───────────
function MatchesSidebar({ liveMatches, selectedMatch, onMatchSelect, liveStatus, pred }) {
    const isIPL = m => IPL_TEAMS.some(t => (m.t1||'')===t||(m.t2||'')===t);
    const isPSL = m => PSL_TEAMS.some(t => (m.t1||'')===t||(m.t2||'')===t);

    const liveList     = liveMatches.filter(m => m.status === "LIVE");
    const upcomingList = liveMatches.filter(m => m.status === "UPCOMING");
    const recentList   = liveMatches.filter(m => m.status === "ENDED");

    const groups = [
        { key: "IPL", label: "IPL 2026", color: "#F59E0B", ms: liveList.filter(isIPL) },
        { key: "PSL", label: "PSL 2026",  color: "#10B981", ms: liveList.filter(isPSL) },
        { key: "INT", label: "International", color: "#818CF8", ms: liveList.filter(m => !isIPL(m) && !isPSL(m)) },
    ];

    return (
        <aside className="sl" style={{
            borderRight: "1px solid #1E293B",
            background: "#0A0E1A",
            padding: "16px 12px",
            overflowY: "auto",
        }}>
            {/* Header pill */}
            <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 16, padding: "8px 12px",
                background: liveList.length > 0 ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
                border: `1px solid ${liveList.length > 0 ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.2)"}`,
                borderRadius: 10,
            }}>
                {liveList.length > 0 && (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 11, fontWeight: 800, color: liveList.length > 0 ? "#EF4444" : "#818CF8", flex: 1 }}>
                    {liveList.length > 0 ? `${liveList.length} Live Match${liveList.length > 1 ? "es" : ""}` : "Match Centre"}
                </span>
                <span style={{ fontSize: 10, color: "#475569" }}>
                    {liveMatches.length} total
                </span>
            </div>

            {/* LIVE NOW */}
            {liveList.length > 0 && (
                <>
                    <SidebarSection label="LIVE NOW" count={liveList.length} color="#EF4444" dot="pulse" />
                    {groups.map(g => {
                        if (g.ms.length === 0) return null;
                        return (
                            <div key={g.key} style={{ marginBottom: 4 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: g.color, letterSpacing: 1, marginBottom: 5, paddingLeft: 3 }}>
                                    {g.label}
                                </div>
                                {g.ms.map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => onMatchSelect(m)} />
                                ))}
                            </div>
                        );
                    })}
                </>
            )}

            {/* UPCOMING */}
            {upcomingList.length > 0 && (
                <>
                    <SidebarSection label="UPCOMING" count={upcomingList.length} color="#F59E0B" dot={false} />
                    {upcomingList.slice(0, 5).map(m => (
                        <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => onMatchSelect(m)} />
                    ))}
                </>
            )}

            {/* RECENT */}
            {recentList.length > 0 && (
                <>
                    <SidebarSection label="RECENT" count={0} color="#475569" dot={false} />
                    {recentList.slice(0, 4).map(m => (
                        <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => onMatchSelect(m)} />
                    ))}
                </>
            )}

            {/* Runs trend sparkline */}
            {pred?.overHistory?.length > 2 && (
                <div style={{ marginTop: 16, padding: "12px 12px 10px", background: "#0D1117", border: "1px solid #1E293B", borderRadius: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: 1, marginBottom: 8 }}>RUNS TREND</div>
                    <Spark data={pred.overHistory} />
                </div>
            )}
        </aside>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PredictionsTab({ liveMatches, selectedMatch, onMatchSelect, pred, liveStatus, isFirstLoad, isPredLoading }) {
    const [activeOver, setActiveOver] = useState(0);
    const prob = pred?.aiProbability || 50;
    const winMsg = prob >= 65 ? "Strong position" : prob >= 45 ? "Close contest" : "Under pressure";
    const winColor = prob >= 65 ? C.green : prob >= 45 ? C.amber : C.red;

    return (
        <div className="mg fade" style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 240px", minHeight: "calc(100vh - 54px)", width: "100%" }}>
            {/* LEFT SIDEBAR */}
            <MatchesSidebar
                liveMatches={liveMatches}
                selectedMatch={selectedMatch}
                onMatchSelect={onMatchSelect}
                liveStatus={liveStatus}
                pred={pred}
            />

            {/* MAIN CONTENT */}
            <main className="mc" style={{ padding: 0, overflowY: "auto", overflow: "visible" }}>
                {/* Show NoMatchesScreen only if no match selected and not loading */}
                {!selectedMatch && !pred && !isPredLoading && (
                    <NoMatchesScreen upcomingMatches={liveMatches.filter(m => m.status === "UPCOMING")} />
                )}

                {/* Show header + content whenever a match is selected */}
                {(selectedMatch || pred) && (
                    <>
                        {/* Match header — uses selectedMatch immediately, falls back to pred */}
                        <div style={{ background: "linear-gradient(160deg,#1a2760 0%,#253580 100%)", padding: "16px 24px 20px", position: "sticky", top: 0, zIndex: 100, color: "#fff" }}>
                            {/* Thin loading bar at top */}
                            {isPredLoading && (
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "#C8961E", animation: "loadingBar 1.5s ease-in-out infinite", transformOrigin: "left" }} />
                                </div>
                            )}
                            <style>{`@keyframes loadingBar { 0%{transform:scaleX(0);opacity:1} 70%{transform:scaleX(0.8);opacity:1} 100%{transform:scaleX(1);opacity:0} }`}</style>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{pred?.venue || selectedMatch?.detail || ""}</div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <TeamLogo name={(pred?.team1 || selectedMatch?.t1 || "").toLowerCase()} size={40} imageId={pred?.team1ImageId || selectedMatch?.t1ImageId || 0} />
                                        <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "#fff" }}>{cleanTeam(pred?.team1 || selectedMatch?.t1)}</span>
                                    </div>
                                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>vs</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "rgba(255,255,255,0.55)" }}>{cleanTeam(pred?.team2 || selectedMatch?.t2)}</span>
                                        <TeamLogo name={(pred?.team2 || selectedMatch?.t2 || "").toLowerCase()} size={40} imageId={pred?.team2ImageId || selectedMatch?.t2ImageId || 0} />
                                    </div>
                                </div>
                                {pred?.displayScore && (
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "8px 18px" }}>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pred.displayScore}</span>
                                        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>CRR {pred.currentRunRate || ""}</span>
                                        {pred.momentum !== undefined && pred.currentRunRate > 0 && (
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: pred.momentum > 0.5 ? "rgba(0,200,150,0.25)" : pred.momentum < -0.5 ? "rgba(229,62,62,0.25)" : "rgba(255,255,255,0.1)", color: pred.momentum > 0.5 ? "#00D4AA" : pred.momentum < -0.5 ? "#FF6B6B" : "rgba(255,255,255,0.7)" }}>
                                                {pred.momentum > 0 ? "+" : ""}{pred.momentum ? pred.momentum.toFixed(1) : "0"} vs avg
                                            </span>
                                        )}
                                        <button onClick={() => { const t = `${cleanTeam(pred.team1)} vs ${cleanTeam(pred.team2)} - AI: ${prob}% win probability. cricintelligence.com`; try { navigator.clipboard?.writeText(t).then(() => alert("Copied!")); } catch { } }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#C8961E", fontWeight: 700 }}>Share</button>
                                    </div>
                                )}
                                {isPredLoading && !pred?.displayScore && (
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>Loading prediction...</div>
                                )}
                            </div>
                        </div>

                        {/* Skeleton only when no pred at all (first ever load) */}
                        {!pred && isPredLoading && (
                            <div style={{ padding: "24px 20px" }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 14, border: "1px solid #E2E8F0" }}>
                                        <div style={{ height: 12, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 6, width: "40%", marginBottom: 12 }} />
                                        <div style={{ height: 32, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 8, width: "70%", marginBottom: 12 }} />
                                        <div style={{ height: 8, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "100%", marginBottom: 8 }} />
                                    </div>
                                ))}
                            </div>
                        )}
                        {pred && <div style={{ padding: "16px" }}>
                            {/* TRUST BAR */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 12 }}>
                                {[
                                    { label: "⚡ Live data from Cricbuzz" },
                                    { label: "🤖 ML model — 80% accuracy" },
                                    ...(pred.venue ? [{ label: `📍 ${pred.venue}` }] : []),
                                ].map((item) => (
                                    <span key={item.label} style={{ fontSize: 10, color: C.muted, background: "rgba(100,116,139,0.12)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px" }}>
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                            <NextOverIntelligence pred={pred} />

                            <div className="cr" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 14, alignItems: "start" }}>
                                {/* Next overs card */}
                                <div className="card" style={{ padding: 22, marginBottom: 14 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>{`Next ${(pred?.nextOvers || []).length} overs prediction`}</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {(pred.nextOvers || []).slice(0, 3).map((ov, i) => {
                                            const wc = ov.wicketProb > 40 ? C.red : ov.wicketProb > 25 ? C.amber : C.green;
                                            const runFill = Math.min(100, (ov.expectedRuns / 18) * 100);
                                            const batSR = pred?.playerContext?.strikerSR || 0;
                                            const bowlEco = pred?.playerContext?.bowlerEco || 0;
                                            const bndPct = pred?.playerContext?.boundaryPct || 0;
                                            const last3r = pred?.playerContext?.last3Runs || 0;
                                            const last3w = pred?.playerContext?.last3Wkts || 0;
                                            const pship = pred?.playerContext?.partnershipRuns || 0;
                                            const phaseColor = ov.phase === "POWERPLAY" ? C.accent : ov.phase === "DEATH OVERS" ? C.red : C.amber;
                                            const sr = batSR, eco = bowlEco, bnd = bndPct, l3r = last3r, phase = ov.phase || '';
                                            let vText, vBg;
                                            if (sr > 150 && eco > 8.5) { vText = 'BIG SCORING OVER'; vBg = '#E53E3E'; }
                                            else if (sr > 150 || (eco > 8 && bnd > 35)) { vText = 'RUNS LIKELY'; vBg = '#DD6B20'; }
                                            else if (sr < 100 && eco < 6.5) { vText = 'TIGHT OVER'; vBg = '#276749'; }
                                            else if (l3r > 25 || phase === 'DEATH OVERS') { vText = 'HOT MOMENTUM'; vBg = '#6B21A8'; }
                                            else { vText = 'STEADY OVER'; vBg = '#1D4ED8'; }
                                            return (
                                                <div key={i} onClick={() => setActiveOver(i)} style={{
                                                    background: activeOver === i ? "#2A3F82" : "#1B2A6B",
                                                    border: `2px solid ${activeOver === i ? "#fff" : "rgba(255,255,255,0.18)"}`,
                                                    borderLeft: `4px solid ${activeOver === i ? "#fff" : phaseColor}`,
                                                    borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s"
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>Over {ov.over}</span>
                                                            <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: phaseColor, padding: "2px 8px", borderRadius: 20 }}>{ov.phase}</span>
                                                        </div>
                                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{ov.confidence}% conf</span>
                                                    </div>
                                                    <div style={{ display: 'inline-block', marginBottom: 8, padding: '6px 16px', background: vBg, borderRadius: 20, boxShadow: `0 0 16px ${vBg}88`, animation: 'labelPulse 2s ease-in-out infinite' }}>
                                                        <span style={{ fontSize: 11, fontWeight: 900, color: '#FFFFFF', letterSpacing: 1.2, textTransform: "uppercase" }}>{vText}</span>
                                                    </div>
                                                    <div style={{ marginBottom: 10 }}>
                                                        {batSR > 0 && <BarStat label="Batter SR" value={batSR} max={200} color={batSR >= 150 ? "#00FF94" : batSR >= 100 ? "#FFB800" : "#FF4444"} text={`${batSR} · ${batSR >= 150 ? "Explosive" : batSR >= 100 ? "Aggressive" : "Struggling"}`} />}
                                                        {bowlEco > 0 && <BarStat label="Bowl eco" value={bowlEco * 7} max={100} color={bowlEco <= 6 ? "#00FF94" : bowlEco <= 9 ? "#FFB800" : "#FF4444"} text={`${bowlEco} · ${bowlEco <= 6 ? "Tight" : bowlEco <= 9 ? "Average" : "Expensive"}`} />}
                                                        {bndPct > 0 && <BarStat label="Boundary %" value={bndPct * 2} max={100} color={bndPct >= 40 ? "#00FF94" : bndPct >= 20 ? "#FFB800" : "#94A3B8"} text={`${bndPct}% · ${bndPct >= 40 ? "Firing" : bndPct >= 20 ? "Active" : "Dry"}`} />}
                                                        {last3r > 0 && <BarStat label="Last 3 overs" value={last3r * 3} max={100} color={last3r > 25 ? "#00FF94" : last3r > 15 ? "#FFB800" : "#64748B"} text={`${last3r}r${last3w > 0 ? ` ${last3w}w` : ""} · ${last3r > 25 ? "Hot" : last3r > 15 ? "Moving" : "Dry"}`} />}
                                                        {pship > 0 && <BarStat label="Partnership" value={Math.min(100, pship)} max={100} color={pship > 50 ? "#FF4444" : pship > 25 ? "#FFB800" : "#64748B"} text={`${pship} · ${pship > 50 ? "Dangerous" : pship > 25 ? "Building" : "New"}`} />}
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                                                        <span style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", lineHeight: 1, letterSpacing: -1 }}>{ov.runRange}</span>
                                                        <span style={{ fontSize: 12, color: "#CBD5E1" }}>runs expected</span>
                                                    </div>
                                                    <div style={{ height: 5, background: C.border, borderRadius: 3 }}>
                                                        <div style={{ height: "100%", width: runFill + "%", background: "linear-gradient(90deg, #4A90E2, #00D4AA)", borderRadius: 3, transition: "width 0.4s" }} />
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>Expected: {ov.expectedRuns} runs</span>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: wc }}>{ov.wicketProb}% wicket</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right column: scorecard + win prob */}
                                <div style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 14 }}>
                                    {pred.batters && pred.batters.length > 0 && (
                                        <LiveScorecard batters={pred.batters} bowler={pred.bowler || {}} />
                                    )}
                                    <div className="card" style={{ padding: 22 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>Win probability</div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: winColor, marginBottom: 8, letterSpacing: 0.3 }}>{winMsg}</div>
                                        <WinArc value={prob} />
                                        <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: "center" }}>{cleanTeam(pred.team1)} · {prob}%</div>
                                    </div>
                                    <div className="card" style={{ padding: 22 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Match intel</div>
                                        {pred.pressureScore !== undefined && (
                                            <div style={{ marginBottom: 14 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>PRESSURE INDEX</span>
                                                    <span style={{ fontSize: 13, fontWeight: 900, color: pred.pressureScore > 70 ? C.red : pred.pressureScore > 45 ? C.amber : C.green }}>
                                                        {pred.pressureScore > 75 ? "CRITICAL" : pred.pressureScore > 55 ? "HIGH" : pred.pressureScore > 35 ? "MODERATE" : "LOW"} {pred.pressureScore}/100
                                                    </span>
                                                </div>
                                                <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden" }}>
                                                    <div style={{ height: "100%", width: pred.pressureScore + "%", borderRadius: 6, transition: "width 0.6s ease", background: pred.pressureScore > 70 ? "linear-gradient(90deg,#E53E3E,#FF6B6B)" : pred.pressureScore > 45 ? "linear-gradient(90deg,#DD6B20,#F6AD55)" : "linear-gradient(90deg,#276749,#68D391)" }} />
                                                </div>
                                            </div>
                                        )}
                                        <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: C.muted }}>{pred.weatherImpact?.tip || "Bright conditions favour batters."}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Probability Graph */}
                            {pred.overs > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                    <LiveProbabilityGraph pred={pred} />
                                </div>
                            )}

                            {pred.toss && (
                                <div style={{ background: "linear-gradient(135deg,#1E2D6B,#253580)", borderRadius: 14, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 2 }}>TOSS</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pred.toss.winner} won - elected to {pred.toss.decision}</div>
                                    </div>
                                </div>
                            )}

                            <div className="cr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <div className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                                    <span style={{ fontSize: 32 }}>{pred.weatherImpact?.emoji || "🌤"}</span>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>WEATHER</div>
                                        <div style={{ fontSize: 20, fontWeight: 900 }}>{pred.weather?.temp || ""}°C</div>
                                        <div style={{ fontSize: 11, color: C.muted }}>{pred.weather?.condition || ""}</div>
                                    </div>
                                </div>
                                <div className="card" style={{ padding: 18 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>PITCH</div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{pred.pitchLabel || ""}</div>
                                    <div style={{ fontSize: 11, color: C.muted }}>{pred.pitchCondition || ""}</div>
                                </div>
                            </div>

                            <ClaudeAnalysis pred={pred} selectedMatch={selectedMatch} />
                        </div>}
                    </>
                )}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="sr" style={{ borderLeft: `1px solid ${C.border}`, padding: "18px 14px", background: C.surface, display: "flex", flexDirection: "column", gap: 14 }}>
                {pred && pred.team1 && (
                    <div style={{ background: C.bg, borderRadius: 12, padding: "14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>MATCH CONTEXT</div>
                        {[
                            ["Format", pred.matchType?.toUpperCase() || "T20"],
                            ["Phase", pred.currentPhase || ""],
                            ["Pitch", pred.pitchLabel || ""],
                            ["Weather", pred.weatherImpact?.condition || ""],
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
                {pred && pred.team1 && (
                    <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}`, background: C.bg }}>
                        <div style={{ padding: "12px 14px" }}>
                            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>AI PREDICTION SUMMARY</div>
                            {/* Win prob */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontSize: 11, color: C.muted }}>{cleanTeam(pred.team1)} win</span>
                                <span style={{ fontSize: 14, fontWeight: 900, color: prob >= 60 ? C.green : prob <= 40 ? C.red : C.amber }}>{prob}%</span>
                            </div>
                            {/* Next over */}
                            {pred.nextOvers?.[0] && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, color: C.muted }}>Next over</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{pred.nextOvers[0].runRange} runs</span>
                                </div>
                            )}
                            {/* Wicket risk */}
                            {pred.nextOvers?.[0] && (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <span style={{ fontSize: 11, color: C.muted }}>Wicket risk</span>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: pred.nextOvers[0].wicketProb > 40 ? C.red : pred.nextOvers[0].wicketProb > 25 ? C.amber : C.green }}>
                                        {pred.nextOvers[0].wicketProb > 40 ? "High" : pred.nextOvers[0].wicketProb > 25 ? "Medium" : "Low"} · {pred.nextOvers[0].wicketProb}%
                                    </span>
                                </div>
                            )}
                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginBottom: 6 }}>
                                <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>Want to act on this prediction?</div>
                                <a href="https://reffpa.com/L?tag=d_5453500m_97c_&site=5453500&ad=97" target="_blank" rel="noreferrer noopener"
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: C.navy, border: `1px solid ${C.navyLight || "#2A3F6F"}`, borderRadius: 8, padding: "9px 14px", textDecoration: "none", fontWeight: 700, fontSize: 12, color: "rgba(255,255,255,0.85)", transition: "opacity .15s" }}
                                    onMouseOver={e => e.currentTarget.style.opacity = "0.8"}
                                    onMouseOut={e => e.currentTarget.style.opacity = "1"}>
                                    🎰 Bet on this match · 1xBet
                                </a>
                            </div>
                            <div style={{ fontSize: 9, color: C.muted, textAlign: "center" }}>
                                18+ · <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: C.muted }}>BeGambleAware.org</a>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, textAlign: "center" }}>
                    <a href="/about" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>About Us</a>
                    <span style={{ color: C.border, margin: "0 6px" }}>·</span>
                    <a href="mailto:emmadi.dev@gmail.com" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>Contact</a>
                </div>
            </aside>
        </div>
    );
}

// Small helper to reduce repetition in bar stats
function BarStat({ label, value, max, color, text }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color }}>{text}</span>
            </div>
            <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: 6 }} />
            </div>
        </div>
    );
}
