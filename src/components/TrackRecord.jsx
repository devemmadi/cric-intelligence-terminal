/* eslint-disable */
import React, { useEffect, useState } from "react";
import { API_BASE, C } from "./shared/constants";

function HitRateRing({ pct }) {
    const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
    const filled = circ * (pct / 100);
    const color = pct >= 65 ? "#00B894" : pct >= 50 ? "#F59E0B" : "#E53E3E";
    return (
        <svg width={128} height={128} viewBox="0 0 128 128">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={`${filled} ${circ}`}
                strokeDashoffset={circ * 0.25}
                style={{ transition: "stroke-dasharray 1s ease" }} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={26} fontWeight={900}
                fill="#FFFFFF" fontFamily="Inter, system-ui">{pct}%</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.5)"
                fontFamily="Inter, system-ui" letterSpacing={1.5}>HIT RATE</text>
        </svg>
    );
}

function ResultBadge({ correct }) {
    if (correct === null || correct === undefined) {
        return (
            <span style={{
                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
                background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)",
                letterSpacing: 0.5
            }}>PENDING</span>
        );
    }
    return (
        <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6,
            background: correct ? "rgba(0,184,148,0.18)" : "rgba(229,62,62,0.18)",
            color: correct ? "#00B894" : "#E53E3E",
            letterSpacing: 0.5
        }}>{correct ? "✓ WIN" : "✗ LOSS"}</span>
    );
}

function MatchRow({ rec, index }) {
    const t1 = (rec.team1 || "").split(",")[0].trim().toUpperCase();
    const t2 = (rec.team2 || "").split(",")[0].trim().toUpperCase();
    const pred = (rec.predicted_winner || "").split(",")[0].trim().toUpperCase();
    const prob = rec.predicted_prob ? Math.round(rec.predicted_prob) : "–";
    const dateStr = rec.ts ? new Date(rec.ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "";
    const venue = rec.venue ? rec.venue.split(",")[0].trim() : "";

    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            animation: `fadeUp 0.3s ease ${index * 40}ms both`,
            background: rec.correct === true ? "rgba(0,184,148,0.04)"
                : rec.correct === false ? "rgba(229,62,62,0.04)"
                    : "transparent",
        }}>
            {/* Index */}
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", minWidth: 20, textAlign: "right" }}>
                {index + 1}
            </span>

            {/* Teams */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {t1} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>vs</span> {t2}
                </div>
                {venue && (
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {venue} {rec.match_type ? `· ${rec.match_type}` : ""}
                    </div>
                )}
            </div>

            {/* Predicted */}
            <div style={{ textAlign: "center", minWidth: 80 }}>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Predicted</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#60A5FA" }}>{pred}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{prob}%</div>
            </div>

            {/* Date */}
            <div style={{ minWidth: 38, textAlign: "center" }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{dateStr}</span>
            </div>

            {/* Result */}
            <div style={{ minWidth: 72, textAlign: "right" }}>
                <ResultBadge correct={rec.correct} />
            </div>
        </div>
    );
}

export default function TrackRecord() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE}/match-record`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { setError("Could not load track record."); setLoading(false); });
    }, []);

    const records = data?.records || [];
    const hitRate = data?.hitRate ?? null;
    const total = data?.totalResolved ?? 0;
    const correct = data?.correct ?? 0;
    const pending = records.filter(r => r.correct === null || r.correct === undefined).length;

    return (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 16px 120px" }}>

            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, marginBottom: 4 }}>
                    AI Track Record
                </h2>
                <p style={{ fontSize: 13, color: C.muted }}>
                    Last {records.length} match predictions — verified against actual results
                </p>
            </div>

            {/* Hero card */}
            <div style={{
                background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`,
                borderRadius: 20, padding: "24px 20px", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 24,
                boxShadow: "0 8px 32px rgba(30,45,107,0.25)"
            }}>
                <HitRateRing pct={hitRate !== null ? hitRate : 0} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>
                        Overall Accuracy
                    </div>
                    {loading ? (
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Loading…</div>
                    ) : error ? (
                        <div style={{ fontSize: 13, color: "#E53E3E" }}>{error}</div>
                    ) : (
                        <>
                            <div style={{ fontSize: 36, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
                                {hitRate !== null ? `${hitRate}%` : "—"}
                            </div>
                            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                                {correct} correct / {total} resolved
                                {pending > 0 && <span style={{ color: "#F59E0B" }}> · {pending} pending</span>}
                            </div>
                            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                                {[
                                    { label: "✓ Correct", val: correct, color: "#00B894", bg: "rgba(0,184,148,0.18)" },
                                    { label: "✗ Wrong", val: total - correct, color: "#E53E3E", bg: "rgba(229,62,62,0.18)" },
                                    { label: "⏳ Pending", val: pending, color: "#F59E0B", bg: "rgba(245,158,11,0.18)" },
                                ].map(({ label, val, color, bg }) => (
                                    <div key={label} style={{ padding: "5px 12px", borderRadius: 8, background: bg, color, fontSize: 12, fontWeight: 700 }}>
                                        {label} · {val}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Records list */}
            <div style={{
                background: "#FFFFFF", border: `1px solid ${C.border}`,
                borderRadius: 16, overflow: "hidden"
            }}>
                {/* List header */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 16px",
                    background: C.navy,
                    borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", minWidth: 20 }}>#</span>
                    <span style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 0.5 }}>MATCH</span>
                    <span style={{ minWidth: 80, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 0.5 }}>PREDICTED</span>
                    <span style={{ minWidth: 38, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>DATE</span>
                    <span style={{ minWidth: 72, textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, letterSpacing: 0.5 }}>RESULT</span>
                </div>

                {/* Rows */}
                <div style={{ background: "#0F172A" }}>
                    {loading && (
                        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                            Loading predictions…
                        </div>
                    )}
                    {!loading && error && (
                        <div style={{ padding: 40, textAlign: "center", color: "#E53E3E", fontSize: 14 }}>
                            {error}
                        </div>
                    )}
                    {!loading && !error && records.length === 0 && (
                        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
                            No predictions logged yet. Check back after live matches!
                        </div>
                    )}
                    {!loading && !error && records.map((rec, i) => (
                        <MatchRow key={rec.id || i} rec={rec} index={i} />
                    ))}
                </div>
            </div>

            {/* Disclaimer */}
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(30,45,107,0.06)", borderRadius: 10, borderLeft: `3px solid ${C.navyLight}` }}>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                    Results are auto-logged from live match predictions. "Pending" means the match is still in progress or result hasn't been verified yet. Hit rate is calculated only on resolved matches.
                </p>
            </div>
        </div>
    );
}
