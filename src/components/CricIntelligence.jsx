import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:5000";
const STRIPE_PK = "pk_test_51T7nucBCZG94uH6ZX1dEhm8Ee8FWFEgFi6OlrzUEMtMVp5vzQOQ67NdmdoPGzLaJyrAQaAfssLE2BXoUB24Cqna200AKM4scTU";
const C_API = "http://localhost:5145/api/Prediction";

// Clean team name - smart short name extraction
function cleanTeam(name) {
    if (!name) return "";
    // Remove match number/series info after comma
    let n = name.split(",")[0].trim();
    // Known short name map
    const shorts = {
        "south australia": "SA", "new south wales": "NSW", "western australia": "WA",
        "queensland": "QLD", "victoria": "VIC", "tasmania": "TAS",
        "south africa": "SA", "new zealand": "NZ", "west indies": "WI",
        "sri lanka": "SL", "united arab emirates": "UAE",
        "papua new guinea": "PNG", "united states": "USA",
    };
    const key = n.toLowerCase();
    if (shorts[key]) return shorts[key];
    // If >14 chars, use abbreviation (first letter of each word)
    const words = n.split(" ").filter(w => w.length > 1);
    if (n.length > 14 && words.length >= 2) {
        // Use first letters: "South Australia" → "S. AUS" or just initials
        return words.map(w => w[0].toUpperCase()).join("");
    }
    return n.toUpperCase();
}

const MOCK_MATCHES = [
    { id: 1, t1: "INDIA", t2: "AUSTRALIA", status: "LIVE", day: "DAY 3", detail: "India lead by 140 runs", t1Score: 350, t2Score: 210, over: 68.4 },
    { id: 2, t1: "ENGLAND", t2: "PAKISTAN", status: "UPCOMING", day: "STARTS IN 2H", detail: "Match starts in 2 hours", t1Score: null, t2Score: null, over: 0 },
    { id: 3, t1: "NZ", t2: "SOUTH AFRICA", status: "UPCOMING", day: "TOMORROW", detail: "Cape Town Test · Day 1", t1Score: null, t2Score: null, over: 0 },
];

const MOCK_PREDICTION = {
    aiProbability: 68, pitchLabel: "DRY / FAST", pitchType: "dry_spin", pitchEmoji: "🏜️",
    weather: { temp: 28, condition: "SUNNY" },
    strengths: ["SOLID OPENING STAND", "FAST BOWLING PACE", "SPIN CONTROL EFFICIENCY"],
    weaknesses: ["VULNERABLE TO SHORT BALL", "DEATH RUN LEAKAGE", "UNSTABLE MID ORDER"],
    overHistory: [{ over: 60, runs: 310 }, { over: 62, runs: 322 }, { over: 64, runs: 331 }, { over: 66, runs: 339 }, { over: 68, runs: 350 }],
    score: 350, wickets: 4, overs: 68.4, team1: "India", team2: "Australia",
    currentRunRate: 5.1, requiredRunRate: 0, displayScore: "350/4 (68.4 ov)",
    historicalRunRate: 5.3, venue: "Wankhede Stadium, Mumbai",
    dataSource: "877 venues · 1.7M records · 78.2% accuracy",
    currentPhase: "MIDDLE OVERS",
    phaseEmoji: "🟡",
    pitchCondition: "SHOWING WEAR",
    deteriorationFactor: 1.08,
    weatherImpact: {
        swingFactor: 1.0, dewFactor: 0.9, battingAdvantage: 8,
        tip: "Bright conditions favour batters. Dew expected in evening overs.",
        emoji: "☀️",
    },
    nextOvers: [
        { over: 69, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 9.2, wicketProb: 28, confidence: 85, pitchFactor: 1.09, tip: "🔴 SLOG OVERS — back yourself to hit boundaries", runRange: "7–11" },
        { over: 70, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 10.1, wicketProb: 35, confidence: 77, pitchFactor: 1.10, tip: "🔴 DEATH OVERS — yorkers & variations key", runRange: "8–12" },
        { over: 71, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 11.0, wicketProb: 42, confidence: 69, pitchFactor: 1.12, tip: "🔴 DEATH OVERS — high wicket risk, back your yorker", runRange: "9–13" },
        { over: 72, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 9.8, wicketProb: 38, confidence: 61, pitchFactor: 1.14, tip: "⚠️ DEW EXPECTED — spin grip reduced", runRange: "8–12" },
        { over: 73, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 10.5, wicketProb: 44, confidence: 53, pitchFactor: 1.16, tip: "🔴 FINAL OVER — maximum attack", runRange: "9–13" },
    ],
    powerplay: {
        maxOvers: 10, expectedScore: 58, expectedWkts: 1.8, expectedRR: 5.8,
        inPowerplay: false, advantage: "BATTING", swingRisk: 0,
        tip: "Expect 58 runs in powerplay. Good batting conditions in powerplay.",
    },
    deathOvers: {
        deathStart: 41, oversLeft: 9, expectedRR: 7.2, expectedRuns: 65,
        chaseFeasible: null, pressureIndex: 60, dewImpact: true,
        tip: "Death overs: expect 7.2 RR. Set a strong total. Dew will aid batters — grips difficult for spinners.",
    },
};

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, dark }) {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d.runs);
    const min = Math.min(...vals), max = Math.max(...vals);
    const w = 176, h = 44;
    const pts = vals.map((v, i) => {
        const x = (i / (vals.length - 1)) * w;
        const y = h - ((v - min) / (max - min || 1)) * (h - 8) - 4;
        return [x, y];
    });
    const polyline = pts.map(p => p.join(",")).join(" ");
    const area = `M ${pts[0][0]},${pts[0][1]} ${pts.map(p => `L ${p[0]},${p[1]}`).join(" ")} L ${w},${h} L 0,${h} Z`;
    const color = dark ? "#e8b84b" : "#e8b84b";
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#sg)" />
            <polyline points={polyline} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? "#fff" : color} />
            ))}
        </svg>
    );
}

// ── Probability Arc ───────────────────────────────────────────────────────────
function ProbArc({ value }) {
    const r = 48, cx = 60, cy = 56, circ = Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const col = value > 65 ? "#2ecc71" : value > 40 ? "#c8860a" : "#e74c3c";
    return (
        <svg width="120" height="70" viewBox="0 0 120 70" style={{ overflow: "visible" }}>
            <defs>
                <filter id="glow2">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="8" strokeLinecap="round" />
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke={col} strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                filter="url(#glow2)"
                style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }} />
            <text x={cx} y={cy - 8} textAnchor="middle" fill={col}
                fontSize="20" fontWeight="900" fontFamily="'Bebas Neue', sans-serif">{value}%</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="rgba(0,0,0,0.45)"
                fontSize="7" fontFamily="monospace" letterSpacing="1.5">WIN PROB</text>
        </svg>
    );
}

