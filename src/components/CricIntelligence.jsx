import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "https://cricintel-backend-production.up.railway.app";
const STRIPE_PK = "pk_test_51T7nucBCZG94uH6ZX1dEhm8Ee8FWFEgFi6OlrzUEMtMVp5vzQOQ67NdmdoPGzLaJyrAQaAfssLE2BXoUB24Cqna200AKM4scTU";
const CRIC_KEY = "3ea4f87d-7450-48af-8839-9dee74b28087";

const C = {
    bg: "#F4F6FA", surface: "#FFFFFF", border: "#E2E8F0",
    text: "#0A0A0A", muted: "#64748B", accent: "#006AFF",
    green: "#00B894", red: "#E53E3E", amber: "#F59E0B", gold: "#C8961E",
    navy: "#0A1628", navyMid: "#132240", navyLight: "#1E3A5F",
};

const MOCK_MATCHES = [
    { id: 1, t1: "INDIA", t2: "AUSTRALIA", status: "LIVE", day: "T20", detail: "2nd T20I · Wankhede", t1Score: 156, t2Score: null, t1Wkts: 3, matchId: null },
    { id: 2, t1: "ENGLAND", t2: "PAKISTAN", status: "UPCOMING", day: "ODI", detail: "1st ODI · Lord's", t1Score: null, t2Score: null, matchId: null },
    { id: 3, t1: "NZ", t2: "SA", status: "UPCOMING", day: "TEST", detail: "Cape Town · Day 1", t1Score: null, t2Score: null, matchId: null },
];
const MOCK_PRED = {
    team1: "India", team2: "Australia", venue: "Wankhede Stadium, Mumbai",
    score: 156, wickets: 3, overs: 14.2, matchType: "t20",
    displayScore: "156/3 (14.2 ov)", aiProbability: 72,
    currentRunRate: 10.9, requiredRunRate: 0,
    pitchLabel: "DRY / SPIN", pitchCondition: "SHOWING WEAR",
    currentPhase: "MIDDLE OVERS", phaseEmoji: "🟡",
    strengths: ["SOLID OPENING STAND", "FAST BOWLING PACE", "SPIN CONTROL"],
    weaknesses: ["VULNERABLE TO SHORT BALL", "DEATH RUN LEAKAGE", "UNSTABLE MID ORDER"],
    nextOvers: [
        { over: 15, phase: "MIDDLE OVERS", expectedRuns: 9.2, wicketProb: 22, confidence: 85, runRange: "7–11", tip: "🟡 Build platform heading into death overs. Target 10 runs minimum." },
        { over: 16, phase: "DEATH OVERS", expectedRuns: 10.8, wicketProb: 32, confidence: 77, runRange: "9–13", tip: "🔴 Death begins — high scoring expected. Yorkers key." },
        { over: 17, phase: "DEATH OVERS", expectedRuns: 11.5, wicketProb: 38, confidence: 69, runRange: "9–14", tip: "🔴 Slog overs — boundaries crucial. Spin bowlers under pressure." },
        { over: 18, phase: "DEATH OVERS", expectedRuns: 10.2, wicketProb: 42, confidence: 61, runRange: "8–13", tip: "⚠️ Wicket risk rising. Batters taking high-risk shots." },
        { over: 19, phase: "DEATH OVERS", expectedRuns: 12.0, wicketProb: 45, confidence: 53, runRange: "10–14", tip: "🔴 Final push — maximum attack. Expect big hits." },
    ],
    weather: { temp: 28, condition: "SUNNY" },
    weatherImpact: { tip: "Bright conditions favour batters.", emoji: "☀️" },
    dataSource: "877 venues · 1.7M records · 78.2% accuracy",
    overHistory: [{ over: 10, runs: 98 }, { over: 11, runs: 108 }, { over: 12, runs: 119 }, { over: 13, runs: 133 }, { over: 14, runs: 156 }],
    powerplay: { expectedScore: 58, expectedRR: 9.6, tip: "Strong powerplay — batting conditions ideal." },
    deathOvers: { expectedRR: 10.8, expectedRuns: 62, tip: "Death overs: expect 10.8 RR. Set a strong total." },
};

function cleanTeam(name) {
    if (!name) return "";
    const shorts = { "south africa": "SA", "new zealand": "NZ", "west indies": "WI", "sri lanka": "SL", "united arab emirates": "UAE" };
    const n = name.split(",")[0].trim();
    const key = n.toLowerCase();
    if (shorts[key]) return shorts[key];
    if (n.length > 12) return n.split(" ").filter(w => w.length > 1).map(w => w[0]).join("").toUpperCase();
    return n.toUpperCase();
}

