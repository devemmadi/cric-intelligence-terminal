/* eslint-disable */
import React from "react";
import { C, API_BASE, getLeague } from "./constants";
import TeamLogo from "./TeamLogo";

/** Small pill in the left sidebar — compact dark card */
export function MatchPill({ m, selected, onClick }) {
    const isLive   = m.isLive || (m.matchStarted && !m.matchEnded);
    const isEnded  = m.matchEnded || m.status === "ENDED";
    const isUpcoming = !isLive && !isEnded;
    const league   = getLeague(m);

    const borderColor = isLive ? "#EF4444" : isUpcoming ? "#F59E0B" : "#1E293B";
    const bgColor     = selected ? (isLive ? "rgba(239,68,68,0.08)" : "rgba(99,102,241,0.1)") : "#0D1117";
    const borderFull  = selected ? `1.5px solid ${isLive ? "#EF4444" : "#6366F1"}` : `1px solid #1E293B`;

    const t1 = m.t1 || m.team1 || "?";
    const t2 = m.t2 || m.team2 || "?";

    // Score display
    const t1Score = m.t1Score != null ? (m.t1Wkts != null ? `${m.t1Score}/${m.t1Wkts}` : `${m.t1Score}`) : null;
    const t2Score = m.t2Score != null ? (m.t2Wkts != null ? `${m.t2Score}/${m.t2Wkts}` : `${m.t2Score}`) : null;

    return (
        <div
            onClick={onClick}
            style={{
                background: bgColor,
                border: borderFull,
                borderLeft: `3px solid ${borderColor}`,
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 6,
                cursor: "pointer",
                transition: "all 0.15s",
            }}
        >
            {/* Top row: format badge + status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: "#475569", letterSpacing: 0.8 }}>
                    {(m.matchType || "T20").toUpperCase()}
                    {league.key !== "INT" && (
                        <span style={{ marginLeft: 6, color: league.color }}>· {league.label}</span>
                    )}
                </span>
                {isLive && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, fontWeight: 800, color: "#EF4444" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#EF4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                        LIVE
                    </span>
                )}
                {isUpcoming && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#F59E0B" }}>UPCOMING</span>
                )}
                {isEnded && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: "#475569" }}>ENDED</span>
                )}
            </div>

            {/* Team rows */}
            {[
                { name: t1, score: t1Score, imgId: m.t1ImageId || m.team1ImageId || 0 },
                { name: t2, score: t2Score, imgId: m.t2ImageId || m.team2ImageId || 0 },
            ].map(({ name, score, imgId }, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: idx === 0 ? 4 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <img
                            src={`${API_BASE}/team-image/${imgId}`}
                            style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", background: "#1E293B" }}
                            alt=""
                            onError={e => { e.target.style.display = "none"; }}
                        />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>{name}</span>
                    </div>
                    {score != null && (
                        <span style={{ fontSize: 12, fontWeight: 800, color: isLive && idx === 0 ? "#fff" : "#94A3B8" }}>
                            {score}
                        </span>
                    )}
                </div>
            ))}

            {/* Status note for ended/upcoming */}
            {(isEnded || isUpcoming) && m.status && typeof m.status === "string" && m.status.length > 8 && (
                <div style={{ fontSize: 10, color: isUpcoming ? "#F59E0B" : "#475569", marginTop: 6, lineHeight: 1.4 }}>
                    {m.status}
                </div>
            )}
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
