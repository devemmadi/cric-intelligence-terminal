/* eslint-disable */
import React, { useMemo } from "react";
import { C, cleanTeam } from "../shared/constants";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEGMENTS = [
    { label: "1–4",   start: 1,  end: 4,  phase: "POWERPLAY",  icon: "⚡" },
    { label: "5–8",   start: 5,  end: 8,  phase: "POWERPLAY",  icon: "🏏" },
    { label: "9–12",  start: 9,  end: 12, phase: "MIDDLE",     icon: "🔄" },
    { label: "13–16", start: 13, end: 16, phase: "MIDDLE",     icon: "🌀" },
    { label: "17–20", start: 17, end: 20, phase: "DEATH",      icon: "💥" },
];

// Base expected runs per 4-over segment for each pitch condition
const BASE_RUNS = {
    FRESH:  [28, 34, 30, 31, 42],
    WORN:   [31, 32, 27, 26, 38],
    DRY:    [29, 35, 26, 24, 37],
    WET:    [25, 29, 31, 33, 35],
    DUSTY:  [27, 33, 25, 23, 36],
    GOOD:   [30, 34, 29, 30, 40],
    FLAT:   [33, 38, 32, 33, 44],
};

// Base wicket probability per segment (%)
const BASE_WICKETS = {
    FRESH:  [20, 16, 18, 20, 18],
    WORN:   [17, 18, 24, 26, 18],
    DRY:    [18, 17, 26, 28, 16],
    WET:    [22, 17, 16, 16, 15],
    DUSTY:  [19, 18, 27, 30, 16],
    GOOD:   [17, 15, 18, 20, 17],
    FLAT:   [14, 13, 15, 17, 16],
};

function normalisePitchKey(raw) {
    if (!raw) return "FRESH";
    const u = raw.toUpperCase();
    if (u.includes("DRY") || u.includes("CRACKED")) return "DRY";
    if (u.includes("DUST") || u.includes("TURN")) return "DUSTY";
    if (u.includes("WET") || u.includes("DAMP") || u.includes("MOIST")) return "WET";
    if (u.includes("FLAT") || u.includes("BATTING")) return "FLAT";
    if (u.includes("WORN") || u.includes("OLD") || u.includes("ROUGH")) return "WORN";
    if (u.includes("GOOD") || u.includes("BALANCED")) return "GOOD";
    return "FRESH";
}

function getPitchNarrative(pitchKey, detr, segIdx) {
    const narratives = {
        FRESH:  ["New ball swings sharply, openers under threat", "Bounce easing, batters start timing well", "Pace bowlers losing zip, spinners get grip", "Track settling, flat for hitting", "Dew potential, batting-friendly death"],
        WORN:   ["Surface grips early, bowlers get assistance", "Good hitting conditions develop quickly", "Big spin from rough, off-stump danger", "Spinner's paradise — rough patches lethal", "Worn surface, power game but variable bounce"],
        DRY:    ["Some early movement off the pitch", "Track drying out, spinners warming up", "Serious turn and grip for slow bowlers", "Extreme spin — batters need to improvise", "Bat-on-ball tough, spinners dominant still"],
        WET:    ["Damp surface suppresses batting, seam dominant", "Slow and sluggish, difficult to score freely", "Pitch drying, pace picks up slightly", "Conditions easing, stroke play opens up", "Dew and wet outfield — good for batting"],
        DUSTY:  ["Low bounce keeps batters unsettled", "Dust on the surface spells trouble for pace", "Sharp turn, finger spinners dangerous", "Wrist spinners exploiting surface beautifully", "High risk shots needed — pitch still uneven"],
        GOOD:   ["Classic good length territory, even contest", "Settled surface, batters beginning to dominate", "Slight wear appearing, spinners in the mix", "Strong batting conditions across all formats", "Even surface, execution under pressure wins"],
        FLAT:   ["Highway pitch — bowlers have no answers", "Batters in full control, shots come freely", "No demons in the pitch, spin can't grip", "Flat as a road — big scores expected", "Death bowlers' nightmare on this surface"],
    };
    const lines = narratives[pitchKey] || narratives.FRESH;
    let text = lines[segIdx];
    if (detr >= 1.2 && segIdx >= 2) {
        text += " (pitch crumbling fast)";
    }
    return text;
}

