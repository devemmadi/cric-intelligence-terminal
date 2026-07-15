/* eslint-disable */
import React, { useState, useEffect } from "react";
import { C, cleanTeam } from "../shared/constants";

const PICK_KEY = (matchId) => `ci_pick_${matchId}`;
const RECORD_KEY = "ci_pred_record"; // { wins: N, losses: N }

function getRecord() {
    try { return JSON.parse(localStorage.getItem(RECORD_KEY)) || { wins: 0, losses: 0 }; } catch { return { wins: 0, losses: 0 }; }
}
function saveRecord(r) {
    try { localStorage.setItem(RECORD_KEY, JSON.stringify(r)); } catch {}
}

function getPick(matchId) {
    try { return JSON.parse(localStorage.getItem(PICK_KEY(matchId))); } catch { return null; }
}
function savePick(matchId, data) {
    try { localStorage.setItem(PICK_KEY(matchId), JSON.stringify(data)); } catch {}
}

// Generate shareable text
function buildShareText(pickTeam, won, matchLabel) {
    if (won) return `I predicted ${pickTeam} to win ${matchLabel} — nailed it! 🎯\nLive AI win probability: cricintelligence.com 🏏`;
    return `${pickTeam} let me down in ${matchLabel}. Next time. 😤\ncricintelligence.com 🏏`;
}

export default function UserPrediction({ pred, isEnded, matchId }) {
    const t1 = pred?.team1 || "";
    const t2 = pred?.team2 || "";
    const t1Short = cleanTeam(t1);
    const t2Short = cleanTeam(t2);
    const [pick, setPick] = useState(() => getPick(matchId));
    const [resultShown, setResultShown] = useState(false);
    const [shared, setShared] = useState(false);
    const record = getRecord();

    // When match ends, record the result
    useEffect(() => {
        if (!isEnded || !pick || pick.resultRecorded) return;
        // Determine winner: if prob > 50 at end, team1 won
        const team1Won = (pred?.aiProbability ?? 50) >= 50;
        const userWon = (pick.team === t1 && team1Won) || (pick.team === t2 && !team1Won);
        const updated = { ...pick, userWon, resultRecorded: true };
        savePick(matchId, updated);
        setPick(updated);
        const rec = getRecord();
        saveRecord({ wins: rec.wins + (userWon ? 1 : 0), losses: rec.losses + (userWon ? 0 : 1) });
        setResultShown(true);
    }, [isEnded]);

    // Don't show if no teams loaded yet
    if (!t1 || !t2) return null;

    const handleShare = () => {
        const matchLabel = `${t1Short} vs ${t2Short}`;
        const text = buildShareText(pick.team === t1 ? t1Short : t2Short, pick.userWon, matchLabel);
        if (navigator.share) {
            navigator.share({ text, url: "https://cricintelligence.com" }).catch(() => {});
        } else {
            navigator.clipboard.writeText(text + "\nhttps://cricintelligence.com").then(() => setShared(true));
        }
    };

    // Accuracy %
    const total = record.wins + record.losses;
    const acc = total > 0 ? Math.round((record.wins / total) * 100) : null;

    // ── No pick yet: show the prediction buttons ──────────────────────────────
    if (!pick) {
        return (
            <div style={{ background: "rgba(74,111,212,0.08)", border: `1px solid rgba(74,111,212,0.25)`, borderRadius: 14, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.accent, letterSpacing: 1.5, marginBottom: 10 }}>WHO WINS THIS MATCH?</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[t1, t2].map((team) => (
                        <button
                            key={team}
                            onClick={() => {
                                const p = { team, prob: pred?.aiProbability ?? 50, time: Date.now(), resultRecorded: false };
                                savePick(matchId, p);
                                setPick(p);
                            }}
                            style={{
                                background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.12)`,
                                borderRadius: 10, padding: "10px 8px", color: C.text, fontWeight: 800,
                                fontSize: 13, cursor: "pointer", fontFamily: "Inter, system-ui",
                                transition: "all 0.15s",
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
                        Your record: <span style={{ color: C.green, fontWeight: 700 }}>{record.wins}W</span> <span style={{ color: C.red, fontWeight: 700 }}>{record.losses}L</span> · {acc}% accuracy
                    </div>
                )}
            </div>
        );
    }

    // ── Pick made, match still live ───────────────────────────────────────────
    const pickShort = cleanTeam(pick.team);
    const currentProb = pred?.aiProbability ?? 50;
    const pickIsTeam1 = pick.team === t1;
    const pickCurrentProb = pickIsTeam1 ? currentProb : 100 - currentProb;
    const probColor = pickCurrentProb >= 60 ? C.green : pickCurrentProb >= 40 ? C.amber : C.red;
    const probDelta = Math.round(pickCurrentProb - (pickIsTeam1 ? pick.prob : 100 - pick.prob));
    const deltaLabel = probDelta > 0 ? `+${probDelta}%` : `${probDelta}%`;
    const deltaColor = probDelta > 0 ? C.green : probDelta < 0 ? C.red : C.muted;

    // ── Match ended: show result ──────────────────────────────────────────────
    if (isEnded && pick.resultRecorded) {
        const won = pick.userWon;
        return (
            <div style={{
                background: won ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${won ? C.green : C.red}40`,
                borderRadius: 14, padding: "14px 16px", marginBottom: 14,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 20 }}>{won ? "🎯" : "😤"}</span>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: won ? C.green : C.red }}>
                            {won ? "YOU CALLED IT!" : "WRONG CALL"}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>
                            You picked <span style={{ color: C.text, fontWeight: 700 }}>{pickShort}</span>
                        </div>
                    </div>
                </div>
                {acc !== null && (
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 10 }}>
                        Record: <span style={{ color: C.green, fontWeight: 700 }}>{record.wins}W</span> <span style={{ color: C.red, fontWeight: 700 }}>{record.losses}L</span> · <span style={{ color: C.text, fontWeight: 700 }}>{acc}% accuracy</span>
                    </div>
                )}
                <button
                    onClick={handleShare}
                    style={{
                        width: "100%", padding: "8px", background: won ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.1)",
                        border: `1px solid ${won ? C.green : C.red}50`, borderRadius: 8,
                        color: won ? C.green : C.red, fontSize: 12, fontWeight: 800,
                        cursor: "pointer", fontFamily: "Inter, system-ui",
                    }}
                >
                    {shared ? "Copied! 📋" : "Share your call"}
                </button>
            </div>
        );
    }

    // ── Pick made, match ongoing ──────────────────────────────────────────────
    return (
        <div style={{ background: "rgba(74,111,212,0.06)", border: `1px solid rgba(74,111,212,0.2)`, borderRadius: 14, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 3 }}>YOUR CALL</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{pickShort}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: probColor }}>{Math.round(pickCurrentProb)}%</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: deltaColor }}>{deltaLabel} since you picked</div>
                </div>
            </div>
            {acc !== null && (
                <div style={{ marginTop: 6, fontSize: 10, color: C.muted }}>
                    Record: <span style={{ color: C.green, fontWeight: 700 }}>{record.wins}W</span> <span style={{ color: C.red, fontWeight: 700 }}>{record.losses}L</span> · {acc}% accuracy
                </div>
            )}
        </div>
    );
}
