/* eslint-disable */
import React, { useEffect } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const NAVY = "#1E2D6B", GOLD = "#C8961E";

function setMeta(name, content, prop) {
    let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
}

const UPCOMING = [
    { t1: "England", t2: "India",        f: "T20I", slug: "england-vs-india",        t1f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", t2f: "🇮🇳" },
    { t1: "England", t2: "Australia",    f: "ODI",  slug: "england-vs-australia",    t1f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", t2f: "🇦🇺" },
    { t1: "England", t2: "Pakistan",     f: "T20I", slug: "england-vs-pakistan",     t1f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", t2f: "🇵🇰" },
    { t1: "England", t2: "South Africa", f: "Test", slug: "england-vs-south-africa", t1f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", t2f: "🇿🇦" },
    { t1: "England", t2: "New Zealand",  f: "T20I", slug: "england-vs-new-zealand",  t1f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", t2f: "🇳🇿" },
    { t1: "England", t2: "West Indies",  f: "ODI",  slug: "england-vs-west-indies",  t1f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", t2f: "🏏" },
    { t1: "Australia", t2: "India",      f: "T20I", slug: "australia-vs-india",      t1f: "🇦🇺", t2f: "🇮🇳" },
    { t1: "Australia", t2: "Pakistan",   f: "ODI",  slug: "australia-vs-pakistan",   t1f: "🇦🇺", t2f: "🇵🇰" },
    { t1: "India",   t2: "Pakistan",     f: "T20I", slug: "india-vs-pakistan",       t1f: "🇮🇳", t2f: "🇵🇰" },
    { t1: "Australia", t2: "New Zealand",f: "T20I", slug: "australia-vs-new-zealand",t1f: "🇦🇺", t2f: "🇳🇿" },
];

const FEATURES = [
    { icon: "🤖", title: "Machine learning model", desc: "Trained on 1.7 million cricket matches across 877 venues worldwide. Not opinion — pure data." },
    { icon: "⚡", title: "5-second live refresh", desc: "Win probability recalculates every 5 seconds during a live match. Watch it shift in real time." },
    { icon: "🏟️", title: "Venue-aware predictions", desc: "Lord's plays differently to The Oval. Our model uses venue-specific averages, not global stats." },
    { icon: "🌧️", title: "Weather & dew factor", desc: "Evening matches at Lord's often favour chasing due to dew. Our model accounts for this." },
    { icon: "📊", title: "Live probability graph", desc: "Full match probability history plotted over time — see exactly when and why the match turned." },
    { icon: "🎯", title: "78% accuracy", desc: "Verified on our public Track Record page — every match, every prediction, every result." },
];

export default function CricketPredictionsUK() {
    useEffect(() => {
        const title = "Cricket Predictions UK 2026 — Free AI Win Probability | CricIntelligence";
        const desc  = "Free AI cricket predictions for UK fans. Live win probability for England matches, The Hundred, international T20s and ODIs. Updated every ball. 78% accuracy. Trusted by cricket fans across the UK.";
        document.title = title;
        setMeta("description", desc);
        setMeta("og:title", title, true);
        setMeta("og:description", desc, true);
        setMeta("og:url", "https://www.cricintelligence.com/cricket-predictions-uk", true);
        let can = document.querySelector("link[rel='canonical']");
        if (!can) { can = document.createElement("link"); can.setAttribute("rel", "canonical"); document.head.appendChild(can); }
        can.setAttribute("href", "https://www.cricintelligence.com/cricket-predictions-uk");
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "#EEF2FF", fontFamily: "Inter, -apple-system, system-ui", color: "#0A0A0A" }}>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org", "@type": "WebPage",
                "name": "Cricket Predictions UK — AI Win Probability",
                "description": "Free AI-powered cricket predictions for UK fans. Live win probability for England matches and international cricket.",
                "url": "https://www.cricintelligence.com/cricket-predictions-uk",
                "publisher": { "@type": "Organization", "name": "CricIntelligence", "url": "https://www.cricintelligence.com" }
            })}} />

            <nav style={{ background: NAVY, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <a href="/"><Logo /></a>
                <a href="/" style={{ background: GOLD, color: NAVY, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>🔴 Live Predictions →</a>
            </nav>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px 80px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #253580 100%)`, borderRadius: 18, padding: "36px 28px", marginBottom: 32, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, marginBottom: 12 }}>FREE AI CRICKET PREDICTIONS · UK & AUSTRALIA</div>
                    <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.2 }}>
                        Cricket Predictions UK — Live AI Win Probability
                    </h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", margin: "0 0 22px", lineHeight: 1.75, maxWidth: 580 }}>
                        Free AI-powered cricket predictions for UK and Australian fans. Live win probability for England matches, international T20s, ODIs and The Hundred — updating every 5 seconds during a match. Built on 1.7 million historical matches. 78% accuracy, publicly verified.
                    </p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <a href="/" style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
                            🏏 See Live Predictions Now
                        </a>
                        <a href="/how-it-works" style={{ display: "inline-block", background: "rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, fontSize: 13, padding: "12px 20px", borderRadius: 10, textDecoration: "none", border: "1px solid rgba(255,255,255,0.2)" }}>
                            How it works →
                        </a>
                    </div>
                </div>

                {/* Match prediction links */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>International Cricket Match Predictions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10, marginBottom: 32 }}>
                    {UPCOMING.map(m => (
                        <a key={m.slug} href={`/predictions/international/${m.slug}`}
                            style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "14px 16px", textDecoration: "none", transition: "border-color .2s" }}
                            onMouseOver={e => e.currentTarget.style.borderColor = NAVY}
                            onMouseOut={e => e.currentTarget.style.borderColor = "#E2E8F0"}>
                            <div style={{ fontSize: 22 }}>{m.t1f}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{m.t1} vs {m.t2}</div>
                                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>AI Prediction · {m.f}</div>
                            </div>
                            <div style={{ fontSize: 22 }}>{m.t2f}</div>
                            <div style={{ fontSize: 12, color: GOLD, fontWeight: 700 }}>→</div>
                        </a>
                    ))}
                </div>

                {/* What is this */}
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 14 }}>What is CricIntelligence?</h2>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.85, margin: "0 0 12px" }}>
                        CricIntelligence is a free cricket prediction platform built for serious cricket fans in the UK, Australia, and across the cricket world. Unlike sites that publish static predictions written by tipsters, CricIntelligence uses a live machine learning model that updates win probability every 5 seconds during a match.
                    </p>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.85, margin: "0 0 12px" }}>
                        The model was trained on 1.7 million cricket matches — T20Is, ODIs, Tests, and domestic competitions — across 877 venues. For every live match, it processes current score, wickets in hand, required run rate, pitch deterioration, weather conditions, and live player statistics to compute a win probability accurate to within ±5%.
                    </p>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.85 }}>
                        Our prediction accuracy of <strong>78%</strong> is publicly verified on the <a href="/record" style={{ color: NAVY, fontWeight: 700 }}>Track Record page</a> — every match we predicted, every result. We don't cherry-pick.
                    </p>
                </div>

                {/* Features */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>Why Cricket Fans in the UK Use CricIntelligence</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 14, marginBottom: 32 }}>
                    {FEATURES.map(f => (
                        <div key={f.title} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px" }}>
                            <div style={{ fontSize: 26, marginBottom: 8 }}>{f.icon}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{f.title}</div>
                            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>

                {/* England cricket section — UK SEO */}
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: "24px 28px", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 14 }}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 England Cricket Predictions</h2>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.85, marginBottom: 12 }}>
                        England are ranked 3rd in the ICC T20I rankings and 2nd in ODI cricket. CricIntelligence provides live AI predictions for all England home and away matches — including The Hundred, bilateral series, and ICC tournaments.
                    </p>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.85, marginBottom: 12 }}>
                        For England home matches, our model uses venue-specific data for every UK ground: Lord's (London), The Oval (London), Edgbaston (Birmingham), Headingley (Leeds), Trent Bridge (Nottingham), Old Trafford (Manchester), and the Rose Bowl (Southampton). Each ground has different average scores and pitch behaviour that our model accounts for directly.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["england-vs-india", "england-vs-australia", "england-vs-pakistan", "england-vs-new-zealand"].map(slug => {
                            const parts = slug.split("-vs-");
                            return (
                                <a key={slug} href={`/predictions/international/${slug}`}
                                    style={{ fontSize: 12, fontWeight: 700, color: NAVY, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 20, padding: "5px 14px", textDecoration: "none" }}>
                                    {parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} vs {parts[1].split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")} →
                                </a>
                            );
                        })}
                    </div>
                </div>

                {/* RG section — UKGC required */}
                <div style={{ background: "#FFF8E7", border: "1.5px solid #F59E0B", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", marginBottom: 8 }}>⚠️ Responsible Gambling</div>
                    <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.75, margin: 0 }}>
                        CricIntelligence cricket predictions are for <strong>informational and entertainment purposes only</strong>. They are not betting advice or tips. Past prediction accuracy does not guarantee future results. Cricket is unpredictable. <strong>18+ only.</strong> If gambling is affecting you, contact the National Gambling Helpline: <strong>0808 8020 133</strong> (free, 24/7). <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: "#92400E" }}>BeGambleAware</a> · <a href="https://www.gamcare.org.uk" target="_blank" rel="noreferrer" style={{ color: "#92400E" }}>GamCare</a> · <a href="https://www.gamstop.co.uk" target="_blank" rel="noreferrer" style={{ color: "#92400E" }}>GAMSTOP</a>
                    </p>
                </div>

                {/* CTA */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, #253580)`, borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Watch the Next Match Live</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 18 }}>Free — no sign-up. Win probability updates every 5 seconds.</div>
                    <a href="/" style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 Open Live Predictions
                    </a>
                </div>
            </div>

            <RGFooter />
        </div>
    );
}
