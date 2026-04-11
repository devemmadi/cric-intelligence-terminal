/* eslint-disable */
import React, { useMemo } from "react";
import { C, cleanTeam } from "../shared/constants";

// ─── Constants ────────────────────────────────────────────────────────────────
const SEGMENTS = [
    { label: "1–4",   start: 1,  end: 4,  phase: "POWERPLAY", icon: "⚡" },
    { label: "5–8",   start: 5,  end: 8,  phase: "POWERPLAY", icon: "🏏" },
    { label: "9–12",  start: 9,  end: 12, phase: "MIDDLE",    icon: "🔄" },
    { label: "13–16", start: 13, end: 16, phase: "MIDDLE",    icon: "🌀" },
    { label: "17–20", start: 17, end: 20, phase: "DEATH",     icon: "💥" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalisePitchKey(raw) {
    if (!raw) return "FRESH";
    const u = raw.toUpperCase();
    if (u.includes("DRY") || u.includes("CRACK")) return "DRY";
    if (u.includes("DUST") || u.includes("TURN")) return "DUSTY";
    if (u.includes("WET") || u.includes("DAMP") || u.includes("MOIST")) return "WET";
    if (u.includes("FLAT") || u.includes("BATT")) return "FLAT";
    if (u.includes("WORN") || u.includes("ROUGH") || u.includes("OLD")) return "WORN";
    if (u.includes("GOOD") || u.includes("BAL")) return "GOOD";
    return "FRESH";
}

// Baseline RPO per segment (used only when no actual data exists)
const BASELINE_RPO = {
    FRESH:  [7.0, 8.5, 7.5, 7.8, 10.5],
    WORN:   [7.8, 8.0, 6.8, 6.5,  9.5],
    DRY:    [7.2, 8.7, 6.5, 6.0,  9.2],
    WET:    [6.2, 7.2, 7.8, 8.2,  8.8],
    DUSTY:  [6.8, 8.1, 6.2, 5.8,  9.0],
    GOOD:   [7.5, 8.5, 7.2, 7.5, 10.0],
    FLAT:   [8.2, 9.5, 8.0, 8.2, 11.0],
};

const BASELINE_WKTS = {
    FRESH:  [20, 16, 18, 20, 18],
    WORN:   [17, 18, 24, 26, 18],
    DRY:    [18, 17, 26, 28, 16],
    WET:    [22, 17, 16, 16, 15],
    DUSTY:  [19, 18, 27, 30, 16],
    GOOD:   [17, 15, 18, 20, 17],
    FLAT:   [14, 13, 15, 17, 16],
};

function rpoToDifficulty(rpo) {
    if (rpo === null || rpo === undefined) return { label: "—", color: C.muted, bg: "rgba(100,116,139,0.1)", score: 3 };
    if (rpo < 5.0)  return { label: "Brutal",          color: "#ef4444", bg: "rgba(239,68,68,0.12)",   score: 1 };
    if (rpo < 6.5)  return { label: "Bowlers win",     color: "#f97316", bg: "rgba(249,115,22,0.12)",  score: 2 };
    if (rpo < 7.8)  return { label: "Tight contest",   color: C.amber,   bg: "rgba(245,158,11,0.12)",  score: 3 };
    if (rpo < 9.2)  return { label: "Batters ahead",   color: "#86efac", bg: "rgba(134,239,172,0.12)", score: 4 };
    if (rpo < 11.0) return { label: "Batting easy",    color: C.green,   bg: "rgba(34,197,94,0.12)",   score: 5 };
    return              { label: "Highway",            color: "#4ade80", bg: "rgba(74,222,128,0.12)",  score: 6 };
}

function trendArrow(cur, prev) {
    if (prev === null || cur === null) return null;
    const d = cur - prev;
    if (d > 1.5) return { arrow: "↑", label: `+${d.toFixed(1)} RPO from prev`, color: C.green };
    if (d < -1.5) return { arrow: "↓", label: `${d.toFixed(1)} RPO from prev`, color: C.red };
    return { arrow: "→", label: "Stable pace", color: C.amber };
}

// ─── Core computation — everything from overHistory ──────────────────────────
function buildSegmentData(pred) {
    const pitchKey = normalisePitchKey(pred?.pitchCondition);
    const detr = Math.min(pred?.deteriorationFactor ?? 1.0, 1.6);
    const weather = pred?.weatherImpact || {};
    const dew = weather.dewFactor ?? 1.0;
    const humidity = weather.humidity ?? 60;
    const temp = weather.temperature ?? 28;
    const overHistory = pred?.overHistory || [];
    const currentOvers = parseFloat(pred?.overs ?? 0);
    const currentOver = Math.floor(currentOvers);

    // ── Build per-over lookup from actual match data ──────────────────────────
    const overMap = {};
    overHistory.forEach(o => {
        const key = Math.round(o.over ?? o.overNum ?? 0);
        if (key >= 1 && key <= 20) {
            overMap[key] = {
                runs: o.runs ?? o.r ?? 0,
                wickets: o.wickets ?? o.w ?? 0,
            };
        }
    });

    // ── Match-wide average RPO (from actual completed overs) ─────────────────
    const completedOverKeys = Object.keys(overMap).map(Number);
    const totalActualRuns = completedOverKeys.reduce((s, k) => s + overMap[k].runs, 0);
    const matchAvgRPO = completedOverKeys.length > 0
        ? Math.round((totalActualRuns / completedOverKeys.length) * 10) / 10
        : null;

    // ── Per-segment actual stats ─────────────────────────────────────────────
    const rawSegs = SEGMENTS.map((seg, i) => {
        const played = [];
        for (let ov = seg.start; ov <= seg.end; ov++) {
            if (overMap[ov]) played.push({ over: ov, ...overMap[ov] });
        }
        const allOvs = [];
        for (let ov = seg.start; ov <= seg.end; ov++) {
            allOvs.push(overMap[ov] ? { over: ov, ...overMap[ov], played: true } : { over: ov, played: false });
        }

        const actualRuns = played.length > 0 ? played.reduce((s, o) => s + o.runs, 0) : null;
        const actualWkts = played.length > 0 ? played.reduce((s, o) => s + o.wickets, 0) : null;
        const actualRPO  = played.length > 0 ? Math.round((actualRuns / played.length) * 10) / 10 : null;

        const isPast     = currentOver >= seg.end;
        const isCurrent  = !isPast && currentOver >= seg.start - 1 && currentOver < seg.end;
        const isFuture   = !isPast && !isCurrent;

        return { ...seg, i, played, allOvs, actualRuns, actualWkts, actualRPO, oversPlayed: played.length, isPast, isCurrent, isFuture };
    });

    // ── Trend from completed segments ────────────────────────────────────────
    const doneSegs = rawSegs.filter(s => s.isPast && s.actualRPO !== null);
    let trendSlope = 0;
    if (doneSegs.length >= 2) {
        // Least-squares slope across completed segments
        const n = doneSegs.length;
        const xs = doneSegs.map((_, j) => j);
        const ys = doneSegs.map(s => s.actualRPO);
        const xMean = xs.reduce((a, b) => a + b, 0) / n;
        const yMean = ys.reduce((a, b) => a + b, 0) / n;
        const num = xs.reduce((s, x, j) => s + (x - xMean) * (ys[j] - yMean), 0);
        const den = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
        trendSlope = den !== 0 ? num / den : 0;
    }

    // Baseline for this pitch/weather (fallback when no history)
    const blRPO  = (BASELINE_RPO[pitchKey]  || BASELINE_RPO.FRESH).map((r, i) => {
        let v = r;
        if (i >= 2 && i <= 3) v *= (1 - (detr - 1.0) * 0.18);
        if (i === 4 && dew < 0.92) v *= (1 + (0.92 - dew) * 1.4);
        if (i <= 1 && humidity > 80) v *= 0.88;
        if (i === 4 && temp > 36) v *= 1.07;
        return Math.round(v * 10) / 10;
    });
    const blWkts = (BASELINE_WKTS[pitchKey] || BASELINE_WKTS.FRESH).map((w, i) => {
        let v = w;
        if (i >= 2 && i <= 3) v = Math.round(v + (detr - 1.0) * 35);
        if (i <= 1 && humidity > 80) v = Math.round(v * 1.28);
        if (i === 4 && dew < 0.9)  v = Math.round(v * 0.80);
        if (matchAvgRPO !== null) {
            if (matchAvgRPO < 6.5) v = Math.round(v * 1.15);
            if (matchAvgRPO > 9.5) v = Math.round(v * 0.88);
        }
        return Math.min(Math.max(v, 8), 68);
    });

    // ── Final enrichment ─────────────────────────────────────────────────────
    const segments = rawSegs.map((seg, i) => {
        const prevSeg = i > 0 ? rawSegs[i - 1] : null;

        // --- Projected RPO for future/current segments ---
        let projRPO = blRPO[i]; // baseline fallback
        if (seg.isFuture || seg.isCurrent) {
            if (doneSegs.length >= 1) {
                // Start from last known RPO, project trend forward
                const lastDone = doneSegs[doneSegs.length - 1];
                const stepsAhead = i - doneSegs.indexOf(rawSegs.find(s => s.label === lastDone.label)) ;
                const trendProjected = lastDone.actualRPO + trendSlope * Math.max(stepsAhead, 1) * 0.65; // dampen trend
                // Blend: 55% trend, 45% baseline
                projRPO = Math.max(2.0, trendProjected * 0.55 + blRPO[i] * 0.45);
                projRPO = Math.round(projRPO * 10) / 10;
            }
            // Always apply dew modifier if death overs
            if (i === 4 && dew < 0.9 && projRPO < 11) projRPO = Math.round((projRPO * 1.10) * 10) / 10;
        }

        // --- Projected runs for partial/future ---
        let projRuns = null;
        if (seg.isCurrent && seg.oversPlayed > 0) {
            const remaining = seg.end - currentOver;
            projRuns = Math.round((seg.actualRuns ?? 0) + seg.actualRPO * remaining);
        } else if (seg.isFuture) {
            projRuns = Math.round(projRPO * 4);
        }

        // --- Wicket pct: from actual data if available, else baseline ---
        let wicketPct = blWkts[i];
        if (seg.oversPlayed >= 2 && seg.actualWkts !== null) {
            const wPerOv = seg.actualWkts / seg.oversPlayed;
            wicketPct = Math.min(Math.round(wPerOv * 35 + 12), 70);
        } else if (seg.isCurrent && seg.oversPlayed >= 1) {
            const wPerOv = (seg.actualWkts ?? 0) / seg.oversPlayed;
            wicketPct = Math.round(wPerOv * 35 + 12);
            wicketPct = Math.round(wicketPct * 0.5 + blWkts[i] * 0.5); // blend with baseline until more data
            wicketPct = Math.min(Math.max(wicketPct, 8), 68);
        }

        // --- Difficulty based on what actually happened ---
        const displayRPO = seg.actualRPO ?? projRPO;
        const difficulty = rpoToDifficulty(displayRPO);

        // --- Trend arrow vs previous segment ---
        const trend = trendArrow(
            seg.actualRPO ?? projRPO,
            prevSeg ? (prevSeg.actualRPO ?? null) : null
        );

        // --- Advantage label from actual data ---
        const advantage = deriveAdvantage(seg, pitchKey, detr, dew, humidity, i);

        // --- Narrative from actual data ---
        const narrative = buildNarrative(seg, projRPO, matchAvgRPO, prevSeg, pitchKey, detr, dew, humidity, i);

        // --- Weather note for this segment ---
        const weatherNote = getWeatherNote(dew, humidity, temp, i);

        return {
            ...seg,
            projRPO, projRuns, wicketPct, difficulty, trend,
            advantage, narrative, weatherNote, matchAvgRPO,
        };
    });

    return { segments, matchAvgRPO, pitchKey, detr, weather };
}

// ─── Advantage — from actual data, fallback to inference ─────────────────────
function deriveAdvantage(seg, pitchKey, detr, dew, humidity, i) {
    if (seg.oversPlayed >= 2 && seg.actualRPO !== null) {
        const rpo = seg.actualRPO;
        const wktsPerOv = (seg.actualWkts ?? 0) / seg.oversPlayed;
        if (wktsPerOv >= 0.75 && rpo < 7.0) return { label: "Bowlers dominating 🔥", color: "#ef4444" };
        if (wktsPerOv >= 0.5  || rpo < 6.5) return { label: "Bowlers ahead",         color: "#f97316" };
        if (rpo >= 10.5)                     return { label: "Batters dominating 🔥", color: "#4ade80" };
        if (rpo >= 8.8)                      return { label: "Batters ahead",         color: C.green   };
        return                                      { label: "Closely contested",     color: C.amber   };
    }
    // No history yet — infer from pitch/weather/phase
    if (i === 0) return humidity > 78 ? { label: "Seam/Swing", color: "#60A5FA" } : { label: "New ball", color: "#3B82F6" };
    if (i === 1) return { label: "Batters settle", color: C.green };
    if (i === 2) return (["DRY","DUSTY","WORN"].includes(pitchKey) || detr >= 1.15)
        ? { label: "Spin threat", color: "#A855F7" }
        : { label: "Contested",   color: C.amber  };
    if (i === 3) return (["DRY","DUSTY"].includes(pitchKey) && detr >= 1.1)
        ? { label: "Spinners lethal", color: "#A855F7" }
        : { label: "Contested",       color: C.amber   };
    return dew < 0.9 ? { label: "Dew advantage", color: "#60A5FA" } : { label: "Death pace", color: "#ef4444" };
}

// ─── Narrative built from what's actually happening ──────────────────────────
function buildNarrative(seg, projRPO, matchAvgRPO, prevSeg, pitchKey, detr, dew, humidity, i) {
    const parts = [];

    // --- Past / partial actual data ---
    if (seg.oversPlayed >= 1 && seg.actualRPO !== null) {
        const rpo = seg.actualRPO;
        const wkts = seg.actualWkts ?? 0;
        const ovs  = seg.oversPlayed;

        // Compare to match average
        if (matchAvgRPO !== null) {
            const delta = rpo - matchAvgRPO;
            if (delta < -2.5) parts.push(`Scoring collapsed — ${rpo.toFixed(1)} RPO vs ${matchAvgRPO.toFixed(1)} match avg`);
            else if (delta < -1.2) parts.push(`Below-average scoring at ${rpo.toFixed(1)} RPO (avg ${matchAvgRPO.toFixed(1)})`);
            else if (delta > 2.5)  parts.push(`Batters went big — ${rpo.toFixed(1)} RPO vs ${matchAvgRPO.toFixed(1)} avg`);
            else if (delta > 1.2)  parts.push(`Above-average scoring at ${rpo.toFixed(1)} RPO`);
            else                   parts.push(`On par with match average — ${rpo.toFixed(1)} RPO`);
        } else {
            parts.push(`${rpo.toFixed(1)} runs per over`);
        }

        // Wickets context
        if (wkts >= 4) parts.push(`${wkts} wickets — batting collapsed`);
        else if (wkts === 3) parts.push(`${wkts} wickets — bowlers had the edge`);
        else if (wkts === 2) parts.push(`${wkts} wickets fell`);
        else if (wkts === 1) parts.push(`1 wicket — batters largely held firm`);
        else if (wkts === 0 && ovs >= 3) parts.push(`No wickets — solid batting phase`);

        // Trend vs previous segment
        if (prevSeg?.actualRPO != null) {
            const change = rpo - prevSeg.actualRPO;
            if (change < -2.5)      parts.push(`Sharp scoring drop from previous phase (−${Math.abs(change).toFixed(1)} RPO)`);
            else if (change > 2.5)  parts.push(`Major acceleration from previous phase (+${change.toFixed(1)} RPO)`);
            else if (change < -1.2) parts.push(`Slower than previous phase`);
            else if (change > 1.2)  parts.push(`Faster than previous phase`);
        }
    }

    // --- Pure future projection ---
    if (seg.oversPlayed === 0 && (seg.isFuture || seg.isCurrent)) {
        if (projRPO !== null) {
            parts.push(`Projected ${projRPO.toFixed(1)} RPO`);
        }
        // Contextual addition based on segment + pitch + what's happened
        if (i === 4 && dew < 0.9) parts.push("Dew expected — spinners lose grip, batting advantage grows");
        else if (i >= 2 && i <= 3 && ["DRY","DUSTY"].includes(pitchKey) && detr >= 1.1)
            parts.push("Pitch deteriorating — spinners should dominate");
        else if (i === 0 && humidity > 78) parts.push("Humid conditions favour swing early");
        else if (i <= 1 && matchAvgRPO !== null && matchAvgRPO < 6.5)
            parts.push("Match has been tough for batters so far");
        else if (matchAvgRPO !== null && matchAvgRPO > 9.5)
            parts.push("Match has been easy batting — expect similar");
    }

    return parts.join(". ") || "Awaiting data…";
}

function getWeatherNote(dew, humidity, temp, i) {
    if (i === 4 && dew < 0.88) return "🌫 Heavy dew — fielding errors likely, batting becomes much easier";
    if (i >= 3 && dew < 0.92)  return "💧 Dew settling — spinners losing control of the ball";
    if (i <= 1 && humidity > 82) return "🌧 High humidity — swing conditions in play";
    if (i === 4 && temp > 36)   return "🥵 Heat fatigue — fielding lapses more likely in the death";
    if (i >= 2 && humidity < 40) return "☀️ Very dry air — pitch spinning sharply, grip is everything";
    return null;
}

// ─── Over-bar mini chart (per segment) ───────────────────────────────────────
function OverBars({ seg }) {
    if (!seg.allOvs || seg.allOvs.every(o => !o.played)) return null;
    const maxRuns = Math.max(...seg.allOvs.filter(o => o.played).map(o => o.runs), 1);

    return (
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 32, marginBottom: 8 }}>
            {seg.allOvs.map((o, j) => {
                if (!o.played) {
                    return <div key={j} style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />;
                }
                const h = Math.max(4, Math.round((o.runs / maxRuns) * 28));
                const hasWkt = o.wickets > 0;
                return (
                    <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        {hasWkt && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.red, flexShrink: 0 }} title={`${o.wickets}W`} />}
                        <div
                            style={{
                                width: "100%", height: h, borderRadius: 2,
                                background: hasWkt ? "#ef4444" : o.runs >= 12 ? "#4ade80" : o.runs >= 8 ? C.accent : "#60A5FA",
                                opacity: 0.85,
                            }}
                            title={`Over ${o.over}: ${o.runs}r ${o.wickets}w`}
                        />
                        <span style={{ fontSize: 7, color: C.muted }}>{o.over}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Pitch bar at top — colours from ACTUAL difficulty ───────────────────────
function PitchBar({ segments, currentOver }) {
    const width = 300, height = 56, zoneW = width / 5;

    return (
        <svg width={width} height={height} style={{ display: "block", margin: "0 auto" }}>
            {segments.map((seg, i) => {
                const isActive = currentOver >= seg.start - 1 && currentOver < seg.end;
                const color = seg.difficulty.color;
                return (
                    <g key={i}>
                        <rect
                            x={i * zoneW + 2} y={isActive ? 4 : 10}
                            width={zoneW - 4} height={isActive ? height - 8 : height - 20}
                            rx={4} fill={color}
                            opacity={seg.isPast ? 0.9 : seg.isFuture ? 0.38 : 1}
                        />
                        <text x={i * zoneW + zoneW / 2} y={isActive ? height / 2 + 4 : height / 2 + 2}
                            textAnchor="middle" fontSize={9} fontWeight={700}
                            fill={seg.isPast || isActive ? "#fff" : "rgba(255,255,255,0.5)"}
                            fontFamily="Inter, system-ui">
                            {seg.label}
                        </text>
                        {isActive && (
                            <text x={i * zoneW + zoneW / 2} y={height - 2}
                                textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.9)"
                                fontFamily="Inter, system-ui">
                                ▲ NOW
                            </text>
                        )}
                        {seg.isPast && !isActive && (
                            <text x={i * zoneW + zoneW / 2} y={height - 4}
                                textAnchor="middle" fontSize={7} fill="rgba(255,255,255,0.6)"
                                fontFamily="Inter, system-ui">
                                {seg.actualRPO?.toFixed(1)}
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// ─── Segment card ─────────────────────────────────────────────────────────────
function SegmentCard({ seg }) {
    const borderColor = seg.isCurrent ? "#3B82F6" : seg.isPast ? "#1E2D3D" : "#1E2D4A";
    const bg = seg.isCurrent ? "rgba(59,130,246,0.07)" : "rgba(255,255,255,0.02)";

    return (
        <div style={{ background: bg, border: `1.5px solid ${borderColor}`, borderRadius: 12, padding: "14px 16px", position: "relative", opacity: seg.isPast ? 0.68 : 1 }}>

            {seg.isCurrent && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: "#3B82F6", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 12px", borderRadius: 20, letterSpacing: 1, whiteSpace: "nowrap" }}>
                    ▶ YOU ARE HERE
                </div>
            )}

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{seg.icon}</span>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Overs {seg.label}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{seg.phase}</div>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: seg.advantage.color, background: seg.advantage.color + "1A", padding: "2px 8px", borderRadius: 4 }}>
                        {seg.advantage.label}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: seg.difficulty.color, background: seg.difficulty.bg, padding: "2px 8px", borderRadius: 4 }}>
                        {seg.difficulty.label}
                    </span>
                </div>
            </div>

            {/* Over-by-over bar chart (only if we have actual data) */}
            {seg.oversPlayed >= 1 && <OverBars seg={seg} />}

            {/* Stats row */}
            {seg.isPast && seg.actualRuns !== null ? (
                // Fully played — show actual vs projected
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 2, letterSpacing: 1 }}>ACTUAL</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: C.text, lineHeight: 1 }}>{seg.actualRuns}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{seg.actualWkts ?? 0}w · {seg.actualRPO?.toFixed(1)} RPO</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 2, letterSpacing: 1 }}>VS MATCH AVG</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.muted, lineHeight: 1.2, marginTop: 4 }}>
                            {seg.matchAvgRPO !== null
                                ? `${((seg.actualRPO - seg.matchAvgRPO) >= 0 ? "+" : "")}${(seg.actualRPO - seg.matchAvgRPO).toFixed(1)} RPO`
                                : "—"}
                        </div>
                        {seg.trend && <div style={{ fontSize: 10, color: seg.trend.color, marginTop: 4 }}>{seg.trend.arrow} {seg.trend.label}</div>}
                    </div>
                </div>
            ) : seg.isCurrent && seg.oversPlayed > 0 ? (
                // Partially played — actual so far + projection
                <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <div style={{ fontSize: 9, color: "#60A5FA", marginBottom: 2, letterSpacing: 1 }}>SO FAR ({seg.oversPlayed} ov)</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{seg.actualRuns}</div>
                        <div style={{ fontSize: 10, color: "#93C5FD", marginTop: 2 }}>{seg.actualWkts ?? 0}w · {seg.actualRPO?.toFixed(1)} RPO</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 2, letterSpacing: 1 }}>PROJECTED FINISH</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{seg.projRuns ?? "—"}</div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>for overs {seg.label}</div>
                    </div>
                </div>
            ) : (
                // Future — projected
                <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Projected</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                            ~{seg.projRuns} runs
                            <span style={{ fontSize: 11, fontWeight: 400, color: C.muted }}> · {seg.projRPO?.toFixed(1)} RPO</span>
                        </span>
                    </div>
                    {/* RPO bar relative to 12 RPO max */}
                    <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${Math.min(100, ((seg.projRPO ?? 7) / 12) * 100)}%`, height: "100%", background: seg.difficulty.color, borderRadius: 3, transition: "width 0.5s", opacity: 0.7 }} />
                    </div>
                </div>
            )}

            {/* Wicket probability (for non-past segments) */}
            {!seg.isPast && (
                <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Wicket probability</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: seg.wicketPct > 35 ? C.red : seg.wicketPct > 22 ? C.amber : C.green }}>
                            {seg.wicketPct}%
                        </span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${seg.wicketPct}%`, height: "100%", borderRadius: 3, background: seg.wicketPct > 35 ? C.red : seg.wicketPct > 22 ? C.amber : C.green }} />
                    </div>
                </div>
            )}

            {/* Narrative */}
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55 }}>{seg.narrative}</div>

            {/* Weather */}
            {seg.weatherNote && (
                <div style={{ fontSize: 10, color: "#60A5FA", marginTop: 7, fontStyle: "italic" }}>{seg.weatherNote}</div>
            )}
        </div>
    );
}

