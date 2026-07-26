/* eslint-disable */
import React, { useEffect } from "react";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const C = { navy: "#1E2D6B", gold: "#C8961E", bg: "#EEF2FF", surface: "#fff", border: "#E2E8F0", muted: "#64748B", text: "#0A0A0A" };

// Slugs must match the TEAMS keys in MatchPredictionPage.jsx so the matchup links resolve.
const TEAMS = [
    { slug: "mi-london",               name: "MI London",              home: "Kia Oval, London",            color: "#004BA0", note: "Defending champions (as Oval Invincibles), rebranded for 2026" },
    { slug: "sunrisers-leeds",         name: "Sunrisers Leeds",        home: "Headingley, Leeds",           color: "#FF822A", note: "Aggressive top order, pace-friendly home ground" },
    { slug: "manchester-super-giants", name: "Manchester Super Giants", home: "Old Trafford, Manchester",   color: "#0078BC", note: "Balanced squad with strong death bowling" },
    { slug: "birmingham-phoenix",      name: "Birmingham Phoenix",     home: "Edgbaston, Birmingham",       color: "#EE3124", note: "Big-hitting side, loudest home crowd in the competition" },
    { slug: "southern-brave",          name: "Southern Brave",         home: "Utilita Bowl, Southampton",   color: "#0072CE", note: "Consistent finals-day pedigree" },
    { slug: "trent-rockets",           name: "Trent Rockets",          home: "Trent Bridge, Nottingham",    color: "#8A1538", note: "High-scoring venue, built for chases" },
    { slug: "london-spirit",           name: "London Spirit",          home: "Lord's, London",              color: "#8E1B3C", note: "Pace-friendly conditions at Lord's" },
    { slug: "welsh-fire",              name: "Welsh Fire",             home: "Sophia Gardens, Cardiff",     color: "#C8102E", note: "Spin-friendly home surface" },
];

// Every side plays every other side once (plus a regional derby rematch) in the 2026 format,
// so all 28 pairings below are genuine fixtures at some point in the group stage.
function allPairings() {
    const out = [];
    for (let i = 0; i < TEAMS.length; i++) {
        for (let j = i + 1; j < TEAMS.length; j++) out.push([TEAMS[i], TEAMS[j]]);
    }
    return out;
}

const FAQS = [
    { q: "When does The Hundred 2026 start and finish?", a: "The 2026 group stage runs from 21 July to 12 August, with the Eliminator on 14 August and the Final on 16 August. Each men's side plays eight group matches — one against every other team, plus a rematch against their nearest regional rival." },
    { q: "Which teams play in The Hundred 2026?", a: "Eight teams: MI London, Sunrisers Leeds, Manchester Super Giants, Birmingham Phoenix, Southern Brave, Trent Rockets, London Spirit and Welsh Fire. Three sides were rebranded ahead of 2026 following private investment — Oval Invincibles became MI London, Northern Superchargers became Sunrisers Leeds, and Manchester Originals became Manchester Super Giants." },
    { q: "How does CricIntelligence predict Hundred matches?", a: "The model reads the live match: current score, wickets in hand, required rate, how the pitch is actually behaving over by over, plus batter and bowler form. It recalculates the win probability after every ball rather than relying on a pre-match opinion." },
    { q: "Is the 100-ball format different to a T20 for prediction purposes?", a: "Yes — 100 balls instead of 120 compresses every phase, so the cost of a slow start is higher and death-overs maths arrives sooner. Our live model works from balls remaining and required rate rather than assuming a 20-over shape." },
    { q: "Is it free?", a: "Yes. Live win probability, score projections and next-ball-phase forecasts are free with no sign-up." },
];

export default function TheHundred2026() {
    useEffect(() => {
        const title = "The Hundred 2026 Predictions — Live AI Win Probability | CricIntelligence";
        const desc = "Free AI predictions for every match of The Hundred 2026. Live win probability updated every ball, score projections and pitch analysis for all eight teams. No sign-up.";
        const url = "https://www.cricintelligence.com/predictions/the-hundred-2026";
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

    const pairings = allPairings();

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
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, letterSpacing: 2, marginBottom: 10 }}>AI CRICKET PREDICTIONS · THE HUNDRED 2026</div>
                    <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.15 }}>
                        The Hundred 2026 Predictions &amp; Live Win Probability
                    </h1>
                    <p style={{ fontSize: 15, color: "rgba(255,255,255,0.72)", margin: "0 0 22px", lineHeight: 1.7, maxWidth: 580 }}>
                        Free, live win probability for every match of The Hundred 2026 — recalculated after every ball. Score projections, next-phase run forecasts and a live read on how the pitch is actually playing. No sign-up.
                    </p>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 Open Live Predictions
                    </a>
                </div>

                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: "24px", marginBottom: 30 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 10 }}>What makes the 100-ball format different</h2>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 12 }}>
                        A hundred balls instead of a hundred and twenty sounds like a small change, but it compresses the whole innings. There are twenty fewer balls to recover from a bad powerplay, so a slow start costs a side far more than it would in a T20 — and the "death overs" arithmetic starts biting earlier.
                    </p>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75 }}>
                        Our model works from balls remaining and required rate rather than assuming a twenty-over shape, and it reads the pitch from the actual over-by-over run and wicket pattern in front of it. That matters at grounds like Trent Bridge, where a chase that looks behind on paper is often still very much alive.
                    </p>
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>The eight teams</h2>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>Three sides were rebranded for 2026 after private investment. Home grounds shape a lot of the scoring.</p>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 34 }}>
                    {TEAMS.map((t, i) => (
                        <div key={t.slug} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderBottom: i < TEAMS.length - 1 ? `1px solid ${C.border}` : "none", flexWrap: "wrap" }}>
                            <div style={{ width: 42, height: 42, borderRadius: 10, background: t.color, flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 180 }}>
                                <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                                <div style={{ fontSize: 12, color: C.muted }}>{t.home} · {t.note}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 6 }}>Every Hundred 2026 matchup</h2>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
                    Each side meets every other side at least once in the group stage. Open any matchup for head-to-head context, then follow it live once the match starts.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 10, marginBottom: 36 }}>
                    {pairings.map(([a, b]) => (
                        <a key={a.slug + b.slug} href={`/predictions/${a.slug}-vs-${b.slug}-2026`}
                           style={{ display: "block", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", textDecoration: "none", color: C.text }}>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{a.name} vs {b.name}</div>
                            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Prediction &amp; live win %</div>
                        </a>
                    ))}
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.navy, marginBottom: 14 }}>The Hundred 2026 — FAQs</h2>
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
                    <a href="/predictions/vitality-blast-2026" style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>Vitality Blast 2026 →</a>
                    <a href="/predictions/t20-predictions" style={{ fontSize: 13, color: C.navy, fontWeight: 700 }}>All T20 predictions →</a>
                </div>

                <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2A3F82)`, borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Watch the probability move, ball by ball</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginBottom: 18 }}>Free during every Hundred match. No account needed.</div>
                    <a href="/" style={{ display: "inline-block", background: C.gold, color: C.navy, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 Open Live Predictions
                    </a>
                </div>
            </div>

            <RGFooter />
        </div>
    );
}
