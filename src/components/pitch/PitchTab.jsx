/* eslint-disable */
import React, { useMemo } from "react";
import { C, cleanTeam } from "../shared/constants";

// ─── JS port of _compute_pitch_score_live (validated r=0.689 on 12,951 T20 matches) ──
function computePitchScore(ovRuns, ovWkts) {
    const n = ovRuns.length;
    if (n === 0) return { score: 5.0, label: "NEUTRAL", color: "#F59E0B", narrative: "No data yet" };

    const pp_runs  = ovRuns.slice(0, Math.min(6, n)).reduce((a, b) => a + b, 0);
    const pp_wkts  = ovWkts.slice(0, Math.min(6, n)).reduce((a, b) => a + b, 0);
    const pp_overs = Math.min(6, n);
    const pp_crr   = pp_runs / Math.max(pp_overs, 1);

    let new_ball_score = 5.0;
    if (pp_overs >= 3) {
        const wkt_penalty    = Math.min(pp_wkts / 6.0, 1.0);
        const crr_score      = Math.min(pp_crr / 12.0, 1.0);
        new_ball_score = Math.max(0, Math.min(10, crr_score * 10 - wkt_penalty * 4));
    }

    let old_ball_score = 5.0;
    let narrative_mid  = "middle overs data pending";
    if (n > 6) {
        const mid_runs  = ovRuns.slice(6, Math.min(15, n)).reduce((a, b) => a + b, 0);
        const mid_overs = Math.min(15, n) - 6;
        const mid_crr   = mid_runs / Math.max(mid_overs, 1);
        const crr_change = mid_crr - pp_crr;
        if (crr_change > 2.0)       { old_ball_score = 8.0; narrative_mid = `scoring jumped +${crr_change.toFixed(1)} RPO vs PP → pitch totally flat`; }
        else if (crr_change > 0.5)  { old_ball_score = 6.5; narrative_mid = `+${crr_change.toFixed(1)} RPO increase → pitch settling`; }
        else if (crr_change < -1.5) { old_ball_score = 3.0; narrative_mid = `scoring DROPPED ${crr_change.toFixed(1)} RPO → pitch gripping`; }
        else if (crr_change < -0.5) { old_ball_score = 4.0; narrative_mid = `−${Math.abs(crr_change).toFixed(1)} RPO drop → mild grip`; }
        else                        { old_ball_score = 5.5; narrative_mid = "consistent scoring → neutral surface"; }
    }

    const final_score = n > 6
        ? new_ball_score * 0.45 + old_ball_score * 0.55
        : new_ball_score;

    let label, color;
    if (final_score <= 2)   { label = "EXTREME BOWLING";  color = "#ef4444"; }
    else if (final_score <= 4)   { label = "BOWLING PITCH";    color = "#f97316"; }
    else if (final_score <= 5)   { label = "NEUTRAL-BOWLING";  color = "#eab308"; }
    else if (final_score <= 6.5) { label = "NEUTRAL-BATTING";  color = "#84cc16"; }
    else if (final_score <= 8.5) { label = "BATTING PITCH";    color = "#22c55e"; }
    else                         { label = "BATTING PARADISE";  color = "#4ade80"; }

    const pp_narrative = pp_overs >= 3
        ? `PP ${pp_runs}/${pp_wkts} in ${pp_overs}ov (CRR ${pp_crr.toFixed(1)})`
        : `PP in progress: ${pp_runs}/${pp_wkts} in ${pp_overs}ov`;

    return {
        score: Math.round(final_score * 100) / 100,
        label,
        color,
        narrative: `${pp_narrative} | ${narrative_mid}`,
        ppCRR: pp_crr,
        ppWkts: pp_wkts,
    };
}

// ─── Pitch score color gradient (0=red, 5=amber, 10=green) ──────────────────
function scoreColor(score) {
    if (score <= 2)   return "#ef4444";
    if (score <= 4)   return "#f97316";
    if (score <= 5)   return "#eab308";
    if (score <= 6.5) return "#84cc16";
    if (score <= 8.5) return "#22c55e";
    return "#4ade80";
}

