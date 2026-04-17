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

function LiveScorecard({ batters, bowler }) {
    if (!batters || batters.length === 0) return null;
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
                    const srColor = sr >= 180 ? "#15803D" : sr >= 150 ? "#16A34A" : sr >= 120 ? "#B45309" : sr >= 80 ? "#64748B" : "#DC2626";
                    const srBg   = sr >= 150 ? "#DCFCE7" : sr >= 120 ? "#FEF3C7" : sr < 80 ? "#FEE2E2" : "#F1F5F9";
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


// ─── Batter Score Prediction Card ────────────────────────────────────────────
function BatterAnalysisCard({ analysis }) {
    if (!analysis || analysis.length === 0) return null;

    function scoreLabel(pct) {
        if (pct >= 65) return { text: "Very likely ✅", color: "#16A34A", bg: "#DCFCE7" };
        if (pct >= 40) return { text: "Possible 🟡", color: "#B45309", bg: "#FEF3C7" };
        return { text: "Unlikely ❌", color: "#DC2626", bg: "#FEE2E2" };
    }

    return (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "10px 16px", background: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🏏</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 1 }}>Will they score big?</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginLeft: "auto" }}>AI prediction</span>
            </div>
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {analysis.filter(b => !b.noData).map((b, i) => {
                    const prob20 = b.prob20plus || 0;
                    const prob50 = b.prob50plus || 0;
                    const lbl20 = scoreLabel(prob20);
                    const lbl50 = scoreLabel(prob50);
                    const expMore = b.expectedMore || 0;
                    const isStriker = b.isStriker;
                    return (
                        <div key={i} style={{
                            borderRadius: 12, padding: "14px",
                            background: isStriker ? "#F0FDF4" : "#F8FAFC",
                            border: isStriker ? "2px solid #22C55E" : "1px solid #E2E8F0",
                        }}>
                            {/* Name row */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                {isStriker && <span style={{ fontSize: 12 }}>▶</span>}
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{b.name}</span>
                                <span style={{ fontSize: 12, color: "#64748B" }}>{b.runs ?? 0} off {b.balls ?? 0} balls</span>
                                {isStriker && (
                                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: "#16A34A",
                                        background: "#DCFCE7", padding: "2px 8px", borderRadius: 20 }}>batting now</span>
                                )}
                            </div>

                            {/* AI expects */}
                            <div style={{ fontSize: 12, color: "#475569", marginBottom: 10, background: "#fff",
                                borderRadius: 8, padding: "8px 12px", border: "1px solid #E2E8F0" }}>
                                🤖 AI expects <strong style={{ color: "#0F172A" }}>~{expMore} more runs</strong> before getting out
                            </div>

                            {/* Score probability — 2 big tiles */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div style={{ background: lbl20.bg, borderRadius: 10, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4, fontWeight: 600 }}>Scores 20+ runs?</div>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: lbl20.color, lineHeight: 1, marginBottom: 3 }}>{prob20}%</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: lbl20.color }}>{lbl20.text}</div>
                                </div>
                                <div style={{ background: lbl50.bg, borderRadius: 10, padding: "10px 12px" }}>
                                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4, fontWeight: 600 }}>Scores 50+ runs?</div>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: lbl50.color, lineHeight: 1, marginBottom: 3 }}>{prob50}%</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: lbl50.color }}>{lbl50.text}</div>
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
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(0,200,150,0.06)", border: "1px solid rgba(0,200,150,0.2)", borderRadius: 10, padding: "8px 14px", marginBottom: 12 }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#00C896" }}>{info.hitRate}%</span>
            <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>AI Track Record </span>
                <span style={{ fontSize: 11, color: C.muted }}>{info.correct}/{info.total} correct predictions</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#00C896", background: "rgba(0,200,150,0.12)", padding: "2px 8px", borderRadius: 20 }}>✓ Verified</span>
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

    let signal, signalColor, signalBg;
    if (prob >= 65 || prob <= 35) {
        signal = "BET";
        signalColor = "#00C896";
        signalBg = "linear-gradient(145deg, #022c22 0%, #064e3b 60%, #065f46 100%)";
    } else if (prob >= 55 || prob <= 45) {
        signal = "WAIT";
        signalColor = "#F59E0B";
        signalBg = "linear-gradient(145deg, #1c0f00 0%, #451a03 60%, #78350f 100%)";
    } else {
        signal = "AVOID";
        signalColor = "#EF4444";
        signalBg = "linear-gradient(145deg, #1a0000 0%, #450a0a 60%, #7f1d1d 100%)";
    }

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
        reasons.push(`${battingTeam} needs ${needed} more runs off ${ballsLeft} balls`);
        if (wktsLeft <= 3) reasons.push(`Only ${wktsLeft} wickets left — tail exposed`);
        else reasons.push(`${wktsLeft} wickets in hand`);
        if (rrr > crr + 2) reasons.push(`Need ${rrr.toFixed(1)}/ov but scoring ${crr.toFixed(1)} — falling behind`);
        else if (crr > rrr + 1) reasons.push(`Scoring ${crr.toFixed(1)}/ov, need ${rrr.toFixed(1)} — well in control`);
        else reasons.push(`Required rate ${rrr.toFixed(1)} — match in the balance`);
    } else if (inn === 1 && crr > 0) {
        const vsAvg = pred.momentum || 0;
        reasons.push(`${battingTeam} scoring ${crr.toFixed(1)}/ov — ${vsAvg > 0.5 ? "above par" : vsAvg < -0.5 ? "below par" : "on par"}`);
        const pitch = (pred.pitchLabel || "").toLowerCase();
        if (pitch.includes("bowl") || pitch.includes("spin") || pitch.includes("seam")) reasons.push("Bowling-friendly conditions");
        else if (pitch.includes("bat") || pitch.includes("flat")) reasons.push("Flat pitch — batters on top");
        if (pred.currentPhase === "POWERPLAY") reasons.push("Powerplay overs — key phase");
        else if (pred.currentPhase === "DEATH OVERS") reasons.push("Death overs — big hitting phase");
        else if (pred.currentPhase === "MIDDLE OVERS") reasons.push("Middle overs — wickets crucial now");
    }
    while (reasons.length < 3) {
        if (pred.nextOvers?.[0]) { reasons.push(`Next over: ${pred.nextOvers[0].runRange} runs expected`); break; }
        reasons.push(pred.pressureScore > 65 ? "Batting under heavy pressure" : "Match developing normally");
        break;
    }

    return (
        <div style={{ background: signalBg, borderRadius: 20, padding: "20px", marginBottom: 14, position: "relative", overflow: "hidden" }}>
            {/* Ambient glow */}
            <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: signalColor + "12", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: favTeamColor + "0A", pointerEvents: "none" }} />

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
            <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", letterSpacing: 1, marginBottom: 8 }}>
                    {signal === "BET" ? "OUR PICK" : signal === "WAIT" ? "NOT YET — WAIT" : "TOO CLOSE TO CALL"}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 14 }}>
                    <div style={{ fontSize: 58, fontWeight: 900, color: signalColor, lineHeight: 1, letterSpacing: -2 }}>{favProb}%</div>
                    <div style={{ textAlign: "left" }}>
                        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -1 }}>{favTeam}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>to win · {confidence} confidence</div>
                    </div>
                </div>
                {/* Dual-colour probability bar */}
                <div style={{ height: 8, borderRadius: 4, background: `${t2Color}44`, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ width: `${prob}%`, height: "100%", background: `linear-gradient(90deg, ${t1Color}, ${t1Color}cc)`, borderRadius: 4, transition: "width 0.8s cubic-bezier(.4,0,.2,1)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>{t1} {prob}%</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{t2} {Math.round((100 - prob) * 10) / 10}%</span>
                </div>
            </div>

            {/* 3 reasons */}
            <div style={{ background: "rgba(0,0,0,0.28)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
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
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: signalColor, borderRadius: 12, padding: "14px 20px", textDecoration: "none", color: "#fff", fontWeight: 900, fontSize: 16, letterSpacing: 0.3, boxShadow: `0 6px 24px ${signalColor}55`, marginBottom: 8 }}>
                    🎰 BET {favTeam} on 1xBet
                </a>
            ) : signal === "WAIT" ? (
                <div style={{ textAlign: "center", padding: "12px", background: "rgba(245,158,11,0.12)", borderRadius: 12, border: "1px solid rgba(245,158,11,0.3)", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F59E0B" }}>⏳ Wait for a clearer signal</span>
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "12px", background: "rgba(239,68,68,0.1)", borderRadius: 12, border: "1px solid rgba(239,68,68,0.25)", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#EF4444" }}>🚫 Avoid — too unpredictable</span>
                </div>
            )}

            <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
                18+ · <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: "rgba(255,255,255,0.22)" }}>BeGambleAware.org</a>
            </div>
        </div>
    );
}

