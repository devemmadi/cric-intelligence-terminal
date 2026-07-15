/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { C, cleanTeam } from "../shared/constants";

// Tracks last N probability readings to detect swing + wicket calls
export default function AiCalledIt({ pred, prob }) {
    const [banner, setBanner] = useState(null); // { type, text }
    const prevRef = useRef({ prob: null, wickets: null, wicketWarnedAt: null });

    useEffect(() => {
        if (!pred || prob == null) return;
        const prev = prevRef.current;
        const curWkts = pred.wickets ?? 0;
        const t1 = cleanTeam(pred.team1 || "");
        const t2 = cleanTeam(pred.team2 || "");

        // 1. Swing detection: prob moved ≥ 22% since last check
        if (prev.prob !== null) {
            const delta = prob - prev.prob;
            if (Math.abs(delta) >= 22) {
                const team = delta > 0 ? t1 : t2;
                setBanner({ type: "swing", text: `🔮 AI CALLED IT — ${team} swung momentum ${Math.abs(Math.round(delta))}% in one over` });
                setTimeout(() => setBanner(null), 5000);
            }
        }

        // 2. Wicket that was predicted: AI showed wicket risk HIGH last poll → wicket now fell
        // wicketProb is the top-level field from backend (per-over wicket %), not livePredictions
        const wicketPct = pred.wicketProb ?? 0;
        if (prev.wickets !== null && curWkts > prev.wickets) {
            // Was wicket risk flagged in previous state?
            if (prev.wicketWarnedAt !== null && wicketPct > 55) {
                setBanner({ type: "wicket", text: `🔮 AI CALLED IT — predicted high wicket risk, fell at over ${pred.overs?.toFixed(1)}` });
                setTimeout(() => setBanner(null), 5000);
            }
        }

        prevRef.current = {
            prob,
            wickets: curWkts,
            wicketWarnedAt: wicketPct > 55 ? Date.now() : prev.wicketWarnedAt,
        };
    }, [prob, pred?.wickets]);

    if (!banner) return null;

    return (
        <div style={{
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.4)",
            borderRadius: 12, padding: "10px 14px", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 10,
            animation: "slideIn 0.3s ease forwards",
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#A78BFA" }}>{banner.text}</div>
            </div>
            <button
                onClick={() => setBanner(null)}
                style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 4 }}
            >×</button>
        </div>
    );
}
