/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { C, cleanTeam } from "../shared/constants";

const PICK_KEY = (id) => `ci_pick_${id}`;
const RECORD_KEY = "ci_pred_record";

function getRecord() {
    try { return JSON.parse(localStorage.getItem(RECORD_KEY)) || { wins: 0, losses: 0 }; }
    catch { return { wins: 0, losses: 0 }; }
}
function saveRecord(r) {
    try { localStorage.setItem(RECORD_KEY, JSON.stringify(r)); } catch {}
}
function getPick(id) {
    try { return JSON.parse(localStorage.getItem(PICK_KEY(id))); } catch { return null; }
}
function savePick(id, data) {
    try { localStorage.setItem(PICK_KEY(id), JSON.stringify(data)); } catch {}
}

// Parse actual winner from match status string like "RCB won by 6 wkts" or "CSK beat MI by 4 runs"
function parseWinner(rawStatus) {
    if (!rawStatus) return null;
    const s = rawStatus.toLowerCase().trim();
    const wonIdx = s.indexOf(" won by");
    if (wonIdx > 0) return s.substring(0, wonIdx).trim();
    const beatIdx = s.indexOf(" beat ");
    if (beatIdx > 0) return s.substring(0, beatIdx).trim();
    return null;
}

// Check if our team name is the winner — match against full name and abbreviation
function teamWon(winnerStr, teamName) {
    if (!winnerStr || !teamName) return false;
    const w = winnerStr.toLowerCase();
    const t = teamName.toLowerCase();
    const abbr = cleanTeam(teamName).toLowerCase();
    return w.includes(t) || w.includes(abbr) || t.includes(w);
}