// ─── Header card ─────────────────────────────────────────────────────────────
function PitchSummaryHeader({ pitchKey, detr, matchAvgRPO, weather, pred }) {
    const pitchMeta = {
        FRESH: { label: "Fresh Pitch",   color: "#22c55e", desc: "Seam and bounce early, eases as innings progresses" },
        WORN:  { label: "Worn Pitch",    color: "#f97316", desc: "Rough patches forming, variable bounce, spin dangerous" },
        DRY:   { label: "Dry / Cracked", color: "#ef4444", desc: "Severe spin, low bounce — batters facing a real test" },
        WET:   { label: "Damp Surface",  color: "#60a5fa", desc: "Moisture aids seam, sluggish outfield suppresses scoring" },
        DUSTY: { label: "Dusty Track",   color: "#b45309", desc: "Extravagant turn — spinners could be unplayable" },
        GOOD:  { label: "Good Surface",  color: "#4ade80", desc: "Balanced pitch, even contest across all phases" },
        FLAT:  { label: "Flat Track",    color: "#fbbf24", desc: "Highway pitch — bowlers need extreme accuracy to survive" },
    }[pitchKey] || { label: pitchKey, color: C.muted, desc: "" };

    const detrLabel = detr >= 1.25 ? "Rapid" : detr >= 1.1 ? "Moderate" : "Slow";
    const detrColor = detr >= 1.25 ? C.red : detr >= 1.1 ? C.amber : C.green;
    const dew = weather?.dewFactor ?? 1.0;
    const humidity = weather?.humidity ?? 60;
    const temp = weather?.temperature ?? 28;

    return (
        <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, alignItems: "flex-start" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pitchMeta.color }}>{pitchMeta.label}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>·</span>
                        <span style={{ fontSize: 11, color: C.muted }}>
                            Deterioration: <b style={{ color: detrColor }}>{detrLabel}</b>
                        </span>
                        {matchAvgRPO !== null && (
                            <>
                                <span style={{ fontSize: 11, color: C.muted }}>·</span>
                                <span style={{ fontSize: 11, color: C.muted }}>
                                    Match avg: <b style={{ color: C.text }}>{matchAvgRPO.toFixed(1)} RPO</b>
                                </span>
                            </>
                        )}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{pitchMeta.desc}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {dew < 0.9 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#60A5FA", background: "rgba(96,165,250,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                            💧 Dew: HIGH
                        </span>
                    )}
                    {humidity > 78 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#a5f3fc", background: "rgba(165,243,252,0.08)", padding: "2px 8px", borderRadius: 4 }}>
                            Humidity {humidity}%
                        </span>
                    )}
                    {temp > 34 && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#fb923c", background: "rgba(251,146,60,0.1)", padding: "2px 8px", borderRadius: 4 }}>
                            🥵 {temp}°C
                        </span>
                    )}
                    {!weather?.dewFactor && !weather?.humidity && (
                        <span style={{ fontSize: 10, color: C.muted, padding: "2px 8px" }}>Weather data pending</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── No data state ────────────────────────────────────────────────────────────
function NoPitchData({ liveMatches, onMatchSelect }) {
    return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>No match selected</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Select a live match to see real-time pitch analysis</div>
            {liveMatches?.filter(m => m.status === "LIVE").slice(0, 3).map(m => (
                <button key={m.id} onClick={() => onMatchSelect(m)}
                    style={{ display: "block", width: "100%", maxWidth: 320, margin: "0 auto 8px", background: C.navy, border: `1px solid ${C.navyLight}`, borderRadius: 10, padding: "10px 16px", color: C.text, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ color: C.green, fontWeight: 700, marginRight: 6 }}>● LIVE</span>{m.t1} vs {m.t2}
                </button>
            ))}
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PitchTab({ pred, selectedMatch, liveMatches, onMatchSelect }) {
    const result = useMemo(() => {
        if (!pred) return null;
        return buildSegmentData(pred);
    }, [
        pred?.pitchCondition, pred?.deteriorationFactor,
        pred?.weatherImpact?.dewFactor, pred?.weatherImpact?.humidity,
        pred?.overs,
        // Re-run whenever a new over lands in history
        pred?.overHistory?.length,
        // Also re-run if the last over's runs changed (ball-by-ball update)
        pred?.overHistory?.[pred?.overHistory?.length - 1]?.runs,
    ]);

    const currentOvers = parseFloat(pred?.overs ?? 0);
    const currentOver  = Math.floor(currentOvers);
    const matchName = pred
        ? `${cleanTeam(pred.team1)} vs ${cleanTeam(pred.team2)}`
        : selectedMatch ? `${selectedMatch.t1} vs ${selectedMatch.t2}` : null;

    if (!pred && !selectedMatch) return <NoPitchData liveMatches={liveMatches} onMatchSelect={onMatchSelect} />;
    if (!pred) return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 14, color: C.muted }}>Loading pitch data for {selectedMatch?.t1} vs {selectedMatch?.t2}…</div>
        </div>
    );

    const { segments, matchAvgRPO, pitchKey, detr, weather } = result;

    return (
        <div className="fade" style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>

            {/* Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: C.text }}>Pitch Conditions</div>
                    {matchName && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{matchName}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 10, color: C.muted, letterSpacing: 0.8 }}>LIVE · FROM MATCH DATA</span>
                </div>
            </div>

            {/* Summary header */}
            <PitchSummaryHeader pitchKey={pitchKey} detr={detr} matchAvgRPO={matchAvgRPO} weather={weather} pred={pred} />

            {/* Pitch bar — coloured from ACTUAL difficulty per segment */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: 0.8 }}>
                    PITCH DIFFICULTY ACROSS 20 OVERS
                    {matchAvgRPO !== null && <span style={{ marginLeft: 6, color: C.text }}>· Match avg {matchAvgRPO.toFixed(1)} RPO</span>}
                </div>
                <PitchBar segments={segments} currentOver={currentOver} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 2px" }}>
                    <span style={{ fontSize: 9, color: "#ef4444" }}>■ Bowler control</span>
                    <span style={{ fontSize: 9, color: C.amber }}>■ Contested</span>
                    <span style={{ fontSize: 9, color: C.green }}>■ Batting easy</span>
                </div>
                {/* Future indicator */}
                {segments.some(s => s.isFuture) && (
                    <div style={{ fontSize: 9, color: C.muted, marginTop: 4, textAlign: "right" }}>
                        Faded bars = projection from match trend
                    </div>
                )}
            </div>

            {/* Segment cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {segments.map((seg, i) => <SegmentCard key={i} seg={seg} />)}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.7 }}>
                    ⚙️ <b style={{ color: C.text }}>How this works:</b> Past segments show actual match data from over history.
                    Future projections use least-squares trend from completed overs (60%) blended with pitch condition baseline (40%), then adjusted for weather.
                    Refreshes every 10 seconds with live match data.
                    Pitch: <b style={{ color: C.text }}>{pred.pitchCondition || "—"}</b> · Detr: {(pred.deteriorationFactor ?? 1.0).toFixed(2)}x
                </div>
            </div>
        </div>
    );
}
