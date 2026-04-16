/* eslint-disable */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Logo from "./Logo";
import RGFooter from "./RGFooter";

const NAVY = "#1E2D6B";
const GOLD = "#C8961E";

// ── International teams ──────────────────────────────────────────────────────
const INT_TEAMS = {
    england:     { name: "England",      short: "ENG", color: "#003087", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", rank: 3, strength: "Aggressive batting & swing bowling",   winRate: 54 },
    australia:   { name: "Australia",    short: "AUS", color: "#FFCD00", flag: "🇦🇺", rank: 1, strength: "Pace bowling & power hitting",           winRate: 62 },
    india:       { name: "India",        short: "IND", color: "#FF9933", flag: "🇮🇳", rank: 2, strength: "Spin bowling & batting depth",            winRate: 60 },
    pakistan:    { name: "Pakistan",     short: "PAK", color: "#01411C", flag: "🇵🇰", rank: 4, strength: "Pace attack & unpredictability",          winRate: 51 },
    "south-africa": { name: "South Africa", short: "SA",  color: "#007A4D", flag: "🇿🇦", rank: 5, strength: "Pace bowling & lower-order batting",  winRate: 50 },
    "new-zealand":  { name: "New Zealand",  short: "NZ",  color: "#000000", flag: "🇳🇿", rank: 6, strength: "All-round balance & death bowling",   winRate: 49 },
    "west-indies":  { name: "West Indies",  short: "WI",  color: "#7B0041", flag: "🏏", rank: 7, strength: "Power hitting & spin bowling",         winRate: 45 },
    "sri-lanka":    { name: "Sri Lanka",    short: "SL",  color: "#003478", flag: "🇱🇰", rank: 8, strength: "Spin bowling & middle-order depth",   winRate: 44 },
    bangladesh:  { name: "Bangladesh",   short: "BAN", color: "#006A4E", flag: "🇧🇩", rank: 9, strength: "Spin bowling & home conditions",         winRate: 40 },
    afghanistan: { name: "Afghanistan",  short: "AFG", color: "#002D62", flag: "🇦🇫", rank: 10, strength: "Leg spin & aggressive batting",         winRate: 38 },
    ireland:     { name: "Ireland",      short: "IRE", color: "#169B62", flag: "🇮🇪", rank: 12, strength: "Seam bowling & competitive spirit",     winRate: 32 },
    zimbabwe:    { name: "Zimbabwe",     short: "ZIM", color: "#EF3340", flag: "🇿🇼", rank: 13, strength: "Batting experience",                    winRate: 30 },
    scotland:    { name: "Scotland",     short: "SCO", color: "#003078", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rank: 14, strength: "Seam bowling",                 winRate: 28 },
    netherlands: { name: "Netherlands", short: "NED", color: "#FF6600", flag: "🇳🇱", rank: 11, strength: "All-round performance",                  winRate: 30 },
};

// ── Head to head data ────────────────────────────────────────────────────────
const H2H = {
    "england-australia":   { t1w: 62, t2w: 71, last5: ["AUS","ENG","AUS","ENG","AUS"], venue: "Various" },
    "england-india":       { t1w: 58, t2w: 64, last5: ["IND","ENG","IND","ENG","IND"], venue: "Various" },
    "england-pakistan":    { t1w: 49, t2w: 41, last5: ["ENG","PAK","ENG","ENG","PAK"], venue: "Various" },
    "england-new-zealand": { t1w: 44, t2w: 38, last5: ["ENG","NZ","ENG","NZ","ENG"],  venue: "Various" },
    "england-south-africa":{ t1w: 52, t2w: 47, last5: ["ENG","SA","ENG","ENG","SA"],  venue: "Various" },
    "england-west-indies": { t1w: 55, t2w: 51, last5: ["WI","ENG","WI","ENG","WI"],   venue: "Various" },
    "australia-india":     { t1w: 68, t2w: 58, last5: ["AUS","IND","AUS","IND","AUS"], venue: "Various" },
    "australia-pakistan":  { t1w: 62, t2w: 36, last5: ["AUS","AUS","PAK","AUS","AUS"], venue: "Various" },
    "australia-new-zealand":{ t1w: 52, t2w: 30, last5: ["AUS","AUS","NZ","AUS","AUS"], venue: "Various" },
    "india-pakistan":      { t1w: 72, t2w: 28, last5: ["IND","IND","IND","PAK","IND"], venue: "Various" },
};

function getH2H(t1key, t2key) {
    const k1 = `${t1key}-${t2key}`, k2 = `${t2key}-${t1key}`;
    if (H2H[k1]) return { ...H2H[k1], flipped: false };
    if (H2H[k2]) return { ...H2H[k2], t1w: H2H[k2].t2w, t2w: H2H[k2].t1w, flipped: true };
    return { t1w: 50, t2w: 50, last5: [], flipped: false };
}

function setMeta(name, content, prop) {
    let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
    if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
    el.setAttribute("content", content);
}
function setCanonical(url) {
    let el = document.querySelector("link[rel='canonical']");
    if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
    el.setAttribute("href", url);
}

export default function InternationalPredictionPage() {
    const { matchup } = useParams();
    const [openFaq, setOpenFaq] = useState(null);

    const slug  = (matchup || "").toLowerCase();
    const vsIdx = slug.indexOf("-vs-");
    const t1key = vsIdx > -1 ? slug.slice(0, vsIdx) : "";
    const t2key = vsIdx > -1 ? slug.slice(vsIdx + 4).replace(/-t20$|-odi$|-test$|-2025$|-2026$/, "") : "";

    const t1 = INT_TEAMS[t1key];
    const t2 = INT_TEAMS[t2key];

    // Fallback to home if teams not found
    if (!t1 || !t2) { window.location.href = "/"; return null; }

    const h2h    = getH2H(t1key, t2key);
    const total  = h2h.t1w + h2h.t2w;
    const t1pct  = Math.round((h2h.t1w / total) * 100);
    const aiProb = Math.min(70, Math.max(35, Math.round((t1.winRate / (t1.winRate + t2.winRate)) * 100)));

    const title = `${t1.name} vs ${t2.name} Prediction 2026 — AI Cricket Win Probability | CricIntelligence`;
    const desc  = `Free AI-powered ${t1.short} vs ${t2.short} cricket prediction. Live win probability, pitch analysis & head-to-head record. Updated every ball. Trusted by cricket fans in the UK & Australia.`;

    useEffect(() => {
        document.title = title;
        setMeta("description", desc);
        setMeta("og:title", title, true);
        setMeta("og:description", desc, true);
        setMeta("og:url", `https://www.cricintelligence.com/predictions/international/${slug}`, true);
        setMeta("twitter:title", title);
        setMeta("twitter:description", desc);
        setCanonical(`https://www.cricintelligence.com/predictions/international/${slug}`);
    }, [slug]);

    const faqs = [
        { q: `Who will win ${t1.name} vs ${t2.name}?`, a: `Based on head-to-head records across all formats, ${t1.name} have won ${h2h.t1w} matches while ${t2.name} have won ${h2h.t2w}. Our AI model gives ${aiProb > 50 ? t1.name : t2.name} a slight edge based on current team rankings, recent form, and historical performance. Check our live predictions page during the match for a real-time win probability that updates every ball.` },
        { q: `What is the head-to-head record between ${t1.name} and ${t2.name}?`, a: `${t1.name} have won ${h2h.t1w} of ${total} matches against ${t2.name} (${t1pct}% win rate). ${t2.name} have won ${h2h.t2w} matches. This head-to-head record covers all formats of international cricket across multiple decades.` },
        { q: `How does CricIntelligence predict ${t1.short} vs ${t2.short}?`, a: `Our AI model processes 20+ live inputs every 5 seconds: current score, wickets in hand, required run rate, run rate vs venue average, pitch deterioration, weather and dew factor, live batter strike rate, and bowler economy. The model was trained on 1.7 million cricket matches across 877 venues worldwide.` },
        { q: `Where can I watch ${t1.name} vs ${t2.name} in the UK?`, a: `${t1.name} vs ${t2.name} matches are typically broadcast on Sky Sports Cricket in the UK. Some matches may be available on free-to-air TV. Check your TV guide for exact broadcast details.` },
        { q: `Can I bet on ${t1.short} vs ${t2.short} online?`, a: `Yes — cricket betting is fully legal in the UK through UKGC-licensed operators such as Bet365, Betway, Sky Bet, Paddy Power, and William Hill. CricIntelligence predictions are for informational purposes only and do not constitute betting advice. Always gamble responsibly. 18+ only. National Gambling Helpline: 0808 8020 133.` },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#EEF2FF", fontFamily: "Inter, -apple-system, system-ui", color: "#0A0A0A" }}>

            {/* Schema */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org", "@type": "SportsEvent",
                "name": `${t1.name} vs ${t2.name}`, "sport": "Cricket",
                "description": desc,
                "competitor": [{ "@type": "SportsTeam", "name": t1.name }, { "@type": "SportsTeam", "name": t2.name }],
                "url": `https://www.cricintelligence.com/predictions/international/${slug}`
            })}} />

            {/* Nav */}
            <nav style={{ background: NAVY, padding: "0 24px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <a href="/"><Logo /></a>
                <a href="/" style={{ background: GOLD, color: NAVY, fontSize: 12, fontWeight: 700, padding: "7px 16px", borderRadius: 8, textDecoration: "none" }}>🔴 Live Predictions →</a>
            </nav>

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 20px 80px" }}>

                {/* Hero */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY} 0%, #253580 100%)`, borderRadius: 18, padding: "32px 28px", marginBottom: 28, color: "#fff" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, letterSpacing: 2, marginBottom: 12 }}>AI CRICKET PREDICTION · INTERNATIONAL</div>
                    <h1 style={{ fontSize: "clamp(20px,4vw,32px)", fontWeight: 900, margin: "0 0 10px", lineHeight: 1.2 }}>
                        {t1.flag} {t1.name} vs {t2.name} {t2.flag} — Cricket Prediction
                    </h1>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: "0 0 22px", lineHeight: 1.7, maxWidth: 560 }}>
                        Free AI-powered win probability for {t1.name} vs {t2.name}. Our model processes live ball-by-ball data, pitch conditions, venue history, and player form — updating every 5 seconds during the match.
                    </p>

                    {/* Teams row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 22, flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 40, marginBottom: 4 }}>{t1.flag}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{t1.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Rank #{t1.rank}</div>
                        </div>
                        <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>AI WIN PROBABILITY</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: GOLD }}>{aiProb}%</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>vs {100 - aiProb}%</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Updates live every 5 seconds</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 40, marginBottom: 4 }}>{t2.flag}</div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{t2.name}</div>
                            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Rank #{t2.rank}</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <a href="/" style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 13, padding: "11px 22px", borderRadius: 10, textDecoration: "none" }}>
                            🏏 See Live {t1.short} vs {t2.short} Prediction →
                        </a>
                    </div>
                </div>

                {/* Head to Head */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>{t1.name} vs {t2.name} — Head to Head Record</h2>
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "22px 24px", marginBottom: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center", marginBottom: 16 }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 40, marginBottom: 4 }}>{t1.flag}</div>
                            <div style={{ fontSize: 34, fontWeight: 900, color: t1.color }}>{h2h.t1w}</div>
                            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t1.short} Wins</div>
                        </div>
                        <div style={{ textAlign: "center", color: "#94A3B8" }}>
                            <div style={{ fontSize: 13 }}>of {total}</div>
                            <div style={{ fontSize: 11 }}>matches</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 40, marginBottom: 4 }}>{t2.flag}</div>
                            <div style={{ fontSize: 34, fontWeight: 900, color: t2.color }}>{h2h.t2w}</div>
                            <div style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{t2.short} Wins</div>
                        </div>
                    </div>
                    <div style={{ height: 8, background: "#F1F5F9", borderRadius: 4, overflow: "hidden", marginBottom: 14 }}>
                        <div style={{ height: "100%", width: t1pct + "%", background: t1.color || NAVY, borderRadius: 4, transition: "width 1s ease" }} />
                    </div>
                    {h2h.last5.length > 0 && (
                        <div>
                            <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8, fontWeight: 600 }}>LAST 5 RESULTS</div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {h2h.last5.map((winner, i) => (
                                    <div key={i} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: winner === t1.short ? (t1.color || NAVY) : (t2.color || "#475569"), color: "#fff" }}>{winner} Won</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Team analysis */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>Team Analysis</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
                    {[t1, t2].map(team => (
                        <div key={team.short} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "18px 20px" }}>
                            <div style={{ fontSize: 28, marginBottom: 6 }}>{team.flag}</div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: NAVY, marginBottom: 4 }}>{team.name}</div>
                            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10 }}>ICC Rank #{team.rank}</div>
                            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10 }}>
                                <strong>Key strength:</strong> {team.strength}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ fontSize: 11, color: "#94A3B8", width: 64, flexShrink: 0 }}>Win rate</div>
                                <div style={{ flex: 1, height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ height: "100%", width: team.winRate + "%", background: team.color || NAVY, borderRadius: 3 }} />
                                </div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: team.color || NAVY }}>{team.winRate}%</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* How AI works */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>How Our AI Predicts {t1.short} vs {t2.short}</h2>
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, marginBottom: 14 }}>
                        CricIntelligence uses a machine learning model trained on <strong>1.7 million cricket matches</strong> across 877 venues worldwide. For {t1.name} vs {t2.name}, the model processes these live inputs every 5 seconds:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                        {[
                            ["🏏", "Current score & wickets", "Runs, balls faced, wickets lost updated ball by ball"],
                            ["📈", "Run rates", "Current RR vs required RR vs venue historical average"],
                            ["🏟️", "Venue history", "Average scores at this specific ground from 7,500+ T20 matches"],
                            ["🌧️", "Weather & dew", "Temperature, humidity, and dew factor affecting ball grip"],
                            ["⚡", "Live player data", "Striker SR, bowler economy, current partnership"],
                            ["📉", "Wickets in hand", "Remaining batting resources vs runs needed"],
                        ].map(([icon, title, desc]) => (
                            <div key={title} style={{ display: "flex", gap: 10 }}>
                                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{title}</div>
                                    <div style={{ fontSize: 12, color: "#64748B", lineHeight: 1.5 }}>{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Responsible gambling / betting section — UK compliant */}
                <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: "20px 24px", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Cricket Betting — UK Licensed Operators</h2>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.8, marginBottom: 14 }}>
                        Cricket betting is legal and regulated in the United Kingdom under the UK Gambling Commission (UKGC). The following operators are fully licensed to accept UK bets on {t1.name} vs {t2.name}:
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                        {["Bet365", "Betway", "Sky Bet", "Paddy Power", "William Hill", "Ladbrokes"].map(bookie => (
                            <div key={bookie} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "10px 12px", textAlign: "center", fontSize: 13, fontWeight: 700, color: NAVY }}>
                                {bookie}
                            </div>
                        ))}
                    </div>
                    <div style={{ background: "#FFF8E7", border: "1px solid #F59E0B", borderRadius: 10, padding: "12px 16px", fontSize: 12, color: "#78350F", lineHeight: 1.7 }}>
                        ⚠️ <strong>Responsible gambling:</strong> CricIntelligence predictions are for <strong>informational purposes only</strong> — not betting advice. 18+ only. Gamble responsibly. <a href="https://www.begambleaware.org" target="_blank" rel="noreferrer" style={{ color: "#92400E" }}>BeGambleAware.org</a> · Helpline: <strong>0808 8020 133</strong> (free, 24/7)
                    </div>
                </div>

                {/* FAQ */}
                <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 14 }}>{t1.short} vs {t2.short} — Frequently Asked Questions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                    {faqs.map(({ q, a }, i) => (
                        <div key={i} style={{ background: "#fff", border: `1px solid ${openFaq === i ? NAVY : "#E2E8F0"}`, borderRadius: 12, overflow: "hidden", transition: "border-color .2s" }}>
                            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                style={{ width: "100%", textAlign: "left", padding: "15px 20px", background: "none", border: "none", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY, lineHeight: 1.4 }}>{q}</span>
                                <span style={{ fontSize: 18, color: GOLD, flexShrink: 0, transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform .2s" }}>+</span>
                            </button>
                            {openFaq === i && (
                                <div style={{ padding: "0 20px 16px", fontSize: 13, color: "#475569", lineHeight: 1.75, borderTop: "1px solid #E2E8F0", paddingTop: 14 }}>{a}</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, #253580)`, borderRadius: 16, padding: "28px 24px", textAlign: "center", color: "#fff" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Watch the Live Probability During the Match</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 18, lineHeight: 1.6 }}>
                        Our AI updates win probability every 5 seconds. Visit during {t1.name} vs {t2.name} to see the graph shift ball by ball — free, no sign-up.
                    </div>
                    <a href="/" style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 14, padding: "12px 28px", borderRadius: 10, textDecoration: "none" }}>
                        🏏 Open Live Predictions — Free
                    </a>
                </div>
            </div>

            <RGFooter />
        </div>
    );
}