const BASE_LOGO = "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/db/PICTURES/CMS";
const TEAM_LOGOS = {
    "india": BASE_LOGO + "/381800/381895.png", "australia": BASE_LOGO + "/382700/382733.png",
    "england": BASE_LOGO + "/317600/317615.png", "pakistan": BASE_LOGO + "/381800/381894.png",
    "new zealand": BASE_LOGO + "/340500/340503.png", "nz": BASE_LOGO + "/340500/340503.png",
    "south africa": BASE_LOGO + "/340400/340493.png", "sa": BASE_LOGO + "/340400/340493.png",
    "sri lanka": BASE_LOGO + "/340500/340505.png", "sl": BASE_LOGO + "/340500/340505.png",
    "west indies": BASE_LOGO + "/381800/381891.png", "wi": BASE_LOGO + "/381800/381891.png",
    "bangladesh": BASE_LOGO + "/381800/381857.png", "afghanistan": BASE_LOGO + "/381800/381893.png",
};

function TeamLogo({ name, size = 32 }) {
    const [err, setErr] = useState(false);
    const key = (name || "").toLowerCase().trim();
    const url = TEAM_LOGOS[key];
    const abbr = cleanTeam(name).slice(0, 3);
    const hue = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    if (!url || err) return (
        <div style={{ width: size, height: size, borderRadius: "50%", background: `hsl(${hue},55%,45%)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontFamily: "Inter, system-ui", fontSize: size * 0.32, fontWeight: 700, color: "#fff" }}>{abbr}</span>
        </div>
    );
    return <img src={url} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, objectFit: "contain", borderRadius: "50%", background: "#fff", padding: 2, flexShrink: 0, border: `1px solid ${C.border}` }} />;
}

function WinArc({ value }) {
    const r = 54, cx = 64, cy = 64, circ = Math.PI * r;
    const pct = Math.min(Math.max(value, 0), 100) / 100;
    const color = value >= 65 ? C.green : value >= 45 ? C.amber : C.red;
    return (
        <svg width={128} height={80} viewBox="0 0 128 80">
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={C.border} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={`${circ * pct} ${circ}`} />
            <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight={700} fill={C.text} fontFamily="Inter, system-ui">{value}%</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize={9} fill={C.muted} fontFamily="Inter, system-ui" letterSpacing={1}>WIN PROB</text>
        </svg>
    );
}

function Spark({ data }) {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d.runs);
    const min = Math.min(...vals), max = Math.max(...vals);
    const w = 160, h = 40;
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - ((v - min) / (max - min || 1)) * (h - 8) - 4]);
    return (
        <svg width={w} height={h}>
            <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={C.accent} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4} fill={C.accent} />
        </svg>
    );
}

export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("predict");
    const [showLanding, setShowLanding] = useState(() => !localStorage.getItem("ci_v2"));
    const [liveMatches, setLiveMatches] = useState(MOCK_MATCHES);
    const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0]);
    const [pred, setPred] = useState(MOCK_PRED);
    const [liveStatus, setLiveStatus] = useState("connecting");
    const [isPremium, setIsPremium] = useState(() => localStorage.getItem("cricintel_premium") === "true");
    const [showPaywall, setShowPaywall] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [emailInput, setEmailInput] = useState("");
    const [paymentStep, setPaymentStep] = useState("plans");
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [liveTime, setLiveTime] = useState(new Date());
    const [ticker, setTicker] = useState(0);
    const [activeOver, setActiveOver] = useState(0);

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const t = setInterval(() => setTicker(p => p + 1), 10000); return () => clearInterval(t); }, []);
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("premium") === "true") { setIsPremium(true); localStorage.setItem("cricintel_premium", "true"); window.history.replaceState({}, "", window.location.pathname); }
    }, []);

    const handleCheckout = async (plan) => {
        setCheckingPayment(true);
        try {
            const res = await fetch(`${API_BASE}/create-checkout-session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, email: emailInput }) });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
        } catch { } finally { setCheckingPayment(false); }
    };

    const fetchPred = useCallback(async () => {
        try { const r = await fetch(`${API_BASE}/predict`); if (r.ok) setPred(await r.json()); } catch { }
    }, []);
    useEffect(() => { fetchPred(); }, [fetchPred, ticker]);

    const fetchMatches = useCallback(async () => {
        try {
            const r = await fetch(`${API_BASE}/matches`);
            const d = await r.json();
            const list = Array.isArray(d) ? d : d.data || [];
            if (list.length) {
                const mapped = list.slice(0, 8).map((m, i) => ({
                    id: m.id || i, matchId: m.id,
                    t1: cleanTeam(m.team1 || m.teams?.[0] || "TBD"),
                    t2: cleanTeam(m.team2 || m.teams?.[1] || "TBD"),
                    status: m.status?.includes("won") ? "ENDED" : m.matchStarted && !m.matchEnded ? "LIVE" : "UPCOMING",
                    day: m.matchType?.toUpperCase() || "T20",
                    detail: m.name || "",
                    t1Score: m.score?.[0]?.r ?? null, t1Wkts: m.score?.[0]?.w ?? null,
                    t2Score: m.score?.[1]?.r ?? null,
                }));
                setLiveMatches(mapped); setLiveStatus("live");
                const live = mapped.find(m => m.status === "LIVE");
                if (live) setSelectedMatch(live);
            }
        } catch { setLiveStatus("mock"); }
    }, []);
    useEffect(() => { fetchMatches(); }, [fetchMatches]);
    useEffect(() => { const t = setInterval(fetchMatches, 5 * 60 * 1000); return () => clearInterval(t); }, [fetchMatches]);
    useEffect(() => {
        if (selectedMatch?.detail) {
            fetch(`${API_BASE}/predict?venue=${encodeURIComponent(selectedMatch.detail)}`)
                .then(r => r.ok ? r.json() : null).then(d => { if (d && !d.error) setPred(d); }).catch(() => { });
        }
    }, [selectedMatch]);

    const prob = pred.aiProbability || 72;
    const winMsg = prob >= 65 ? "Strong position" : prob >= 45 ? "Close contest" : "Under pressure";
    const winColor = prob >= 65 ? C.green : prob >= 45 ? C.amber : C.red;

    const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; }
    ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
    .fade { animation: fadeUp .4s ease forwards; }
    .card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; transition: box-shadow .2s; }
    .card:hover { box-shadow: 0 4px 24px rgba(10,22,40,0.08); }
    .match-pill { transition: all .2s; cursor: pointer; border-radius: 12px; border: 1.5px solid ${C.border}; padding: 12px 14px; background: ${C.surface}; margin-bottom: 8px; }
    .match-pill:hover { border-color: ${C.accent}60; }
    .match-pill.sel { border-color: ${C.accent}; background: #F0F7FF; }
    .tab-btn { background: none; border: none; cursor: pointer; padding: 8px 16px; border-radius: 8px; font-family: Inter, system-ui; font-size: 13px; font-weight: 500; transition: all .2s; color: rgba(255,255,255,0.55); }
    .tab-btn.on { background: rgba(255,255,255,0.15); color: #fff; }
    .over-card { border-radius: 14px; border: 1.5px solid ${C.border}; padding: 14px 10px; text-align: center; background: ${C.surface}; transition: all .2s; cursor: pointer; position: relative; overflow: hidden; }
    .over-card:hover { border-color: ${C.accent}60; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .over-card.sel { border-color: ${C.accent}; background: #F0F7FF; }
    .lock { position: absolute; inset: 0; border-radius: 14px; background: rgba(249,249,249,0.93); backdrop-filter: blur(4px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; cursor: pointer; }
    .btn-p { background: ${C.text}; color: #fff; border: none; border-radius: 10px; padding: 14px 24px; font-family: Inter, system-ui; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; width: 100%; }
    .btn-p:hover { background: #222; }
    @media (max-width: 768px) {
        .sl { display: none !important; }
        .sr { display: none !important; }
        .mg { grid-template-columns: 1fr !important; }
        .cr { grid-template-columns: 1fr !important; }
        .og { grid-template-columns: repeat(2,1fr) !important; }
        .mn { display: flex !important; }
        .mc { padding: 16px !important; padding-bottom: 80px !important; }
        .hn { font-size: 30px !important; }
    }
    .mn { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: ${C.navy}; border-top: 1px solid ${C.navyLight}; padding: 8px 0 18px; z-index: 200; }
    .mt { flex: 1; background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 0; font-family: Inter, system-ui; }
    `;

    // ── LANDING ───────────────────────────────────────────────────────────────
    if (showLanding) return (
        <div style={{ minHeight: "100vh", background: "#F9F9F9", fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>

            {/* Hero — Blue with pitch texture */}
            <div style={{ background: "#354D97", position: "relative", overflow: "hidden" }}>
                {/* Cricket pitch SVG texture */}
                <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.07, pointerEvents: "none" }} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
                    <rect x="330" y="10" width="140" height="480" fill="none" stroke="#fff" strokeWidth="1.5" />
                    <line x1="300" y1="70" x2="500" y2="70" stroke="#fff" strokeWidth="1" />
                    <line x1="300" y1="430" x2="500" y2="430" stroke="#fff" strokeWidth="1" />
                    <ellipse cx="400" cy="250" rx="380" ry="240" fill="none" stroke="#fff" strokeWidth="0.8" />
                    <line x1="385" y1="60" x2="385" y2="85" stroke="#C8961E" strokeWidth="2.5" />
                    <line x1="400" y1="60" x2="400" y2="85" stroke="#C8961E" strokeWidth="2.5" />
                    <line x1="415" y1="60" x2="415" y2="85" stroke="#C8961E" strokeWidth="2.5" />
                    <line x1="385" y1="415" x2="385" y2="440" stroke="#C8961E" strokeWidth="2.5" />
                    <line x1="400" y1="415" x2="400" y2="440" stroke="#C8961E" strokeWidth="2.5" />
                    <line x1="415" y1="415" x2="415" y2="440" stroke="#C8961E" strokeWidth="2.5" />
                </svg>

                <nav style={{ padding: "18px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
                    <div style={{ fontWeight: 700, fontSize: 17, color: "#fff", letterSpacing: -0.5 }}>CricIntelligence</div>
                    <button onClick={() => { localStorage.setItem("ci_v2", "1"); setShowLanding(false); }}
                        style={{ background: "#C8961E", color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                        Open App →
                    </button>
                </nav>

                <div style={{ maxWidth: 700, margin: "0 auto", padding: "50px 32px 60px", position: "relative" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(200,150,30,0.15)", border: "1px solid rgba(200,150,30,0.4)", borderRadius: 20, padding: "5px 14px", marginBottom: 24 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E", animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#C8961E", letterSpacing: 0.5 }}>LIVE · IPL 2025 READY</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(34px, 5.5vw, 60px)", fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 16, color: "#fff" }}>
                        Know who wins<br />
                        <span style={{ color: "#C8961E" }}>before the over ends.</span>
                    </h1>
                    <p style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 460, marginBottom: 28 }}>
                        AI predictions built on 1.7M data points across 877 venues. Over-by-over accuracy at 78.2%.
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        <input type="email" placeholder="Email for IPL alerts (optional)"
                            onChange={e => setEmailInput(e.target.value)}
                            style={{ flex: 1, minWidth: 220, padding: "12px 16px", borderRadius: 8, border: "1.5px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", outline: "none", color: "#fff", fontSize: 14, fontFamily: "Inter, system-ui" }} />
                        <button onClick={() => { if (emailInput) localStorage.setItem("cricintel_email", emailInput); localStorage.setItem("ci_v2", "1"); setShowLanding(false); }}
                            style={{ background: "#C8961E", color: "#000", border: "none", borderRadius: 8, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                            Get Free Predictions →
                        </button>
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Free · No credit card · Cancel anytime</div>
                </div>
            </div>

            {/* Stats + Preview — White */}
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px 60px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                    {[["78.2%", "Model Accuracy", false], ["1.7M", "Data Points", true], ["877", "Venues", false]].map(([v, l, accent]) => (
                        <div key={l} style={{ background: accent ? "#354D97" : "#fff", border: accent ? "none" : "1px solid #E8E8E8", borderRadius: 12, padding: "18px 14px", textAlign: "center" }}>
                            <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: -1, color: accent ? "#C8961E" : "#354D97" }}>{v}</div>
                            <div style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.6)" : "#888", marginTop: 4 }}>{l}</div>
                        </div>
                    ))}
                </div>

                <div style={{ background: "#fff", border: "1px solid #E8E8E8", borderRadius: 16, padding: 22 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#aaa", letterSpacing: 1 }}>LIVE PREVIEW</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E" }}>India winning</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0A0A0A", marginBottom: 6 }}>India vs Australia</div>
                    <div style={{ fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 14 }}>
                        Our AI gives <strong style={{ color: "#354D97" }}>India a 72% chance</strong> of winning based on current conditions and 1.7M historical matches.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        {[["Next over", "9–11 runs", "#0A0A0A"], ["Wicket risk", "Low · 22%", "#22C55E"], ["Confidence", "High · 85%", "#C8961E"]].map(([k, v, color]) => (
                            <div key={k} style={{ background: "#F4F6FA", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                                <div style={{ fontSize: 10, color: "#aaa", marginBottom: 3 }}>{k}</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    // ── MAIN APP ──────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Inter, -apple-system, system-ui", color: C.text }}>
            <style>{CSS}</style>

            {/* NAV */}
            <nav style={{ background: C.navy, borderBottom: `1px solid ${C.navyLight}`, padding: "0 20px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
                <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: -0.5, color: "#fff" }}>CricIntelligence</div>
                <div style={{ display: "flex", gap: 4 }}>
                    {[["predict", "Predictions"], ["matches", "Matches"], ["media", "Media"]].map(([k, l]) => (
                        <button key={k} className={`tab-btn ${activeTab === k ? "on" : ""}`} onClick={() => setActiveTab(k)} style={{ color: activeTab === k ? "#fff" : "rgba(255,255,255,0.55)" }}>{l}</button>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: liveStatus === "live" ? C.green : C.amber, animation: "pulse 2s infinite" }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                    </div>
                    {!isPremium && <button onClick={() => setShowPaywall(true)} style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Upgrade ⚡</button>}
                </div>
            </nav>

            {/* PREDICT */}
            {activeTab === "predict" && (
                <div className="mg fade" style={{ display: "grid", gridTemplateColumns: "260px 1fr 240px", minHeight: "calc(100vh - 54px)" }}>

                    {/* LEFT */}
                    <aside className="sl" style={{ borderRight: `1px solid ${C.border}`, padding: "18px 14px", overflowY: "auto", background: C.surface }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, letterSpacing: 1.5, marginBottom: 12, padding: "6px 10px", background: `${C.navy}10`, borderRadius: 8, display: "inline-block" }}>
                            {liveStatus === "live" ? "🟢 LIVE DATA" : "● MATCHES"}
                        </div>
                        {liveMatches.map(m => (
                            <div key={m.id} className={`match-pill ${selectedMatch.id === m.id ? "sel" : ""}`} onClick={() => setSelectedMatch(m)}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: 10, color: C.muted }}>{m.day} · {m.detail?.split("·")[0]?.trim().slice(0, 20)}</span>
                                    <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 5, background: m.status === "LIVE" ? "#FFF0F0" : C.bg, color: m.status === "LIVE" ? C.red : C.muted }}>
                                        {m.status === "LIVE" ? "● LIVE" : m.status}
                                    </span>
                                </div>
                                {[{ n: m.t1, s: m.t1Score, w: m.t1Wkts, b: true }, { n: m.t2, s: m.t2Score, b: false }].map(({ n, s, w, b }) => (
                                    <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                            <TeamLogo name={n} size={18} />
                                            <span style={{ fontSize: 12, fontWeight: b ? 600 : 400, color: b ? C.text : C.muted }}>{n}</span>
                                        </div>
                                        {s != null && <span style={{ fontSize: 12, fontWeight: b ? 700 : 400, color: b ? C.text : C.muted }}>{w != null ? `${s}/${w}` : s}</span>}
                                    </div>
                                ))}
                            </div>
                        ))}
                        <div style={{ marginTop: 16, padding: 14, background: C.bg, borderRadius: 12 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>RUNS TREND</div>
                            <Spark data={pred.overHistory || MOCK_PRED.overHistory} />
                        </div>
                    </aside>

                    {/* MAIN */}
                    <main className="mc" style={{ padding: "22px 24px", overflowY: "auto" }}>
                        {/* Hero */}
                        <div style={{ textAlign: "center", marginBottom: 24 }}>
                            <div style={{ fontSize: 11, color: C.muted, marginBottom: 10, fontWeight: 500 }}>{pred.venue || "Wankhede Stadium, Mumbai"}</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <TeamLogo name={(pred.team1 || "india").toLowerCase()} size={40} />
                                    <span className="hn" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>{cleanTeam(pred.team1 || "INDIA")}</span>
                                </div>
                                <span style={{ fontSize: 13, color: C.muted }}>vs</span>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span className="hn" style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1, color: C.muted }}>{cleanTeam(pred.team2 || "AUSTRALIA")}</span>
                                    <TeamLogo name={(pred.team2 || "australia").toLowerCase()} size={40} />
                                </div>
                            </div>
                            <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 18px" }}>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>{pred.displayScore || "156/3 (14.2 ov)"}</span>
                                <div style={{ width: 1, height: 14, background: C.border }} />
                                <span style={{ fontSize: 12, color: C.muted }}>CRR {pred.currentRunRate || 10.9}</span>
                                <button onClick={() => { const t = `🏏 ${cleanTeam(pred.team1 || "India")} vs ${cleanTeam(pred.team2 || "Australia")} — AI: ${prob}% win probability. cricintelligence.com`; navigator.clipboard?.writeText(t).then(() => alert("Copied! 🏏")); }}
                                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: C.accent, fontWeight: 600 }}>Share ↗</button>
                            </div>
                        </div>

                        {/* 2 cards */}
                        <div className="cr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 4 }}>WIN PROBABILITY</div>
                                <div style={{ fontSize: 13, fontWeight: 700, color: winColor, marginBottom: 8 }}>{winMsg}</div>
                                <div style={{ display: "flex", justifyContent: "center", margin: "4px 0 10px" }}>
                                    <WinArc value={prob} />
                                </div>
                                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                                    <strong style={{ color: C.text }}>{cleanTeam(pred.team1 || "INDIA")}</strong> has a <strong style={{ color: winColor }}>{prob}% chance</strong> of winning based on current score, pitch & 1.7M historical matches.
                                </div>
                            </div>
                            <div className="card" style={{ padding: 22 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 14 }}>MATCH INTEL</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: C.green, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>STRENGTHS</div>
                                        {(pred.strengths || MOCK_PRED.strengths).map(s => (
                                            <div key={s} style={{ fontSize: 11, marginBottom: 5, display: "flex", gap: 5 }}><span style={{ color: C.green }}>+</span>{s}</div>
                                        ))}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: C.red, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>RISKS</div>
                                        {(pred.weaknesses || MOCK_PRED.weaknesses).map(w => (
                                            <div key={w} style={{ fontSize: 11, marginBottom: 5, display: "flex", gap: 5 }}><span style={{ color: C.red }}>−</span>{w}</div>
                                        ))}
                                    </div>
                                </div>
                                {!isPremium
                                    ? <button onClick={() => setShowPaywall(true)} className="btn-p" style={{ fontSize: 12 }}>Unlock Full Analysis — £9.99/mo</button>
                                    : <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", fontSize: 12, color: C.muted }}>{pred.weatherImpact?.tip || "Bright conditions favour batters."}</div>
                                }
                            </div>
                        </div>

                        {/* Weather + Pitch */}
                        <div className="cr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                            <div className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                                <span style={{ fontSize: 32 }}>{pred.weatherImpact?.emoji || "☀️"}</span>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>WEATHER</div>
                                    <div style={{ fontSize: 20, fontWeight: 800 }}>{pred.weather?.temp || 28}°C</div>
                                    <div style={{ fontSize: 11, color: C.muted }}>{pred.weather?.condition || "SUNNY"}</div>
                                </div>
                            </div>
                            <div className="card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
                                <span style={{ fontSize: 32 }}>🏏</span>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>PITCH</div>
                                    <div style={{ fontSize: 15, fontWeight: 700 }}>{pred.pitchLabel || "DRY / SPIN"}</div>
                                    <div style={{ fontSize: 11, color: C.muted }}>{pred.pitchCondition || "SHOWING WEAR"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Over predictions */}
                        <div className="card" style={{ padding: 22, marginBottom: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1 }}>OVER-BY-OVER PREDICTIONS</div>
                                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{pred.phaseEmoji} {pred.currentPhase || "MIDDLE OVERS"}</div>
                                </div>
                                {!isPremium && <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>1 free · Upgrade for all 5</span>}
                            </div>
                            <div className="og" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                                {(pred.nextOvers || MOCK_PRED.nextOvers).map((ov, i) => {
                                    const wc = ov.wicketProb > 40 ? C.red : ov.wicketProb > 25 ? C.amber : C.green;
                                    return (
                                        <div key={i} className={`over-card ${activeOver === i ? "sel" : ""}`} onClick={() => setActiveOver(i)}>
                                            {i === 0 && <div style={{ position: "absolute", top: -1, left: -1, right: -1, height: 3, background: C.accent, borderRadius: "14px 14px 0 0" }} />}
                                            <div style={{ fontSize: 9, color: C.muted, fontWeight: 500, marginBottom: 2 }}>OVER {ov.over}</div>
                                            <div style={{ fontSize: 8, fontWeight: 700, color: ov.phase === "POWERPLAY" ? C.accent : ov.phase === "DEATH OVERS" ? C.red : C.amber, marginBottom: 8, letterSpacing: 0.3 }}>
                                                {ov.phaseEmoji} {ov.phase?.split(" ")[0]}
                                            </div>
                                            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, lineHeight: 1 }}>{ov.runRange}</div>
                                            <div style={{ fontSize: 9, color: C.muted, marginBottom: 8 }}>runs</div>
                                            <div style={{ background: `${wc}15`, borderRadius: 6, padding: "4px 4px" }}>
                                                <div style={{ fontSize: 9, fontWeight: 700, color: wc }}>{ov.wicketProb > 40 ? "⚠️ Likely" : ov.wicketProb > 25 ? "Possible" : "Safe"}</div>
                                                <div style={{ fontSize: 8, color: C.muted }}>{ov.wicketProb}% wkt</div>
                                            </div>
                                            <div style={{ fontSize: 8, color: C.muted, marginTop: 5 }}>{ov.confidence >= 80 ? "High" : ov.confidence >= 60 ? "Med" : "Low"} conf</div>
                                            {i > 0 && !isPremium && (
                                                <div className="lock" onClick={() => setShowPaywall(true)}>
                                                    <span style={{ fontSize: 18 }}>🔒</span>
                                                    <span style={{ fontSize: 10, fontWeight: 600 }}>Premium</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {(pred.nextOvers || MOCK_PRED.nextOvers)[activeOver] && (
                                <div style={{ marginTop: 12, padding: "12px 14px", background: C.bg, borderRadius: 10, fontSize: 12, color: C.text, lineHeight: 1.6 }}>
                                    {(pred.nextOvers || MOCK_PRED.nextOvers)[activeOver].tip}
                                </div>
                            )}
                        </div>

                        {/* Phase */}
                        <div className="cr" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                            <div className="card" style={{ padding: 18 }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>🔵 POWERPLAY</div>
                                <div style={{ fontSize: 22, fontWeight: 800 }}>{pred.powerplay?.expectedScore || 58} runs</div>
                                <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>{pred.powerplay?.tip || MOCK_PRED.powerplay.tip}</div>
                            </div>
                            <div className="card" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
                                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1, marginBottom: 10 }}>🔴 DEATH OVERS</div>
                                <div style={{ fontSize: 22, fontWeight: 800 }}>{pred.deathOvers?.expectedRR || 10.8} RR</div>
                                <div style={{ fontSize: 12, color: C.muted, marginTop: 4, lineHeight: 1.6 }}>{pred.deathOvers?.tip || MOCK_PRED.deathOvers.tip}</div>
                                {!isPremium && <div className="lock" onClick={() => setShowPaywall(true)}><span style={{ fontSize: 18 }}>🔒</span><span style={{ fontSize: 10, fontWeight: 600 }}>Premium</span></div>}
                            </div>
                        </div>
                    </main>

                    {/* RIGHT */}
                    <aside className="sr" style={{ borderLeft: `1px solid ${C.border}`, padding: "18px 14px", background: C.surface, display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: 1.5, marginBottom: 12 }}>AI ENGINE</div>
                            {[["Accuracy", "78.2%", 78], ["Confidence", `${prob}%`, prob], ["Records", "1.7M", 85], ["Venues", "877", 90]].map(([l, v, p]) => (
                                <div key={l} style={{ marginBottom: 12 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                        <span style={{ fontSize: 11, color: C.muted }}>{l}</span>
                                        <span style={{ fontSize: 11, fontWeight: 700 }}>{v}</span>
                                    </div>
                                    <div style={{ height: 3, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${p}%`, background: C.accent, borderRadius: 3 }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        {!isPremium && (
                            <div style={{ background: C.text, borderRadius: 14, padding: 16, color: "#fff" }}>
                                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>⚡ Unlock Premium</div>
                                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", lineHeight: 1.5, marginBottom: 12 }}>All 5 overs · Death intel · Pitch tracker · Real-time signals</div>
                                <button onClick={() => setShowPaywall(true)} style={{ width: "100%", background: C.gold, color: C.text, border: "none", borderRadius: 8, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                    From £9.99/mo
                                </button>
                            </div>
                        )}
                        <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, textAlign: "center", marginTop: "auto" }}>
                            {pred.dataSource || "877 venues · 1.7M records"}<br />
                            <span style={{ color: C.red, fontWeight: 600 }}>18+ · BeGambleAware.org</span>
                        </div>
                    </aside>
                </div>
            )}

            {/* MATCHES */}
            {activeTab === "matches" && (
                <div className="fade" style={{ maxWidth: 600, margin: "0 auto", padding: "22px 16px" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>{liveStatus === "live" ? "🟢 Live Matches" : "Matches"}</div>
                    {liveMatches.map(m => (
                        <div key={m.id} className="card" style={{ padding: 18, marginBottom: 12, cursor: "pointer" }} onClick={() => { setSelectedMatch(m); setActiveTab("predict"); }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                                <span style={{ fontSize: 11, color: C.muted }}>{m.day} · {m.detail}</span>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: m.status === "LIVE" ? "#FFF0F0" : C.bg, color: m.status === "LIVE" ? C.red : C.muted }}>
                                    {m.status === "LIVE" ? "● LIVE" : m.status}
                                </span>
                            </div>
                            {[{ n: m.t1, s: m.t1Score, w: m.t1Wkts, b: true }, { n: m.t2, s: m.t2Score, b: false }].map(({ n, s, w, b }) => (
                                <div key={n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}><TeamLogo name={n} size={28} /><span style={{ fontSize: 16, fontWeight: b ? 700 : 400, color: b ? C.text : C.muted }}>{n}</span></div>
                                    {s != null && <span style={{ fontSize: 16, fontWeight: b ? 700 : 400, color: b ? C.text : C.muted }}>{w != null ? `${s}/${w}` : s}</span>}
                                </div>
                            ))}
                            <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginTop: 4 }}>View AI Prediction →</div>
                        </div>
                    ))}
                </div>
            )}

            {/* MEDIA */}
            {activeTab === "media" && (
                <div className="fade" style={{ maxWidth: 600, margin: "0 auto", padding: "22px 16px" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 18 }}>Cricket Insights</div>
                    {[
                        { tag: "ANALYSIS", title: "IPL 2025: How AI is reshaping cricket strategy", time: "2h ago" },
                        { tag: "PITCH", title: "Wankhede pitch report: Spin-friendly surface ahead", time: "4h ago" },
                        { tag: "STATS", title: "India's batting in death overs — a deep dive", time: "6h ago" },
                        { tag: "PREVIEW", title: "T20 World Cup 2026: Early favourites and form", time: "1d ago" },
                    ].map(({ tag, title, time }) => (
                        <div key={title} className="card" style={{ padding: 16, marginBottom: 10 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: 1 }}>{tag}</span>
                                <span style={{ fontSize: 11, color: C.muted }}>{time}</span>
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.4 }}>{title}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* MOBILE NAV */}
            <nav className="mn">
                {[["📊", "Predict", "predict"], ["🏏", "Matches", "matches"], ["📺", "Media", "media"], ["⚡", "Upgrade", "up"]].map(([icon, label, key]) => (
                    <button key={key} className="mt" onClick={() => key === "up" ? setShowPaywall(true) : setActiveTab(key)}
                        style={{ opacity: activeTab === key ? 1 : 0.4 }}>
                        <span style={{ fontSize: 22 }}>{icon}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</span>
                    </button>
                ))}
            </nav>

            {/* PAYWALL */}
            {showPaywall && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end" }} onClick={() => setShowPaywall(false)}>
                    <div style={{ width: "100%", maxWidth: 500, margin: "0 auto", background: C.surface, borderRadius: "20px 20px 0 0", padding: 26 }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: "center", marginBottom: 22 }}>
                            <div style={{ fontSize: 22, marginBottom: 8 }}>⚡</div>
                            <div style={{ fontSize: 21, fontWeight: 800, marginBottom: 6 }}>Unlock Premium</div>
                            <div style={{ fontSize: 13, color: C.muted }}>All 5 over predictions · Death overs intel · Pitch tracker</div>
                        </div>
                        {paymentStep === "plans" && (
                            <>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                                    {[{ plan: "monthly", price: "£9.99", per: "/mo", label: "Monthly", sub: "Cancel anytime" }, { plan: "annual", price: "£59.99", per: "/yr", label: "Annual ★", sub: "Save 50%" }].map(p => (
                                        <div key={p.plan} onClick={() => setSelectedPlan(p.plan)}
                                            style={{ border: `2px solid ${selectedPlan === p.plan ? C.accent : C.border}`, borderRadius: 12, padding: 14, cursor: "pointer", background: selectedPlan === p.plan ? "#F0F7FF" : C.surface, textAlign: "center" }}>
                                            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{p.label}</div>
                                            <div style={{ fontSize: 22, fontWeight: 800 }}>{p.price}</div>
                                            <div style={{ fontSize: 11, color: C.muted }}>{p.per} · {p.sub}</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-p" onClick={() => setPaymentStep("email")}>Continue</button>
                            </>
                        )}
                        {paymentStep === "email" && (
                            <>
                                <input type="email" placeholder="Your email address" value={emailInput} onChange={e => setEmailInput(e.target.value)}
                                    style={{ width: "100%", padding: "13px 16px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 14, marginBottom: 10, outline: "none", fontFamily: "Inter,system-ui" }} />
                                <button className="btn-p" onClick={() => handleCheckout(selectedPlan)} disabled={checkingPayment}>
                                    {checkingPayment ? "Loading..." : `Pay ${selectedPlan === "annual" ? "£59.99/yr" : "£9.99/mo"}`}
                                </button>
                            </>
                        )}
                        <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.muted }}>18+ · Gamble responsibly · BeGambleAware.org</div>
                        <button onClick={() => { setShowPaywall(false); setPaymentStep("plans"); }} style={{ display: "block", width: "100%", background: "none", border: "none", color: C.muted, fontSize: 13, cursor: "pointer", marginTop: 8 }}>Maybe later</button>
                    </div>
                </div>
            )}
        </div>
    );
}
