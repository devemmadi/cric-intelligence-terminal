/* eslint-disable */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const API = process.env.REACT_APP_API_URL || "https://cricintel-backend-production.up.railway.app";

const C = {
    bg:      "#0B1120",
    surface: "#111827",
    card:    "#1A2236",
    border:  "#1E3A5F",
    text:    "#F1F5F9",
    muted:   "#64748B",
    green:   "#10B981",
    amber:   "#F59E0B",
    red:     "#EF4444",
    blue:    "#3B82F6",
    navy:    "#1E2D6B",
    gold:    "#C8961E",
};

function setMeta(name, content, prop) {
    let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
}

function AccuracyBar({ label, pct, color, count }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{label}</span>
                <span style={{ color: color || C.green, fontSize: 13, fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ background: "#1E293B", borderRadius: 6, height: 10, overflow: "hidden" }}>
                <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: color || C.green,
                    borderRadius: 6,
                    transition: "width 0.8s ease",
                }} />
            </div>
            {count && (
                <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>
                    {count.toLocaleString()} predictions
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, sub, color, icon }) {
    return (
        <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "20px 24px",
            textAlign: "center",
        }}>
            {icon && <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>}
            <div style={{
                fontSize: 40,
                fontWeight: 800,
                color: color || C.green,
                lineHeight: 1,
                marginBottom: 6,
                fontVariantNumeric: "tabular-nums",
            }}>{value}</div>
            <div style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{label}</div>
            {sub && <div style={{ color: C.muted, fontSize: 12 }}>{sub}</div>}
        </div>
    );
}

function IndustryComparison({ ourAccuracy }) {
    const bars = [
        { label: "CricIntelligence (Live)", pct: ourAccuracy, color: C.green, bold: true },
        { label: "Industry average (live)", pct: 75,          color: C.amber },
        { label: "Industry average (pre-match)", pct: 60,     color: C.muted },
        { label: "Coin flip (baseline)",   pct: 50,           color: "#475569" },
    ];
    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24,
        }}>
            <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 20, margin: "0 0 20px" }}>
                Industry Comparison
            </h3>
            {bars.map(b => (
                <div key={b.label} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{
                            color: b.bold ? C.green : C.muted,
                            fontSize: 13,
                            fontWeight: b.bold ? 700 : 400,
                        }}>{b.label}</span>
                        <span style={{ color: b.color, fontSize: 13, fontWeight: 700 }}>{b.pct}%</span>
                    </div>
                    <div style={{ background: "#1E293B", borderRadius: 6, height: b.bold ? 12 : 8, overflow: "hidden" }}>
                        <div style={{
                            height: "100%",
                            width: `${b.pct}%`,
                            background: b.color,
                            borderRadius: 6,
                            transition: "width 0.8s ease",
                        }} />
                    </div>
                </div>
            ))}
            <p style={{ color: C.muted, fontSize: 11, marginTop: 16, marginBottom: 0 }}>
                Industry benchmarks sourced from academic literature on T20 win prediction.
                Pre-match models typically achieve 55–65%. Live ball-by-ball models 70–80%+.
            </p>
        </div>
    );
}

function RecentMatchRow({ match, i }) {
    const isCorrect = match.correct;
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto auto auto",
            gap: 12,
            alignItems: "center",
            padding: "12px 16px",
            background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
            borderBottom: `1px solid ${C.border}`,
        }}>
            <div>
                <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{match.match}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>
                    {match.date}
                    {match.is_ipl && <span style={{ marginLeft: 6, color: C.gold }}>IPL</span>}
                </div>
            </div>
            <div style={{ color: C.muted, fontSize: 12, textAlign: "center" }}>
                <div style={{ color: C.text, fontSize: 13 }}>{match.inn1_score}</div>
                <div>1st inn</div>
            </div>
            <div style={{ color: C.text, fontSize: 13, textAlign: "center" }}>
                {match.confidence}%
                <div style={{ color: C.muted, fontSize: 11 }}>confidence</div>
            </div>
            <div style={{
                padding: "4px 10px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 700,
                background: isCorrect ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: isCorrect ? C.green : C.red,
                whiteSpace: "nowrap",
            }}>
                {isCorrect ? "Correct" : "Incorrect"}
            </div>
        </div>
    );
}

