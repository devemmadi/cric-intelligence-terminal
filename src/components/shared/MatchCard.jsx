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

/** Small pill in the left sidebar — ultra-compact single-card */
export function MatchPill({ m, selected, onClick }) {
    const isLive     = m.isLive || (m.matchStarted && !m.matchEnded);
    const isEnded    = m.matchEnded || m.status === "ENDED";
    const isUpcoming = !isLive && !isEnded;
    const league     = getLeague(m);

    const t1 = m.t1 || m.team1 || "?";
    const t2 = m.t2 || m.team2 || "?";

    // Score: show "117/5" for live batting team
    const t1Score = m.t1Score != null ? (m.t1Wkts != null ? `${m.t1Score}/${m.t1Wkts}` : `${m.t1Score}`) : null;
    const t2Score = m.t2Score != null ? (m.t2Wkts != null ? `${m.t2Score}/${m.t2Wkts}` : `${m.t2Score}`) : null;
    const hasScore = t1Score || t2Score;

    const accentColor = isLive ? "#EF4444" : isUpcoming ? "#F59E0B" : "#334155";
    const bgColor     = selected
        ? (isLive ? "rgba(239,68,68,0.12)" : "rgba(99,102,241,0.12)")
        : "rgba(255,255,255,0.02)";

    return (
        <div
            onClick={onClick}
            style={{
                background: bgColor,
                border: selected ? `1.5px solid ${isLive ? "#EF4444" : "#6366F1"}` : "1px solid #1E293B",
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: 9,
                padding: "9px 10px",
                marginBottom: 5,
                cursor: "pointer",
                transition: "background 0.12s, border-color 0.12s",
                userSelect: "none",
            }}
        >
            {/* Row 1: logos + team names + status */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Stacked logos */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
                    <MiniLogo imgId={m.t1ImageId || m.team1ImageId} name={t1} size={18} />
                    <MiniLogo imgId={m.t2ImageId || m.team2ImageId} name={t2} size={18} />
                </div>

                {/* Team names */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t1}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: "#64748B", lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {t2}
                    </div>
                </div>

                {/* Right: score or status */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {hasScore ? (
                        <>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>{t1Score ?? "–"}</div>
                            <div style={{ fontSize: 11, fontWeight: 500, color: "#475569", lineHeight: 1.3 }}>{t2Score ?? "–"}</div>
                        </>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {isLive && <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />}
                            <span style={{ fontSize: 9, fontWeight: 700, color: accentColor, letterSpacing: 0.5 }}>
                                {isLive ? "LIVE" : isUpcoming ? "SOON" : "FT"}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Row 2: format + league (only if needed) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 5 }}>
                <span style={{ fontSize: 9, color: "#334155", fontWeight: 600, letterSpacing: 0.5 }}>
                    {(m.matchType || "T20").toUpperCase()}
                    {league.key !== "INT" && <span style={{ color: league.color, marginLeft: 5 }}>· {league.label}</span>}
                </span>
                {isLive && hasScore && (
                    <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, color: "#EF4444" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
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
