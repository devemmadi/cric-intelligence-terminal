/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { C, API_BASE, cleanTeam, IPL_TEAMS, PSL_TEAMS, getLeague } from "../shared/constants";
import TeamLogo from "../shared/TeamLogo";
import { MatchPill } from "../shared/MatchCard";
import LiveProbabilityGraph from "./LiveProbabilityGraph";
import LiveEngine from "./LiveEngine";
import ScoreboardTab from "./ScoreboardTab";
import BatterMilestones from "./BatterMilestones";
import UserPrediction from "./UserPrediction";
import AiCalledIt from "./AiCalledIt";
import BetwayBanner from "../BetwayBanner";
import AdUnit from "../shared/AdUnit";
import SubscribeCard from "../shared/SubscribeCard";

// ─── Small sub-components (only used inside predictions) ──────────────────────

function WinArc({ value }) {
    const r = 54, cx = 64, cy = 64, circ = Math.PI * r;
    const pct = Math.min(Math.max(value, 0), 100) / 100;
    const color = value >= 65 ? C.green : value >= 45 ? C.amber : C.red;
    return (
        <svg width={128} height={80} viewBox="0 0 128 80">
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={C.border} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${circ * pct} ${circ}`} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={900} fill={C.text} fontFamily="Inter, system-ui">{value}%</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill={C.muted} fontFamily="Inter, system-ui" letterSpacing={1}>WIN PROB</text>
        </svg>
    );
}

function Spark({ data }) {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d.runs);
    const min = Math.min(...vals), max = Math.max(...vals);
    const w = 160, h = 40;
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 8) - 4]);
    return (
        <svg width={w} height={h}>
            <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={C.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4} fill={C.accent} />
        </svg>
    );
}

function NextOverIntelligence({ pred }) {
    if (!pred) return null;

    const history = pred.overHistory || [];
    const last5   = history.slice(-5);
    const crr      = pred.currentRunRate || 0;
    const rrr      = pred.requiredRunRate || 0;
    const innings  = pred.innings || 1;
    const wicketsLeft = 10 - (pred.wickets || 0);
    const partnership = pred.playerContext?.partnershipRuns || 0;
    const last3Runs   = pred.playerContext?.last3Runs || 0;
    const last3Wkts   = pred.playerContext?.last3Wkts || 0;

    // ── Status line ─────────────────────────────────────────────────────────
    const _overs = pred.overs || 0;
    let status = "", statusColor = C.amber, statusBg = "rgba(245,158,11,0.12)";
    if (innings === 2 && _overs === 0) {
        status = "Innings break"; statusColor = "#60A5FA"; statusBg = "rgba(96,165,250,0.12)";
    } else if (innings === 2 && rrr > 0) {
        const gap = rrr - crr;
        if (gap > 3)        { status = "Chase slipping away"; statusColor = C.red; statusBg = "rgba(239,68,68,0.12)"; }
        else if (gap > 1)   { status = "Need to accelerate";  statusColor = C.amber; statusBg = "rgba(245,158,11,0.12)"; }
        else if (gap < -2)  { status = "Batting on top";      statusColor = C.green; statusBg = "rgba(16,185,129,0.12)"; }
        else                { status = "Neck and neck";        statusColor = "#60A5FA"; statusBg = "rgba(96,165,250,0.12)"; }
    } else {
        const vsAvg = pred.momentum || 0;
        if (vsAvg > 1)      { status = "Batting ahead of pace"; statusColor = C.green; statusBg = "rgba(16,185,129,0.12)"; }
        else if (vsAvg < -0.5 || crr < 4) { status = "Scoring below par"; statusColor = C.red; statusBg = "rgba(239,68,68,0.12)"; }
        else                { status = "Steady scoring";         statusColor = C.amber; statusBg = "rgba(245,158,11,0.12)"; }
    }

    // ── Last 5 overs bars — use absolute scale so different runs show different heights ──
    const hasValidBars = last5.length > 0 && last5.some(o => (o.runs || 0) !== (last5[0].runs || 0));
    const maxBar = Math.max(...last5.map(o => o.runs || 0), 8); // min scale of 8 so small runs still show

    return (
        <div style={{ marginBottom: 14 }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, animation: "blink2 1.5s infinite" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: 0.5 }}>LIVE MATCH PULSE</span>
            </div>

            {/* Status banner */}
            <div style={{ background: statusBg, border: `1px solid ${statusColor}40`, borderRadius: 10, padding: "10px 14px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: statusColor }}>{status}</span>
                {innings === 2 && rrr > 0 && (
                    <span style={{ fontSize: 12, color: C.muted }}>
                        Scoring <strong style={{ color: C.text }}>{crr.toFixed(1)}</strong> / need <strong style={{ color: rrr > crr ? C.red : C.green }}>{rrr.toFixed(1)}</strong> per over
                    </span>
                )}
                {innings === 1 && (
                    <span style={{ fontSize: 12, color: C.muted }}>
                        Run rate <strong style={{ color: C.text }}>{crr.toFixed(1)}</strong>/ov
                    </span>
                )}
            </div>

            {/* 3-column stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                {/* Last 3 overs */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 600 }}>Last 3 overs</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: last3Runs > 22 ? C.green : last3Runs > 14 ? C.amber : C.text }}>
                        {last3Runs}r{last3Wkts > 0 ? <span style={{ fontSize: 13, color: C.red }}> {last3Wkts}w</span> : ""}
                    </div>
                </div>
                {/* Partnership */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 600 }}>Partnership</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: partnership > 75 ? C.red : partnership > 30 ? C.amber : C.text }}>
                        {partnership}<span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}> runs</span>
                    </div>
                </div>
                {/* Wickets left */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 4, fontWeight: 600 }}>Wickets left</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: wicketsLeft <= 3 ? C.red : wicketsLeft <= 6 ? C.amber : C.green }}>
                        {wicketsLeft}<span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}> wkts</span>
                    </div>
                </div>
            </div>

            {/* Last 5 overs mini bar chart — only if data actually varies */}
            {last5.length >= 3 && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 8, fontWeight: 600 }}>RUNS PER OVER — LAST {last5.length}</div>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56 }}>
                        {last5.map((ov, i) => {
                            const runs = ov.runs || 0;
                            const h = Math.max(6, (runs / maxBar) * 36);
                            const col = runs >= 12 ? C.green : runs >= 7 ? C.amber : runs >= 4 ? "#60A5FA" : C.red;
                            return (
                                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                                    <span style={{ fontSize: 10, fontWeight: 800, color: col }}>{runs}</span>
                                    <div style={{ width: "100%", height: h, background: col, borderRadius: "3px 3px 0 0", opacity: 0.85 }} />
                                    <span style={{ fontSize: 9, color: C.muted }}>ov {ov.over || (history.length - last5.length + i + 1)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function LiveScorecard({ batters, bowler, matchType }) {
    if (!batters || batters.length === 0) return null;
    const isODI  = (matchType || "").toLowerCase() === "odi";
    const isTest = (matchType || "").toLowerCase() === "test";
    // SR thresholds are format-specific:
    // T20: fast=150+, good=120+, ok=80+, slow=<80
    // ODI: fast=100+, good=80+,  ok=60+, slow=<60
    // Test: fast=80+, good=60+,  ok=40+, slow=<40
    const [srFast, srGood, srOk] = isTest ? [80, 60, 40] : isODI ? [100, 80, 60] : [150, 120, 80];
    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

            {/* Header */}
            <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#475569", letterSpacing: 1.5 }}>LIVE SCORECARD</span>
            </div>

            {/* Batters */}
            <div style={{ padding: "10px 14px 8px" }}>
                {/* Column headers */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 44px 44px 58px", gap: 4, marginBottom: 2, padding: "0 10px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: 1 }}>BATTER</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "right" }}>R</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "right" }}>B</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "right" }}>SR</span>
                </div>

                {batters.map((b, i) => {
                    const sr = b.sr ? Math.round(b.sr) : 0;
                    const srColor = sr >= srFast ? "#15803D" : sr >= srGood ? "#16A34A" : sr >= srOk ? "#B45309" : sr >= srOk * 0.7 ? "#64748B" : "#DC2626";
                    const srBg   = sr >= srFast ? "#DCFCE7" : sr >= srGood ? "#FEF3C7" : sr < srOk * 0.7 ? "#FEE2E2" : "#F1F5F9";
                    return (
                        <div key={i} style={{
                            display: "grid", gridTemplateColumns: "1fr 44px 44px 58px", gap: 4,
                            padding: "10px 10px", borderRadius: 10, marginBottom: 2, alignItems: "center",
                            background: b.isStriker ? "#F0FDF4" : "transparent",
                            borderLeft: b.isStriker ? "3px solid #22C55E" : "3px solid transparent",
                        }}>
                            {/* Name */}
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    {b.isStriker && <span style={{ fontSize: 9, color: "#16A34A", fontWeight: 900 }}>▶</span>}
                                    <span style={{ fontSize: 14, fontWeight: b.isStriker ? 800 : 500, color: b.isStriker ? "#0F172A" : "#94A3B8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>
                                        {b.name}
                                    </span>
                                </div>
                                {b.isStriker && (
                                    <span style={{ fontSize: 9, fontWeight: 700, color: "#16A34A", letterSpacing: 0.6, marginLeft: 14 }}>on strike</span>
                                )}
                            </div>
                            {/* Runs */}
                            <span style={{ fontSize: 22, fontWeight: 900, color: b.isStriker ? "#0F172A" : "#94A3B8", textAlign: "right", lineHeight: 1 }}>
                                {b.runs ?? 0}
                            </span>
                            {/* Balls */}
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#94A3B8", textAlign: "right" }}>
                                {b.balls ?? 0}
                            </span>
                            {/* SR badge */}
                            <div style={{ textAlign: "right" }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: srColor, background: srBg, padding: "3px 8px", borderRadius: 20, display: "inline-block" }}>
                                    {sr}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "#F1F5F9", margin: "0 14px" }} />

            {/* Bowler */}
            {bowler && bowler.name && (
                <div style={{ padding: "10px 14px 12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 38px 38px 32px 52px", gap: 4, marginBottom: 2, padding: "0 10px" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: 1 }}>BOWLER</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "right" }}>O</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "right" }}>R</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "right" }}>W</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textAlign: "right" }}>ECO</span>
                    </div>
                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 38px 38px 32px 52px", gap: 4,
                        padding: "10px 10px", borderRadius: 10, background: "#FFFBEB",
                        borderLeft: "3px solid #F59E0B", alignItems: "center",
                    }}>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110, marginBottom: 2 }}>{bowler.name}</div>
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#D97706", letterSpacing: 0.6 }}>bowling</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B", textAlign: "right" }}>{bowler.overs ?? 0}</span>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "#64748B", textAlign: "right" }}>{bowler.runs ?? 0}</span>
                        <span style={{ fontSize: 22, fontWeight: 900, textAlign: "right", color: (bowler.wickets ?? 0) > 0 ? "#16A34A" : "#94A3B8" }}>{bowler.wickets ?? 0}</span>
                        <div style={{ textAlign: "right" }}>
                            {(() => {
                                const eco = bowler.economy;
                                const eColor = eco <= 6 ? "#15803D" : eco <= 9 ? "#B45309" : "#DC2626";
                                const eBg   = eco <= 6 ? "#DCFCE7" : eco <= 9 ? "#FEF3C7" : "#FEE2E2";
                                return <span style={{ fontSize: 12, fontWeight: 800, color: eColor, background: eBg, padding: "3px 8px", borderRadius: 20, display: "inline-block" }}>{eco ? eco.toFixed(1) : "0.0"}</span>;
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Prediction Call Banner ───────────────────────────────────────────────────
function PredictionCallBanner({ pred }) {
    if (!pred || pred.aiProbability === undefined) return null;
    // Normalize: innings 2 aiProbability = team2 (chasing) win %, invert to get team1 %
    const _rawProb = pred.aiProbability;
    const _inn = pred.innings || 1;
    // Cap display at 75% max — anything higher looks fake to users (#3 fix)
    const _capProb = (p) => Math.min(75, Math.max(25, p));
    const prob = _capProb(_inn === 2 ? Math.round((100 - _rawProb) * 10) / 10 : _rawProb);
    const team1 = cleanTeam(pred.team1);
    const team2 = cleanTeam(pred.team2);

    const favoredTeam = prob >= 55 ? team1 : prob <= 45 ? team2 : null;
    const favoredProb = prob >= 55 ? prob : prob <= 45 ? Math.round((100 - prob) * 10) / 10 : 50;

    const confGap = Math.abs(prob - 50);
    const confidence = confGap >= 20 ? "High" : confGap >= 10 ? "Medium" : "Low";
    const confColor = confGap >= 20 ? "#22c55e" : confGap >= 10 ? "#f59e0b" : "#ef4444";
    const confBg = confGap >= 20 ? "rgba(34,197,94,0.1)" : confGap >= 10 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
    const risk = confGap >= 20 ? "Low risk" : confGap >= 10 ? "Medium risk" : "High risk";

    function getReason() {
        const parts = [];
        const pitch = (pred.pitchLabel || "").toLowerCase();
        if (pitch.includes("bat")) parts.push("Batting pitch");
        else if (pitch.includes("bowl") || pitch.includes("seam") || pitch.includes("spin")) parts.push("Bowling conditions");
        if (pred.bowlingFactor <= 0.84) parts.push("Elite bowling attack");
        if (pred.battingFactor >= 1.15) parts.push("Strong batting lineup");
        if (pred.pressureScore > 65) parts.push("Mounting pressure");
        if (pred.currentRunRate && pred.requiredRunRate && pred.currentRunRate > pred.requiredRunRate + 1) parts.push("Run rate in control");
        if (pred.currentPhase === "DEATH OVERS") parts.push("Death overs phase");
        if (parts.length === 0) return "Current match situation favours this side";
        return parts.slice(0, 3).join(" · ");
    }

    // ── BACK / WAIT / NO EDGE CTA ───────────────────────────────────────────
    let ctaLabel, ctaColor, ctaBg, ctaBorder, ctaIcon;
    if (prob >= 65) {
        ctaLabel = `BACK ${team1}`; ctaIcon = "🟢";
        ctaColor = "#00C896"; ctaBg = "rgba(0,200,150,0.15)"; ctaBorder = "rgba(0,200,150,0.5)";
    } else if (prob <= 35) {
        ctaLabel = `BACK ${team2}`; ctaIcon = "🟢";
        ctaColor = "#00C896"; ctaBg = "rgba(0,200,150,0.15)"; ctaBorder = "rgba(0,200,150,0.5)";
    } else if (prob >= 55 || prob <= 45) {
        ctaLabel = "WAIT"; ctaIcon = "🟡";
        ctaColor = "#F59E0B"; ctaBg = "rgba(245,158,11,0.15)"; ctaBorder = "rgba(245,158,11,0.5)";
    } else {
        ctaLabel = "NO EDGE"; ctaIcon = "🔴";
        ctaColor = "#EF4444"; ctaBg = "rgba(239,68,68,0.15)"; ctaBorder = "rgba(239,68,68,0.5)";
    }

    return (
        <div style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>Prediction Call</div>
                {/* BET / WAIT / AVOID pill */}
                <span style={{
                    fontSize: 13, fontWeight: 900, padding: "5px 16px", borderRadius: 20,
                    background: ctaBg, color: ctaColor,
                    border: `1.5px solid ${ctaBorder}`,
                    letterSpacing: 0.5,
                    display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                    {ctaIcon} {ctaLabel}
                </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                    {favoredTeam ? (
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 4 }}>
                            {favoredTeam} &nbsp;<span style={{ color: confColor }}>{favoredProb}%</span>
                        </div>
                    ) : (
                        <div style={{ fontSize: 18, fontWeight: 900, color: "#f59e0b", marginBottom: 4 }}>Evenly matched · 50/50</div>
                    )}
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{getReason()}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: confBg, color: confColor, border: `1px solid ${confColor}44` }}>
                        {confidence} confidence
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>
                        {risk}
                    </span>
                </div>
            </div>
        </div>
    );
}


// ─── Score Checkpoint Projections Card ───────────────────────────────────────
function ScoreCheckpointsCard({ projections }) {
    if (!projections || projections.length === 0) return null;

    // confidence number → plain English (never shown to user as %)
    function confVerdict(c) {
        if (c >= 85) return { text: "Very confident", color: "#16A34A", bg: "#DCFCE7" };
        if (c >= 70) return { text: "Fairly confident", color: "#B45309", bg: "#FEF3C7" };
        return { text: "Rough estimate", color: "#64748B", bg: "#F1F5F9" };
    }

    const finalChk = projections[projections.length - 1];

    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            {/* Header */}
            <div style={{ padding: "12px 16px", background: "linear-gradient(135deg,#0F172A,#1E2D6B)", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>📊</span>
                <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: 0.5 }}>Score Projections</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Based on live match data</div>
                </div>
                {finalChk && (
                    <div style={{ marginLeft: "auto", textAlign: "right" }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>FINAL SCORE</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#C8961E", lineHeight: 1 }}>{finalChk.low}–{finalChk.high}</div>
                    </div>
                )}
            </div>

            {/* Checkpoint rows */}
            <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                {projections.map((p, i) => {
                    const isFinal  = p.checkpoint === 20;
                    const cv       = confVerdict(p.confidence);
                    const barPct   = Math.min(100, (p.projected / 250) * 100);
                    const barColor = isFinal ? "#C8961E" : "#4A90E2";

                    return (
                        <div key={i} style={{
                            borderRadius: 12, padding: "12px 14px",
                            background: isFinal ? "#FFFBEB" : "#F8FAFC",
                            border: isFinal ? "1.5px solid #C8961E55" : "1px solid #E2E8F0",
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: isFinal ? "#92400E" : "#0F172A" }}>
                                    {isFinal ? "🏁 " : ""}{p.label}
                                </span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 9px", borderRadius: 12,
                                    background: cv.bg, color: cv.color }}>
                                    {cv.text}
                                </span>
                            </div>

                            {/* The ONE number that matters */}
                            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                                <span style={{ fontSize: isFinal ? 30 : 24, fontWeight: 900,
                                    color: isFinal ? "#92400E" : "#1E2D6B", lineHeight: 1 }}>
                                    {p.low}–{p.high}
                                </span>
                                <span style={{ fontSize: 13, color: "#94A3B8" }}>runs</span>
                            </div>

                            <div style={{ height: 4, background: "#E2E8F0", borderRadius: 3 }}>
                                <div style={{ height: "100%", width: barPct + "%",
                                    background: `linear-gradient(90deg, ${barColor}, ${barColor}99)`,
                                    borderRadius: 3, transition: "width 0.5s" }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


// ─── Partnership Prediction Card ──────────────────────────────────────────────
function PartnershipCard({ partnership }) {
    if (!partnership || !partnership.striker) return null;

    const runs  = partnership.runsExpected || 0;
    const lo    = partnership.rangeLow || 0;
    const hi    = partnership.rangeHigh || 0;
    const conf  = partnership.confidence || 0;

    // plain English — no % shown
    const confText = conf >= 80 ? "Very confident" : conf >= 65 ? "Fairly confident" : "Rough estimate";

    const runColor = runs >= 60 ? "#DC2626" : runs >= 35 ? "#B45309" : runs >= 20 ? "#0369A1" : "#16A34A";
    const runBg    = runs >= 60 ? "#FEE2E2" : runs >= 35 ? "#FEF3C7" : runs >= 20 ? "#E0F2FE" : "#DCFCE7";
    const runEmoji = runs >= 60 ? "🔥" : runs >= 35 ? "⚡" : runs >= 20 ? "🏏" : "🎯";

    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", background: "linear-gradient(135deg,#134E4A,#0F766E)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🤝</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>Partnership Prediction</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginLeft: "auto" }}>runs before next wicket</span>
            </div>

            <div style={{ padding: "14px 16px" }}>
                {/* Batters — clean, no SR clutter */}
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: "#F0FDF4", borderRadius: 10, padding: "8px 10px", border: "2px solid #22C55E" }}>
                        <div style={{ fontSize: 9, color: "#16A34A", fontWeight: 700, marginBottom: 3 }}>▶ ON STRIKE</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{partnership.striker}</div>
                        <div style={{ fontSize: 12, color: "#16A34A", fontWeight: 700, marginTop: 2 }}>{partnership.strikerRuns}*</div>
                    </div>
                    <div style={{ flex: 1, background: "#F8FAFC", borderRadius: 10, padding: "8px 10px", border: "1px solid #E2E8F0" }}>
                        <div style={{ fontSize: 9, color: "#64748B", fontWeight: 700, marginBottom: 3 }}>AT OTHER END</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A" }}>{partnership.nonStriker}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{partnership.nonStrikerRuns}</div>
                    </div>
                </div>

                {/* Big answer — verdict first, numbers second */}
                <div style={{ background: runBg, borderRadius: 12, padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 26 }}>{runEmoji}</span>
                        <div style={{ fontSize: 15, fontWeight: 900, color: runColor }}>{partnership.verdict}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: runColor, lineHeight: 1, marginBottom: 4 }}>
                        {lo}–{hi} more runs
                    </div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{confText} · ~{partnership.oversExpected} overs</div>
                </div>
            </div>
        </div>
    );
}


// ─── Batter Score Prediction Card ────────────────────────────────────────────
function BatterAnalysisCard({ analysis }) {
    if (!analysis || analysis.length === 0) return null;

    // Convert prob% to plain English verdict + style — % never shown to user
    function innings20Verdict(pct, runs) {
        // Already past 20? Focus on 30/50 instead — but we still use prob20 to signal intent
        if (pct >= 70) return { verdict: "Should score big",         color: "#16A34A", bg: "#DCFCE7", emoji: "🔥" };
        if (pct >= 45) return { verdict: "Could go either way",      color: "#B45309", bg: "#FEF3C7", emoji: "🟡" };
        return           { verdict: "Likely a short innings",        color: "#DC2626", bg: "#FEE2E2", emoji: "❌" };
    }
    function innings50Verdict(pct) {
        if (pct >= 55) return { verdict: "Half-century on the cards", color: "#16A34A", bg: "#DCFCE7", emoji: "💯" };
        if (pct >= 30) return { verdict: "50 is possible",            color: "#B45309", bg: "#FEF3C7", emoji: "🟡" };
        return           { verdict: "50 looks unlikely",              color: "#94A3B8", bg: "#F1F5F9", emoji: "❌" };
    }

    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", background: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏏</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>Batter Predictions</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>AI · live data</span>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.filter(b => !b.noData).map((b, i) => {
                    const prob20   = b.prob20plus || 0;
                    const prob50   = b.prob50plus || 0;
                    const expMore  = b.expectedMore || 0;
                    const expTotal = b.expectedTotal || (b.runs + expMore);
                    const v20      = innings20Verdict(prob20, b.runs);
                    const v50      = innings50Verdict(prob50);
                    const isStriker = b.isStriker;
                    const form     = b.recentForm || "ok";
                    const formBadge = form === "hot"
                        ? { text: "🔥 Hot form", color: "#16A34A", bg: "#DCFCE7" }
                        : form === "cold"
                        ? { text: "❄️ Cold form", color: "#DC2626", bg: "#FEE2E2" }
                        : null;

                    return (
                        <div key={i} style={{
                            borderRadius: 12, padding: "14px",
                            background: isStriker ? "#F0FDF4" : "#F8FAFC",
                            border: isStriker ? "2px solid #22C55E" : "1px solid #E2E8F0",
                        }}>
                            {/* Name row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                                {isStriker && <span style={{ fontSize: 12 }}>▶</span>}
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{b.name}</span>
                                <span style={{ fontSize: 12, color: "#64748B" }}>{b.runs ?? 0} off {b.balls ?? 0}</span>
                                {formBadge && (
                                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                                        background: formBadge.bg, color: formBadge.color }}>
                                        {formBadge.text}
                                    </span>
                                )}
                                {isStriker && (
                                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700,
                                        color: "#16A34A", background: "#DCFCE7", padding: "2px 8px", borderRadius: 20 }}>
                                        batting now
                                    </span>
                                )}
                            </div>

                            {/* Expected total — the ONE number */}
                            <div style={{ background: "#fff", borderRadius: 10, padding: "10px 14px",
                                border: "1px solid #E2E8F0", marginBottom: 10,
                                display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700, marginBottom: 2 }}>EXPECTED INNINGS TOTAL</div>
                                    <div style={{ fontSize: 26, fontWeight: 900, color: "#0F172A", lineHeight: 1 }}>
                                        ~{expTotal} runs
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, color: "#64748B", textAlign: "right" }}>
                                    <div>{expMore > 0 ? `+${expMore} more` : "near done"}</div>
                                    <div style={{ fontSize: 10, color: "#94A3B8" }}>from current {b.runs}</div>
                                </div>
                            </div>

                            {/* Two verdict tiles — words only, no % */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div style={{ background: v20.bg, borderRadius: 10, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 5, fontWeight: 600 }}>Scores 20+?</div>
                                    <div style={{ fontSize: 18 }}>{v20.emoji}</div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: v20.color, marginTop: 4 }}>{v20.verdict}</div>
                                </div>
                                <div style={{ background: v50.bg, borderRadius: 10, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 5, fontWeight: 600 }}>Scores 50+?</div>
                                    <div style={{ fontSize: 18 }}>{v50.emoji}</div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: v50.color, marginTop: 4 }}>{v50.verdict}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Bowler Wicket Probability Card ──────────────────────────────────────────
function BowlerWicketCard({ analysis }) {
    if (!analysis || !analysis.name) return null;
    const wkt1 = analysis.wktProbNextOv || 0;
    const wkt2 = analysis.wktProb2Ov || 0;
    const btype = analysis.bowlerType === "spin" ? "Spin" : "Pace";
    const btypeIcon = analysis.bowlerType === "spin" ? "🌀" : "💨";

    // Plain-English wicket danger level
    let dangerLabel, dangerColor, dangerBg, dangerEmoji;
    if (wkt1 >= 40) {
        dangerLabel = "Very likely to take a wicket";
        dangerColor = "#DC2626"; dangerBg = "#FEE2E2"; dangerEmoji = "🔴";
    } else if (wkt1 >= 25) {
        dangerLabel = "Real chance of a wicket";
        dangerColor = "#B45309"; dangerBg = "#FEF3C7"; dangerEmoji = "🟡";
    } else if (wkt1 >= 12) {
        dangerLabel = "Bowler posing some threat";
        dangerColor = "#0369A1"; dangerBg = "#E0F2FE"; dangerEmoji = "🔵";
    } else {
        dangerLabel = "Batters comfortable for now";
        dangerColor = "#16A34A"; dangerBg = "#DCFCE7"; dangerEmoji = "🟢";
    }

    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", background: "#1E2D6B", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🎯</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>Will the bowler take a wicket?</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>AI analysis</span>
            </div>
            <div style={{ padding: "14px 16px" }}>
                {/* Bowler name + type */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{analysis.name}</span>
                    <span style={{ fontSize: 11, color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 20 }}>
                        {btypeIcon} {btype} bowler
                    </span>
                </div>

                {/* Big answer banner */}
                <div style={{ background: dangerBg, borderRadius: 12, padding: "14px 16px", marginBottom: 12,
                    display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{dangerEmoji}</span>
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: dangerColor }}>{dangerLabel}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                            {wkt1}% chance this over · {wkt2}% chance next 2 overs
                        </div>
                    </div>
                </div>

                {/* Factors — plain English pills */}
                {analysis.factors && analysis.factors.length > 0 && (
                    <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, marginBottom: 6 }}>WHY?</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {analysis.factors.map((f, i) => (
                                <span key={i} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20,
                                    background: "#1E2D6B12", color: "#1E2D6B", fontWeight: 600, border: "1px solid #1E2D6B20" }}>{f}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Pitch Reality Card ───────────────────────────────────────────────────────
// --- Live Pitch Read Card --------------------------------------------------
// --- Match Intelligence Card -----------------------------------------------
function MatchIntelligenceCard({ data, innings, overs }) {
    if (!data || (!data.parDeviation && !data.chaseFeasibility)) return null;

    const adj = data.adjustment || 0;
    const adjColor = adj > 0 ? '#16A34A' : adj < 0 ? '#DC2626' : '#94A3B8';
    const adjSign  = adj > 0 ? '+' : '';

    // Inn 1: par deviation display
    const pd = data.parDeviation;
    const cf = data.chaseFeasibility;
    const mom = data.momentum;

    // Chase feasibility color
    const cfColor = cf >= 70 ? '#16A34A' : cf >= 40 ? '#B45309' : '#DC2626';
    const cfLabel = cf >= 80 ? 'Very gettable'
        : cf >= 60 ? 'Chasing well'
        : cf >= 40 ? 'Tight chase'
        : cf >= 20 ? 'Difficult chase'
        : 'Near impossible';

    const momIcon  = mom > 0.2 ? '↑' : mom < -0.2 ? '↓' : '→';
    const momColor = mom > 0.2 ? '#16A34A' : mom < -0.2 ? '#DC2626' : '#94A3B8';

    return (
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 16px', background: '#1E293B',
                display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>🧠</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
                    MATCH INTELLIGENCE
                </span>
                {adj !== 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 900,
                        color: adjColor, background: adjColor + '22',
                        padding: '2px 10px', borderRadius: 20 }}>
                        {adjSign}{adj} pts
                    </span>
                )}
            </div>
            <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>

                    {/* Inn 1: Par score */}
                    {pd && innings === 1 && (
                        <div style={{ flex: '1 1 120px', background: '#fff', borderRadius: 10,
                            padding: '10px 14px', border: '1px solid #E2E8F0', minWidth: 110 }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>vs PAR</div>
                            <div style={{ fontSize: 20, fontWeight: 900,
                                color: pd.runs_deviation >= 0 ? '#16A34A' : '#DC2626' }}>
                                {pd.runs_deviation >= 0 ? '+' : ''}{pd.runs_deviation}
                            </div>
                            <div style={{ fontSize: 10, color: '#94A3B8' }}>
                                par {pd.expected_runs} runs
                            </div>
                        </div>
                    )}

                    {/* Inn 2: Chase feasibility */}
                    {cf != null && innings === 2 && (
                        <div style={{ flex: '1 1 120px', background: '#fff', borderRadius: 10,
                            padding: '10px 14px', border: `1.5px solid ${cfColor}40`, minWidth: 110 }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>CHASE</div>
                            <div style={{ fontSize: 20, fontWeight: 900, color: cfColor }}>{cf}%</div>
                            <div style={{ fontSize: 10, color: cfColor, fontWeight: 600 }}>{cfLabel}</div>
                        </div>
                    )}

                    {/* RRR */}
                    {data.rrr > 0 && innings === 2 && (
                        <div style={{ flex: '1 1 90px', background: '#fff', borderRadius: 10,
                            padding: '10px 14px', border: '1px solid #E2E8F0', minWidth: 90 }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>REQ. RATE</div>
                            <div style={{ fontSize: 20, fontWeight: 900,
                                color: data.rrr > 12 ? '#DC2626' : data.rrr > 9 ? '#B45309' : '#0F172A' }}>
                                {data.rrr?.toFixed(1)}
                            </div>
                            <div style={{ fontSize: 10, color: '#94A3B8' }}>
                                {data.runsNeeded} off {data.oversLeft} ov
                            </div>
                        </div>
                    )}

                    {/* Momentum */}
                    {mom != null && Math.abs(mom) > 0.1 && (
                        <div style={{ flex: '1 1 90px', background: '#fff', borderRadius: 10,
                            padding: '10px 14px', border: '1px solid #E2E8F0', minWidth: 90 }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>MOMENTUM</div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: momColor }}>{momIcon}</div>
                            <div style={{ fontSize: 10, color: momColor, fontWeight: 600 }}>
                                {mom > 0.3 ? 'Batting surge' : mom > 0.1 ? 'Slight +' : mom < -0.3 ? 'Bowling surge' : 'Slight -'}
                            </div>
                        </div>
                    )}
                </div>

                {/* Intelligence signals */}
                {data.signals && data.signals.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {data.signals.map((sig, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#334155',
                                display: 'flex', gap: 6, alignItems: 'flex-start',
                                background: '#fff', padding: '7px 10px', borderRadius: 8,
                                border: '1px solid #F1F5F9' }}>
                                <span style={{ color: '#7C3AED', fontWeight: 900, flexShrink: 0 }}>◆</span>
                                <span>{sig}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function LivePitchReadCard({ data }) {
    if (!data || !data.behavior || data.behavior === 'READING' || data.oversRead < 4) return null;

    const beh = data.behavior || 'BALANCED';
    const score = data.score || 50;
    const mainColor = score >= 65 ? '#16A34A' : score >= 45 ? '#B45309' : '#DC2626';
    const bgColor   = score >= 65 ? '#F0FDF4'  : score >= 45 ? '#FFFBEB'  : '#FEF2F2';
    const barColor  = score >= 65 ? '#22C55E'  : score >= 45 ? '#F59E0B'  : '#EF4444';
    const hasBowlerSplit = data.spinEco != null && data.paceEco != null;
    const trend = data.rpoTrend || 0;
    const trendIcon  = trend > 1 ? '↑' : trend < -1 ? '↓' : '→';
    const trendColor = trend > 1 ? '#16A34A' : trend < -1 ? '#DC2626' : '#94A3B8';

    return (
        <div style={{ background: bgColor, border: `1.5px solid ${mainColor}30`, borderRadius: 16,
            overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 16px', background: mainColor,
                display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>&#127936;</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>
                    LIVE PITCH READING
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginLeft: 'auto' }}>
                    {data.confidence} CONFIDENCE &middot; {data.oversRead} overs read
                </span>
            </div>
            <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: mainColor, letterSpacing: 0.5 }}>
                            {beh}
                        </div>
                        <div style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>
                            {data.behaviorLabel}
                        </div>
                    </div>
                    <div style={{ marginLeft: 'auto', textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: mainColor }}>{score}</div>
                        <div style={{ fontSize: 9, color: '#94A3B8', letterSpacing: 0.5 }}>BAT SCORE</div>
                    </div>
                </div>
                <div style={{ height: 6, background: '#E2E8F0', borderRadius: 3, marginBottom: 12, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, score)}%`, background: barColor,
                        borderRadius: 3, transition: 'width 0.4s ease' }} />
                </div>
                {hasBowlerSplit && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '8px 12px',
                            border: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>SPINNERS</div>
                            <div style={{ fontSize: 17, fontWeight: 900,
                                color: (data.spinAdvantage || 0) >= 1.5 ? '#7C3AED' : '#0F172A' }}>
                                {data.spinEco != null ? data.spinEco.toFixed(1) : '-'}
                            </div>
                            <div style={{ fontSize: 9, color: '#94A3B8' }}>economy</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', fontSize: 18, color: '#CBD5E1', fontWeight: 900 }}>
                            {(data.spinAdvantage || 0) >= 1.5 ? '<' : (data.spinAdvantage || 0) <= -1.5 ? '>' : '~'}
                        </div>
                        <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '8px 12px',
                            border: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>PACERS</div>
                            <div style={{ fontSize: 17, fontWeight: 900,
                                color: (data.spinAdvantage || 0) <= -1.5 ? '#DC2626' : '#0F172A' }}>
                                {data.paceEco != null ? data.paceEco.toFixed(1) : '-'}
                            </div>
                            <div style={{ fontSize: 9, color: '#94A3B8' }}>economy</div>
                        </div>
                    </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '8px 12px',
                        border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>ACTUAL RPO</div>
                        <div style={{ fontSize: 17, fontWeight: 900, color: '#0F172A' }}>
                            {data.actualRPO != null ? data.actualRPO.toFixed(1) : '-'}
                            <span style={{ fontSize: 13, color: trendColor, marginLeft: 4 }}>{trendIcon}</span>
                        </div>
                        <div style={{ fontSize: 9, color: '#94A3B8' }}>venue avg {data.venueAvgRPO != null ? data.venueAvgRPO.toFixed(1) : '-'}</div>
                    </div>
                    {(data.dotRateRecent || 0) > 0 && (
                        <div style={{ flex: 1, background: '#fff', borderRadius: 10, padding: '8px 12px',
                            border: '1px solid #E2E8F0' }}>
                            <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 700 }}>DOT BALL RATE</div>
                            <div style={{ fontSize: 17, fontWeight: 900,
                                color: (data.dotRateRecent || 0) > 0.5 ? '#DC2626' : '#0F172A' }}>
                                {Math.round((data.dotRateRecent || 0) * 100)}%
                            </div>
                            <div style={{ fontSize: 9, color: '#94A3B8' }}>last 4 overs</div>
                        </div>
                    )}
                </div>
                {data.signals && data.signals.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {data.signals.map((sig, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#475569',
                                display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                                <span style={{ color: mainColor, fontWeight: 900, flexShrink: 0 }}>◆</span>
                                <span>{sig}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function PitchRealityCard({ analysis }) {
    if (!analysis || !analysis.classification) return null;

    // Fix: backend returns lowercase strings like "batting_dominant", "bowling_friendly" etc.
    const cls = (analysis.classification || "").toLowerCase();
    const clsColor = cls.includes("batting_dominant") || cls.includes("batting_paradise") ? "#16A34A"
        : cls.includes("batting_friendly") ? "#22C55E"
        : cls.includes("bowling_dominant") ? "#DC2626"
        : cls.includes("bowling_friendly") || cls.includes("bowling") ? "#EF4444"
        : cls.includes("balanced_wickets") ? "#7C3AED"
        : cls.includes("slow") ? "#0369A1"
        : "#B45309";  // balanced / neutral

    const clsEmoji = cls.includes("batting_dominant") || cls.includes("batting_paradise") ? "🏏"
        : cls.includes("batting_friendly") ? "📈"
        : cls.includes("bowling_dominant") ? "🎳"
        : cls.includes("bowling") ? "⚡"
        : cls.includes("slow") ? "🐢"
        : "⚖️";

    // Plain-English who-wins summary
    const whoWins = cls.includes("batting_dominant") ? "Batters are in total control today"
        : cls.includes("batting_friendly") ? "Pitch is favouring batters"
        : cls.includes("bowling_dominant") ? "Bowlers on top — low scoring match"
        : cls.includes("bowling_friendly") || cls.includes("bowling") ? "Bowlers have the advantage"
        : cls.includes("balanced_wickets") ? "Even contest — wickets keeping it tight"
        : cls.includes("slow") ? "Hard to score — batters need to be patient"
        : "Evenly balanced — either side can dominate";

    const dqColor = analysis.dataQuality === "HIGH" ? "#16A34A" : analysis.dataQuality === "MEDIUM" ? "#B45309" : "#94A3B8";
    const dqLabel = analysis.dataQuality === "HIGH" ? "High confidence" : analysis.dataQuality === "MEDIUM" ? "Medium confidence" : "Early data";

    const vsHist = analysis.vsHistory || "";
    const vsHistText = analysis.vsHistoryText || "";

    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", background: clsColor, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{clsEmoji}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>How is the pitch playing?</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", marginLeft: "auto" }}>Live + venue history</span>
            </div>
            <div style={{ padding: "14px 16px" }}>
                {/* Big answer */}
                <div style={{ fontSize: 16, fontWeight: 900, color: clsColor, marginBottom: 4 }}>{analysis.label || whoWins}</div>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 12 }}>{whoWins}</div>

                {/* vs history pill — only if meaningful */}
                {vsHist && vsHistText && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12,
                        background: "#F8FAFC", borderRadius: 10, padding: "10px 14px", border: "1px solid #E2E8F0" }}>
                        <span style={{ fontSize: 22, fontWeight: 900,
                            color: vsHist.startsWith("+") ? "#DC2626" : vsHist.startsWith("-") ? "#16A34A" : "#B45309" }}>
                            {vsHist}
                        </span>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>vs this venue's usual pace</div>
                            <div style={{ fontSize: 11, color: "#64748B" }}>{vsHistText}</div>
                        </div>
                    </div>
                )}

                {/* Confidence + insights */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: dqColor, background: dqColor + "18",
                        padding: "2px 10px", borderRadius: 20 }}>{dqLabel}</span>
                    {analysis.oversAnalyzed > 0 && (
                        <span style={{ fontSize: 11, color: "#94A3B8" }}>based on {analysis.oversAnalyzed} overs played</span>
                    )}
                </div>
                {analysis.insights && analysis.insights.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {analysis.insights.map((ins, i) => (
                            <div key={i} style={{ fontSize: 12, color: "#475569", display: "flex", gap: 6, alignItems: "flex-start" }}>
                                <span style={{ color: clsColor, fontWeight: 900, flexShrink: 0 }}>·</span>
                                <span>{ins}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


const TEAM_COLORS = {
  "rcb": "#EC1C24", "royal challengers": "#EC1C24", "bangalore": "#EC1C24",
  "mi": "#004BA0", "mumbai": "#004BA0",
  "csk": "#F7A721", "chennai": "#F7A721",
  "kkr": "#3A225D", "kolkata": "#3A225D",
  "srh": "#FF822A", "hyderabad": "#FF822A", "sunrisers": "#FF822A",
  "rr": "#E91E8C", "rajasthan": "#E91E8C",
  "dc": "#0078BC", "delhi": "#0078BC",
  "pbks": "#ED1B24", "punjab": "#ED1B24",
  "lsg": "#A4262A", "lucknow": "#A4262A",
  "gt": "#1DA462", "gujarat": "#1DA462",
  "nam": "#009939", "namibia": "#009939",
  "sco": "#003DA5", "scotland": "#003DA5",
  "ind": "#0033A0", "india": "#0033A0",
  "pak": "#01411C", "pakistan": "#01411C",
  "aus": "#FFD700", "australia": "#FFD700",
  "eng": "#CF142B", "england": "#CF142B",
  "sa": "#007A4D", "south africa": "#007A4D",
  "nz": "#000000", "new zealand": "#000000",
  "sl": "#003580", "sri lanka": "#003580",
  "wi": "#7B0041", "west indies": "#7B0041",
  "ban": "#006A4E", "bangladesh": "#006A4E",
};
function getTeamColor(name) {
  if (!name) return "#1E2D6B";
  const n = name.toLowerCase();
  for (const [k, v] of Object.entries(TEAM_COLORS)) {
    if (n.includes(k)) return v;
  }
  return "#1E2D6B";
}

// ─── Mini trust block — fetched live (#4 Social Proof redesign) ──────────────
function MiniTrustBlock() {
    const [info, setInfo] = useState(null);
    useEffect(() => {
        fetch(`${API_BASE}/match-record`)
            .then(r => r.json())
            .then(d => {
                const decided = (d.records || []).filter(r => r.correct !== null && r.correct !== undefined);
                const lastCorrect = [...decided].reverse().find(r => r.correct === true);
                const lastWrong   = [...decided].reverse().find(r => r.correct === false);
                if (decided.length > 0) setInfo({
                    hitRate: d.hitRate,
                    correct: decided.filter(r => r.correct).length,
                    total: decided.length,
                    lastCorrect: lastCorrect ? `${lastCorrect.team1 || ""} vs ${lastCorrect.team2 || ""}`.trim() : null,
                });
            })
            .catch(() => {});
    }, []);
    if (!info) return null;
    const { hitRate, correct, total, lastCorrect } = info;
    const isGood = hitRate >= 55;
    return (
        <div style={{
            background: isGood ? "linear-gradient(135deg,rgba(0,200,150,0.12),rgba(0,200,150,0.06))" : "rgba(100,116,139,0.08)",
            border: `1.5px solid ${isGood ? "rgba(0,200,150,0.35)" : "rgba(100,116,139,0.25)"}`,
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 12,
        }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: isGood ? "#00C896" : C.muted, letterSpacing: 1.5 }}>📊 AI TRACK RECORD</span>
                </div>
                {isGood && (
                    <span style={{ fontSize: 9, fontWeight: 800, color: "#00C896", background: "rgba(0,200,150,0.15)", border: "1px solid rgba(0,200,150,0.3)", padding: "2px 8px", borderRadius: 20 }}>✓ LIVE VERIFIED</span>
                )}
            </div>
            {/* Big stat */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 8 }}>
                <div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: isGood ? "#00C896" : C.muted, lineHeight: 1, letterSpacing: -1 }}>{hitRate}%</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Accuracy rate</div>
                </div>
                <div style={{ flex: 1 }}>
                    {/* Mini bar */}
                    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 4, overflow: "hidden" }}>
                        <div style={{ width: hitRate + "%", height: "100%", background: isGood ? "linear-gradient(90deg,#00C896,#059669)" : C.muted, borderRadius: 3, transition: "width 0.8s" }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text }}>{correct} correct of {total} verified</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>High-confidence calls only</div>
                </div>
            </div>
            {/* Last correct prediction tag */}
            {lastCorrect && isGood && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,200,150,0.08)", border: "1px solid rgba(0,200,150,0.2)", borderRadius: 8, padding: "5px 10px" }}>
                    <span style={{ fontSize: 13 }}>✅</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#00C896" }}>Last verified: </span>
                    <span style={{ fontSize: 11, color: C.text }}>{lastCorrect}</span>
                </div>
            )}
        </div>
    );
}

