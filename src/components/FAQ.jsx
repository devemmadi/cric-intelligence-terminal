/* eslint-disable */
import React, { useState, useEffect } from "react";
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

const SECTIONS = [
    {
        heading: "Predictions & Accuracy",
        items: [
            {
                q: "How accurate are CricIntelligence predictions?",
                a: "Our model achieves approximately 78% accuracy across all T20 formats, measured as the percentage of matches where the team our model favoured at the halfway point of the first innings went on to win. The full prediction history is published on our Record tab — every match, every prediction, every result. We don't cherry-pick."
            },
            {
                q: "How often does win probability update during a live match?",
                a: "Every 5 seconds. Our backend polls live ball-by-ball data continuously during a match and the model recalculates win probability after each set of deliveries. After a wicket or a boundary, you'll see the probability shift almost instantly."
            },
            {
                q: "What is 'momentum' and how is it calculated?",
                a: "Momentum is the difference between the current run rate (CRR) and the venue's historical average run rate for that phase of play. A positive momentum (e.g. +1.4) means the batting team is scoring faster than the historical average for that ground and phase. A negative momentum means they are behind the expected scoring rate. This is more meaningful than raw CRR because different grounds have very different averages."
            },
            {
                q: "Why does the probability sometimes jump sharply?",
                a: "A sharp jump usually indicates a wicket falling (probability drops for the batting team) or a big over (probability rises). It can also happen when we receive a corrected score from the live API after a delay. Very occasionally, a rain interruption and DLS revision can cause a temporary jump before the revised target is confirmed."
            },
            {
                q: "Does the model account for team strength differences?",
                a: "Yes — team historical win rates are included in the feature set. However, we don't heavily weight pre-match team ratings because cricket is highly situational. A strong batting lineup losing 3 wickets in the Powerplay can quickly see its advantage eroded. We let the live match data dominate over pre-match ratings."
            },
        ]
    },
    {
        heading: "Using the App",
        items: [
            {
                q: "How do I switch between live matches?",
                a: "On the left sidebar (desktop) or the Matches tab (mobile), you'll see all ongoing and upcoming matches. Click any match to load its prediction. The app will automatically switch to the Predictions tab with the new match loaded."
            },
            {
                q: "What does the Pitch tab show?",
                a: "The Pitch tab gives a live behavioural profile of the pitch based on actual match data. It analyses the over-by-over scoring rate and wicket patterns from the current match to detect: whether the pitch is flat/high-scoring, whether early swing or seam is assisting bowlers, whether spinners are getting turn in the middle overs, and how fast the pitch is deteriorating. All data is live — not pre-set static content."
            },
            {
                q: "What is the 'pressure score'?",
                a: "The pressure score is a composite index (0-100) reflecting how much pressure the batting team is currently under. It factors in current run rate vs required run rate, wickets lost, overs remaining, and the phase of play. A score above 70 means the batting team is in significant difficulty. A score below 30 means they are in a comfortable position."
            },
            {
                q: "How do push notifications work?",
                a: "Click the bell icon in the top navigation bar and grant permission when your browser asks. We send notifications when: a live match you are watching has a major probability swing (more than 20% in either direction), a match starts, the first wicket falls, and at the final over. You can revoke permission at any time in your browser settings."
            },
            {
                q: "Does the app work on mobile?",
                a: "Yes — CricIntelligence is fully responsive. On mobile, the layout switches to a single-column view with a bottom navigation bar. All features — predictions, match switching, pitch analysis, probability graph — are available on mobile."
            },
            {
                q: "Is there a dark mode?",
                a: "The app uses a dark navy theme throughout by design. We don't currently offer a light mode toggle, but the dark theme is optimised for readability during evening matches."
            },
        ]
    },
    {
        heading: "IPL 2026",
        items: [
            {
                q: "Does CricIntelligence cover IPL 2026?",
                a: "Yes — IPL 2026 is our primary focus. All live IPL matches appear in the match list automatically. We have venue-specific historical data for all 10 IPL venues including Chinnaswamy (Bengaluru), Wankhede (Mumbai), Eden Gardens (Kolkata), MA Chidambaram (Chennai), Arun Jaitley Stadium (Delhi), and others."
            },
            {
                q: "Why do IPL predictions update more precisely than other tournaments?",
                a: "IPL has the richest dataset in our venue database. With 17 seasons of data across a consistent set of grounds, our venue averages for IPL stadiums are highly accurate. This means the model's venue correction is more precise for IPL than for, say, a bilateral T20I at a rarely-used ground."
            },
            {
                q: "Can I see predictions for upcoming (not yet started) IPL matches?",
                a: "Pre-match predictions are available as soon as a match appears in the upcoming fixtures list, typically 24 hours before the start. The pre-match prediction shows a baseline probability based on team historical win rates, venue advantage, and toss-bat/field statistics."
            },
        ]
    },
    {
        heading: "Data and Privacy",
        items: [
            {
                q: "What data does CricIntelligence collect about me?",
                a: "Very little. We use Google Analytics to understand aggregate usage (page views, sessions, device types). We don't collect your name, email, or any personally identifiable information. If you enable push notifications, your browser generates an anonymous push token which we store solely to send match alerts. See our Privacy Policy for full details."
            },
            {
                q: "Does CricIntelligence use cookies?",
                a: "We use minimal cookies — Google Analytics sets its own tracking cookie (you can opt out via the browser). We do not use advertising cookies or sell any data to third parties."
            },
            {
                q: "Where does the live cricket data come from?",
                a: "We aggregate live data from a cricket data API that sources ball-by-ball information from official scorecard providers. We don't scrape any websites and we don't use data from betting exchanges."
            },
        ]
    },
    {
        heading: "Responsible Gambling",
        items: [
            {
                q: "Is CricIntelligence a betting site?",
                a: "No. CricIntelligence is a cricket analytics and prediction platform. We are not affiliated with any bookmaker or betting exchange. Our predictions are for entertainment and informational purposes only — they are not betting tips or financial advice."
            },
            {
                q: "Can I use CricIntelligence predictions to bet?",
                a: "Our terms of service prohibit using our predictions as the basis for placing bets. Cricket is unpredictable — even a model with 78% accuracy means 22% of outcomes are unexpected. Past model performance never guarantees future results. Please gamble responsibly. If gambling is causing harm, call the free helpline: 0808 8020 133."
            },
            {
                q: "What responsible gambling resources do you recommend?",
                a: "We recommend: BeGambleAware (begambleaware.org), GamCare (gamcare.org.uk), GAMSTOP (gamstop.co.uk — self-exclusion service), and the National Gambling Helpline on 0808 8020 133 (free, 24/7). This service is for users aged 18 and over only."
            },
        ]
    },
];

