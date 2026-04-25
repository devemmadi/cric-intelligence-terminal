/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { C, API_BASE, cleanTeam, IPL_TEAMS, PSL_TEAMS, getLeague } from "../shared/constants";
import TeamLogo from "../shared/TeamLogo";
import { MatchPill } from "../shared/MatchCard";
import LiveProbabilityGraph from "./LiveProbabilityGraph";

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

    // ── MOMENTUM (left card) ─────────────────────────────────────────────────
    const history = pred.overHistory || [];
    const last5 = history.slice(-5);
    const last3Runs = pred.playerContext?.last3Runs || 0;
    const last3Wkts = pred.playerContext?.last3Wkts || 0;
    const crr = pred.currentRunRate || 0;

    let momentumLabel = "STEADY";
    let momentumColor = "#f59e0b";
    let momentumArrow = "→";
    if (last5.length >= 3) {
        const half = Math.ceil(last5.length / 2);
        const firstSum = last5.slice(0, half).reduce((s, o) => s + (o.runs || 0), 0);
        const secondSum = last5.slice(half).reduce((s, o) => s + (o.runs || 0), 0);
        const ratio = secondSum / (firstSum || 1);
        if (ratio > 1.25) { momentumLabel = "RISING"; momentumColor = "#22c55e"; momentumArrow = "↑"; }
        else if (ratio < 0.75) { momentumLabel = "FALLING"; momentumColor = "#ef4444"; momentumArrow = "↓"; }
    } else if (last3Runs > 22) { momentumLabel = "RISING"; momentumColor = "#22c55e"; momentumArrow = "↑"; }
    else if (last3Runs < 10) { momentumLabel = "FALLING"; momentumColor = "#ef4444"; momentumArrow = "↓"; }

    const maxBar = Math.max(...last5.map(o => o.runs || 0), 1);

    // ── PRESSURE (right card) ────────────────────────────────────────────────
    const rrr = pred.requiredRunRate || 0;
    const innings = pred.innings || 1;
    const partnership = pred.playerContext?.partnershipRuns || 0;
    const wicketsLeft = 10 - (pred.wickets || 0);

    let pressureLabel = "On track";
    let pressureColor = "#22c55e";
    if (innings === 2 && rrr > 0) {
        const gap = rrr - crr;
        if (gap > 3)       { pressureLabel = "Chase in trouble";    pressureColor = "#ef4444"; }
        else if (gap > 1)  { pressureLabel = "Falling behind"; pressureColor = "#f59e0b"; }
        else if (gap < -2) { pressureLabel = "Chasing well";  pressureColor = "#22c55e"; }
        else               { pressureLabel = "Too close to call"; pressureColor = "#60A5FA"; }
    } else if (innings === 1) {
        // Use momentum (vsAvg) for accuracy — raw CRR alone is misleading at high-scoring venues
        const vsAvg = pred.momentum || 0;
        if (crr < 4 || vsAvg < -2)  { pressureLabel = "Scoring slow";  pressureColor = "#ef4444"; }
        else if (vsAvg > 1)          { pressureLabel = "Ahead of pace";  pressureColor = "#22c55e"; }
        else if (vsAvg < -0.5)       { pressureLabel = "Scoring slow";   pressureColor = "#ef4444"; }
        else                         { pressureLabel = "On track";        pressureColor = "#f59e0b"; }
    }

    const rrrBarPct = rrr > 0 ? Math.min(100, (crr / rrr) * 100) : 0;
    const dangerousPartnership = partnership > 75;
    const tailExposed = wicketsLeft <= 3;
    const rateCritical = innings === 2 && rrr > crr + 4;

    return (
        <div style={{ padding: "0 0 4px 0", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E24B4A", animation: "blink2 1.5s infinite" }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A" }}>Match pulse</span>
                <span style={{ fontSize: 12, color: "#64748B" }}>Live momentum &amp; pressure</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>

                {/* ── LEFT: Momentum ──────────────────────────────────────── */}
                <div style={{ background: "#1E2D6B", border: "2px solid #60A5FA", borderRadius: 12, padding: 14, boxShadow: "0 0 16px rgba(96,165,250,0.3)" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Who's Dominating</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 28, fontWeight: 900, color: momentumColor, lineHeight: 1 }}>{momentumArrow}</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: momentumColor }}>{momentumLabel}</span>
                    </div>

                    {/* Last 5 overs bar chart */}
                    {last5.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: 0.5 }}>LAST {last5.length} OVERS</div>
                            <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 36 }}>
                                {last5.map((ov, i) => {
                                    const h = Math.max(5, ((ov.runs || 0) / maxBar) * 32);
                                    const col = (ov.runs || 0) >= 10 ? "#22c55e" : (ov.runs || 0) >= 6 ? "#f59e0b" : "#60A5FA";
                                    return (
                                        <div key={i} title={`Ov ${ov.over}: ${ov.runs}r`} style={{ flex: 1, height: h, background: col, borderRadius: "3px 3px 0 0", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontSize: 8, color: "#fff", fontWeight: 800 }}>{ov.runs}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div style={{ height: 2, background: "rgba(255,255,255,0.15)", borderRadius: 1, marginTop: 2 }} />
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Last 3 overs</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: last3Runs > 22 ? "#22c55e" : last3Runs > 14 ? "#f59e0b" : "#94A3B8" }}>
                                {last3Runs}r{last3Wkts > 0 ? ` ${last3Wkts}w` : ""}
                            </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Run Speed</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: "#FFFFFF" }}>{crr.toFixed(2)}</div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Pressure ─────────────────────────────────────── */}
                <div style={{ background: "#111A3E", border: "1.5px dashed rgba(255,255,255,0.2)", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>Match Situation</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: pressureColor, marginBottom: 12 }}>{pressureLabel}</div>

                    {/* RRR vs CRR bar — only in 2nd innings chase */}
                    {innings === 2 && rrr > 0 && (
                        <div style={{ marginBottom: 12 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>Scoring {crr.toFixed(2)}/ov</span>
                                <span style={{ fontSize: 10, fontWeight: 700, color: crr >= rrr ? "#22c55e" : "#ef4444" }}>Need {rrr.toFixed(2)}/ov</span>
                            </div>
                            <div style={{ height: 7, background: "rgba(255,255,255,0.1)", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${rrrBarPct}%`, height: "100%", background: crr >= rrr ? "#22c55e" : "#ef4444", borderRadius: 4, transition: "width 0.4s" }} />
                            </div>
                        </div>
                    )}

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Partnership</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: dangerousPartnership ? "#ef4444" : partnership > 30 ? "#f59e0b" : "#94A3B8" }}>{partnership} runs</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Wkts left</div>
                            <div style={{ fontSize: 16, fontWeight: 900, color: tailExposed ? "#ef4444" : wicketsLeft <= 6 ? "#f59e0b" : "#22c55e" }}>{wicketsLeft}</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {dangerousPartnership && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.18)", color: "#ef4444", fontWeight: 600 }}>Dangerous partnership</span>}
                        {tailExposed && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.18)", color: "#ef4444", fontWeight: 600 }}>Tail exposed</span>}
                        {rateCritical && <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(239,68,68,0.18)", color: "#ef4444", fontWeight: 600 }}>Falling behind target</span>}
                        {!dangerousPartnership && !tailExposed && !rateCritical && (
                            <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontWeight: 600 }}>No major alerts</span>
                        )}
                    </div>
                </div>
            </div>
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
    const prob = _inn === 2 ? Math.round((100 - _rawProb) * 10) / 10 : _rawProb;
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

    // ── BET / WAIT / AVOID CTA ──────────────────────────────────────────────
    let ctaLabel, ctaColor, ctaBg, ctaBorder, ctaIcon;
    if (prob >= 65) {
        ctaLabel = `BET ${team1}`; ctaIcon = "🟢";
        ctaColor = "#00C896"; ctaBg = "rgba(0,200,150,0.15)"; ctaBorder = "rgba(0,200,150,0.5)";
    } else if (prob <= 35) {
        ctaLabel = `BET ${team2}`; ctaIcon = "🟢";
        ctaColor = "#00C896"; ctaBg = "rgba(0,200,150,0.15)"; ctaBorder = "rgba(0,200,150,0.5)";
    } else if (prob >= 55 || prob <= 45) {
        ctaLabel = "WAIT"; ctaIcon = "🟡";
        ctaColor = "#F59E0B"; ctaBg = "rgba(245,158,11,0.15)"; ctaBorder = "rgba(245,158,11,0.5)";
    } else {
        ctaLabel = "AVOID"; ctaIcon = "🔴";
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

// ─── Mini trust block — fetched live ─────────────────────────────────────────
function MiniTrustBlock() {
    const [info, setInfo] = useState(null);
    useEffect(() => {
        fetch(`${API_BASE}/match-record`)
            .then(r => r.json())
            .then(d => {
                const decided = (d.records || []).filter(r => r.correct !== null && r.correct !== undefined);
                if (decided.length > 0) setInfo({ hitRate: d.hitRate, correct: decided.filter(r => r.correct).length, total: decided.length });
            })
            .catch(() => {});
    }, []);
    if (!info) return null;
    const { hitRate, correct, total } = info;
    const isGood = hitRate >= 55;
    const hasEnoughData = total >= 10;
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: isGood ? "rgba(0,200,150,0.06)" : "rgba(100,116,139,0.06)", border: `1px solid ${isGood ? "rgba(0,200,150,0.2)" : "rgba(100,116,139,0.2)"}`, borderRadius: 10, padding: "8px 14px", marginBottom: 12 }}>
            {isGood ? (
                <>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#00C896" }}>{hitRate}%</span>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>AI Track Record </span>
                        <span style={{ fontSize: 11, color: C.muted }}>{correct}/{total} verified</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#00C896", background: "rgba(0,200,150,0.12)", padding: "2px 8px", borderRadius: 20 }}>✓ Verified</span>
                </>
            ) : hasEnoughData ? (
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>📊 {correct}/{total} matches tracked · Building accuracy</span>
                </div>
            ) : (
                <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>📊 {total} matches tracked · Early data</span>
                </div>
            )}
        </div>
    );
}

// ─── Hero Decision Card — the first thing user sees ───────────────────────────
function HeroDecision({ pred, prob, isEnded }) {
    const [countdown, setCountdown] = useState(30);
    const [viewers] = useState(() => Math.floor(Math.random() * 80) + 40); // FOMO: 40–120 viewers

    // Countdown to next auto-refresh
    useEffect(() => {
        const t = setInterval(() => setCountdown(c => c <= 1 ? 30 : c - 1), 1000);
        return () => clearInterval(t);
    }, []);
    // Reset countdown when pred changes (i.e. new data arrived)
    useEffect(() => { setCountdown(30); }, [pred?.overs]);

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

    let signal, signalColor;
    if (prob >= 65 || prob <= 35) {
        signal = "BET";
        signalColor = "#00C896";
    } else if (prob >= 55 || prob <= 45) {
        signal = "WAIT";
        signalColor = "#F59E0B";
    } else {
        signal = "AVOID";
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

    if (inn === 2 && pred.target > 0) {
        // Forward-looking chase narrative
        if (rrr > crr + 2.5) reasons.push(`${battingTeam} are falling behind — need ${rrr.toFixed(1)}/ov, scoring only ${crr.toFixed(1)} 🔴`);
        else if (crr > rrr + 1.5) reasons.push(`${battingTeam} are cruising — scoring ${crr.toFixed(1)}/ov, need just ${rrr.toFixed(1)} 🟢`);
        else reasons.push(`It's right on the edge — ${battingTeam} need ${rrr.toFixed(1)}/ov, scoring ${crr.toFixed(1)} ⚡`);
        if (wktsLeft <= 2) reasons.push(`Last ${wktsLeft} wicket${wktsLeft === 1 ? "" : "s"} — one more and it's over 🎯`);
        else if (wktsLeft <= 4) reasons.push(`Only ${wktsLeft} wickets left — tail coming in soon ⚠️`);
        else reasons.push(`${wktsLeft} wickets still in hand — plenty of batting left`);
        const ballsLeftOv = (ballsLeft / 6).toFixed(1);
        if (needed <= 0) reasons.push(`Target achieved — match complete 🏆`);
        else if (ballsLeft <= 0) reasons.push(`${needed} needed off last ball — nail-biting finish! 🎯`);
        else if (needed <= 12 && ballsLeft >= 6) reasons.push(`Just ${needed} needed off ${ballsLeftOv} overs — should be comfortable`);
        else if (needed > ballsLeft) reasons.push(`${needed} needed off ${ballsLeft} balls — asking rate is brutal`);
    } else if (inn === 1 && crr > 0) {
        const vsAvg = pred.momentum || 0;
        if (vsAvg > 0.5) reasons.push(`${battingTeam} are batting above par — building a big total 📈`);
        else if (vsAvg < -0.5) reasons.push(`${battingTeam} are struggling — below expected run rate 📉`);
        else reasons.push(`${battingTeam} are on track — even contest so far ⚖️`);
        const pitch = (pred.pitchLabel || "").toLowerCase();
        if (pitch.includes("bowl") || pitch.includes("spin") || pitch.includes("seam")) reasons.push("Pitch helping bowlers — expect pressure to build");
        else if (pitch.includes("bat") || pitch.includes("flat")) reasons.push("Flat pitch — batters in total control today");
        if (pred.currentPhase === "POWERPLAY") reasons.push("Powerplay: next 2 overs set the tone for the chase");
        else if (pred.currentPhase === "DEATH OVERS") reasons.push("Death overs — finishers can swing this either way");
        else if (pred.currentPhase === "MIDDLE OVERS") reasons.push("Middle overs — a wicket now changes everything");
    }
    while (reasons.length < 3) {
        if (pred.nextOvers?.[0]) { reasons.push(`Next over: ${pred.nextOvers[0].runRange} runs expected`); break; }
        reasons.push(pred.pressureScore > 65 ? "Batting under heavy pressure" : "Match developing normally");
        break;
    }

    return (
        <div style={{ background: signalBg, borderRadius: 20, padding: "20px", marginBottom: 14, position: "relative", overflow: "hidden", border: `1.5px solid ${signalColor}28`, boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)` }}>
            {/* Subtle top accent line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${signalColor}88, transparent)`, borderRadius: "20px 20px 0 0" }} />
            {/* Subtle glow */}
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: signalColor + "08", pointerEvents: "none" }} />

            {/* Top row: signal badge + meta */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: signalColor, animation: signal === "BET" ? "pulse 1.5s infinite" : "none", flexShrink: 0 }} />
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
                {/* Signal label */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: signalColor + "18", border: `1px solid ${signalColor}40`, borderRadius: 8, padding: "5px 12px", marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: signalColor, letterSpacing: 1 }}>
                        {signal === "BET" ? `🔥 HIGH-CONFIDENCE PICK` : signal === "WAIT" ? "⏳ WAIT FOR CLEARER SIGNAL" : "⚠️ TOO CLOSE TO CALL"}
                    </span>
                </div>

                {/* Teams + probability row */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 12 }}>
                    {/* T1 block */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{t1}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: t1Color, letterSpacing: -1, lineHeight: 1.1 }}>{prob}%</div>
                    </div>
                    {/* vs divider */}
                    <div style={{ width: 1, height: 48, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
                    {/* T2 block */}
                    <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: "#fff", letterSpacing: -0.5 }}>{t2}</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: t2Color, letterSpacing: -1, lineHeight: 1.1 }}>{Math.round((100 - prob) * 10) / 10}%</div>
                    </div>
                </div>

                {/* Probability bar */}
                <div style={{ height: 6, borderRadius: 3, background: `${t2Color}44`, overflow: "hidden", marginBottom: 5 }}>
                    <div style={{ width: `${prob}%`, height: "100%", background: `linear-gradient(90deg, ${t1Color}, ${t1Color}cc)`, borderRadius: 3, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
                    {favTeam} favoured · <span style={{ color: signalColor }}>{confidence} confidence</span>
                </div>
            </div>

            {/* 3 reasons */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
                {reasons.slice(0, 3).map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: i < reasons.slice(0,3).length - 1 ? 9 : 0 }}>
                        <span style={{ color: signalColor, fontSize: 9, marginTop: 4, flexShrink: 0 }}>●</span>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.45 }}>{r}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            {signal === "BET" ? (
                <a href="https://reffpa.com/L?tag=d_5453500m_97c_&site=5453500&ad=97" target="_blank" rel="noreferrer noopener"
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: `linear-gradient(135deg, ${signalColor}, #00A37A)`, borderRadius: 14, padding: "16px 20px", textDecoration: "none", color: "#fff", fontWeight: 900, fontSize: 17, letterSpacing: 0.3, boxShadow: `0 8px 28px ${signalColor}66`, marginBottom: 6, animation: "pulse 2.5s infinite" }}>
                    <span>🎰 BET {favTeam} TO WIN — Act Now</span>
                    <span style={{ fontSize: 10, fontWeight: 600, opacity: 0.75, letterSpacing: 1 }}>AI CONFIDENCE: {confidence.toUpperCase()} · {favProb}% WIN PROBABILITY</span>
                </a>
            ) : signal === "WAIT" ? (
                <div style={{ textAlign: "center", padding: "13px", background: "rgba(245,158,11,0.12)", borderRadius: 12, border: "1px solid rgba(245,158,11,0.3)", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#F59E0B", marginBottom: 2 }}>⏳ Not yet — wait for a clearer signal</div>
                    <div style={{ fontSize: 10, color: "rgba(245,158,11,0.6)" }}>Match is too close right now</div>
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "13px", background: "rgba(239,68,68,0.1)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.25)", marginBottom: 8 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#EF4444", marginBottom: 2 }}>🚫 Skip this one — too unpredictable</div>
                    <div style={{ fontSize: 10, color: "rgba(239,68,68,0.6)" }}>No edge found — protect your bankroll</div>
                </div>
            )}

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
                    <span style={{ fontSize:10, fontWeight:700, color:"#F59E0B", letterSpacing:0.5 }}>TODAY · 7:30 PM IST</span>
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

function NoMatchesScreen({ upcomingMatches }) {
    const scheduleMatches = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches : [];
    return (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>

            {/* ── Featured match hero ── */}
            <FeaturedMatchHero />

            {/* ── No live matches note ── */}
            <div style={{ textAlign: "center", padding: "20px 24px 32px", maxWidth: 400, margin: "0 auto" }}>
                <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
                    No live matches right now — AI predictions go live the moment the toss is done.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                        { icon: "🤖", label: "ML Predictions" },
                        { icon: "📊", label: "Pitch Analysis" },
                        { icon: "💡", label: "Bet Signals" },
                    ].map((f, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: C.text }}>
                            {f.icon} {f.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Upcoming fixtures ── */}
            {scheduleMatches.length > 0 && (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: 1, marginBottom: 14 }}>UPCOMING FIXTURES</div>
                    {scheduleMatches.slice(0, 6).map((m, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 20px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.navy }}>{m.t1}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.bg, borderRadius: 6, padding: "3px 8px" }}>vs</div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.navy }}>{m.t2}</div>
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{m.detail || m.rawStatus || "Upcoming"}</div>
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
    // Backend aiProbability: innings 1 = team1's win %, innings 2 = chasing team2's win %
    // Normalize to always represent team1's win probability for consistent display
    const _rawProb = pred?.aiProbability ?? 50;
    const _innings = pred?.innings || 1;
    const prob = Math.round((_innings === 2 ? 100 - _rawProb : _rawProb) * 10) / 10;
    const winMsg = prob >= 65 ? "Strong position" : prob >= 45 ? "Close contest" : "Under pressure";
    const winColor = prob >= 65 ? C.green : prob >= 45 ? C.amber : C.red;
    // Compute isEnded at top level so all child sections can use it
    // pred?.matchEnded comes from backend build_pred — most reliable signal
    const _st = selectedMatch?.rawStatus || pred?.matchStatus || "";
    const isEnded = pred?.matchEnded === true || selectedMatch?.status === "ENDED" || _st.toLowerCase().includes("won by") || _st.toLowerCase().includes(" beat ") || _st.toLowerCase().includes("match tied") || _st.toLowerCase().includes("no result");

    return (
        <div className="mg fade" style={{ display: "grid", gridTemplateColumns: "260px minmax(0,1fr) 240px", minHeight: "calc(100vh - 54px)", width: "100%" }}>
            {/* LEFT SIDEBAR */}
            <MatchesSidebar
                liveMatches={liveMatches}
                selectedMatch={selectedMatch}
                onMatchSelect={onMatchSelect}
                liveStatus={liveStatus}
                pred={pred}
            />

            {/* MAIN CONTENT */}
            <main className="mc" style={{ padding: 0, minWidth: 0 }}>
                {/* Show NoMatchesScreen only if no match selected and not loading */}
                {!selectedMatch && !pred && !isPredLoading && (
                    <NoMatchesScreen upcomingMatches={liveMatches.filter(m => m.status === "UPCOMING")} />
                )}

                {/* Show header + content whenever a match is selected */}
                {(selectedMatch || pred) && (
                    <>
                        {/* Match header — uses selectedMatch immediately, falls back to pred */}
                        <div style={{ background: `linear-gradient(135deg, ${getTeamColor(pred?.team1 || selectedMatch?.t1)}22 0%, #1a2760 40%, #253580 60%, ${getTeamColor(pred?.team2 || selectedMatch?.t2)}22 100%)`, padding: "16px 24px 20px", position: "sticky", top: 54, zIndex: 10, color: "#fff", borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
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
                                    const isToss = !isEnded && st && (st.toLowerCase().includes("opt to") || st.toLowerCase().includes("won the toss") || st.toLowerCase().includes("chose to"));
                                    if (isEnded && st) {
                                        return (
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,184,148,0.18)", border: "1px solid rgba(0,184,148,0.4)", borderRadius: 20, padding: "4px 16px", marginBottom: 10 }}>
                                                <span style={{ fontSize: 13 }}>🏆</span>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: "#00B894", letterSpacing: 0.3 }}>{st}</span>
                                            </div>
                                        );
                                    }
                                    if (!isToss) return null;
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
                                {pred?.displayScore && (
                                    <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, padding: "8px 18px" }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#C8961E", letterSpacing: 0.5 }}>
                                            {cleanTeam((pred.innings === 2 ? pred.team2 : pred.team1) || "")}
                                        </span>
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pred.displayScore}</span>
                                        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Rate {pred.currentRunRate || ""}</span>
                                        {pred.innings === 2 && pred.target > 0 && (
                                            <>
                                                <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Target <span style={{ color: "#fff", fontWeight: 700 }}>{pred.target}</span></span>
                                            </>
                                        )}
                                        {pred.momentum !== undefined && pred.currentRunRate > 0 && (
                                            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: pred.momentum > 0.5 ? "rgba(0,200,150,0.25)" : pred.momentum < -0.5 ? "rgba(229,62,62,0.25)" : "rgba(255,255,255,0.1)", color: pred.momentum > 0.5 ? "#00D4AA" : pred.momentum < -0.5 ? "#FF6B6B" : "rgba(255,255,255,0.7)" }}>
                                                {pred.momentum > 0 ? "+" : ""}{pred.momentum ? pred.momentum.toFixed(1) : "0"} vs avg
                                            </span>
                                        )}
                                        <button onClick={() => { const t = `${cleanTeam(pred.team1)} vs ${cleanTeam(pred.team2)} - AI: ${prob}% win probability. cricintelligence.com`; try { navigator.clipboard?.writeText(t).then(() => alert("Copied!")); } catch { } }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#C8961E", fontWeight: 700 }}>Share</button>
                                    </div>
                                )}
                                {isPredLoading && !pred?.displayScore && (
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: 1 }}>Loading prediction...</div>
                                )}
                            </div>
                        </div>

                        {/* Skeleton only when no pred at all (first ever load) */}
                        {!pred && isPredLoading && (
                            <div style={{ padding: "24px 20px" }}>
                                {[1, 2, 3].map(i => (
                                    <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 14, border: "1px solid #E2E8F0" }}>
                                        <div style={{ height: 12, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 6, width: "40%", marginBottom: 12 }} />
                                        <div style={{ height: 32, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 8, width: "70%", marginBottom: 12 }} />
                                        <div style={{ height: 8, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", borderRadius: 4, width: "100%", marginBottom: 8 }} />
                                    </div>
                                ))}
                            </div>
                        )}
                        {pred && <div style={{ padding: "16px" }}>
                            {/* TRUST BAR */}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingBottom: 12 }}>
                                {[
                                    { label: "⚡ Live data from Cricbuzz" },
                                    { label: "🤖 ML model — score projections + partnerships" },
                                    { label: "🔄 Auto-refreshes every 30s" },
                                    ...(pred.venue ? [{ label: `📍 ${pred.venue}` }] : []),
                                ].map((item) => (
                                    <span key={item.label} style={{ fontSize: 10, color: C.muted, background: "rgba(100,116,139,0.12)", border: `1px solid ${C.border}`, borderRadius: 20, padding: "3px 10px" }}>
                                        {item.label}
                                    </span>
                                ))}
                            </div>

                            {/* ── HERO DECISION (replaces old hero bar + prediction call banner) ── */}
                            {!isEnded && <HeroDecision pred={pred} prob={prob} isEnded={isEnded} />}

                            {/* ── MINI TRUST BLOCK ── */}
                            <MiniTrustBlock />

                            {/* ── FAIR ODDS (live matches only) ── */}
                            {!isEnded && pred.aiProbability !== undefined && (() => {
                              const t1p = prob;
                              const t2p = Math.round((100 - t1p) * 10) / 10;
                              return (
                              <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 0 }}>
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
                                                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{ov.confidence}% conf</span>
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
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                                                        <span style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", lineHeight: 1, letterSpacing: -1 }}>{ov.runRange}</span>
                                                        <span style={{ fontSize: 12, color: "#CBD5E1" }}>runs expected</span>
                                                    </div>
                                                    <div style={{ height: 5, background: C.border, borderRadius: 3 }}>
                                                        <div style={{ height: "100%", width: runFill + "%", background: "linear-gradient(90deg, #4A90E2, #00D4AA)", borderRadius: 3, transition: "width 0.4s" }} />
                                                    </div>
                                                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#FFFFFF" }}>Expected: {ov.expectedRuns} runs</span>
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

                            {/* Live Probability Graph (live matches only) */}
                            {!isEnded && pred.overs > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                    <LiveProbabilityGraph pred={pred} />
                                </div>
                            )}

                            {/* ── Score Checkpoints + Partnership (betting reference) ── */}
                            {pred.playerAnalysis && (pred.playerAnalysis.scoreProjection?.length > 0 || pred.playerAnalysis.partnership?.striker) && !isEnded && (
                                <div style={{ marginBottom: 0 }}>
                                    <ScoreCheckpointsCard projections={pred.playerAnalysis.scoreProjection} />
                                    <PartnershipCard partnership={pred.playerAnalysis.partnership} />
                                </div>
                            )}

                            {/* ── Player Analysis: Batter / Bowler / Pitch ── */}
                            {pred.playerAnalysis && (
                                <div style={{ marginBottom: 14 }}>
                                    <BatterAnalysisCard analysis={pred.playerAnalysis.batters} />
                                    <BowlerWicketCard analysis={pred.playerAnalysis.bowler} />
                                    <PitchRealityCard analysis={pred.playerAnalysis.pitch} />
                                </div>
                            )}

                            {pred.toss && (
                                <div style={{ background: "linear-gradient(135deg,#1E2D6B,#253580)", borderRadius: 14, padding: "14px 18px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 2 }}>TOSS</div>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{pred.toss.winner} won - elected to {pred.toss.decision}</div>
                                    </div>
                                </div>
                            )}


                        </div>}
                    </>
                )}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="sr" style={{ borderLeft: `1px solid ${C.border}`, padding: "18px 14px", background: C.surface, display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 54, height: "calc(100vh - 54px)", overflowY: "auto", alignSelf: "start" }}>
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
                      <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>AI PREDICTION SUMMARY</div>
                      {/* Win prob — big */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
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
                      {/* Why factors */}
                      {(() => {
                        const factors = [];
                        const pitch = (pred.pitchLabel || "").toLowerCase();
                        if (pitch.includes("bat")) factors.push({ label: "Batting pitch", color: "#22c55e" });
                        else if (pitch.includes("bowl") || pitch.includes("spin") || pitch.includes("seam")) factors.push({ label: "Bowling pitch", color: "#f59e0b" });
                        if (pred.currentPhase) factors.push({ label: pred.currentPhase, color: "#818cf8" });
                        if (pred.pressureScore > 60) factors.push({ label: `Pressure ${pred.pressureScore}/100`, color: "#ef4444" });
                        if (pred.bowlingFactor <= 0.84) factors.push({ label: "Elite bowling", color: "#22c55e" });
                        if (pred.battingFactor >= 1.15) factors.push({ label: "Strong batting", color: "#22c55e" });
                        if (factors.length === 0) return null;
                        return (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, letterSpacing: 1.2, marginBottom: 6 }}>WHY</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                              {factors.slice(0, 4).map((f, i) => (
                                <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: f.color + "15", color: f.color, border: `1px solid ${f.color}30` }}>{f.label}</span>
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
                {/* ── LIVE PREDICTIONS (hidden for ended matches) ── */}
                {!isEnded && pred?.livePredictions && (
                    <div style={{ background: "#0D1117", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "12px 14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: "#818CF8", letterSpacing: 1.5, marginBottom: 10 }}>🎯 WHAT HAPPENS NEXT?</div>

                        {/* Batsman 50 */}
                        {pred.livePredictions.batsman50 && (() => {
                            const b = pred.livePredictions.batsman50;
                            const prob = b.prob;
                            const color = b.done ? "#10B981" : prob >= 65 ? "#10B981" : prob >= 40 ? "#F59E0B" : "#EF4444";
                            return (
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>{b.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 900, color }}>{b.done ? "✓" : `${prob}%`}</span>
                                    </div>
                                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${prob}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.5s" }} />
                                    </div>
                                    <div style={{ fontSize: 9, color: "#64748B", marginTop: 3 }}>{b.detail}</div>
                                </div>
                            );
                        })()}

                        {/* Boundary next over */}
                        {(() => {
                            const b = pred.livePredictions.boundary;
                            const color = b.prob >= 70 ? "#10B981" : b.prob >= 50 ? "#F59E0B" : "#EF4444";
                            return (
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>🏏 {b.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 900, color }}>{b.prob}%</span>
                                    </div>
                                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${b.prob}%`, height: "100%", background: color, borderRadius: 4 }} />
                                    </div>
                                    <div style={{ fontSize: 9, color: "#64748B", marginTop: 3 }}>{b.detail}</div>
                                </div>
                            );
                        })()}

                        {/* Wicket next 3 overs */}
                        {(() => {
                            const w = pred.livePredictions.wicket3overs;
                            const color = w.prob >= 60 ? "#EF4444" : w.prob >= 40 ? "#F59E0B" : "#10B981";
                            return (
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}>🎳 {w.label}</span>
                                        <span style={{ fontSize: 13, fontWeight: 900, color }}>{w.prob}%</span>
                                    </div>
                                    <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{ width: `${w.prob}%`, height: "100%", background: color, borderRadius: 4 }} />
                                    </div>
                                    <div style={{ fontSize: 9, color: "#64748B", marginTop: 3 }}>{w.detail}</div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {pred && pred.team1 && (
                    <div style={{ background: C.bg, borderRadius: 12, padding: "10px 12px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>MATCH CONTEXT</div>
                        {[
                            ["Format", pred.matchType?.toUpperCase() || "T20"],
                            ["Phase", pred.currentPhase || ""],
                            ["Pitch", pred.pitchLabel || ""],
                            ["Weather", pred.weatherImpact?.condition || ""],
                        ].filter(([, v]) => v).map(([l, v]) => (
                            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                                <span style={{ fontSize: 11, color: C.muted }}>{l}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: C.text, maxWidth: 110, textAlign: "right" }}>{v}</span>
                            </div>
                        ))}
                        {pred.toss && (
                            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 9, marginTop: 4 }}>
                                <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>TOSS</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: C.text }}>{pred.toss.winner} won · {pred.toss.decision}</div>
                            </div>
                        )}
                    </div>
                )}

                <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, textAlign: "center" }}>
                    <a href="/about" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>About Us</a>
                    <span style={{ color: C.border, margin: "0 6px" }}>·</span>
                    <a href="mailto:emmadi.dev@gmail.com" style={{ color: C.accent, fontWeight: 600, textDecoration: "none" }}>Contact</a>
                </div>
            </aside>
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