function getWeatherNote(weather, segIdx) {
    if (!weather) return null;
    const dew = weather.dewFactor ?? 1.0;
    const humidity = weather.humidity ?? 60;
    const temp = weather.temperature ?? 28;

    if (segIdx === 4 && dew < 0.88) return "🌫 Heavy dew expected — fielding becomes tricky, batting advantage";
    if (segIdx >= 3 && dew < 0.92) return "💧 Dew likely — harder to grip, spinners lose edge";
    if (humidity > 82 && segIdx <= 1) return "🌧 High humidity aids swing — seam bowlers dangerous";
    if (temp > 36 && segIdx >= 3) return "🥵 Extreme heat — fielding lapses likely in death overs";
    if (humidity < 40 && segIdx >= 2) return "☀️ Dry conditions — pitch spinning sharply";
    return null;
}

function buildSegmentData(pred) {
    const pitchKey = normalisePitchKey(pred?.pitchCondition);
    const detr = Math.min(pred?.deteriorationFactor ?? 1.0, 1.5);
    const weather = pred?.weatherImpact || {};
    const dewFactor = weather.dewFactor ?? 1.0;
    const humidity = weather.humidity ?? 60;
    const temp = weather.temperature ?? 28;
    const overHistory = pred?.overHistory || [];
    const currentOvers = parseFloat(pred?.overs ?? 0);
    const currentOver = Math.floor(currentOvers);

    const baseRuns = BASE_RUNS[pitchKey] || BASE_RUNS.FRESH;
    const baseWkts = BASE_WICKETS[pitchKey] || BASE_WICKETS.FRESH;

    return SEGMENTS.map((seg, i) => {
        // ── Adjust expected runs ─────────────────────────────────────────────
        let expRuns = baseRuns[i];

        // Deterioration boosts spin-heavy overs (9-16)
        if (i >= 2 && i <= 3) expRuns = Math.round(expRuns * (1 - (detr - 1.0) * 0.18));

        // Dew makes death easier to bat
        if (i === 4 && dewFactor < 0.92) expRuns = Math.round(expRuns * (1 + (0.92 - dewFactor) * 1.4));

        // Humidity suppresses scoring in first 8 overs
        if (i <= 1 && humidity > 80) expRuns = Math.round(expRuns * 0.88);

        // Very high temp adds fatigue — fielding errors in death
        if (i === 4 && temp > 36) expRuns = Math.round(expRuns * 1.07);

        // Flat pitch boost
        if (pitchKey === "FLAT") expRuns = Math.round(expRuns * 1.08);

        // ── Adjust wicket probability ────────────────────────────────────────
        let wicketPct = baseWkts[i];

        // Deterioration increases spin danger in overs 9-16
        if (i >= 2 && i <= 3) wicketPct = Math.round(wicketPct + (detr - 1.0) * 35);

        // Humidity increases swing danger in PP
        if (i <= 1 && humidity > 80) wicketPct = Math.round(wicketPct * 1.28);

        // Dew reduces wicket probability in death (harder to grip)
        if (i === 4 && dewFactor < 0.9) wicketPct = Math.round(wicketPct * 0.80);

        wicketPct = Math.min(Math.max(wicketPct, 8), 68);

        // ── Actual data from overHistory ─────────────────────────────────────
        const segOvers = overHistory.filter(o => o.over >= seg.start && o.over <= seg.end);
        const actualRuns = segOvers.length > 0 ? segOvers.reduce((s, o) => s + (o.runs ?? 0), 0) : null;
        const actualWkts = segOvers.length > 0 ? segOvers.reduce((s, o) => s + (o.wickets ?? 0), 0) : null;
        const oversPlayed = segOvers.length;

        // ── Segment state ────────────────────────────────────────────────────
        const isPast = currentOver >= seg.end;
        const isCurrent = !isPast && currentOver >= seg.start - 1 && currentOver < seg.end;
        const isFuture = !isPast && !isCurrent;

        // If partially played, project the rest
        let projectedRuns = null;
        if (isCurrent && oversPlayed > 0) {
            const perOverActual = actualRuns / oversPlayed;
            const remainingOvers = seg.end - currentOver;
            projectedRuns = Math.round((actualRuns ?? 0) + perOverActual * remainingOvers);
        }

        // ── Run rate label ───────────────────────────────────────────────────
        const runRate = (expRuns / 4).toFixed(1);

        // ── Bowler type advantage ────────────────────────────────────────────
        let advantage = "Contested";
        let advColor = C.amber;
        if (i === 0) {
            if (humidity > 78 || pitchKey === "WET") { advantage = "Seam"; advColor = "#3B82F6"; }
            else if (pitchKey === "FLAT") { advantage = "Batters"; advColor = C.green; }
            else { advantage = "Seam"; advColor = "#3B82F6"; }
        } else if (i === 1) {
            advantage = pitchKey === "FLAT" ? "Batters" : "Batters";
            advColor = C.green;
        } else if (i === 2) {
            if (["DRY","DUSTY","WORN"].includes(pitchKey) || detr >= 1.15) { advantage = "Spin"; advColor = "#A855F7"; }
            else { advantage = "Contested"; advColor = C.amber; }
        } else if (i === 3) {
            if (["DRY","DUSTY","WORN"].includes(pitchKey) || detr >= 1.1) { advantage = "Spin"; advColor = "#A855F7"; }
            else { advantage = "Batters"; advColor = C.green; }
        } else {
            if (dewFactor < 0.9 || pitchKey === "FLAT") { advantage = "Batters"; advColor = C.green; }
            else { advantage = "Pace"; advColor = "#EF4444"; }
        }

        return {
            ...seg,
            pitchKey,
            expRuns,
            runRate,
            wicketPct,
            actualRuns,
            actualWkts,
            oversPlayed,
            projectedRuns,
            isPast,
            isCurrent,
            isFuture,
            narrative: getPitchNarrative(pitchKey, detr, i),
            weatherNote: getWeatherNote(weather, i),
            advantage,
            advColor,
            detr,
        };
    });
}

