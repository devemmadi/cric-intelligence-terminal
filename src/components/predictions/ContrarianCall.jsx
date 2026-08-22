/* eslint-disable */
import React from "react";
import { C } from "../shared/constants";

/**
 * "The scoreboard says one thing, the model says another."
 *
 * WHY THIS EXISTS
 * ---------------
 * The fair criticism of a live win probability is that most of the time it tells
 * you what you can already see. If a side needs 20 off 30 with eight wickets in
 * hand, everyone watching knows they are winning; printing "89%" next to that
 * adds nothing, and a reader is right to call it decoration.
 *
 * The number is only worth a viewer's attention when their own read of the
 * scoreboard would be wrong. So this card renders ONLY in that case, and stays
 * invisible the rest of the time. It is deliberately rare.
 *
 * WHAT THE "PLAIN READ" IS, AND WHAT IT IS NOT
 * -------------------------------------------
 * `plainRead()` is NOT a second prediction and must never be presented as one.
 * It is a crude stand-in for the conclusion a viewer would draw from the two
 * numbers on screen — are they ahead of the rate, and how many wickets are
 * left. It is intentionally simple, has never been backtested, and its value is
 * never displayed. Only the DIRECTION of the gap between it and the model is
 * shown. If it is ever put on screen as a percentage, it becomes an unvalidated
 * second model competing with the real one — exactly what PlayerMarkets.jsx
 * refuses to do.
 *
 * SCOPE: second innings only. A chase has an explicit target, so "what the
 * scoreboard plainly says" is a real, shared thing. In the first innings there
 * is no target and no such common reading, so there is nothing to disagree with.
 */

// Gap, in percentage points, before the disagreement is worth interrupting for.
// 15 is set so this fires on a genuine contradiction rather than ordinary
// model-vs-eyeball noise. Raise it if the card starts feeling routine — a card
// that shows every over teaches viewers to ignore it, which defeats the point.
const MIN_GAP = 15;

function plainRead(crr, rrr, wicketsLeft) {
    // Ahead of the required rate is the single thing a viewer reads first,
    // wickets in hand the second. Weights are eyeballed, not fitted: this is a
    // model of a VIEWER, not of cricket.
    const rateEdge = (crr - rrr) * 8;
    const depth = (wicketsLeft - 5) * 3;
    return Math.max(5, Math.min(95, 50 + rateEdge + depth));
}

export default function ContrarianCall({ pred, prob }) {
    if (!pred || pred.matchEnded) return null;
    if ((pred.innings || 1) !== 2) return null;

    const overs = pred.overs || 0;
    // Before this the required rate barely moves and the plain read is unstable,
    // so a "disagreement" is noise about a scoreboard nobody has read yet.
    if (overs < 4) return null;

    const crr = pred.currentRunRate || 0;
    const rrr = pred.requiredRunRate || 0;
    if (!crr || !rrr) return null;

    const wicketsLeft = 10 - (pred.wickets || 0);
    const naive = plainRead(crr, rrr, wicketsLeft);

    // `prob` is the probability for the side batting now, i.e. the chasing side,
    // which is the same side plainRead() is about — so these are comparable.
    const modelProb = typeof prob === "number" ? prob : (pred.aiProbability || 50);
    const gap = modelProb - naive;
    if (Math.abs(gap) < MIN_GAP) return null;

    const chasing = (pred.team2 || "the chasing side").split(",")[0].trim();
    const defending = (pred.team1 || "the fielding side").split(",")[0].trim();

    // gap > 0: the scoreboard looks worse for the chase than the model thinks.
    const modelFavours = gap > 0 ? chasing : defending;
    const scoreboardFavours = gap > 0 ? defending : chasing;

    const accent = gap > 0 ? C.green : C.amber;

    return (
        <div style={{
            background: `linear-gradient(135deg, ${accent}14 0%, transparent 100%)`,
            border: `1px solid ${accent}55`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 14,
        }}>
            <div style={{
                display: "flex", alignItems: "center", gap: 7, marginBottom: 7,
            }}>
                <span style={{ fontSize: 15 }}>⚡</span>
                <span style={{
                    color: accent, fontSize: 11, fontWeight: 800,
                    letterSpacing: 1, textTransform: "uppercase",
                }}>
                    Model disagrees with the scoreboard
                </span>
            </div>

            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6, fontWeight: 600 }}>
                The scoreboard reads well for <strong>{scoreboardFavours}</strong> — the
                model still makes it <strong>{modelFavours}</strong>, at{" "}
                <strong style={{ color: accent }}>{Math.round(modelProb)}%</strong> for {chasing}.
            </div>

            <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6, marginTop: 8 }}>
                {rrr > crr
                    ? `${chasing} need ${rrr.toFixed(1)} an over against ${crr.toFixed(1)} so far, with ${wicketsLeft} wickets left.`
                    : `${chasing} are scoring ${crr.toFixed(1)} an over against ${rrr.toFixed(1)} required, with ${wicketsLeft} wickets left.`}
                {" "}This is the kind of position the model is built for — when the
                rate and the wickets point in different directions.
            </div>
        </div>
    );
}
