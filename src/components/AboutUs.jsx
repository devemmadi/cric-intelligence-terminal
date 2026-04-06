/* eslint-disable */
import React, { useState } from "react";
import Logo from "./Logo";

const C = {
    bg: "#EEF2FF", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B", accent: "#354D97",
    navy: "#1E2D6B", gold: "#C8961E", green: "#00B894",
};

export default function AboutUs() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard?.writeText("emmadi.dev@gmail.com").then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>

            {/* Nav */}
            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Back to App</a>
            </nav>

            <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "36px 36px 32px", marginBottom: 40, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>About Us</div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>CricIntelligence</h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.7, maxWidth: 520 }}>
                        AI-powered cricket predictions built on 1.7 million historical matches across 877 venues worldwide. Real-time win probability, over-by-over intelligence, and IPL 2026 analysis — all free.
                    </p>
                </div>

                {/* What we do */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 14px", paddingBottom: 10, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }}>What We Do</h2>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: "14px 0 0" }}>
                        CricIntelligence uses machine learning to deliver live cricket match predictions. Our model analyses pitch conditions, weather, player form, venue history, and real-time ball-by-ball data to give you the most accurate win probability available — updating every 5 seconds during a live match.
                    </p>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: "12px 0 0" }}>
                        We cover IPL 2026, international T20s, ODIs, and major domestic tournaments. Every prediction is powered by a model trained on over 1.7 million matches across 877 venues.
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                    {[["1.7M+", "Matches in training data"], ["877", "Venues tracked globally"], ["78.2%", "Prediction accuracy"]].map(([v, l]) => (
                        <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 26, fontWeight: 900, color: C.navy }}>{v}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.4 }}>{l}</div>
                        </div>
                    ))}
                </div>

                {/* Tech */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 20 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 14px", paddingBottom: 10, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }}>The Technology</h2>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: "14px 0 0" }}>
                        Our prediction engine is a multi-layer machine learning model that processes real-time match data alongside historical patterns. It accounts for pitch deterioration, dew factor, bowling economy trends, batting strike rate shifts, and over-phase transitions (powerplay → middle → death overs).
                    </p>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: "12px 0 0" }}>
                        The frontend is built with React and connects to a live backend that aggregates data from cricket APIs every 5 seconds during live matches.
                    </p>
                </div>

                {/* Contact */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 14px", paddingBottom: 10, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }}>Contact</h2>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: "14px 0 20px" }}>
                        Have a question, feedback, or partnership enquiry? Reach out directly — we read every message.
                    </p>

                    {/* Email card */}
                    <div style={{ background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <span style={{ fontSize: 18 }}>✉️</span>
                            </div>
                            <div>
                                <div style={{ fontSize: 11, color: C.muted, marginBottom: 2, fontWeight: 600, letterSpacing: 0.5 }}>EMAIL</div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>emmadi.dev@gmail.com</div>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={handleCopy}
                                style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: copied ? C.green : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all .2s" }}>
                                {copied ? "✓ Copied!" : "Copy"}
                            </button>
                            <a
                                href="mailto:emmadi.dev@gmail.com"
                                style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: C.navy, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                                Send Email
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