// ─── Pitch visual bar ─────────────────────────────────────────────────────────
function PitchVisual({ pitchKey, detr, currentOver }) {
    const PITCH_COLORS = {
        FRESH: ["#4ade80","#86efac","#fbbf24","#fb923c","#f87171"],
        WORN:  ["#86efac","#fbbf24","#fb923c","#f87171","#ef4444"],
        DRY:   ["#fbbf24","#f97316","#ef4444","#dc2626","#b91c1c"],
        WET:   ["#3b82f6","#60a5fa","#93c5fd","#bfdbfe","#dbeafe"],
        DUSTY: ["#d97706","#b45309","#92400e","#78350f","#ef4444"],
        GOOD:  ["#4ade80","#a3e635","#fbbf24","#f97316","#f87171"],
        FLAT:  ["#22c55e","#16a34a","#15803d","#fbbf24","#f97316"],
    };
    const colors = PITCH_COLORS[pitchKey] || PITCH_COLORS.FRESH;
    const width = 280, height = 60;
    const zoneW = width / 5;

    return (
        <svg width={width} height={height} style={{ display: "block", margin: "0 auto" }}>
            {SEGMENTS.map((seg, i) => {
                const isActive = currentOver >= seg.start - 1 && currentOver < seg.end;
                return (
                    <g key={i}>
                        <rect x={i * zoneW + 2} y={isActive ? 4 : 8} width={zoneW - 4} height={isActive ? height - 8 : height - 16}
                            rx={4} fill={colors[i]} opacity={isActive ? 1 : 0.5} />
                        <text x={i * zoneW + zoneW / 2} y={height / 2 + 5} textAnchor="middle"
                            fontSize={9} fontWeight={700} fill="#fff" fontFamily="Inter, system-ui">
                            {seg.label}
                        </text>
                        {isActive && (
                            <text x={i * zoneW + zoneW / 2} y={height - 3} textAnchor="middle"
                                fontSize={7} fill="rgba(255,255,255,0.9)" fontFamily="Inter, system-ui">
                                ▲ NOW
                            </text>
                        )}
                    </g>
                );
            })}
        </svg>
    );
}

// ─── Legend pill ─────────────────────────────────────────────────────────────
function Pill({ label, color, bg }) {
    return (
        <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: "2px 8px", borderRadius: 4, letterSpacing: 0.4 }}>
            {label}
        </span>
    );
}

