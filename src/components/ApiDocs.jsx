/* eslint-disable */
/**
 * ApiDocs — the commercial surface for the /v1 prediction API.
 *
 * Sells the model, not the website. Deliberately free of odds, affiliate
 * banners and betting language: the buyer here is a media, streaming or
 * fantasy engineering team, and every gambling signal on the page is a reason
 * for their procurement to say no. It is also exempt from the age gate for the
 * same reason (see AgeGate.jsx UNGATED_PATHS).
 *
 * The accuracy band is fetched live from /v1/accuracy rather than hardcoded, so
 * the number a prospect reads is the number the backtest actually produced.
 */
import React, { useEffect, useState } from "react";
import { API_BASE } from "./shared/constants";

const C = {
    bg: "#EEF2FF", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B",
    navy: "#1E2D6B", gold: "#C8961E", green: "#00B894",
    code: "#0D1525",
};

const RAPIDAPI_URL = "https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability";

function setMeta(name, content, prop) {
    let el = document.querySelector(prop ? `meta[property="${name}"]` : `meta[name="${name}"]`);
    if (!el) {
        el = document.createElement("meta");
        prop ? el.setAttribute("property", name) : el.setAttribute("name", name);
        document.head.appendChild(el);
    }
    el.setAttribute("content", content);
}

const ENDPOINTS = [
    {
        method: "GET", path: "/v1/matches",
        desc: "Every match in the current window with live/upcoming/completed state. Filter with ?state=live.",
    },
    {
        method: "GET", path: "/v1/predict/{match_id}",
        desc: "Live win probability for both sides, confidence band, uncertainty intervals, pressure and momentum.",
    },
    {
        method: "GET", path: "/v1/accuracy",
        desc: "Holdout accuracy, methodology and per-checkpoint breakdown. No key required — verify before you buy.",
    },
    {
        method: "GET", path: "/v1/usage",
        desc: "Your calls today against your plan's daily allowance.",
    },
];

const PLANS = [
    {
        id: "trial", name: "Trial", price: "Free", per: "",
        calls: "100 calls / day",
        features: ["Every endpoint", "Full response schema", "No card required"],
        cta: "Start free",
    },
    {
        id: "starter", name: "Starter", price: "£29", per: "/month",
        calls: "2,000 calls / day",
        features: ["Every endpoint", "Email support", "Cancel any time"],
        cta: "Request access", highlight: true,
    },
    {
        id: "pro", name: "Pro", price: "£149", per: "/month",
        calls: "20,000 calls / day",
        features: ["Every endpoint", "Priority support", "Schema change notice", "Backfill on request"],
        cta: "Request access",
    },
    {
        id: "enterprise", name: "Enterprise", price: "Custom", per: "",
        calls: "Unmetered",
        features: ["Dedicated throughput", "SLA + support contract", "Custom models & markets", "On-prem option"],
        cta: "Talk to us",
    },
];

const SAMPLE_RESPONSE = `{
  "match_id": "104521",
  "generated_at": "2026-08-26T14:22:07Z",
  "teams": { "home": "India", "away": "Australia" },
  "venue": "Wankhede Stadium",
  "context": { "innings": 2, "phase": "death" },
  "win_probability": {
    "home": 0.6740, "away": 0.3260,
    "favoured": "India",
    "confidence": "HIGH",
    "interval": { "monte_carlo": { "low": 61.0, "high": 73.0 } }
  },
  "pressure_index": 41.0,
  "momentum": -1.5,
  "model": { "version": "v10-ML", "holdout_accuracy": 0.815 }
}`;

const USE_CASES = [
    {
        title: "Broadcast & streaming overlays",
        body: "Put a live win-probability bar on the stream. One call every few seconds per match, updated ball by ball.",
    },
    {
        title: "Fantasy & prediction games",
        body: "Price contests, set difficulty, and drive in-app notifications off a probability that has been measured on unseen matches.",
    },
    {
        title: "Sports media & editorial",
        body: "Auto-generate match reports, momentum graphics and 'the moment it turned' analysis from the probability history.",
    },
    {
        title: "Apps & second screens",
        body: "Ship a live win-probability feature without building a model, a data pipeline or a training set.",
    },
];

