/* eslint-disable */
import React from "react";
import { C, IPL_TEAMS, PSL_TEAMS } from "../shared/constants";
import { MatchCard } from "../shared/MatchCard";

const SECTION_CONFIG = [
    { key: "IPL", label: "🏏 IPL 2026", color: "#F59E0B", bg: "#FEF3C7", check: (m) => IPL_TEAMS.some(t => (m.t1||'')=== t||(m.t2||'')=== t) },
    { key: "PSL", label: "🟢 PSL 2026", color: "#10B981", bg: "#D1FAE5", check: (m) => PSL_TEAMS.some(t => (m.t1||'')=== t||(m.t2||'')=== t) },
    { key: "INT", label: "🌍 International", color: "#6366F1", bg: "#EEF2FF",
      check: (m) => !IPL_TEAMS.some(t => (m.t1||'')=== t||(m.t2||'')=== t) && !PSL_TEAMS.some(t => (m.t1||'')=== t||(m.t2||'')=== t) },
];

function SectionHeader({ label, color, bg, count }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, marginTop: 4 }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, fontWeight: 800, color, background: bg, padding: "4px 14px", borderRadius: 20, letterSpacing: 0.5 }}>
                {label} · {count}
            </span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>
    );
}

export default function MatchesTab({ liveMatches, onMatchClick }) {
    const liveList = liveMatches.filter(m => m.status === "LIVE");
    const upcomingList = liveMatches.filter(m => m.status === "UPCOMING");
    const endedList = liveMatches.filter(m => m.status === "ENDED");

    const renderSection = (matches, statusLabel, statusColor) => {
        if (matches.length === 0) return null;
        return SECTION_CONFIG.map(sec => {
            const group = matches.filter(sec.check);
            if (group.length === 0) return null;
            return (
                <div key={sec.key} style={{ marginBottom: 8 }}>
                    <SectionHeader label={sec.label} color={sec.color} bg={sec.bg} count={group.length} />
                    {group.map(m => (
                        <MatchCard key={m.id} m={m} onClick={() => onMatchClick(m)} />
                    ))}
                </div>
            );
        });
    };

    return (
        <div className="fade" style={{ maxWidth: 680, margin: "0 auto", padding: "22px 16px" }}>
            {liveMatches.length === 0 && (
                <div style={{ textAlign: "center", padding: 60, color: C.muted }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🏏</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Loading matches...</div>
                </div>
            )}

            {/* LIVE */}
            {liveList.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, animation: "pulse 1.5s infinite" }} />
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.red, letterSpacing: 1 }}>LIVE NOW · {liveList.length} match{liveList.length > 1 ? "es" : ""}</span>
                    </div>
                    {renderSection(liveList)}
                </div>
            )}

            {/* UPCOMING */}
            {upcomingList.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.accent, letterSpacing: 1, marginBottom: 16 }}>UPCOMING</div>
                    {renderSection(upcomingList)}
                </div>
            )}

            {/* RECENT RESULTS */}
            {endedList.length > 0 && (
                <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 16 }}>RECENT RESULTS</div>
                    {renderSection(endedList)}
                </div>
            )}
        </div>
    );
}