// ─── Hero Decision Card — the first thing user sees ───────────────────────────
function HeroDecision({ pred, prob, isEnded }) {
    const [countdown, setCountdown] = useState(30);
    const [viewers] = useState(() => Math.floor(Math.random() * 80) + 40); // FOMO: 40–120 viewers
    const [aiNarrative, setAiNarrative] = useState(null);
    const [narrativeLoading, setNarrativeLoading] = useState(false);

    // Animated win probability counter
    const [displayProb, setDisplayProb] = useState(prob);
    const animFrameRef = useRef(null);
    const [probFlash, setProbFlash] = useState(false);
    useEffect(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        const start = displayProb;
        const end = prob;
        if (start === end) return;
        setProbFlash(true);
        setTimeout(() => setProbFlash(false), 600);
        const duration = 900;
        const t0 = performance.now();
        const tick = (now) => {
            const p = Math.min((now - t0) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplayProb(Math.round(start + (end - start) * eased));
            if (p < 1) animFrameRef.current = requestAnimationFrame(tick);
        };
        animFrameRef.current = requestAnimationFrame(tick);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, [prob]);

    // Countdown to next auto-refresh
    useEffect(() => {
        const t = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
        return () => clearInterval(t);
    }, []);
    // Reset countdown when pred changes (i.e. new data arrived)
    useEffect(() => { setCountdown(30); }, [pred?.overs]);

    // Fetch Claude narrative when match or innings changes (not every ball)
    useEffect(() => {
        if (!pred || pred.aiProbability === undefined || isEnded) { setAiNarrative(null); return; }
        const matchKey = `${pred.id}_${pred.innings}_${Math.floor((pred.overs || 0) / 3)}`;
        let cancelled = false;
        setNarrativeLoading(true);
        const t1 = pred.team1 || "Team 1";
        const t2 = pred.team2 || "Team 2";
        const inn = pred.innings || 1;
        const score = pred.score || pred.runs || 0;
        const wkts = pred.wickets || 0;
        const overs = pred.overs || 0;
        const target = pred.target || 0;
        const crr = pred.currentRunRate || 0;
        const rrr = pred.requiredRunRate || 0;
        const conf = (pred.confidenceSignals || {}).confidenceLevel || "LOW";
        const signals = ((pred.confidenceSignals || {}).signalNames || []).join(", ");
        const favProb_ = prob >= 50 ? prob : Math.round((100 - prob) * 10) / 10;
        const favT = prob >= 50 ? t1 : t2;
        const prompt = inn === 2
            ? `You are a cricket expert analyst. Write 2 sharp sentences (no fluff, no "certainly") analysing this live T20 chase situation:
${t2} chasing ${target}, currently ${score}/${wkts} in ${overs} overs. Need ${target - score} more. CRR: ${crr.toFixed(1)}, RRR: ${rrr.toFixed(1)}.
Our AI gives ${favT} a ${favProb_}% chance. Confidence: ${conf}. Signals backing this: ${signals || "match situation"}.
Write like a Sky Sports commentator — punchy, specific, no generic phrases.`
            : `You are a cricket expert analyst. Write 2 sharp sentences (no fluff, no "certainly") analysing this live T20 first innings:
${t1} batting first: ${score}/${wkts} in ${overs} overs. CRR: ${crr.toFixed(1)}.
Our AI gives ${favT} a ${favProb_}% chance of winning. Confidence: ${conf}. Signals: ${signals || "early innings"}.
Write like a Sky Sports commentator — punchy, specific, no generic phrases.`;
        fetch(`${API_BASE}/claude-analysis`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt })
        })
        .then(r => r.json())
        .then(data => {
            if (cancelled) return;
            const text = data?.content?.[0]?.text || data?.content || null;
            if (text && typeof text === "string" && text.length > 20) {
                setAiNarrative(text.trim());
            } else {
                setAiNarrative(null);
            }
        })
        .catch(() => { if (!cancelled) setAiNarrative(null); })
        .finally(() => { if (!cancelled) setNarrativeLoading(false); });
        return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pred?.id, pred?.innings, Math.floor((pred?.overs || 0) / 3)]);

    if (!pred || pred.aiProbability === undefined) return null;

    const t1 = cleanTeam(pred.team1);
    const t2 = cleanTeam(pred.team2);
    const t1Color = getTeamColor(pred.team1);
    const t2Color = getTeamColor(pred.team2);
    const confGap = Math.abs(prob - 50);
    const confidence = confGap >= 20 ? "High" : confGap >= 10 ? "Medium" : "Low";
    const favTeam = prob >= 50 ? t1 : t2;
    const favProb = prob >= 50 ? prob : Math.round((100 - prob) * 10) / 10;
    const favTeamColor = prob >= 50 ? t1Color : t2Color;

    // Use backend confidence signals (stacked) — not just raw probability
    const _confData = pred.confidenceSignals || {};
    const _confLevel = _confData.confidenceLevel || "LOW";
    const _signalNames = _confData.signalNames || [];
    const _signalCount = _confData.signalCount || 0;
    const _totalSignals = _confData.totalSignals || 4;

    let signal, signalColor;
    if (_confLevel === "HIGH") {
        signal = "BACK";
        signalColor = "#00C896";
    } else if (_confLevel === "MEDIUM") {
        signal = "WAIT";
        signalColor = "#F59E0B";
    } else {
        signal = "NO EDGE";
        signalColor = "#EF4444";
    }
    const signalBg = "linear-gradient(145deg, #0F1535 0%, #141D4A 100%)";

    // 3 plain-English reasons
    const inn = pred.innings || 1;
    const fmt = (pred.matchType || "t20").toLowerCase();
    const totOv = fmt === "odi" ? 50 : 20;
    const rawOvers = pred.overs || 0;
    const ballsBowled = Math.floor(rawOvers) * 6 + Math.round((rawOvers % 1) * 10);
    const ballsLeft = Math.max(0, totOv * 6 - ballsBowled);
    const wktsLeft = 10 - (pred.wickets || 0);
    const needed = pred.runsNeeded || (pred.target ? pred.target - (pred.score || pred.runs || 0) : 0);
    const battingTeam = cleanTeam(inn === 2 ? (pred.team2 || pred.team1) : pred.team1);
    const crr = pred.currentRunRate || 0;
    const rrr = pred.requiredRunRate || 0;
    const reasons = [];

    // ── Real data bullets — numbers & facts only, no generic phrases ──────────
    const pc = pred.playerContext || {};
    const last3Runs = pc.last3Runs || 0;
    const last3Wkts = pc.last3Wkts || 0;
    const last3RR   = pc.last3RR   || 0;
    const partRuns  = pc.partnershipRuns || 0;
    const strikerSR = pc.strikerSR || 0;
    const bowlerEco = pc.bowlerEco || 0;
    const nextOv    = pred.nextOvers?.[0];
    const nextOv2   = pred.nextOvers?.[1];
    const pressure  = pred.pressureScore || 0;
    const phase     = pred.currentPhase || "";
    const pitchLbl  = pred.pitchLabel || "";

    if (inn === 2 && pred.target > 0) {
        // Bullet 1 — RRR vs CRR with exact numbers
        const gap = crr - rrr;
        if (gap > 2)       reasons.push(`${battingTeam} ahead — scoring ${crr.toFixed(1)}/ov, need only ${rrr.toFixed(1)}/ov · ${needed} to win 🟢`);
        else if (gap < -2) reasons.push(`${battingTeam} behind — need ${rrr.toFixed(1)}/ov, scoring ${crr.toFixed(1)}/ov · ${needed} off ${ballsLeft} balls 🔴`);
        else               reasons.push(`Neck and neck — ${battingTeam} need ${rrr.toFixed(1)}/ov, scoring ${crr.toFixed(1)}/ov · ${needed} needed ⚡`);

        // Bullet 2 — Wickets + partnership fact
        if (wktsLeft <= 2)      reasons.push(`Only ${wktsLeft} wicket${wktsLeft === 1 ? "" : "s"} left — tail in, game effectively over 🎯`);
        else if (partRuns > 30) reasons.push(`Current partnership: ${partRuns} runs — dangerous pair at crease, building pressure on ${t1}`);
        else if (wktsLeft <= 4) reasons.push(`${wktsLeft} wickets remaining — key batters still to come, but margin thin`);
        else                    reasons.push(`${wktsLeft} wickets in hand — ${battingTeam} have resources, game alive`);

        // Bullet 3 — Last 3 overs momentum OR next over prediction
        if (last3Runs > 0 && last3Wkts > 0)
            reasons.push(`Last 3 overs: ${last3Runs} runs, ${last3Wkts} wicket${last3Wkts > 1 ? "s" : ""} — momentum shifting to ${t1}`);
        else if (last3Runs > 0 && last3RR > rrr + 1)
            reasons.push(`Last 3 overs: ${last3Runs} runs at ${last3RR.toFixed(1)}/ov — above required rate, chasing well 🔥`);
        else if (last3Runs > 0 && last3RR < rrr - 1.5)
            reasons.push(`Last 3 overs: only ${last3Runs} runs at ${last3RR.toFixed(1)}/ov — momentum with ${t1} now`);
        else if (nextOv)
            reasons.push(`Over ${nextOv.over} projection: ${nextOv.runRange} runs expected · O/U line ${nextOv.ouLine}`);
        else
            reasons.push(pressure > 65 ? `Pressure index ${pressure}/100 — ${battingTeam} under serious stress` : `Match in balance — pressure index ${pressure}/100`);

    } else if (inn === 1 && crr > 0) {
        // Bullet 1 — CRR vs venue average with exact numbers
        const momentum = pred.momentum || 0;
        const venueAvg = (pred.venueHistory?.avg_first_innings) || 0;
        if (venueAvg > 0)
            reasons.push(`${battingTeam} scoring ${crr.toFixed(1)}/ov vs ${(venueAvg / 20).toFixed(1)}/ov venue avg — ${momentum > 0.5 ? "above par 📈" : momentum < -0.5 ? "below par 📉" : "on par ⚖️"}`);
        else
            reasons.push(`${battingTeam} at ${crr.toFixed(1)}/ov — ${momentum > 0.5 ? "above expected rate 📈" : momentum < -0.5 ? "below expected rate 📉" : "on expected rate ⚖️"}`);

        // Bullet 2 — Live pitch behavior (actual ball data) > static venue tag
        const lpr = pred.livePitchRead || {};
        const lprBehavior = lpr.behavior || "";
        const lprConf = lpr.confidence || "LOW";
        // Wickets sanity: 3+ wickets in <10 overs = pitch is NOT flat regardless of venue
        const earlyWicketsStress = (pred.wickets || 0) >= 3 && (pred.overs || 0) < 10;
        const wickets = pred.wickets || 0;
        if (strikerSR > 0 && bowlerEco > 0)
            reasons.push(`Striker SR ${strikerSR.toFixed(0)} vs bowler eco ${bowlerEco.toFixed(1)} — ${strikerSR > bowlerEco * 10 ? "batter dominating" : bowlerEco < 7 ? "bowler on top" : "even contest"}`);
        else if (lprBehavior && lprConf !== "LOW")
            reasons.push(`Live pitch read: ${lprBehavior.toLowerCase()} — ${lpr.summary || pitchLbl}`);
        else if (earlyWicketsStress)
            reasons.push(`Pitch assisting bowlers — ${wickets} wickets in ${(pred.overs||0).toFixed(1)} overs despite ${pitchLbl || "neutral"} venue tag`);
        else if (strikerSR > 0)
            reasons.push(`Striker SR ${strikerSR.toFixed(0)} — ${strikerSR > 130 ? "attacking mode" : strikerSR > 100 ? "building innings" : "struggling for timing"}`);
        else if (bowlerEco > 0)
            reasons.push(`Current bowler eco ${bowlerEco.toFixed(1)} — ${bowlerEco < 7 ? "excellent spell, bowlers in control" : bowlerEco > 10 ? "expensive, batting team benefiting" : "tight spell"}`);
        else
            reasons.push(pressure > 65 ? `Pressure index ${pressure}/100 — ${battingTeam} under serious stress` : `Pressure index ${pressure}/100 — innings developing normally`);

        // Bullet 3 — Next over prediction (actual ML output, not generic phase text)
        if (nextOv && nextOv2)
            reasons.push(`Next 2 overs projection: ${nextOv.runRange} then ${nextOv2.runRange} runs · ${phase}`);
        else if (nextOv)
            reasons.push(`Over ${nextOv.over}: AI projects ${nextOv.runRange} runs · O/U ${nextOv.ouLine} · ${Math.round(nextOv.confidence || 0)}% confidence`);
        else if (last3Runs > 0)
            reasons.push(`Last 3 overs: ${last3Runs} runs, ${last3Wkts} wicket${last3Wkts !== 1 ? "s" : ""} — recent run rate ${last3RR.toFixed(1)}/ov`);
        else
            reasons.push(`${phase} — pressure index ${pressure}/100`);
    }

    // Fallback if still empty
    while (reasons.length < 2) {
        if (nextOv) { reasons.push(`Over ${nextOv.over}: ${nextOv.runRange} runs projected · O/U ${nextOv.ouLine}`); break; }
        reasons.push(`Pressure index ${pressure}/100 — match ${pressure > 65 ? "under pressure" : "balanced"}`);
        break;
    }

    // #5 Visual hierarchy — dynamic border based on match state
    const isDanger  = pressure > 70;
    const isDominating = prob >= 65;
    const heroBorder = isDanger ? "2px solid rgba(239,68,68,0.7)" : isDominating ? "2px solid rgba(16,185,129,0.55)" : `1.5px solid ${signalColor}28`;
    const heroAnim  = isDanger ? "redGlow 1.8s infinite" : isDominating ? "greenGlow 2.5s infinite" : "none";

    return (
        <div style={{ background: signalBg, borderRadius: 20, padding: "20px", marginBottom: 14, position: "relative", overflow: "hidden", border: heroBorder, boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`, animation: heroAnim }}>
            {/* Subtle top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${signalColor}88, transparent)`, borderRadius: "20px 20px 0 0" }} />
            {/* Subtle glow */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: signalColor + "08", pointerEvents: "none" }} />

            {/* Top row: signal badge + meta */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: signalColor, animation: signal === "BACK" ? "pulse 1.5s infinite" : "none", flexShrink: 0 }} />
                    <span style={{ fontSize: 10, fontWeight: 800, color: signalColor, letterSpacing: 2 }}>AI SIGNAL</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.07)", padding: "3px 9px", borderRadius: 20 }}>
                        👥 {viewers} watching
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.07)", padding: "3px 9px", borderRadius: 20 }}>
                        🔄 {countdown}s
                    </span>
                </div>
            </div>

            {/* Main decision */}
            <div style={{ marginBottom: 16 }}>
                {/* Signal label + signal count chips */}
                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: signalColor + "18", border: `1px solid ${signalColor}40`, borderRadius: 8, padding: "5px 12px" }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: signalColor, letterSpacing: 1 }}>
                            {signal === "BACK" ? `🔥 BACK ${favTeam} — ${_signalCount}/${_totalSignals} SIGNALS` : signal === "WAIT" ? `⏳ WAIT — ${_signalCount}/${_totalSignals} SIGNALS` : "⚠️ NO EDGE — TOO CLOSE"}
                        </span>
                    </div>
                    {/* Individual signal chips */}
                    {_signalNames.map((s, i) => (
                        <span key={i} style={{ fontSize: 9, fontWeight: 700, color: signalColor, background: signalColor + "14", border: `1px solid ${signalColor}30`, borderRadius: 20, padding: "3px 8px", letterSpacing: 0.5 }}>
                            ✓ {s}
                        </span>
                    ))}
                </div>

                {/* Teams + probability row */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 12 }}>
                    {/* T1 block */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 4 }}>{t1}</div>
                        <div style={{ fontSize: 52, fontWeight: 900, color: t1Color, letterSpacing: -2, lineHeight: 1, animation: probFlash ? "probChange 0.6s ease-out" : "none" }}>{displayProb}<span style={{ fontSize: 22, letterSpacing: 0 }}>%</span></div>
                    </div>
                    {/* vs divider */}
                    <div style={{ width: 1, height: 56, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    {/* T2 block */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 4 }}>{t2}</div>
                        <div style={{ fontSize: 52, fontWeight: 900, color: t2Color, letterSpacing: -2, lineHeight: 1, animation: probFlash ? "probChange 0.6s ease-out" : "none" }}>{100 - displayProb}<span style={{ fontSize: 22, letterSpacing: 0 }}>%</span></div>
                    </div>
                </div>

                {/* Probability bar */}
                <div style={{ height: 6, borderRadius: 3, background: `${t2Color}44`, overflow: "hidden", marginBottom: 5 }}>
                    <div style={{ width: `${prob}%`, height: "100%", background: `linear-gradient(90deg, ${t1Color}, ${t1Color}cc)`, borderRadius: 3, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 10 }}>
                    {favTeam} favoured · <span style={{ color: signalColor }}>{_confLevel === "HIGH" ? "High" : _confLevel === "MEDIUM" ? "Medium" : "Low"} confidence</span>
                </div>
                {/* Share buttons — Twitter + WhatsApp */}
                {(() => {
                    const shareText = `${t1} vs ${t2} — AI gives ${favTeam} a ${favProb}% win probability right now 🏏\n\nFree AI cricket predictions, updated every ball →`;
                    const siteUrl = `https://www.cricintelligence.com`;
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(siteUrl)}&hashtags=IPL2026,Cricket,CricketPredictions`;
                    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + siteUrl)}`;
                    return (
                        <div style={{ display: "flex", gap: 8 }}>
                            <a href={twitterUrl} target="_blank" rel="noreferrer noopener"
                                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", background: "rgba(29,161,242,0.12)", border: "1px solid rgba(29,161,242,0.25)", borderRadius: 8, color: "#1DA1F2", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                Share
                            </a>
                            <a href={whatsappUrl} target="_blank" rel="noreferrer noopener"
                                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "7px 10px", background: "rgba(37,211,102,0.12)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 8, color: "#25D366", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                WhatsApp
                            </a>
                        </div>
                    );
                })()}
            </div>

            {/* Claude AI narrative — human expert analysis */}
            {(aiNarrative || narrativeLoading) && (
                <div style={{ background: "rgba(74,111,212,0.08)", border: "1px solid rgba(74,111,212,0.2)", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(74,111,212,0.8)", letterSpacing: 1.5, marginBottom: 6 }}>🤖 AI EXPERT ANALYSIS</div>
                    {narrativeLoading && !aiNarrative
                        ? <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>Analysing match situation...</div>
                        : <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, fontStyle: "italic" }}>{aiNarrative}</div>
                    }
                </div>
            )}

            {/* WHY? — hero treatment (strongest feature) */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${signalColor}28`, borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 900, color: signalColor, letterSpacing: 2, marginBottom: 12, opacity: 0.85 }}>WHY?</div>
                {reasons.slice(0, 3).map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < reasons.slice(0,3).length - 1 ? 12 : 0 }}>
                        <span style={{ color: signalColor, fontSize: 12, marginTop: 3, flexShrink: 0 }}>●</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>{r}</span>
                    </div>
                ))}
            </div>


        </div>
    );
}

function FeaturedMatchHero() {
    const [timeLeft, setTimeLeft] = React.useState("");
    React.useEffect(() => {
        function calcTime() {
            // RCB vs DC, April 18 2026, 19:30 IST (UTC+5:30 = 14:00 UTC)
            const matchTime = new Date("2026-04-18T14:00:00Z");
            const now = new Date();
            const diff = matchTime - now;
            if (diff <= 0) { setTimeLeft("Starting soon!"); return; }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            if (h > 48) { setTimeLeft(`${Math.floor(h/24)}d ${h%24}h`); return; }
            if (h > 0) setTimeLeft(`${h}h ${m}m`);
            else setTimeLeft(`${m}m ${s}s`);
        }
        calcTime();
        const iv = setInterval(calcTime, 1000);
        return () => clearInterval(iv);
    }, []);

    return (
        <div style={{
            background: `linear-gradient(135deg, #1A1035 0%, #1E2D6B 50%, #2D1B4E 100%)`,
            borderRadius: 20, overflow: "hidden", marginBottom: 32,
            border: `1px solid rgba(245,158,11,0.35)`,
            boxShadow: "0 8px 40px rgba(30,45,107,0.35), 0 0 0 1px rgba(245,158,11,0.1)",
            position: "relative",
        }}>
            {/* Glow blobs */}
            <div style={{ position:"absolute", top:-40, left:-40, width:200, height:200, borderRadius:"50%", background:"rgba(239,68,68,0.12)", filter:"blur(60px)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(99,102,241,0.12)", filter:"blur(60px)", pointerEvents:"none" }} />

            {/* Top strip */}
            <div style={{ background:"rgba(245,158,11,0.15)", borderBottom:"1px solid rgba(245,158,11,0.25)", padding:"7px 20px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:10, fontWeight:900, color:"#F59E0B", letterSpacing:1.5 }}>🏆 IPL 2026 · MATCH 26</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:"#F59E0B", display:"inline-block", animation:"pulse 2s infinite" }} />
                    <span style={{ fontSize:10, fontWeight:700, color:"#F59E0B", letterSpacing:0.5 }}>TODAY · 3:00 PM BST</span>
                </div>
            </div>

            {/* Main content */}
            <div style={{ padding:"28px 24px 24px", position:"relative", zIndex:1 }}>
                {/* Teams */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, marginBottom:20 }}>
                    {/* RCB */}
                    <div style={{ textAlign:"center", flex:1 }}>
                        <div style={{ fontSize:42, fontWeight:900, color:"#EF4444", letterSpacing:-1, textShadow:"0 0 30px rgba(239,68,68,0.5)" }}>RCB</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontWeight:600, marginTop:3 }}>Royal Challengers</div>
                        <div style={{ display:"inline-block", background:"rgba(239,68,68,0.18)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:6, padding:"3px 10px", fontSize:10, fontWeight:700, color:"#FF7070", marginTop:6 }}>#2 in Table</div>
                    </div>

                    {/* VS */}
                    <div style={{ textAlign:"center", flexShrink:0 }}>
                        <div style={{ fontSize:13, fontWeight:900, color:"rgba(255,255,255,0.4)", letterSpacing:2 }}>VS</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>D/N</div>
                    </div>

                    {/* DC */}
                    <div style={{ textAlign:"center", flex:1 }}>
                        <div style={{ fontSize:42, fontWeight:900, color:"#60A5FA", letterSpacing:-1, textShadow:"0 0 30px rgba(96,165,250,0.5)" }}>DC</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", fontWeight:600, marginTop:3 }}>Delhi Capitals</div>
                        <div style={{ display:"inline-block", background:"rgba(96,165,250,0.18)", border:"1px solid rgba(96,165,250,0.3)", borderRadius:6, padding:"3px 10px", fontSize:10, fontWeight:700, color:"#93C5FD", marginTop:6 }}>#6 in Table</div>
                    </div>
                </div>

                {/* Venue */}
                <div style={{ textAlign:"center", marginBottom:20 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>📍 M. Chinnaswamy Stadium, Bengaluru</span>
                </div>

                {/* Countdown + CTA row */}
                <div style={{ display:"flex", alignItems:"center", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                    {/* Countdown */}
                    <div style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 18px", textAlign:"center", minWidth:130 }}>
                        <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.45)", letterSpacing:1.5, marginBottom:4 }}>MATCH STARTS IN</div>
                        <div style={{ fontSize:22, fontWeight:900, color:"#F59E0B", fontVariantNumeric:"tabular-nums", letterSpacing:-0.5 }}>{timeLeft || "—"}</div>
                    </div>

                    {/* AI Prediction teaser */}
                    <div style={{ background:"linear-gradient(135deg,rgba(239,68,68,0.2),rgba(200,150,30,0.2))", border:"1px solid rgba(245,158,11,0.3)", borderRadius:12, padding:"10px 18px", textAlign:"center", flex:1, minWidth:160 }}>
                        <div style={{ fontSize:9, fontWeight:800, color:"rgba(255,255,255,0.5)", letterSpacing:1.5, marginBottom:4 }}>🤖 AI PREDICTION</div>
                        <div style={{ fontSize:14, fontWeight:800, color:"#fff" }}>Ready at kickoff</div>
                        <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", marginTop:2 }}>Win prob · Bet signal · Over-by-over</div>
                    </div>
                </div>

                {/* Bottom insight strip */}
                <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.08)", display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                    {[
                        { icon:"🔥", text:"RCB #2 — home advantage" },
                        { icon:"🏟️", text:"Chinnaswamy — high-scoring ground" },
                        { icon:"📈", text:"RCB avg 185 batting first here" },
                    ].map((tip, i) => (
                        <div key={i} style={{ fontSize:11, color:"rgba(255,255,255,0.5)", display:"flex", alignItems:"center", gap:5 }}>
                            <span>{tip.icon}</span><span>{tip.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Trust accuracy bar ───────────────────────────────────────────────────────
function TrustAccuracyBar() {
    const [stats, setStats] = useState(null);
    useEffect(() => {
        fetch(`${API_BASE}/match-record`)
            .then(r => r.json())
            .then(d => setStats(d))
            .catch(() => {});
    }, []);
    const hitRate = stats?.hitRate || 81;
    const total = stats?.totalResolved ?? 0;
    return (
        <div style={{ background: "rgba(0,184,148,0.07)", border: "1px solid rgba(0,184,148,0.22)", borderRadius: 14, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 180 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,184,148,0.15)", border: "2px solid rgba(0,184,148,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🎯</div>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: "#00B894", lineHeight: 1 }}>{hitRate}% accurate</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                        {total > 0 ? `${total} verified predictions` : "Verified T20 predictions"}
                    </div>
                </div>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                    { label: "MODEL", value: "ML v5" },
                    { label: "MATCHES", value: total > 0 ? `${total}+` : "45+" },
                    { label: "UPDATES", value: "Every ball" },
                    { label: "COST", value: "Free" },
                ].map(({ label, value }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{value}</div>
                        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1 }}>{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── How it works 3 steps ─────────────────────────────────────────────────────
function HowItWorksSteps() {
    const steps = [
        { n: "1", icon: "🏏", title: "Pick a match", desc: "Tap any live or upcoming match from the matches list" },
        { n: "2", icon: "🤖", title: "AI reads the game", desc: "Pitch, form, venue & live score — model updates every single ball" },
        { n: "3", icon: "💰", title: "See the edge", desc: "Win %, bet signal, score projection, momentum — all free, no sign-up" },
    ];
    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 1.5, marginBottom: 12 }}>HOW IT WORKS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {steps.map((s, i) => (
                    <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 8, right: 12, fontSize: 32, opacity: 0.09, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{s.n}</div>
                        <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 5 }}>{s.title}</div>
                        <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Mock prediction demo ─────────────────────────────────────────────────────
function MockPredictionDemo() {
    return (
        <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.accent, letterSpacing: 1.5, marginBottom: 12 }}>EXAMPLE — LIVE MATCH VIEW</div>
            <div style={{ background: "linear-gradient(135deg, #141e3a 0%, #1E2D6B 100%)", border: "1px solid rgba(200,150,30,0.3)", borderRadius: 16, padding: "20px", position: "relative", overflow: "hidden" }}>
                {/* Demo badge */}
                <div style={{ position: "absolute", top: 14, right: 14, display: "flex", alignItems: "center", gap: 5, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 20, padding: "3px 10px" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#EF4444" }}>LIVE</span>
                </div>
                {/* Teams */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "#EF4444" }}>RCB</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>142/4 · 14.2 ov</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontWeight: 700 }}>vs</div>
                    <div style={{ flex: 1, textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(255,255,255,0.5)" }}>CSK</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>target 168</div>
                    </div>
                </div>
                {/* Win probability bar */}
                <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "#EF4444" }}>RCB 67%</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>WIN PROBABILITY</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.45)" }}>CSK 33%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "67%", background: "linear-gradient(90deg, #EF4444, #F59E0B)", borderRadius: 4 }} />
                    </div>
                </div>
                {/* Stats grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {[
                        { label: "AI CONFIDENCE", value: "HIGH", color: "#00B894" },
                        { label: "MOMENTUM", value: "↑ RISING", color: "#22c55e" },
                        { label: "REQ. RATE", value: "9.6", color: "#F59E0B" },
                    ].map(({ label, value, color }) => (
                        <div key={label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 8px", textAlign: "center" }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color }}>{value}</div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: 0.8, marginTop: 3 }}>{label}</div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
                    This updates live every ball during any T20 match
                </div>
            </div>
        </div>
    );
}

function NoMatchesScreen({ upcomingMatches }) {
    const scheduleMatches = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches : [];
    return (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>

            {/* ── Site intro hero — "what is this site" ── */}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 20, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", marginBottom: 6 }}>🏏 Free AI Cricket Win Probability</div>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 14 }}>Updated every ball · No sign-up · 66%+ in death overs · All T20s</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
                    {["📊 Win % live", "🎯 Score projection", "⚡ Next-over range", "🌍 IPL · Internationals · BBL"].map(f => (
                        <span key={f} style={{ fontSize: 12, fontWeight: 600, color: C.text, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px" }}>{f}</span>
                    ))}
                </div>
            </div>

            {/* ── Live prediction demo ── */}
            <MockPredictionDemo />

            {/* ── Trust accuracy bar ── */}
            <TrustAccuracyBar />

            {/* ── Featured match hero ── */}
            <FeaturedMatchHero />

            {/* ── How it works ── */}
            <HowItWorksSteps />

            {/* ── Upcoming fixtures ── */}
            {scheduleMatches.length > 0 && (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 14 }}>UPCOMING FIXTURES</div>
                    {scheduleMatches.slice(0, 6).map((m, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 20px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{m.t1}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.bg, borderRadius: 6, padding: "3px 8px" }}>vs</div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{m.t2}</div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.muted }}>{m.detail || m.rawStatus || "Upcoming"}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Sidebar section header ────────────────────────────────────────────────────
function SidebarSection({ label, count, color, dot }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "14px 0 7px" }}>
            {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block", flexShrink: 0, animation: dot === "pulse" ? "pulse 1.5s infinite" : "none" }} />}
            <span style={{ fontSize: 9, fontWeight: 800, color, letterSpacing: 1.1 }}>{label}</span>
            {count > 0 && (
                <span style={{ fontSize: 9, fontWeight: 700, background: color + "18", color, borderRadius: 20, padding: "1px 7px" }}>{count}</span>
            )}
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>
    );
}

// ─── Sidebar with all live matches grouped by IPL/PSL/International ───────────
function MatchesSidebar({ liveMatches, selectedMatch, onMatchSelect, liveStatus, pred }) {
    const isIPL = m => IPL_TEAMS.some(t => (m.t1||'')===t||(m.t2||'')===t);
    const isPSL = m => PSL_TEAMS.some(t => (m.t1||'')===t||(m.t2||'')===t);

    const liveList     = liveMatches.filter(m => m.status === "LIVE");
    const upcomingList = liveMatches.filter(m => m.status === "UPCOMING");
    const recentList   = liveMatches.filter(m => m.status === "ENDED");

    const groups = [
        { key: "IPL", label: "IPL 2026", color: "#F59E0B", ms: liveList.filter(isIPL) },
        { key: "PSL", label: "PSL 2026",  color: "#10B981", ms: liveList.filter(isPSL) },
        { key: "INT", label: "International", color: "#818CF8", ms: liveList.filter(m => !isIPL(m) && !isPSL(m)) },
    ];

    return (
        <aside className="sl" style={{
            borderRight: `1px solid rgba(255,255,255,0.07)`,
            background: C.sidebarBg,
            padding: "14px 12px",
            overflowY: "auto",
            position: "sticky",
            top: 54,
            height: "calc(100vh - 54px)",
            alignSelf: "start",
        }}>
            {/* Header pill */}
            <div style={{
                display: "flex", alignItems: "center", gap: 7,
                marginBottom: 14, padding: "6px 10px",
                background: liveList.length > 0 ? "rgba(239,68,68,0.18)" : "rgba(255,255,255,0.08)",
                border: `1px solid ${liveList.length > 0 ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.15)"}`,
                borderRadius: 8,
            }}>
                {liveList.length > 0 && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 11, fontWeight: 800, color: liveList.length > 0 ? "#FF7070" : "rgba(255,255,255,0.9)", flex: 1 }}>
                    {liveList.length > 0 ? `${liveList.length} Live Match${liveList.length > 1 ? "es" : ""}` : "Match Centre"}
                </span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{liveMatches.length} total</span>
            </div>

            {/* LIVE NOW */}
            {liveList.length > 0 && (
                <>
                    <SidebarSection label="LIVE NOW" count={liveList.length} color="#DC2626" dot="pulse" />
                    {groups.map(g => {
                        if (g.ms.length === 0) return null;
                        return (
                            <div key={g.key} style={{ marginBottom: 4 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: g.color, letterSpacing: 1, marginBottom: 4, paddingLeft: 2 }}>
                                    {g.label}
                                </div>
                                {g.ms.map(m => (
                                    <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => onMatchSelect(m)} />
                                ))}
                            </div>
                        );
                    })}
                </>
            )}

            {/* UPCOMING */}
            {upcomingList.length > 0 && (
                <>
                    <SidebarSection label="UPCOMING" count={upcomingList.length} color="#D97706" dot={false} />
                    {upcomingList.slice(0, 5).map(m => (
                        <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => onMatchSelect(m)} />
                    ))}
                </>
            )}

            {/* RECENT */}
            {recentList.length > 0 && (
                <>
                    <SidebarSection label="RECENT" count={0} color={C.muted} dot={false} />
                    {recentList.slice(0, 5).map(m => (
                        <MatchPill key={m.id} m={m} selected={selectedMatch?.id === m.id} onClick={() => onMatchSelect(m)} />
                    ))}
                </>
            )}

            {/* Runs trend */}
            {pred?.overHistory?.length > 2 && (
                <div style={{ marginTop: 14, padding: "10px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", letterSpacing: 1, marginBottom: 8 }}>RUNS TREND</div>
                    <Spark data={pred.overHistory} />
                </div>
            )}

        </aside>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function PredictionsTab({ liveMatches, selectedMatch, onMatchSelect, pred, liveStatus, isFirstLoad, isPredLoading }) {
    const [activeOver, setActiveOver] = useState(0);
    const [activeView, setActiveView] = useState("prediction"); // "prediction" | "liveengine" | "scoreboard"
    const [secsSinceUpdate, setSecsSinceUpdate] = useState(0);
    const [pushStatus, setPushStatus] = useState("idle"); // "idle" | "loading" | "on" | "denied"
    const [scoreProjections, setScoreProjections] = useState([]);
    const [partnershipPred, setPartnershipPred] = useState(null);

    // Swipe gesture support for mobile view switching
    const swipeStartX = useRef(null);
    const VIEWS = ["prediction", "liveengine", "scoreboard"];
    const handleTouchStart = (e) => { swipeStartX.current = e.touches[0].clientX; };
    const handleTouchEnd = (e) => {
        if (swipeStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - swipeStartX.current;
        swipeStartX.current = null;
        if (Math.abs(dx) < 60) return;
        const cur = VIEWS.indexOf(activeView);
        if (dx < 0 && cur < VIEWS.length - 1) setActiveView(VIEWS[cur + 1]);
        if (dx > 0 && cur > 0) setActiveView(VIEWS[cur - 1]);
    };

    // Push notification subscribe
    const enableAlerts = async () => {
        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            alert("Push notifications not supported in this browser.");
            return;
        }
        setPushStatus("loading");
        try {
            const perm = await Notification.requestPermission();
            if (perm !== "granted") { setPushStatus("denied"); return; }
            const reg = await navigator.serviceWorker.ready;
            // Fetch VAPID public key from backend
            const vr = await fetch(`${API_BASE}/push/vapid-key`);
            const { publicKey } = await vr.json();
            if (!publicKey) { setPushStatus("idle"); alert("Push not configured on server."); return; }
            // Convert VAPID key
            const raw = atob(publicKey.replace(/-/g,"+").replace(/_/g,"/"));
            const key = new Uint8Array([...raw].map(c => c.charCodeAt(0)));
            const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
            await fetch(`${API_BASE}/push/subscribe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sub.toJSON()),
            });
            setPushStatus("on");
        } catch (e) {
            console.error("Push subscribe error:", e);
            setPushStatus("idle");
        }
    };

    // Check if already subscribed on mount
    useEffect(() => {
        if ("serviceWorker" in navigator && "PushManager" in window) {
            navigator.serviceWorker.ready.then(reg => {
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) setPushStatus("on");
                });
            });
        }
    }, []);
    // Reset counter every time pred changes (new data from backend)
    useEffect(() => { setSecsSinceUpdate(0); }, [pred?.overs, pred?.score]);
    useEffect(() => {
        const t = setInterval(() => setSecsSinceUpdate(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);

    // Fetch score projections when wicket falls or innings changes (not every ball)
    useEffect(() => {
        if (!pred?.id || !pred?.overs || pred.overs < 1) { setScoreProjections([]); return; }
        const mid = pred.id;
        const url = `${API_BASE}/match/${mid}/score-projection?innings=${pred.innings||1}&cur_ov=${pred.overs}&cur_score=${pred.score||pred.runs||0}&cur_wickets=${pred.wickets||0}&target=${pred.target||0}`;
        fetch(url).then(r => r.ok ? r.json() : null).then(d => { if (d && d.projections) setScoreProjections(d.projections); }).catch(() => {});
    }, [pred?.id, pred?.innings, pred?.wickets]);

    // Fetch partnership prediction when new partnership starts (wicket or innings change)
    useEffect(() => {
        if (!pred?.id || !pred?.overs || pred.overs < 1) { setPartnershipPred(null); return; }
        const mid = pred.id;
        const url = `${API_BASE}/match/${mid}/partnership?innings=${pred.innings||1}&overs=${pred.overs}&target=${pred.target||0}`;
        fetch(url).then(r => r.ok ? r.json() : null).then(d => { if (d && !d.error) setPartnershipPred(d); }).catch(() => {});
    }, [pred?.id, pred?.innings, pred?.wickets]);
    // Backend aiProbability: innings 1 = team1's win %, innings 2 = chasing team2's win %
    // Normalize to always represent team1's win probability for consistent display
    const _rawProb = pred?.aiProbability ?? 50;
    const _innings = pred?.innings || 1;
    // Cap display at 75% max — anything higher looks fake to users (#3 fix)
    const _capProb = (p) => Math.min(75, Math.max(25, p));
    const prob = _capProb(Math.round((_innings === 2 ? 100 - _rawProb : _rawProb) * 10) / 10);
    const winMsg = prob >= 65 ? "Strong position" : prob >= 45 ? "Close contest" : "Under pressure";
    const winColor = prob >= 65 ? C.green : prob >= 45 ? C.amber : C.red;
    // Compute isEnded at top level so all child sections can use it
    // pred?.matchEnded comes from backend build_pred — most reliable signal
    const _st = selectedMatch?.rawStatus || pred?.matchStatus || "";
    const isEnded = pred?.matchEnded === true || selectedMatch?.status === "ENDED" || _st.toLowerCase().includes("won by") || _st.toLowerCase().includes(" beat ") || _st.toLowerCase().includes("match tied") || _st.toLowerCase().includes("no result");

    // Wicket detection — red flash + haptic vibration
    const prevWicketsRef = useRef(null);
    const [wicketMoment, setWicketMoment] = useState(null); // { name, over }
    useEffect(() => {
        const cur = pred?.wickets;
        if (cur == null) return;
        if (prevWicketsRef.current !== null && cur > prevWicketsRef.current) {
            const batter = pred?.batters?.find(b => !b.isStriker)?.name || pred?.batters?.[0]?.name || "Wicket";
            setWicketMoment({ name: batter, over: pred?.overs });
            if (navigator.vibrate) navigator.vibrate([80, 40, 120, 40, 80]);
            setTimeout(() => setWicketMoment(null), 2800);
        }
        prevWicketsRef.current = cur;
    }, [pred?.wickets]);

    // Score pulse — brief glow every ball
    const prevScoreRef = useRef(null);
    const [scorePulsing, setScorePulsing] = useState(false);

    // Sticky Betway bar — mobile only, dismissible
    const [showStickyBar, setShowStickyBar] = useState(() => !localStorage.getItem("bw_dismissed"));
    useEffect(() => {
        const cur = pred?.score;
        if (cur == null) return;
        if (prevScoreRef.current !== null && cur !== prevScoreRef.current) {
            setScorePulsing(true);
            setTimeout(() => setScorePulsing(false), 700);
        }
        prevScoreRef.current = cur;
    }, [pred?.score]);

    // FOMO notification: fire when probability swings ≥ 22% between polls
    const fomoRef = useRef({ prob: null, lastFired: 0 });
    useEffect(() => {
        if (prob == null || pushStatus !== "on") return;
        const prev = fomoRef.current;
        const now = Date.now();
        if (prev.prob !== null && now - prev.lastFired > 120000) { // max 1 per 2 min
            const delta = Math.abs(prob - prev.prob);
            if (delta >= 22) {
                const t1 = cleanTeam(pred?.team1 || "");
                const t2 = cleanTeam(pred?.team2 || "");
                const leading = prob >= 50 ? t1 : t2;
                const body = `Match ALIVE — ${leading} now at ${prob >= 50 ? prob : 100 - prob}% 🔥`;
                if ("serviceWorker" in navigator) {
                    navigator.serviceWorker.ready.then(reg => {
                        reg.showNotification("CricIntelligence", { body, icon: "/logo192.png", badge: "/logo192.png" });
                    }).catch(() => {});
                }
                fomoRef.current = { prob, lastFired: now };
                return;
            }
        }
        fomoRef.current.prob = prob;
    }, [prob]);

    // Is any match currently live?
    const hasLive = liveMatches.some(m => m.status === "LIVE");
    const nextMatch = liveMatches.find(m => m.status === "UPCOMING");

    return (
        <div className="mg fade" style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 240px", minHeight: "calc(100vh - 54px)", width: "100%", position: "relative" }}>

            {/* WICKET OVERLAY — full-screen dramatic moment */}
            {wicketMoment && (
                <div style={{
                    position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "wicketBg 2.8s ease-in-out forwards",
                }}>
                    <div style={{
                        background: "linear-gradient(135deg,#7f1d1d,#991b1b)",
                        border: "2px solid rgba(239,68,68,0.6)",
                        borderRadius: 24, padding: "28px 48px", textAlign: "center",
                        boxShadow: "0 0 80px rgba(239,68,68,0.5), 0 20px 60px rgba(0,0,0,0.6)",
                        animation: "wicketSlam 2.8s cubic-bezier(.22,.68,0,1.2) forwards",
                    }}>
                        <div style={{ fontSize: 48, lineHeight: 1 }}>🎳</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -1, marginTop: 8 }}>WICKET!</div>
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4, fontWeight: 600 }}>
                            Over {wicketMoment.over?.toFixed(1)}
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT SIDEBAR */}
            <MatchesSidebar
                liveMatches={liveMatches}
                selectedMatch={selectedMatch}
                onMatchSelect={onMatchSelect}
                liveStatus={liveStatus}
                pred={pred}
            />

            {/* MAIN CONTENT */}
            <main className="mc" style={{ padding: 0, minWidth: 0 }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                {/* No live match banner — shown when all matches are ended */}
                {!hasLive && (selectedMatch || pred) && (() => {
                    // Detect BST (last Sun March → last Sun October) vs GMT
                    const now = new Date();
                    const jan = new Date(now.getFullYear(), 0, 1);
                    const jul = new Date(now.getFullYear(), 6, 1);
                    const isBST = now.getTimezoneOffset() < Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
                    const tz = isBST ? "BST" : "GMT";
                    // IST is UTC+5:30 → BST=UTC+1 → IST-4:30 → 3:30PM IST=11:00 BST, 7:30PM IST=3:00PM BST
                    //                  GMT=UTC+0 → IST-5:30 → 3:30PM IST=10:00 GMT, 7:30PM IST=2:00PM GMT
                    const t1 = isBST ? "11:00 AM" : "10:00 AM";
                    const t2 = isBST ? "3:00 PM" : "2:00 PM";
                    return (
                        <div style={{ background: "#0d1535", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "9px 20px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#64748b", display: "inline-block", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>No match live right now</span>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>·</span>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>IPL: {t1} &amp; {t2} {tz}</span>
                            {nextMatch && (
                                <>
                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>·</span>
                                    <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 600 }}>Next: {nextMatch.t1} vs {nextMatch.t2}</span>
                                </>
                            )}
                        </div>
                    );
                })()}
                {/* Show NoMatchesScreen only if no match selected and not loading */}
                {!selectedMatch && !pred && !isPredLoading && (
                    <NoMatchesScreen upcomingMatches={liveMatches.filter(m => m.status === "UPCOMING")} />
                )}

                {/* Compact trust strip + view switcher — shown when a match IS loaded */}
                {(selectedMatch || pred) && (
                    <div className="vs-row" style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${C.border}`, padding: "6px 20px", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>66%+ in death overs</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>·</span>
                        <span style={{ fontSize: 11, color: C.muted }}>Vitality Blast 2026 tracked live</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)" }}>·</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: secsSinceUpdate <= 5 ? C.green : secsSinceUpdate <= 15 ? C.amber : C.muted }}>
                            🔄 Updated {secsSinceUpdate}s ago
                        </span>
                        {/* Alert bell */}
                        <button onClick={enableAlerts} disabled={pushStatus === "on" || pushStatus === "loading"}
                            style={{ marginLeft: 4, background: pushStatus === "on" ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${pushStatus === "on" ? "rgba(16,185,129,0.4)" : C.border}`, borderRadius: 20, padding: "2px 10px", cursor: pushStatus === "on" ? "default" : "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 11 }}>{pushStatus === "on" ? "🔔" : pushStatus === "loading" ? "⏳" : pushStatus === "denied" ? "🔕" : "🔔"}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, color: pushStatus === "on" ? C.green : C.muted }}>
                                {pushStatus === "on" ? "Alerts ON" : pushStatus === "loading" ? "..." : pushStatus === "denied" ? "Blocked" : "Alerts"}
                            </span>
                        </button>
                        {/* View switcher — right side */}
                        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                            <button className={`tab-btn${activeView === "prediction" ? " on" : ""}`}
                                onClick={() => setActiveView("prediction")}
                                style={{ fontSize: 11, padding: "4px 10px" }}>
                                📊 Prediction
                            </button>
                            <button className={`tab-btn${activeView === "liveengine" ? " on" : ""}`}
                                onClick={() => setActiveView("liveengine")}
                                style={{
                                    fontSize: 11, padding: "4px 10px",
                                    background: activeView === "liveengine"
                                        ? "linear-gradient(135deg,#10B981,#059669)"
                                        : "linear-gradient(135deg,rgba(16,185,129,0.25),rgba(5,150,105,0.15))",
                                    border: "1px solid #10B981",
                                    color: "#fff",
                                    fontWeight: 700,
                                    position: "relative",
                                }}>
                                ⚡ Live Engine
                                <span style={{
                                    position: "absolute", top: -5, right: -5,
                                    background: "#EF4444",
                                    color: "#fff", fontSize: 8, fontWeight: 800,
                                    padding: "1px 4px", borderRadius: 6,
                                    animation: "pulse 1.5s infinite",
                                    letterSpacing: 0.5,
                                }}>LIVE</span>
                            </button>
                            <button className={`tab-btn${activeView === "scoreboard" ? " on" : ""}`}
                                onClick={() => setActiveView("scoreboard")}
                                style={{ fontSize: 11, padding: "4px 10px", position: "relative" }}>
                                📋 Scoreboard
                                <span style={{
                                    position: "absolute", top: -5, right: -5,
                                    background: "#EF4444", color: "#fff", fontSize: 8, fontWeight: 800,
                                    padding: "1px 4px", borderRadius: 6, letterSpacing: 0.5,
                                    lineHeight: 1.4, pointerEvents: "none",
                                }}>NEW</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Mobile swipe indicator dots — only shown when match is loaded */}
                {(selectedMatch || pred) && (
                    <div className="mob-swipe" style={{ display: "none", justifyContent: "center", alignItems: "center", gap: 6, padding: "6px 0 2px", background: "rgba(255,255,255,0.02)" }}>
                        {VIEWS.map((v) => (
                            <div key={v} onClick={() => setActiveView(v)} style={{ width: activeView === v ? 18 : 6, height: 6, borderRadius: 3, background: activeView === v ? C.accent : "rgba(255,255,255,0.2)", transition: "all 0.25s", cursor: "pointer" }} />
                        ))}
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>swipe</span>
                    </div>
                )}

                {/* Show header + content whenever a match is selected */}
                {(selectedMatch || pred) && (
                    <>
                        {/* Match header — uses selectedMatch immediately, falls back to pred */}
                        <div className="match-hdr" style={{ background: `linear-gradient(135deg, ${getTeamColor(pred?.team1 || selectedMatch?.t1)}22 0%, #1a2760 40%, #253580 60%, ${getTeamColor(pred?.team2 || selectedMatch?.t2)}22 100%)`, padding: "16px 24px 20px", position: "sticky", top: 54, zIndex: 150, color: "#fff", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
                            {/* Thin loading bar at top */}
                            {isPredLoading && (
                                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                                    <div style={{ height: "100%", background: "#C8961E", animation: "loadingBar 1.5s ease-in-out infinite", transformOrigin: "left" }} />
                                </div>
                            )}
                            <style>{`@keyframes loadingBar { 0%{transform:scaleX(0);opacity:1} 70%{transform:scaleX(0.8);opacity:1} 100%{transform:scaleX(1);opacity:0} }`}</style>
                            <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>{pred?.venue || selectedMatch?.detail || ""}</div>
                                {(() => {
                                    const st = selectedMatch?.rawStatus || pred?.matchStatus || "";
                                    const isEnded = selectedMatch?.status === "ENDED" || st.toLowerCase().includes("won by") || st.toLowerCase().includes(" beat ") || st.toLowerCase().includes("match tied") || st.toLowerCase().includes("no result");
                                    // Structured toss from backend
                                    const tossData = pred?.toss || {};
                                    const tossWinner = tossData.winner || "";
                                    const tossDecision = tossData.decision || "";
                                    const hasToss = !!(tossWinner && tossDecision);
                                    // Fallback: detect toss from status text
                                    const isTossText = !isEnded && !hasToss && st && (st.toLowerCase().includes("opt to") || st.toLowerCase().includes("won the toss") || st.toLowerCase().includes("chose to"));

                                    if (isEnded && st) {
                                        return (
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,184,148,0.18)", border: "1px solid rgba(0,184,148,0.4)", borderRadius: 20, padding: "4px 16px", marginBottom: 10 }}>
                                                <span style={{ fontSize: 13 }}>🏆</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: "#00B894", letterSpacing: 0.3 }}>{st}</span>
                                            </div>
                                        );
                                    }
                                    if (hasToss) {
                                        const decisionEmoji = tossDecision === "bat" ? "🏏" : "🎳";
                                        const decisionText = tossDecision === "bat" ? "BAT FIRST" : "BOWL FIRST";
                                        const shortWinner = cleanTeam(tossWinner);
                                        return (
                                            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 10 }}>
                                                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(200,150,30,0.15)", border: "1px solid rgba(200,150,30,0.45)", borderRadius: 20, padding: "6px 16px" }}>
                                                    <span style={{ fontSize: 15 }}>🪙</span>
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                                                        <span style={{ fontSize: 12, fontWeight: 900, color: "#C8961E", letterSpacing: 0.5 }}>
                                                            {shortWinner} WON TOSS · CHOSE TO {decisionText} {decisionEmoji}
                                                        </span>
                                                        <span style={{ fontSize: 9, color: "rgba(200,150,30,0.65)", letterSpacing: 0.5 }}>
                                                            {tossDecision === "field" ? "Dew factor — chasing advantage in T20s" : "Setting the target — pitch plays now"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    if (!isTossText) return null;
                                    return (
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(200,150,30,0.18)", border: "1px solid rgba(200,150,30,0.4)", borderRadius: 20, padding: "4px 12px", marginBottom: 10 }}>
                                            <span style={{ fontSize: 13 }}>🪙</span>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: "#C8961E", letterSpacing: 0.3 }}>{st}</span>
                                        </div>
                                    );
                                })()}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <TeamLogo name={(selectedMatch?.t1 || pred?.team1 || "").toLowerCase()} size={40} imageId={selectedMatch?.t1ImageId || pred?.team1ImageId || 0} />
                                        <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "#fff" }}>{cleanTeam(selectedMatch?.t1 || pred?.team1)}</span>
                                    </div>
                                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>vs</span>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="hn" style={{ fontSize: 38, fontWeight: 900, letterSpacing: -1.5, color: "rgba(255,255,255,0.55)" }}>{cleanTeam(selectedMatch?.t2 || pred?.team2)}</span>
                                        <TeamLogo name={(selectedMatch?.t2 || pred?.team2 || "").toLowerCase()} size={40} imageId={selectedMatch?.t2ImageId || pred?.team2ImageId || 0} />
                                    </div>
                                </div>
                                {(pred?.displayScore || (pred?.innings === 2 && (pred?.overs || 0) === 0)) && (() => {
                                    const _inn2Break = pred.innings === 2 && (pred.overs || 0) === 0;
                                    const _t1Score = selectedMatch?.t1Score ?? pred?.t1Runs ?? (pred?.target != null ? pred.target - 1 : null);
                                    const _t1Wkts  = selectedMatch?.t1Wkts ?? pred?.t1Wkts ?? "";
                                    const _t1Overs = selectedMatch?.t1Overs ?? pred?.t1Overs ?? "";
                                    const _inn2BreakScore = _t1Score != null ? `${_t1Score}/${_t1Wkts}${_t1Overs !== "" ? ` (${_t1Overs} ov)` : ""}` : null;
                                    return (
                                        <div className="score-row" style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "8px 18px", animation: scorePulsing ? "scorePop 0.7s ease-out" : "none" }}>
                                            <span style={{ fontSize: 11, fontWeight: 700, color: "#C8961E", letterSpacing: 0.5 }}>
                                                {cleanTeam((_inn2Break ? pred.team1 : (pred.innings === 2 ? pred.team2 : pred.team1)) || "")}
                                            </span>
                                            <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>
                                                {_inn2Break ? (_inn2BreakScore || pred.displayScore) : pred.displayScore}
                                            </span>
                                            {!_inn2Break && (
                                                <>
                                                    <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Rate {pred.currentRunRate || ""}</span>
                                                </>
                                            )}
                                            {pred.innings === 2 && pred.target > 0 && (
                                                <>
                                                    <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                                                        {_inn2Break ? "ENG to bat · Target" : "Target"} <span style={{ color: "#fff", fontWeight: 700 }}>{pred.target}</span>
                                                    </span>
                                                </>
                                            )}
                                            {!_inn2Break && pred.momentum !== undefined && pred.currentRunRate > 0 && (
                                                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: pred.momentum > 0.5 ? "rgba(0,200,150,0.25)" : pred.momentum < -0.5 ? "rgba(229,62,62,0.25)" : "rgba(255,255,255,0.1)", color: pred.momentum > 0.5 ? "#00D4AA" : pred.momentum < -0.5 ? "#FF6B6B" : "rgba(255,255,255,0.7)" }}>
                                                    {pred.momentum > 0 ? "+" : ""}{pred.momentum ? pred.momentum.toFixed(1) : "0"} vs avg
                                                </span>
                                            )}
                                            <button onClick={() => { const t = `${cleanTeam(pred.team1)} vs ${cleanTeam(pred.team2)} - AI: ${prob}% win probability. cricintelligence.com`; try { navigator.clipboard?.writeText(t).then(() => alert("Copied!")); } catch { } }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#C8961E", fontWeight: 700 }}>Share</button>
                                        </div>
                                    );
                                })()}
                                {isPredLoading && !pred?.displayScore && (
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>Loading prediction...</div>
                                )}
                            </div>
                        </div>

                        {/* First load — show site intro + example while prediction fetches */}
                        {!pred && isPredLoading && (
                            <div style={{ padding: "20px 20px 0" }}>
                                {/* Loading bar */}
                                <div style={{ background: "rgba(74,111,212,0.12)", border: "1px solid rgba(74,111,212,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 16, animation: "pulse 1.5s infinite" }}>🔄</span>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.85)" }}>
                                            Fetching live AI prediction for {selectedMatch ? `${cleanTeam(selectedMatch.t1)} vs ${cleanTeam(selectedMatch.t2)}` : "live match"}...
                                        </div>
                                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>ML model — updates every ball · usually ready in 2–3s</div>
                                    </div>
                                </div>
                                {/* Show site intro while waiting */}
                                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 16, textAlign: "center" }}>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 6 }}>🏏 Free AI Cricket Win Probability</div>
                                    <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>Updated every ball · No sign-up needed · 66%+ in death overs</div>
                                    <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
                                        {[["📊","Win % live"], ["🎯","Score projection"], ["⚡","Next-over range"], ["🌍","All T20s"]].map(([icon, label]) => (
                                            <div key={label} style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: 20 }}>{icon}</div>
                                                <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600 }}>{label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <MockPredictionDemo />
                            </div>
                        )}
                        {/* ── LIVE ENGINE VIEW ── */}
                        {activeView === "liveengine" && (
                            <div style={{ padding: "0 16px" }}>
                                <LiveEngine pred={pred} />
                            </div>
                        )}
                        {/* ── SCOREBOARD VIEW ── */}
                        {activeView === "scoreboard" && (
                            <div style={{ padding: "0 16px" }}>
                                <ScoreboardTab matchId={pred?.id || selectedMatch?.id} />
                            </div>
                        )}

                        {pred && activeView === "prediction" && <div style={{ padding: "16px" }}>
                            {/* TRUST BAR */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 12 }}>
                                {[
                                    { label: "Live data from Cricbuzz" },
                                    { label: "ML model — updates every ball" },
                                    ...(pred.venue ? [{ label: pred.venue }] : []),
                                ].map((item) => (
                                    <span key={item.label} style={{ fontSize: 10, color: C.muted, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px" }}>
                                        {item.label}
                                    </span>
                                ))}
                            </div>

                            {/* ── ONE MAIN INSIGHT — big headline ── */}
                            {!isEnded && pred && pred.team1 && (() => {
                                const _inn = pred.innings || 1;
                                const _crr = pred.currentRunRate || 0;
                                const _rrr = pred.requiredRunRate || 0;
                                const _pressure = pred.pressureScore || 0;
                                const _battingTeam = cleanTeam(_inn === 2 ? pred.team2 : pred.team1);
                                const _fieldingTeam = cleanTeam(_inn === 2 ? pred.team1 : pred.team2);
                                const _lpr = pred.livePitchRead || {};
                                const _phase = (pred.currentPhase || "").toLowerCase().replace("_", " ");
                                let _insight = "";
                                if (_inn === 2 && _rrr > 0 && _crr > 0) {
                                    const _gap = _crr - _rrr;
                                    if (_gap >= 2) _insight = `${_battingTeam} in control — scoring ${_crr.toFixed(1)}/ov, need only ${_rrr.toFixed(1)}`;
                                    else if (_gap <= -2) _insight = `${_fieldingTeam} taking over — ${_battingTeam} need ${_rrr.toFixed(1)}/ov, scoring ${_crr.toFixed(1)}`;
                                    else _insight = `Neck and neck — ${_battingTeam} need ${_rrr.toFixed(1)}/ov, scoring ${_crr.toFixed(1)}`;
                                } else if (_inn === 1 && _crr > 0) {
                                    if (_pressure > 70) _insight = `${_fieldingTeam} bowling well — ${_battingTeam} under pressure`;
                                    else if (_lpr.behavior && _lpr.confidence !== "LOW") _insight = `${_battingTeam} at ${_crr.toFixed(1)}/ov — ${_lpr.behavior.toLowerCase()}`;
                                    else _insight = `${_battingTeam} ${_crr >= 9 ? "dominating" : _crr >= 7 ? "building momentum" : "under pressure"} — ${_crr.toFixed(1)}/ov${_phase ? ` in ${_phase}` : ""}`;
                                }
                                if (!_insight) return null;
                                const _ic = prob >= 60 ? C.green : prob <= 40 ? C.red : C.amber;
                                return (
                                    <div style={{ textAlign: "center", marginBottom: 14, padding: "6px 0 2px" }}>
                                        <div style={{ fontSize: 21, fontWeight: 900, color: _ic, lineHeight: 1.3, letterSpacing: -0.3 }}>{_insight}</div>
                                    </div>
                                );
                            })()}

                            {/* ── LIVE ALERT SYSTEM ── */}
                            {!isEnded && pred && pred.team1 && (() => {
                                const _hist = pred.probHistory || [];
                                const _last3Wkts = pred.playerContext?.last3Wkts || 0;
                                const _wktsLeft = 10 - (pred.wickets || 0);
                                const _nextOv = pred.nextOvers?.[0];
                                const _crr = pred.currentRunRate || 0;
                                const _rrr = pred.requiredRunRate || 0;
                                const _lpr = pred.livePitchRead || {};
                                const _t1 = cleanTeam(pred.team1);
                                const _t2 = cleanTeam(pred.team2);
                                let _alert = null;
                                if (_wktsLeft <= 2) _alert = { text: `🚨 Collapse Risk — only ${_wktsLeft} wicket${_wktsLeft === 1 ? "" : "s"} left`, color: "#EF4444", bg: "rgba(239,68,68,0.12)" };
                                else if (_last3Wkts >= 2 && (pred.overs || 0) > 3) _alert = { text: `🚨 Wicket Threat Rising — ${_last3Wkts} wickets in last 3 overs`, color: "#EF4444", bg: "rgba(239,68,68,0.12)" };
                                else if (_hist.length >= 3) {
                                    const _delta = (_hist[_hist.length-1]?.prob||50) - (_hist[_hist.length-3]?.prob||50);
                                    if (Math.abs(_delta) >= 10) _alert = { text: `🚨 Momentum Shift — ${_delta > 0 ? _t1 : _t2} taking control`, color: "#F59E0B", bg: "rgba(245,158,11,0.12)" };
                                }
                                if (!_alert && pred.innings === 2 && _rrr > 0 && _rrr - _crr > 4 && (pred.overs || 0) > 0) _alert = { text: `🚨 Chase Slipping Away — need ${_rrr.toFixed(1)}/ov, scoring ${_crr.toFixed(1)}`, color: "#EF4444", bg: "rgba(239,68,68,0.12)" };
                                if (!_alert && _nextOv && _nextOv.expectedRuns >= 13) _alert = { text: `⚡ Big Over Incoming — AI projects ${_nextOv.expectedRuns} runs next over`, color: "#10B981", bg: "rgba(16,185,129,0.12)" };
                                if (!_alert && _lpr.behavior && _lpr.behavior.toLowerCase().includes("slow")) _alert = { text: "🔵 Pitch Slowing Down — scoring getting harder", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" };
                                if (!_alert) return null;
                                return (
                                    <div style={{ background: _alert.bg, border: `1px solid ${_alert.color}50`, borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, animation: "slideIn 0.4s ease" }}>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: _alert.color }}>{_alert.text}</span>
                                    </div>
                                );
                            })()}

                            {/* ── CLUTCH MOMENTS ── */}
                            {!isEnded && pred.clutchMoments && pred.clutchMoments.length > 0 && (
                                <div style={{ marginBottom: 12 }}>
                                    {pred.clutchMoments.map((cm, i) => {
                                        const bgColor = cm.severity === "CRITICAL" ? "rgba(239,68,68,0.10)" : cm.severity === "HIGH" ? "rgba(245,158,11,0.10)" : "rgba(74,111,212,0.08)";
                                        const borderColor = cm.severity === "CRITICAL" ? "rgba(239,68,68,0.45)" : cm.severity === "HIGH" ? "rgba(245,158,11,0.40)" : "rgba(74,111,212,0.30)";
                                        const textColor = cm.severity === "CRITICAL" ? C.red : cm.severity === "HIGH" ? C.amber : C.accent;
                                        return (
                                            <div key={cm.id} style={{ background: bgColor, border: `1px solid ${borderColor}`, borderRadius: 10, padding: "9px 14px", marginBottom: i < pred.clutchMoments.length - 1 ? 6 : 0 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{ fontSize: 13, fontWeight: 900, color: textColor }}>{cm.label}</span>
                                                    <span style={{ fontSize: 9, fontWeight: 700, color: textColor, background: textColor + "20", borderRadius: 20, padding: "1px 7px", letterSpacing: 1 }}>{cm.severity}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 3 }}>{cm.description}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* ── USER PREDICTION — "What's your call?" ── */}
                            <UserPrediction pred={pred} prob={prob} isEnded={isEnded} rawStatus={_st} matchId={selectedMatch?.id || pred?.id} />

                            {/* ── AI CALLED IT — dramatic moment banner ── */}
                            <AiCalledIt pred={pred} prob={prob} />

                            {/* ── HERO DECISION (replaces old hero bar + prediction call banner) ── */}
                            {!isEnded && <HeroDecision pred={pred} prob={prob} isEnded={isEnded} />}

                            {/* ── BETWAY BANNER — mobile only, right after main prediction ── */}
                            <div className="mob-intel">
                                <BetwayBanner style={{ marginBottom: 4 }} />
                            </div>

                            {/* ── SUBSCRIBE CARD — mobile only, push + email alerts ── */}
                            <div className="mob-intel">
                                <SubscribeCard />
                            </div>

                            {/* ── MOBILE VERDICT STRIP (right sidebar content on mobile) ── */}
                            {!isEnded && pred && pred.team1 && (() => {
                                const _pressure = pred.pressureScore || 0;
                                const _riskLabel = _pressure > 70 ? "High" : _pressure > 45 ? "Medium" : "Low";
                                const _riskColor = _pressure > 70 ? C.red : _pressure > 45 ? C.amber : C.green;
                                const _confLevel = (pred.confidenceSignals || {}).confidenceLevel || "LOW";
                                const _signalLabel = _confLevel === "HIGH" ? "Strong Signal" : _confLevel === "MEDIUM" ? "Moderate Edge" : "Watching";
                                const _signalColor = _confLevel === "HIGH" ? C.green : _confLevel === "MEDIUM" ? C.amber : C.muted;
                                const _hist = pred.probHistory || [];
                                const _delta = _hist.length >= 3 ? (_hist[_hist.length-1]?.prob||50) - (_hist[_hist.length-3]?.prob||50) : 0;
                                const _t1 = cleanTeam(pred.team1);
                                const _t2 = cleanTeam(pred.team2);
                                const _momentumDir = Math.abs(_delta) < 3 ? "Steady" : _delta > 0 ? `↑ ${_t1}` : `↑ ${_t2}`;
                                const _momentumColor = Math.abs(_delta) < 3 ? C.muted : _delta > 0 ? C.green : C.red;
                                const verdictText = prob >= 65 ? `BACK ${_t1}` : prob <= 35 ? `BACK ${_t2}` : prob >= 55 ? `BACK ${_t1} — low edge` : prob <= 45 ? `BACK ${_t2} — low edge` : "SKIP — too close";
                                const verdictColor = prob >= 55 || prob <= 45 ? C.green : C.red;
                                const fairOdds = (100 / prob).toFixed(2);
                                return (
                                    <div className="mob-intel" style={{ marginBottom: 14 }}>
                                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px" }}>
                                            <div style={{ fontSize: 9, fontWeight: 800, color: C.muted, letterSpacing: 1.5, marginBottom: 10 }}>MATCH INTELLIGENCE</div>
                                            <div style={{ background: verdictColor === C.green ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${verdictColor}40`, borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                                                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 2 }}>VERDICT</div>
                                                <div style={{ fontSize: 14, fontWeight: 900, color: verdictColor }}>{verdictText}</div>
                                            </div>
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                                                {[
                                                    { label: "Risk Level", value: _riskLabel, color: _riskColor },
                                                    { label: "Momentum", value: _momentumDir, color: _momentumColor },
                                                    { label: "AI Signal", value: _signalLabel, color: _signalColor },
                                                    { label: "Fair Odds", value: fairOdds, color: C.text },
                                                ].map(({ label, value, color }) => (
                                                    <div key={label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "7px 10px" }}>
                                                        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 0.8, marginBottom: 3 }}>{label}</div>
                                                        <div style={{ fontSize: 12, fontWeight: 800, color }}>{value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* ── MINI TRUST BLOCK ── */}
                            <MiniTrustBlock />

                            {/* ── FAIR ODDS (live matches only) ── */}
                            {!isEnded && pred.aiProbability !== undefined && (() => {
                              const t1p = prob;
                              const t2p = Math.round((100 - t1p) * 10) / 10;
                              return (
                              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 0 }}>
                                <div style={{ textAlign: "center", flex: 1 }}>
                                  <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 0.8, marginBottom: 3 }}>FAIR ODDS · {cleanTeam(pred.team1)}</div>
                                  <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{t1p > 0 ? (100 / t1p).toFixed(2) : "—"}</div>
                                </div>
                                <div style={{ width: 1, height: 30, background: C.border, margin: "0 12px" }} />
                                <div style={{ textAlign: "center", flex: 1 }}>
                                  <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 0.8, marginBottom: 3 }}>FAIR ODDS · {cleanTeam(pred.team2)}</div>
                                  <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{t2p > 0 ? (100 / t2p).toFixed(2) : "—"}</div>
                                </div>
                                <div style={{ width: 1, height: 30, background: C.border, margin: "0 12px" }} />
                                <a href="/odds" style={{ fontSize: 11, fontWeight: 700, color: C.accent, textDecoration: "none", whiteSpace: "nowrap" }}>Compare odds →</a>
                              </div>
                              );
                            })()}

                            {!isEnded && <NextOverIntelligence pred={pred} />}
                            {!isEnded && scoreProjections.length > 0 && <ScoreCheckpointsCard projections={scoreProjections} />}
                            {!isEnded && partnershipPred && <PartnershipCard partnership={partnershipPred} />}

                            {/* ── MATCH RESULT CARD (ended matches only) ── */}
                            {isEnded && (
                                <div style={{ background: "linear-gradient(135deg,#0f1a2e,#1a2a50)", border: "1px solid rgba(0,200,150,0.3)", borderRadius: 16, padding: "28px 24px", marginBottom: 14, textAlign: "center" }}>
                                    <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: "#00c896", letterSpacing: 2, marginBottom: 10 }}>MATCH RESULT</div>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.4, marginBottom: 8 }}>
                                        {_st || "Match Completed"}
                                    </div>
                                    {pred.team1 && (
                                        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 16 }}>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{cleanTeam(pred.team1)}</div>
                                                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
                                                    {pred.innings >= 2 ? `${pred.t1Runs ?? ""}/${pred.t1Wkts ?? ""}` : `${pred.score}/${pred.wickets}`}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 18, paddingTop: 18 }}>vs</div>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{cleanTeam(pred.team2)}</div>
                                                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>
                                                    {pred.innings >= 2 ? `${pred.t2Runs ?? pred.score}/${pred.t2Wkts ?? pred.wickets}` : "—"}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="cr" style={{ display: isEnded ? "none" : "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 14, alignItems: "start" }}>
                                {/* Next overs card */}
                                <div className="card" style={{ padding: 22, marginBottom: 14 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>{`Next ${(pred?.nextOvers || []).length} overs prediction`}</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {(pred.nextOvers || []).slice(0, 3).map((ov, i) => {
                                            const wc = ov.wicketProb > 40 ? C.red : ov.wicketProb > 25 ? C.amber : C.green;
                                            const runFill = Math.min(100, (ov.expectedRuns / 18) * 100);
                                            const batSR = pred?.playerContext?.strikerSR || 0;
                                            const bowlEco = pred?.playerContext?.bowlerEco || 0;
                                            const bndPct = pred?.playerContext?.boundaryPct || 0;
                                            const last3r = pred?.playerContext?.last3Runs || 0;
                                            const last3w = pred?.playerContext?.last3Wkts || 0;
                                            const pship = pred?.playerContext?.partnershipRuns || 0;
                                            const phaseColor = ov.phase === "POWERPLAY" ? C.accent : ov.phase === "DEATH OVERS" ? C.red : C.amber;
                                            const sr = batSR, eco = bowlEco, bnd = bndPct, l3r = last3r, phase = ov.phase || '';
                                            let vText, vBg;
                                            if (sr > 150 && eco > 8.5) { vText = 'High scoring over'; vBg = '#EF4444'; }
                                            else if (sr > 150 || (eco > 8 && bnd > 35)) { vText = 'Runs coming fast'; vBg = '#F59E0B'; }
                                            else if (sr < 100 && eco < 6.5) { vText = 'Tight over'; vBg = '#22C55E'; }
                                            else if (l3r > 25 || phase === 'DEATH OVERS') { vText = 'Momentum building'; vBg = '#F59E0B'; }
                                            else { vText = 'Steady over'; vBg = '#3B82F6'; }
                                            return (
                                                <div key={i} onClick={() => setActiveOver(i)} style={{
                                                    background: activeOver === i ? "#2A3F82" : "#1B2A6B",
                                                    border: `2px solid ${activeOver === i ? "#fff" : "rgba(255,255,255,0.18)"}`,
                                                    borderLeft: `4px solid ${activeOver === i ? "#fff" : phaseColor}`,
                                                    borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s"
                                                }}>
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                            <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>Over {ov.over}</span>
                                                            <span style={{ fontSize: 9, fontWeight: 800, color: "#fff", background: phaseColor, padding: "2px 8px", borderRadius: 20 }}>{ov.phase}</span>
                                                        </div>
                                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{ov.confidence >= 80 ? "Strong Signal" : ov.confidence >= 65 ? "Moderate Edge" : ov.confidence >= 50 ? "Some confidence" : "Low confidence"}</span>
                                                    </div>
                                                    <div style={{ display: 'inline-block', marginBottom: 8, padding: '6px 16px', background: vBg, borderRadius: 20, boxShadow: `0 0 16px ${vBg}88`, animation: 'labelPulse 2s ease-in-out infinite' }}>
                                                        <span style={{ fontSize: 11, fontWeight: 900, color: '#FFFFFF', letterSpacing: 1.2, textTransform: "uppercase" }}>{vText}</span>
                                                    </div>
                                                    <div style={{ marginBottom: 10 }}>
                                                        {batSR > 0 && <BarStat label="Batter SR" value={batSR} max={200} color={batSR >= 150 ? "#00FF94" : batSR >= 100 ? "#FFB800" : "#FF4444"} text={`${batSR} · ${batSR >= 150 ? "Explosive" : batSR >= 100 ? "Aggressive" : "Struggling"}`} />}
                                                        {bowlEco > 0 && <BarStat label="Bowl eco" value={bowlEco * 7} max={100} color={bowlEco <= 6 ? "#00FF94" : bowlEco <= 9 ? "#FFB800" : "#FF4444"} text={`${bowlEco} · ${bowlEco <= 6 ? "Tight" : bowlEco <= 9 ? "Average" : "Expensive"}`} />}
                                                        {bndPct > 0 && <BarStat label="Boundary %" value={bndPct * 2} max={100} color={bndPct >= 40 ? "#00FF94" : bndPct >= 20 ? "#FFB800" : "#94A3B8"} text={`${bndPct}% · ${bndPct >= 40 ? "Firing" : bndPct >= 20 ? "Active" : "Dry"}`} />}
                                                        {last3r > 0 && <BarStat label="Last 3 overs" value={last3r * 3} max={100} color={last3r > 25 ? "#00FF94" : last3r > 15 ? "#FFB800" : "#64748B"} text={`${last3r}r${last3w > 0 ? ` ${last3w}w` : ""} · ${last3r > 25 ? "Hot" : last3r > 15 ? "Moving" : "Dry"}`} />}
                                                        {pship > 0 && <BarStat label="Partnership" value={Math.min(100, pship)} max={100} color={pship > 50 ? "#FF4444" : pship > 25 ? "#FFB800" : "#64748B"} text={`${pship} · ${pship > 50 ? "Dangerous" : pship > 25 ? "Building" : "New"}`} />}
                                                    </div>
                                                    {/* O/U Betting verdict — direct call */}
                                                    {ov.ouLine != null ? (
                                                        <div style={{ marginBottom: 8 }}>
                                                            {/* Main verdict pill */}
                                                            <div style={{
                                                                background: ov.overPct > ov.underPct ? "rgba(16,185,129,0.15)" : "rgba(96,165,250,0.15)",
                                                                border: `1.5px solid ${ov.overPct > ov.underPct ? "rgba(16,185,129,0.5)" : "rgba(96,165,250,0.5)"}`,
                                                                borderRadius: 10, padding: "10px 14px", marginBottom: 6, textAlign: "center"
                                                            }}>
                                                                <div style={{ fontSize: 9, color: "#94A3B8", letterSpacing: 1, marginBottom: 4 }}>FANCY BET — RUNS THIS OVER</div>
                                                                <div style={{ fontSize: 20, fontWeight: 900, color: ov.overPct > ov.underPct ? "#10B981" : "#60A5FA" }}>
                                                                    {ov.overPct > ov.underPct ? `✅ OVER ${ov.ouLine}` : `✅ UNDER ${ov.ouLine}`}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>
                                                                    AI projects {ov.expectedRuns} runs · {ov.overPct > ov.underPct ? `${ov.overPct}% confident` : `${ov.underPct}% confident`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
                                                            <span style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", lineHeight: 1, letterSpacing: -1 }}>{ov.expectedRuns}</span>
                                                            <span style={{ fontSize: 13, color: "#CBD5E1" }}>runs expected</span>
                                                        </div>
                                                    )}
                                                    <div style={{ height: 5, background: C.border, borderRadius: 3, marginBottom: 5 }}>
                                                        <div style={{ height: "100%", width: runFill + "%", background: "linear-gradient(90deg, #4A90E2, #00D4AA)", borderRadius: 3, transition: "width 0.4s" }} />
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                        <span style={{ fontSize: 11, color: "#94A3B8" }}>{ov.confidence >= 80 ? "Strong Signal" : ov.confidence >= 65 ? "Moderate Edge" : ov.confidence >= 50 ? "Some confidence" : "Low confidence"}</span>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: wc }}>
                                                            {ov.wicketProb > 40 ? "⚠ Wicket likely soon" : ov.wicketProb > 25 ? "Wicket possible" : "Batsmen safe"}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Right column: scorecard + match intel */}
                                <div style={{ position: "sticky", top: 54, display: "flex", flexDirection: "column", gap: 14 }}>
                                    {pred.batters && pred.batters.length > 0 && (
                                        <LiveScorecard batters={pred.batters} bowler={pred.bowler || {}} matchType={pred.matchType} />
                                    )}
                                    {pred.pressureScore !== undefined && (
                                        <div className="card" style={{ padding: 22 }}>
                                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Match intel</div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>Batting Pressure</span>
                                                <span style={{ fontSize: 13, fontWeight: 900, color: pred.pressureScore > 70 ? C.red : pred.pressureScore > 45 ? C.amber : C.green }}>
                                                    {pred.pressureScore > 75 ? "Batters under fire" : pred.pressureScore > 55 ? "Tension rising" : pred.pressureScore > 35 ? "Even contest" : "In control"}
                                                </span>
                                            </div>
                                            <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 6, overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: pred.pressureScore + "%", borderRadius: 6, transition: "width 0.6s ease", background: pred.pressureScore > 70 ? "linear-gradient(90deg,#E53E3E,#FF6B6B)" : pred.pressureScore > 45 ? "linear-gradient(90deg,#DD6B20,#F6AD55)" : "linear-gradient(90deg,#276749,#68D391)" }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Probability Graph — live and ended matches */}
                            {pred.overs > 0 && (pred.probHistory?.length > 1 || !isEnded) && (
                                <div style={{ marginBottom: 14 }}>
                                    {isEnded && pred.probHistory?.length > 1 && (
                                        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, paddingLeft: 2 }}>
                                            Match Probability Timeline
                                        </div>
                                    )}
                                    <LiveProbabilityGraph pred={pred} />
                                </div>
                            )}

                            {/* ── Key panels: Key Risk / Momentum / Pitch ── */}
                            {pred.playerAnalysis && (
                                <div style={{ marginBottom: 14 }}>
                                    <BowlerWicketCard analysis={pred.playerAnalysis.bowler} />
                                    <MatchIntelligenceCard data={pred.matchIntelligence} innings={pred.innings} overs={pred.overs} />
                                    <LivePitchReadCard data={pred.livePitchRead} />
                                </div>
                            )}

                            {/* Batter Milestones */}
                            {!pred.matchEnded && pred.batters?.length > 0 && (
                                <BatterMilestones pred={pred} />
                            )}


                        </div>}
                    </>
                )}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="sr" style={{ borderLeft: `1px solid ${C.border}`, padding: "18px 14px", background: C.surface, display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 54, height: "calc(100vh - 54px)", overflowY: "auto", alignSelf: "start" }}>
                {/* Betway affiliate card — top of sidebar for visibility */}
                <BetwayBanner />
                {/* Subscribe card — push + email alerts */}
                <SubscribeCard compact={true} />
                {/* AdSense unit */}
                <AdUnit style={{ borderRadius: 8, overflow: "hidden" }} />
                {pred && pred.team1 && (
                  <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, background: C.bg }}>
                    {/* Team probability mini-bar — hidden when ended */}
                    {!isEnded && (
                      <div style={{ height: 4, background: `${getTeamColor(pred.team2)}66`, position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${prob}%`, background: getTeamColor(pred.team1), transition: "width 0.8s" }} />
                      </div>
                    )}
                    <div style={{ padding: "14px 14px 12px" }}>
                      {/* Divider */}
                      <div style={{ height: 1, background: C.border, marginBottom: 12 }} />
                      {isEnded ? (
                        /* Ended match: show result summary instead of live probability */
                        <div style={{ textAlign: "center", padding: "6px 0 10px" }}>
                          <div style={{ fontSize: 18, marginBottom: 6 }}>🏆</div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#00c896", letterSpacing: 1.5, marginBottom: 8 }}>FINAL RESULT</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.text, lineHeight: 1.5 }}>{_st || "Match Completed"}</div>
                        </div>
                      ) : (
                        <>
                      {/* ── DECISION ZONE (#7 fix) ── */}
                      <div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 800, letterSpacing: 1.5, marginBottom: 8 }}>⚡ DECISION ZONE</div>

                      {/* VERDICT */}
                      {(() => {
                        const favTeamSide = prob >= 55 ? cleanTeam(pred.team1) : prob <= 45 ? cleanTeam(pred.team2) : null;
                        const edge = prob >= 70 ? "Strong edge" : prob >= 60 ? "Slight edge" : prob >= 55 ? "Marginal edge" : "Too close";
                        const edgeColor = prob >= 70 ? C.green : prob >= 60 ? C.amber : prob >= 55 ? "#818cf8" : C.muted;
                        return (
                          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
                            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>VERDICT</div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: edgeColor }}>
                              {favTeamSide ? `${favTeamSide} — ${edge}` : "Even contest"}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Win prob — big */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{cleanTeam(pred.team1)} win</div>
                          <div style={{ fontSize: 28, fontWeight: 900, color: prob >= 60 ? C.green : prob <= 40 ? C.red : C.amber, lineHeight: 1 }}>{prob}%</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{cleanTeam(pred.team2)} win</div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: C.muted, lineHeight: 1 }}>{Math.round((100 - prob) * 10) / 10}%</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div style={{ height: 1, background: C.border, marginBottom: 10 }} />

                      {/* STRONGEST SIGNAL — specific language (#1 fix) */}
                      {(() => {
                        const signals = [];
                        const crr = pred.crr || 0;
                        const rrr = pred.rrr || 0;
                        const overs = pred.overs || 0;
                        const pitch = (pred.pitchLabel || pred.livePitchRead?.behavior || "").toLowerCase();

                        if (pred.innings === 2 && rrr > 0 && crr > 0) {
                          const diff = Math.abs(crr - rrr).toFixed(1);
                          if (crr > rrr + 1.5) signals.push(`Scoring ${diff} above required rate`);
                          else if (rrr > crr + 1.5) signals.push(`Need ${diff} more per over — under pressure`);
                        }
                        if (pred.pressureScore > 70) signals.push(`High pressure situation (${pred.pressureScore}/100)`);
                        if (pred.bowlingFactor <= 0.84) signals.push("Current bowler controlling — tight spell");
                        if (pred.battingFactor >= 1.15) signals.push("Batter dominating — above strike rate");
                        if (pitch.includes("bat") || pitch.includes("flat")) signals.push(`Flat pitch — batting conditions`);
                        else if (pitch.includes("bowl") || pitch.includes("spin") || pitch.includes("seam")) signals.push(`Bowling-friendly surface`);
                        if (pred.currentPhase) signals.push(pred.currentPhase);
                        if (signals.length === 0) return null;
                        return (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 5 }}>STRONGEST SIGNAL</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {signals.slice(0, 2).map((s, i) => (
                                <div key={i} style={{ fontSize: 10, fontWeight: 600, color: C.text, background: "rgba(255,255,255,0.04)", padding: "4px 8px", borderRadius: 6, borderLeft: `2px solid ${C.accent}` }}>
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                        </>
                      )}
                    </div>
                  </div>
                )}
                {/* ── RISK LEVEL + MOMENTUM DIRECTION + AI SIGNAL ── */}
                {pred && pred.team1 && !isEnded && (() => {
                    const _hist = pred.probHistory || [];
                    const _delta = _hist.length >= 3 ? (_hist[_hist.length-1]?.prob||50) - (_hist[_hist.length-3]?.prob||50) : 0;
                    const _t1 = cleanTeam(pred.team1);
                    const _t2 = cleanTeam(pred.team2);
                    const _momentumDir = Math.abs(_delta) < 3 ? "Steady" : _delta > 0 ? `↑ ${_t1} rising` : `↑ ${_t2} rising`;
                    const _momentumColor = Math.abs(_delta) < 3 ? C.muted : _delta > 0 ? C.green : C.red;
                    const _pressure = pred.pressureScore || 0;
                    const _riskLabel = _pressure > 70 ? "High" : _pressure > 45 ? "Medium" : "Low";
                    const _riskColor = _pressure > 70 ? C.red : _pressure > 45 ? C.amber : C.green;
                    const _confLevel = (pred.confidenceSignals || {}).confidenceLevel || "LOW";
                    const _signalLabel = _confLevel === "HIGH" ? "Strong Signal" : _confLevel === "MEDIUM" ? "Moderate Edge" : "Watching";
                    const _signalColor = _confLevel === "HIGH" ? C.green : _confLevel === "MEDIUM" ? C.amber : C.muted;
                    // Best Read: strongest signal text
                    const _crr = pred.currentRunRate || 0;
                    const _rrr = pred.requiredRunRate || 0;
                    const _inn = pred.innings || 1;
                    let _bestRead = "";
                    if (_inn === 2 && _rrr > 0 && _crr > 0) {
                        const _g = _crr - _rrr;
                        _bestRead = _g > 1.5 ? `${_t2} scoring above required rate` : _g < -1.5 ? `${_t2} behind on required rate` : "Chase evenly poised";
                    } else if (pred.bowlingFactor <= 0.84) _bestRead = "Bowler controlling — tight spell";
                    else if (pred.battingFactor >= 1.15) _bestRead = "Batter dominating — strike rate high";
                    else if (_pressure > 65) _bestRead = "Batting side under pressure";
                    else _bestRead = (pred.currentPhase || "").replace("_", " ") || "Match in balance";
                    return (
                        <div style={{ background: C.bg, borderRadius: 12, padding: "12px 12px", border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: C.muted, letterSpacing: 1.5, marginBottom: 10 }}>MATCH INTELLIGENCE</div>
                            {/* BACK / LAY / SKIP verdict */}
                            <div style={{ background: prob >= 60 ? "rgba(16,185,129,0.1)" : prob <= 40 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.08)", border: `1px solid ${prob >= 60 || prob <= 40 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.2)"}`, borderRadius: 8, padding: "8px 10px", marginBottom: 9 }}>
                                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>VERDICT</div>
                                <div style={{ fontSize: 13, fontWeight: 900, color: prob >= 60 ? C.green : prob <= 40 ? C.green : C.red }}>
                                    {prob >= 65 ? `BACK ${_t1} @ ${(100/prob).toFixed(2)} or better` :
                                     prob <= 35 ? `BACK ${_t2} @ ${(100/(100-prob)).toFixed(2)} or better` :
                                     prob >= 55 ? `BACK ${_t1} — Low edge` :
                                     prob <= 45 ? `BACK ${_t2} — Low edge` :
                                     "SKIP — No clear edge"}
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 9, gap: 8 }}>
                                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, flexShrink: 0 }}>Best Read</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: C.text, textAlign: "right", lineHeight: 1.3 }}>{_bestRead}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Risk Level</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: _riskColor }}>{_riskLabel}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>Momentum</span>
                                <span style={{ fontSize: 11, fontWeight: 800, color: _momentumColor }}>{_momentumDir}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
                                <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>AI Signal</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: _signalColor }}>{_signalLabel}</span>
                            </div>

                            {/* MARKET VALUE + KELLY CRITERION */}
                            {(() => {
                                const vbs = (pred.valueBets || []).filter(v => v.odds > 1.0 && !(v.team||"").toLowerCase().includes("draw"));

                                // Kelly Criterion: f* = (b×p − q) / b
                                // b = odds−1, p = AI win prob, q = 1−p
                                // Cap at 25% (half-Kelly is safer: cap at 12.5%)
                                const kellyCalc = (oddsDecimal, winProb) => {
                                    const p = winProb / 100;
                                    const q = 1 - p;
                                    const b = oddsDecimal - 1;
                                    if (b <= 0) return 0;
                                    const f = (b * p - q) / b;
                                    return Math.max(0, Math.min(0.25, f)); // cap 25%
                                };

                                const hasBkOdds = vbs.length > 0;
                                const best = hasBkOdds ? vbs.reduce((a, b) => b.edge > a.edge ? b : a, vbs[0]) : null;

                                // Use bookmaker odds if available, else our fair odds
                                const betOdds  = hasBkOdds ? best.odds : (100 / prob);
                                const betProb  = hasBkOdds ? best.aiProb : prob;
                                const kelly    = kellyCalc(betOdds, betProb);
                                const kellyPct = (kelly * 100).toFixed(1);
                                const halfKelly = (kelly * 50).toFixed(1); // half-Kelly recommended
                                const kellyLabel = kelly <= 0 ? "No bet — no edge" : kelly < 0.03 ? "Tiny edge — skip" : kelly < 0.08 ? `Stake ${halfKelly}% (half-Kelly)` : `Stake ${halfKelly}% of bankroll`;
                                const kellyColor = kelly <= 0 ? C.muted : kelly < 0.03 ? C.muted : kelly < 0.08 ? C.amber : C.green;

                                const isValue = hasBkOdds && best.edge > 5;
                                const valueColor = hasBkOdds ? (best.edge > 10 ? C.green : best.edge > 5 ? C.amber : C.muted) : C.muted;

                                return (
                                    <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 9 }}>
                                        {/* Market value */}
                                        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>MARKET VALUE</div>
                                        <div style={{ background: isValue ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.03)", border: `1px solid ${valueColor}25`, borderRadius: 8, padding: "7px 10px", marginBottom: 8 }}>
                                            <div style={{ fontSize: 11, fontWeight: 900, color: valueColor, marginBottom: 2 }}>
                                                {hasBkOdds
                                                    ? (isValue ? `🔥 VALUE: BACK @ ${best.odds.toFixed(2)}` : `FAIR — No value right now`)
                                                    : `Fair odds: ${betOdds.toFixed(2)}`}
                                            </div>
                                            {hasBkOdds && (
                                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                                                    {best.team} · AI {best.aiProb}% · {best.edge > 0 ? "+" : ""}{best.edge}% edge
                                                </div>
                                            )}
                                        </div>

                                        {/* Kelly Criterion */}
                                        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>KELLY CRITERION</div>
                                        <div style={{ background: kelly > 0.03 ? "rgba(74,111,212,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${kelly > 0.03 ? "rgba(74,111,212,0.3)" : C.border}`, borderRadius: 8, padding: "7px 10px", marginBottom: 8 }}>
                                            <div style={{ fontSize: 13, fontWeight: 900, color: kellyColor, marginBottom: 2 }}>
                                                {kellyLabel}
                                            </div>
                                            {kelly > 0.03 && (
                                                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                                                    Full Kelly: {kellyPct}% · Recommended: half-Kelly {halfKelly}%
                                                </div>
                                            )}
                                        </div>

                                        {/* Bayesian Credible Interval */}
                                        {pred.bayesianCI && pred.bayesianCI.lo != null && (() => {
                                            const ciLo = Math.round(pred.bayesianCI.lo * 10) / 10;
                                            const ciHi = Math.round(pred.bayesianCI.hi * 10) / 10;
                                            const ciWidth = ciHi - ciLo;
                                            // Narrow CI = high certainty (good), wide = uncertain
                                            const ciColor = ciWidth < 12 ? C.green : ciWidth < 22 ? C.amber : C.red;
                                            const ciLabel = ciWidth < 12 ? "High certainty" : ciWidth < 22 ? "Moderate certainty" : "Uncertain — wait";
                                            return (
                                                <div>
                                                    <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>BAYESIAN CONFIDENCE BAND</div>
                                                    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${ciColor}28`, borderRadius: 8, padding: "7px 10px" }}>
                                                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                                                            <span style={{ fontSize: 15, fontWeight: 900, color: ciColor }}>{ciLo}–{ciHi}%</span>
                                                            <span style={{ fontSize: 9, color: ciColor, fontWeight: 700, opacity: 0.75 }}>80% CI</span>
                                                        </div>
                                                        {/* Visual range bar */}
                                                        <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 5, overflow: "visible" }}>
                                                            <div style={{ position: "absolute", left: `${ciLo}%`, width: `${ciWidth}%`, height: "100%", background: ciColor, borderRadius: 3, opacity: 0.5 }} />
                                                            <div style={{ position: "absolute", left: `${prob}%`, transform: "translateX(-50%)", width: 2, height: "100%", background: C.text }} />
                                                        </div>
                                                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                                                            {ciLabel}{pred.overs > 0 ? ` · ${Math.round(pred.overs)} overs of data` : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })()}

                {/* ── Advanced Models Panel ──────────────────────────────── */}
                {/* ── Ball-by-Ball Live Panel ── */}
                {pred?.ballByBall?.ballSequence?.length > 0 && (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>THIS OVER — BALL BY BALL</div>

                        {/* Ball sequence dots */}
                        <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
                            {pred.ballByBall.ballSequence.map((b, i) => {
                                const isWkt = b === "W";
                                const isBig = b === "4" || b === "6";
                                const isDot = b === "0";
                                const bg = isWkt ? C.red : isBig ? C.green : isDot ? "rgba(255,255,255,0.08)" : C.amber;
                                const col = isWkt || isBig ? "#fff" : isDot ? "rgba(255,255,255,0.3)" : C.text;
                                return (
                                    <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: col }}>
                                        {b}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Dot % and boundary % bars */}
                        <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                            {[
                                { label: "Dot balls", val: pred.ballByBall.dotPct, color: C.red },
                                { label: "Boundaries", val: pred.ballByBall.boundaryPct, color: C.green },
                            ].map(({ label, val, color }) => (
                                <div key={label} style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                                        <span style={{ fontSize: 9, color: C.muted }}>{label}</span>
                                        <span style={{ fontSize: 9, fontWeight: 700, color }}>{val}%</span>
                                    </div>
                                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                                        <div style={{ width: `${Math.min(100, val)}%`, height: "100%", background: color, borderRadius: 2 }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pressure + trend */}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                            {pred.ballByBall.dotsInARow >= 3 && (
                                <span style={{ color: C.red, fontWeight: 700 }}>🔴 {pred.ballByBall.dotsInARow} dots in a row</span>
                            )}
                            {pred.ballByBall.overRpoTrend !== 0 && (
                                <span style={{ color: pred.ballByBall.overRpoTrend > 0 ? C.green : C.red, fontWeight: 700 }}>
                                    {pred.ballByBall.overRpoTrend > 0 ? "📈" : "📉"} {pred.ballByBall.overRpoTrend > 0 ? "+" : ""}{pred.ballByBall.overRpoTrend} last over
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {pred && (pred.ensembleAgreement?.verdict || pred.monteCarloProb || pred.hawkesWicketProb) && (
                    <div style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                        <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ADVANCED MODELS</div>

                        {/* Ensemble Agreement */}
                        {pred.ensembleAgreement?.verdict && (() => {
                            const ev = pred.ensembleAgreement;
                            const ec = ev.verdict === "CONSENSUS" ? C.green : ev.verdict === "PARTIAL" ? C.amber : C.red;
                            const eIcon = ev.verdict === "CONSENSUS" ? "✅" : ev.verdict === "PARTIAL" ? "⚠️" : "⚡";
                            return (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Model Consensus</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: ec }}>{eIcon} {ev.verdict} <span style={{ fontWeight: 400, fontSize: 9 }}>±{ev.spread}%</span></span>
                                </div>
                            );
                        })()}

                        {/* Monte Carlo cross-check */}
                        {pred.monteCarloProb != null && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Monte Carlo (8k sims)</span>
                                <span style={{ fontSize: 11, fontWeight: 800, color: C.text }}>{pred.monteCarloProb}%</span>
                            </div>
                        )}

                        {/* Hawkes wicket clustering */}
                        {pred.hawkesWicketProb != null && (() => {
                            const hp = Math.round(pred.hawkesWicketProb * 100);
                            const hc = hp >= 45 ? C.red : hp >= 30 ? C.amber : C.green;
                            const hl = hp >= 45 ? "🔴 COLLAPSE RISK" : hp >= 30 ? "⚠️ Elevated" : "✅ Stable";
                            return (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Wicket Cluster Risk</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: hc }}>{hl} <span style={{ fontWeight: 400, fontSize: 9 }}>{hp}%</span></span>
                                </div>
                            );
                        })()}

                        {/* Kalman smoothed RPO */}
                        {pred.kalmanRPO?.filtered != null && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>True RPO (Kalman)</span>
                                <span style={{ fontSize: 11, fontWeight: 800, color: C.text }}>{pred.kalmanRPO.filtered} <span style={{ fontWeight: 400, fontSize: 9, color: C.muted }}>±{pred.kalmanRPO.sigma}</span></span>
                            </div>
                        )}

                        {/* Partnership survival */}
                        {pred.partnershipSurvival?.survivalPct != null && (() => {
                            const sp = pred.partnershipSurvival.survivalPct;
                            const sc = sp >= 65 ? C.green : sp >= 40 ? C.amber : C.red;
                            return (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Partnership Survival</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: sc }}>{sp}%</span>
                                </div>
                            );
                        })()}
                    </div>
                )}

                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, marginBottom: 8 }}>LIVE CRICKET INTELLIGENCE ENGINE</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 5, flexWrap: "wrap", marginBottom: 9 }}>
                        {["Pro Engine", "Verified Insights", "Real-time AI"].map(tag => (
                            <span key={tag} style={{ fontSize: 9, fontWeight: 700, color: C.accent, background: "rgba(74,111,212,0.1)", border: "1px solid rgba(74,111,212,0.2)", borderRadius: 20, padding: "2px 8px" }}>{tag}</span>
                        ))}
                    </div>
                    <a href="/about" style={{ fontSize: 10, color: C.muted, fontWeight: 600, textDecoration: "none", marginRight: 8 }}>About</a>
                    <a href="mailto:emmadi.dev@gmail.com" style={{ fontSize: 10, color: C.muted, fontWeight: 600, textDecoration: "none" }}>Contact</a>
                </div>

            </aside>

            {/* ── STICKY BETWAY BAR — mobile only, fixed bottom, dismissible ── */}
            {showStickyBar && (
                <div className="mob-only" style={{
                    position: "fixed", bottom: 56, left: 0, right: 0, zIndex: 1200,
                    background: "linear-gradient(90deg, #00281a 0%, #003d24 100%)",
                    borderTop: "2px solid #00A651",
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px",
                }}>
                    <a
                        href="https://betway.com/bwp/bet10get40/en-gb/?s=sp53067"
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        style={{ flex: 1, textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
                    >
                        <span style={{ background: "#00A651", color: "#fff", fontSize: 11, fontWeight: 900, padding: "3px 8px", borderRadius: 4, letterSpacing: 1, flexShrink: 0 }}>BETWAY</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>Bet £10 &amp; Get <span style={{ color: "#00A651" }}>£40 Free Bets</span></div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>New customers · T&amp;Cs apply · 18+</div>
                        </div>
                        <div style={{ background: "#00A651", color: "#fff", fontSize: 11, fontWeight: 900, padding: "7px 14px", borderRadius: 8, flexShrink: 0, whiteSpace: "nowrap" }}>Claim →</div>
                    </a>
                    <button
                        onClick={() => { localStorage.setItem("bw_dismissed", "1"); setShowStickyBar(false); }}
                        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 18, cursor: "pointer", padding: "0 4px", flexShrink: 0, lineHeight: 1 }}
                        aria-label="Dismiss"
                    >×</button>
                </div>
            )}
        </div>
    );
}

// Small helper to reduce repetition in bar stats
function BarStat({ label, value, max, color, text }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color }}>{text}</span>
            </div>
            <div style={{ height: 12, background: "rgba(255,255,255,0.12)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: 6 }} />
            </div>
        </div>
    );
}