function NoMatchesScreen({ upcomingMatches }) {
    const scheduleMatches = upcomingMatches && upcomingMatches.length > 0 ? upcomingMatches : [];
    return (
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "28px 20px 60px" }}>
            <div style={{ textAlign: "center", padding: "48px 24px", maxWidth: 400, margin: "0 auto" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏏</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>
                    No live matches right now
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 24 }}>
                    CricIntelligence tracks all IPL, PSL and international T20 matches.<br/>
                    Check back when a match goes live.
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                    {[
                        { icon: "🤖", label: "ML Predictions" },
                        { icon: "📊", label: "Pitch Analysis" },
                        { icon: "💡", label: "Bet Signals" },
                    ].map((f, i) => (
                        <div key={i} style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 12, color: C.text }}>
                            {f.icon} {f.label}
                        </div>
                    ))}
                </div>
            </div>
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
            <div style={{ flex: 1, height: 1, background: "#E2E8F0" }} />
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
            borderRight: `1px solid ${C.border}`,
            background: C.surface,
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
                background: liveList.length > 0 ? "#FFF0F0" : "#EEF2FF",
                border: `1px solid ${liveList.length > 0 ? "#FECACA" : "#C7D2FE"}`,
                borderRadius: 8,
            }}>
                {liveList.length > 0 && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 11, fontWeight: 800, color: liveList.length > 0 ? "#DC2626" : C.navy, flex: 1 }}>
                    {liveList.length > 0 ? `${liveList.length} Live Match${liveList.length > 1 ? "es" : ""}` : "Match Centre"}
                </span>
                <span style={{ fontSize: 10, color: C.muted }}>{liveMatches.length} total</span>
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
                <div style={{ marginTop: 14, padding: "10px 12px", background: C.bg, borderRadius: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>RUNS TREND</div>
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
    const _st = selectedMatch?.rawStatus || pred?.matchStatus || "";
    const isEnded = selectedMatch?.status === "ENDED" || _st.toLowerCase().includes("won by") || _st.toLowerCase().includes(" beat ") || _st.toLowerCase().includes("match tied") || _st.toLowerCase().includes("no result");

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
                                        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{pred.displayScore}</span>
                                        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.2)" }} />
                                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Rate {pred.currentRunRate || ""}</span>
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
                                    { label: "🤖 ML model — 80% accuracy" },
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

                            {/* ── FAIR ODDS (collapsed below hero) ── */}
                            {pred.aiProbability !== undefined && (() => {
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

                            <div className="cr" style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 14, alignItems: "start" }}>
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

                                {/* Right column: scorecard + win prob */}
                                <div style={{ position: "sticky", top: 54, display: "flex", flexDirection: "column", gap: 14 }}>
                                    {pred.batters && pred.batters.length > 0 && (
                                        <LiveScorecard batters={pred.batters} bowler={pred.bowler || {}} />
                                    )}
                                    <div className="card" style={{ padding: 22 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>Win probability</div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: winColor, marginBottom: 8, letterSpacing: 0.3 }}>{winMsg}</div>
                                        <WinArc value={prob} />
                                        <div style={{ fontSize: 11, color: C.muted, marginTop: 6, textAlign: "center" }}>{cleanTeam(pred.team1)} · {prob}%</div>
                                    </div>
                                    <div className="card" style={{ padding: 22 }}>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Match intel</div>
                                        {pred.pressureScore !== undefined && (
                                            <div style={{ marginBottom: 14 }}>
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
                                        <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: C.muted }}>{pred.weatherImpact?.tip || "Bright conditions favour batters."}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Live Probability Graph */}
                            {pred.overs > 0 && (
                                <div style={{ marginBottom: 14 }}>
                                    <LiveProbabilityGraph pred={pred} />
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

                            <div className="cr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                                <div className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                                    <span style={{ fontSize: 32 }}>{pred.weatherImpact?.emoji || "🌤"}</span>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>WEATHER</div>
                                        <div style={{ fontSize: 20, fontWeight: 900 }}>{pred.weather?.temp || ""}°C</div>
                                        <div style={{ fontSize: 11, color: C.muted }}>{pred.weather?.condition || ""}</div>
                                    </div>
                                </div>
                                <div className="card" style={{ padding: 18 }}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase" }}>PITCH</div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{pred.pitchLabel || ""}</div>
                                    <div style={{ fontSize: 11, color: C.muted }}>{pred.pitchCondition || ""}</div>
                                </div>
                            </div>

                        </div>}
                    </>
                )}
            </main>

            {/* RIGHT SIDEBAR */}
            <aside className="sr" style={{ borderLeft: `1px solid ${C.border}`, padding: "18px 14px", background: C.surface, display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 54, height: "calc(100vh - 54px)", overflowY: "auto", alignSelf: "start" }}>
                {pred && pred.team1 && (
                    <div style={{ background: C.bg, borderRadius: 12, padding: "14px" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>MATCH CONTEXT</div>
                        {[
                            ["Format", pred.matchType?.toUpperCase() || "T20"],
                            ["Phase", pred.currentPhase || ""],
                            ["Pitch", pred.pitchLabel || ""],
                            ["Weather", pred.weatherImpact?.condition || ""],
                        ].map(([l, v]) => (
                            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9 }}>
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
                {pred && pred.team1 && (
                  <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, background: C.bg }}>
                    {/* Team probability mini-bar */}
                    <div style={{ height: 4, background: `${getTeamColor(pred.team2)}66`, position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${prob}%`, background: getTeamColor(pred.team1), transition: "width 0.8s" }} />
                    </div>
                    <div style={{ padding: "14px 14px 12px" }}>
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
                      {/* Next over + wicket risk */}
                      {pred.nextOvers?.[0] && (<>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: C.muted }}>Next over</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{pred.nextOvers[0].runRange} runs</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <span style={{ fontSize: 11, color: C.muted }}>Wicket risk</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: pred.nextOvers[0].wicketProb > 40 ? C.red : pred.nextOvers[0].wicketProb > 25 ? C.amber : C.green }}>
                            {pred.nextOvers[0].wicketProb > 40 ? "High" : pred.nextOvers[0].wicketProb > 25 ? "Med" : "Low"} · {pred.nextOvers[0].wicketProb}%
                          </span>
                        </div>
                      </>)}
                      {/* Bet CTA — dynamic team name */}
                      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>Act on this prediction</div>
                        <a href="https://reffpa.com/L?tag=d_5453500m_97c_&site=5453500&ad=97" target="_blank" rel="noreferrer noopener"
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: prob >= 65 ? "#065f46" : prob <= 35 ? "#065f46" : C.navy, border: `1px solid ${prob >= 65 || prob <= 35 ? "rgba(0,200,150,0.4)" : C.navyLight || "#2A3F6F"}`, borderRadius: 8, padding: "10px 14px", textDecoration: "none", fontWeight: 800, fontSize: 13, color: prob >= 65 || prob <= 35 ? "#00C896" : "rgba(255,255,255,0.85)" }}>
                          🎰 BET {prob >= 50 ? cleanTeam(pred.team1) : cleanTeam(pred.team2)} on 1xBet
                        </a>
                      </div>
                      <div style={{ fontSize: 9, color: C.muted, textAlign: "center" }}>
                        18+ · <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: C.muted }}>BeGambleAware.org</a>
                      </div>
                    </div>
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
