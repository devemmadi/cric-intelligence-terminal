/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE, C } from "../shared/constants";

// Wicket risk color
const riskColor = r => r === "HIGH" ? C.red : r === "MEDIUM" ? C.amber : C.green;

// Run range bar — visual width relative to max expected
function RunBar({ lo, hi, expected, max = 20 }) {
    const pctLo  = Math.round((lo  / max) * 100);
    const pctHi  = Math.round((hi  / max) * 100);
    const pctMid = Math.round((expected / max) * 100);
    return (
        <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 4, margin: "8px 0" }}>
            {/* range band */}
            <div style={{
                position: "absolute", left: `${pctLo}%`, width: `${pctHi - pctLo}%`,
                height: "100%", background: "rgba(74,111,212,0.40)", borderRadius: 4,
            }} />
            {/* midpoint dot */}
            <div style={{
                position: "absolute", left: `${pctMid}%`, top: "50%",
                transform: "translate(-50%,-50%)",
                width: 10, height: 10, borderRadius: "50%",
                background: C.accent, border: "2px solid #fff",
                boxShadow: `0 0 8px ${C.accent}`,
            }} />
        </div>
    );
}

// Phase snapshot pill
function PhasePill({ phase, isLatest }) {
    const border = isLatest ? C.gold : "rgba(255,255,255,0.10)";
    const bg     = isLatest ? "rgba(200,150,30,0.12)" : "rgba(255,255,255,0.04)";
    return (
        <div style={{
            padding: "8px 12px", borderRadius: 10,
            border: `1px solid ${border}`, background: bg,
            minWidth: 70, textAlign: "center",
        }}>
            <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{phase.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{phase.rpo}</div>
            <div style={{ fontSize: 10, color: C.muted }}>rpo</div>
            {phase.wkts > 0 && (
                <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>{phase.wkts}w</div>
            )}
        </div>
    );
}

export default function LiveEngine({ pred }) {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastFetch, setLastFetch] = useState(0);
    const timerRef = useRef(null);

    const fetchPure = useCallback(async () => {
        if (!pred?.id) return;
        setLoading(true);
        try {
            const p = new URLSearchParams({
                innings: pred.innings  || 1,
                runs:    pred.score    || pred.runs || 0,
                wickets: pred.wickets  || 0,
                overs:   pred.overs    || 0,
                target:  pred.target   || 0,
                fmt:     (pred.matchType || "t20").toLowerCase(),
            });
            const res = await fetch(`${API_BASE}/pure-predict/${pred.id}?${p}`);
            if (res.ok) {
                const d = await res.json();
                if (!d.error) { setData(d); setLastFetch(Date.now()); }
            }
        } catch {}
        setLoading(false);
    }, [pred?.id, pred?.innings, pred?.overs]);

    // Fetch on mount + when overs change + every 12s
    useEffect(() => {
        fetchPure();
        clearInterval(timerRef.current);
        timerRef.current = setInterval(fetchPure, 12000);
        return () => clearInterval(timerRef.current);
    }, [fetchPure]);

    // Match not started or no data
    const overs = pred?.overs || 0;
    const isUpcoming = !pred?.id || overs === 0;

    if (isUpcoming) return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                Match hasn't started yet
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
                Live Engine activates once the match begins. It reads real ball-by-ball data to predict the next 3 overs using pure live math — no career stats, no models.
            </div>
            <div style={{ marginTop: 20, padding: "10px 16px", background: "rgba(74,111,212,0.1)", border: `1px solid rgba(74,111,212,0.2)`, borderRadius: 10, fontSize: 12, color: C.accent }}>
                ⚡ Will auto-load when {pred?.team1 || "the match"} vs {pred?.team2 || ""} starts
            </div>
        </div>
    );

    if (!pred?.id) return (
        <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 14 }}>
            Select a live match to see Live Engine
        </div>
    );

    const phases = data?.phases || [];
    const preds  = data?.predictions || [];

    return (
        <div style={{ padding: "16px 0", animation: "fadeUp .35s forwards" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>
                        Live Engine
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>
                        Next 3 Overs Prediction
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                        Pure live math · no ML models · no career stats
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {loading && (
                        <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: C.green, animation: "pulse 1s infinite",
                        }} />
                    )}
                    <div style={{
                        fontSize: 10, color: C.muted,
                        padding: "4px 8px", borderRadius: 6,
                        background: "rgba(255,255,255,0.05)",
                    }}>
                        {lastFetch ? `Updated ${Math.round((Date.now()-lastFetch)/1000)}s ago` : "Loading..."}
                    </div>
                </div>
            </div>

            {/* ── Live Pitch Behavior (inferred from match, no pre-match label) ── */}
            {data && (
                <div style={{
                    background: C.surface, border: `1px solid rgba(255,255,255,0.07)`,
                    borderRadius: 14, padding: "14px 16px", marginBottom: 14,
                    borderLeft: `3px solid ${data.pitchColor}`,
                }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: 1 }}>
                                PITCH BEHAVIOR (from live match)
                            </div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: data.pitchColor }}>
                                {data.pitchBehavior}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                                {data.wicketBehavior}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, color: C.muted }}>Trend</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
                                {data.trendLabel}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                                Base {data.baseRPO} rpo
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Phase Snapshots (pitch behavior by 3-over chunks) ── */}
            {phases.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>
                        PHASE BREAKDOWN (pitch changing every 3 overs)
                    </div>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                        {phases.map((ph, i) => (
                            <PhasePill key={ph.label} phase={ph} isLatest={i === phases.length - 1} />
                        ))}
                        {/* Trend arrow between phases */}
                    </div>
                    {phases.length >= 2 && (
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
                            {(() => {
                                const diff = phases[phases.length-1].rpo - phases[phases.length-2].rpo;
                                if (diff > 1.5)  return `📈 Last phase +${diff.toFixed(1)} rpo — pitch flattening`;
                                if (diff < -1.5) return `📉 Last phase ${diff.toFixed(1)} rpo — bowlers taking grip`;
                                return `➡ Phase-to-phase pace steady (±${Math.abs(diff).toFixed(1)} rpo)`;
                            })()}
                        </div>
                    )}
                </div>
            )}

            {/* ── Striker + Bowler THIS match factors ── */}
            {data && (data.striker || data.bowler) && (
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14,
                }}>
                    {data.striker && (
                        <div style={{
                            background: "rgba(255,255,255,0.04)", borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.07)", padding: "10px 12px",
                        }}>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>STRIKER THIS INNINGS</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{data.striker.name}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: data.striker.sr >= 150 ? C.green : data.striker.sr >= 100 ? C.amber : C.red }}>
                                SR {data.striker.sr}
                            </div>
                            <div style={{ fontSize: 11, color: C.muted }}>{data.striker.runs} off {data.striker.balls} balls</div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                                Factor: {data.striker.factor > 1 ? "+" : ""}{((data.striker.factor - 1)*100).toFixed(0)}% on base
                            </div>
                        </div>
                    )}
                    {data.bowler && (
                        <div style={{
                            background: "rgba(255,255,255,0.04)", borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.07)", padding: "10px 12px",
                        }}>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>BOWLER THIS SPELL</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{data.bowler.name}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: data.bowler.eco <= 6 ? C.green : data.bowler.eco <= 9 ? C.amber : C.red }}>
                                {data.bowler.eco} eco
                            </div>
                            <div style={{ fontSize: 11, color: C.muted }}>{data.bowler.wickets}w in {data.bowler.overs} ov</div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
                                Factor: {data.bowler.factor < 1 ? "" : "+"}{((data.bowler.factor - 1)*100).toFixed(0)}% on base
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Next 3 Overs Predictions ── */}
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>
                NEXT 3 OVERS — PURE LIVE MATH
            </div>

            {preds.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: 24 }}>
                    {data ? "Match complete or insufficient live data" : "Fetching live data..."}
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {preds.map((ov, i) => (
                    <div key={ov.over} style={{
                        background: C.surface,
                        border: `1px solid ${i === 0 ? C.accent : "rgba(255,255,255,0.07)"}`,
                        borderRadius: 14, padding: "14px 16px",
                        boxShadow: i === 0 ? `0 0 20px rgba(74,111,212,0.12)` : "none",
                    }}>
                        {/* Row 1: over label + confidence */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    fontSize: 11, fontWeight: 700, color: "#fff",
                                    background: i === 0 ? C.accent : "rgba(255,255,255,0.12)",
                                    padding: "3px 9px", borderRadius: 20,
                                }}>
                                    {ov.label}
                                </div>
                                <div style={{ fontSize: 10, color: C.muted }}>{ov.phase}</div>
                            </div>
                            <div style={{ fontSize: 10, color: C.muted }}>
                                {ov.confidence}% conf
                            </div>
                        </div>

                        {/* Row 2: runs expected */}
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                                {ov.range}
                            </div>
                            <div style={{ fontSize: 12, color: C.muted }}>runs expected</div>
                        </div>

                        {/* Run bar */}
                        <RunBar lo={ov.low} hi={ov.high} expected={ov.expectedRuns} />

                        {/* Row 3: wicket probability */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: riskColor(ov.wicketRisk),
                                }} />
                                <div style={{ fontSize: 12, color: C.muted }}>
                                    Wicket: <span style={{ color: riskColor(ov.wicketRisk), fontWeight: 600 }}>
                                        {ov.wicketPct}% ({ov.wicketRisk})
                                    </span>
                                </div>
                            </div>
                            {ov.factors.length > 0 && (
                                <div style={{ fontSize: 10, color: C.muted, textAlign: "right", maxWidth: 140 }}>
                                    {ov.factors[0]}
                                </div>
                            )}
                        </div>

                        {/* Second factor if present */}
                        {ov.factors.length > 1 && (
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 4 }}>
                                {ov.factors[1]}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* ── Footer note ── */}
            <div style={{
                marginTop: 16, padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                fontSize: 10, color: C.muted, lineHeight: 1.6,
            }}>
                🔬 <strong style={{ color: "rgba(255,255,255,0.4)" }}>How this works:</strong> Uses only what's happening RIGHT NOW —
                last 3 overs scoring rate (weighted), striker SR this innings, bowler eco this spell,
                and phase trend detection. No historical averages. No career stats. Match tells us what the pitch is doing.
            </div>
        </div>
    );
}
