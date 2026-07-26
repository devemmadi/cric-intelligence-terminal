/* eslint-disable */
import React, { useEffect } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const C = { navy: "#1E2D6B", gold: "#C8961E", bg: "#EEF2FF", surface: "#fff", border: "#E2E8F0", muted: "#64748B", text: "#0A0A0A" };

// Slugs match the TEAMS keys in MatchPredictionPage.jsx.
const NORTH = [
    { slug: "yorks",  name: "Yorkshire Vikings",           home: "Headingley" },
    { slug: "lancs",  name: "Lancashire Lightning",        home: "Old Trafford" },
    { slug: "notts",  name: "Notts Outlaws",               home: "Trent Bridge" },
    { slug: "dur",    name: "Durham",                      home: "Chester-le-Street" },
    { slug: "derby",  name: "Derbyshire Falcons",          home: "Derby" },
    { slug: "leic",   name: "Leicestershire Foxes",        home: "Grace Road" },
    { slug: "warks",  name: "Warwickshire",                home: "Edgbaston" },
    { slug: "worcs",  name: "Worcestershire Rapids",       home: "New Road" },
    { slug: "nhnts",  name: "Northamptonshire Steelbacks", home: "County Ground" },
];
const SOUTH = [
    { slug: "sur",    name: "Surrey",            home: "The Oval" },
    { slug: "ham",    name: "Hampshire Hawks",   home: "Utilita Bowl" },
    { slug: "som",    name: "Somerset",          home: "Taunton" },
    { slug: "ess",    name: "Essex Eagles",      home: "Chelmsford" },
    { slug: "kent",   name: "Kent Spitfires",    home: "Canterbury" },
    { slug: "sus",    name: "Sussex Sharks",     home: "Hove" },
    { slug: "mdx",    name: "Middlesex",         home: "Lord's" },
    { slug: "glam",   name: "Glamorgan",         home: "Sophia Gardens" },
    { slug: "gloucs", name: "Gloucestershire",   home: "Bristol" },
];

const FEATURED = [
    ["yorks", "lancs", "Roses rivalry"],
    ["sur", "mdx", "London derby"],
    ["ham", "sus", "South coast derby"],
    ["warks", "worcs", "Midlands derby"],
    ["notts", "derby", "East Midlands derby"],
    ["som", "gloucs", "West Country derby"],
];

const FAQS = [
    { q: "What is Vitality Blast Finals Day?", a: "Finals Day is the one-day climax of the T20 Blast at Edgbaston: two semi-finals in the morning and afternoon, then the final under lights. All three matches are played at the same ground on the same day, which makes pitch behaviour across the day unusually important." },
    { q: "How many counties play in the T20 Blast?", a: "All 18 first-class counties compete, split into North and South groups of nine. Each county plays 14 group matches before the quarter-finals." },
    { q: "How does CricIntelligence predict Blast matches?", a: "The model reads the live match rather than pre-match opinion: score, wickets in hand, required rate, over-by-over pitch behaviour, and current batter and bowler form. The win probability is recalculated after every ball." },
    { q: "Why do Blast pitches matter so much?", a: "County grounds vary enormously — Taunton and Trent Bridge are high-scoring, while Bristol and Derby often grip for spin. Our live pitch read infers behaviour from the actual runs and wickets in front of it instead of assuming a venue average." },
    { q: "Is it free?", a: "Yes — live win probability, score projections and phase forecasts, with no sign-up." },
];

