/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE, C } from "../shared/constants";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMood(pitchBehavior, trend) {
    const pb = (pitchBehavior || "").toLowerCase();
    if (pb.includes("flat") || pb.includes("bat dominant"))
        return { emoji: "🔥", label: "Batters are dominating!", color: "#F59E0B" };
    if (pb.includes("bowling dominant"))
        return { emoji: "💪", label: "Bowlers are in full control", color: C.green };
    if (pb.includes("bowlers on top"))
        return { emoji: "😤", label: "Bowlers are winning this battle", color: C.green };
    return { emoji: "⚔️", label: "Even contest — could go either way", color: C.accent };
}

function getStrikerLabel(sr, balls) {
    if (balls < 6) return { text: "Just started", color: C.muted };
    if (sr >= 200) return { text: "ON FIRE ⚡", color: "#F97316" };
    if (sr >= 150) return { text: "Scoring very fast 🔥", color: C.amber };
    if (sr >= 120) return { text: "Scoring well 🏏", color: C.green };
    if (sr >= 80)  return { text: "Building slowly 🧱", color: C.muted };
    return { text: "Struggling 🐢", color: C.red };
}

function getBowlerLabel(eco, overs) {
    if (overs < 1) return { text: "Just started", color: C.muted };
    if (eco <= 6)  return { text: "Very tight 🔒", color: C.green };
    if (eco <= 8)  return { text: "Good spell 👍", color: C.green };
    if (eco <= 10) return { text: "Getting hit a bit 😬", color: C.amber };
    return { text: "Expensive 💸", color: C.red };
}

function getWicketLabel(pct, risk) {
    if (risk === "HIGH" || pct > 40)  return { text: "DANGER! Wicket very likely 🔴", color: C.red };
    if (risk === "MEDIUM" || pct > 20) return { text: "Wicket possible 🟡", color: C.amber };
    return { text: "Safe — unlikely to get out 🟢", color: C.green };
}