// ── Weather Box ───────────────────────────────────────────────────────────────
const WEATHER_CFG = {
    SUNNY: { bg: "linear-gradient(135deg, #c86010, #e88020)", icon: "☀️", label: "SUNNY", particles: "sun" },
    RAINY: { bg: "linear-gradient(135deg, #0a1828, #1a3858)", icon: "🌧️", label: "RAIN LIKELY", particles: "rain" },
    CLOUDY: { bg: "linear-gradient(135deg, #282838, #404058)", icon: "⛅", label: "PARTLY CLOUDY", particles: "cloud" },
    OVERCAST: { bg: "linear-gradient(135deg, #181820, #282830)", icon: "☁️", label: "OVERCAST", particles: "none" },
};

function WeatherBox({ condition, temp, pitch }) {
    const cfg = WEATHER_CFG[(condition || "").toUpperCase()] || WEATHER_CFG.SUNNY;
    return (
        <div style={{ background: cfg.bg, borderRadius: "16px", padding: "24px 28px", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
            {/* Sunny rings */}
            {cfg.particles === "sun" && [...Array(4)].map((_, i) => (
                <div key={i} style={{
                    position: "absolute", top: "50%", left: "50%",
                    width: `${80 + i * 50}px`, height: `${80 + i * 50}px`,
                    border: "1px solid rgba(255,200,80,0.12)", borderRadius: "50%",
                    transform: "translate(-50%,-50%)",
                    animation: `sunRing ${2.5 + i * 0.6}s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                }} />
            ))}
            {/* Rain drops */}
            {cfg.particles === "rain" && [...Array(16)].map((_, i) => (
                <div key={i} style={{
                    position: "absolute", left: `${(i * 6.5) % 100}%`, top: "-10%",
                    width: "1.5px", height: `${10 + (i % 6) * 2}px`,
                    background: "linear-gradient(to bottom, transparent, rgba(140,200,255,0.5))",
                    animation: `rainDrop ${0.7 + (i % 4) * 0.15}s linear infinite`,
                    animationDelay: `${(i * 0.1) % 1.2}s`
                }} />
            ))}
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.5)", letterSpacing: "3px", marginBottom: "12px" }}>WEATHER INTELLIGENCE</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "40px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>{cfg.icon}</span>
                    <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: "#fff", lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
                            {temp}°C
                        </div>
                        <div style={{ fontWeight: "800", fontSize: "13px", color: "rgba(255,255,255,0.9)", letterSpacing: "2px" }}>{cfg.label}</div>
                    </div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)", padding: "8px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(255,255,255,0.5)", letterSpacing: "2px", marginBottom: "3px" }}>PITCH</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "15px", color: "#e8b84b", letterSpacing: "1.5px" }}>{pitch || "DRY / FAST"}</div>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("analytics");
    const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0]);
    const [pred, setPred] = useState(MOCK_PREDICTION);
    const [mediaSubTab, setMediaSubTab] = useState("videos");
    const [signalModal, setSignalModal] = useState(false);
    const [ticker, setTicker] = useState(0);
    const [liveTime, setLiveTime] = useState(new Date());
    const [isPremium, setIsPremium] = useState(() => localStorage.getItem("cricintel_premium") === "true");
    const [showPaywall, setShowPaywall] = useState(false);
    const [userEmail, setUserEmail] = useState(() => localStorage.getItem("cricintel_email") || "");
    const [emailInput, setEmailInput] = useState("");
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [paymentStep, setPaymentStep] = useState("plans"); // "plans" | "email"
    const [selectedPlan, setSelectedPlan] = useState("monthly");

    const TICKER_ITEMS = [
        `◆ CRR ${pred.currentRunRate || 4.8}  ·  RRR ${pred.requiredRunRate || 5.11}`,
        `◆ 877 VENUES · 1.7M RECORDS · 78.2% MODEL ACCURACY`,
        `◆ IND VS ENG · T20 WORLD CUP SEMI FINAL · WANKHEDE`,
        `◆ ${cleanTeam(pred.team1 || "INDIA")} ${pred.displayScore || "350/4"} VS ${cleanTeam(pred.team2 || "AUSTRALIA")}`,
        `◆ PITCH: ${pred.pitchLabel || "DRY / FAST"} · AI CONFIDENCE: ${pred.aiProbability || 68}%`,
    ];

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const t = setInterval(() => setTicker(p => p + 1), 10000); return () => clearInterval(t); }, []);

    // Check URL params on load (Stripe redirect back)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        const isPrem = params.get("premium");
        if (isPrem === "true") {
            // Immediately unlock on return from Stripe
            setIsPremium(true);
            localStorage.setItem("cricintel_premium", "true");
            window.history.replaceState({}, "", window.location.pathname);
            // Also verify with backend if session_id present
            if (sessionId) {
                fetch(`${API_BASE}/verify-session?session_id=${sessionId}`)
                    .then(r => r.json())
                    .then(d => {
                        if (d.email) {
                            localStorage.setItem("cricintel_email", d.email);
                            setUserEmail(d.email);
                        }
                    })
                    .catch(() => { });
            }
        }
    }, []);

    // Stripe checkout redirect
    const handleCheckout = async (plan) => {
        setCheckingPayment(true);
        try {
            const res = await fetch(`${API_BASE}/create-checkout-session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, email: emailInput }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url; // redirect to Stripe checkout
            } else {
                alert("Payment error: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            // Fallback: open Stripe checkout in new tab
            alert("Could not connect to payment server. Make sure app_v4.py is running.");
        } finally {
            setCheckingPayment(false);
        }
    };

    const fetchPred = useCallback(async () => {
        try { const r = await fetch(`${API_BASE}/predict`); if (r.ok) setPred(await r.json()); }
        catch { try { const r = await fetch(`${C_API}/live-match`); if (r.ok) { const d = await r.json(); setPred(p => ({ ...p, ...d })); } } catch { } }
    }, []);
    useEffect(() => { fetchPred(); }, [fetchPred, ticker]);

    const prob = pred.aiProbability || 68;

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", color: "#f0ece0", overflowX: "hidden" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #0a0e18; }
        ::-webkit-scrollbar-thumb { background: #e8b84b; border-radius: 2px; }

        @keyframes tickerMove { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
        @keyframes sunRing { 0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(1)} 50%{opacity:.7;transform:translate(-50%,-50%) scale(1.06)} }
        @keyframes rainDrop { 0%{transform:translateY(-10px);opacity:0} 20%{opacity:1} 100%{transform:translateY(180px);opacity:0} }
        @keyframes shimmerBar { 0%{background-position:-400px 0} 100%{background-position:400px 0} }

        .fade-up { animation: fadeUp .45s ease forwards; }
        .ticker-inner { display:inline-block; animation: tickerMove 30s linear infinite; white-space:nowrap; }
        .ticker-inner:hover { animation-play-state:paused; }

        /* ── TOP HALF: Dark Navy (Cafe Nero) ── */
        .nav-dark { background: #0a0e18; border-bottom: 1px solid rgba(39,86,176,0.35); }
        .sidebar-dark { background: #0a0e18; border-right: 1px solid rgba(39,86,176,0.35); }
        .match-row { transition: all .25s; border-radius: 12px; cursor: pointer; border: 1px solid transparent; padding: 13px 15px; margin-bottom: 6px; }
        .match-row:hover { background: rgba(39,86,176,0.1) !important; border-color: rgba(39,86,176,0.25) !important; transform: translateX(3px); }
        .match-row.sel { background: rgba(39,86,176,0.15) !important; border-color: rgba(39,86,176,0.3) !important; }

        /* ── BOTTOM HALF: Mustard ── */
        .main-mustard { background: #e8b84b; }
        .card-mustard { background: rgba(220,170,30,0.6); border: 1px solid rgba(255,255,255,0.25); border-radius: 16px; backdrop-filter: blur(4px); }
        .card-score { background: linear-gradient(135deg, rgba(240,200,60,0.7), rgba(210,160,20,0.7)); border: 1px solid rgba(255,255,255,0.3); border-radius: 16px; }
        .card-strategic { background: rgba(230,180,40,0.55); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; }
        .card-18 { background: rgba(230,180,40,0.55); border: 1px solid rgba(255,255,255,0.2); border-radius: 16px; }

        .signal-btn { background: #111; color: #e8b84b; border: 2px solid #111; border-radius: 12px; width: 100%; padding: 18px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 4px; cursor: pointer; transition: all .3s; }
        .signal-btn:hover { background: #000; transform: scale(1.02); box-shadow: 0 8px 28px rgba(0,0,0,0.4); }

        .nav-tab { background:none; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; padding: 4px 0; transition: all .2s; position: relative; }
        .nav-tab.on { color: #e8b84b; }
        .nav-tab.on::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:#e8b84b; border-radius:1px; }
        .nav-tab:not(.on) { color: #4a5a7a; }
        .nav-tab:hover { color: #c8b090 !important; }

        .sub-tab { font-family:inherit; font-size:11px; font-weight:800; letter-spacing:2px; border:none; cursor:pointer; padding:9px 22px; border-radius:8px; transition:all .2s; }

        .media-card { transition:all .3s; border-radius:14px; overflow:hidden; cursor:pointer; }
        .media-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.5); }
        .news-row { transition:all .2s; border-radius:12px; cursor:pointer; }
        .news-row:hover { transform:translateX(4px); }
        .locked { position:relative; cursor:pointer; }
        .locked:hover .lock-overlay { opacity:1; }
        .lock-overlay { position:absolute; inset:0; background:rgba(232,184,75,0.12); border-radius:14px; display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .2s; z-index:2; border:2px solid rgba(232,184,75,0.4); }
        .blur-content { filter:blur(5px); pointer-events:none; user-select:none; }
        @keyframes lockBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
      `}</style>

            {/* ══ TOP SECTION: DARK NAVY ══════════════════════════════════════════ */}

            {/* Ticker - Cafe Nero navy blue */}
            <div style={{ background: "linear-gradient(90deg, #1e4a9a, #2756b0, #1e4a9a)", padding: "8px 0", overflow: "hidden" }}>
                <div className="ticker-inner">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span key={i} style={{ color: "#0a0a0a", fontFamily: "monospace", fontSize: "10px", fontWeight: "700", marginRight: "60px", letterSpacing: "1.5px" }}>{item}</span>
                    ))}
                </div>
            </div>

            {/* Navbar - dark navy */}
            <nav className="nav-dark" style={{ padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "62px", position: "sticky", top: 0, zIndex: 99 }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "2px" }}>
                    <span style={{ color: "#f0ece0" }}>Cric</span><span style={{ color: "#e8b84b" }}>Intelligence</span>
                </div>
                <div style={{ display: "flex", gap: "32px" }}>
                    {[["analytics", "ANALYTICS"], ["media", "MEDIA"]].map(([key, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`nav-tab ${activeTab === key ? "on" : ""}`}>{label}</button>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#2ecc71", animation: "livePulse 2s infinite" }} />
                        <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#2ecc71", letterSpacing: "2.5px" }}>LIVE</span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: "#4878c0" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                </div>
            </nav>

            {/* ══ ANALYTICS TAB ══ */}
            {activeTab === "analytics" && (
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "272px 1fr", minHeight: "calc(100vh - 94px)" }}>

                    {/* Sidebar - dark navy */}
                    <aside className="sidebar-dark" style={{ padding: "24px 18px", overflowY: "auto" }}>
                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#4878c0", letterSpacing: "4px", marginBottom: "16px" }}>LIVE MATCHES</div>
                        {MOCK_MATCHES.map(m => (
                            <div key={m.id} onClick={() => setSelectedMatch(m)}
                                className={`match-row ${selectedMatch.id === m.id ? "sel" : ""}`}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: selectedMatch.id === m.id ? "#f0ece0" : "#6090c8", letterSpacing: "0.5px" }}>
                                        {m.t1} <span style={{ color: "#4878c0", fontSize: "11px", fontFamily: "sans-serif" }}>vs</span> {m.t2}
                                    </span>
                                    <span style={{
                                        fontFamily: "monospace", fontSize: "8px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px",
                                        background: m.status === "LIVE" ? "rgba(231,76,60,0.15)" : "rgba(30,46,74,0.6)",
                                        color: m.status === "LIVE" ? "#e74c3c" : "#3060a0",
                                        border: m.status === "LIVE" ? "1px solid rgba(231,76,60,0.3)" : "1px solid rgba(39,86,176,0.3)"
                                    }}>
                                        {m.status}
                                    </span>
                                </div>
                                <div style={{ fontSize: "11px", color: "#4878c0" }}>{m.day} · {m.detail}</div>
                            </div>
                        ))}

                        {/* Sparkline */}
                        <div style={{ marginTop: "24px", padding: "16px", background: "#0e1828", borderRadius: "14px", border: "1px solid rgba(39,86,176,0.3)" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#4878c0", letterSpacing: "3px", marginBottom: "12px" }}>RUNS TREND</div>
                            <Sparkline data={pred.overHistory || MOCK_PREDICTION.overHistory} dark />
                        </div>
                    </aside>

                    {/* Main - MUSTARD YELLOW */}
                    <main className="main-mustard" style={{ padding: "36px 44px", overflowY: "auto" }}>

                        {/* Match heading */}
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "4px", marginBottom: "10px" }}>NEURAL MATCH PROTOCOL ACTIVE</div>
                            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(24px,3.2vw,48px)", letterSpacing: "2px", lineHeight: 1.05, wordBreak: "break-word" }}>
                                <span style={{ color: "#111" }}>{cleanTeam(pred.team1 || "INDIA")}</span>
                                <span style={{ color: "rgba(0,0,0,0.25)", fontSize: "0.45em", margin: "0 20px", verticalAlign: "middle" }}>vs</span>
                                <span style={{ color: "rgba(0,0,0,0.45)" }}>{cleanTeam(pred.team2 || "AUSTRALIA")}</span>
                            </h1>
                            {pred.venue && <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.35)", letterSpacing: "2px" }}>{pred.venue.toUpperCase()}</div>}
                        </div>

                        {/* Cards grid */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

                            {/* Score Engine */}
                            <div className="card-score" style={{ padding: "28px", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.45)", letterSpacing: "3px" }}>SCORE ENGINE</div>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.4)", letterSpacing: "1px" }}>{prob}% Win</div>
                                </div>
                                {/* Scores + Arc inline */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0", gap: "4px" }}>
                                    <div style={{ textAlign: "center", flex: 1 }}>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,4.5vw,68px)", color: "#111", lineHeight: 1 }}>{pred.score || 350}</div>
                                        <div style={{ fontSize: "9px", color: "rgba(0,0,0,0.45)", letterSpacing: "2px", marginTop: "4px" }}>{cleanTeam(pred.team1 || "INDIA")}</div>
                                    </div>
                                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                                        <ProbArc value={prob} />
                                    </div>
                                    <div style={{ textAlign: "center", flex: 1 }}>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,4.5vw,68px)", color: "rgba(0,0,0,0.35)", lineHeight: 1 }}>{pred.wickets !== undefined ? `${pred.score}/${pred.wickets}` : "210"}</div>
                                        <div style={{ fontSize: "9px", color: "rgba(0,0,0,0.35)", letterSpacing: "2px", marginTop: "4px" }}>{cleanTeam(pred.team2 || "AUSTRALIA")}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Strategic Data Nodes */}
                            <div className="card-strategic" style={{ padding: "24px 28px" }}>
                                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.4)", letterSpacing: "3px", marginBottom: "18px" }}>STRATEGIC DATA NODES</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.5)", fontWeight: "700", letterSpacing: "2px", marginBottom: "10px", padding: "3px 10px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "4px", display: "inline-block" }}>STRENGTHS</div>
                                        {(pred.strengths || MOCK_PREDICTION.strengths).map((s, i) => (
                                            <div key={i} style={{ fontSize: "11px", fontWeight: "700", color: "#111", marginBottom: "7px", letterSpacing: "0.5px" }}>
                                                <span style={{ color: "rgba(0,0,0,0.4)", marginRight: "6px" }}>+</span>{s}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#c0392b", fontWeight: "700", letterSpacing: "2px", marginBottom: "10px", padding: "3px 10px", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "4px", display: "inline-block" }}>WEAKNESS</div>
                                        {(pred.weaknesses || MOCK_PREDICTION.weaknesses).map((w, i) => (
                                            <div key={i} style={{ fontSize: "11px", fontWeight: "700", color: "#111", marginBottom: "7px", letterSpacing: "0.5px" }}>
                                                <span style={{ color: "#c0392b", marginRight: "6px" }}>−</span>{w}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="signal-btn" onClick={() => isPremium ? setSignalModal(true) : setShowPaywall(true)}>
                                    GET LIVE SIGNAL £
                                </button>
                            </div>

                            {/* Weather Box - dynamic */}
                            <WeatherBox condition={pred.weather?.condition || "SUNNY"} temp={pred.weather?.temp || 28} pitch={pred.pitchLabel || "DRY / FAST"} />

                            {/* 18+ Warning */}
                            <div className="card-18" style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: "18px" }}>
                                <div style={{ width: "52px", height: "52px", border: "2px solid rgba(192,57,43,0.6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: "#c0392b", letterSpacing: "1px" }}>18+</span>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: "#c0392b", marginBottom: "6px" }}>FINANCIAL RISK WARNING</div>
                                    <div style={{ fontSize: "11px", color: "rgba(0,0,0,0.5)", lineHeight: "1.6" }}>
                                        Predictions based on 95% AI accuracy. Market conditions vary. Please play responsibly. BeGambleAware.org
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status bar */}
                        <div style={{ marginTop: "18px", padding: "12px 18px", background: "rgba(0,0,0,0.12)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ecc71", animation: "livePulse 2s infinite" }} />
                                <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)", letterSpacing: "2px" }}>{pred.aiWeather || "LIVE · DRY/SPIN DETECTED"}</span>
                            </div>
                            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.35)", letterSpacing: "1px" }}>{pred.dataSource || "877 venues · 1.7M records · 67.3%"}</span>
                        </div>

                        {/* ── OVER-BY-OVER PREDICTION ENGINE ── */}
                        <div style={{ marginTop: "24px" }}>

                            {/* Section header */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: "#111", letterSpacing: "2px" }}>OVER-BY-OVER PREDICTION</div>
                                    <div style={{ background: "#111", color: "#e8b84b", fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 10px", borderRadius: "20px" }}>AI ENGINE v4</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.4)", letterSpacing: "1px" }}>PHASE:</span>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "#111" }}>{pred.phaseEmoji || "🟡"} {pred.currentPhase || "MIDDLE OVERS"}</span>
                                </div>
                            </div>

                            {/* Next overs cards - FREE: 1 over, PREMIUM: 5 overs */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px", marginBottom: "18px" }}>
                                {(pred.nextOvers || []).map((ov, i) => (
                                    <div key={i} style={{
                                        background: i === 0 ? "rgba(0,0,0,0.25)" : `rgba(0,0,0,${0.15 - i * 0.02})`,
                                        border: i === 0 ? "2px solid rgba(0,0,0,0.4)" : "1px solid rgba(0,0,0,0.12)",
                                        borderRadius: "14px", padding: "14px 12px", textAlign: "center",
                                        transition: "all .2s", cursor: i === 0 || isPremium ? "default" : "pointer",
                                        transform: i === 0 ? "translateY(-3px)" : "none",
                                        position: "relative", overflow: "hidden",
                                    }}>
                                        {/* Over number */}
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "2px", marginBottom: "4px" }}>OVER {ov.over}</div>

                                        {/* Phase badge */}
                                        <div style={{
                                            fontFamily: "monospace", fontSize: "7px", fontWeight: "700", letterSpacing: "1px", marginBottom: "8px",
                                            color: ov.phase === "POWERPLAY" ? "#1e4a8c" : ov.phase === "DEATH OVERS" ? "#c0392b" : "#7a6000",
                                        }}>{ov.phaseEmoji} {ov.phase}</div>

                                        {/* Expected runs - BIG */}
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "36px", color: "#111", lineHeight: 1, marginBottom: "2px" }}>
                                            {ov.expectedRuns.toFixed(0)}
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(0,0,0,0.4)", letterSpacing: "1px", marginBottom: "8px" }}>
                                            RUNS ({ov.runRange})
                                        </div>

                                        {/* Wicket probability bar */}
                                        <div style={{ marginBottom: "8px" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(0,0,0,0.4)", letterSpacing: "1px" }}>WKTS</span>
                                                <span style={{
                                                    fontFamily: "monospace", fontSize: "7px", fontWeight: "700",
                                                    color: ov.wicketProb > 40 ? "#c0392b" : ov.wicketProb > 25 ? "#c8860a" : "#2e7d32"
                                                }}>{ov.wicketProb}%</span>
                                            </div>
                                            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "4px", height: "4px", overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%", borderRadius: "4px",
                                                    width: `${ov.wicketProb}%`,
                                                    background: ov.wicketProb > 40 ? "#c0392b" : ov.wicketProb > 25 ? "#c8860a" : "#2e7d32",
                                                    transition: "width 1s ease",
                                                }} />
                                            </div>
                                        </div>

                                        {/* Pitch factor */}
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                            <span style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(0,0,0,0.35)", letterSpacing: "1px" }}>PITCH</span>
                                            <span style={{
                                                fontFamily: "monospace", fontSize: "7px", fontWeight: "700",
                                                color: ov.pitchFactor > 1.2 ? "#c0392b" : ov.pitchFactor > 1.1 ? "#c8860a" : "#2e7d32"
                                            }}>×{ov.pitchFactor}</span>
                                        </div>

                                        {/* Confidence */}
                                        <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: "6px", padding: "4px 6px" }}>
                                            <div style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(0,0,0,0.4)", letterSpacing: "1px" }}>
                                                CONFIDENCE: <span style={{ color: "#111", fontWeight: "700" }}>{ov.confidence}%</span>
                                            </div>
                                        </div>

                                        {/* 🔒 Lock overlay for overs 2-5 (non-premium) */}
                                        {i > 0 && !isPremium && (
                                            <div onClick={() => setShowPaywall(true)} style={{
                                                position: "absolute", inset: 0, borderRadius: "14px",
                                                background: "rgba(210,160,20,0.92)", backdropFilter: "blur(4px)",
                                                display: "flex", flexDirection: "column", alignItems: "center",
                                                justifyContent: "center", cursor: "pointer", gap: "4px", zIndex: 10,
                                            }}>
                                                <div style={{ fontSize: "22px" }}>🔒</div>
                                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", color: "#111", letterSpacing: "2px" }}>PREMIUM</div>
                                                <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.55)", letterSpacing: "1px" }}>£9.99/mo</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Strategy tips row */}
                            <div onClick={() => !isPremium && setShowPaywall(true)}
                                style={{ background: "rgba(0,0,0,0.1)", borderRadius: "12px", padding: "14px 18px", marginBottom: "18px", position: "relative", cursor: isPremium ? "default" : "pointer" }}>
                                {!isPremium && <div style={{ position: "absolute", inset: 0, borderRadius: "12px", backdropFilter: "blur(4px)", background: "rgba(200,150,10,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", zIndex: 2 }}>
                                    <span style={{ fontSize: "18px" }}>🔒</span>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: "#111", letterSpacing: "2px" }}>UNLOCK STRATEGY INTEL — £9.99/mo</span>
                                </div>}
                                <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "3px", marginBottom: "10px" }}>STRATEGY INTEL</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "8px" }}>
                                    {(pred.nextOvers || []).slice(0, 3).map((ov, i) => (
                                        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.3)", flexShrink: 0 }}>OV{ov.over}</span>
                                            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.55)", lineHeight: 1.5 }}>{ov.tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pitch deterioration + Weather + Powerplay/Death row */}
                            <div style={{ position: "relative" }} onClick={() => !isPremium && setShowPaywall(true)}>
                                {!isPremium && <div style={{ position: "absolute", inset: 0, borderRadius: "12px", backdropFilter: "blur(5px)", background: "rgba(200,150,10,0.55)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", zIndex: 4, cursor: "pointer" }}>
                                    <span style={{ fontSize: "24px" }}>🔒</span>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#111", letterSpacing: "2px" }}>PREMIUM INTEL</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.6)", letterSpacing: "1px" }}>Pitch wear · Weather · Phase analysis</div>
                                    </div>
                                </div>}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>

                                    {/* Pitch Deterioration */}
                                    <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: "12px", padding: "16px" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "2.5px", marginBottom: "10px" }}>PITCH WEAR</div>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: "#111", marginBottom: "4px" }}>{pred.pitchCondition || "SHOWING WEAR"}</div>
                                        <div style={{ marginBottom: "8px" }}>
                                            <div style={{ background: "rgba(0,0,0,0.12)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                                                <div style={{
                                                    height: "100%", borderRadius: "4px",
                                                    width: `${Math.min(((pred.deteriorationFactor || 1) - 1) * 400, 100)}%`,
                                                    background: (pred.deteriorationFactor || 1) > 1.2 ? "#c0392b" : (pred.deteriorationFactor || 1) > 1.1 ? "#e8860a" : "#2e7d32",
                                                    transition: "width 1.5s ease",
                                                }} />
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)" }}>
                                            Factor ×{pred.deteriorationFactor || 1.08} · {pred.pitchEmoji || "⚖️"} {pred.pitchLabel || "DRY/FAST"}
                                        </div>
                                        <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", lineHeight: 1.5 }}>
                                            {(pred.deteriorationFactor || 1) > 1.15
                                                ? "⚠️ Heavy wear — spinners getting sharp turn"
                                                : (pred.deteriorationFactor || 1) > 1.05
                                                    ? "Surface softening — variable bounce possible"
                                                    : "✅ Pitch playing true — batting still good"}
                                        </div>
                                    </div>

                                    {/* Weather Impact */}
                                    <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: "12px", padding: "16px" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "2.5px", marginBottom: "10px" }}>WEATHER IMPACT</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                            <span style={{ fontSize: "24px" }}>{pred.weatherImpact?.emoji || "☀️"}</span>
                                            <div>
                                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "#111" }}>
                                                    {pred.weather?.condition || "SUNNY"} · {pred.weather?.temp || 28}°C
                                                </div>
                                                <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)" }}>
                                                    💧 {pred.weather?.humidity || 55}% · 💨 {pred.weather?.wind_speed || 10}km/h
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                                            {[
                                                ["SWING", `×${pred.weatherImpact?.swingFactor || 1.0}`],
                                                ["DEW RISK", pred.weatherImpact?.dewFactor < 0.9 ? "HIGH ⚠️" : "LOW ✅"],
                                            ].map(([l, v]) => (
                                                <div key={l} style={{ background: "rgba(0,0,0,0.08)", borderRadius: "6px", padding: "5px 8px", textAlign: "center" }}>
                                                    <div style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(0,0,0,0.4)", letterSpacing: "1px" }}>{l}</div>
                                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "#111" }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.45)", lineHeight: 1.5 }}>
                                            {pred.weatherImpact?.tip || "Clear conditions. Good batting surface."}
                                        </div>
                                    </div>

                                    {/* Powerplay / Death */}
                                    <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: "12px", padding: "16px" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "2.5px", marginBottom: "10px" }}>PHASE ANALYSIS</div>

                                        {/* Powerplay */}
                                        <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: "8px", fontWeight: "700", color: "#1e4a8c", letterSpacing: "1px" }}>🔵 POWERPLAY</span>
                                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", color: "#111" }}>
                                                    EXP: {pred.powerplay?.expectedScore || 58}/{pred.powerplay?.expectedWkts || 1.8}
                                                </span>
                                            </div>
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.45)", lineHeight: 1.5 }}>
                                                RR {pred.powerplay?.expectedRR || 5.8} · {pred.powerplay?.advantage || "BATTING"} ADVANTAGE
                                            </div>
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", marginTop: "3px", lineHeight: 1.4 }}>
                                                {pred.powerplay?.tip || "Good batting conditions in powerplay."}
                                            </div>
                                        </div>

                                        {/* Death overs */}
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: "8px", fontWeight: "700", color: "#c0392b", letterSpacing: "1px" }}>🔴 DEATH OVERS</span>
                                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", color: "#111" }}>
                                                    EXP: +{pred.deathOvers?.expectedRuns || 65}
                                                </span>
                                            </div>
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.45)", lineHeight: 1.5 }}>
                                                RR {pred.deathOvers?.expectedRR || 7.2} · {pred.deathOvers?.oversLeft || 9} overs left
                                            </div>
                                            {pred.deathOvers?.dewImpact && (
                                                <div style={{ marginTop: "4px", background: "rgba(192,57,43,0.1)", borderRadius: "6px", padding: "4px 8px" }}>
                                                    <span style={{ fontFamily: "monospace", fontSize: "8px", color: "#c0392b" }}>⚠️ DEW EXPECTED — spin grip reduced</span>
                                                </div>
                                            )}
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", marginTop: "4px", lineHeight: 1.4 }}>
                                                {pred.deathOvers?.tip || "Set a strong total."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {/* ══ MEDIA TAB ══ */}
            {activeTab === "media" && (
                <div className="fade-up" style={{ background: "#e8b84b", minHeight: "calc(100vh - 94px)", padding: "40px 48px" }}>
                    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
                        <div style={{ display: "flex", gap: "4px", marginBottom: "32px", background: "rgba(0,0,0,0.12)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
                            {[["videos", "▶  VIDEOS"], ["articles", "◈  ARTICLES"], ["news", "⚡  LIVE NEWS"]].map(([key, label]) => (
                                <button key={key} onClick={() => setMediaSubTab(key)} className="sub-tab"
                                    style={{ background: mediaSubTab === key ? "#111" : "none", color: mediaSubTab === key ? "#e8b84b" : "rgba(0,0,0,0.45)" }}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* VIDEOS */}
                        {mediaSubTab === "videos" && (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "18px", marginBottom: "20px" }}>
                                    {[
                                        { id: "c_LLXt8bPD0", title: "Rohit Sharma Pre-Match Press Conference | T20 WC 2026", channel: "BCCI Official", tag: "PRESS CONF" },
                                        { id: "3T8LvBDc_4o", title: "Harry Brook on England's T20 World Cup Campaign", channel: "England Cricket", tag: "INTERVIEW" },
                                        { id: "dQw4w9WgXcQ", title: "Jasprit Bumrah Bowling Masterclass | Full Analysis", channel: "ESPNCricinfo", tag: "ANALYSIS" },
                                        { id: "K4TOrB7at0Y", title: "Wankhede Pitch Report | IND vs ENG Semi Final", channel: "ICC", tag: "PITCH" },
                                        { id: "9bZkp7q19f0", title: "T20 World Cup 2026 — Best Moments Compilation", channel: "ICC Official", tag: "HIGHLIGHTS" },
                                        { id: "OPf0YbXqDm0", title: "Suryakumar Yadav 360° Batting Breakdown", channel: "Cricket Australia", tag: "TECHNIQUE" },
                                    ].map(v => (
                                        <div key={v.id} className="media-card" style={{ background: "rgba(200,150,10,0.4)", border: "1px solid rgba(255,255,255,0.25)" }}
                                            onClick={() => window.open(`https://www.youtube.com/watch?v=${v.id}`, '_blank')}>
                                            <div style={{ position: "relative", overflow: "hidden" }}>
                                                <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title}
                                                    style={{ width: "100%", height: "168px", objectFit: "cover", display: "block", transition: "transform .4s" }}
                                                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                                                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                                                    onError={e => { e.target.style.display = "none"; }} />
                                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
                                                <div style={{ position: "absolute", top: "10px", left: "10px", background: "#111", color: "#e8b84b", fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 9px", borderRadius: "20px" }}>{v.tag}</div>
                                            </div>
                                            <div style={{ padding: "14px 16px" }}>
                                                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111", lineHeight: "1.4", marginBottom: "6px" }}>{v.title}</div>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "9px" }}>
                                                    <span style={{ color: "rgba(0,0,0,0.45)" }}>{v.channel}</span>
                                                    <span style={{ color: "#111", letterSpacing: "1px" }}>WATCH →</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: "16px 20px", background: "rgba(0,0,0,0.1)", borderRadius: "12px", display: "flex", gap: "10px" }}>
                                    <input placeholder="Search cricket videos..." style={{ flex: 1, background: "rgba(0,0,0,0.15)", border: "1px solid rgba(0,0,0,0.15)", color: "#111", padding: "9px 14px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
                                        onKeyDown={e => e.key === 'Enter' && window.open(`https://youtube.com/results?search_query=cricket+${encodeURIComponent(e.target.value)}`, '_blank')} />
                                    <button style={{ background: "#111", color: "#e8b84b", border: "none", padding: "9px 20px", borderRadius: "8px", fontFamily: "monospace", fontWeight: "700", fontSize: "10px", letterSpacing: "2px", cursor: "pointer" }}
                                        onClick={e => window.open(`https://youtube.com/results?search_query=cricket+${encodeURIComponent(e.target.parentNode.querySelector('input').value)}`, '_blank')}>
                                        SEARCH
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ARTICLES */}
                        {mediaSubTab === "articles" && (
                            <div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "18px", marginBottom: "20px" }}>
                                    {[
                                        { title: "IND vs ENG T20 WC Semi-Final: Pitch Report & Prediction", source: "ESPNCricinfo", url: "https://espncricinfo.com", tag: "PREVIEW", desc: "Wankhede expected to assist spinners in second innings. Dew factor critical after over 14." },
                                        { title: "Jasprit Bumrah: The Science Behind His Unplayable Yorker", source: "The Cricket Monthly", url: "https://espncricinfo.com/cricket-monthly", tag: "ANALYSIS", desc: "How his unique action generates late swing and pinpoint accuracy at the death." },
                                        { title: "T20 World Cup 2026: Complete Stats & Records", source: "ICC", url: "https://icc-cricket.com", tag: "STATS", desc: "Full breakdown of team and individual records throughout the tournament." },
                                        { title: "Harry Brook — England's Most Dangerous Modern Batter?", source: "Cricbuzz", url: "https://cricbuzz.com", tag: "PROFILE", desc: "A deep dive into Brook's meteoric rise and his record-breaking T20 campaign." },
                                        { title: "Wankhede: Records, History & Classic Encounters", source: "Wisden", url: "https://wisden.com", tag: "HISTORY", desc: "From Sachin's final Test to World Cup finals — the ground's unforgettable moments." },
                                        { title: "How AI Is Changing Cricket Forever", source: "The Guardian", url: "https://theguardian.com/sport/cricket", tag: "TECH", desc: "Teams now use predictive models for pitch analysis, player selection and match strategy." },
                                    ].map((a, i) => (
                                        <div key={i} className="media-card" style={{ background: "rgba(200,150,10,0.4)", border: "1px solid rgba(255,255,255,0.25)", padding: "20px" }}
                                            onClick={() => window.open(a.url, '_blank')}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                                <span style={{ background: "rgba(0,0,0,0.15)", color: "#111", fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 10px", borderRadius: "20px" }}>{a.tag}</span>
                                                <span style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)" }}>{a.source}</span>
                                            </div>
                                            <div style={{ fontSize: "14px", fontWeight: "800", color: "#111", lineHeight: "1.4", marginBottom: "8px" }}>{a.title}</div>
                                            <div style={{ fontSize: "12px", color: "rgba(0,0,0,0.5)", lineHeight: "1.6" }}>{a.desc}</div>
                                            <div style={{ marginTop: "14px", fontFamily: "monospace", fontSize: "9px", color: "#111", letterSpacing: "2px" }}>READ MORE →</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* LIVE NEWS */}
                        {mediaSubTab === "news" && (
                            <div>
                                {[
                                    { title: "INDIA VS ENGLAND LIVE: England need 170 — Wankhede T20 WC Semi Final", source: "ESPNCricinfo", time: "LIVE NOW", tag: "BREAKING", url: "https://espncricinfo.com", hot: true },
                                    { title: "New Zealand beat South Africa by 9 wickets to reach T20 WC Final", source: "ICC", time: "3h ago", tag: "RESULT", url: "https://icc-cricket.com", hot: false },
                                    { title: "Wankhede pitch: Spinner-friendly, dew expected to help chasers", source: "Cricbuzz", time: "5h ago", tag: "PITCH", url: "https://cricbuzz.com", hot: false },
                                    { title: "Finn Allen smashes fastest ever T20 WC century — 100* off 33 balls", source: "ICC", time: "6h ago", tag: "RECORD", url: "https://icc-cricket.com", hot: false },
                                    { title: "Rohit Sharma: 'We've been building for this moment for 4 years'", source: "BCCI", time: "8h ago", tag: "INTERVIEW", url: "https://bcci.tv", hot: false },
                                    { title: "Jasprit Bumrah named Player of the Tournament — T20 WC 2026", source: "ICC", time: "10h ago", tag: "AWARD", url: "https://icc-cricket.com", hot: false },
                                    { title: "IPL 2026: Full retained & released players list announced by BCCI", source: "BCCI", time: "1d ago", tag: "IPL", url: "https://iplt20.com", hot: false },
                                ].map((n, i) => (
                                    <div key={i} className="news-row" style={{ background: n.hot ? "rgba(180,60,40,0.2)" : "rgba(0,0,0,0.1)", border: n.hot ? "1px solid rgba(192,57,43,0.35)" : "1px solid rgba(0,0,0,0.1)", padding: "14px 18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "14px" }}
                                        onClick={() => window.open(n.url, '_blank')}>
                                        <span style={{ background: n.hot ? "rgba(192,57,43,0.2)" : "rgba(0,0,0,0.15)", color: n.hot ? "#c0392b" : "#111", fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap", minWidth: "72px", textAlign: "center" }}>{n.tag}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "13px", fontWeight: "700", color: "#111", lineHeight: 1.4, marginBottom: "3px" }}>{n.title}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.4)" }}>{n.source} · {n.time}</div>
                                        </div>
                                        <div style={{ color: "rgba(0,0,0,0.3)", fontSize: "14px" }}>→</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── PAYWALL MODAL ── */}
            {showPaywall && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setShowPaywall(false)}>
                    <div style={{ background: "#e8b84b", borderRadius: "28px", padding: "44px 40px", maxWidth: "460px", width: "92%", textAlign: "center" }}
                        onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏏</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", color: "#111", letterSpacing: "3px", lineHeight: 1 }}>UNLOCK PREMIUM</div>
                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.45)", letterSpacing: "3px", marginBottom: "28px", marginTop: "6px" }}>78% AI ACCURACY · LIVE SIGNALS</div>

                        {/* What you get */}
                        <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: "14px", padding: "18px", marginBottom: "20px", textAlign: "left" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "3px", marginBottom: "12px" }}>PREMIUM INCLUDES</div>
                            {[
                                ["🔮", "Next 5 overs prediction", "Run ranges + wicket probability"],
                                ["📉", "Pitch deterioration tracker", "Know when pitch turns dangerous"],
                                ["🌤️", "Weather impact analysis", "Swing, dew, humidity effects"],
                                ["📊", "Phase strategy intel", "Powerplay + death overs tactics"],
                                ["⚡", "Live signals every over", "Real-time AI recommendations"],
                            ].map(([icon, title, desc]) => (
                                <div key={title} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "10px" }}>
                                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "800", color: "#111", letterSpacing: "0.5px" }}>{title}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Email input step */}
                        {paymentStep === "email" ? (
                            <div>
                                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)", letterSpacing: "2px", marginBottom: "12px" }}>
                                    {selectedPlan === "annual" ? "ANNUAL PLAN — £59.99/yr" : "MONTHLY PLAN — £9.99/mo"}
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email..."
                                    value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    style={{ width: "100%", background: "rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.2)", color: "#111", padding: "12px 16px", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", marginBottom: "12px", boxSizing: "border-box" }}
                                    onKeyDown={e => e.key === "Enter" && emailInput && handleCheckout(selectedPlan)}
                                />
                                <button
                                    onClick={() => handleCheckout(selectedPlan)}
                                    disabled={!emailInput || checkingPayment}
                                    style={{ width: "100%", background: emailInput ? "#111" : "rgba(0,0,0,0.3)", color: "#e8b84b", border: "none", padding: "14px", borderRadius: "10px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px", cursor: emailInput ? "pointer" : "not-allowed", marginBottom: "8px" }}>
                                    {checkingPayment ? "REDIRECTING..." : "PAY WITH STRIPE →"}
                                </button>
                                <button onClick={() => setPaymentStep("plans")}
                                    style={{ background: "none", border: "none", color: "rgba(0,0,0,0.4)", fontFamily: "monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "1.5px" }}>
                                    ← BACK
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Plans */}
                                {[
                                    { label: "MONTHLY", plan: "monthly", price: "£9.99", per: "/mo", desc: "Cancel anytime", highlight: false },
                                    { label: "ANNUAL ★", plan: "annual", price: "£59.99", per: "/yr", desc: "Save 50% — best value", highlight: true },
                                ].map(p => (
                                    <div key={p.label}
                                        onClick={() => { setSelectedPlan(p.plan); setPaymentStep("email"); }}
                                        style={{
                                            background: p.highlight ? "#111" : "rgba(0,0,0,0.12)",
                                            border: p.highlight ? "2px solid #111" : "1px solid rgba(0,0,0,0.15)",
                                            borderRadius: "14px", padding: "16px 20px", marginBottom: "10px",
                                            display: "flex", justifyContent: "space-between", alignItems: "center",
                                            cursor: "pointer", transition: "all .2s",
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                        <div style={{ textAlign: "left" }}>
                                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: p.highlight ? "#e8b84b" : "#111", letterSpacing: "2px" }}>{p.label}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: p.highlight ? "rgba(232,184,75,0.7)" : "rgba(0,0,0,0.45)", marginTop: "2px" }}>{p.desc}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "30px", color: p.highlight ? "#e8b84b" : "#111" }}>{p.price}</span>
                                            <span style={{ fontFamily: "monospace", fontSize: "10px", color: p.highlight ? "rgba(232,184,75,0.6)" : "rgba(0,0,0,0.4)" }}>{p.per}</span>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}

                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.3)", letterSpacing: "1.5px", marginTop: "14px" }}>
                            18+ · Gamble responsibly · BeGambleAware.org<br />Predictions for informational purposes only
                        </div>
                        <button onClick={() => { setShowPaywall(false); setPaymentStep("plans"); }}
                            style={{ marginTop: "12px", background: "none", border: "none", color: "rgba(0,0,0,0.35)", fontFamily: "monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "2px" }}>
                            MAYBE LATER
                        </button>
                    </div>
                </div>
            )}

            {/* ── SIGNAL MODAL ── */}
            {signalModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setSignalModal(false)}>
                    <div style={{ background: "#e8b84b", borderRadius: "24px", padding: "44px 40px", maxWidth: "420px", width: "90%", textAlign: "center" }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", color: "#111", marginBottom: "4px", letterSpacing: "2px" }}>LIVE SIGNAL</div>
                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.4)", letterSpacing: "3px", marginBottom: "28px" }}>PREMIUM PREDICTION ACCESS</div>
                        {[["£9.99/mo", "Daily AI Signals", "BASIC"], ["£24.99/mo", "Live Over-by-Over", "PRO ★"], ["£49.99/mo", "Full API Access", "ELITE"]].map(([price, desc, label]) => (
                            <div key={label} style={{ background: label === "PRO ★" ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)", border: label === "PRO ★" ? "1px solid rgba(0,0,0,0.25)" : "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "14px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all .2s" }}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.2)"}
                                onMouseLeave={e => e.currentTarget.style.background = label === "PRO ★" ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)"}>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "#111", letterSpacing: "1px" }}>{label}</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.45)", marginTop: "2px" }}>{desc}</div>
                                </div>
                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", color: "#111" }}>{price}</div>
                            </div>
                        ))}
                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.3)", marginTop: "16px", letterSpacing: "1.5px" }}>18+ · Gamble responsibly · BeGambleAware.org</div>
                        <button onClick={() => setSignalModal(false)}
                            style={{ marginTop: "14px", background: "#111", border: "none", color: "#e8b84b", padding: "8px 28px", borderRadius: "8px", cursor: "pointer", fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px" }}>
                            CLOSE
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
