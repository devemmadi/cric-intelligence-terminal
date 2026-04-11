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
    // Tracks which matchId the LATEST user selection wants — used to discard stale responses
    const expectedMatchIdRef = useRef(null);

    const selectMatch = useCallback((m) => {
        hasUserSelectedRef.current = true;
        selectedMatchRef.current = m;
        expectedMatchIdRef.current = m?.matchId ?? null;
        setSelectedMatch(m);
    }, []);

    const fetchLiveData = useCallback(async (overrideMatchId) => {
        if (document.hidden) return;
        try {
            // Snapshot the target matchId at the START of this request
            const curMatchId = overrideMatchId || selectedMatchRef.current?.matchId;
            if (overrideMatchId) setIsPredLoading(true);

            const matchesPromise = fetch(`${API_BASE}/matches`).then(r => r.ok ? r.json() : null).catch(() => null);
            const predPromise = fetch(`${API_BASE}/predict${curMatchId ? "?match_id=" + curMatchId : ""}`)
                .then(r => r.ok ? r.json() : null).catch(() => null);
            const scorecardPromise = curMatchId
                ? fetch(`${API_BASE}/match/${curMatchId}`).then(r => r.ok ? r.json() : null).catch(() => null)
                : Promise.resolve(null);

            const [matchesData, predData, scorecardData] = await Promise.all([matchesPromise, predPromise, scorecardPromise]);

            // ── Matches list ─────────────────────────────────────────────────
            if (matchesData) {
                const list = Array.isArray(matchesData) ? matchesData : matchesData.data || [];
                if (list.length) {
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

                    // Auto-select only if user has never manually selected
                    if (!hasUserSelectedRef.current) {
                        const best = mapped.find(m => m.status === "LIVE") || mapped.find(m => m.status === "UPCOMING");
                        if (best) {
                            selectedMatchRef.current = best;
                            expectedMatchIdRef.current = best.matchId;
                            setSelectedMatch(best);
                        }
                    }
                }
            }

            // ── Prediction / scorecard ────────────────────────────────────────
            // KEY FIX: discard response if user selected a different match while this request was in-flight
            const expectedId = expectedMatchIdRef.current;
            const isStale = expectedId && curMatchId && String(curMatchId) !== String(expectedId);
            if (isStale) {
                setIsPredLoading(false);
                return;
            }

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
                setIsPredLoading(false);
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
                setIsPredLoading(false);
            }
        } catch { setLiveStatus("mock"); }
    }, []);

    // Background interval — only refreshes matches list + pred for currently selected match
    useEffect(() => {
        fetchLiveData();
        const t = setInterval(fetchLiveData, 5000);
        return () => clearInterval(t);
    }, [fetchLiveData]);

    // When user explicitly selects a match, fetch immediately for that match
    useEffect(() => {
        if (selectedMatch?.matchId) {
            fetchLiveData(selectedMatch.matchId);
        }
    }, [selectedMatch?.matchId, fetchLiveData]);

    return { liveMatches, selectedMatch, selectMatch, pred, liveStatus, isFirstLoad, isPredLoading };
}