function getRunsLabel(lo, hi) {
    const mid = Math.round((lo + hi) / 2);
    if (mid >= 16) return "💥 Big over coming!";
    if (mid >= 12) return "🏃 Solid scoring";
    if (mid >= 8)  return "⚖️ Normal over";
    return "🔒 Tight over";
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function LiveEngine({ pred }) {
    const [data,      setData]      = useState(null);
    const [loading,   setLoading]   = useState(false);
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

    useEffect(() => {
        fetchPure();
        clearInterval(timerRef.current);
        timerRef.current = setInterval(fetchPure, 12000);
        return () => clearInterval(timerRef.current);
    }, [fetchPure]);

    const overs      = pred?.overs || 0;
    // Match is live if: innings 2 started (target set) OR overs > 0
    const matchLive  = (pred?.target > 0) || (pred?.innings > 1) || overs > 0;
    const isUpcoming = !pred?.id || !matchLive;
    const isInnBreak = pred?.innings === 2 && overs === 0;

    // ── Innings break — team2 yet to bat ──
    if (isInnBreak) return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>☕</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                Innings Break
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
                {pred?.team2 || "Team 2"} need {pred?.target || "—"} to win. Live Engine predictions load once the chase begins.
            </div>
            <div style={{
                marginTop: 20, padding: "10px 16px",
                background: "rgba(96,165,250,0.1)",
                border: "1px solid rgba(96,165,250,0.2)",
                borderRadius: 10, fontSize: 12, color: "#60A5FA",
            }}>
                ⚡ Auto-loads when {pred?.team2 || "the chase"} starts
            </div>
        </div>
    );

    // ── Not started yet ──
    if (isUpcoming) return (
        <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                Match hasn't started yet
            </div>
            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>
                Once the match begins, we'll predict the next 3 overs using live ball-by-ball data — no guessing, no averages.
            </div>
            <div style={{
                marginTop: 20, padding: "10px 16px",
                background: "rgba(74,111,212,0.1)",
                border: `1px solid rgba(74,111,212,0.2)`,
                borderRadius: 10, fontSize: 12, color: C.accent,
            }}>
                ⚡ Auto-loads when {pred?.team1 || "the match"} vs {pred?.team2 || ""} starts
            </div>
        </div>
    );

    if (!pred?.id) return (
        <div style={{ padding: 32, textAlign: "center", color: C.muted, fontSize: 14 }}>
            Select a live match to see predictions
        </div>
    );

    const preds = data?.predictions || [];
    const mood  = getMood(data?.pitchBehavior, data?.trend);

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
                        {lastFetch ? `Updated ${Math.round((Date.now() - lastFetch) / 1000)}s ago` : "Loading..."}
                    </div>
                </div>
            </div>

            {/* ── Match Mood — big simple verdict ── */}
            {data && (
                <div style={{
                    background: C.surface,
                    border: `1px solid rgba(255,255,255,0.07)`,
                    borderLeft: `4px solid ${mood.color}`,
                    borderRadius: 14, padding: "16px 18px",
                    marginBottom: 14,
                    display: "flex", alignItems: "center", gap: 14,
                }}>
                    <div style={{ fontSize: 36 }}>{mood.emoji}</div>
                    <div>
                        <div style={{ fontSize: 11, color: C.muted, marginBottom: 3, letterSpacing: 1 }}>
                            WHAT'S HAPPENING RIGHT NOW
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: mood.color }}>
                            {mood.label}
                        </div>
                        <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>
                            {data.trendLabel} · {data.wicketBehavior}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Striker + Bowler — plain English ── */}
            {data && (data.striker || data.bowler) && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>

                    {data.striker && (() => {
                        const label = getStrikerLabel(data.striker.sr, data.striker.balls);
                        return (
                            <div style={{
                                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px",
                            }}>
                                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>BATTER</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                                    {data.striker.name}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: label.color, marginBottom: 4 }}>
                                    {label.text}
                                </div>
                                <div style={{ fontSize: 12, color: C.muted }}>
                                    {data.striker.runs} runs · {data.striker.balls} balls
                                </div>
                                <div style={{ fontSize: 12, color: C.muted }}>
                                    SR {data.striker.sr} this innings
                                </div>
                            </div>
                        );
                    })()}

                    {data.bowler && (() => {
                        const label = getBowlerLabel(data.bowler.eco, data.bowler.overs);
                        return (
                            <div style={{
                                background: "rgba(255,255,255,0.04)", borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.07)", padding: "12px 14px",
                            }}>
                                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>BOWLER</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 2 }}>
                                    {data.bowler.name}
                                </div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: label.color, marginBottom: 4 }}>
                                    {label.text}
                                </div>
                                <div style={{ fontSize: 12, color: C.muted }}>
                                    {data.bowler.eco} runs/over this spell
                                </div>
                                <div style={{ fontSize: 12, color: C.muted }}>
                                    {data.bowler.wickets} wickets in {data.bowler.overs} overs
                                </div>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* ── Next 3 Overs — simple cards ── */}
            {preds.length === 0 && !loading && (
                <div style={{ textAlign: "center", color: C.muted, fontSize: 13, padding: 24 }}>
                    {data ? "Match complete or not enough live data yet" : "Fetching live data..."}
                </div>
            )}

            {preds.length > 0 && (
                <>
                    <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>
                        WHAT TO EXPECT NEXT
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {preds.map((ov, i) => {
                            const wktLabel  = getWicketLabel(ov.wicketPct, ov.wicketRisk);
                            const runsLabel = getRunsLabel(ov.low, ov.high);
                            const isNext    = i === 0;
                            return (
                                <div key={ov.over} style={{
                                    background: C.surface,
                                    border: `1px solid ${isNext ? C.accent : "rgba(255,255,255,0.07)"}`,
                                    borderRadius: 14, padding: "14px 16px",
                                    boxShadow: isNext ? `0 0 20px rgba(74,111,212,0.12)` : "none",
                                }}>
                                    {/* Over label */}
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <div style={{
                                                fontSize: 11, fontWeight: 700, color: "#fff",
                                                background: isNext ? C.accent : "rgba(255,255,255,0.12)",
                                                padding: "3px 10px", borderRadius: 20,
                                            }}>
                                                {ov.label}
                                            </div>
                                            {isNext && (
                                                <div style={{
                                                    fontSize: 10, color: C.green, fontWeight: 600,
                                                    background: "rgba(16,185,129,0.12)",
                                                    padding: "2px 7px", borderRadius: 10,
                                                }}>
                                                    NEXT UP
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ fontSize: 11, color: C.muted }}>
                                            {ov.confidence}% sure
                                        </div>
                                    </div>

                                    {/* Big runs number */}
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                                        <div style={{ fontSize: 32, fontWeight: 900, color: C.text, lineHeight: 1 }}>
                                            {ov.range}
                                        </div>
                                        <div style={{ fontSize: 13, color: C.muted }}>runs expected</div>
                                    </div>

                                    {/* Simple run label */}
                                    <div style={{ fontSize: 13, color: C.amber, fontWeight: 600, marginBottom: 10 }}>
                                        {runsLabel}
                                    </div>

                                    {/* Wicket line */}
                                    <div style={{
                                        padding: "8px 12px", borderRadius: 10,
                                        background: "rgba(255,255,255,0.03)",
                                        border: `1px solid rgba(255,255,255,0.06)`,
                                        fontSize: 13, color: wktLabel.color, fontWeight: 600,
                                    }}>
                                        {wktLabel.text}
                                    </div>

                                    {/* Factors in plain English */}
                                    {ov.factors.length > 0 && (
                                        <div style={{ fontSize: 11, color: C.muted, marginTop: 8, lineHeight: 1.5 }}>
                                            📊 {ov.factors.join(" · ")}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── Simple footer ── */}
            <div style={{
                marginTop: 16, padding: "10px 14px", borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                fontSize: 11, color: C.muted, lineHeight: 1.6,
            }}>
                ⚡ <strong style={{ color: "rgba(255,255,255,0.4)" }}>How this works:</strong> We watch every ball being bowled right now — how fast the batter is hitting, how well the bowler is bowling, and what the pitch is doing — and predict what happens next.
            </div>
        </div>
    );
}
