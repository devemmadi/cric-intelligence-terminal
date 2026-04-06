/* eslint-disable */
import React from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const C = { navy: "#1E2D6B", gold: "#C8961E", bg: "#EEF2FF", surface: "#fff", border: "#E2E8F0", muted: "#64748B", text: "#0A0A0A", green: "#00B894", red: "#EF4444" };

const PHASES = [
    { name: "Powerplay", overs: "1–6", icon: "⚡", color: "#3B82F6", desc: "New ball, fielding restrictions. Openers attack. AI model detects whether pitch favours seam movement — which suppresses early scoring — or flat conditions that favour big powerplay totals. Average powerplay score: 48 runs in T20s globally.", tips: ["Top 2 wickets in hand = attack mode", "Wicket in over 1-2 = team retreats", "Pitch: hard/dry = higher expected runs"] },
    { name: "Middle Overs", overs: "7–15", icon: "🎯", color: "#8B5CF6", desc: "Spinners dominate. Dot balls build pressure. Win probability is most stable here — big swings happen at the boundaries of this phase. Our model tracks partnership length and required run rate divergence closely.", tips: ["Partnership > 30 = momentum shift", "RR gap widening = pressure rising", "Spin economy < 7 = bowling team ahead"] },
    { name: "Death Overs", overs: "16–20", icon: "💀", color: "#EF4444", desc: "The most predictable phase, paradoxically. Death bowling data is so rich (specialist bowlers, known patterns) that our model is 40% more accurate here than in the powerplay. Dew factor, wickets in hand, and required rate all peak in importance.", tips: ["5+ wickets: 8+ RPO achievable", "3 wickets: 7 RPO realistic", "Dew confirmed = batting team boosted"] },
];

const T20_LEAGUES = [
    { name: "IPL 2026", country: "🇮🇳", flag: "India", months: "Mar–May 2026", teams: 10, matches: 74, covered: true },
    { name: "The Hundred", country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flag: "England", months: "Jul–Aug 2026", teams: 8, matches: 34, covered: true },
    { name: "Big Bash League", country: "🇦🇺", flag: "Australia", months: "Dec 2026–Jan 2027", teams: 8, matches: 61, covered: true },
    { name: "T20 World Cup", country: "🌍", flag: "International", months: "Jun 2026", teams: 20, matches: 55, covered: true },
    { name: "T20 Blast", country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flag: "England", months: "May–Sep 2026", teams: 18, matches: 133, covered: true },
    { name: "PSL", country: "🇵🇰", flag: "Pakistan", months: "Feb–Mar 2026", teams: 6, matches: 34, covered: true },
];

export default function T20Predictions() {
    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ background: C.gold, color: C.navy, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>Live Predictions →</a>
            </nav>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 20px 60px" }}>

                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "36px 32px", marginBottom: 36, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>AI ANALYSIS · T20 CRICKET</div>
                    <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.15 }}>
                        T20 Cricket Predictions: AI Over-by-Over Analysis
                    </h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: "0 0 22px", lineHeight: 1.7, maxWidth: 540 }}>
                        Real-time T20 match predictions covering IPL, The Hundred, Big Bash, and T20 internationals. Over-by-over forecasts powered by machine learning.
                    </p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>🏏 View Live T20 Predictions</a>
                </div>

                {/* Phase analysis */}
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>T20 Match Phases: What AI Watches</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 20 }}>
                    T20 cricket breaks into three distinct phases. Our AI model assigns different weights and signals to each phase — because what matters in the powerplay is completely different from what matters in the death overs.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                    {PHASES.map(p => (
                        <div key={p.name} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                            <div style={{ background: p.color, padding: "12px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 20 }}>{p.icon}</span>
                                <div>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{p.name}</div>
                                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Overs {p.overs}</div>
                                </div>
                            </div>
                            <div style={{ padding: "16px 20px" }}>
                                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: "0 0 12px" }}>{p.desc}</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                    {p.tips.map((t, i) => (
                                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                            <span style={{ color: p.color, fontWeight: 700, flexShrink: 0 }}>→</span>
                                            <span style={{ fontSize: 13, color: C.text }}>{t}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Leagues covered */}
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 8 }}>T20 Leagues We Cover</h2>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.8, marginBottom: 16 }}>Live predictions activate automatically when any of these tournaments are in progress.</p>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 36 }}>
                    {T20_LEAGUES.map((l, i) => (
                        <div key={l.name} style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: i < T20_LEAGUES.length - 1 ? `1px solid ${C.border}` : "none", gap: 14, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 24, flexShrink: 0 }}>{l.country}</span>
                            <div style={{ flex: 1, minWidth: 120 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{l.name}</div>
                                <div style={{ fontSize: 12, color: C.muted }}>{l.flag} · {l.months}</div>
                            </div>
                            <div style={{ display: "flex", gap: 16 }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{l.teams}</div>
                                    <div style={{ fontSize: 10, color: C.muted }}>Teams</div>
                                </div>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: C.navy }}>{l.matches}</div>
                                    <div style={{ fontSize: 10, color: C.muted }}>Matches</div>
                                </div>
                                <div style={{ background: "#DCFCE7", color: "#166534", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, alignSelf: "center" }}>✓ Covered</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2A3F82)`, borderRadius: 16, padding: "28px", textAlign: "center", color: "#fff" }}>
                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 10px" }}>Live T20 Predictions — Free</h3>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 20px" }}>Over-by-over AI forecasts for every live T20. No account needed.</p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>Open Live Predictions →</a>
                </div>
            </div>
            <RGFooter />
        </div>
    );
}
