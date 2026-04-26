/* eslint-disable */
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const TEAMS = {
    mi:   { name: "Mumbai Indians",           short: "MI",   color: "#004BA0", bg: "#001F5B", titles: 5, strength: "Batting depth & pace attack",     aiRating: 88 },
    csk:  { name: "Chennai Super Kings",      short: "CSK",  color: "#F7A721", bg: "#7A4F00", titles: 5, strength: "Experience & death bowling",       aiRating: 86 },
    rcb:  { name: "Royal Challengers Bengaluru", short: "RCB", color: "#EC1C24", bg: "#6B0000", titles: 0, strength: "Power hitting top order",        aiRating: 81 },
    kkr:  { name: "Kolkata Knight Riders",    short: "KKR",  color: "#3A225D", bg: "#1A0A2E", titles: 3, strength: "Spin bowling & batting",            aiRating: 83 },
    srh:  { name: "Sunrisers Hyderabad",      short: "SRH",  color: "#FF822A", bg: "#7A2B00", titles: 1, strength: "Aggressive batting & pace",        aiRating: 79 },
    rr:   { name: "Rajasthan Royals",         short: "RR",   color: "#E91E8C", bg: "#6B0040", titles: 1, strength: "Balanced squad",                   aiRating: 77 },
    dc:   { name: "Delhi Capitals",           short: "DC",   color: "#0078BC", bg: "#003558", titles: 0, strength: "Young talent & spin",              aiRating: 75 },
    pbks: { name: "Punjab Kings",             short: "PBKS", color: "#ED1B24", bg: "#6B0000", titles: 0, strength: "Big hitting & pace bowling",       aiRating: 74 },
    gt:   { name: "Gujarat Titans",           short: "GT",   color: "#1C4E9D", bg: "#0A1F4A", titles: 2, strength: "All-round balance",                aiRating: 80 },
    lsg:  { name: "Lucknow Super Giants",     short: "LSG",  color: "#A0C8FF", bg: "#001F3F", titles: 0, strength: "Bowling attack",                   aiRating: 76 },
};

const H2H = {
    "mi-csk":   { t1w: 20, t2w: 16, last5: ["MI","CSK","MI","MI","CSK"] },
    "mi-rcb":   { t1w: 19, t2w: 14, last5: ["MI","RCB","MI","MI","RCB"] },
    "mi-kkr":   { t1w: 18, t2w: 13, last5: ["MI","MI","KKR","MI","KKR"] },
    "mi-srh":   { t1w: 15, t2w: 12, last5: ["SRH","MI","MI","SRH","MI"] },
    "mi-rr":    { t1w: 17, t2w: 10, last5: ["MI","MI","RR","MI","MI"]   },
    "mi-dc":    { t1w: 16, t2w: 11, last5: ["MI","DC","MI","MI","DC"]   },
    "mi-gt":    { t1w: 4,  t2w: 5,  last5: ["GT","MI","GT","MI","GT"]   },
    "mi-lsg":   { t1w: 3,  t2w: 5,  last5: ["LSG","MI","LSG","MI","MI"] },
    "mi-pbks":  { t1w: 18, t2w: 9,  last5: ["MI","MI","PBKS","MI","MI"] },
    "csk-rcb":  { t1w: 21, t2w: 12, last5: ["CSK","RCB","CSK","CSK","RCB"] },
    "csk-kkr":  { t1w: 18, t2w: 14, last5: ["CSK","KKR","CSK","CSK","KKR"] },
    "csk-srh":  { t1w: 14, t2w: 12, last5: ["CSK","SRH","CSK","SRH","CSK"] },
    "csk-rr":   { t1w: 16, t2w: 11, last5: ["CSK","CSK","RR","CSK","CSK"]  },
    "csk-dc":   { t1w: 17, t2w: 9,  last5: ["CSK","DC","CSK","CSK","CSK"]  },
    "csk-gt":   { t1w: 3,  t2w: 5,  last5: ["GT","GT","CSK","GT","CSK"]    },
    "csk-lsg":  { t1w: 4,  t2w: 4,  last5: ["CSK","LSG","CSK","LSG","CSK"] },
    "rcb-kkr":  { t1w: 14, t2w: 16, last5: ["KKR","RCB","KKR","KKR","RCB"] },
    "rcb-srh":  { t1w: 13, t2w: 12, last5: ["RCB","SRH","RCB","SRH","RCB"] },
    "rcb-rr":   { t1w: 12, t2w: 13, last5: ["RR","RCB","RR","RCB","RR"]    },
    "kkr-srh":  { t1w: 13, t2w: 12, last5: ["KKR","SRH","KKR","SRH","KKR"] },
};

