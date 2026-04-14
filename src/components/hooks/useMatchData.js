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

    const selectedMatchRef = useRef(null);
    // Incremented every time a pred fetch starts — used to discard stale responses
    const predRequestIdRef = useRef(0);

    // ── PREDICTION — define first so selectMatch can call it ─────────────────
    const fetchPred = useCallback(async (matchId, t1 = "", t2 = "") => {
        if (!matchId && !t1) return;

        predRequestIdRef.current += 1;
        const thisRequestId = predRequestIdRef.current;

        setIsPredLoading(true);
        try {
            const teamParams = t1 ? `&t1=${encodeURIComponent(t1)}&t2=${encodeURIComponent(t2)}` : "";
            const [predData, scorecardData] = await Promise.all([
                fetch(`${API_BASE}/predict?match_id=${matchId}${teamParams}`).then(r => r.ok ? r.json() : null).catch(() => null),
                fetch(`${API_BASE}/match/${matchId}?t1=${encodeURIComponent(t1)}&t2=${encodeURIComponent(t2)}`).then(r => r.ok ? r.json() : null).catch(() => null),
            ]);

            if (thisRequestId !== predRequestIdRef.current) return;

            if (scorecardData && !scorecardData.error && scorecardData.team1) {
                const merged = { ...scorecardData };
                if (predData && predData.team1) {
                    merged.aiProbability = predData.aiProbability ?? scorecardData.aiProbability;
                    merged.nextOvers = (predData.nextOvers?.length > 0) ? predData.nextOvers : (scorecardData.nextOvers?.length > 0 ? scorecardData.nextOvers : []);
                    merged.overHistory = (predData.overHistory?.length > 0) ? predData.overHistory : (scorecardData.overHistory || []);
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
            // Always clear loading — even if this response is stale, a blank loading
            // spinner is worse than showing slightly stale data
            setIsPredLoading(false);
        }
    }, []);

    // ── SELECT MATCH — immediately fetches pred for the chosen match ──────────
    const selectMatch = useCallback((m) => {
        selectedMatchRef.current = m;
        setSelectedMatch(m);
        setIsPredLoading(true);
        const mid = m?.matchId || m?.id;
        fetchPred(mid, m?.t1 || "", m?.t2 || "");
    }, [fetchPred]);

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

            // Auto-select only on very first load when nothing is selected yet
            if (!selectedMatchRef.current) {
                const best = mapped.find(m => m.status === "LIVE") || mapped.find(m => m.status === "UPCOMING");
                if (best) {
                    selectedMatchRef.current = best;
                    setSelectedMatch(best);
                    const mid = best.matchId || best.id;
                    fetchPred(mid, best.t1 || "", best.t2 || "");
                }
            }
        } catch { setLiveStatus("mock"); }
    }, [fetchPred]);

    // Matches list refreshes every 5s
    useEffect(() => {
        fetchMatches();
        const t = setInterval(fetchMatches, 5000);
        return () => clearInterval(t);
    }, [fetchMatches]);

    // Prediction auto-refreshes every 30s for selected match
    // (10s was causing a race: backend can take >10s, stale-check aborted the response
    //  and left isPredLoading stuck true)
    useEffect(() => {
        const mid = selectedMatch?.matchId || selectedMatch?.id;
        if (!mid && !selectedMatch?.t1) return;
        const t = setInterval(() => {
            const m = selectedMatchRef.current;
            const id = m?.matchId || m?.id;
            fetchPred(id, m?.t1 || "", m?.t2 || "");
        }, 30000);
        return () => clearInterval(t);
    }, [selectedMatch?.id, fetchPred]);

    return { liveMatches, selectedMatch, selectMatch, pred, liveStatus, isFirstLoad, isPredLoading };
}