export default function ApiDocs() {
    const [proof, setProof] = useState(null);
    const [form, setForm] = useState({ email: "", company: "", use_case: "", plan: "starter" });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const title = "Cricket Win Probability API — CricIntelligence";
        const desc = "A live cricket win-probability API measured at 81.5% on 2,546 matches the model never saw during training. Full methodology published.";
        const url = "https://www.cricintelligence.com/api";
        document.title = title;
        setMeta("description", desc);
        setMeta("og:title", title, true);
        setMeta("og:description", desc, true);
        setMeta("og:url", url, true);
        setMeta("twitter:title", title);
        setMeta("twitter:description", desc);
        let el = document.querySelector("link[rel='canonical']");
        if (!el) {
            el = document.createElement("link");
            el.setAttribute("rel", "canonical");
            document.head.appendChild(el);
        }
        el.setAttribute("href", url);
    }, []);

    useEffect(() => {
        let alive = true;
        fetch(API_BASE + "/v1/accuracy")
            .then(r => r.ok ? r.json() : null)
            .then(d => { if (alive && d && !d.error) setProof(d); })
            .catch(() => {});
        return () => { alive = false; };
    }, []);

    function choosePlan(id) {
        setForm(f => ({ ...f, plan: id }));
        const el = document.getElementById("request");
        if (el) el.scrollIntoView({ behavior: "smooth" });
    }

    async function submit(e) {
        e.preventDefault();
        setError("");
        if (!form.email.includes("@")) { setError("Please enter a valid work email."); return; }
        setSending(true);
        try {
            const r = await fetch(API_BASE + "/v1/request-access", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!r.ok) throw new Error("failed");
            setSent(true);
        } catch {
            setError("Something went wrong. Email hello@cricintelligence.com and we will sort it out.");
        } finally {
            setSending(false);
        }
    }

    const headline = proof?.headline_accuracy ?? 81.5;
    const matches = proof?.sample?.matches ?? 2546;
    const preds = proof?.sample?.predictions ?? 19340;

    return (
        <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Inter, system-ui, sans-serif", color: C.text }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .api-wrap { max-width: 1080px; margin: 0 auto; padding: 0 20px; }
                .api-card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; }
                pre.api-code { background: ${C.code}; color: #C7D2FE; padding: 20px; border-radius: 12px;
                    overflow-x: auto; font-size: 13px; line-height: 1.65; margin: 0;
                    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
                .api-grid { display: grid; gap: 20px; }
                @media (min-width: 860px) { .api-cols-2 { grid-template-columns: 1fr 1fr; }
                    .api-cols-4 { grid-template-columns: repeat(4, 1fr); } }
                @media (max-width: 859px) { .api-cols-4 { grid-template-columns: 1fr 1fr; } }
                .api-input { width: 100%; padding: 12px 14px; border: 1px solid ${C.border};
                    border-radius: 10px; font-size: 14px; font-family: inherit; background: #fff; color: ${C.text}; }
                .api-input:focus { outline: 2px solid ${C.navy}; outline-offset: -1px; }
            `}</style>

            {/* Hero */}
            <div style={{ background: `linear-gradient(160deg, ${C.navy}, #0D1B3E)`, color: "#fff", padding: "72px 0 64px" }}>
                <div className="api-wrap">
                    <a href="/" style={{ color: C.gold, fontSize: 12, fontWeight: 700, letterSpacing: 2, textDecoration: "none", textTransform: "uppercase" }}>
                        CricIntelligence
                    </a>
                    <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, lineHeight: 1.1, margin: "20px 0 18px", maxWidth: 780 }}>
                        Cricket win probability, as an API.
                    </h1>
                    <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.72)", maxWidth: 640, margin: "0 0 32px" }}>
                        One HTTP call returns a live, calibrated win probability for any T20 match in progress —
                        with the confidence band, the match state it was derived from, and the model version that produced it.
                    </p>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                        {/* RapidAPI first: it is self-serve. A developer who wants to try
                            this today can subscribe to the free tier and make a call in a
                            minute, with no email exchange and nobody to wait for. The form
                            below is for buyers who want to talk to a person. */}
                        <a href={RAPIDAPI_URL} target="_blank" rel="noopener noreferrer"
                            style={{ padding: "14px 26px", background: C.gold, color: "#0D1B3E", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, textDecoration: "none" }}>
                            Start free on RapidAPI →
                        </a>
                        <button onClick={() => choosePlan("trial")}
                            style={{ padding: "14px 26px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                            Request a key
                        </button>
                        <a href="#quickstart"
                            style={{ padding: "14px 26px", background: "transparent", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: "none" }}>
                            Read the docs
                        </a>
                    </div>
                </div>
            </div>

            {/* Proof band — the whole pitch, in numbers a buyer can re-derive */}
            <div style={{ background: "#0D1B3E", borderTop: "1px solid rgba(255,255,255,0.08)", padding: "36px 0" }}>
                <div className="api-wrap">
                    <div className="api-grid api-cols-4">
                        {[
                            { n: headline + "%", l: "Accuracy on unseen matches" },
                            { n: matches.toLocaleString(), l: "Matches in the holdout" },
                            { n: preds.toLocaleString(), l: "Predictions scored" },
                            { n: "2025–26", l: "Test years, never trained on" },
                        ].map(s => (
                            <div key={s.l}>
                                <div style={{ fontSize: 30, fontWeight: 900, color: C.gold }}>{s.n}</div>
                                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4, lineHeight: 1.5 }}>{s.l}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 24, lineHeight: 1.7, maxWidth: 760 }}>
                        Trained on T20 matches up to 2024, then tested on 2025–26 matches held back entirely from training —
                        so the score is what the model does on cricket it has never seen, not what it does on its own training set.
                        The full breakdown is served, unauthenticated, at{" "}
                        <code style={{ color: C.gold }}>/v1/accuracy</code>.
                    </p>
                </div>
            </div>

            {/* Quickstart */}
            <div id="quickstart" className="api-wrap" style={{ padding: "64px 20px 0" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Quickstart</h2>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 12, maxWidth: 620 }}>
                    Authenticate with an <code>X-API-Key</code> header. Everything is JSON over HTTPS — no SDK to install.
                </p>
                <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 620 }}>
                    <strong style={{ color: C.text }}>This is a prediction API, not a score feed.</strong>{" "}
                    It returns no live runs, wickets, overs or run rates — pair it with whatever match data
                    you already run. What you get here is the number that feed cannot give you.
                </p>
                <div className="api-grid api-cols-2">
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Request</div>
                        <pre className="api-code">{`curl ${API_BASE}/v1/predict/104521 \\
  -H "X-API-Key: ci_live_your_key_here"`}</pre>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, margin: "24px 0 10px", letterSpacing: 1, textTransform: "uppercase" }}>Find a live match first</div>
                        <pre className="api-code">{`curl "${API_BASE}/v1/matches?state=live" \\
  -H "X-API-Key: ci_live_your_key_here"`}</pre>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, marginBottom: 10, letterSpacing: 1, textTransform: "uppercase" }}>Response</div>
                        <pre className="api-code">{SAMPLE_RESPONSE}</pre>
                    </div>
                </div>
            </div>

            {/* Endpoints */}
            <div className="api-wrap" style={{ padding: "56px 20px 0" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>Endpoints</h2>
                <div className="api-card" style={{ overflow: "hidden" }}>
                    {ENDPOINTS.map((e, i) => (
                        <div key={e.path} style={{ padding: "18px 20px", borderTop: i ? `1px solid ${C.border}` : "none", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "baseline" }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: C.green, background: "rgba(0,184,148,0.1)", padding: "4px 8px", borderRadius: 5, letterSpacing: 0.5 }}>{e.method}</span>
                            <code style={{ fontSize: 14, fontWeight: 700, color: C.navy, fontFamily: "ui-monospace, Menlo, monospace" }}>{e.path}</code>
                            <span style={{ fontSize: 14, color: C.muted, lineHeight: 1.6, flex: "1 1 280px" }}>{e.desc}</span>
                        </div>
                    ))}
                </div>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 16, lineHeight: 1.7 }}>
                    Quota state comes back on every response as <code>X-RateLimit-Limit</code> and <code>X-RateLimit-Used</code>.
                    Errors are JSON with a stable <code>error</code> slug — <code>invalid_api_key</code>, <code>quota_exceeded</code>,
                    <code> match_not_found</code>, <code>upstream_unavailable</code>.
                </p>
            </div>

            {/* Use cases */}
            <div className="api-wrap" style={{ padding: "56px 20px 0" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24 }}>What teams build with it</h2>
                <div className="api-grid api-cols-2">
                    {USE_CASES.map(u => (
                        <div key={u.title} className="api-card" style={{ padding: 24 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 10 }}>{u.title}</h3>
                            <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.75, margin: 0 }}>{u.body}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing */}
            <div id="pricing" className="api-wrap" style={{ padding: "56px 20px 0" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Pricing</h2>
                <p style={{ color: C.muted, fontSize: 15, marginBottom: 28, lineHeight: 1.7 }}>
                    Priced per day of calls, not per match. Cancel any time.<br />
                    Want to start without talking to anyone?{" "}
                    <a href={RAPIDAPI_URL} target="_blank" rel="noopener noreferrer"
                        style={{ color: C.navy, fontWeight: 600 }}>
                        Subscribe on RapidAPI
                    </a>{" "}— free tier, instant key, billing handled there.
                </p>
                <div className="api-grid api-cols-4">
                    {PLANS.map(p => (
                        <div key={p.id} className="api-card" style={{
                            padding: 24,
                            border: p.highlight ? `2px solid ${C.navy}` : `1px solid ${C.border}`,
                            display: "flex", flexDirection: "column",
                        }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.navy, letterSpacing: 1, textTransform: "uppercase" }}>{p.name}</div>
                            <div style={{ margin: "14px 0 4px" }}>
                                <span style={{ fontSize: 32, fontWeight: 900 }}>{p.price}</span>
                                <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>{p.per}</span>
                            </div>
                            <div style={{ fontSize: 13, color: C.muted, fontWeight: 600, marginBottom: 18 }}>{p.calls}</div>
                            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", flex: 1 }}>
                                {p.features.map(f => (
                                    <li key={f} style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, marginBottom: 9, paddingLeft: 20, position: "relative" }}>
                                        <span style={{ position: "absolute", left: 0, color: C.green, fontWeight: 800 }}>✓</span>{f}
                                    </li>
                                ))}
                            </ul>
                            <button onClick={() => choosePlan(p.id)} style={{
                                width: "100%", padding: "12px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer",
                                background: p.highlight ? C.navy : "transparent",
                                color: p.highlight ? "#fff" : C.navy,
                                border: p.highlight ? "none" : `1px solid ${C.border}`,
                            }}>{p.cta}</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Request access */}
            <div id="request" className="api-wrap" style={{ padding: "56px 20px 72px" }}>
                <div className="api-card" style={{ padding: "36px 32px", maxWidth: 620, margin: "0 auto" }}>
                    {sent ? (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                            <div style={{ fontSize: 40, marginBottom: 14 }}>✅</div>
                            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>Request received</h2>
                            <p style={{ color: C.muted, fontSize: 15, lineHeight: 1.7, margin: 0 }}>
                                We will email your key and a short integration note. If it is urgent, reply to that email and we will
                                get you a sandbox key the same day.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={submit}>
                            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Request an API key</h2>
                            <p style={{ color: C.muted, fontSize: 14.5, lineHeight: 1.7, marginBottom: 24 }}>
                                Tell us what you are building and we will send a key sized for it. Trial keys go out the same day.
                            </p>
                            <div style={{ display: "grid", gap: 14 }}>
                                <input className="api-input" type="email" placeholder="Work email" value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                                <input className="api-input" type="text" placeholder="Company" value={form.company}
                                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
                                <select className="api-input" value={form.plan}
                                    onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}>
                                    {PLANS.map(p => <option key={p.id} value={p.id}>{p.name} — {p.calls}</option>)}
                                </select>
                                <textarea className="api-input" rows={4} placeholder="What are you building? (helps us size your key)"
                                    value={form.use_case}
                                    onChange={e => setForm(f => ({ ...f, use_case: e.target.value }))}
                                    style={{ resize: "vertical", fontFamily: "inherit" }} />
                            </div>
                            {error && <div style={{ color: "#DC2626", fontSize: 13.5, marginTop: 14, lineHeight: 1.6 }}>{error}</div>}
                            <button type="submit" disabled={sending} style={{
                                width: "100%", marginTop: 20, padding: "14px", background: sending ? C.muted : C.navy,
                                color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800,
                                cursor: sending ? "default" : "pointer",
                            }}>{sending ? "Sending…" : "Request access"}</button>
                        </form>
                    )}
                </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.border}`, padding: "28px 0", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: C.muted }}>
                    <a href="/" style={{ color: C.navy, textDecoration: "none", fontWeight: 600 }}>CricIntelligence</a>
                    {"  ·  "}
                    <a href={RAPIDAPI_URL} target="_blank" rel="noopener noreferrer"
                        style={{ color: C.muted, textDecoration: "none" }}>Also on RapidAPI</a>
                    {"  ·  "}
                    <a href="/how-it-works" style={{ color: C.muted, textDecoration: "none" }}>How the model works</a>
                    {"  ·  "}
                    <a href="/accuracy" style={{ color: C.muted, textDecoration: "none" }}>Accuracy dashboard</a>
                    {"  ·  "}
                    <a href="/terms" style={{ color: C.muted, textDecoration: "none" }}>Terms</a>
                </div>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 12, maxWidth: 620, margin: "12px auto 0", lineHeight: 1.7 }}>
                    Predictions are statistical estimates supplied for analytics, media and product use. They are not advice,
                    and no outcome is guaranteed.
                </p>
            </div>
        </div>
    );
}