// ─── Single segment card ──────────────────────────────────────────────────────
function SegmentCard({ seg, idx }) {
    const dimmed = seg.isPast;
    const accent = seg.isCurrent ? "#3B82F6" : seg.isPast ? "#334155" : C.navyLight;

    const runBarW = Math.min(100, Math.round((seg.expRuns / 50) * 100));
    const wktBarW = Math.min(100, seg.wicketPct);

    return (
        <div style={{
            background: seg.isCurrent ? "rgba(59,130,246,0.08)" : "rgba(255,255,255,0.025)",
            border: `1.5px solid ${accent}`,
            borderRadius: 12,
            padding: "14px 16px",
            opacity: seg.isPast ? 0.62 : 1,
            position: "relative",
            transition: "all 0.2s",
        }}>
            {/* "YOU ARE HERE" badge */}
            {seg.isCurrent && (
                <div style={{
                    position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                    background: "#3B82F6", color: "#fff", fontSize: 9, fontWeight: 800,
                    padding: "2px 10px", borderRadius: 20, letterSpacing: 1, whiteSpace: "nowrap",
                }}>
                    ▶ YOU ARE HERE
                </div>
            )}

            {/* Header row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{seg.icon}</span>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>
                            Overs {seg.label}
                        </div>
                        <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>{seg.phase}</div>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <Pill
                        label={seg.advantage}
                        color={seg.advColor}
                        bg={seg.advColor + "1A"}
                    />
                </div>
            </div>

            {/* Actual vs Predicted */}
            {seg.isPast && seg.actualRuns !== null ? (
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, letterSpacing: 1 }}>ACTUAL RUNS</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: C.text }}>{seg.actualRuns}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>{seg.actualWkts ?? 0} wkt{(seg.actualWkts ?? 0) !== 1 ? "s" : ""} fell</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, letterSpacing: 1 }}>AI PREDICTED</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#64748B" }}>{seg.expRuns}</div>
                        <div style={{ fontSize: 10, color: C.muted }}>≈{seg.runRate} RPO</div>
                    </div>
                </div>
            ) : seg.isCurrent && seg.actualRuns !== null ? (
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: "rgba(59,130,246,0.08)", borderRadius: 8, padding: "8px 10px", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <div style={{ fontSize: 9, color: "#60A5FA", marginBottom: 3, letterSpacing: 1 }}>SO FAR</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{seg.actualRuns}</div>
                        <div style={{ fontSize: 10, color: "#93C5FD" }}>{seg.oversPlayed} ov played</div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, letterSpacing: 1 }}>PROJECTED TOTAL</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: C.accent }}>
                            {seg.projectedRuns ?? seg.expRuns}
                        </div>
                        <div style={{ fontSize: 10, color: C.muted }}>for segment</div>
                    </div>
                </div>
            ) : (
                <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Expected runs</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{seg.expRuns} <span style={{ fontSize: 10, fontWeight: 400, color: C.muted }}>≈{seg.runRate} RPO</span></span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ width: `${runBarW}%`, height: "100%", background: C.accent, borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                </div>
            )}

            {/* Wicket probability bar */}
            {!seg.isPast && (
                <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: C.muted }}>Wicket probability</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: seg.wicketPct > 35 ? C.red : seg.wicketPct > 22 ? C.amber : C.green }}>
                            {seg.wicketPct}%
                        </span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                            width: `${wktBarW}%`, height: "100%", borderRadius: 3, transition: "width 0.5s",
                            background: seg.wicketPct > 35 ? C.red : seg.wicketPct > 22 ? C.amber : C.green,
                        }} />
                    </div>
                </div>
            )}

            {/* Narrative */}
            <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5, marginBottom: seg.weatherNote ? 7 : 0 }}>
                {seg.narrative}
            </div>

            {/* Weather note */}
            {seg.weatherNote && (
                <div style={{ fontSize: 10, color: "#60A5FA", marginTop: 6, fontStyle: "italic", lineHeight: 1.4 }}>
                    {seg.weatherNote}
                </div>
            )}
        </div>
    );
}

// ─── Pitch legend header ──────────────────────────────────────────────────────
function PitchHeader({ pred }) {
    if (!pred) return null;
    const pitchKey = normalisePitchKey(pred.pitchCondition);
    const detr = pred.deteriorationFactor ?? 1.0;
    const weather = pred.weatherImpact || {};
    const dew = weather.dewFactor ?? 1.0;
    const humidity = weather.humidity ?? 60;
    const temp = weather.temperature ?? 28;

    const pitchLabels = {
        FRESH: ["Fresh Pitch", "#22c55e", "Good bounce and carry — seam movement expected early"],
        WORN:  ["Worn Pitch", "#f97316", "Rough patches forming — spin and variable bounce"],
        DRY:   ["Dry/Cracked", "#ef4444", "Serious spin and low bounce — batters will struggle in mid-overs"],
        WET:   ["Damp Surface", "#60a5fa", "Moisture helps seam, suppresses run scoring overall"],
        DUSTY: ["Dusty Track", "#b45309", "Extravagant turn — spinners will dominate middle overs"],
        GOOD:  ["Good Surface", "#4ade80", "Balanced pitch — even contest between bat and ball"],
        FLAT:  ["Flat Track", "#fbbf24", "Highway pitch — high-scoring game expected"],
    };
    const [pitchLabel, pitchColor, pitchDesc] = pitchLabels[pitchKey] || pitchLabels.FRESH;

    const detrLabel = detr >= 1.25 ? "Rapid" : detr >= 1.1 ? "Moderate" : "Slow";
    const detrColor = detr >= 1.25 ? C.red : detr >= 1.1 ? C.amber : C.green;

    return (
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: pitchColor }}>{pitchLabel}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>·</span>
                        <span style={{ fontSize: 11, color: C.muted }}>Deterioration: <b style={{ color: detrColor }}>{detrLabel}</b></span>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{pitchDesc}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {dew < 0.9 && <Pill label={`Dew factor: HIGH`} color="#60A5FA" bg="rgba(96,165,250,0.12)" />}
                    {humidity > 78 && <Pill label={`Humidity: ${humidity}%`} color="#a5f3fc" bg="rgba(165,243,252,0.1)" />}
                    {temp > 34 && <Pill label={`Heat: ${temp}°C`} color="#fb923c" bg="rgba(251,146,60,0.12)" />}
                    {!pred.weatherImpact && <Pill label="Weather: N/A" color={C.muted} bg="rgba(100,116,139,0.1)" />}
                </div>
            </div>
        </div>
    );
}

