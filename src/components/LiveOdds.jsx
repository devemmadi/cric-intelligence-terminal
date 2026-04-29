/* eslint-disable */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE, C } from "./shared/constants";
import Logo from "./Logo";

const BG      = "#0B1120";
const SURFACE = "#111827";
const BORDER  = "rgba(255,255,255,0.08)";
const TEXT    = "#E2E8F0";
const MUTED   = "#64748B";
const GREEN   = "#10B981";
const RED     = "#EF4444";
const AMBER   = "#F59E0B";
const NAVY    = "#1E2D6B";

// Short team name from full string e.g. "Punjab Kings" → "Punjab Kings"
function shortName(name) {
    return (name || "").split(",")[0].trim();
}

function SportBadge({ sport }) {
    const label = (sport || "").replace("cricket_", "").replace(/_/g, " ").toUpperCase();
    const isIPL = label.includes("IPL");
    const color = isIPL ? "#FBBF24" : "#94A3B8";
    const bg    = isIPL ? "rgba(251,191,36,0.12)" : "rgba(148,163,184,0.1)";
    return (
        <span style={{ fontSize: 9, fontWeight: 700, color, background: bg, padding: "2px 7px", borderRadius: 4 }}>
            {label || "CRICKET"}
        </span>
    );
}

function AiEdgePill({ edge, rating }) {
    const isValue  = rating === "VALUE" || rating === "STRONG VALUE";
    const isStrong = rating === "STRONG VALUE";
    if (!isValue) return null;
    return (
        <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
            padding: "2px 8px", borderRadius: 5,
            background: isStrong ? "rgba(16,185,129,0.18)" : "rgba(74,222,128,0.12)",
            color: isStrong ? GREEN : "#4ADE80",
        }}>
            {isStrong ? "🔥 AI: Strong Value" : "✅ AI: Value"} ({edge > 0 ? "+" : ""}{edge.toFixed(1)}%)
        </span>
    );
}

