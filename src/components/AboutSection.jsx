/* eslint-disable */
import React from "react";
import { C } from "./shared/constants";

export default function AboutSection() {
    const features = [
        {
            icon: "🤖",
            title: "AI Win Probability",
            desc: "XGBoost + Bayesian ensemble model trained on 5,000+ T20 matches. Updates every 12 seconds during live play.",
        },
        {
            icon: "📊",
            title: "Over-by-Over Projections",
            desc: "Predicts runs and wicket risk for the next 3 overs using live batter SR, bowler economy, pitch conditions and momentum.",
        },
        {
            icon: "🏏",
            title: "Pitch & Match Intelligence",
            desc: "Live pitch read from real ball data — not guesswork. Weather, dew factor, powerplay performance and toss advantage combined.",
        },
        {
            icon: "📈",
            title: "Verified Track Record",
            desc: "85% win-direction accuracy across 21 tracked matches. Every prediction logged to Supabase with full transparency.",
        },
    ];

    return (
        <section
            id="about"
            style={{
                background: "#0B1120",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "60px 20px 48px",
            }}
        >
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
                {/* Heading */}
                <div style={{ textAlign: "center", marginBottom: 40 }}>
                    <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text, margin: "0 0 12px" }}>
                        What is CricIntelligence?
                    </h2>
                    <p style={{ fontSize: 15, color: "#9CA3AF", maxWidth: 620, margin: "0 auto", lineHeight: 1.6 }}>
                        CricIntelligence is a free AI-powered cricket prediction platform that delivers
                        real-time win probability, over projections, and confidence signals for live T20 matches —
                        built on machine learning and statistical inference, not intuition.
                    </p>
                </div>

                {/* Feature grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 16,
                    marginBottom: 40,
                }}>
                    {features.map((f) => (
                        <div key={f.title} style={{
                            background: "#111827",
                            borderRadius: 12,
                            border: "1px solid rgba(255,255,255,0.07)",
                            padding: "20px 18px",
                        }}>
                            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{f.title}</div>
                            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* Tech stack row */}
                <div style={{
                    background: "#111827",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.07)",
                    padding: "20px 24px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: 24,
                    justifyContent: "center",
                }}>
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>73%</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>ML Accuracy</div>
                    </div>
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: C.accent }}>85%</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Win Direction</div>
                    </div>
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: C.amber }}>8</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Models Stacked</div>
                    </div>
                    <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: "#C084FC" }}>Free</div>
                        <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Always</div>
                    </div>
                </div>

                {/* Models footnote */}
                <p style={{ textAlign: "center", fontSize: 11, color: "#374151", marginTop: 20, lineHeight: 1.5 }}>
                    Powered by XGBoost · Bayesian Beta-Binomial · Monte Carlo · Kalman Filter · Hawkes Process · Kaplan-Meier · Claude AI narratives
                </p>
            </div>
        </section>
    );
}
