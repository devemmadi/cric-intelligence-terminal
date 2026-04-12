/* eslint-disable */
import React from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const C = { navy: "#1E2D6B", gold: "#C8961E", bg: "#EEF2FF", surface: "#fff", border: "#E2E8F0", muted: "#64748B", text: "#0A0A0A", green: "#00B894", red: "#EF4444" };

const FACTORS = [
    { icon: "🏟️", title: "Venue & Pitch", weight: "18%", desc: "Wankhede produces higher scores than Eden Gardens. Our model has separate scoring curves for all 877 tracked venues worldwide." },
    { icon: "🌦️", title: "Weather & Dew", weight: "12%", desc: "Dew in evening T20s dramatically affects grip and swing. The model detects dew conditions and adjusts bowling effectiveness predictions." },
    { icon: "📈", title: "Current Run Rate", weight: "22%", desc: "The most powerful signal. A team at 120/2 after 15 overs is in a very different position than 80/5. RR vs required RR delta drives the model." },
    { icon: "🎯", title: "Wickets in Hand", weight: "20%", desc: "Batting depth matters enormously in T20. 8 wickets at the halfway point gives massive latitude; 2 wickets creates pressure on every ball." },
    { icon: "👤", title: "Player Matchups", weight: "15%", desc: "Specific batter vs bowler matchups are modelled. A spinner vs an LHB at death overs has a different probability than pace vs RHB." },
    { icon: "🔄", title: "Phase Transitions", weight: "13%", desc: "Powerplay to middle overs, and middle to death — each transition creates momentum shifts. The model weights these phase changes explicitly." },
];

// Set page title
if (typeof document !== "undefined") document.title = "Cricket Win Probability Explained — How AI Predicts Matches | CricIntelligence";

export default function CricketWinProbability() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ background: C.gold, color: C.navy, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>Live Predictions →</a>
            </nav>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 60px" }}>

                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "36px 32px", marginBottom: 36, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>AI CRICKET ANALYSIS</div>
                    <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.15 }}>
                        Cricket Win Probability Explained
                    </h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: "0 0 22px", lineHeight: 1.7, maxWidth: 540 }}>
                        How does AI calculate which team will win a cricket match? We break down every factor our model uses — from pitch conditions to player matchups.
                    </p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>See Live Win Probability →</a>
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>What is Cricket Win Probability?</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>
                    Cricket win probability is a real-time percentage estimate of how likely each team is to win a match at any given moment. Unlike a coin flip at the start, win probability changes ball by ball as the match situation evolves — runs scored, wickets taken, overs bowled, and conditions all shift the balance.
                </p>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 32 }}>
                    CricIntelligence uses a machine learning model trained on 1.7 million historical T20 and ODI matches to calculate this probability in real time. When a wicket falls, the probability shifts. When a boundary is hit, it shifts. When dew sets in at over 12, it shifts. Every event updates the live prediction.
                </p>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>Factors That Drive Win Probability</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 20 }}>Our model weighs six major categories of signals. Here's what each contributes:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14, marginBottom: 36 }}>
                    {FACTORS.map(f => (
                        <div key={f.title} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 18px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                                <span style={{ fontSize: 24 }}>{f.icon}</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{f.title}</div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold }}>Weight: {f.weight}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>T20 vs ODI: How Predictions Differ</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 14 }}>
                    T20 matches are far more volatile than ODIs. A single over in a T20 can swing win probability by 20%. Our T20 model accounts for this higher variance — particularly in the powerplay (overs 1-6) and death overs (16-20), where the gap between a dot ball and a six is most impactful.
                </p>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 32 }}>
                    In ODIs, the model places more weight on middle-overs economy and partnership longevity. The 50-over format rewards sustained pressure across phases in a way T20 does not.
                </p>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>How Accurate Is It?</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 32 }}>
                    {[["80.2%", "Overall accuracy", "Across all T20 matches in test set"],
                      ["82.3%", "Death overs accuracy", "Most accurate in final 5 overs"],
                      ["±3.9%", "Average error", "Mean absolute error on win probability"]
                    ].map(([v, l, sub]) => (
                        <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: C.navy }}>{v}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginTop: 4 }}>{l}</div>
                            <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2A3F82)`, borderRadius: 16, padding: "28px", textAlign: "center", color: "#fff" }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>See Win Probability Live</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 20px" }}>Updates every ball during any live T20 or ODI. Free, no account needed.</p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>Open Live Predictions →</a>
                </div>
            </div>
            <RGFooter />
        </div>
    );
}