function getH2H(t1key, t2key) {
    return H2H[`${t1key}-${t2key}`] || H2H[`${t2key}-${t1key}`] || { t1w: 10, t2w: 10, last5: [] };
}

const NAVY = "#1E2D6B";
const GOLD = "#C8961E";

function MetaTags({ t1, t2, slug }) {
    const title = `${t1.name} vs ${t2.name} Prediction IPL 2026 — AI Win Probability | CricIntelligence`;
    const desc  = `AI-powered ${t1.short} vs ${t2.short} IPL 2026 prediction. Live win probability, over-by-over forecasts & head-to-head analysis. Free. Updated every ball.`;
    React.useEffect(() => {
        document.title = title;
        const setMeta = (name, content, prop) => {
            let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
            if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
            el.setAttribute("content", content);
        };
        setMeta("description", desc);
        setMeta("og:title", title, true);
        setMeta("og:description", desc, true);
        setMeta("og:url", `https://www.cricintelligence.com/predictions/${slug}`, true);
        setMeta("twitter:title", title);
        setMeta("twitter:description", desc);
        const canonical = document.querySelector("link[rel='canonical']");
        if (canonical) canonical.href = `https://www.cricintelligence.com/predictions/${slug}`;
    }, [slug]);
    return null;
}

export default function MatchPredictionPage() {
    const { matchup } = useParams();
    const navigate = useNavigate();
    const parts = (matchup || "").toLowerCase().replace(/-ipl-2026$/, "").replace(/-ipl2026$/, "");
    const vsIdx = parts.indexOf("-vs-");
    const t1key = vsIdx > -1 ? parts.slice(0, vsIdx) : "";
    const t2key = vsIdx > -1 ? parts.slice(vsIdx + 4) : "";
    const t1 = TEAMS[t1key];
    const t2 = TEAMS[t2key];

    if (!t1 || !t2) {
        navigate("/", { replace: true });
        return null;
    }

    const h2h = getH2H(t1key, t2key);
    const isFlipped = !!H2H[`${t2key}-${t1key}`] && !H2H[`${t1key}-${t2key}`];
    const t1wins = isFlipped ? h2h.t2w : h2h.t1w;
    const t2wins = isFlipped ? h2h.t1w : h2h.t2w;
    const total  = t1wins + t2wins;
    const t1pct  = Math.round((t1wins / total) * 100);
    const aiProb = Math.min(72, Math.max(38, Math.round(((t1.aiRating / (t1.aiRating + t2.aiRating)) * 100))));

    const slug = matchup || `${t1key}-vs-${t2key}`;
    const faqs = [
        { q: `Who will win ${t1.short} vs ${t2.short} in IPL 2026?`, a: `Based on head-to-head records and our AI model, ${aiProb > 50 ? t1.name : t2.name} hold a slight edge. ${t1.short} have won ${t1wins} of ${total} meetings. For live win probability during the match, visit our live predictions page.` },
        { q: `What is the head-to-head record of ${t1.short} vs ${t2.short}?`, a: `${t1.name} have won ${t1wins} matches while ${t2.name} have won ${t2wins} in ${total} total meetings. ${t1.short} hold a ${t1pct}% win rate in this fixture.` },
        { q: `How does CricIntelligence predict ${t1.short} vs ${t2.short}?`, a: `Our AI model considers pitch conditions, current innings data, player form, run rates, wicket patterns, and over-phase factors. Predictions update every ball during live matches.` },
        { q: `When does the ${t1.short} vs ${t2.short} IPL 2026 match start?`, a: `Check our live matches section for confirmed dates and times. IPL 2026 matches typically start at 7:30 PM IST.` },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#EEF2FF", fontFamily: "Inter, -apple-system, system-ui", color: "#0A0A0A" }}>
            <MetaTags t1={t1} t2={t2} slug={slug} />

            {/* Schema JSON-LD */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SportsEvent",
                "name": `${t1.name} vs ${t2.name} IPL 2026`,
                "sport": "Cricket",
                "description": `AI prediction for ${t1.short} vs ${t2.short} IPL 2026 match`,
                "organizer": { "@type": "Organization", "name": "IPL" },
                "competitor": [
                    { "@type": "SportsTeam", "name": t1.name },
                    { "@type": "SportsTeam", "name": t2.name }
                ],
                "url": `https://www.cricintelligence.com/predictions/${slug}`
            })}} />

            {/* Nav */}
            <nav style={{ background: NAVY, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <a href="/"><Logo /></a>
                <a href="/" style={{ background: GOLD, color: NAVY, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>🔴 Live Predictions →</a>
            </nav>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px 80px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #253580 100%)`, borderRadius: 18, padding: "32px 28px", marginBottom: 28, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, marginBottom: 12 }}>AI PREDICTION · IPL 2026</div>
                    <h1 style={{ fontSize: "clamp(22px,4vw,34px)", fontWeight: 900, margin: "0 0 10px", lineHeight: 1.2 }}>
                        {t1.name} vs {t2.name} — IPL 2026 Prediction
                    </h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 20px", lineHeight: 1.7, maxWidth: 540 }}>
                        AI-powered win probability for {t1.short} vs {t2.short}. Live over-by-over forecasts, pitch analysis & head-to-head data — updated every ball during the match.
                    </p>

                    {/* Teams */}
                    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: t1.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", border: "3px solid rgba(255,255,255,0.3)" }}>{t1.short}</div>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>{t1.name}</span>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>AI WIN PROBABILITY</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: GOLD }}>{aiProb}% <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>vs {100 - aiProb}%</span></div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Updates live during match</div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 56, height: 56, borderRadius: "50%", background: t2.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", border: "3px solid rgba(255,255,255,0.3)" }}>{t2.short}</div>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 700 }}>{t2.name}</span>
                        </div>
                    </div>

                    <a href="/" style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 14, padding: "12px 24px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 See Live {t1.short} vs {t2.short} Prediction →
                    </a>
                </div>

                {/* Head to Head */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>{t1.short} vs {t2.short} — Head to Head Record</h2>
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 16 }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 36, fontWeight: 900, color: t1.color }}>{t1wins}</div>
                            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t1.short} Wins</div>
                        </div>
                        <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 13 }}>of {total}<br />matches</div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 36, fontWeight: 900, color: t2.color }}>{t2wins}</div>
                            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t2.short} Wins</div>
                        </div>
                    </div>
                    {/* Bar */}
                    <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
                        <div style={{ height: "100%", width: t1pct + "%", background: t1.color, borderRadius: 4, transition: "width 1s ease" }} />
                    </div>
                    {h2h.last5.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8, fontWeight: 600 }}>LAST 5 RESULTS</div>
                            <div style={{ display: "flex", gap: 6 }}>
                                {h2h.last5.map((winner, i) => (
                                    <div key={i} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: winner === t1.short ? t1.color : t2.color, color: "#fff" }}>{winner}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Team Strengths */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>Team Analysis — {t1.short} vs {t2.short}</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                    {[t1, t2].map(team => (
                        <div key={team.short} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: team.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff" }}>{team.short}</div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: NAVY }}>{team.name}</div>
                                    <div style={{ fontSize: 11, color: "#64748B" }}>{team.titles} IPL title{team.titles !== 1 ? "s" : ""}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
                                <strong>Key strength:</strong> {team.strength}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ fontSize: 11, color: "#94A3B8", width: 60 }}>AI Rating</div>
                                <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: team.aiRating + "%", background: team.color, borderRadius: 3 }} />
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: team.color }}>{team.aiRating}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* How our AI works */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>How We Predict {t1.short} vs {t2.short}</h2>
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
                        {[
                            ["🤖", "ML Model", "XGBoost trained on 7,900+ T20 matches. 80% accuracy."],
                            ["📊", "Live Data", "Ball-by-ball updates from live match feed."],
                            ["🏟️", "Venue Stats", "335 venues tracked — pitch conditions & scoring trends."],
                            ["⚡", "Real-time", "Win probability recalculates every 30 seconds."],
                        ].map(([icon, title, desc]) => (
                            <div key={title} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 20 }}>{icon}</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{title}</div>
                                    <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>{t1.short} vs {t2.short} — FAQs</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                    {faqs.map(({ q, a }) => (
                        <div key={q} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "16px 20px" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: NAVY, marginBottom: 6 }}>{q}</div>
                            <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.65 }}>{a}</div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, #253580)`, borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Watch the Probability Change Live</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 18 }}>Our graph updates every ball. Come back during the {t1.short} vs {t2.short} match to see it live.</div>
                    <a href="/" style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 Open Live Predictions
                    </a>
                </div>
            </div>

            <RGFooter />
        </div>
    );
}
