/* eslint-disable */
import React, { useEffect } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const C = {
    bg: "#EEF2FF", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B",
    navy: "#1E2D6B", gold: "#C8961E", green: "#00B894",
};

function setMeta(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
}

export default function HowItWorks() {
    useEffect(() => {
        document.title = "How CricIntelligence Works — AI Cricket Win Probability Explained";
        setMeta("description", "Learn how CricIntelligence uses machine learning, venue history, pitch data, and live ball-by-ball stats to predict cricket match outcomes in real time.");
    }, []);

    const steps = [
        {
            num: "01",
            title: "Live data is fetched every 5 seconds",
            body: "As soon as a match goes live, our backend starts polling the cricket API for ball-by-ball data. Every 5 seconds we receive the latest score, wickets, overs, current partnership, bowler figures, and a ball-by-ball string of recent deliveries. This feeds directly into the prediction model.",
        },
        {
            num: "02",
            title: "Match state is computed",
            body: "From the raw data we derive the key match-state variables: current run rate (CRR), required run rate (RRR), wickets in hand, over phase (Powerplay / Middle / Death), and how many runs have been scored in the last 3 overs. We also compute a momentum index — how far the current CRR is above or below the venue's historical average run rate for that phase.",
        },
        {
            num: "03",
            title: "Venue averages are loaded",
            body: "Every ground has a different average first-innings score. Our venue database covers 877 grounds and 7,500+ T20 matches. Before running the model, we look up the specific ground and retrieve its average first-innings score, average run rate by phase, and historical chasing success rate. This corrects the model for high-scoring venues like M. Chinnaswamy (avg ~172) vs low-scoring venues like MA Chidambaram / Chepauk (avg ~155).",
        },
        {
            num: "04",
            title: "Pitch and weather adjustments",
            body: "Pitch type (flat, seam-friendly, spin-friendly) modifies the projected total. A seam-friendly pitch reduces the expected run rate in the Powerplay but increases wicket probability. Weather data — temperature and humidity — adjusts the dew factor, which increases after over 12 in evening games and makes batting easier in the second innings.",
        },
        {
            num: "05",
            title: "The ML model produces a win probability",
            body: "All 20+ features are fed into our XGBoost gradient-boosted classifier, trained on 1.7 million historical match records. For innings 1, the model projects a final total and calculates probability of that total being defended. For innings 2, it uses the ratio of current run rate to required run rate, weighted by wickets remaining, to estimate chase success probability. The output is clipped between 3% and 97% — we never show certainty, because cricket is never certain.",
        },
        {
            num: "06",
            title: "The result is delivered to your screen",
            body: "The probability and all supporting data — pressure score, momentum, phase breakdown, live batter and bowler stats, pitch behaviour, probability graph — are returned from the backend and rendered on screen in under 200ms. The graph updates every 5 seconds so you can watch the probability shift in real time as the match progresses.",
        },
    ];

    const features = [
        { icon: "🏟️", title: "Venue-aware model", desc: "Different average score and run rate for each of 877 grounds worldwide — not a one-size-fits-all global average." },
        { icon: "⚡", title: "5-second refresh", desc: "Win probability recalculates after every set of deliveries. You see the shift the moment something happens." },
        { icon: "🏏", title: "Live player data", desc: "Current batter strike rate, bowler economy, partnership runs and balls — all factored into the live prediction." },
        { icon: "🌧️", title: "Weather and dew", desc: "Humidity and temperature feed a dew factor model that adjusts second-innings probability in evening matches." },
        { icon: "📉", title: "Wicket penalty", desc: "Being 5 down is worse than 0 down even at the same score. Our model correctly penalises wickets lost." },
        { icon: "📊", title: "Probability graph", desc: "Full match probability history plotted as a graph — see exactly when and why the match turned." },
        { icon: "🎯", title: "Phase-specific analysis", desc: "Powerplay, Middle overs, and Death overs are modelled separately — each phase has different average run rates and wicket probabilities." },
        { icon: "🔔", title: "Push notifications", desc: "Get alerted when a match starts or when our model detects a major swing in win probability." },
    ];

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>

            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Back to App</a>
            </nav>

            <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "36px 36px 32px", marginBottom: 36, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>How It Works</div>
                    <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 14px", lineHeight: 1.25 }}>From a live delivery to a<br />win probability in 200ms</h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.8, maxWidth: 560 }}>
                        Here is exactly how CricIntelligence processes live cricket data, applies machine learning, and delivers a win probability that updates every 5 seconds during a match.
                    </p>
                </div>

                {/* Steps */}
                <div style={{ marginBottom: 36 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, margin: "0 0 20px" }}>Step-by-step: how a prediction is made</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {steps.map((s) => (
                            <div key={s.num} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", display: "flex", gap: 20, alignItems: "flex-start" }}>
                                <div style={{ fontSize: 22, fontWeight: 900, color: C.gold, flexShrink: 0, minWidth: 36, lineHeight: 1 }}>{s.num}</div>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{s.title}</div>
                                    <div style={{ fontSize: 13.5, color: "#444", lineHeight: 1.8 }}>{s.body}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Features grid */}
                <div style={{ marginBottom: 36 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, margin: "0 0 20px" }}>Key model features</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                        {features.map((f) => (
                            <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
                                <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{f.title}</div>
                                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Model honesty section */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "26px 30px", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 14px", paddingBottom: 10, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }}>When the model gets it wrong</h2>
                    <div style={{ fontSize: 14, color: "#333", lineHeight: 1.85, marginTop: 14 }}>
                        <p>No prediction model is perfect, and we never claim to be. CricIntelligence gets it wrong in predictable ways:</p>
                        <ul style={{ paddingLeft: 20, lineHeight: 2 }}>
                            <li><strong>Rain interruptions</strong> — DLS method recalculates the target mid-match. Our model uses the original target until the revised target is published in the API, which can cause a temporary spike or dip in probability.</li>
                            <li><strong>Extraordinary individual performances</strong> — A batter scoring 180 off 66 balls is a statistical outlier. The model correctly starts the innings with lower probability for a team needing a superhuman performance, but adjusts as the innings unfolds.</li>
                            <li><strong>New or rare venues</strong> — If a ground has fewer than 10 T20 matches in our database, we fall back to global averages, which are less precise.</li>
                            <li><strong>Toss and conditions</strong> — On certain pitches (particularly in India), the toss can swing probability significantly before a ball is bowled. Our model doesn't give the toss much weight, which occasionally means our pre-match reading is off.</li>
                        </ul>
                        <p style={{ marginTop: 8 }}>We believe in showing our work — the full prediction history is on the <a href="/record" style={{ color: C.navy, fontWeight: 700 }}>Record tab</a>.</p>
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: "center" }}>
                    <a href="/" style={{ display: "inline-block", background: C.navy, color: "#fff", padding: "14px 32px", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                        See it live →
                    </a>
                    <p style={{ fontSize: 12, color: C.muted, marginTop: 12 }}>Free — no sign-up required</p>
                </div>

            </div>

            <RGFooter />
        </div>
    );
}
