/* eslint-disable */
import React, { useMemo } from "react";
import { C, cleanTeam } from "../shared/constants";

// ─── Segments ─────────────────────────────────────────────────────────────────
const SEGMENTS = [
    { label: "1–4",   start: 1,  end: 4,  phase: "POWERPLAY" },
    { label: "5–8",   start: 5,  end: 8,  phase: "POWERPLAY" },
    { label: "9–12",  start: 9,  end: 12, phase: "MIDDLE"    },
    { label: "13–16", start: 13, end: 16, phase: "MIDDLE"    },
    { label: "17–20", start: 17, end: 20, phase: "DEATH"     },
];

// ─── Pitch behaviour types ────────────────────────────────────────────────────
// Each type has: id, label, color, icon, betSignal
const BEHAVIOURS = {
    SEAM_SWING:    { id: "SEAM_SWING",    label: "Seam & Swing",       color: "#3B82F6", bg: "rgba(59,130,246,0.12)",   icon: "🌊", short: "Ball swinging" },
    SEAM_BOUNCE:   { id: "SEAM_BOUNCE",   label: "Seam Bounce",        color: "#60A5FA", bg: "rgba(96,165,250,0.12)",   icon: "⬆️", short: "Extra bounce" },
    SPIN_GRIP:     { id: "SPIN_GRIP",     label: "Spin Gripping",      color: "#A855F7", bg: "rgba(168,85,247,0.14)",   icon: "🌀", short: "Ball turning" },
    SPIN_LETHAL:   { id: "SPIN_LETHAL",   label: "Spinners Lethal",    color: "#9333EA", bg: "rgba(147,51,234,0.18)",   icon: "💫", short: "Unplayable turn" },
    DEW_FACTOR:    { id: "DEW_FACTOR",    label: "Dew Taking Over",    color: "#38BDF8", bg: "rgba(56,189,248,0.13)",   icon: "💧", short: "Ball slipping" },
    SURFACE_FLAT:  { id: "SURFACE_FLAT",  label: "Surface Flattening", color: "#22C55E", bg: "rgba(34,197,94,0.12)",    icon: "🛣️", short: "Pitch easing" },
    PITCH_WEARING: { id: "PITCH_WEARING", label: "Pitch Wearing Fast", color: "#F97316", bg: "rgba(249,115,22,0.13)",   icon: "🔥", short: "Rough forming" },
    CONTESTED:     { id: "CONTESTED",     label: "Evenly Contested",   color: "#F59E0B", bg: "rgba(245,158,11,0.12)",   icon: "⚖️", short: "Even contest" },
    UNKNOWN:       { id: "UNKNOWN",       label: "Awaiting data…",     color: "#64748B", bg: "rgba(100,116,139,0.08)",  icon: "🔍", short: "No data yet"  },
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

// ─── Core: infer behaviour FROM actual match data ─────────────────────────────
function inferBehaviour(seg, allSegs, pitchKey, detr, dew, humidity, overs) {
    const { actualRPO, actualWkts, oversPlayed, phase, i } = seg;

    // ── If we have actual data from this segment ──────────────────────────────
    if (oversPlayed >= 2) {
        const wPerOv   = (actualWkts ?? 0) / oversPlayed;   // wickets per over
        const rpo      = actualRPO ?? 0;

        // Dew: late overs + high wicket survival + scoring uptick
        if (i >= 3 && dew < 0.88) return "DEW_FACTOR";
        if (i === 4 && dew < 0.92 && rpo >= 9.0) return "DEW_FACTOR";

        // Spin lethal: middle overs, very low RPO + lots of wickets
        if (i >= 2 && i <= 3 && wPerOv >= 0.65 && rpo < 6.0) return "SPIN_LETHAL";

        // Spin gripping: middle overs, below-average scoring, wickets
        if (i >= 2 && i <= 3 && wPerOv >= 0.35 && rpo < 7.5) return "SPIN_GRIP";

        // Seam/swing: powerplay, wickets, low scoring
        if (i <= 1 && wPerOv >= 0.5 && rpo < 6.5) return "SEAM_SWING";
        if (i <= 1 && wPerOv >= 0.35 && humidity > 72) return "SEAM_SWING";

        // Seam bounce: powerplay, wickets but decent scoring
        if (i <= 1 && wPerOv >= 0.35 && rpo < 8.0) return "SEAM_BOUNCE";

        // Pitch wearing: deterioration visible + scoring drops between segments
        const prevSeg = i > 0 ? allSegs[i - 1] : null;
        if (prevSeg?.actualRPO && rpo < prevSeg.actualRPO - 2.0 && detr >= 1.1) return "PITCH_WEARING";

        // Surface flattening: scoring higher than prev + late overs
        if (prevSeg?.actualRPO && rpo > prevSeg.actualRPO + 1.5) return "SURFACE_FLAT";

        // High scoring = flat pitch
        if (rpo >= 10.0) return "SURFACE_FLAT";

        return "CONTESTED";
    }

    // ── No actual data — infer from pitch + weather + trend ──────────────────
    if (i === 0) {
        if (humidity > 80 || pitchKey === "WET") return "SEAM_SWING";
        if (pitchKey === "FRESH") return "SEAM_BOUNCE";
        if (pitchKey === "FLAT") return "SURFACE_FLAT";
        return "SEAM_BOUNCE";
    }
    if (i === 1) {
        if (pitchKey === "FLAT") return "SURFACE_FLAT";
        return "CONTESTED";
    }
    if (i === 2 || i === 3) {
        if (detr >= 1.25 || pitchKey === "DRY" || pitchKey === "DUSTY") return "SPIN_LETHAL";
        if (detr >= 1.1  || pitchKey === "WORN") return "SPIN_GRIP";
        if (pitchKey === "FLAT") return "SURFACE_FLAT";
        return "CONTESTED";
    }
    if (i === 4) {
        if (dew < 0.88) return "DEW_FACTOR";
        if (dew < 0.92 && humidity > 72) return "DEW_FACTOR";
        if (pitchKey === "FLAT") return "SURFACE_FLAT";
        return "CONTESTED";
    }
    return "UNKNOWN";
}

// ─── Evidence bullets — what actually happened / what to expect ───────────────
function buildEvidence(seg, beh, allSegs, matchAvgRPO, pitchKey, detr, dew, humidity) {
    const { actualRPO, actualWkts, oversPlayed, i } = seg;
    const points = [];

    if (oversPlayed >= 1 && actualRPO !== null) {
        // Actual scoring rate context
        if (matchAvgRPO !== null) {
            const delta = actualRPO - matchAvgRPO;
            if (delta <= -2.5)      points.push(`Scoring dried up — ${actualRPO.toFixed(1)} vs ${matchAvgRPO.toFixed(1)} match RPO`);
            else if (delta <= -1.2) points.push(`Below average scoring — ${actualRPO.toFixed(1)} RPO in this phase`);
            else if (delta >= 2.5)  points.push(`Batters exploding — ${actualRPO.toFixed(1)} vs ${matchAvgRPO.toFixed(1)} match RPO`);
            else                    points.push(`${actualRPO.toFixed(1)} RPO — on par with match average`);
        }

        // Wickets
        const wktRate = (actualWkts ?? 0) / oversPlayed;
        if (wktRate >= 0.75) points.push(`${actualWkts} wickets in ${oversPlayed} overs — collapse territory`);
        else if (wktRate >= 0.5) points.push(`${actualWkts} wickets — bowlers clearly on top`);
        else if (actualWkts === 0 && oversPlayed >= 3) points.push(`No wickets fell — batters anchored this phase`);
        else if (actualWkts > 0) points.push(`${actualWkts} wicket${actualWkts > 1 ? "s" : ""} in ${oversPlayed} overs`);

        // Trend vs previous
        const prev = i > 0 ? allSegs[i - 1] : null;
        if (prev?.actualRPO) {
            const change = actualRPO - prev.actualRPO;
            if (change < -2.5)     points.push(`Sharp drop from previous phase (${change.toFixed(1)} RPO)`);
            else if (change > 2.5) points.push(`Jumped ${change.toFixed(1)} RPO from previous phase`);
        }

        // Behaviour-specific observations
        if (beh.id === "DEW_FACTOR" && oversPlayed >= 2)
            points.push("Ball slipping in fielders' hands — misfields likely");
        if (beh.id === "SPIN_LETHAL" && oversPlayed >= 2)
            points.push("Spinners turning and gripping from rough outside off");
        if (beh.id === "SEAM_SWING" && oversPlayed >= 1)
            points.push("New ball moving both ways — openers in trouble");
    } else {
        // Future/no data — pitch + weather inference
        if (beh.id === "SEAM_SWING")   { points.push(`High humidity (${humidity}%) aiding swing movement`); points.push("New ball expected to move — keep eye on 1st 2 overs"); }
        if (beh.id === "SEAM_BOUNCE")  { points.push("Fresh pitch with good pace and carry"); points.push("Short balls could be risky — extra bounce"); }
        if (beh.id === "SPIN_GRIP")    { points.push(`Pitch deteriorating (${detr.toFixed(2)}x) — rough patches forming`); points.push("Ball expected to grip and turn from over 9"); }
        if (beh.id === "SPIN_LETHAL")  { points.push(`Severe pitch wear (${detr.toFixed(2)}x) — spinners unplayable`); points.push("Right-handers in danger from rough outside off"); }
        if (beh.id === "DEW_FACTOR")   { points.push(`Heavy dew factor (${(dew * 100).toFixed(0)}% grip loss) expected`); points.push("Spinners will lose control — pace bowlers preferred"); }
        if (beh.id === "SURFACE_FLAT") { points.push("Pitch expected to ease — batting conditions ideal"); points.push("Bowlers must hit precise lengths to stay in game"); }
        if (beh.id === "PITCH_WEARING"){ points.push(`Deterioration (${detr.toFixed(2)}x) — pitch breaking up`); points.push("Variable bounce — batters finding it tough to read"); }
        if (beh.id === "CONTESTED")    { points.push("Neither side has clear advantage at this stage"); points.push("Match situation and form will be key factor"); }
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
        : 0.25; // default ~5 wickets over 20 overs

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

    // ── Enrich each segment ───────────────────────────────────────────────────
    const segments = rawSegs.map((seg, i) => {
        const behId    = inferBehaviour(seg, rawSegs, pitchKey, detr, dew, humidity, currentOvers);
        const beh      = BEHAVIOURS[behId] || BEHAVIOURS.UNKNOWN;
        const evidence = buildEvidence(seg, beh, rawSegs, matchAvgRPO, pitchKey, detr, dew, humidity);

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
        return { ...seg, beh, evidence, betSignal, matchAvgRPO, dew };
    });

    return { segments, matchAvgRPO, pitchKey, detr, weather, dew, humidity, temp };
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
function OverDots({ seg }) {
    const hasData = seg.allOvs.some(o => o.played);
    if (!hasData) return null;
    const maxR = Math.max(...seg.allOvs.filter(o => o.played).map(o => o.runs), 1);
    return (
        <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 28, marginTop: 10 }}>
            {seg.allOvs.map((o, j) => {
                if (!o.played) {
                    return <div key={j} style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />;
                }
                const h = Math.max(4, Math.round((o.runs / maxR) * 24));
                const hasWkt = o.wickets > 0;
                const barColor = hasWkt ? "#ef4444" : o.runs >= 12 ? "#4ade80" : o.runs >= 7 ? seg.beh?.color ?? C.accent : "#475569";
                return (
                    <div key={j} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                        {hasWkt && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#ef4444" }} />}
                        <div style={{ width: "100%", height: h, borderRadius: 2, background: barColor }} title={`Over ${o.over}: ${o.runs}r ${o.wickets}w`} />
                        <span style={{ fontSize: 7, color: "#334155" }}>{o.over}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Single segment card ──────────────────────────────────────────────────────
function SegmentCard({ seg }) {
    const { beh, evidence, betSignal, isCurrent, isPast, isFuture } = seg;
    const borderColor = isCurrent ? beh.color : isPast ? "#1E293B" : "#1E2D4A";
    const opacity = isPast ? 0.65 : 1;

    return (
        <div style={{ background: "rgba(10,14,26,0.6)", border: `1.5px solid ${borderColor}`, borderRadius: 14, padding: "16px", position: "relative", opacity, transition: "all 0.2s" }}>

            {/* YOU ARE HERE */}
            {isCurrent && (
                <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: beh.color, color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 12px", borderRadius: 20, letterSpacing: 1, whiteSpace: "nowrap" }}>
                    ▶ YOU ARE HERE
                </div>
            )}

            {/* Header: phase label + behaviour */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: 1, marginBottom: 3 }}>
                        OVERS {seg.label} · {seg.phase}
                        {isPast && <span style={{ marginLeft: 6, color: "#22c55e", fontSize: 9 }}>✓ DONE</span>}
                        {isFuture && <span style={{ marginLeft: 6, color: "#F59E0B", fontSize: 9 }}>UPCOMING</span>}
                    </div>
                    {/* BIG behaviour label */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18 }}>{beh.icon}</span>
                        <span style={{ fontSize: 17, fontWeight: 800, color: beh.color, lineHeight: 1.2 }}>
                            {beh.label}
                        </span>
                    </div>
                </div>
                {/* Actual score pill if past/current */}
                {seg.actualRuns !== null && (
                    <div style={{ textAlign: "right", background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "6px 10px", minWidth: 56 }}>
                        <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1 }}>
                            {isPast ? "ACTUAL" : "SO FAR"}
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{seg.actualRuns}</div>
                        <div style={{ fontSize: 9, color: "#475569" }}>{seg.actualWkts ?? 0}w</div>
                    </div>
                )}
            </div>

            {/* Over bars */}
            <OverDots seg={{ ...seg, beh }} />

            {/* Evidence bullets */}
            {evidence.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 5 }}>
                    {evidence.map((pt, j) => (
                        <div key={j} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                            <span style={{ color: beh.color, fontSize: 10, marginTop: 1, flexShrink: 0 }}>●</span>
                            <span style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.45 }}>{pt}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Bet signal — only for current + future */}
            {betSignal && !isPast && (
                <div style={{ marginTop: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "10px 12px", borderLeft: `3px solid ${beh.color}` }}>
                    <div style={{ fontSize: 9, color: "#475569", letterSpacing: 1, marginBottom: 6, fontWeight: 700 }}>BET SIGNAL</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div>
                            <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 700, letterSpacing: 0.5 }}>BACK  </span>
                            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{betSignal.back}</span>
                        </div>
                        <div>
                            <span style={{ fontSize: 9, color: "#ef4444", fontWeight: 700, letterSpacing: 0.5 }}>FADE  </span>
                            <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{betSignal.fade}</span>
                        </div>
                    </div>
                    <div style={{ fontSize: 10, color: "#64748B", marginTop: 5, fontStyle: "italic" }}>{betSignal.reason}</div>
                </div>
            )}
        </div>
    );
}

// ─── Top timeline strip ───────────────────────────────────────────────────────
function BehaviourTimeline({ segments, currentOver }) {
    return (
        <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
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
function ConditionBar({ pitchKey, detr, dew, humidity, temp, matchAvgRPO }) {
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
        { label: `Wear: ${detr >= 1.25 ? "Heavy" : detr >= 1.1 ? "Moderate" : "Low"}`, color: detr >= 1.25 ? "#ef4444" : detr >= 1.1 ? "#f59e0b" : "#22c55e" },
        dew < 0.88 && { label: "Dew: Heavy 💧", color: "#38BDF8" },
        dew >= 0.88 && dew < 0.95 && { label: "Dew: Mild 💧", color: "#7DD3FC" },
        humidity > 78 && { label: `Humid ${humidity}%`, color: "#a5f3fc" },
        temp > 34 && { label: `Hot ${temp}°C 🥵`, color: "#fb923c" },
        matchAvgRPO && { label: `Match avg ${matchAvgRPO.toFixed(1)} RPO`, color: "#94A3B8" },
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
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
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
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: 13, color: "#475569" }}>Loading pitch data for {selectedMatch?.t1} vs {selectedMatch?.t2}…</div>
        </div>
    );

    const { segments, matchAvgRPO, pitchKey, detr, dew, humidity, temp } = result;

    return (
        <div className="fade" style={{ maxWidth: 660, margin: "0 auto", padding: "20px 16px" }}>

            {/* Title */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Pitch Behaviour</div>
                    {matchName && <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{matchName}</div>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 10, color: "#475569", letterSpacing: 0.8 }}>LIVE · UPDATES EVERY 10S</span>
                </div>
            </div>

            {/* Condition chips */}
            <ConditionBar pitchKey={pitchKey} detr={detr} dew={dew} humidity={humidity} temp={temp} matchAvgRPO={matchAvgRPO} />

            {/* Behaviour timeline strip */}
            <BehaviourTimeline segments={segments} currentOver={currentOver} />

            {/* Segment cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {segments.map((seg, i) => <SegmentCard key={i} seg={seg} />)}
            </div>

            {/* Footer */}
            <div style={{ marginTop: 18, padding: "10px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 10, border: "1px solid #1E293B" }}>
                <div style={{ fontSize: 10, color: "#334155", lineHeight: 1.7 }}>
                    Pitch behaviour inferred from over-by-over data — wicket clustering, run rate shifts, and deterioration trends.
                    Bet signals update as match data changes. Past segments show actual match figures.
                    Pitch: <b style={{ color: "#64748B" }}>{pred.pitchCondition || "—"}</b> · Detr: {(pred.deteriorationFactor ?? 1.0).toFixed(2)}x
                </div>
            </div>
        </div>
    );
}