export default function UserPrediction({ pred, prob, isEnded, rawStatus, matchId }) {
    const t1 = pred?.team1 || "";
    const t2 = pred?.team2 || "";

    // Use stable matchId — never undefined
    const stableId = matchId || pred?.id;
    const [pick, setPick] = useState(() => stableId ? getPick(stableId) : null);
    const [shared, setShared] = useState(false);
    const recordedRef = useRef(false);

    // Sync pick when matchId changes (user selects different match)
    useEffect(() => {
        if (!stableId) return;
        const stored = getPick(stableId);
        setPick(stored);
        recordedRef.current = false;
        setShared(false);
    }, [stableId]);

    // Record result when match ends — use actual status string, not AI probability
    useEffect(() => {
        if (!isEnded || !pick || pick.resultRecorded || recordedRef.current) return;
        if (!stableId) return;

        // Try to determine winner from status string
        const winner = parseWinner(rawStatus);
        let userWon = null;
        if (winner) {
            userWon = teamWon(winner, pick.team);
        }
        // Fallback: if status unclear (tied/no result), mark null (don't count either way)
        const rs = (rawStatus || "").toLowerCase();
        const noResult = rs.includes("tied") || rs.includes("no result") || rs.includes("abandoned");
        if (noResult) userWon = null;

        const updated = { ...pick, userWon, resultRecorded: true };
        savePick(stableId, updated);
        setPick(updated);
        recordedRef.current = true;

        if (userWon !== null) {
            const rec = getRecord();
            saveRecord({ wins: rec.wins + (userWon ? 1 : 0), losses: rec.losses + (userWon ? 0 : 1) });
        }
    }, [isEnded, rawStatus]);

    if (!t1 || !t2 || !stableId) return null;

    const rec = getRecord();
    const total = rec.wins + rec.losses;
    const acc = total > 0 ? Math.round((rec.wins / total) * 100) : null;

    // ── No pick yet: show buttons ─────────────────────────────────────────────
    if (!pick) {
        return (
            <div style={{ background: "rgba(74,111,212,0.08)", border: "1px solid rgba(74,111,212,0.25)", borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.accent, letterSpacing: 1.5, marginBottom: 10 }}>WHO WINS THIS MATCH?</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[t1, t2].map((team) => (
                        <button key={team}
                            onClick={() => {
                                // prob is already processed team1 win% from PredictionsTab
                                const pickProb = team === t1 ? (prob ?? 50) : (100 - (prob ?? 50));
                                const p = { team, pickProb, time: Date.now(), resultRecorded: false };
                                savePick(stableId, p);
                                setPick(p);
                            }}
                            style={{
                                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                                borderRadius: 10, padding: "12px 8px", color: C.text, fontWeight: 800,
                                fontSize: 13, cursor: "pointer", fontFamily: "Inter, system-ui", transition: "all 0.15s",
                            }}
                            onMouseOver={e => { e.currentTarget.style.background = "rgba(74,111,212,0.2)"; e.currentTarget.style.borderColor = C.accent; }}
                            onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                        >
                            {cleanTeam(team)}
                        </button>
                    ))}
                </div>
                {acc !== null && (
                    <div style={{ marginTop: 8, fontSize: 10, color: C.muted, textAlign: "center" }}>
                        Your record: <span style={{ color: C.green, fontWeight: 700 }}>{rec.wins}W</span>{" "}
                        <span style={{ color: C.red, fontWeight: 700 }}>{rec.losses}L</span> · {acc}% accuracy
                    </div>
                )}
            </div>
        );
    }

    // ── Match ended: result card ──────────────────────────────────────────────
    if (isEnded && pick.resultRecorded) {
        const won = pick.userWon;
        const noResult = won === null;
        const pickShort = cleanTeam(pick.team);
        const bgColor = noResult ? "rgba(107,114,128,0.08)" : won ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)";
        const borderColor = noResult ? C.muted : won ? C.green : C.red;
        const emoji = noResult ? "🏏" : won ? "🎯" : "😤";
        const headline = noResult ? "NO RESULT" : won ? "YOU CALLED IT!" : "WRONG CALL";
        const headlineColor = noResult ? C.muted : won ? C.green : C.red;

        const shareText = won
            ? `I predicted ${pickShort} to win — nailed it! 🎯\nLive AI win probability: cricintelligence.com 🏏`
            : `${pickShort} let me down. Next one. 😤\ncricintelligence.com 🏏`;

        const handleShare = () => {
            if (navigator.share) {
                navigator.share({ text: shareText, url: "https://cricintelligence.com" }).catch(() => {});
            } else {
                navigator.clipboard?.writeText(shareText + "\nhttps://cricintelligence.com")
                    .then(() => setShared(true))
                    .catch(() => {
                        // Fallback for browsers without clipboard API
                        const ta = document.createElement("textarea");
                        ta.value = shareText + "\nhttps://cricintelligence.com";
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand("copy");
                        document.body.removeChild(ta);
                        setShared(true);
                    });
            }
        };

        return (
            <div style={{ background: bgColor, border: `1px solid ${borderColor}40`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{emoji}</span>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: headlineColor }}>{headline}</div>
                        {!noResult && (
                            <div style={{ fontSize: 11, color: C.muted }}>
                                You picked <span style={{ color: C.text, fontWeight: 700 }}>{pickShort}</span>
                            </div>
                        )}
                    </div>
                </div>
                {acc !== null && (
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>
                        Record: <span style={{ color: C.green, fontWeight: 700 }}>{rec.wins}W</span>{" "}
                        <span style={{ color: C.red, fontWeight: 700 }}>{rec.losses}L</span>{" "}
                        · <span style={{ color: C.text, fontWeight: 700 }}>{acc}% accuracy</span>
                    </div>
                )}
                {!noResult && (
                    <button onClick={handleShare} style={{
                        width: "100%", padding: "8px",
                        background: won ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${won ? C.green : C.red}50`,
                        borderRadius: 8, color: won ? C.green : C.red,
                        fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "Inter, system-ui",
                    }}>
                        {shared ? "✅ Copied!" : "Share your call"}
                    </button>
                )}
            </div>
        );
    }

    // ── Pick made, match ongoing ──────────────────────────────────────────────
    const pickIsTeam1 = pick.team === t1;
    // prob is already team1 win% (processed, capped) from PredictionsTab
    const currentPickProb = prob != null ? (pickIsTeam1 ? prob : 100 - prob) : pick.pickProb;
    const probColor = currentPickProb >= 60 ? C.green : currentPickProb >= 40 ? C.amber : C.red;
    const delta = prob != null ? Math.round(currentPickProb - pick.pickProb) : 0;
    const deltaLabel = delta > 0 ? `+${delta}% since you picked` : delta < 0 ? `${delta}% since you picked` : "same as when you picked";
    const deltaColor = delta > 0 ? C.green : delta < 0 ? C.red : C.muted;

    return (
        <div style={{ background: "rgba(74,111,212,0.06)", border: "1px solid rgba(74,111,212,0.2)", borderRadius: 14, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 3 }}>YOUR CALL</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{cleanTeam(pick.team)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: probColor, lineHeight: 1 }}>{Math.round(currentPickProb)}%</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: deltaColor, marginTop: 2 }}>{deltaLabel}</div>
                </div>
            </div>
            {acc !== null && (
                <div style={{ marginTop: 8, fontSize: 10, color: C.muted, borderTop: `1px solid ${C.border}`, paddingTop: 6 }}>
                    Your record: <span style={{ color: C.green, fontWeight: 700 }}>{rec.wins}W</span>{" "}
                    <span style={{ color: C.red, fontWeight: 700 }}>{rec.losses}L</span> · {acc}% accuracy
                </div>
            )}
        </div>
    );
}