// ─── No match selected state ──────────────────────────────────────────────────
function NoPitchData({ liveMatches, onMatchSelect }) {
    return (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                No match selected
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                Select a live or upcoming match to see dynamic pitch analysis
            </div>
            {liveMatches?.filter(m => m.status === "LIVE").slice(0, 3).map(m => (
                <button key={m.id} onClick={() => onMatchSelect(m)}
                    style={{ display: "block", width: "100%", maxWidth: 320, margin: "0 auto 8px", background: C.navy, border: `1px solid ${C.navyLight}`, borderRadius: 10, padding: "10px 16px", color: C.text, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                    <span style={{ color: C.green, fontWeight: 700, marginRight: 6 }}>● LIVE</span>
                    {m.t1} vs {m.t2}
                </button>
            ))}
        </div>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function PitchTab({ pred, selectedMatch, liveMatches, onMatchSelect }) {
    const segments = useMemo(() => {
        if (!pred) return null;
        return buildSegmentData(pred);
    }, [
        pred?.pitchCondition, pred?.deteriorationFactor,
        pred?.weatherImpact?.dewFactor, pred?.weatherImpact?.humidity,
        pred?.overs, pred?.overHistory?.length,
    ]);

    const currentOvers = parseFloat(pred?.overs ?? 0);
    const currentOver = Math.floor(currentOvers);
    const pitchKey = normalisePitchKey(pred?.pitchCondition);
    const matchName = pred
        ? `${cleanTeam(pred.team1)} vs ${cleanTeam(pred.team2)}`
        : selectedMatch
            ? `${selectedMatch.t1} vs ${selectedMatch.t2}`
            : null;

    if (!pred && !selectedMatch) {
        return <NoPitchData liveMatches={liveMatches} onMatchSelect={onMatchSelect} />;
    }

    if (!pred) {
        return (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 14, color: C.muted }}>Loading pitch data for {selectedMatch?.t1} vs {selectedMatch?.t2}…</div>
            </div>
        );
    }

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
                    <span style={{ fontSize: 10, color: C.muted, letterSpacing: 0.8 }}>DYNAMIC · LIVE DATA</span>
                </div>
            </div>

            {/* Pitch condition summary */}
            <PitchHeader pred={pred} />

            {/* Pitch colour bar */}
            <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, letterSpacing: 0.6 }}>PITCH BEHAVIOUR ACROSS 20 OVERS</div>
                <PitchVisual pitchKey={pitchKey} detr={pred.deteriorationFactor ?? 1.0} currentOver={currentOver} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, padding: "0 2px" }}>
                    <span style={{ fontSize: 9, color: C.muted }}>Fresh</span>
                    <span style={{ fontSize: 9, color: C.muted }}>Deteriorating →</span>
                    <span style={{ fontSize: 9, color: C.muted }}>Death</span>
                </div>
            </div>

            {/* Segments */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {segments.map((seg, i) => (
                    <SegmentCard key={i} seg={seg} idx={i} />
                ))}
            </div>

            {/* Footer note */}
            <div style={{ marginTop: 20, padding: "12px 14px", background: "rgba(255,255,255,0.025)", borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
                    ⚙️ Analysis computed from live pitch condition (<b style={{ color: C.text }}>{pred.pitchCondition || "FRESH"}</b>), deterioration factor ({(pred.deteriorationFactor ?? 1.0).toFixed(2)}x), weather data, and over-by-over history. Past segment data shows actual match figures.
                </div>
            </div>
        </div>
    );
}
