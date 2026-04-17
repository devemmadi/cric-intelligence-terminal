/* eslint-disable */
import React, { useEffect } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const C = { navy: "#1E2D6B", gold: "#C8961E", bg: "#EEF2FF", surface: "#fff", border: "#E2E8F0", muted: "#64748B", text: "#0A0A0A", green: "#00B894", red: "#EF4444" };

const IPL_TEAMS = [
    { name: "Mumbai Indians", short: "MI", titles: 5, strength: "Batting", aiRating: 88, winChance: "22%", color: "#004BA0" },
    { name: "Chennai Super Kings", short: "CSK", titles: 5, strength: "All-round", aiRating: 86, winChance: "19%", color: "#F7A721" },
    { name: "Royal Challengers Bengaluru", short: "RCB", titles: 0, strength: "Power hitting", aiRating: 81, winChance: "14%", color: "#EC1C24" },
    { name: "Kolkata Knight Riders", short: "KKR", titles: 3, strength: "Spin bowling", aiRating: 83, winChance: "16%", color: "#3A225D" },
    { name: "Sunrisers Hyderabad", short: "SRH", titles: 1, strength: "Pace attack", aiRating: 79, winChance: "11%", color: "#F7A721" },
    { name: "Rajasthan Royals", short: "RR", titles: 1, strength: "Balanced", aiRating: 77, winChance: "9%", color: "#E91E8C" },
    { name: "Delhi Capitals", short: "DC", titles: 0, strength: "Young talent", aiRating: 75, winChance: "5%", color: "#0078BC" },
    { name: "Punjab Kings", short: "PBKS", titles: 0, strength: "Big hitting", aiRating: 74, winChance: "4%", color: "#ED1B24" },
];

const FAQS = [
    { q: "How accurate are CricIntelligence IPL 2026 predictions?", a: "Our AI model achieves 80.2% accuracy across 7,900+ T20 matches. For IPL specifically, the model accounts for pitch conditions at each venue, team composition, recent form, and over-by-over patterns to generate win probability." },
    { q: "Which team is most likely to win IPL 2026?", a: "Based on our AI model trained on squad strength, auction results, and historical IPL performance, Mumbai Indians and Chennai Super Kings lead with the highest win probability entering IPL 2026. Predictions update live during every match." },
    { q: "How does over-by-over prediction work?", a: "For each upcoming over, our model predicts an expected run range (e.g. 6-9 runs), wicket probability, and phase context (powerplay/middle/death). These update every ball using live match data from our backend." },
    { q: "Is CricIntelligence free to use?", a: "Yes — all live predictions and match analysis on CricIntelligence are completely free. You can view win probability, next over predictions, and scorecard data for any live IPL 2026 match at no cost." },
    { q: "Can I use these predictions for betting?", a: "CricIntelligence predictions are for informational and entertainment purposes only. They do not constitute betting advice. Always gamble responsibly and only with licensed operators. 18+ only." },
];

// Set page title

