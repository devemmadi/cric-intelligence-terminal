/* eslint-disable */
import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE, isMatchEnded, cleanTeam } from "../shared/constants";

export default function useMatchData() {
    const [liveMatches, setLiveMatches] = useState(() => {
        try { const c = localStorage.getItem("ci_matches_cache"); if (c) return JSON.parse(c); } catch { }
        return [];
    });
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [pred, setPred] = useState(() => {
        try { const c = localStorage.getItem("ci_pred_cache"); if (c) return JSON.parse(c); } catch { }
        return null;
    });
    const [liveStatus, setLiveStatus] = useState(() => {
        try { return localStorage.getItem("ci_matches_cache") ? "cached" : "connecting"; } catch { return "connecting"; }
    });
    const [isFirstLoad, setIsFirstLoad] = useState(() => {
        try { return !localStorage.getItem("ci_matches_cache"); } catch { return true; }
    });
    const [isPredLoading, setIsPredLoading] = useState(false);

    const hasUserSelectedRef = useRef(false);
    const selectedMatchRef = useRef(null);
    // Incremented every time user selects a match — used to discard stale prediction responses
    const predRequestIdRef = useRef(0);

    const selectMatch = useCallback((m) => {
        hasUserSelectedRef.current = true;
        selectedMatchRef.current = m;
        setPred(null);        // Clear stale pred immediately so UI shows loading, not wrong match
        setIsPredLoading(true);
        setSelectedMatch(m);
    }, []);

    // ── MATCHES ONLY — runs on interval, never touches pred ──────────────────
    const fetchMatches = useCallback(async () => {
        if (document.hidden) return;
        try {
            const data = await fetch(`${API_BASE}/matches`).then(r => r.ok ? r.json() : null).catch(() => null);
            if (!data) return;
            const list = Array.isArray(data) ? data : data.data || [];
            if (!list.length) return;

            const rawMapped = list.slice(0, 40).map((m, i) => {
                const rawStatus = m.status || "";
                let status;
                if (isMatchEnded(rawStatus)) {
                    status = "ENDED";
                } else if (
                    (m.matchStarted && !m.matchEnded) ||
                    ["need", "opt", "batting", "bowling", "over", "ov)", "day", "session", "innings", "require", "trail", "lead"].some(kw => rawStatus.toLowerCase().includes(kw))
                ) {
                    status = "LIVE";
                } else {
                    status = "UPCOMING";
                }
                return {
                    ...m,
                    id: m.id || i, matchId: m.id,
                    status, rawStatus,
                    t1: cleanTeam(m.team1 || m.teams?.[0] || "TBD"),
                    t2: cleanTeam(m.team2 || m.teams?.[1] || "TBD"),
                    t1ImageId: m.t1ImageId || m.team1ImageId || 0,
                    t2ImageId: m.t2ImageId || m.team2ImageId || 0,
                    day: m.matchType?.toUpperCase() || "T20",
                    detail: m.name || "",
                    t1Score: m.score?.[0]?.r ?? null, t1Wkts: m.score?.[0]?.w ?? null,
                    t2Score: m.score?.[1]?.r ?? null,
                };
            });

            const seen = new Set();
            let endedCount = 0;
            const mapped = rawMapped.filter(m => {
                const key = [m.t1, m.t2].sort().join("_");
                if (seen.has(key)) return false;
                seen.add(key);
                if (m.status === "ENDED") { endedCount++; if (endedCount > 8) return false; }
                return true;
            });

            setLiveMatches(mapped);
            window.__matchList = mapped;
            setLiveStatus("live");
            setIsFirstLoad(false);
            try { localStorage.setItem("ci_matches_cache", JSON.stringify(mapped)); } catch { }

            // Auto-select first live/upcoming match only if user never manually selected
            if (!hasUserSelectedRef.current) {
                const best = mapped.find(m => m.status === "LIVE") || mapped.find(m => m.status === "UPCOMING");
                if (best) {
                    selectedMatchRef.current = best;
                    setSelectedMatch(best);
                }
            }
        } catch { setLiveStatus("mock"); }
    }, []);

    // ── PREDICTION — called explicitly for a specific matchId only ────────────
    const fetchPred = useCallback(async (matchId) => {
        if (!matchId) return;

        // Tag this request with a unique id
        predRequestIdRef.current += 1;
        const thisRequestId = predRequestIdRef.current;

        setIsPredLoading(true);
        try {
            const [predData, scorecardData] = await Promise.all([
                fetch(`${API_BASE}/predict?match_id=${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`${API_BASE}/match/${matchId}`).then(r => r.ok ? r.json() : null).catch(() => null),
            ]);

            // Discard if a newer request was started while this one was in-flight
            if (thisRequestId !== predRequestIdRef.current) return;

            if (scorecardData && !scorecardData.error && scorecardData.team1) {
                const merged = { ...scorecardData };
                if (predData && predData.team1) {
                    merged.aiProbability = predData.aiProbability ?? scorecardData.aiProbability;
                    merged.nextOvers = predData.nextOvers ?? scorecardData.nextOvers;
                    merged.overHistory = predData.overHistory ?? scorecardData.overHistory;
                    merged.pitchCondition = predData.pitchCondition ?? scorecardData.pitchCondition;
                    merged.weatherImpact = predData.weatherImpact ?? scorecardData.weatherImpact;
                    merged.bowlingFactor = predData.bowlingFactor ?? scorecardData.bowlingFactor;
                    merged.battingFactor = predData.battingFactor ?? scorecardData.battingFactor;
                    merged.deteriorationFactor = predData.deteriorationFactor ?? scorecardData.deteriorationFactor;
                    merged.currentPhase = predData.currentPhase ?? scorecardData.currentPhase;
                    merged.playerContext = predData.playerContext ?? scorecardData.playerContext;
                    if (scorecardData.score > 0 || scorecardData.overs > 0) {
                        merged.displayScore = scorecardData.displayScore;
                        merged.score = scorecardData.score;
                        merged.wickets = scorecardData.wickets;
                        merged.overs = scorecardData.overs;
                        merged.currentRunRate = scorecardData.currentRunRate;
                    }
                }
                const mList = window.__matchList || [];
                const mMatch = mList.find(mx => mx.t1 === merged.team1 || mx.team1 === merged.team1);
                merged.team1ImageId = mMatch?.t1ImageId || 0;
                merged.team2ImageId = mMatch?.t2ImageId || 0;
                setPred(merged);
                try {
                    localStorage.setItem("ci_pred_cache", JSON.stringify(merged));
                    if (merged.id) localStorage.setItem("ci_pred_" + merged.id, JSON.stringify(merged));
                } catch { }
            } else if (predData && predData.team1) {
                const mList = window.__matchList || [];
                const mMatch = mList.find(mx => mx.t1 === predData.team1 || mx.team1 === predData.team1);
                predData.team1ImageId = mMatch?.t1ImageId || 0;
                predData.team2ImageId = mMatch?.t2ImageId || 0;
                setPred(predData);
            }
        } catch { }
        finally {
            if (thisRequestId === predRequestIdRef.current) setIsPredLoading(false);
        }
    }, []);

    // Matches list refreshes every 5s (never touches pred)
    useEffect(() => {
        fetchMatches();
        const t = setInterval(fetchMatches, 5000);
        return () => clearInterval(t);
    }, [fetchMatches]);

    // Prediction refreshes every 10s for the currently selected match
    useEffect(() => {
        if (!selectedMatch?.matchId) return;
        const t = setInterval(() => fetchPred(selectedMatchRef.current?.matchId), 10000);
        return () => clearInterval(t);
    }, [selectedMatch?.matchId, fetchPred]);

    // Fetch prediction immediately when user selects a match
    useEffect(() => {
        if (selectedMatch?.matchId) {
            fetchPred(selectedMatch.matchId);
        }
    }, [selectedMatch?.matchId, fetchPred]);

    return { liveMatches, selectedMatch, selectMatch, pred, liveStatus, isFirstLoad, isPredLoading };
}
