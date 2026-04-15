/* eslint-disable */
import React, { useMemo, useRef, useEffect, useState } from "react";

const W = 600, H = 220, PAD = { top: 18, right: 18, bottom: 32, left: 44 };
const INNER_W = W - PAD.left - PAD.right;
const INNER_H = H - PAD.top - PAD.bottom;

function toX(over) { return PAD.left + (over / 20) * INNER_W; }
function toY(prob) { return PAD.top + (1 - prob / 100) * INNER_H; }

export default function LiveProbabilityGraph({ pred }) {
    const history = pred?.probHistory || [];
    const team1 = (pred?.team1 || "Team 1").split(",")[0].trim();
    const team2 = (pred?.team2 || "Team 2").split(",")[0].trim();
    const currentProb = pred?.aiProbability ?? 50;
    const innings = pred?.innings ?? 1;

    const [animLen, setAnimLen] = useState(0);
    const pathRef = useRef(null);
    const prevHistLen = useRef(0);

    // Build points: always start at over=0, prob=50
    const points = useMemo(() => {
        const base = [{ over: 0, prob: 50, wkts: 0 }];
        const seen = new Set([0]);
        for (const p of history) {
            if (!seen.has(p.over)) {
                base.push(p);
                seen.add(p.over);
            }
        }
        return base.sort((a, b) => a.over - b.over);
    }, [history]);

    // Animate path on new data
    useEffect(() => {
        if (!pathRef.current) return;
        const len = pathRef.current.getTotalLength?.() || 0;
        if (points.length !== prevHistLen.current) {
            setAnimLen(len);
            prevHistLen.current = points.length;
        }
    }, [points]);

    const linePath = useMemo(() => {
        if (points.length < 2) return "";
        return points.map((p, i) => {
            const x = toX(p.over), y = toY(p.prob);
            if (i === 0) return `M ${x} ${y}`;
            const prev = points[i - 1];
            const cpx = (toX(prev.over) + x) / 2;
            return `C ${cpx} ${toY(prev.prob)} ${cpx} ${y} ${x} ${y}`;
        }).join(" ");
    }, [points]);

    const fillPath = linePath
        ? `${linePath} L ${toX(points[points.length - 1].over)} ${toY(0)} L ${toX(0)} ${toY(0)} Z`
        : "";

    // Wicket markers
    const wicketPoints = useMemo(() =>
        points.filter((p, i) => i > 0 && p.wkts > 0),
        [points]);

    const lastPt = points[points.length - 1];
    // Normalize: innings 2 aiProbability = chasing team2's prob → invert for team1
    const normProb = innings === 2 ? Math.round((100 - currentProb) * 10) / 10 : currentProb;
    const favor = normProb >= 50 ? team1 : team2;
    const favorProb = normProb >= 50 ? normProb : 100 - normProb;
    const probColor = favorProb >= 70 ? "#00C896" : favorProb >= 55 ? "#3B82F6" : "#F59E0B";

    if (history.length < 2) {
        return (
            <div style={{ background: "#0D1B2A", border: "1px solid #1E293B", borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>📈 Live Probability Graph</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)" }}>Graph builds as the match progresses…</div>
                <div style={{ marginTop: 12, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: "30%", background: "linear-gradient(90deg,transparent,#3B82F6,transparent)", animation: "shimmer 1.8s infinite" }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: "#0D1B2A", border: "1px solid #1E293B", borderRadius: 14, padding: "14px 16px 10px", userSelect: "none" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: 0.5, textTransform: "uppercase" }}>
                        📈 Live Probability Graph
                    </div>
                    <div style={{ fontSize: 13, color: "#fff", fontWeight: 700, marginTop: 2 }}>
                        <span style={{ color: probColor }}>{favor}</span>
                        <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 400 }}> leading — </span>
                        <span style={{ color: probColor }}>{favorProb}%</span>
                    </div>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Inn {innings}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{lastPt?.over || 0} ov</div>
                </div>
            </div>

            {/* SVG Chart */}
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}>
                <defs>
                    <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={probColor} stopOpacity="0.22" />
                        <stop offset="100%" stopColor={probColor} stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* Grid lines — horizontal */}
                {[25, 50, 75].map(p => (
                    <g key={p}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={toY(p)} y2={toY(p)}
                            stroke={p === 50 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.05)"}
                            strokeWidth={p === 50 ? 1.5 : 1}
                            strokeDasharray={p === 50 ? "none" : "4 4"} />
                        <text x={PAD.left - 6} y={toY(p) + 4} fontSize={9} fill="rgba(255,255,255,0.3)" textAnchor="end">{p}%</text>
                    </g>
                ))}

                {/* Grid lines — vertical (overs) */}
                {[0, 6, 10, 15, 20].map(ov => (
                    <g key={ov}>
                        <line x1={toX(ov)} x2={toX(ov)} y1={PAD.top} y2={H - PAD.bottom}
                            stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
                        <text x={toX(ov)} y={H - PAD.bottom + 12} fontSize={9} fill="rgba(255,255,255,0.28)" textAnchor="middle">
                            {ov === 6 ? "PP" : ov === 0 ? "" : `${ov}`}
                        </text>
                    </g>
                ))}

                {/* Fill area */}
                {fillPath && (
                    <path d={fillPath} fill="url(#fillGrad)" />
                )}

                {/* Main probability line */}
                {linePath && (
                    <path
                        ref={pathRef}
                        d={linePath}
                        fill="none"
                        stroke={probColor}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter="url(#glow)"
                        style={{
                            transition: "d 0.6s cubic-bezier(.22,.68,0,1.2)",
                        }}
                    />
                )}

                {/* Wicket markers */}
                {wicketPoints.map((p, i) => (
                    <g key={i}>
                        <circle cx={toX(p.over)} cy={toY(p.prob)} r={5} fill="#EF4444" stroke="#0D1B2A" strokeWidth={1.5} />
                        <text x={toX(p.over)} y={toY(p.prob) - 8} fontSize={8} fill="#EF4444" textAnchor="middle">W</text>
                    </g>
                ))}

                {/* Current point — pulsing dot */}
                {lastPt && lastPt.over > 0 && (
                    <g>
                        <circle cx={toX(lastPt.over)} cy={toY(lastPt.prob)} r={8} fill={probColor} opacity={0.18}>
                            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.18;0.04;0.18" dur="2s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={toX(lastPt.over)} cy={toY(lastPt.prob)} r={4.5} fill={probColor} stroke="#0D1B2A" strokeWidth={1.5} />
                        {/* Prob label */}
                        <text
                            x={Math.min(toX(lastPt.over) + 6, W - PAD.right - 20)}
                            y={toY(lastPt.prob) - 8}
                            fontSize={10} fill={probColor} fontWeight="700"
                        >{lastPt.prob}%</text>
                    </g>
                )}

                {/* Team labels at sides */}
                <text x={PAD.left + 4} y={PAD.top + 13} fontSize={10} fill="rgba(255,255,255,0.5)" fontWeight="600">{team1}</text>
                <text x={PAD.left + 4} y={H - PAD.bottom - 6} fontSize={10} fill="rgba(255,255,255,0.35)">{team2} winning ↓</text>
            </svg>

            {/* Legend */}
            <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 20, height: 2.5, background: probColor, borderRadius: 2 }} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Win Probability</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Wicket</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: probColor }} />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Current</span>
                </div>
            </div>
        </div>
    );
}
