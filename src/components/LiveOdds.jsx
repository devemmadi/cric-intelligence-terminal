/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, C } from "./shared/constants";
import Logo from "./Logo";

const BG       = "#0B1120";
const SURFACE  = "#111827";
const BORDER   = "rgba(255,255,255,0.08)";
const TEXT      = "#E2E8F0";
const MUTED    = "#64748B";
const GREEN    = "#10B981";
const RED      = "#EF4444";
const AMBER    = "#F59E0B";
const GOLD     = "#FBBF24";
const BLUE     = "#60A5FA";
const NAVY     = "#1E2D6B";

function EdgeBadge({ edge, rating }) {
    const isPositive = edge > 0;
    const isStrong   = rating === "STRONG VALUE";
    const isValue    = rating === "VALUE";
    const isFair     = rating === "FAIR";

    const bg    = isStrong ? "#14532D" : isValue ? "#1A3A2A" : isFair ? "#1C1F2B" : "#2D1515";
    const color = isStrong ? GREEN : isValue ? "#4ADE80" : isFair ? MUTED : RED;
    const label = isStrong ? "🔥 STRONG VALUE" : isValue ? "✅ VALUE" : isFair ? "— FAIR" : "❌ AVOID";

    return (
        <span style={{
            display: "inline-block",
            background: bg, color,
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            padding: "3px 8px", borderRadius: 5,
        }}>
            {label}
        </span>
    );
}

function TeamOddsRow({ teamName, odds, implied, aiProb, edge, rating }) {
    const isPositiveEdge = edge > 0;
    const edgeColor = edge > 5 ? GREEN : edge > -5 ? MUTED : RED;

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 60px 70px 70px 80px 110px",
            gap: 8,
            alignItems: "center",
            padding: "10px 14px",
            borderBottom: `1px solid ${BORDER}`,
        }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{teamName}</div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{odds.toFixed(2)}</div>
                <div style={{ fontSize: 9, color: MUTED }}>ODDS</div>
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{implied.toFixed(1)}%</div>
                <div style={{ fontSize: 9, color: MUTED }}>MARKET</div>
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: BLUE }}>{aiProb.toFixed(1)}%</div>
                <div style={{ fontSize: 9, color: MUTED }}>AI</div>
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: edgeColor }}>
                    {isPositiveEdge ? "+" : ""}{edge.toFixed(1)}%
                </div>
                <div style={{ fontSize: 9, color: MUTED }}>EDGE</div>
            </div>
            <div style={{ textAlign: "right" }}>
                <EdgeBadge edge={edge} rating={rating} />
            </div>
        </div>
    );
}

function MatchCard({ match }) {
    const isLive = match.status === "LIVE";

    const sportLabel = (match.sport || "").replace("cricket_", "").replace(/_/g, " ").toUpperCase();

    return (
        <div style={{
            background: SURFACE,
            border: `1px solid ${isLive ? "rgba(16,185,129,0.35)" : BORDER}`,
            borderRadius: 12,
            marginBottom: 12,
            overflow: "hidden",
            boxShadow: isLive ? "0 0 0 1px rgba(16,185,129,0.15)" : "none",
        }}>
            {/* Header */}
            <div style={{
                padding: "10px 14px",
                background: isLive ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.02)",
                borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {isLive && (
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            background: "rgba(16,185,129,0.15)", color: GREEN,
                            fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, display: "inline-block", animation: "pulse 1.5s infinite" }} />
                            LIVE
                        </span>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>
                        {match.team1} vs {match.team2}
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {match.seriesName && (
                        <span style={{ fontSize: 10, color: MUTED }}>{match.seriesName}</span>
                    )}
                    {sportLabel && (
                        <span style={{
                            fontSize: 9, fontWeight: 700, color: AMBER,
                            background: "rgba(245,158,11,0.12)", padding: "2px 6px", borderRadius: 4,
                        }}>{sportLabel}</span>
                    )}
                </div>
            </div>

            {/* Live score if available */}
            {match.liveScore && match.status === "LIVE" && (
                <div style={{
                    padding: "6px 14px", background: "rgba(16,185,129,0.04)",
                    borderBottom: `1px solid ${BORDER}`,
                    fontSize: 12, color: MUTED,
                }}>
                    {match.liveScore.innings === 2
                        ? `Innings 2: ${match.liveScore.runs}/${match.liveScore.wickets} (${match.liveScore.overs} ov) · Target: ${match.liveScore.target}`
                        : `Innings 1: ${match.liveScore.runs}/${match.liveScore.wickets} (${match.liveScore.overs} ov)`
                    }
                </div>
            )}

            {/* Column headers */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 60px 70px 70px 80px 110px",
                gap: 8, padding: "6px 14px",
                borderBottom: `1px solid ${BORDER}`,
                background: "rgba(255,255,255,0.02)",
            }}>
                {["TEAM", "ODDS", "MARKET%", "AI%", "EDGE", "RATING"].map(h => (
                    <div key={h} style={{ fontSize: 9, fontWeight: 700, color: MUTED, letterSpacing: 0.8, textAlign: h === "TEAM" ? "left" : "center" }}>
                        {h === "RATING" ? <span style={{ textAlign: "right", display: "block" }}>{h}</span> : h}
                    </div>
                ))}
            </div>

            <TeamOddsRow
                teamName={match.team1}
                odds={match.team1Odds}
                implied={match.team1Implied}
                aiProb={match.team1AiProb}
                edge={match.team1Edge}
                rating={match.team1Rating}
            />
            <TeamOddsRow
                teamName={match.team2}
                odds={match.team2Odds}
                implied={match.team2Implied}
                aiProb={match.team2AiProb}
                edge={match.team2Edge}
                rating={match.team2Rating}
            />
        </div>
    );
}

