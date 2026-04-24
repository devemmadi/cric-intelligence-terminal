/* eslint-disable */
import React from "react";
import { C, API_BASE, getLeague } from "./constants";
import TeamLogo from "./TeamLogo";

/** Tiny team logo */
function MiniLogo({ imgId, name, size = 20 }) {
    return (
        <img
            src={`${API_BASE}/team-image/${imgId || 0}`}
            style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", background: "#1E293B", flexShrink: 0 }}
            alt={name || ""}
            onError={e => { e.target.style.display = "none"; }}
        />
    );
}

/** Format overs nicely: 12.2 → "12.2 ov" */
function fmtOvers(ov) {
    if (ov == null || ov === 0) return null;
    return `${ov} ov`;
}

/** Format score: runs/wkts (overs) */
function fmtScore(runs, wkts, overs) {
    if (runs == null) return null;
    const score = wkts != null ? `${runs}/${wkts}` : `${runs}`;
    const ovStr = fmtOvers(overs);
    return ovStr ? `${score} (${ovStr})` : score;
}

/** Small pill in the left sidebar — ultra-compact single-card */
export function MatchPill({ m, selected, onClick }) {
    const isLive     = m.isLive || (m.matchStarted && !m.matchEnded);
    const isEnded    = m.matchEnded || m.status === "ENDED";
    const isUpcoming = !isLive && !isEnded;
    const league     = getLeague(m);

    const t1 = m.t1 || m.team1 || "?";
    const t2 = m.t2 || m.team2 || "?";

    // Batting team is bold — inn1 = t1, inn2 = t2
    const inn = m.innings || 1;
    const t1Batting = inn === 1;

    const t1ScoreStr = fmtScore(m.t1Score, m.t1Wkts, m.t1Overs);
    const t2ScoreStr = fmtScore(m.t2Score, m.t2Wkts, m.t2Overs);
    const hasScore   = t1ScoreStr || t2ScoreStr;

    // Target line for inn2
    const showTarget = isLive && inn === 2 && m.target > 0 && m.t2Score != null;
    const runsNeeded = showTarget ? m.target - (m.t2Score || 0) : null;

    const accentColor = isLive ? "#DC2626" : isUpcoming ? "#D97706" : "#CBD5E1";
    const bgColor     = selected ? (isLive ? "#FFF5F5" : "#EEF2FF") : "#fff";
    const borderColor = selected ? (isLive ? "#FCA5A5" : "#A5B4FC") : "#E2E8F0";

    return (
        <div
            onClick={onClick}
            style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: 10,
                padding: "9px 10px",
                marginBottom: 5,
                cursor: "pointer",
                transition: "background 0.12s, border-color 0.12s",
                userSelect: "none",
                boxShadow: selected ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
            }}
        >
            {/* Row 1: logos + team names + scores */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                {/* Stacked logos */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                    <MiniLogo imgId={m.t1ImageId || m.team1ImageId} name={t1} size={18} />
                    <MiniLogo imgId={m.t2ImageId || m.team2ImageId} name={t2} size={18} />
                </div>

                {/* Team names */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: t1Batting ? 700 : 500, color: t1Batting ? "#0F172A" : "#64748B", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t1}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: !t1Batting ? 700 : 500, color: !t1Batting ? "#0F172A" : "#64748B", lineHeight: 1.35, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t2}
                    </div>
                </div>

                {/* Right: scores */}
                <div style={{ textAlign: "right", flexShrink: 0, minWidth: 52 }}>
                    {hasScore ? (
                        <>
                            <div style={{ fontSize: 11, fontWeight: t1Batting ? 800 : 500, color: t1Batting ? "#0F172A" : "#94A3B8", lineHeight: 1.4 }}>
                                {t1ScoreStr ?? "–"}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: !t1Batting ? 800 : 500, color: !t1Batting ? "#0F172A" : "#94A3B8", lineHeight: 1.4 }}>
                                {t2ScoreStr ?? (isLive && inn === 2 ? "batting" : "–")}
                            </div>
                        </>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                            {isLive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#DC2626", display: "inline-block", animation: "pulse 1.5s infinite" }} />}
                            <span style={{ fontSize: 9, fontWeight: 700, color: accentColor, letterSpacing: 0.5 }}>
                                {isLive ? "LIVE" : isUpcoming ? "SOON" : "FT"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: format + target or status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 600, letterSpacing: 0.5 }}>
                    {(m.matchType || "T20").toUpperCase()}
                    {league.key !== "INT" && <span style={{ color: league.color, marginLeft: 5 }}>· {league.label}</span>}
                </span>
                {showTarget && runsNeeded != null && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: runsNeeded <= 0 ? "#10B981" : "#D97706" }}>
                        {runsNeeded <= 0 ? "WON" : `Need ${runsNeeded}`}
                    </span>
                )}
                {isLive && !showTarget && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, color: "#DC2626" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#DC2626", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                        LIVE
                    </span>
                )}
            </div>
        </div>
    );
}

/** Full match card used in Matches tab */
export function MatchCard({ m, onClick }) {
    const league = getLeague(m);
    return (
        <div className="card" style={{ padding: 16, marginBottom: 10, cursor: "pointer", opacity: m.status === "ENDED" ? 0.8 : 1 }} onClick={onClick}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 11, color: "#64748B" }}>{m.day} · {m.detail?.split("–")[0]?.trim()}</span>
                    {league.key !== 'INT' && (
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: league.key === 'IPL' ? '#FEF3C7' : '#D1FAE5', color: league.color }}>{league.label}</span>
                    )}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                    background: m.status === "LIVE" ? "#FFF0F0" : m.status === "UPCOMING" ? "#EFF6FF" : "#F0F0F0",
                    color: m.status === "LIVE" ? "#E53E3E" : m.status === "UPCOMING" ? "#1E2D6B" : "#64748B" }}>
                    {m.status === "LIVE" ? "LIVE" : m.status === "UPCOMING" ? "UPCOMING" : "ENDED"}
                </span>
            </div>
            {[{ n: m.t1, s: m.t1Score, w: m.t1Wkts, b: true, imgId: m.t1ImageId || 0 }, { n: m.t2, s: m.t2Score, b: false, imgId: m.t2ImageId || 0 }].map(({ n, s, w, b, imgId }) => (
                <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <TeamLogo name={n} size={32} imageId={imgId} />
                        <span style={{ fontSize: 16, fontWeight: b ? 700 : 400, color: b ? "#0A0A0A" : "#64748B" }}>{n}</span>
                    </div>
                    {s != null && <span style={{ fontSize: 16, fontWeight: b ? 700 : 400, color: b ? "#0A0A0A" : "#64748B" }}>{w != null ? `${s}/${w}` : s}</span>}
                </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "0.5px solid #E2E8F0" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: m.status === "ENDED" ? "#64748B" : m.status === "UPCOMING" ? "#1E2D6B" : "#00B894" }}>
                    {m.status === "ENDED" ? "View result →" : m.status === "UPCOMING" ? "Pre-match prediction →" : "View live prediction →"}
                </div>
                {m.status === "LIVE" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#E53E3E", fontWeight: 700 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#E53E3E", animation: "pulse 2s infinite" }} />
                        LIVE
                    </div>
                )}
            </div>
        </div>
    );
}
