import React, { useState, useEffect, useRef } from 'react';
import { API_BASE, C } from '../shared/constants';

const S = {
    wrap: { padding: '12px 0' },
    card: { background: C.surface, borderRadius: 10, border: `1px solid rgba(255,255,255,0.07)`, marginBottom: 12, overflow: 'hidden' },
    header: { background: 'rgba(255,255,255,0.05)', padding: '8px 14px', borderBottom: `1px solid rgba(255,255,255,0.07)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    teamName: { fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: 0.3 },
    score: { fontSize: 15, fontWeight: 900, color: C.accent, letterSpacing: -0.5 },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
    th: { color: C.muted, fontWeight: 600, padding: '5px 8px', textAlign: 'right', borderBottom: `1px solid rgba(255,255,255,0.05)`, fontSize: 10, letterSpacing: 0.3 },
    thLeft: { textAlign: 'left' },
    td: { padding: '5px 8px', color: C.text, textAlign: 'right', borderBottom: `1px solid rgba(255,255,255,0.04)` },
    tdLeft: { textAlign: 'left', maxWidth: 140 },
    tdMuted: { color: C.muted, fontSize: 10 },
    tdBold: { fontWeight: 700 },
    sectionLabel: { fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, padding: '8px 14px 4px', textTransform: 'uppercase' },
    extraRow: { padding: '5px 14px', fontSize: 10, color: C.muted, borderTop: `1px solid rgba(255,255,255,0.04)` },
    fowWrap: { padding: '4px 14px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 },
    fowChip: { background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: C.muted },
    empty: { textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 13 },
    loading: { textAlign: 'center', padding: '30px 20px', color: C.muted, fontSize: 12 },
    tabRow: { display: 'flex', gap: 6, padding: '0 14px 8px', marginTop: 4 },
    innTab: { fontSize: 11, padding: '3px 10px', borderRadius: 6, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: C.muted, transition: 'all 0.15s' },
    innTabActive: { background: C.accent, borderColor: C.accent, color: '#fff', fontWeight: 700 },
};

function BattingCard({ inn }) {
    const extras = inn.extras || {};
    const extParts = [];
    if (extras.byes)    extParts.push(`b ${extras.byes}`);
    if (extras.legByes) extParts.push(`lb ${extras.legByes}`);
    if (extras.wides)   extParts.push(`w ${extras.wides}`);
    if (extras.noBalls) extParts.push(`nb ${extras.noBalls}`);

    return (
        <div>
            <div style={S.sectionLabel}>Batting</div>
            <table style={S.table}>
                <thead>
                    <tr>
                        <th style={{ ...S.th, ...S.thLeft }}>Batter</th>
                        <th style={S.th}>R</th>
                        <th style={S.th}>B</th>
                        <th style={S.th}>4s</th>
                        <th style={S.th}>6s</th>
                        <th style={S.th}>SR</th>
                    </tr>
                </thead>
                <tbody>
                    {inn.batters.map((b, i) => (
                        <tr key={i}>
                            <td style={{ ...S.td, ...S.tdLeft }}>
                                <div style={{ fontWeight: 600, fontSize: 12 }}>{b.name}</div>
                                <div style={{ ...S.tdMuted, lineHeight: 1.3, marginTop: 1 }}>{b.outDec}</div>
                            </td>
                            <td style={{ ...S.td, ...S.tdBold }}>{b.runs}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{b.balls}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{b.fours}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{b.sixes}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{b.strikeRate > 0 ? b.strikeRate.toFixed(1) : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {extras.total > 0 && (
                <div style={S.extraRow}>
                    Extras: {extras.total} ({extParts.join(', ') || '—'})
                </div>
            )}
            {inn.fow && inn.fow.length > 0 && (
                <>
                    <div style={{ ...S.sectionLabel, paddingTop: 6 }}>Fall of wickets</div>
                    <div style={S.fowWrap}>
                        {inn.fow.map((f, i) => (
                            <span key={i} style={S.fowChip}>
                                {f.runs}/{i + 1} {f.name && `(${f.name}`}{f.over && `, ov ${f.over})`}
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function BowlingCard({ inn }) {
    return (
        <div>
            <div style={S.sectionLabel}>Bowling</div>
            <table style={S.table}>
                <thead>
                    <tr>
                        <th style={{ ...S.th, ...S.thLeft }}>Bowler</th>
                        <th style={S.th}>O</th>
                        <th style={S.th}>M</th>
                        <th style={S.th}>R</th>
                        <th style={S.th}>W</th>
                        <th style={S.th}>Eco</th>
                    </tr>
                </thead>
                <tbody>
                    {inn.bowlers.map((bw, i) => (
                        <tr key={i}>
                            <td style={{ ...S.td, ...S.tdLeft, fontWeight: 600, fontSize: 12 }}>{bw.name}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{bw.overs}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{bw.maidens}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{bw.runs}</td>
                            <td style={{ ...S.td, ...S.tdBold, color: bw.wickets > 0 ? C.green : C.text }}>{bw.wickets}</td>
                            <td style={{ ...S.td, ...S.tdMuted }}>{bw.economy > 0 ? bw.economy.toFixed(2) : '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function ScoreboardTab({ matchId }) {
    const [scoreboard, setScoreboard] = useState(null);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    const [activeInn, setActiveInn] = useState(0);
    const pollRef = useRef(null);

    const fetchScoreboard = async () => {
        if (!matchId) return;
        try {
            const res = await fetch(`${API_BASE}/match/${matchId}/scoreboard`);
            if (!res.ok) { setError('Scoreboard not available yet'); setLoading(false); return; }
            const data = await res.json();
            setScoreboard(data.scoreboard || []);
            setError(null);
        } catch {
            setError('Failed to load scoreboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        setScoreboard(null);
        setActiveInn(0);
        fetchScoreboard();
        pollRef.current = setInterval(fetchScoreboard, 12000);
        return () => clearInterval(pollRef.current);
    }, [matchId]); // eslint-disable-line

    if (loading) return <div style={S.loading}>Loading scoreboard...</div>;
    if (error || !scoreboard || scoreboard.length === 0)
        return <div style={S.empty}>Scoreboard not available yet.<br /><span style={{ fontSize: 11 }}>Available once match begins.</span></div>;

    const inn = scoreboard[activeInn] || scoreboard[0];

    return (
        <div style={S.wrap}>
            {/* Innings selector */}
            {scoreboard.length > 1 && (
                <div style={S.tabRow}>
                    {scoreboard.map((i, idx) => (
                        <button
                            key={idx}
                            style={{ ...S.innTab, ...(activeInn === idx ? S.innTabActive : {}) }}
                            onClick={() => setActiveInn(idx)}
                        >
                            {i.team || `Innings ${idx + 1}`}
                        </button>
                    ))}
                </div>
            )}

            <div style={S.card}>
                <div style={S.header}>
                    <span style={S.teamName}>{inn.team || `Innings ${activeInn + 1}`}</span>
                    <span style={S.score}>
                        {inn.score}/{inn.wickets}
                        <span style={{ fontSize: 11, fontWeight: 400, color: C.muted, marginLeft: 6 }}>
                            ({inn.overs} ov)
                        </span>
                    </span>
                </div>
                {inn.batters && inn.batters.length > 0 && <BattingCard inn={inn} />}
                {inn.bowlers && inn.bowlers.length > 0 && <BowlingCard inn={inn} />}
            </div>
        </div>
    );
}