function CountyList({ title, teams }) {
    return (
        <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gold, letterSpacing: 1, marginBottom: 8 }}>{title}</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
                {teams.map((t, i) => (
                    <div key={t.slug} style={{ padding: "11px 16px", borderBottom: i < teams.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>{t.home}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function VitalityBlast2026() {
    useEffect(() => {
        const title = "Vitality Blast 2026 Predictions & Finals Day — Live AI Win Probability | CricIntelligence";
        const desc = "Free AI predictions for the Vitality Blast 2026, including Finals Day at Edgbaston. Live win probability updated every ball, pitch analysis and score projections for all 18 counties.";
        const url = "https://www.cricintelligence.com/predictions/vitality-blast-2026";
        document.title = title;
        const sm = (name, content, prop) => {
            let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
            if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
            el.setAttribute("content", content);
        };
        sm("description", desc);
        sm("og:title", title, true); sm("og:description", desc, true); sm("og:url", url, true);
        sm("twitter:title", title); sm("twitter:description", desc);
        let can = document.querySelector("link[rel='canonical']");
        if (!can) { can = document.createElement("link"); can.setAttribute("rel", "canonical"); document.head.appendChild(can); }
        can.setAttribute("href", url);
    }, []);

    const byslug = Object.fromEntries([...NORTH, ...SOUTH].map(t => [t.slug, t]));

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": FAQS.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } }))
            })}} />

            <nav style={{ background: C.navy, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <Logo />
                <a href="/" style={{ background: C.gold, color: C.navy, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>🔴 Live Predictions →</a>
            </nav>

            <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 20px 70px" }}>

                <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, #2A3F82 100%)`, borderRadius: 18, padding: "36px 32px", marginBottom: 32, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>AI CRICKET PREDICTIONS · VITALITY BLAST 2026</div>
                    <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.15 }}>
                        Vitality Blast 2026 Predictions &amp; Finals Day
                    </h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", margin: "0 0 22px", lineHeight: 1.7, maxWidth: 580 }}>
                        Live win probability for every T20 Blast match, updated after every ball. All 18 counties, a live read on how each county pitch is actually playing, and score projections — free, no sign-up.
                    </p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 Open Live Predictions
                    </a>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px", marginBottom: 30 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 10 }}>Finals Day at Edgbaston</h2>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 12 }}>
                        Three matches, one ground, one day — two semi-finals then the final under lights. It is the hardest day of the Blast to predict from form alone, because the surface is doing something different by the evening than it was at eleven in the morning.
                    </p>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>
                        That is exactly the case where a live model beats a pre-match preview. Ours infers pitch behaviour from the over-by-over run and wicket pattern in the match actually in front of it, so a surface that slows down between the semi and the final is reflected in the numbers rather than assumed away.
                    </p>
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>All 18 counties</h2>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Nine in each group. Home ground matters — Taunton and Trent Bridge score heavily, Bristol and Derby often grip.</p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 34 }}>
                    <CountyList title="NORTH GROUP" teams={NORTH} />
                    <CountyList title="SOUTH GROUP" teams={SOUTH} />
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>Blast derbies worth watching</h2>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>The fixtures that fill county grounds. Open any matchup for head-to-head context and live win probability.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10, marginBottom: 36 }}>
                    {FEATURED.map(([a, b, label]) => (
                        <a key={a + b} href={`/predictions/${a}-vs-${b}-2026`}
                           style={{ display: "block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", textDecoration: "none", color: C.text }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: 1, marginBottom: 3 }}>{label.toUpperCase()}</div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{byslug[a].name} vs {byslug[b].name}</div>
                        </a>
                    ))}
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 14 }}>Vitality Blast — FAQs</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 34 }}>
                    {FAQS.map(({ q, a }) => (
                        <div key={q} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{q}</div>
                            <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{a}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 34 }}>
                    <a href="/cricket-predictions-uk" style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>UK cricket predictions →</a>
                    <a href="/predictions/the-hundred-2026" style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>The Hundred 2026 →</a>
                    <a href="/predictions/t20-predictions" style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>All T20 predictions →</a>
                </div>

                <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2A3F82)`, borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Follow every Blast match live</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 18 }}>Win probability after every ball. Free, no account.</div>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 Open Live Predictions
                    </a>
                </div>
            </div>

            <RGFooter />
        </div>
    );
}