function MatchCard({ match }) {
    const [expanded, setExpanded] = useState(true); // open by default
    const isLive = match.status === "LIVE";
    const t1 = shortName(match.team1);
    const t2 = shortName(match.team2);

    const bookmakers = match.bookmakers || [];
    const t1words = t1.toLowerCase().split(" ").filter(w => w.length > 2);
    const t2words = t2.toLowerCase().split(" ").filter(w => w.length > 2);

    // Best odds for highlighting
    let best1 = 0, best2 = 0;
    bookmakers.forEach(bk => {
        Object.entries(bk.odds || {}).forEach(([name, price]) => {
            const nl = name.toLowerCase();
            if (t1words.some(w => nl.includes(w))) best1 = Math.max(best1, price);
            else best2 = Math.max(best2, price);
        });
    });

    // Fallback to match.team1Odds/team2Odds if bookmakers array empty
    if (best1 === 0) best1 = match.team1Odds || 0;
    if (best2 === 0) best2 = match.team2Odds || 0;

    return (
        <div style={{
            background: SURFACE,
            border: `1px solid ${isLive ? "rgba(16,185,129,0.4)" : BORDER}`,
            borderRadius: 14,
            marginBottom: 14,
            overflow: "hidden",
            boxShadow: isLive ? "0 0 0 1px rgba(16,185,129,0.12), 0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(0,0,0,0.2)",
        }}>
            {/* ── Header ── */}
            <div style={{
                padding: "12px 16px",
                background: isLive ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.02)",
                borderBottom: `1px solid ${BORDER}`,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {isLive && (
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            background: "rgba(16,185,129,0.15)", color: GREEN,
                            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN, display: "inline-block", animation: "livepulse 1.5s infinite" }} />
                            LIVE
                        </span>
                    )}
                    <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>{t1} vs {t2}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {match.seriesName && <span style={{ fontSize: 10, color: MUTED }}>{match.seriesName}</span>}
                    <SportBadge sport={match.sport} />
                </div>
            </div>

            {/* ── Live score ── */}
            {isLive && match.liveScore && (
                <div style={{ padding: "6px 16px", background: "rgba(16,185,129,0.04)", borderBottom: `1px solid ${BORDER}`, fontSize: 12, color: "#86EFAC" }}>
                    {match.liveScore.innings === 2
                        ? `Innings 2: ${match.liveScore.runs}/${match.liveScore.wickets} (${match.liveScore.overs} ov) · Target: ${match.liveScore.target}`
                        : `Innings 1: ${match.liveScore.runs}/${match.liveScore.wickets} (${match.liveScore.overs} ov)`}
                </div>
            )}

            {/* ── Best odds summary bar ── */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr auto 1fr",
                padding: "14px 16px", gap: 8, alignItems: "center",
                borderBottom: bookmakers.length > 0 ? `1px solid ${BORDER}` : "none",
            }}>
                {/* Team 1 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{t1}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: GREEN, lineHeight: 1 }}>
                            {best1 > 0 ? best1.toFixed(2) : "—"}
                        </span>
                        <span style={{ fontSize: 10, color: MUTED }}>best odds</span>
                    </div>
                    <AiEdgePill edge={match.team1Edge} rating={match.team1Rating} />
                </div>

                {/* VS divider */}
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: MUTED, flexShrink: 0,
                }}>VS</div>

                {/* Team 2 */}
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                    <div style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{t2}</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: 10, color: MUTED }}>best odds</span>
                        <span style={{ fontSize: 28, fontWeight: 900, color: GREEN, lineHeight: 1 }}>
                            {best2 > 0 ? best2.toFixed(2) : "—"}
                        </span>
                    </div>
                    <AiEdgePill edge={match.team2Edge} rating={match.team2Rating} />
                </div>
            </div>

            {/* ── Per-bookmaker table ── */}
            {bookmakers.length > 0 && (
                <>
                    {/* Toggle */}
                    <button
                        onClick={() => setExpanded(v => !v)}
                        style={{
                            width: "100%", background: "rgba(255,255,255,0.02)",
                            border: "none", borderBottom: expanded ? `1px solid ${BORDER}` : "none",
                            color: MUTED, fontSize: 11, fontWeight: 600,
                            padding: "8px 16px", cursor: "pointer", textAlign: "left",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}
                    >
                        <span>📊 Compare all bookmakers ({bookmakers.length})</span>
                        <span>{expanded ? "▲ Hide" : "▼ Show"}</span>
                    </button>

                    {expanded && (
                        <div>
                            {/* Table header */}
                            <div style={{
                                display: "grid", gridTemplateColumns: "1fr 90px 90px",
                                padding: "6px 16px", borderBottom: `1px solid ${BORDER}`,
                                background: "rgba(0,0,0,0.2)",
                            }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.8 }}>BOOKMAKER</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.8, textAlign: "center" }}>{t1.split(" ").pop()}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 0.8, textAlign: "center" }}>{t2.split(" ").pop()}</span>
                            </div>

                            {bookmakers.map((bk, i) => {
                                let p1 = null, p2 = null;
                                Object.entries(bk.odds || {}).forEach(([name, price]) => {
                                    const nl = name.toLowerCase();
                                    if (t1words.some(w => nl.includes(w))) p1 = price;
                                    else p2 = price;
                                });
                                const isBest1 = p1 && p1 === best1;
                                const isBest2 = p2 && p2 === best2;
                                return (
                                    <div key={i} style={{
                                        display: "grid", gridTemplateColumns: "1fr 90px 90px",
                                        padding: "9px 16px", alignItems: "center",
                                        borderBottom: i < bookmakers.length - 1 ? `1px solid rgba(255,255,255,0.04)` : "none",
                                        background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.012)",
                                    }}>
                                        <span style={{ fontSize: 13, color: "#CBD5E1" }}>{bk.name}</span>
                                        <div style={{ textAlign: "center" }}>
                                            {p1 != null ? (
                                                <span style={{
                                                    fontSize: 15, fontWeight: 700,
                                                    color: isBest1 ? GREEN : TEXT,
                                                    background: isBest1 ? "rgba(16,185,129,0.1)" : "transparent",
                                                    padding: isBest1 ? "2px 8px" : "2px 8px",
                                                    borderRadius: 5,
                                                }}>
                                                    {p1.toFixed(2)}{isBest1 ? " ✓" : ""}
                                                </span>
                                            ) : <span style={{ color: MUTED, fontSize: 12 }}>—</span>}
                                        </div>
                                        <div style={{ textAlign: "center" }}>
                                            {p2 != null ? (
                                                <span style={{
                                                    fontSize: 15, fontWeight: 700,
                                                    color: isBest2 ? GREEN : TEXT,
                                                    background: isBest2 ? "rgba(16,185,129,0.1)" : "transparent",
                                                    padding: isBest2 ? "2px 8px" : "2px 8px",
                                                    borderRadius: 5,
                                                }}>
                                                    {p2.toFixed(2)}{isBest2 ? " ✓" : ""}
                                                </span>
                                            ) : <span style={{ color: MUTED, fontSize: 12 }}>—</span>}
                                        </div>
                                    </div>
                                );
                            })}

                            <div style={{ padding: "6px 16px 8px", fontSize: 10, color: MUTED }}>
                                ✓ = best available price · {bookmakers.length} bookmakers
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function Skeleton() {
    return (
        <div>
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    background: SURFACE, borderRadius: 14, marginBottom: 14,
                    animation: "livepulse 1.5s ease-in-out infinite",
                }}>
                    <div style={{ height: 50, background: "rgba(255,255,255,0.04)", borderBottom: `1px solid ${BORDER}` }} />
                    <div style={{ height: 80 }} />
                </div>
            ))}
        </div>
    );
}

