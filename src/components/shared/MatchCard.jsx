/* eslint-disable */
import React from "react";
import { C, API_BASE, getLeague } from "./constants";
import TeamLogo from "./TeamLogo";

/** Small pill in the left sidebar */
export function MatchPill({ m, selected, onClick }) {
    const isLive = m.isLive || (m.matchStarted && !m.matchEnded);
    const isEnded = m.matchEnded;
    const league = getLeague(m);

    return (
        <div onClick={onClick} style={{
            background: selected ? '#EEF2FF' : '#fff',
            border: selected ? '1.5px solid #6366F1' : '1px solid #E2E8F0',
            borderRadius: 12, padding: '12px 14px', marginBottom: 10, cursor: 'pointer'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>{m.matchType?.toUpperCase()}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                    background: isLive ? '#FFF0F0' : '#F1F5F9', color: isLive ? '#E53E3E' : league.color }}>
                    {isLive ? '🔴 LIVE' : league.label}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <img src={`${API_BASE}/team-image/${m.t1ImageId || m.team1ImageId || 0}`}
                    style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                    alt="" onError={e => e.target.style.display = 'none'} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{m.t1 || m.team1}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                <img src={`${API_BASE}/team-image/${m.t2ImageId || m.team2ImageId || 0}`}
                    style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
                    alt="" onError={e => e.target.style.display = 'none'} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{m.t2 || m.team2}</span>
            </div>
            {isEnded && m.status && <div style={{ fontSize: 10, color: '#6366F1', fontWeight: 500 }}>{m.status}</div>}
            {!isEnded && !isLive && m.status && <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 500 }}>{m.status}</div>}
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