export default function IPL2026Predictions() {
    useEffect(() => {
        document.title = "IPL 2026 Predictions & Win Probability — AI Cricket Analysis | CricIntelligence";
        let el = document.querySelector("link[rel='canonical']");
        if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
        el.setAttribute("href", "https://www.cricintelligence.com/predictions/ipl-2026");
    }, []);
    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>

            {/* Nav */}
            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ background: C.gold, color: C.navy, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>Live Predictions →</a>
            </nav>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 60px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "36px 32px", marginBottom: 36, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>AI CRICKET PREDICTIONS · IPL 2026</div>
                    <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.15 }}>
                        IPL 2026 Predictions &amp; Win Probability
                    </h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: "0 0 22px", lineHeight: 1.7, maxWidth: 540 }}>
                        Live AI-powered predictions for every IPL 2026 match. Win probability, over-by-over forecasts, and pitch analysis — updated every ball. 80.2% accuracy. Built on 7,900+ T20 matches.
                    </p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 View Live Predictions
                    </a>
                </div>

                {/* Expert IPL 2026 Match Predictions — targeting high-impression GSC query */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px 24px", marginBottom: 28 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 10 }}>Expert IPL 2026 Match Predictions</h2>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 14 }}>
                        CricIntelligence delivers expert IPL 2026 match predictions powered by machine learning — not opinion. Every IPL 2026 prediction is calculated from 25+ live signals: current score, wickets in hand, required run rate, pitch condition, dew probability, bowler economy, and batting strike rate. The model re-evaluates every ball.
                    </p>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 16 }}>
                        Unlike pundits, our IPL 2026 prediction engine doesn't guess — it calculates. When a team needs 48 off 30 balls with 6 wickets in hand on a flat Wankhede pitch, the model has seen thousands of similar scenarios and knows the historical outcome distribution.
                    </p>
                    <a href="/" style={{ display: "inline-block", background: C.navy, color: "#fff", fontWeight: 700, fontSize: 13, padding: "10px 22px", borderRadius: 9, textDecoration: "none" }}>
                        See Today's IPL 2026 Prediction →
                    </a>
                </div>

                {/* How it works */}
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 16 }}>How Our AI Predicts IPL 2026 Matches</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14, marginBottom: 36 }}>
                    {[
                        ["🏟️", "Venue Intelligence", "877 venues tracked. Each pitch has its own scoring model — from Wankhede's bounce to Chepauk's spin."],
                        ["📊", "Real-Time Data", "Ball-by-ball data feeds into the model every 5 seconds during a live match. Predictions update instantly."],
                        ["🌦️", "Weather & Dew", "Evening matches in India are heavily affected by dew. Our model weights this for death-over accuracy."],
                        ["🤖", "80.2% Accuracy", "XGBoost model trained on 7,900+ T20 matches. 25 features including player stats, venue par & phase data."],
                    ].map(([icon, title, desc]) => (
                        <div key={title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 18px" }}>
                            <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{title}</div>
                            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{desc}</div>
                        </div>
                    ))}
                </div>

                {/* Team predictions */}
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>IPL 2026 Team Win Probability</h2>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>AI model ratings based on squad strength, auction picks, venue history and recent T20 form. Updated for IPL 2026.</p>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 36 }}>
                    {IPL_TEAMS.map((t, i) => (
                        <div key={t.short} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < IPL_TEAMS.length - 1 ? `1px solid ${C.border}` : "none", flexWrap: "wrap" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: t.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{t.short}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 140 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{t.name}</div>
                                <div style={{ fontSize: 12, color: C.muted }}>Strength: {t.strength} · {t.titles} IPL title{t.titles !== 1 ? "s" : ""}</div>
                            </div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: C.navy }}>{t.winChance}</div>
                                    <div style={{ fontSize: 10, color: C.muted }}>Win chance</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: `conic-gradient(${C.navy} ${t.aiRating}%, #E2E8F0 0)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <span style={{ fontSize: 10, fontWeight: 800, color: C.navy }}>{t.aiRating}</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>AI rating</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Win probability cricket — targeting 14-impression GSC query */}
                <div style={{ background: `linear-gradient(135deg,#0F172A,#1E2D6B)`, borderRadius: 16, padding: "24px 24px", marginBottom: 28, color: "#fff" }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10 }}>Win Probability in Cricket: How It Works</h2>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: 12 }}>
                        Win probability in cricket is a percentage — the likelihood that a team wins the match from the current game state. At 0 overs, both teams start at 50%. As runs are scored, wickets fall, and overs reduce, the probability shifts ball by ball.
                    </p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75, marginBottom: 12 }}>
                        CricIntelligence calculates cricket win probability using an XGBoost model trained on 7,900+ T20 matches. Inputs include: runs scored, wickets lost, overs completed, target (2nd innings), venue run rate history, pitch condition, and current phase (powerplay / middle / death).
                    </p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.75 }}>
                        A team chasing 180 at 90/2 after 10 overs is in a very different position to 90/5 — even though the score is identical. Win probability captures this nuance. Our model achieves 80.2% accuracy predicting the final winner from any point mid-match.
                    </p>
                </div>

                {/* FAQ - great for SEO */}
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 16 }}>Frequently Asked Questions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
                    {FAQS.map((f, i) => (
                        <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Q: {f.q}</div>
                            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{f.a}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2A3F82)`, borderRadius: 16, padding: "28px 28px", textAlign: "center", color: "#fff" }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>Watch IPL 2026 Predictions Live</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 20px" }}>Win probability updates every ball. Free, no sign-up required.</p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>Open Live Predictions →</a>
                </div>
            </div>

            <RGFooter />
        </div>
    );
}