export default function FAQ() {
    useEffect(() => {
        let el = document.querySelector("link[rel='canonical']");
        if (!el) { el = document.createElement('link'); el.setAttribute('rel', 'canonical'); document.head.appendChild(el); }
        el.setAttribute('href', 'https://www.cricintelligence.com/faq');
    }, []);
    const [openItem, setOpenItem] = useState(null);

    useEffect(() => {
        document.title = "FAQ — CricIntelligence AI Cricket Predictions";
        setMeta("description", "Answers to common questions about CricIntelligence: how the AI model works, prediction accuracy, IPL 2026 coverage, live data sources, and responsible gambling.");
    }, []);

    const toggle = (key) => setOpenItem(openItem === key ? null : key);

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>

            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, textDecoration: "none" }}>← Back to App</a>
            </nav>

            <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 80px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "32px 36px", marginBottom: 36, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Help Centre</div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.3 }}>Frequently Asked Questions</h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: 0, lineHeight: 1.7 }}>
                        Everything you need to know about CricIntelligence — the model, the app, IPL 2026 coverage, and responsible gambling.
                    </p>
                </div>

                {/* Jump links */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 32 }}>
                    {SECTIONS.map(s => (
                        <a key={s.heading} href={`#${s.heading.replace(/\s+/g, "-")}`}
                            style={{ fontSize: 12, fontWeight: 700, color: C.navy, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: "6px 14px", textDecoration: "none" }}>
                            {s.heading}
                        </a>
                    ))}
                </div>

                {SECTIONS.map((section) => (
                    <div key={section.heading} id={section.heading.replace(/\s+/g, "-")} style={{ marginBottom: 36 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.navy, margin: "0 0 14px", paddingBottom: 10, borderBottom: `2px solid ${C.gold}`, display: "inline-block" }}>
                            {section.heading}
                        </h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {section.items.map((item, idx) => {
                                const key = `${section.heading}-${idx}`;
                                const isOpen = openItem === key;
                                return (
                                    <div key={key} style={{ background: C.surface, border: `1px solid ${isOpen ? C.navy : C.border}`, borderRadius: 12, overflow: "hidden", transition: "border-color .2s" }}>
                                        <button
                                            onClick={() => toggle(key)}
                                            style={{ width: "100%", textAlign: "left", padding: "15px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                                            <span style={{ fontSize: 14, fontWeight: 700, color: C.navy, lineHeight: 1.45 }}>{item.q}</span>
                                            <span style={{ fontSize: 20, color: C.gold, flexShrink: 0, transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .2s", lineHeight: 1 }}>+</span>
                                        </button>
                                        {isOpen && (
                                            <div style={{ padding: "0 20px 18px", fontSize: 13.5, color: "#444", lineHeight: 1.8, borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 0 }}>
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* Still have questions */}
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 28px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 10 }}>💬</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Still have a question?</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>We read every message and typically respond within 24 hours.</div>
                    <a href="mailto:emmadi.dev@gmail.com" style={{ display: "inline-block", background: C.navy, color: "#fff", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                        Email us
                    </a>
                </div>

            </div>

            <RGFooter />
        </div>
    );
}
