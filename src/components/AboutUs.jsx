/* eslint-disable */
import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const C = {
    bg: "#EEF2FF", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B", accent: "#354D97",
    navy: "#1E2D6B", gold: "#C8961E", green: "#00B894",
};

function setMeta(name, content, prop) {
    let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
}

export default function AboutUs() {
    useEffect(() => {
        let el = document.querySelector("link[rel='canonical']");
        if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
        el.setAttribute("href", "https://www.cricintelligence.com/about");
    }, []);
    const [copied, setCopied] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    useEffect(() => {
        const title = "About CricIntelligence — AI Cricket Predictions Platform | Free IPL 2026";
        const desc  = "CricIntelligence uses machine learning trained on 1.7M+ matches to deliver real-time cricket win probability, IPL 2026 predictions, and pitch analysis. Learn how our AI works.";
        const url   = "https://www.cricintelligence.com/about";
        document.title = title;
        setMeta("description", desc);
        setMeta("og:title", title, true); setMeta("og:description", desc, true); setMeta("og:url", url, true);
        setMeta("twitter:title", title); setMeta("twitter:description", desc);
    }, []);

    const handleCopy = () => {
        navigator.clipboard?.writeText("emmadi.dev@gmail.com").then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const faqs = [
        {
            q: "How accurate are CricIntelligence predictions?",
            a: "Our model achieves approximately 78% accuracy across all formats — higher for T20 matches where the dataset is largest. Accuracy is measured as the percentage of matches where the team our model favoured at the halfway point went on to win. We publish our full track record on the Record tab so you can verify this yourself."
        },
        {
            q: "How often does the win probability update during a live match?",
            a: "The win probability refreshes every 5 seconds during a live match, pulling ball-by-ball data from our cricket API. After each wicket or boundary the model re-evaluates all inputs — current run rate, required run rate, wickets in hand, pitch deterioration, phase of play, and recent scoring patterns — and issues a new probability instantly."
        },
        {
            q: "What data does the AI model use?",
            a: "Our model uses: current score, wickets, overs completed, required run rate, venue-specific average scores, pitch type (flat/swing/pace/spin), weather conditions including dew factor, powerplay and death-over strike rates, individual batter and bowler live stats, over-by-over scoring history, and historical head-to-head records at that venue. Global T20 averages are corrected for venue — Chinnaswamy (Bengaluru) averages ~172 in the first innings, very different from a low-scoring venue like Chepauk."
        },
        {
            q: "Is this service free?",
            a: "Yes — CricIntelligence is completely free. We cover IPL 2026, international T20s, ODIs, and major domestic tournaments. No registration, no paywall. We are supported by ads and coffee donations."
        },
        {
            q: "Does CricIntelligence predict betting outcomes?",
            a: "No. CricIntelligence predictions are for entertainment and informational purposes only. We analyse cricket data and show win probability based on our model — this is not betting advice. We strongly encourage responsible gambling. 18+ only. If gambling is causing you harm, call the National Gambling Helpline: 0808 8020 133."
        },
        {
            q: "What is the Pitch tab and how does it work?",
            a: "The Pitch tab gives a real-time behavioural profile of the playing surface. It analyses live over history to detect how the pitch is playing — whether it is flat (high scoring), offering swing or seam early on, turning for spinners in the middle overs, or deteriorating rapidly in the second innings. Each segment (Powerplay, Overs 5-10, Middle, Death) is scored using actual runs and wickets from the live match, not pre-set static data."
        },
        {
            q: "Which cricket formats and tournaments do you cover?",
            a: "We cover all formats that appear in major cricket APIs: IPL 2026, international T20Is, ODIs, T20 World Cup, The Hundred, Big Bash, SA20, and other major domestic T20 leagues. Test matches are supported but win probability for five-day matches works differently — we show session-based momentum rather than a single win percentage."
        },
        {
            q: "How is CricIntelligence different from other prediction sites?",
            a: "Most cricket prediction sites use simple rules: team ranking, recent form, toss result. CricIntelligence uses a trained machine learning model that processes 20+ live features simultaneously. Crucially, our model is venue-aware — it knows that 160 at Chinnaswamy is below par while 160 at Chepauk is competitive. Predictions update every 5 seconds, not just at innings breaks."
        },
        {
            q: "Can I get push notifications for match predictions?",
            a: "Yes — click the bell icon in the top navigation to enable push notifications. We send alerts when a match starts, at key moments (first wicket, 50-run partnership, final over), and when our model detects a major swing in win probability."
        },
    ];

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>

            {/* Nav */}
            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Back to App</a>
            </nav>

            <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 80px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "36px 36px 32px", marginBottom: 32, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>About CricIntelligence</div>
                    <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>AI Cricket Predictions,<br />Built on Real Data</h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.8, maxWidth: 560 }}>
                        CricIntelligence is a free AI-powered cricket prediction platform. We process live ball-by-ball data, venue history, pitch conditions, and player statistics to deliver real-time win probability for IPL 2026, international T20s, and ODIs — updating every 5 seconds during a match.
                    </p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
                    {[["1.7M+", "Matches in training data"], ["877", "Venues tracked worldwide"], ["78%", "Prediction accuracy"]].map(([v, l]) => (
                        <div key={l} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 900, color: C.navy }}>{v}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 5, lineHeight: 1.4 }}>{l}</div>
                        </div>
                    ))}
                </div>

                {/* Mission */}
                <Section title="Our Mission">
                    <p>Cricket is the second most popular sport on the planet, followed by over 2.5 billion people. Yet accurate, data-driven match analysis has traditionally been locked behind expensive subscriptions or buried in spreadsheets. CricIntelligence was built to change that — to bring professional-grade prediction tools to every fan, for free.</p>
                    <p>We believe that understanding the numbers behind a cricket match makes watching it better. Knowing that a team's win probability just dropped from 68% to 41% in three overs tells you that something significant just happened — even before the commentators catch up. That is what CricIntelligence gives you: a live, data-driven view of the match as it unfolds.</p>
                </Section>

                {/* How the model works */}
                <Section title="How the AI Model Works">
                    <p>Our prediction engine is a gradient-boosted machine learning model trained on over 1.7 million cricket matches across T20, ODI, and domestic formats. The model was built using scikit-learn and XGBoost, with a feature set of 20+ inputs that update in real time:</p>
                    <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#333", fontSize: 14 }}>
                        <li><strong>Current match state</strong> — runs, wickets, overs completed, current run rate, required run rate</li>
                        <li><strong>Phase of play</strong> — Powerplay (overs 1-6), Middle overs (7-15), Death overs (16-20)</li>
                        <li><strong>Venue correction</strong> — every ground has a different average first-innings score. The model uses venue-specific historical averages from 7,500+ T20 matches across 877 venues, not a global average</li>
                        <li><strong>Pitch type</strong> — flat/batting-friendly, seam-friendly, spin-friendly, or unknown; affects projected totals and wicket probability</li>
                        <li><strong>Weather and dew</strong> — dew factor increases after over 12 in high-humidity evening games, making it easier to bat in the second innings</li>
                        <li><strong>Live batter and bowler data</strong> — strike rate of the current partnership, economy rate and wicket rate of the bowling attack</li>
                        <li><strong>Recent scoring trajectory</strong> — runs and wickets in the last 3 overs, detecting momentum shifts</li>
                        <li><strong>Wicket-in-hand penalty</strong> — being 5 wickets down with the same score as 0 wickets down reduces probability; wickets in hand strongly predict scoring ability in the remaining overs</li>
                    </ul>
                    <p>For innings 1, the model projects a final total based on current scoring rate, venue average, and pitch adjustment, then calculates win probability. For innings 2, it uses the ratio of current run rate to required run rate, weighted by wickets remaining and historical chasing success rates at that venue.</p>
                </Section>

                {/* Venue awareness */}
                <Section title="Why Venue Matters">
                    <p>One of the biggest weaknesses in simple cricket prediction models is using a global average — treating every ground the same. CricIntelligence is venue-aware. Here is why that matters:</p>
                    <p>M. Chinnaswamy Stadium in Bengaluru averages around 172 runs in IPL first innings — a high-scoring venue with short boundaries and flat pitches. MA Chidambaram Stadium in Chennai (Chepauk) averages around 155 — slower, spin-friendly surface. A score of 160/4 at Chinnaswamy is below par (batting team is behind). The same 160/4 at Chepauk is above par (batting team is ahead). A model that treats both the same will give a wrong probability.</p>
                    <p>Our model loads venue statistics at startup from a dataset covering 877 grounds worldwide. For every live match, it fetches the specific ground's average first-innings score and run rate and uses those to calibrate the prediction.</p>
                </Section>

                {/* Track record */}
                <Section title="Track Record and Transparency">
                    <p>We publish our prediction history openly on the Record tab. Every match we predicted is logged with the teams, venue, our AI win probability at key moments, and the actual result. You can verify our 78% accuracy claim yourself — we have nothing to hide.</p>
                    <p>When our model is wrong, it is usually due to one of three things: a sudden rain interruption (DLS changes everything), an extraordinary individual performance that no model could anticipate, or a match involving a team with very little historical data (newer IPL franchises or minnow T20 sides).</p>
                </Section>

                {/* Technology stack */}
                <Section title="Technology">
                    <p>CricIntelligence is built on a modern, lightweight technology stack designed for speed and reliability:</p>
                    <ul style={{ paddingLeft: 20, lineHeight: 2, color: "#333", fontSize: 14 }}>
                        <li><strong>Frontend</strong> — React (no heavy framework), hosted on Netlify with a global CDN</li>
                        <li><strong>Backend</strong> — Python/Flask API hosted on Railway, with joblib-serialised ML models loaded into memory at startup</li>
                        <li><strong>Data</strong> — Live ball-by-ball data aggregated from cricket APIs every 5 seconds during matches</li>
                        <li><strong>Model training</strong> — XGBoost classifier trained on 1.7M+ match records with cross-validation; retrained periodically as new match data becomes available</li>
                        <li><strong>Venue database</strong> — 7,500+ T20 matches indexed by venue with segmented over-by-over statistics</li>
                    </ul>
                </Section>

                {/* FAQ */}
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, margin: "0 0 16px" }}>
                        Frequently Asked Questions
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {faqs.map((item, i) => (
                            <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{ width: "100%", textAlign: "left", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1.4 }}>{item.q}</span>
                                    <span style={{ fontSize: 18, color: C.gold, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
                                </button>
                                {openFaq === i && (
                                    <div style={{ padding: "0 20px 18px", fontSize: 14, color: "#444", lineHeight: 1.8, borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Responsible gambling */}
                <div style={{ background: "#FFF8E7", border: "1.5px solid #F59E0B", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#92400E", marginBottom: 8 }}>⚠️ Responsible Gambling Notice</div>
                    <p style={{ fontSize: 13, color: "#78350F", lineHeight: 1.7, margin: 0 }}>
                        CricIntelligence provides AI predictions for <strong>entertainment and informational purposes only</strong>. This is not betting advice. Past prediction accuracy does not guarantee future results. Cricket is unpredictable — our model helps you understand the game better, not place bets. If gambling is affecting you or someone you know, please seek help. <strong>18+ only.</strong> National Gambling Helpline: <strong>0808 8020 133</strong> (free, 24/7). <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: "#92400E" }}>BeGambleAware.org</a> | <a href="https://www.gamcare.org.uk" target="_blank" rel="noreferrer" style={{ color: "#92400E" }}>GamCare.org.uk</a>
                    </p>
                </div>

                {/* Contact */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "28px 32px" }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 8px" }}>Contact Us</h2>
                    <p style={{ fontSize: 14, color: "#333", lineHeight: 1.8, margin: "0 0 20px" }}>
                        Have a question, feedback, or a partnership enquiry? We read every message and typically respond within 24 hours.
                    </p>
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
                            <button onClick={handleCopy} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.surface, color: copied ? C.green : C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                                {copied ? "✓ Copied!" : "Copy"}
                            </button>
                            <a href="mailto:emmadi.dev@gmail.com" style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: C.navy, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
                                Send Email
                            </a>
                        </div>
                    </div>
                </div>

            </div>

            <RGFooter />
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, padding: "26px 30px", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#1E2D6B", margin: "0 0 14px", paddingBottom: 10, borderBottom: "2px solid #C8961E", display: "inline-block" }}>{title}</h2>
            <div style={{ fontSize: 14, color: "#333", lineHeight: 1.85, marginTop: 14 }}>{children}</div>
        </div>
    );
}