// ─── Big validated pitch score meter ─────────────────────────────────────────
function PitchScoreMeter({ pred }) {
    // Prefer backend validated score, fall back to computing from overHistory
    const overHistory = pred?.overHistory || [];
    const computed = useMemo(() => {
        if (overHistory.length < 2) return null;
        const ovR = overHistory.map(h => h.runs ?? 0);
        const ovW = overHistory.map(h => h.wickets ?? 0);
        return computePitchScore(ovR, ovW);
    }, [overHistory.length, overHistory[overHistory.length - 1]?.runs]);

    const vps  = pred?.pitchScoreValidated;
    const score = vps?.score ?? computed?.score ?? null;
    const label = vps?.label ?? computed?.label ?? null;
    const narrative = vps?.narrative ?? computed?.narrative ?? null;
    const color = score !== null ? scoreColor(score) : "#94A3B8";

    if (score === null) return null;

    const pct = Math.round((score / 10) * 100);

    return (
        <div style={{
            background: `linear-gradient(135deg, #0D1117 0%, ${color}12 100%)`,
            border: `1.5px solid ${color}55`,
            borderRadius: 16, padding: "18px 20px", marginBottom: 14,
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                    <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>PITCH SCORE · LIVE</div>
                    <div style={{ fontSize: 11, color: color, fontWeight: 700, letterSpacing: 0.5 }}>{label}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: 42, fontWeight: 900, color, lineHeight: 1 }}>{score.toFixed(1)}</span>
                    <span style={{ fontSize: 14, color: "#475569", marginLeft: 3 }}>/10</span>
                </div>
            </div>

            {/* Gradient bar */}
            <div style={{ position: "relative", height: 10, borderRadius: 6, background: "linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)", marginBottom: 8 }}>
                <div style={{
                    position: "absolute", top: -3, left: `${Math.max(2, Math.min(96, pct))}%`,
                    transform: "translateX(-50%)",
                    width: 16, height: 16, borderRadius: "50%",
                    background: color, border: "2px solid #0D1117",
                    boxShadow: `0 0 8px ${color}`,
                }} />
            </div>

            {/* Scale labels */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#334155", marginBottom: 10 }}>
                <span>BOWLING</span><span>NEUTRAL</span><span>BATTING</span>
            </div>

            {/* Narrative */}
            {narrative && (
                <div style={{ fontSize: 11, color: "#64748B", lineHeight: 1.6, borderTop: "1px solid #1E293B", paddingTop: 10 }}>
                    {narrative.replace(/^\[.*?\]\s*/, "")}
                </div>
            )}
        </div>
    );
}

// ─── Per-over pitch score evolution chart ─────────────────────────────────────
function PitchEvolutionChart({ overHistory }) {
    const points = useMemo(() => {
        if (!overHistory || overHistory.length < 2) return [];
        const sorted = [...overHistory].sort((a, b) => (a.over ?? a.overNum ?? 0) - (b.over ?? b.overNum ?? 0));
        const ovR = sorted.map(h => h.runs ?? 0);
        const ovW = sorted.map(h => h.wickets ?? 0);
        const pts = [];
        for (let i = 2; i <= ovR.length; i++) {
            const { score, color } = computePitchScore(ovR.slice(0, i), ovW.slice(0, i));
            pts.push({ over: i, score, color });
        }
        return pts;
    }, [overHistory?.length, overHistory?.[overHistory?.length - 1]?.runs]);

    if (points.length < 2) return null;

    const W = 340, H = 80, PAD = 8;
    const maxX = 20, minY = 0, maxY = 10;
    const toX = (ov) => PAD + ((ov - 1) / (maxX - 1)) * (W - PAD * 2);
    const toY = (sc) => H - PAD - ((sc - minY) / (maxY - minY)) * (H - PAD * 2);

    const polyline = points.map(p => `${toX(p.over)},${toY(p.score)}`).join(" ");

    // Zone bands
    const zones = [
        { y1: toY(10), y2: toY(6.5), color: "#22c55e10" },
        { y1: toY(6.5), y2: toY(5),   color: "#84cc1610" },
        { y1: toY(5),   y2: toY(3),   color: "#eab30810" },
        { y1: toY(3),   y2: toY(0),   color: "#ef444410" },
    ];

    const last = points[points.length - 1];

    return (
        <div style={{ background: "#0D1117", borderRadius: 12, padding: "14px 16px", marginBottom: 14, border: "1px solid #1E293B" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, letterSpacing: 1 }}>PITCH SCORE PER OVER</div>
                <div style={{ fontSize: 11, color: last.color, fontWeight: 700 }}>
                    Now: {last.score.toFixed(1)} · {last.over > 6 ? "mid/death" : "PP"}
                </div>
            </div>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, overflow: "visible" }}>
                {/* Zone bands */}
                {zones.map((z, i) => (
                    <rect key={i} x={PAD} y={z.y1} width={W - PAD * 2} height={z.y2 - z.y1} fill={z.color} />
                ))}
                {/* Neutral line at 5 */}
                <line x1={PAD} y1={toY(5)} x2={W - PAD} y2={toY(5)} stroke="#1E293B" strokeDasharray="3,3" strokeWidth={1} />
                {/* Score line */}
                <polyline points={polyline} fill="none" stroke="#4A6FD4" strokeWidth={2} strokeLinejoin="round" />
                {/* Dots */}
                {points.map((p, i) => (
                    <circle key={i} cx={toX(p.over)} cy={toY(p.score)} r={i === points.length - 1 ? 5 : 3}
                        fill={p.color} stroke="#0D1117" strokeWidth={1.5} />
                ))}
                {/* X axis labels — every 5 overs */}
                {[1, 5, 10, 15, 20].map(ov => (
                    <text key={ov} x={toX(ov)} y={H - 1} textAnchor="middle" fontSize={7} fill="#334155">{ov}</text>
                ))}
                {/* Y axis labels */}
                {[0, 5, 10].map(sc => (
                    <text key={sc} x={2} y={toY(sc) + 3} fontSize={7} fill="#334155">{sc}</text>
                ))}
            </svg>
            {/* PP end marker */}
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                {[
                    { color: "#22c55e", label: "Batting" },
                    { color: "#eab308", label: "Neutral" },
                    { color: "#ef4444", label: "Bowling" },
                ].map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color, opacity: 0.7 }} />
                        <span style={{ fontSize: 9, color: "#334155" }}>{l.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Segments ─────────────────────────────────────────────────────────────────
const SEGMENTS = [
    { label: "1–4",   start: 1,  end: 4,  phase: "POWERPLAY" },
    { label: "5–8",   start: 5,  end: 8,  phase: "POWERPLAY" },
    { label: "9–12",  start: 9,  end: 12, phase: "MIDDLE"    },
    { label: "13–16", start: 13, end: 16, phase: "MIDDLE"    },
    { label: "17–20", start: 17, end: 20, phase: "DEATH"     },
];

// ─── Pitch behaviour types — plain simple English ─────────────────────────────
const BEHAVIOURS = {
    SEAM_SWING:    { id: "SEAM_SWING",    label: "Ball moving in air",   color: "#3B82F6", icon: "🌊", short: "Hard to bat" },
    SEAM_BOUNCE:   { id: "SEAM_BOUNCE",   label: "Ball jumping off pitch",color: "#60A5FA", icon: "⬆️", short: "Extra bounce" },
    SPIN_GRIP:     { id: "SPIN_GRIP",     label: "Spinners turning it",  color: "#A855F7", icon: "🌀", short: "Spinners winning" },
    SPIN_LETHAL:   { id: "SPIN_LETHAL",   label: "Very hard to bat",     color: "#9333EA", icon: "💫", short: "Spinners dominating" },
    DEW_FACTOR:    { id: "DEW_FACTOR",    label: "Ball getting wet",     color: "#38BDF8", icon: "💧", short: "Easy to bat" },
    SURFACE_FLAT:  { id: "SURFACE_FLAT",  label: "Easy to bat",          color: "#22C55E", icon: "🛣️", short: "Batters winning" },
    PITCH_WEARING: { id: "PITCH_WEARING", label: "Pitch breaking up",    color: "#F97316", icon: "🔥", short: "Getting tricky" },
    CONTESTED:     { id: "CONTESTED",     label: "Both sides even",      color: "#F59E0B", icon: "⚖️", short: "Equal fight" },
    UNKNOWN:       { id: "UNKNOWN",       label: "Waiting for data…",    color: "#64748B", icon: "🔍", short: "No data yet" },
};

// ─── Bet signals — fully match-state aware ────────────────────────────────────
function getBetSignal(beh, seg, ms) {
    const id = beh.id;
    const { runs, wickets, overs, target, crr, rrr, innings, wktsLeft,
            isChasing, pressure, oversLeft, runsNeeded, strikerSR, bowlerEco,
            last3Runs, last3RR, projWktsAtSegStart, projRunsAtSegStart } = ms;

    // ── helper shorthands ──────────────────────────────────────────────────────
    const isDP     = seg.phase === "DEATH";
    const isMid    = seg.phase === "MIDDLE";
    const isPP     = seg.phase === "POWERPLAY";
    const wktsDown = wickets ?? 0;
    const ovsDone  = parseFloat(overs ?? 0);

    // Projected wickets/runs at segment start (for future segments)
    const projWD   = projWktsAtSegStart ?? wktsDown;
    const projWL   = Math.max(10 - projWD, 0);
    const projR    = projRunsAtSegStart ?? runs;

    // ── SEAM / SWING ─────────────────────────────────────────────────────────
    if (id === "SEAM_SWING") {
        if (isChasing) {
            if (projWD >= 3) return { back: "Bowling team wins", fade: "Chase completed", reason: `${projWL} wickets left with movement still available — chase in serious trouble` };
            return { back: "PP wicket / tight PP total", fade: "Openers dominating", reason: "Ball swinging in humid conditions — openers at risk" };
        }
        if (projWD >= 4) return { back: "Under 130 total", fade: "Batting recovery", reason: `${projWD} wickets already gone with ball still moving — hard to recover` };
        return { back: "PP total under 35", fade: "50+ powerplay", reason: "New ball moving both ways — expect controlled PP scoring" };
    }

    // ── SEAM BOUNCE ───────────────────────────────────────────────────────────
    if (id === "SEAM_BOUNCE") {
        if (isChasing && runsNeeded > 0) {
            const rr = runsNeeded / Math.max(oversLeft, 1);
            if (rr > 11) return { back: "Defending team wins", fade: "Chasing team wins", reason: `Need ${runsNeeded} from ~${Math.round(oversLeft)} overs with extra bounce — near impossible` };
        }
        if (projWD >= 3 && isPP) return { back: "Under 140 total / top-order collapse", fade: "Smooth batting", reason: "3+ wickets with bounce still available — severe trouble" };
        return { back: "Caught behind or LBW wicket", fade: "Pull/hook shots going to boundary", reason: "Ball climbing sharply — inside edge and top edge danger" };
    }

    // ── SPIN GRIPPING ─────────────────────────────────────────────────────────
    if (id === "SPIN_GRIP") {
        if (isChasing) {
            const rr = runsNeeded / Math.max(oversLeft, 1);
            if (rr > 10 && projWD >= 4) return { back: "Defending team wins", fade: "Chase", reason: `Need ${runsNeeded} from ~${Math.round(oversLeft)} overs — spinners gripping + ${projWD} down` };
            if (projWD >= 5) return { back: "Under target by 20+", fade: "Successful chase", reason: `${projWD} wickets gone, spin gripping — batting has no room for error` };
            if (rr > 9) return { back: "Wicket this phase", fade: "Big over", reason: `Required rate ${rr.toFixed(1)} — batters must attack into spin, high risk` };
        }
        if (projWD >= 5) return { back: "Under 130 total", fade: "Recovery innings", reason: `${projWD} wickets down, pitch spinning — tail can't save this` };
        return { back: "Spinner wicket", fade: "Batters scoring 9+ RPO", reason: "Ball gripping and deviating — difficult to score freely" };
    }

    // ── SPIN LETHAL ───────────────────────────────────────────────────────────
    if (id === "SPIN_LETHAL") {
        if (isChasing) {
            const rr = runsNeeded / Math.max(oversLeft, 1);
            if (projWD >= 5) return { back: "Defending team wins", fade: "Any bet on chasing team", reason: `${projWD} wickets down, unplayable spin — chase almost over` };
            if (rr > 9) return { back: "Defending team wins", fade: "Chase pulled off", reason: `${rr.toFixed(1)} RRR + spinners lethal = pressure collapse likely` };
            return { back: "2+ wickets this phase", fade: "Chase on track", reason: "Unplayable turn — even set batters in danger" };
        }
        if (projWD >= 6) return { back: "Total under 120", fade: "Batting past over 16", reason: `Pitch unplayable + ${projWD} down — team could fold` };
        return { back: "2+ wickets this segment", fade: "Any batter scoring 25+", reason: "Rough outside off — spinners unplayable on this surface" };
    }

    // ── DEW FACTOR ───────────────────────────────────────────────────────────
    if (id === "DEW_FACTOR") {
        if (isChasing) {
            const rr = runsNeeded / Math.max(oversLeft, 1);
            if (rr < 9 && projWL >= 5) return { back: "Chase completed", fade: "Defending team wins", reason: `Dew killing spinners + ${projWL} wickets + need ${rr.toFixed(1)} RPO — chasers heavily favoured` };
            if (rr < 11 && projWL >= 4) return { back: "Chasing team wins", fade: "Wickets in death", reason: `Ball slipping out of bowlers' hands — ${rr.toFixed(1)} RRR easily achievable with dew` };
        }
        // 1st innings — dew inflates death total
        if (!isChasing && isDP) return { back: "20+ runs this phase", fade: "Bowling team defending well", reason: "Dew in death overs means spinners useless — pace bowlers also losing grip" };
        return { back: "Big over / 6s", fade: "Wicket ball", reason: "Ball completely wet — impossible to grip, boundaries easy" };
    }

    // ── SURFACE FLAT ─────────────────────────────────────────────────────────
    if (id === "SURFACE_FLAT") {
        if (isChasing) {
            const rr = runsNeeded / Math.max(oversLeft, 1);
            if (rr < 8 && projWL >= 5) return { back: "Chase completed easily", fade: "Bowling team wins", reason: `Flat pitch + ${projWL} wickets + only ${rr.toFixed(1)} RRR — chase is comfortable` };
            if (rr < 10 && projWL >= 3) return { back: "Chasing team wins", fade: "Under target", reason: `${rr.toFixed(1)} RRR on flat pitch — achievable if wickets in hand` };
        }
        if (!isChasing && projWD <= 3 && isDP) return { back: "Over 180 total", fade: "Under 165", reason: `Flat pitch + ${10 - projWD} wickets left in death — big finish expected` };
        return { back: "30+ runs this phase", fade: "Bowler dominant over", reason: "Surface completely flat — batters in full control" };
    }

    // ── PITCH WEARING ─────────────────────────────────────────────────────────
    if (id === "PITCH_WEARING") {
        if (isChasing) {
            const rr = runsNeeded / Math.max(oversLeft, 1);
            if (projWD >= 4 && rr > 8) return { back: "Defending team wins", fade: "Chase", reason: `Rough patches + ${projWD} wickets + ${rr.toFixed(1)} RRR — nearly impossible` };
            return { back: "Wicket this phase", fade: "Fluent 30+ runs", reason: "Deteriorating surface — rough outside off troubling batters" };
        }
        if (projWD >= 5) return { back: "Total under 140", fade: "Recovery", reason: `${projWD} down on wearing surface — game could end quickly` };
        return { back: "Spinner wicket from rough", fade: "Batters sweeping/cutting freely", reason: "Pitch breaking up — variable bounce from rough patches" };
    }

    // ── CONTESTED ────────────────────────────────────────────────────────────
    if (id === "CONTESTED") {
        if (isChasing) {
            const rr = runsNeeded / Math.max(oversLeft, 1);
            if (rr > 11) return { back: "Defending team wins", fade: "Chase", reason: `${rr.toFixed(1)} RRR on an even surface — very steep ask` };
            if (rr < 7 && projWL >= 6) return { back: "Chasing team wins", fade: "Defending team wins", reason: `${rr.toFixed(1)} RRR with ${projWL} wickets — comfortable chase` };
            // match in the balance
            return { back: "Next wicket within 3 overs", fade: "Nothing extreme this phase", reason: `${rr.toFixed(1)} RRR with ${projWL} wickets — match in the balance` };
        }
        if (projWD >= 5 && isMid) return { back: "Under 145 total", fade: "Big death over rally", reason: `${projWD} wickets down in the middle — tail won't last long` };
        if (projWD <= 2 && isDP) return { back: "Over 175 total", fade: "Under 160", reason: `${10 - projWD} wickets left in death on decent surface — acceleration expected` };
        return { back: "Match stays close", fade: "One team running away", reason: "Pitch giving fair contest — match situation decides it" };
    }

    return null;
}

// ─── Core: infer behaviour purely from live match trends ─────────────────────
// NO pitch condition lookup tables. Only measured values from the match.
function inferBehaviour(seg, allSegs, detr, dew, humidity, trendSlope, matchAvgRPO, avgWktsPerOv, last3RPO, crr, venueSegs) {
    const { actualRPO, actualWkts, oversPlayed, i } = seg;

    // ── CASE 1: Actual data exists for this segment ───────────────────────────
    if (oversPlayed >= 1) {
        const wPerOv = (actualWkts ?? 0) / oversPlayed;
        const rpo    = actualRPO ?? 0;
        const prevSeg = i > 0 ? allSegs[i - 1] : null;
        const rpoVsPrev = prevSeg?.actualRPO != null ? rpo - prevSeg.actualRPO : 0;

        // Dew taking over: late overs + scoring jumped vs earlier
        if (i >= 3 && dew < 0.88) return "DEW_FACTOR";
        if (i >= 3 && dew < 0.92 && rpoVsPrev > 1.5) return "DEW_FACTOR";

        // Spin lethal: middle overs, scoring collapsed + wickets clustering
        if (i >= 2 && wPerOv >= 0.5 && rpo < 6.0) return "SPIN_LETHAL";

        // Spin gripping: middle overs, below avg + wickets
        if (i >= 2 && wPerOv >= 0.30 && matchAvgRPO !== null && rpo < matchAvgRPO - 1.5) return "SPIN_GRIP";
        if (i >= 2 && wPerOv >= 0.35 && rpo < 7.5) return "SPIN_GRIP";
        // Middle overs very low scoring even without many wickets = spin gripping
        if (i >= 2 && rpo < 6.0) return "SPIN_GRIP";

        // Seam / swing: powerplay, wickets, low scoring
        if (i <= 1 && wPerOv >= 0.4 && rpo < 6.5) return "SEAM_SWING";
        if (i <= 1 && wPerOv >= 0.30 && rpo < 7.5) return "SEAM_BOUNCE";
        // Powerplay very low even without many wickets
        if (i <= 1 && rpo < 5.5) return "SEAM_SWING";

        // Pitch wearing: RPO drop between segments + detr climbing
        if (rpoVsPrev < -2.0 && detr >= 1.08) return "PITCH_WEARING";

        // Surface flattening: RPO climbed vs prev, or high absolute scoring
        if (rpoVsPrev > 1.5) return "SURFACE_FLAT";
        if (rpo >= 9.5)      return "SURFACE_FLAT";

        // Still have some data — use current scoring pace to decide
        if (rpo >= 8.5)      return "SURFACE_FLAT";
        if (rpo <= 6.5 && i >= 2) return "SPIN_GRIP";
        if (rpo <= 7.0 && i <= 1) return "SEAM_BOUNCE";
        return "CONTESTED";
    }

    // ── CASE 2: No data for this segment — project from match trends + venue history ──
    // Sources (all dynamic, no static tables):
    //   trendSlope   = LSQ RPO change per segment from actual overHistory
    //   avgWktsPerOv = actual match wicket rate
    //   crr / last3RPO = live match run rates
    //   detr         = computed from overs bowled
    //   dew          = computed from humidity + over number
    //   venueSegs    = historical avg per segment from 7500+ T20 matches at this venue

    // Venue historical RPO/wickets for this segment (real data, not a lookup table)
    const vSeg    = venueSegs ? venueSegs[i] : null;
    const vRPO    = vSeg?.avg_rpo    ?? null;
    const vWkts   = vSeg?.avg_wickets ?? null;
    const vCount  = vSeg?.count       ?? 0;

    // Use live match run rate as a primary signal — it reflects actual current conditions
    const livePace = last3RPO ?? crr ?? null;

    // DEW: dew is computed from live humidity + over number
    if (i >= 3 && dew < 0.88) return "DEW_FACTOR";
    if (i === 4 && dew < 0.93 && humidity > 72) return "DEW_FACTOR";

    // SURFACE FLAT: live pace is high, or match avg already high
    if (livePace !== null && livePace >= 10.0) return "SURFACE_FLAT";
    if (matchAvgRPO !== null && matchAvgRPO >= 9.0) return "SURFACE_FLAT";
    if (trendSlope > 1.5) return "SURFACE_FLAT";
    if (vRPO !== null && vCount >= 10 && vRPO >= 10.0 && i >= 3) return "SURFACE_FLAT";

    // SEAM: early overs, live pace is low + wickets falling
    if (i <= 1 && avgWktsPerOv >= 0.40 && livePace !== null && livePace < 7.0) return "SEAM_SWING";
    if (i <= 1 && avgWktsPerOv >= 0.25 && livePace !== null && livePace < 8.0) return "SEAM_BOUNCE";
    if (i <= 1 && livePace !== null && livePace < 6.0) return "SEAM_SWING"; // very low early = seam
    if (i <= 1 && vWkts !== null && vCount >= 10 && vWkts >= 2.2) return "SEAM_SWING";

    // SPIN: middle/death + live pace dropping
    if (i >= 2 && trendSlope < -2.0 && detr >= 1.10) return "SPIN_LETHAL";
    if (i >= 2 && trendSlope < -1.2 && detr >= 1.06) return "SPIN_GRIP";
    if (i >= 2 && detr >= 1.12 && vRPO !== null && vCount >= 10 && vRPO < 7.5) return "SPIN_GRIP";
    if (i >= 2 && detr >= 1.20) return "SPIN_LETHAL";
    if (i >= 2 && detr >= 1.10) return "SPIN_GRIP";
    // Middle overs + live pace is low = spin gripping
    if (i >= 2 && livePace !== null && livePace < 7.0 && avgWktsPerOv >= 0.20) return "SPIN_GRIP";
    if (i >= 2 && livePace !== null && livePace < 6.5) return "SPIN_GRIP";

    // PITCH WEARING: detr + RPO declining
    if (detr >= 1.12 && trendSlope < -0.8) return "PITCH_WEARING";

    // Last resort: if we have a live pace signal, use it to avoid CONTESTED
    if (livePace !== null && livePace >= 8.5) return "SURFACE_FLAT";
    if (matchAvgRPO !== null && matchAvgRPO >= 8.0) return "SURFACE_FLAT";

    return "CONTESTED";
}

// ─── Evidence bullets — what actually happened / what to expect ───────────────
function buildEvidence(seg, beh, allSegs, matchAvgRPO, pitchKey, detr, dew, humidity) {
    const { actualRPO, actualWkts, oversPlayed, i } = seg;
    const points = [];

    if (oversPlayed >= 1 && actualRPO !== null) {
        // ── Past / current: plain language from actual data ───────────────────
        const totalRuns  = seg.actualRuns ?? 0;
        const totalWkts  = seg.actualWkts ?? 0;
        const runsPerOv  = Math.round(actualRPO * 10) / 10;

        // How was the scoring?
        if (matchAvgRPO !== null) {
            const delta = actualRPO - matchAvgRPO;
            if (delta <= -2.5)     points.push(`Very hard to score — only ${totalRuns} runs in ${oversPlayed} overs`);
            else if (delta <= -1.2)points.push(`Scoring was difficult — ${totalRuns} runs in ${oversPlayed} overs`);
            else if (delta >= 2.5) points.push(`Batters dominated — ${totalRuns} runs in ${oversPlayed} overs`);
            else                   points.push(`${totalRuns} runs in ${oversPlayed} overs — normal scoring`);
        } else {
            points.push(`${totalRuns} runs scored in ${oversPlayed} overs`);
        }

        // Wickets — plain
        if (totalWkts >= 4)                         points.push(`${totalWkts} wickets fell — batting collapsed`);
        else if (totalWkts === 3)                   points.push(`3 wickets — bowlers on top`);
        else if (totalWkts === 2)                   points.push(`2 wickets fell`);
        else if (totalWkts === 1)                   points.push(`1 wicket fell`);
        else if (totalWkts === 0 && oversPlayed>=3) points.push(`No wickets — batters completely in control`);

        // Vs previous phase
        const prev = i > 0 ? allSegs[i - 1] : null;
        if (prev?.actualRPO) {
            const change = actualRPO - prev.actualRPO;
            if (change < -2.5)     points.push(`Much harder than previous overs`);
            else if (change > 2.5) points.push(`Much easier than previous overs`);
        }

        // Behaviour note
        if (beh.id === "DEW_FACTOR" && oversPlayed >= 2) points.push("Ball getting wet — hard for bowlers to grip");
        if (beh.id === "SPIN_LETHAL" && oversPlayed >= 2) points.push("Ball turning a lot — very hard to bat");
        if (beh.id === "SEAM_SWING" && oversPlayed >= 1)  points.push("Ball swinging — batters struggling to middle it");

    } else {
        // ── Future segment: from live trends + venue data ─────────────────────
        const { trendSlope, avgWktsPerOv, last3RPO, matchAvgRPO: mAvg,
                venueSegs: vSegs, venueName } = seg._trends || {};
        const vSeg   = vSegs ? vSegs[seg.i] : null;
        const vLabel = venueName ? venueName.split(",")[0] : null;

        // What's been happening in this match so far
        if (mAvg !== null && mAvg !== undefined) {
            const scoring = mAvg >= 9.5 ? "Teams scoring big" : mAvg >= 8 ? "Normal scoring match" : "Low scoring match";
            points.push(`${scoring} so far — ${mAvg.toFixed(1)} runs per over`);
        }

        if (beh.id === "SEAM_SWING")    points.push(`Ball still moving in the air — openers in danger`);
        if (beh.id === "SEAM_BOUNCE")   points.push(`Pitch giving extra bounce — hard to play short balls`);
        if (beh.id === "SPIN_GRIP")     points.push(`Pitch wearing out — spinners will turn it more now`);
        if (beh.id === "SPIN_LETHAL")   points.push(`Pitch badly worn — spinners almost unplayable expected`);
        if (beh.id === "DEW_FACTOR")    points.push(`Ball will get wet — spinners lose grip, easy to bat`);
        if (beh.id === "SURFACE_FLAT")  points.push(`Pitch is flat — expect big hitting and easy scoring`);
        if (beh.id === "PITCH_WEARING") points.push(`Surface breaking up — ball behaving unpredictably`);
        if (beh.id === "CONTESTED")     points.push(`No clear advantage — match situation decides this phase`);

        // Wicket rate context
        if (avgWktsPerOv != null && avgWktsPerOv >= 0.4)
            points.push(`${(avgWktsPerOv * 4).toFixed(1)} wickets per 4 overs on average in this match`);

        // Venue data — plain language
        if (vSeg && vSeg.count >= 8 && vLabel) {
            points.push(`At ${vLabel}: teams usually score ${Math.round(vSeg.avg_rpo * 4)} runs and lose ${vSeg.avg_wickets.toFixed(1)} wickets in these overs (${vSeg.count} matches)`);
        }
    }

    return points.slice(0, 3); // max 3 bullets
}

// ─── Project match state at start of a future segment ────────────────────────
function projectStateAtSegment(seg, currentRuns, currentWkts, currentOvers, matchAvgRPO, avgWktsPerOv) {
    const oversToSeg = Math.max(seg.start - 1 - currentOvers, 0);
    const projRuns   = Math.round(currentRuns + (matchAvgRPO ?? 8) * oversToSeg);
    const projWkts   = Math.min(9, Math.round(currentWkts + avgWktsPerOv * oversToSeg));
    return { projRunsAtSegStart: projRuns, projWktsAtSegStart: projWkts };
}

// ─── Main computation ─────────────────────────────────────────────────────────
function buildSegmentData(pred) {
    const pitchKey = normalisePitchKey(pred?.pitchCondition);
    const detr     = Math.min(pred?.deteriorationFactor ?? 1.0, 1.6);
    const weather  = pred?.weatherImpact || {};
    const dew      = weather.dewFactor  ?? 1.0;
    const humidity = weather.humidity   ?? 60;
    const temp     = weather.temperature ?? 28;
    const overHistory = pred?.overHistory || [];
    const pitchSegML  = pred?.pitchSegPredictions || {};
    const currentOvers = parseFloat(pred?.overs ?? 0);
    const currentOver  = Math.floor(currentOvers);

    // ── Live match state ──────────────────────────────────────────────────────
    const runs    = pred?.score   ?? pred?.runs   ?? 0;
    const wickets = pred?.wickets ?? 0;
    const target  = pred?.target  ?? 0;
    const innings = pred?.innings ?? 1;
    const crr     = pred?.currentRunRate ?? parseFloat((runs / Math.max(currentOvers, 0.1)).toFixed(2));
    const rrr     = pred?.requiredRunRate ?? 0;
    const isChasing  = innings === 2 && target > 0;
    const wktsLeft   = 10 - wickets;
    const oversLeft  = Math.max(20 - currentOvers, 0);
    const runsNeeded = isChasing ? Math.max(target - runs, 0) : 0;
    const pressure   = isChasing ? rrr - crr : 0;
    const strikerSR  = pred?.playerContext?.strikerSR ?? 100;
    const bowlerEco  = pred?.playerContext?.bowlerEco ?? 8;
    const last3Runs  = pred?.playerContext?.last3Runs ?? 0;
    const last3RR    = pred?.playerContext?.last3RR   ?? 8;

    // Average wickets per over from history (for projection)
    const overMap = {};
    overHistory.forEach(o => {
        const k = Math.round(o.over ?? o.overNum ?? 0);
        if (k >= 1 && k <= 20) overMap[k] = { runs: o.runs ?? 0, wickets: o.wickets ?? 0 };
    });
    const completedKeys = Object.keys(overMap).map(Number);
    const totalRuns  = completedKeys.reduce((s, k) => s + overMap[k].runs, 0);
    const totalWkts  = completedKeys.reduce((s, k) => s + overMap[k].wickets, 0);
    const matchAvgRPO  = completedKeys.length >= 3
        ? Math.round((totalRuns / completedKeys.length) * 10) / 10
        : null;
    const avgWktsPerOv = completedKeys.length >= 3
        ? totalWkts / completedKeys.length
        : 0.25;

    // Last 3 overs RPO (from overMap — actual data)
    const sortedKeys = completedKeys.sort((a, b) => a - b);
    const last3Keys  = sortedKeys.slice(-3);
    const last3RPO   = last3Keys.length > 0
        ? Math.round((last3Keys.reduce((s, k) => s + overMap[k].runs, 0) / last3Keys.length) * 10) / 10
        : null;

    // LSQ trend slope across completed 4-over segments (RPO change per segment)
    // Computed after rawSegs is built — placeholder here, filled below
    let trendSlope = 0;

    // ── Per-segment stats ─────────────────────────────────────────────────────
    const rawSegs = SEGMENTS.map((seg, i) => {
        const played = [];
        for (let ov = seg.start; ov <= seg.end; ov++) {
            if (overMap[ov]) played.push({ over: ov, ...overMap[ov] });
        }
        const allOvs = [];
        for (let ov = seg.start; ov <= seg.end; ov++) {
            allOvs.push({ over: ov, ...(overMap[ov] || { runs: null, wickets: null }), played: !!overMap[ov] });
        }
        const actualRuns = played.length > 0 ? played.reduce((s, o) => s + o.runs, 0) : null;
        const actualWkts = played.length > 0 ? played.reduce((s, o) => s + o.wickets, 0) : null;
        const actualRPO  = played.length > 0 ? Math.round((actualRuns / played.length) * 10) / 10 : null;
        const isPast     = currentOver >= seg.end;
        const isCurrent  = !isPast && currentOver >= seg.start - 1 && currentOver < seg.end;
        const isFuture   = !isPast && !isCurrent;
        return { ...seg, i, played, allOvs, actualRuns, actualWkts, actualRPO, oversPlayed: played.length, isPast, isCurrent, isFuture };
    });

    // ── Base match state object (shared across signals) ───────────────────────
    const baseMS = {
        runs, wickets, overs: currentOvers, target, crr, rrr,
        innings, wktsLeft, isChasing, pressure, oversLeft, runsNeeded,
        strikerSR, bowlerEco, last3Runs, last3RR,
    };

    // ── Venue historical stats ────────────────────────────────────────────────
    const venueHistory = pred?.venueHistory || null;
    const venueSegs    = venueHistory?.segments || null; // [{label,avg_rpo,avg_wickets,count}]

    // ── Compute trendSlope from completed segments ────────────────────────────
    const doneSegs = rawSegs.filter(s => s.isPast && s.actualRPO !== null);
    if (doneSegs.length >= 2) {
        const n     = doneSegs.length;
        const xs    = doneSegs.map((_, j) => j);
        const ys    = doneSegs.map(s => s.actualRPO);
        const xMean = xs.reduce((a, b) => a + b, 0) / n;
        const yMean = ys.reduce((a, b) => a + b, 0) / n;
        const num   = xs.reduce((s, x, j) => s + (x - xMean) * (ys[j] - yMean), 0);
        const den   = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
        trendSlope  = den !== 0 ? Math.round((num / den) * 100) / 100 : 0;
    }

    // Trends object passed to evidence builder
    const trends = { trendSlope, avgWktsPerOv, last3RPO, matchAvgRPO, venueSegs, venueName: venueHistory?.name, venueCount: venueHistory?.match_count };

    // ── Enrich each segment ───────────────────────────────────────────────────
    const segments = rawSegs.map((seg, i) => {
        const behId    = inferBehaviour(seg, rawSegs, detr, dew, humidity, trendSlope, matchAvgRPO, avgWktsPerOv, last3RPO, crr, venueSegs);
        const beh      = BEHAVIOURS[behId] || BEHAVIOURS.UNKNOWN;
        // ML pitch prediction for future segments
        const mlPred   = seg.isFuture ? pitchSegML[seg.label] || null : null;
        // Attach trends for evidence builder to use
        const segWithTrends = { ...seg, _trends: trends };
        const evidence = buildEvidence(segWithTrends, beh, rawSegs, matchAvgRPO, null, detr, dew, humidity);

        // Project match state at start of this segment (for future segments)
        const proj = seg.isFuture
            ? projectStateAtSegment(seg, runs, wickets, currentOvers, matchAvgRPO ?? crr, avgWktsPerOv)
            : { projRunsAtSegStart: runs, projWktsAtSegStart: wickets };

        // Recalculate oversLeft and runsNeeded at segment start
        const segOversLeft   = Math.max(20 - (seg.isFuture ? seg.start - 1 : currentOvers), 0);
        const segRunsNeeded  = isChasing ? Math.max(target - (proj.projRunsAtSegStart ?? runs), 0) : 0;

        const ms = {
            ...baseMS,
            ...proj,
            oversLeft: segOversLeft,
            runsNeeded: segRunsNeeded,
        };

        const betSignal = (!seg.isPast) ? getBetSignal(beh, seg, ms) : null;
        return { ...seg, beh, evidence, betSignal, matchAvgRPO, dew, mlPred };
    });

    // pitchKey kept only for the UI label chip — NOT used in any inference
    return { segments, matchAvgRPO, pitchKey, detr, weather, dew, humidity, temp, trendSlope, avgWktsPerOv, last3RPO };
}

function normalisePitchKey(raw) {
    if (!raw) return "FRESH";
    const u = raw.toUpperCase();
    if (u.includes("WEAR") || u.includes("WORN"))  return "WORN";
    if (u.includes("DRY")  || u.includes("CRACK")) return "DRY";
    if (u.includes("DUST") || u.includes("TURN"))  return "DUSTY";
    if (u.includes("WET")  || u.includes("DAMP"))  return "WET";
    if (u.includes("FLAT") || u.includes("BATT"))  return "FLAT";
    if (u.includes("GOOD") || u.includes("BAL"))   return "GOOD";
    return "FRESH";
}

// ─── Over dot-bar mini chart ──────────────────────────────────────────────────
function OverDots({ seg, large }) {
    const hasData = seg.allOvs.some(o => o.played);
    if (!hasData) return null;
    const maxR = Math.max(...seg.allOvs.filter(o => o.played).map(o => o.runs), 1);
    const h = large ? 44 : 28;
    return (
        <div style={{ display: "flex", gap: large ? 5 : 3, alignItems: "flex-end", height: h, marginTop: large ? 14 : 8 }}>
            {seg.allOvs.map((o, j) => {
                if (!o.played) {
                    return <div key={j} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />;
                }
                const barH = Math.max(4, Math.round((o.runs / maxR) * (h - 10)));
                const hasWkt = o.wickets > 0;
                const barColor = hasWkt ? "#ef4444" : o.runs >= 12 ? "#4ade80" : o.runs >= 7 ? seg.beh?.color ?? C.accent : "#475569";
                return (
                    <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        {hasWkt && <div style={{ width: large ? 6 : 4, height: large ? 6 : 4, borderRadius: "50%", background: "#ef4444" }} />}
                        <div style={{ width: "100%", height: barH, borderRadius: 2, background: barColor }} title={`Over ${o.over}: ${o.runs}r ${o.wickets}w`} />
                        <span style={{ fontSize: large ? 9 : 7, color: "#475569", fontWeight: large ? 600 : 400 }}>{o.over}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── BIG live card for the current segment ────────────────────────────────────
function LiveCard({ seg, isMatchOver }) {
    const { beh, evidence, betSignal } = seg;
    return (
        <div style={{
            background: `linear-gradient(135deg, #0D1117 0%, ${beh.color}18 100%)`,
            border: `2px solid ${beh.color}`,
            borderRadius: 18, padding: "20px",
            boxShadow: `0 0 32px ${beh.color}22`,
            position: "relative",
        }}>
            {/* LIVE badge — only when match is still in progress */}
            {!isMatchOver && (
                <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 5, background: "#3B82F618", border: "1px solid #3B82F6", borderRadius: 20, padding: "3px 10px" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", animation: "pulse 1.5s infinite" }} />
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#3B82F6", letterSpacing: 1 }}>LIVE</span>
                </div>
            )}

            {/* Phase + overs */}
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>
                OVERS {seg.label} · {seg.phase}
            </div>

            {/* Icon + behaviour name */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>{beh.icon}</span>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: beh.color, lineHeight: 1.1 }}>{beh.label}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{beh.short}</div>
                </div>
            </div>

            {/* Score row */}
            {seg.actualRuns !== null && (
                <div style={{ display: "flex", gap: 16, marginBottom: 10, alignItems: "center" }}>
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{seg.actualRuns}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>runs</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: seg.actualWkts > 0 ? "#ef4444" : "#22c55e", lineHeight: 1 }}>{seg.actualWkts ?? 0}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>wickets</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 18px", textAlign: "center" }}>
                        <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{seg.actualRPO?.toFixed(1) ?? "–"}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>RPO</div>
                    </div>
                </div>
            )}

            {/* Over bars — large */}
            <OverDots seg={{ ...seg, beh }} large />

            {/* Evidence bullets */}
            {evidence.length > 0 && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
                    {evidence.map((pt, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <span style={{ color: beh.color, fontSize: 11, marginTop: 1, flexShrink: 0 }}>●</span>
                            <span style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>{pt}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Bet signal */}
            {betSignal && (
                <div style={{ marginTop: 14, background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${beh.color}` }}>
                    <div style={{ fontSize: 10, color: "#475569", marginBottom: 10, fontWeight: 700, letterSpacing: 0.5 }}>WHAT TO BET</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 15 }}>✅</span>
                            <span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{betSignal.back}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 15 }}>❌</span>
                            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{betSignal.fade}</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 10, lineHeight: 1.6 }}>{betSignal.reason}</div>
                </div>
            )}
        </div>
    );
}

// ─── Compact next-up card ─────────────────────────────────────────────────────
function NextCard({ seg }) {
    const { beh, evidence, betSignal } = seg;
    return (
        <div style={{ background: "#0D1117", border: `1.5px solid ${beh.color}55`, borderRadius: 14, padding: "14px 16px" }}>
            <div style={{ fontSize: 10, color: "#F59E0B", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>⏭ NEXT UP · OVERS {seg.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>{beh.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: beh.color }}>{beh.label}</span>
            </div>
            {evidence.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: betSignal ? 10 : 0 }}>
                    {evidence.map((pt, j) => (
                        <div key={j} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                            <span style={{ color: beh.color, fontSize: 9, marginTop: 2, flexShrink: 0 }}>●</span>
                            <span style={{ fontSize: 11, color: "#64748B", lineHeight: 1.45 }}>{pt}</span>
                        </div>
                    ))}
                </div>
            )}
            {betSignal && (
                <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${beh.color}` }}>
                    <div style={{ fontSize: 10, color: "#475569", marginBottom: 6, fontWeight: 600 }}>Expected</div>
                    <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>✅ {betSignal.back}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.5 }}>{betSignal.reason}</div>
                </div>
            )}
        </div>
    );
}

// ─── Compact past row ─────────────────────────────────────────────────────────
function PastRow({ seg }) {
    const { beh } = seg;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#0D1117", borderRadius: 10, border: "1px solid #1E293B" }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{beh.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: "#334155", marginBottom: 2 }}>Overs {seg.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: beh.color }}>{beh.label}</div>
            </div>
            {seg.actualRuns !== null && (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>{seg.actualRuns}r</div>
                    <div style={{ fontSize: 10, color: seg.actualWkts > 0 ? "#ef4444" : "#334155" }}>
                        {seg.actualWkts}w · {seg.actualRPO?.toFixed(1)}/ov
                    </div>
                </div>
            )}
            <span style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, flexShrink: 0 }}>✓</span>
        </div>
    );
}

// ─── Top timeline strip ───────────────────────────────────────────────────────
function BehaviourTimeline({ segments, currentOver }) {
    return (
        <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
            {segments.map((seg, i) => {
                const isActive = currentOver >= seg.start - 1 && currentOver < seg.end;
                const isPast = currentOver >= seg.end;
                return (
                    <div key={i} style={{ flex: 1, borderRadius: 8, overflow: "hidden" }}>
                        <div style={{
                            height: isActive ? 8 : 5,
                            background: seg.beh.color,
                            opacity: isPast ? 0.85 : isActive ? 1 : 0.3,
                            transition: "all 0.3s",
                        }} />
                        <div style={{ padding: "4px 2px", textAlign: "center" }}>
                            <div style={{ fontSize: 8, color: isPast || isActive ? seg.beh.color : "#334155", fontWeight: 700, lineHeight: 1.2 }}>
                                {seg.beh.short}
                            </div>
                            <div style={{ fontSize: 7, color: "#334155", marginTop: 1 }}>
                                {seg.label}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Match condition summary bar ─────────────────────────────────────────────
function ConditionBar({ pitchKey, detr, dew, humidity, temp, matchAvgRPO, venueHistory }) {
    const pitchMeta = {
        FRESH: { label: "Fresh",   color: "#22c55e" },
        WORN:  { label: "Worn",    color: "#f97316" },
        DRY:   { label: "Dry",     color: "#ef4444" },
        WET:   { label: "Damp",    color: "#60a5fa" },
        DUSTY: { label: "Dusty",   color: "#b45309" },
        GOOD:  { label: "Good",    color: "#4ade80" },
        FLAT:  { label: "Flat",    color: "#fbbf24" },
    }[pitchKey] || { label: pitchKey, color: "#94A3B8" };

    const chips = [
        { label: `Pitch: ${pitchMeta.label}`, color: pitchMeta.color },
        { label: detr >= 1.25 ? "⚠️ Pitch badly worn" : detr >= 1.1 ? "Pitch wearing out" : "Pitch in good shape", color: detr >= 1.25 ? "#ef4444" : detr >= 1.1 ? "#f59e0b" : "#22c55e" },
        dew < 0.88 && { label: "💧 Heavy dew tonight", color: "#38BDF8" },
        dew >= 0.88 && dew < 0.95 && { label: "💧 Some dew", color: "#7DD3FC" },
        humidity > 78 && { label: `${humidity}% humidity — ball swings`, color: "#a5f3fc" },
        temp > 34 && { label: `${temp}°C — hot day`, color: "#fb923c" },
        venueHistory?.match_count >= 5 && { label: `📊 ${venueHistory.name?.split(",")[0]} — ${venueHistory.match_count} matches of data`, color: "#818CF8" },
    ].filter(Boolean);

    return (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {chips.map((c, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 700, color: c.color, background: c.color + "18", padding: "3px 9px", borderRadius: 5 }}>
                    {c.label}
                </span>
            ))}
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function NoPitchData({ liveMatches, onMatchSelect }) {
    return (
        <div style={{ background: "#0A0E1A", textAlign: "center", padding: "60px 20px 40px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏟️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>No match selected</div>
            <div style={{ fontSize: 13, color: "#475569", marginBottom: 20 }}>Select a live match to see pitch behaviour analysis</div>
            {liveMatches?.filter(m => m.status === "LIVE").slice(0, 3).map(m => (
                <button key={m.id} onClick={() => onMatchSelect(m)}
                    style={{ display: "block", width: "100%", maxWidth: 340, margin: "0 auto 8px", background: C.navy, border: `1px solid ${C.navyLight}`, borderRadius: 10, padding: "10px 16px", color: C.text, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
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
        pred?.overHistory?.length,
        pred?.overHistory?.[pred?.overHistory?.length - 1]?.runs,
        pred?.overHistory?.[pred?.overHistory?.length - 1]?.wickets,
    ]);

    const currentOver = Math.floor(parseFloat(pred?.overs ?? 0));
    const matchName   = pred
        ? `${cleanTeam(pred.team1)} vs ${cleanTeam(pred.team2)}`
        : selectedMatch ? `${selectedMatch.t1} vs ${selectedMatch.t2}` : null;

    if (!pred && !selectedMatch) return <NoPitchData liveMatches={liveMatches} onMatchSelect={onMatchSelect} />;
    if (!pred) return (
        <div style={{ minHeight: "100vh", background: "#0A0E1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 13, color: "#475569" }}>Loading pitch data for {selectedMatch?.t1} vs {selectedMatch?.t2}…</div>
        </div>
    );

    const { segments, matchAvgRPO, pitchKey, detr, dew, humidity, temp } = result;

    // Detect if match is over — chase complete OR all overs done OR selectedMatch.matchEnded
    const runs    = pred?.score ?? pred?.runs ?? 0;
    const target  = pred?.target ?? 0;
    const innings = pred?.innings ?? 1;
    const overs   = parseFloat(pred?.overs ?? 0);
    const matchFmt = (pred?.matchType || "t20").toLowerCase();
    // Format-aware over limit so ODI/Test matches don't show "Match Complete" after 20 overs
    const maxOvers = matchFmt === "odi" ? 50 : matchFmt === "test" ? 90 : 20;
    const isMatchOver = (
        selectedMatch?.matchEnded ||
        selectedMatch?.status === "ENDED" ||
        (innings === 2 && target > 0 && runs >= target) ||
        overs >= maxOvers
    );

    // When match is over, treat the "current" segment as past too
    const currentSeg = isMatchOver ? null : segments.find(s => s.isCurrent);
    const nextSeg    = isMatchOver ? null : segments.find(s => s.isFuture);
    const pastSegs   = isMatchOver
        ? segments.filter(s => s.actualRuns !== null)   // show all segments with data
        : segments.filter(s => s.isPast);

    return (
        <div className="fade" style={{ minHeight: "100vh", background: "#0A0E1A", padding: "0 0 80px" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 16px" }}>

            {/* Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Pitch Behaviour</div>
                    {matchName && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{matchName}</div>}
                </div>
                {isMatchOver ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(100,116,139,0.15)", border: "1px solid #334155", borderRadius: 20, padding: "3px 10px" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: "#64748B", letterSpacing: 1 }}>FINAL</span>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 10, color: "#475569", letterSpacing: 0.8 }}>LIVE</span>
                    </div>
                )}
            </div>

            {/* Condition chips */}
            <ConditionBar pitchKey={pitchKey} detr={detr} dew={dew} humidity={humidity} temp={temp} matchAvgRPO={matchAvgRPO} venueHistory={pred?.venueHistory} />

            {/* Validated pitch score meter — headline signal */}
            <PitchScoreMeter pred={pred} />

            {/* Per-over pitch score evolution chart */}
            <PitchEvolutionChart overHistory={pred?.overHistory} />

            {/* Full-match timeline strip */}
            <BehaviourTimeline segments={segments} currentOver={currentOver} />

            {/* ODI/Test notice — pitch segments are T20-optimised */}
            {matchFmt !== "t20" && (
                <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 16 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: "#F59E0B" }}>
                        Pitch analysis is optimised for T20. Showing first 20 overs of this {matchFmt.toUpperCase()} match.
                    </span>
                </div>
            )}

            {/* ── MATCH OVER summary banner ── */}
            {isMatchOver && (
                <div style={{ background: "#0D1117", border: "1.5px solid #334155", borderRadius: 14, padding: "18px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 28 }}>🏁</span>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#94A3B8" }}>Match Complete</div>
                        <div style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>Full pitch analysis below — all overs played</div>
                    </div>
                </div>
            )}

            {/* ── CURRENT OVER — hero ── */}
            {currentSeg ? (
                <LiveCard seg={currentSeg} isMatchOver={isMatchOver} />
            ) : !isMatchOver ? (
                /* Match hasn't started or data not yet flowing */
                <div style={{ background: "#0D1117", border: "1.5px solid #1E293B", borderRadius: 14, padding: "24px", textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>
                    <div style={{ fontSize: 14, color: "#475569" }}>Waiting for live over data…</div>
                </div>
            ) : null}

            {/* ── NEXT UP ── */}
            {nextSeg && (
                <div style={{ marginTop: 12 }}>
                    <NextCard seg={nextSeg} />
                </div>
            )}

            {/* ── PAST OVERS — compact list ── */}
            {pastSegs.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
                        {isMatchOver ? "FULL MATCH BREAKDOWN" : "PAST OVERS"}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {[...pastSegs].reverse().map((seg, i) => <PastRow key={i} seg={seg} />)}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid #1E293B" }}>
                <div style={{ fontSize: 10, color: "#334155", lineHeight: 1.7 }}>
                    Pitch score (0–10) validated on 12,951 T20 matches — r=0.689 correlation with INN1 total. {pred?.venueHistory?.match_count ? `${pred.venueHistory.match_count} historical matches at this ground.` : ""} Updates every 12s.
                </div>
            </div>
        </div>
        </div>
    );
}