export default function LiveOdds() {
    const [data,      setData]      = useState(null);
    const [loading,   setLoading]   = useState(true);
    const [filter,    setFilter]    = useState("ALL");
    const [lastFetch, setLastFetch] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Live Cricket Odds Comparison | CricIntelligence";
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
        const t = setInterval(fetchOdds, 60000);
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

    const liveCount  = allMatches.filter(m => m.status === "LIVE").length;
    const valueCount = allMatches.filter(m =>
        m.team1Rating === "VALUE" || m.team1Rating === "STRONG VALUE" ||
        m.team2Rating === "VALUE" || m.team2Rating === "STRONG VALUE"
    ).length;

    return (
        <div style={{ minHeight: "100vh", background: BG, fontFamily: "Inter, -apple-system, system-ui", color: TEXT }}>
            <style>{`
                @keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
                .odds-tab { background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #94A3B8; padding: 6px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
                .odds-tab:hover { border-color: rgba(255,255,255,0.3); color: #E2E8F0; }
                .odds-tab.active { background: #1E2D6B; border-color: #4A5FAD; color: #fff; }
            `}</style>

            {/* Nav */}
            <nav style={{
                background: C.navy, borderBottom: `1px solid rgba(255,255,255,0.08)`,
                padding: "0 20px", height: 54,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                position: "sticky", top: 0, zIndex: 100,
            }}>
                <div onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <Logo href="/" />
                </div>
                <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: MUTED, fontSize: 12, cursor: "pointer" }}>← Back</button>
            </nav>

            <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 16px 100px" }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px", color: TEXT }}>
                            🏏 Live Odds Comparison
                        </h1>
                        <p style={{ margin: 0, fontSize: 13, color: MUTED }}>
                            Best odds across UK bookmakers · ✓ = best price available
                        </p>
                    </div>
                    {lastFetch && (
                        <div style={{ fontSize: 11, color: MUTED, paddingTop: 4 }}>
                            Updated {lastFetch.toLocaleTimeString()} · auto-refresh 60s
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                    {[
                        { label: "Matches",   value: allMatches.length, color: TEXT },
                        { label: "Live Now",  value: liveCount,         color: GREEN },
                        { label: "AI Value",  value: valueCount,        color: AMBER },
                    ].map(s => (
                        <div key={s.label} style={{
                            background: SURFACE, border: `1px solid ${BORDER}`,
                            borderRadius: 10, padding: "8px 16px", minWidth: 80,
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                    {[
                        { key: "ALL",      label: `All (${allMatches.length})` },
                        { key: "LIVE",     label: `🔴 Live (${liveCount})` },
                        { key: "UPCOMING", label: "Upcoming" },
                        { key: "VALUE",    label: `⚡ AI Value (${valueCount})` },
                    ].map(f => (
                        <button key={f.key} className={`odds-tab ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <Skeleton />
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 20px", color: MUTED }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                        <div style={{ fontSize: 14 }}>
                            {allMatches.length === 0
                                ? "No cricket odds available yet. Bookmakers open markets closer to match time."
                                : "No matches in this filter. Try 'All'."}
                        </div>
                    </div>
                ) : (
                    filtered.map(m => <MatchCard key={m.matchKey || m.team1 + m.team2} match={m} />)
                )}

                {/* Disclaimer */}
                <div style={{
                    marginTop: 24, padding: "12px 16px",
                    background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}`,
                    borderRadius: 10, fontSize: 11, color: MUTED, lineHeight: 1.6,
                }}>
                    <strong style={{ color: TEXT }}>ℹ️ For informational purposes only.</strong>{" "}
                    Odds from The Odds API (UK bookmakers). AI value = AI probability exceeds bookmaker implied probability.
                    CricIntelligence does not facilitate gambling. 18+ · BeGambleAware.org
                </div>
            </div>
        </div>
    );
}