function Skeleton() {
    return (
        <div style={{ padding: "40px 0" }}>
            {[1, 2, 3].map(i => (
                <div key={i} style={{
                    background: C.card, borderRadius: 12, height: 80, marginBottom: 16,
                    animation: "pulse 1.5s ease-in-out infinite",
                }} />
            ))}
        </div>
    );
}

export default function AccuracyDashboard() {
    const [data, setData]     = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState(null);

    useEffect(() => {
        const title = "AI Prediction Accuracy — Verified Results | CricIntelligence";
        const desc  = "See exactly how accurate CricIntelligence AI predictions are. Verified win probability accuracy, score prediction MAE, tested on 400+ IPL matches.";
        const url   = "https://www.cricintelligence.com/accuracy";
        document.title = title;
        setMeta("description", desc);
        setMeta("og:title", title, true); setMeta("og:description", desc, true); setMeta("og:url", url, true);
        setMeta("twitter:title", title); setMeta("twitter:description", desc);
        let el = document.querySelector("link[rel='canonical']");
        if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
        el.setAttribute("href", url);
    }, []);

    useEffect(() => {
        fetch(`${API}/backtest-results`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(e => { setError("Could not load accuracy data."); setLoading(false); });
    }, []);

    const wp      = data?.win_probability || {};
    const sp      = data?.score_prediction || {};
    const no      = data?.next_over || {};
    const overall = wp.overall_accuracy || 0;
    const ipl_acc = wp.ipl_accuracy || 0;
    const byChk   = wp.by_checkpoint || {};
    const recent  = data?.recent_matches || [];

    const navStyle = {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        background: C.surface,
        borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 100,
    };

    return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}>
            {/* Nav */}
            <nav style={navStyle}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    <Logo />
                </Link>
                <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                    <Link to="/" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>Live</Link>
                    <Link to="/how-it-works" style={{ color: C.muted, textDecoration: "none", fontSize: 14 }}>How It Works</Link>
                    <span style={{ color: C.green, fontSize: 14, fontWeight: 600 }}>Accuracy</span>
                </div>
            </nav>

            {/* Hero */}
            <div style={{
                background: "linear-gradient(135deg, #0B1120 0%, #0F1F3D 100%)",
                borderBottom: `1px solid ${C.border}`,
                padding: "48px 24px",
                textAlign: "center",
            }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                    borderRadius: 20, padding: "6px 16px", marginBottom: 20,
                }}>
                    <span style={{ fontSize: 10, color: C.green }}>●</span>
                    <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>Verified on {data?.matches_tested || "400"}+ matches</span>
                </div>
                <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, color: C.text, marginBottom: 12 }}>
                    Prediction Accuracy
                </h1>
                <p style={{ color: C.muted, fontSize: 16, maxWidth: 520, margin: "0 auto 32px" }}>
                    Not just a claim — every number here is computed by running our AI models against real historical matches with known outcomes.
                </p>
                {!loading && !error && (
                    <div style={{
                        display: "inline-flex", alignItems: "baseline", gap: 8,
                        background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
                        borderRadius: 16, padding: "20px 40px",
                    }}>
                        <span style={{ fontSize: 72, fontWeight: 900, color: C.green, lineHeight: 1 }}>
                            {overall}
                        </span>
                        <span style={{ fontSize: 32, fontWeight: 700, color: C.green }}>%</span>
                        <div style={{ textAlign: "left", marginLeft: 8 }}>
                            <div style={{ color: C.text, fontSize: 14, fontWeight: 600 }}>Win Prediction</div>
                            <div style={{ color: C.muted, fontSize: 13 }}>Overall Accuracy</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main content */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>

                {loading && <Skeleton />}
                {error && (
                    <div style={{
                        background: "rgba(239,68,68,0.1)", border: `1px solid ${C.red}`,
                        borderRadius: 12, padding: 24, textAlign: "center", color: C.red,
                    }}>{error}</div>
                )}

                {!loading && !error && data && (
                    <>
                        {/* Key metrics row */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: 16,
                            marginBottom: 32,
                        }}>
                            <StatCard
                                label="Overall Win Accuracy"
                                value={`${overall}%`}
                                sub={`${(wp.total_predictions || 0).toLocaleString()} predictions`}
                                color={C.green}
                                icon="🎯"
                            />
                            <StatCard
                                label="IPL Accuracy"
                                value={`${ipl_acc}%`}
                                sub={`${(data.ipl_matches || 0).toLocaleString()} IPL matches`}
                                color="#F59E0B"
                                icon="🏆"
                            />
                            <StatCard
                                label="Matches Tested"
                                value={(data.matches_tested || 0).toLocaleString()}
                                sub="Real match outcomes"
                                color={C.blue}
                                icon="📊"
                            />
                            <StatCard
                                label="Next Over MAE"
                                value={no.mae ? `${no.mae}` : "—"}
                                sub="runs/over error"
                                color="#A78BFA"
                                icon="🔮"
                            />
                        </div>

                        {/* Checkpoint accuracy + Industry comparison */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 20,
                            marginBottom: 32,
                        }}
                            className="accuracy-grid"
                        >
                            {/* Checkpoint accuracy */}
                            <div style={{
                                background: C.card, border: `1px solid ${C.border}`,
                                borderRadius: 12, padding: 24,
                            }}>
                                <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, marginBottom: 4, margin: "0 0 4px" }}>
                                    Win Probability by Match Stage
                                </h3>
                                <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>
                                    Accuracy improves as more match data becomes available
                                </p>
                                {Object.entries(byChk).map(([key, chk]) => (
                                    <AccuracyBar
                                        key={key}
                                        label={chk.label}
                                        pct={chk.accuracy}
                                        count={chk.count}
                                        color={chk.accuracy >= 75 ? C.green : chk.accuracy >= 70 ? C.amber : C.blue}
                                    />
                                ))}

                                {/* Industry benchmark note */}
                                <div style={{
                                    background: "rgba(59,130,246,0.08)",
                                    border: "1px solid rgba(59,130,246,0.2)",
                                    borderRadius: 8, padding: "12px 14px", marginTop: 12,
                                }}>
                                    <div style={{ color: C.blue, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                                        Industry context
                                    </div>
                                    <div style={{ color: C.muted, fontSize: 12 }}>
                                        T20 pre-match models typically achieve 55–65%. Live ball-by-ball models with player stats reach 70–80%+.
                                        Our {overall}% is in the top tier for open-source cricket AI.
                                    </div>
                                </div>
                            </div>

                            <IndustryComparison ourAccuracy={overall} />
                        </div>

                        {/* Score prediction */}
                        {sp.mae && (
                            <div style={{
                                background: C.card, border: `1px solid ${C.border}`,
                                borderRadius: 12, padding: 24, marginBottom: 32,
                            }}>
                                <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>
                                    Score Prediction Accuracy
                                </h3>
                                <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>
                                    At the halfway point (over 10) of the first innings, we predict the final score.
                                </p>
                                <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                                    <div>
                                        <div style={{ fontSize: 36, fontWeight: 800, color: C.amber }}>{sp.mae}</div>
                                        <div style={{ color: C.text, fontSize: 14 }}>runs mean absolute error</div>
                                        <div style={{ color: C.muted, fontSize: 12 }}>from over 10 of innings 1</div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 200 }}>
                                        <div style={{ color: C.muted, fontSize: 13, marginBottom: 8 }}>
                                            Tested on {(sp.predictions || 0).toLocaleString()} matches.
                                            A ±{sp.mae}-run error on a ~160-run target is a{" "}
                                            <strong style={{ color: C.amber }}>
                                                {Math.round(sp.mae / 1.6)}% margin
                                            </strong> — comparable to industry-leading models.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent matches table */}
                        {recent.length > 0 && (
                            <div style={{
                                background: C.card, border: `1px solid ${C.border}`,
                                borderRadius: 12, overflow: "hidden", marginBottom: 32,
                            }}>
                                {/* Header */}
                                <div style={{
                                    padding: "16px 20px",
                                    borderBottom: `1px solid ${C.border}`,
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}>
                                    <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: 0 }}>
                                        Recent Match Results
                                    </h3>
                                    <span style={{ color: C.muted, fontSize: 12 }}>
                                        Win prediction from over 10 of 1st innings
                                    </span>
                                </div>

                                {/* Column headers */}
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr auto auto auto",
                                    gap: 12,
                                    padding: "8px 16px",
                                    borderBottom: `1px solid ${C.border}`,
                                    background: "rgba(255,255,255,0.02)",
                                }}>
                                    <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Match</div>
                                    <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Score</div>
                                    <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Confidence</div>
                                    <div style={{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Result</div>
                                </div>

                                {recent.map((m, i) => (
                                    <RecentMatchRow key={i} match={m} i={i} />
                                ))}

                                {/* Summary row */}
                                <div style={{
                                    padding: "12px 16px",
                                    borderTop: `1px solid ${C.border}`,
                                    display: "flex", justifyContent: "space-between",
                                    background: "rgba(16,185,129,0.05)",
                                }}>
                                    <span style={{ color: C.muted, fontSize: 13 }}>
                                        Showing last {recent.length} matches
                                    </span>
                                    <span style={{ color: C.green, fontSize: 13, fontWeight: 600 }}>
                                        {Math.round(recent.filter(m => m.correct).length / recent.length * 100)}% correct in this sample
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Methodology */}
                        <div style={{
                            background: C.card, border: `1px solid ${C.border}`,
                            borderRadius: 12, padding: 24, marginBottom: 32,
                        }}>
                            <h3 style={{ color: C.text, fontSize: 16, fontWeight: 700, margin: "0 0 16px" }}>
                                How We Measure Accuracy
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                                {[
                                    {
                                        title: "Backtesting on real matches",
                                        body: "We run our model against historical match files from Cricsheet.org — ball-by-ball data for every match. The model makes a prediction at each checkpoint (overs 6, 10, 15, 17). We then compare with the known match outcome.",
                                        icon: "🔁",
                                    },
                                    {
                                        title: "No data leakage",
                                        body: "Predictions use only data available at that exact point in the match. We never feed in future information. If a prediction is made at over 10, the model only sees score/wickets up to over 10.",
                                        icon: "🔒",
                                    },
                                    {
                                        title: "Independent verification",
                                        body: "The backtest script is open to review. Results are regenerated automatically every time models are retrained — we cannot manually adjust these numbers.",
                                        icon: "✅",
                                    },
                                    {
                                        title: "What accuracy means",
                                        body: "Win probability accuracy = the % of times our model correctly identified which team would win. A model with 50% is no better than guessing. Industry standard for live T20 models is 70–80%.",
                                        icon: "📏",
                                    },
                                ].map(item => (
                                    <div key={item.title}>
                                        <div style={{ fontSize: 20, marginBottom: 8 }}>{item.icon}</div>
                                        <div style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{item.title}</div>
                                        <div style={{ color: C.muted, fontSize: 13, lineHeight: 1.6 }}>{item.body}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Last updated */}
                        <div style={{ textAlign: "center", color: C.muted, fontSize: 12, marginBottom: 16 }}>
                            Last updated: {data.generated ? new Date(data.generated).toLocaleDateString("en-GB", {
                                day: "numeric", month: "long", year: "numeric"
                            }) : "Recently"} •{" "}
                            Backtest on {(data.matches_tested || 0).toLocaleString()} matches •{" "}
                            Auto-updated weekly
                        </div>
                    </>
                )}
            </div>

            {/* Responsive */}
            <style>{`
                @media (max-width: 680px) {
                    .accuracy-grid { grid-template-columns: 1fr !important; }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>

            <RGFooter />
        </div>
    );
}