function Skeleton() {
    return (
        <div style={{ padding: "0 16px" }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    background: SURFACE, borderRadius: 12, marginBottom: 12, overflow: "hidden",
                    animation: "pulse 1.5s ease-in-out infinite",
                }}>
                    <div style={{ height: 44, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${BORDER}` }} />
                    <div style={{ height: 42, borderBottom: `1px solid ${BORDER}` }} />
                    <div style={{ height: 42 }} />
                </div>
            ))}
        </div>
    );
}

export default function LiveOdds() {
    const [data,     setData]     = useState(null);
    const [loading,  setLoading]  = useState(true);
    const [filter,   setFilter]   = useState("ALL"); // ALL | LIVE | UPCOMING | VALUE
    const [lastFetch, setLastFetch] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Live Cricket Odds vs AI Predictions | CricIntelligence";
    }, []);

    const fetchOdds = useCallback(async () => {
        try {
            const r = await fetch(`${API_BASE}/odds/live`);
            if (!r.ok) throw new Error("fetch failed");
            const json = await r.json();
            setData(json);
            setLastFetch(new Date());
        } catch (e) {
            console.error("Odds fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOdds();
        const t = setInterval(fetchOdds, 60000); // refresh every 60s
        return () => clearInterval(t);
    }, [fetchOdds]);

    const allMatches = data?.matches || [];
    const filtered = allMatches.filter(m => {
        if (filter === "LIVE")     return m.status === "LIVE";
        if (filter === "UPCOMING") return m.status === "UPCOMING";
        if (filter === "VALUE")    return m.team1Rating === "VALUE" || m.team1Rating === "STRONG VALUE"
                                       || m.team2Rating === "VALUE" || m.team2Rating === "STRONG VALUE";
        return true;
    });

    const liveCount    = allMatches.filter(m => m.status === "LIVE").length;
    const valueCount   = allMatches.filter(m =>
        m.team1Rating === "VALUE" || m.team1Rating === "STRONG VALUE" ||
        m.team2Rating === "VALUE" || m.team2Rating === "STRONG VALUE"
    ).length;

    return (
        <div style={{ minHeight: "100vh", background: BG, fontFamily: "Inter, -apple-system, system-ui", color: TEXT }}>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
                .odds-tab { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #94A3B8; padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
                .odds-tab:hover { border-color: rgba(255,255,255,0.25); color: #E2E8F0; }
                .odds-tab.active { background: #1E2D6B; border-color: #4A5FAD; color: #E2E8F0; }
                .odds-tab-btn { background: transparent; border: none; cursor: pointer; }
            `}</style>

            {/* Nav */}
            <nav style={{
                background: C.navy, borderBottom: `1px solid ${C.navyLight}`,
                padding: "0 20px", height: 54,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                position: "sticky", top: 0, zIndex: 100,
            }}>
                <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <Logo href="/" />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button className="odds-tab-btn" onClick={() => navigate("/")} style={{ color: MUTED, fontSize: 12 }}>← Back</button>
                </div>
            </nav>

            {/* Header */}
            <div style={{ padding: "28px 20px 0", maxWidth: 780, margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: TEXT }}>
                            📊 Live Odds vs AI
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                            Bookmaker implied probability vs CricIntel AI prediction · Edge = AI − Market
                        </p>
                    </div>
                    {lastFetch && (
                        <div style={{ fontSize: 11, color: MUTED, paddingTop: 4 }}>
                            Updated {lastFetch.toLocaleTimeString()} · auto-refresh 60s
                        </div>
                    )}
                </div>

                {/* Stats bar */}
                <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                    {[
                        { label: "Matches with Odds", value: allMatches.length, color: TEXT },
                        { label: "Live Now",           value: liveCount,        color: GREEN },
                        { label: "Value Opportunities",value: valueCount,       color: AMBER },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: SURFACE, border: `1px solid ${BORDER}`,
                            borderRadius: 8, padding: "8px 14px",
                            minWidth: 100,
                        }}>
                            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 8, marginTop: 16, marginBottom: 20, flexWrap: "wrap" }}>
                    {[
                        { key: "ALL",      label: `All (${allMatches.length})` },
                        { key: "LIVE",     label: `🔴 Live (${liveCount})` },
                        { key: "UPCOMING", label: `Upcoming` },
                        { key: "VALUE",    label: `⚡ Value (${valueCount})` },
                    ].map(f => (
                        <button
                            key={f.key}
                            className={`odds-tab ${filter === f.key ? "active" : ""}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 16px 100px" }}>
                {loading ? (
                    <Skeleton />
                ) : filtered.length === 0 ? (
                    <div style={{
                        textAlign: "center", padding: "60px 20px",
                        color: MUTED, fontSize: 14,
                    }}>
                        <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                        {allMatches.length === 0
                            ? "No cricket odds available right now. Bookmakers may not have opened markets yet."
                            : "No matches in this filter. Try 'All'."}
                    </div>
                ) : (
                    filtered.map(m => <MatchCard key={m.matchKey || m.team1 + m.team2} match={m} />)
                )}

                {/* Disclaimer */}
                <div style={{
                    marginTop: 32, padding: "14px 16px",
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 10,
                    fontSize: 11, color: MUTED, lineHeight: 1.6,
                }}>
                    <strong style={{ color: TEXT }}>ℹ️ For informational purposes only.</strong>{" "}
                    Odds data sourced from The Odds API. AI probabilities are model predictions — not financial advice.
                    CricIntelligence does not facilitate betting or financial transactions.
                    Edge = AI predicted probability minus bookmaker implied probability.
                    Positive edge means our model is more bullish than the market.
                </div>
            </div>
        </div>
    );
}
