import React, { useState, useEffect, useCallback } from "react";

const API_BASE = "https://cricintel-backend-production.up.railway.app";
const STRIPE_PK = "pk_test_51T7nucBCZG94uH6ZX1dEhm8Ee8FWFEgFi6OlrzUEMtMVp5vzQOQ67NdmdoPGzLaJyrAQaAfssLE2BXoUB24Cqna200AKM4scTU";
const C_API = "http://localhost:5145/api/Prediction";
const CRIC_KEY = "ce928481-ed4b-453e-bf54-a51eb747ad08";
const CRIC_BASE = "https://cricketdata.org/api";

const MUSTARD = "#c8961e";
const BLUE = "#354d97";
const BLK = "#000000";
const BLK_DIM = "rgba(0,0,0,0.45)";
const CARD_BG = "#dce8ff";   // light blue-tinted card on blue bg
const CARD_BG2 = "#c8d8f8";

function cleanTeam(name) {
    if (!name) return "";
    let n = name.split(",")[0].trim();
    const shorts = {
        "south australia": "SA", "new south wales": "NSW", "western australia": "WA",
        "queensland": "QLD", "victoria": "VIC", "tasmania": "TAS",
        "south africa": "SA", "new zealand": "NZ", "west indies": "WI",
        "sri lanka": "SL", "united arab emirates": "UAE",
        "papua new guinea": "PNG", "united states": "USA",
    };
    const key = n.toLowerCase();
    if (shorts[key]) return shorts[key];
    const words = n.split(" ").filter(w => w.length > 1);
    if (n.length > 14 && words.length >= 2) return words.map(w => w[0].toUpperCase()).join("");
    return n.toUpperCase();
}

// ── Team Logos (ESPN hscicdn.com) ──────────────────────────────────────────────
const BASE_LOGO = "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/db/PICTURES/CMS";
const TEAM_LOGO_URLS = {
    "india": BASE_LOGO + "/381800/381895.png",
    "australia": BASE_LOGO + "/382700/382733.png",
    "england": BASE_LOGO + "/317600/317615.png",
    "pakistan": BASE_LOGO + "/381800/381894.png",
    "new zealand": BASE_LOGO + "/340500/340503.png",
    "nz": BASE_LOGO + "/340500/340503.png",
    "south africa": BASE_LOGO + "/340400/340493.png",
    "sa": BASE_LOGO + "/340400/340493.png",
    "sri lanka": BASE_LOGO + "/340500/340505.png",
    "sl": BASE_LOGO + "/340500/340505.png",
    "west indies": BASE_LOGO + "/381800/381891.png",
    "wi": BASE_LOGO + "/381800/381891.png",
    "bangladesh": BASE_LOGO + "/381800/381857.png",
    "zimbabwe": BASE_LOGO + "/340000/340047.png",
    "afghanistan": BASE_LOGO + "/381800/381893.png",
    "ireland": BASE_LOGO + "/349300/349350.png",
    "scotland": BASE_LOGO + "/381800/381853.png",
    "netherlands": BASE_LOGO + "/381800/381858.png",
    "nepal": BASE_LOGO + "/381800/381892.png",
};

function TeamLogo({ name, size = 32, style = {} }) {
    const [imgError, setImgError] = useState(false);
    const key = (name || "").toLowerCase().trim();
    const url = TEAM_LOGO_URLS[key];
    const abbr = cleanTeam(name).slice(0, 3);
    const colors = ["#1a472a", "#003087", "#cf142b", "#006600", "#00247d"];
    const bg = colors[Math.abs([...key].reduce((a, c) => a + c.charCodeAt(0), 0)) % colors.length];
    if (!url || imgError) {
        return (
            <svg width={size} height={size} style={{ flexShrink: 0, ...style }}>
                <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill={bg} stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                <text x={size / 2} y={size / 2 + size * 0.15} textAnchor="middle" fontSize={size * 0.35} fill="#fff" fontFamily="sans-serif" fontWeight="bold">{abbr}</text>
            </svg>
        );
    }
    return (
        <img src={url} alt={name} onError={() => setImgError(true)}
            style={{
                width: size, height: size, objectFit: "contain", borderRadius: "50%",
                background: "rgba(255,255,255,0.9)", padding: "2px", flexShrink: 0, ...style
            }} />
    );
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
    currentPhase: "MIDDLE OVERS", phaseEmoji: "🟡",
    pitchCondition: "SHOWING WEAR", deteriorationFactor: 1.08,
    weatherImpact: { swingFactor: 1.0, dewFactor: 0.9, battingAdvantage: 8, tip: "Bright conditions favour batters. Dew expected in evening overs.", emoji: "☀️" },
    nextOvers: [
        { over: 69, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 9.2, wicketProb: 28, confidence: 85, pitchFactor: 1.09, tip: "🔴 SLOG OVERS — back yourself to hit boundaries", runRange: "7–11" },
        { over: 70, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 10.1, wicketProb: 35, confidence: 77, pitchFactor: 1.10, tip: "🔴 DEATH OVERS — yorkers & variations key", runRange: "8–12" },
        { over: 71, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 11.0, wicketProb: 42, confidence: 69, pitchFactor: 1.12, tip: "🔴 DEATH OVERS — high wicket risk, back your yorker", runRange: "9–13" },
        { over: 72, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 9.8, wicketProb: 38, confidence: 61, pitchFactor: 1.14, tip: "⚠️ DEW EXPECTED — spin grip reduced", runRange: "8–12" },
        { over: 73, phase: "DEATH OVERS", phaseEmoji: "🔴", expectedRuns: 10.5, wicketProb: 44, confidence: 53, pitchFactor: 1.16, tip: "🔴 FINAL OVER — maximum attack", runRange: "9–13" },
    ],
    powerplay: { maxOvers: 10, expectedScore: 58, expectedWkts: 1.8, expectedRR: 5.8, inPowerplay: false, advantage: "BATTING", swingRisk: 0, tip: "Expect 58 runs in powerplay. Good batting conditions in powerplay." },
    deathOvers: { deathStart: 41, oversLeft: 9, expectedRR: 7.2, expectedRuns: 65, chaseFeasible: null, pressureIndex: 60, dewImpact: true, tip: "Death overs: expect 7.2 RR. Set a strong total. Dew will aid batters — grips difficult for spinners." },
};

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data }) {
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
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BLK} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={BLK} stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#sg)" />
            <polyline points={polyline} fill="none" stroke={BLK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? MUSTARD : BLK} />
            ))}
        </svg>
    );
}

// ── Probability Arc ───────────────────────────────────────────────────────────
function ProbArc({ value }) {
    const r = 48, cx = 60, cy = 56, circ = Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const col = value > 65 ? "#2ecc71" : value > 40 ? MUSTARD : "#e74c3c";
    return (
        <svg width="120" height="70" viewBox="0 0 120 70" style={{ overflow: "visible" }}>
            <defs>
                <filter id="glow2">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="8" strokeLinecap="round" />
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke={col} strokeWidth="8"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                filter="url(#glow2)"
                style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1)" }} />
            <text x={cx} y={cy - 8} textAnchor="middle" fill={BLK}
                fontSize="20" fontWeight="900" fontFamily="'Bebas Neue', sans-serif">{value}%</text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill={BLK_DIM}
                fontSize="7" fontFamily="monospace" letterSpacing="1.5">WIN PROB</text>
        </svg>
    );
}

// ── Weather Box ───────────────────────────────────────────────────────────────
const WEATHER_CFG = {
    SUNNY: { bg: `linear-gradient(135deg, ${CARD_BG2}, ${CARD_BG})`, icon: "☀️", label: "SUNNY" },
    RAINY: { bg: `linear-gradient(135deg, ${CARD_BG2}, ${CARD_BG})`, icon: "🌧️", label: "RAIN LIKELY" },
    CLOUDY: { bg: `linear-gradient(135deg, ${CARD_BG2}, ${CARD_BG})`, icon: "⛅", label: "PARTLY CLOUDY" },
    OVERCAST: { bg: `linear-gradient(135deg, ${CARD_BG2}, ${CARD_BG})`, icon: "☁️", label: "OVERCAST" },
};


// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tip({ text, children }) {
    return (
        <span className="tip-wrap">
            {children}
            <span className="tip">{text}</span>
        </span>
    );
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div style={{ background: "rgba(220,232,255,0.7)", borderRadius: "16px", padding: "28px" }}>
            <div className="skeleton" style={{ height: "10px", width: "40%", marginBottom: "20px" }} />
            <div className="skeleton" style={{ height: "56px", width: "60%", marginBottom: "12px" }} />
            <div className="skeleton" style={{ height: "10px", width: "80%" }} />
        </div>
    );
}

function WeatherBox({ condition, temp, pitch }) {
    const cfg = WEATHER_CFG[(condition || "").toUpperCase()] || WEATHER_CFG.SUNNY;
    return (
        <div style={{ background: cfg.bg, borderRadius: "16px", padding: "24px 28px", border: `1px solid rgba(53,77,151,0.2)`, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
            <div style={{ fontFamily: "monospace", fontSize: "9px", color: BLK_DIM, letterSpacing: "3px", marginBottom: "12px" }}>WEATHER INTELLIGENCE</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "40px" }}>{cfg.icon}</span>
                    <div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "48px", color: BLK, lineHeight: 1 }}>{temp}°C</div>
                        <div style={{ fontWeight: "800", fontSize: "13px", color: "rgba(0,0,0,0.7)", letterSpacing: "2px" }}>{cfg.label}</div>
                    </div>
                </div>
                <div style={{ background: `rgba(53,77,151,0.12)`, padding: "8px 14px", borderRadius: "8px", border: `1px solid rgba(53,77,151,0.2)` }}>
                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "2px", marginBottom: "3px" }}>PITCH</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "15px", color: BLUE, letterSpacing: "1.5px" }}>{pitch || "DRY / FAST"}</div>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("analytics");
    const [showLanding, setShowLanding] = useState(() => !localStorage.getItem("cricintel_visited"));
    const [liveMatches, setLiveMatches] = useState(MOCK_MATCHES);
    const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0]);
    const [pred, setPred] = useState(MOCK_PREDICTION);
    const [liveDataStatus, setLiveDataStatus] = useState("connecting"); // connecting | live | mock
    const [loading, setLoading] = useState(true);
    const [mediaSubTab, setMediaSubTab] = useState("videos");
    const [signalModal, setSignalModal] = useState(false);
    const [ticker, setTicker] = useState(0);
    const [liveTime, setLiveTime] = useState(new Date());
    const [isPremium, setIsPremium] = useState(() => localStorage.getItem("cricintel_premium") === "true");
    const [showPaywall, setShowPaywall] = useState(false);
    const [userEmail, setUserEmail] = useState(() => localStorage.getItem("cricintel_email") || "");
    const [emailInput, setEmailInput] = useState("");
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [paymentStep, setPaymentStep] = useState("plans");
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

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        const isPrem = params.get("premium");
        if (isPrem === "true") {
            setIsPremium(true);
            localStorage.setItem("cricintel_premium", "true");
            window.history.replaceState({}, "", window.location.pathname);
            if (sessionId) {
                fetch(`${API_BASE}/verify-session?session_id=${sessionId}`)
                    .then(r => r.json()).then(d => { if (d.email) { localStorage.setItem("cricintel_email", d.email); setUserEmail(d.email); } })
                    .catch(() => { });
            }
        }
    }, []);

    const handleCheckout = async (plan) => {
        setCheckingPayment(true);
        try {
            const res = await fetch(`${API_BASE}/create-checkout-session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, email: emailInput }) });
            const data = await res.json();
            if (data.url) { window.location.href = data.url; } else { alert("Payment error: " + (data.error || "Unknown error")); }
        } catch { alert("Could not connect to payment server. Make sure app_v4.py is running."); } finally { setCheckingPayment(false); }
    };

    const fetchPred = useCallback(async () => {
        try { const r = await fetch(`${API_BASE}/predict`); if (r.ok) setPred(await r.json()); }
        catch { try { const r = await fetch(`${C_API}/live-match`); if (r.ok) { const d = await r.json(); setPred(p => ({ ...p, ...d })); } } catch { } }
    }, []);
    useEffect(() => { fetchPred(); }, [fetchPred, ticker]);

    // ── CricketData.org live matches ─────────────────────────────────────────
    const fetchLiveMatches = useCallback(async () => {
        try {
            const r = await fetch(`${API_BASE}/matches`);
            const d = await r.json();
            const list = Array.isArray(d) ? d : d.data || [];
            if (list.length) {
                setLoading(false);
                const mapped = list.slice(0, 6).map((m, i) => ({
                    id: m.id || i,
                    t1: cleanTeam(m.team1 || m.teams?.[0] || "TBD"),
                    t2: cleanTeam(m.team2 || m.teams?.[1] || "TBD"),
                    t1Full: m.team1 || m.teams?.[0] || "",
                    t2Full: m.team2 || m.teams?.[1] || "",
                    status: m.status?.includes("won") ? "ENDED" : m.matchStarted && !m.matchEnded ? "LIVE" : "UPCOMING",
                    day: m.matchType?.toUpperCase() || "T20",
                    detail: m.name || "",
                    t1Score: m.score?.[0]?.r ?? null,
                    t2Score: m.score?.[1]?.r ?? null,
                    t1Wkts: m.score?.[0]?.w ?? null,
                    t2Wkts: m.score?.[1]?.w ?? null,
                    matchId: m.id,
                }));
                setLiveMatches(mapped);
                setLiveDataStatus("live");
                const liveOne = mapped.find(m => m.status === "LIVE");
                if (liveOne) setSelectedMatch(liveOne);
            }
        } catch { setLiveDataStatus("mock"); setLoading(false); }
    }, []);

    // ── Fetch scorecard for selected match ──────────────────────────────────
    const fetchMatchScore = useCallback(async (matchId) => {
        if (!matchId) return;
        try {
            const r = await fetch(`${C_API}/scorecard/${matchId}`);
            const d = await r.json();
            if (d.status === "success" && d.data) {
                const md = d.data;
                const t1 = md.teams?.[0] || "";
                const t2 = md.teams?.[1] || "";
                const s0 = md.scorecard?.[0];
                const s1 = md.scorecard?.[1];
                setPred(p => ({
                    ...p,
                    team1: t1, team2: t2,
                    score: s0?.innings?.runs ?? p.score,
                    wickets: s0?.innings?.wickets ?? p.wickets,
                    overs: s0?.innings?.overs ?? p.overs,
                    displayScore: s0 ? `${s0.innings.runs}/${s0.innings.wickets} (${s0.innings.overs} ov)` : p.displayScore,
                    venue: md.venue || p.venue,
                    matchType: md.matchType || p.matchType,
                }));
            }
        } catch { }
    }, []);

    useEffect(() => { fetchLiveMatches(); }, [fetchLiveMatches]);
    // Refresh every 5 minutes
    useEffect(() => {
        const t = setInterval(() => { fetchLiveMatches(); }, 5 * 60 * 1000);
        return () => clearInterval(t);
    }, [fetchLiveMatches]);
    // Fetch scorecard when match changes
    useEffect(() => {
        if (selectedMatch?.matchId) fetchMatchScore(selectedMatch.matchId);
        // Also fetch fresh prediction for this match venue
        if (selectedMatch?.detail) {
            fetch(`${API_BASE}/predict?venue=${encodeURIComponent(selectedMatch.detail)}`)
                .then(r => r.ok ? r.json() : null)
                .then(d => { if (d && !d.error) setPred(d); })
                .catch(() => { });
        }
    }, [selectedMatch, fetchMatchScore]);

    const prob = pred.aiProbability || 68;

    // ── Landing Page ──────────────────────────────────────────────────────────
    if (showLanding) {
        return (
            <div style={{ minHeight: "100vh", background: BLUE, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", fontFamily: "'Barlow Condensed', sans-serif" }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&display=swap');
                @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                .land-btn{transition:all .2s;} .land-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3);}
                `}</style>

                {/* Logo */}
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "4px", color: MUSTARD, marginBottom: "40px", animation: "fadeUp .5s ease" }}>
                    CRIC<span style={{ color: "white" }}>INTELLIGENCE</span>
                </div>

                {/* Hero */}
                <div style={{ textAlign: "center", maxWidth: "560px", animation: "fadeUp .6s ease" }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 8vw, 72px)", color: "white", lineHeight: 1.05, marginBottom: "20px" }}>
                        KNOW WHO WINS<br />
                        <span style={{ color: MUSTARD }}>BEFORE THE OVER ENDS</span>
                    </div>
                    <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "40px" }}>
                        AI-powered over-by-over predictions for every live cricket match.
                        Built on 1.7M data points across 877 venues worldwide.
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "40px" }}>
                        {[["🎯", "78.2% Accuracy"], ["📊", "1.7M Data Points"], ["⚡", "Real-time Updates"], ["🌍", "877 Venues"]].map(([icon, label]) => (
                            <div key={label} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "20px", padding: "8px 16px", fontSize: "13px", color: "white", display: "flex", gap: "6px", alignItems: "center" }}>
                                <span>{icon}</span><span>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Email capture + CTA */}
                    <div style={{ marginBottom: "14px" }}>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                            <input
                                type="email"
                                placeholder="Enter your email for IPL alerts"
                                id="landing-email"
                                style={{ flex: 1, padding: "14px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.1)", color: "white", fontFamily: "monospace", fontSize: "13px", outline: "none" }}
                            />
                        </div>
                        <button className="land-btn" onClick={() => {
                            const email = document.getElementById("landing-email")?.value;
                            if (email) localStorage.setItem("cricintel_email", email);
                            localStorage.setItem("cricintel_visited", "1");
                            setShowLanding(false);
                        }}
                            style={{ background: MUSTARD, color: BLK, border: "none", borderRadius: "12px", padding: "18px 48px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", letterSpacing: "3px", cursor: "pointer", display: "block", width: "100%" }}>
                            VIEW LIVE PREDICTIONS →
                        </button>
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Free to use · No sign up required · Get IPL alerts</div>
                </div>

                {/* Sample prediction card */}
                <div style={{ marginTop: "48px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "16px", padding: "24px 28px", maxWidth: "400px", width: "100%", animation: "fadeUp .8s ease" }}>
                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: MUSTARD, letterSpacing: "3px", marginBottom: "12px" }}>🟢 LIVE PREDICTION EXAMPLE</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "white", marginBottom: "8px" }}>INDIA vs AUSTRALIA</div>
                    <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: "16px" }}>
                        Our AI gives <strong style={{ color: MUSTARD }}>India a 68% chance of winning</strong> based on current pitch conditions, scoring rate and historical head-to-head data.
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        {[["Next over", "9–11 runs"], ["Wicket risk", "Low (18%)"], ["Phase", "Death overs"]].map(([k, v]) => (
                            <div key={k} style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "10px 8px", textAlign: "center" }}>
                                <div style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(255,255,255,0.4)", letterSpacing: "1px", marginBottom: "4px" }}>{k}</div>
                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "white" }}>{v}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", color: BLK, overflowX: "hidden" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: ${BLUE}; }
        ::-webkit-scrollbar-thumb { background: ${MUSTARD}; border-radius: 2px; }

        @keyframes tickerMove { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.5)} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes popIn { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 8px rgba(200,150,30,0.4)} 50%{box-shadow:0 0 22px rgba(200,150,30,0.9)} }

        .fade-up { animation: fadeUp .45s ease forwards; }
        .ticker-inner { display:inline-block; animation: tickerMove 30s linear infinite; white-space:nowrap; }
        .ticker-inner:hover { animation-play-state:paused; }

        .skeleton { background: linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.12) 50%, rgba(0,0,0,0.06) 75%);
            background-size: 400px 100%; animation: shimmer 1.4s infinite; border-radius: 6px; }

        .tip-wrap { position:relative; display:inline-flex; align-items:center; cursor:help; }
        .tip-wrap .tip { position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%);
            background:#111; color:#fff; font-size:10px; font-family:monospace; letter-spacing:0.5px;
            padding:6px 10px; border-radius:6px; white-space:nowrap; opacity:0; pointer-events:none;
            transition:opacity .2s; z-index:999; box-shadow:0 4px 16px rgba(0,0,0,0.4); }
        .tip-wrap .tip::after { content:''; position:absolute; top:100%; left:50%; transform:translateX(-50%);
            border:5px solid transparent; border-top-color:#111; }
        .tip-wrap:hover .tip { opacity:1; }

        .over-card { transition:all .25s; border-radius:12px; padding:14px; cursor:pointer; border:1px solid rgba(0,0,0,0.06); }
        .over-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.18); border-color:rgba(0,0,0,0.15); }

        .premium-badge { background:linear-gradient(135deg,#c8961e,#f5c842); color:#000; font-size:8px;
            font-family:monospace; font-weight:700; letter-spacing:2px; padding:2px 8px; border-radius:20px; }

        /* TICKER — blue */
        .ticker-blue { background: ${BLUE}; }

        /* NAVBAR + SIDEBARS — mustard */
        .nav-mustard { background: ${MUSTARD}; border-bottom: 2px solid rgba(0,0,0,0.12); }
        .sidebar-mustard { background: ${MUSTARD}; border-right: 2px solid rgba(0,0,0,0.12); }
        .sidebar-right-mustard { background: ${MUSTARD}; border-left: 2px solid rgba(0,0,0,0.12); }

        /* MAIN CONTENT — blue */
        .main-blue { background: ${BLUE}; }

        /* CARDS on blue bg */
        .card-on-blue { background: ${CARD_BG}; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); }

        .match-row { transition: all .25s; border-radius: 12px; cursor: pointer; border: 1px solid transparent; padding: 13px 15px; margin-bottom: 6px; }
        .match-row:hover { background: rgba(0,0,0,0.08) !important; border-color: rgba(0,0,0,0.15) !important; transform: translateX(3px); }
        .match-row.sel { background: rgba(0,0,0,0.12) !important; border-color: rgba(0,0,0,0.2) !important; border-left: 3px solid ${BLK} !important; }

        .signal-btn { background: ${BLK}; color: ${MUSTARD}; border: none; border-radius: 12px; width: 100%; padding: 18px; font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 4px; cursor: pointer; transition: all .3s; }
        .signal-btn:hover { background: #1a1a1a; transform: scale(1.02); box-shadow: 0 8px 28px rgba(0,0,0,0.35); }

        .nav-tab { background:none; border:none; cursor:pointer; font-family:inherit; font-size:13px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; padding: 4px 0; transition: all .2s; position: relative; color: ${BLK}; }
        .nav-tab.on { color: ${BLK}; }
        .nav-tab.on::after { content:''; position:absolute; bottom:-2px; left:0; right:0; height:2px; background:${BLK}; border-radius:1px; }
        .nav-tab:not(.on) { color: rgba(0,0,0,0.4); }
        .nav-tab:hover { color: ${BLK} !important; }

        .sub-tab { font-family:inherit; font-size:11px; font-weight:800; letter-spacing:2px; border:none; cursor:pointer; padding:9px 22px; border-radius:8px; transition:all .2s; }

        .media-card { transition:all .3s; border-radius:14px; overflow:hidden; cursor:pointer; }
        .media-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.25); }
        .news-row { transition:all .2s; border-radius:12px; cursor:pointer; }
        .news-row:hover { transform:translateX(4px); }

        /* ── TOOLTIP ── */
        .tip { position:relative; cursor:help; }
        .tip::after { content:attr(data-tip); position:absolute; bottom:calc(100% + 8px); left:50%; transform:translateX(-50%); background:#111; color:#fff; font-family:monospace; font-size:10px; letter-spacing:.5px; white-space:nowrap; padding:5px 10px; border-radius:6px; pointer-events:none; opacity:0; transition:opacity .2s; z-index:999; }
        .tip::before { content:''; position:absolute; bottom:calc(100% + 2px); left:50%; transform:translateX(-50%); border:5px solid transparent; border-top-color:#111; pointer-events:none; opacity:0; transition:opacity .2s; z-index:999; }
        .tip:hover::after, .tip:hover::before { opacity:1; }

        /* ── LOADING SKELETON ── */
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        .skeleton { background:linear-gradient(90deg,rgba(255,255,255,0.1) 25%,rgba(255,255,255,0.25) 50%,rgba(255,255,255,0.1) 75%); background-size:400px 100%; animation:shimmer 1.4s infinite; border-radius:6px; }

        /* ── PREMIUM GLOW ── */
        @keyframes premiumGlow { 0%,100%{box-shadow:0 0 20px rgba(200,150,30,0.3)} 50%{box-shadow:0 0 40px rgba(200,150,30,0.7)} }
        .premium-glow { animation:premiumGlow 2.5s ease-in-out infinite; }

        /* ── OVER CARD HOVER ── */
        .over-card { transition:all .25s; cursor:default; }
        .over-card:hover { transform:translateY(-6px) scale(1.03); box-shadow:0 12px 32px rgba(0,0,0,0.3) !important; z-index:2; }

        /* ── STAT BAR ── */
        @keyframes barFill { from{width:0} }
        .stat-bar-fill { animation:barFill 1.2s cubic-bezier(.4,0,.2,1) forwards; }

        /* ── PULSE RING on LIVE ── */
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.2);opacity:0} }
        .live-ring { position:relative; display:inline-block; }
        .live-ring::before { content:''; position:absolute; inset:-3px; border-radius:50%; background:#e74c3c; animation:pulseRing 1.8s ease-out infinite; }

        /* ── CARD ENTRANCE ── */
        @keyframes cardIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card-in { animation:cardIn .5s ease forwards; }
        .card-in:nth-child(2){animation-delay:.1s}
        .card-in:nth-child(3){animation-delay:.2s}
        .card-in:nth-child(4){animation-delay:.3s}
      `}</style>

            {/* ── TICKER — BLUE ─────────────────────────────────────────────────── */}
            <div className="ticker-blue" style={{ padding: "8px 0", overflow: "hidden", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                <div className="ticker-inner">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span key={i} style={{ color: BLK, fontFamily: "monospace", fontSize: "10px", fontWeight: "700", marginRight: "60px", letterSpacing: "1.5px" }}>{item}</span>
                    ))}
                </div>
            </div>

            {/* ── NAVBAR — MUSTARD ──────────────────────────────────────────────── */}
            <nav className="nav-mustard" style={{ padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "62px", position: "sticky", top: 0, zIndex: 99, boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", letterSpacing: "2px", color: BLK }}>
                    Cric<span style={{ color: BLK }}>Intelligence</span>
                </div>
                <div style={{ display: "flex", gap: "32px" }}>
                    {[["analytics", "ANALYTICS"], ["media", "MEDIA"]].map(([key, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`nav-tab ${activeTab === key ? "on" : ""}`}>{label}</button>
                    ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#2ecc71", animation: "livePulse 2s infinite" }} />
                        <span style={{ fontFamily: "monospace", fontSize: "10px", color: BLK, letterSpacing: "2.5px", fontWeight: "700" }}>LIVE</span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "12px", color: BLK, fontWeight: "700" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                </div>
            </nav>

            {/* ══ ANALYTICS TAB ══════════════════════════════════════════════════ */}
            {activeTab === "analytics" && (
                <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "272px 1fr 280px", minHeight: "calc(100vh - 94px)" }}>

                    {/* LEFT SIDEBAR — MUSTARD */}
                    <aside className="sidebar-mustard" style={{ padding: "24px 18px", overflowY: "auto" }}>
                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK, letterSpacing: "4px", marginBottom: "16px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            LIVE MATCHES
                            <span style={{ fontSize: "7px", letterSpacing: "1px", color: liveDataStatus === "live" ? "#2ecc71" : liveDataStatus === "connecting" ? MUSTARD : "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: "4px" }}>
                                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: liveDataStatus === "live" ? "#2ecc71" : liveDataStatus === "connecting" ? MUSTARD : "rgba(0,0,0,0.3)", display: "inline-block" }} />
                                {liveDataStatus === "live" ? "LIVE DATA" : liveDataStatus === "connecting" ? "LOADING" : "MOCK"}
                            </span>
                        </div>
                        {liveDataStatus === "connecting" ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="match-row" style={{ background: "rgba(255,255,255,0.4)", marginBottom: "6px" }}>
                                    <div className="skeleton" style={{ height: "10px", width: "60%", marginBottom: "10px" }} />
                                    <div className="skeleton" style={{ height: "14px", width: "80%", marginBottom: "6px" }} />
                                    <div className="skeleton" style={{ height: "14px", width: "70%" }} />
                                </div>
                            ))
                        ) : liveMatches.map(m => (
                            <div key={m.id} onClick={() => setSelectedMatch(m)} className={`match-row ${selectedMatch.id === m.id ? "sel" : ""}`}
                                style={{ background: selectedMatch.id === m.id ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)" }}>
                                {/* Header: status + format */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(0,0,0,0.45)", letterSpacing: "2px" }}>{m.detail}</span>
                                    <span style={{
                                        fontFamily: "monospace", fontSize: "7px", fontWeight: "700", padding: "2px 7px", borderRadius: "20px",
                                        background: m.status === "LIVE" ? "rgba(192,57,43,0.12)" : "rgba(0,0,0,0.08)",
                                        color: m.status === "LIVE" ? "#c0392b" : "rgba(0,0,0,0.5)",
                                        border: m.status === "LIVE" ? "1px solid rgba(192,57,43,0.25)" : "1px solid rgba(0,0,0,0.1)"
                                    }}>{m.status === "LIVE" ? "🔴 LIVE" : m.status}</span>
                                </div>
                                {/* Team rows ESPN style */}
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                    {[{ name: m.t1, score: m.t1Score, wkts: m.t1Wkts, bold: true }, { name: m.t2, score: m.t2Score, wkts: m.t2Wkts, bold: false }].map(({ name, score, wkts, bold }) => (
                                        <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                                <TeamLogo name={name} size={22} />
                                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", letterSpacing: "0.5px", color: bold ? BLK : "rgba(0,0,0,0.5)" }}>{name}</span>
                                            </div>
                                            {score != null && (
                                                <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: bold ? "700" : "400", color: bold ? BLK : "rgba(0,0,0,0.4)" }}>
                                                    {wkts != null ? `${score}/${wkts}` : score}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "1px" }}>{m.day}</div>
                            </div>
                        ))}
                        <div style={{ marginTop: "24px", padding: "16px", background: "rgba(0,0,0,0.1)", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.12)" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK, letterSpacing: "3px", marginBottom: "12px", fontWeight: "700" }}>RUNS TREND</div>
                            <Sparkline data={pred.overHistory || MOCK_PREDICTION.overHistory} />
                        </div>
                    </aside>

                    {/* MAIN — BLUE */}
                    <main className="main-blue" style={{ padding: "36px 44px", overflowY: "auto" }}>

                        {/* Match heading */}
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.5)", letterSpacing: "4px", marginBottom: "12px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <span className="live-ring" style={{ width: "6px", height: "6px", background: "#2ecc71", borderRadius: "50%", display: "inline-block" }} />
                                NEURAL MATCH PROTOCOL ACTIVE
                            </div>
                            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(24px,3.2vw,52px)", letterSpacing: "2px", lineHeight: 1.05, wordBreak: "break-word" }}>
                                <span style={{ color: BLK, display: "inline-flex", alignItems: "center", gap: "10px", verticalAlign: "middle" }}>
                                    <TeamLogo name={(pred.team1 || "india").toLowerCase()} size={48} />
                                    {cleanTeam(pred.team1 || "INDIA")}
                                </span>
                                <span style={{ color: "rgba(0,0,0,0.2)", fontSize: "0.4em", margin: "0 16px", verticalAlign: "middle" }}>vs</span>
                                <span style={{ color: "rgba(0,0,0,0.4)", display: "inline-flex", alignItems: "center", gap: "10px", verticalAlign: "middle" }}>
                                    {cleanTeam(pred.team2 || "AUSTRALIA")}
                                    <TeamLogo name={(pred.team2 || "australia").toLowerCase()} size={48} />
                                </span>
                            </h1>
                            {pred.venue && <div style={{ marginTop: "6px", fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)", letterSpacing: "2px" }}>{pred.venue.toUpperCase()}</div>}
                            <button onClick={() => {
                                const text = `🏏 ${cleanTeam(pred.team1 || "India")} vs ${cleanTeam(pred.team2 || "Australia")} — AI gives ${prob}% win probability to ${cleanTeam(pred.team1 || "India")}. Live predictions at CricIntelligence.`;
                                navigator.clipboard?.writeText(text).then(() => alert("Copied! Share this prediction 🏏"));
                            }} style={{ marginTop: "10px", background: "transparent", border: `1px solid rgba(255,255,255,0.3)`, borderRadius: "20px", padding: "5px 16px", fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)", cursor: "pointer", letterSpacing: "1px" }}>
                                📤 SHARE PREDICTION
                            </button>
                            {/* Live score strip */}
                            {pred.displayScore && (
                                <div style={{ marginTop: "14px", display: "inline-flex", gap: "20px", background: "rgba(0,0,0,0.15)", borderRadius: "30px", padding: "6px 20px" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "11px", fontWeight: "700", color: BLK, letterSpacing: "1px" }}>{pred.displayScore}</span>
                                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(0,0,0,0.4)" }}>CRR {pred.currentRunRate || "5.1"}</span>
                                    <span className="tip" data-tip="Runs needed per over to win" style={{ fontFamily: "monospace", fontSize: "11px", color: MUSTARD.replace("#c8", "#a0"), fontWeight: "700" }}>RRR {pred.requiredRunRate || "—"}</span>
                                </div>
                            )}
                        </div>

                        {/* 2-col cards */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>

                            {/* Score Engine */}
                            <div className="card-on-blue card-in" style={{ padding: "28px", position: "relative", overflow: "hidden" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                    <div className="tip" data-tip="AI-calculated win probability based on current score, pitch & conditions" style={{ fontFamily: "monospace", fontSize: "9px", color: BLK_DIM, letterSpacing: "3px" }}>SCORE ENGINE ⓘ</div>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: prob >= 65 ? "#2e7d32" : prob >= 45 ? MUSTARD : "#c0392b", letterSpacing: "1px" }}>
                                        {prob >= 65 ? "🟢 WINNING" : prob >= 45 ? "🟡 CLOSE GAME" : "🔴 UNDER PRESSURE"}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "14px 0", gap: "4px" }}>
                                    <div style={{ textAlign: "center", flex: 1 }}>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,4.5vw,68px)", color: BLK, lineHeight: 1 }}>{pred.score || 350}</div>
                                        <div style={{ fontSize: "9px", color: BLK_DIM, letterSpacing: "2px", marginTop: "4px" }}>{cleanTeam(pred.team1 || "INDIA")}</div>
                                    </div>
                                    <div style={{ textAlign: "center", flexShrink: 0 }}>
                                        <ProbArc value={prob} />
                                    </div>
                                    <div style={{ textAlign: "center", flex: 1 }}>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px,4.5vw,68px)", color: "rgba(0,0,0,0.35)", lineHeight: 1 }}>{pred.wickets !== undefined ? `${pred.score}/${pred.wickets}` : "210"}</div>
                                        <div style={{ fontSize: "9px", color: "rgba(0,0,0,0.35)", letterSpacing: "2px", marginTop: "4px" }}>{cleanTeam(pred.team2 || "AUSTRALIA")}</div>
                                    </div>
                                </div>
                                {/* Plain English summary */}
                                <div style={{ background: "rgba(0,0,0,0.06)", borderRadius: "10px", padding: "10px 14px", marginTop: "8px" }}>
                                    <div style={{ fontFamily: "monospace", fontSize: "10px", color: BLK, lineHeight: 1.6 }}>
                                        Our AI gives <strong>{cleanTeam(pred.team1 || "INDIA")}</strong> a <strong>{prob}% chance of winning</strong> based on current score, pitch conditions and historical data from {pred.dataSource?.split("·")[0]?.trim() || "877 venues"}.
                                        {prob >= 65 ? " They are in a strong position." : prob >= 45 ? " It's a closely contested match." : " They need to turn things around quickly."}
                                    </div>
                                </div>
                            </div>

                            {/* Strategic Data Nodes */}
                            <div className="card-on-blue card-in" style={{ padding: "24px 28px" }}>
                                <div className="tip" data-tip="AI-detected team strengths and vulnerabilities for this match" style={{ fontFamily: "monospace", fontSize: "9px", color: BLK_DIM, letterSpacing: "3px", marginBottom: "18px", cursor: "help" }}>STRATEGIC DATA NODES ⓘ</div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, fontWeight: "700", letterSpacing: "2px", marginBottom: "10px", padding: "3px 10px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "4px", display: "inline-block" }}>STRENGTHS</div>
                                        {(pred.strengths || MOCK_PREDICTION.strengths).map((s, i) => (
                                            <div key={i} style={{ fontSize: "11px", fontWeight: "700", color: BLK, marginBottom: "7px", letterSpacing: "0.5px" }}>
                                                <span style={{ color: "rgba(0,0,0,0.35)", marginRight: "6px" }}>+</span>{s}
                                            </div>
                                        ))}
                                    </div>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#c0392b", fontWeight: "700", letterSpacing: "2px", marginBottom: "10px", padding: "3px 10px", border: "1px solid rgba(192,57,43,0.3)", borderRadius: "4px", display: "inline-block" }}>WEAKNESS</div>
                                        {(pred.weaknesses || MOCK_PREDICTION.weaknesses).map((w, i) => (
                                            <div key={i} style={{ fontSize: "11px", fontWeight: "700", color: BLK, marginBottom: "7px", letterSpacing: "0.5px" }}>
                                                <span style={{ color: "#c0392b", marginRight: "6px" }}>−</span>{w}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="signal-btn" onClick={() => isPremium ? setSignalModal(true) : setShowPaywall(true)}>
                                    GET PREDICTIONS — £9.99/mo
                                </button>
                            </div>

                            {/* Weather Box */}
                            <WeatherBox condition={pred.weather?.condition || "SUNNY"} temp={pred.weather?.temp || 28} pitch={pred.pitchLabel || "DRY / FAST"} />

                            {/* 18+ Warning */}
                            <div className="card-on-blue" style={{ padding: "24px 28px", display: "flex", alignItems: "center", gap: "18px" }}>
                                <div style={{ width: "52px", height: "52px", border: "2px solid rgba(192,57,43,0.6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: "#c0392b", letterSpacing: "1px" }}>18+</span>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "800", letterSpacing: "2px", color: "#c0392b", marginBottom: "6px" }}>FINANCIAL RISK WARNING</div>
                                    <div style={{ fontSize: "11px", color: BLK_DIM, lineHeight: "1.6" }}>
                                        Predictions based on 95% AI accuracy. Market conditions vary. Please play responsibly. BeGambleAware.org
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status bar */}
                        <div style={{ marginTop: "18px", padding: "12px 18px", background: "rgba(0,0,0,0.1)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#2ecc71", animation: "livePulse 2s infinite" }} />
                                <span style={{ fontFamily: "monospace", fontSize: "9px", color: BLK, letterSpacing: "2px" }}>{pred.aiWeather || "LIVE · DRY/SPIN DETECTED"}</span>
                            </div>
                            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)", letterSpacing: "1px" }}>{pred.dataSource || "877 venues · 1.7M records · 67.3%"}</span>
                        </div>

                        {/* ── OVER-BY-OVER PREDICTION ENGINE ── */}
                        <div style={{ marginTop: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", color: BLK, letterSpacing: "2px" }}>OVER-BY-OVER PREDICTION</div>
                                    <div style={{ background: BLK, color: MUSTARD, fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 10px", borderRadius: "20px" }}>AI ENGINE v4</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)", letterSpacing: "1px" }}>PHASE:</span>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: BLK }}>{pred.phaseEmoji || "🟡"} {pred.currentPhase || "MIDDLE OVERS"}</span>
                                </div>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "10px", marginBottom: "18px" }}>
                                {(pred.nextOvers || []).map((ov, i) => {
                                    const runsMsg = ov.expectedRuns >= 10 ? "High scoring" : ov.expectedRuns >= 8 ? "Good scoring" : "Steady over";
                                    const wicketMsg = ov.wicketProb > 40 ? "⚠️ Wicket likely" : ov.wicketProb > 25 ? "Wicket possible" : "Safe batting";
                                    const wicketColor = ov.wicketProb > 40 ? "#c0392b" : ov.wicketProb > 25 ? "#c8961e" : "#2e7d32";
                                    const confMsg = ov.confidence >= 80 ? "High confidence" : ov.confidence >= 60 ? "Moderate" : "Low confidence";
                                    return (
                                        <div key={i} className="over-card" style={{
                                            background: CARD_BG,
                                            border: i === 0 ? `2px solid rgba(53,77,151,0.5)` : `1px solid rgba(53,77,151,0.15)`,
                                            borderRadius: "14px", padding: "14px 10px", textAlign: "center",
                                            transform: i === 0 ? "translateY(-4px)" : "none",
                                            position: "relative", overflow: "hidden",
                                            boxShadow: i === 0 ? "0 6px 20px rgba(0,0,0,0.25)" : "0 2px 8px rgba(0,0,0,0.1)",
                                        }}>
                                            {i === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${BLUE}, ${MUSTARD})`, borderRadius: "14px 14px 0 0" }} />}
                                            {/* Over number */}
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "2px", marginBottom: "2px" }}>OVER {ov.over}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "7px", fontWeight: "700", letterSpacing: "1px", marginBottom: "10px", color: ov.phase === "POWERPLAY" ? BLUE : ov.phase === "DEATH OVERS" ? "#c0392b" : MUSTARD }}>{ov.phaseEmoji} {ov.phase}</div>

                                            {/* Expected runs — big + plain */}
                                            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "38px", color: BLK, lineHeight: 1 }}>{ov.runRange}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "1px", marginBottom: "6px" }}>runs expected</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK, fontWeight: "700", marginBottom: "10px" }}>{runsMsg}</div>

                                            {/* Wicket risk */}
                                            <div style={{ background: "rgba(0,0,0,0.07)", borderRadius: "8px", padding: "6px 4px", marginBottom: "6px" }}>
                                                <div style={{ fontFamily: "monospace", fontSize: "9px", color: wicketColor, fontWeight: "700", marginBottom: "2px" }}>{wicketMsg}</div>
                                                <div style={{ fontFamily: "monospace", fontSize: "7px", color: BLK_DIM }}>{ov.wicketProb}% chance</div>
                                            </div>

                                            {/* Confidence */}
                                            <div style={{ fontFamily: "monospace", fontSize: "7px", color: BLK_DIM }}>{confMsg} · {ov.confidence}%</div>

                                            {i > 0 && !isPremium && (
                                                <div onClick={() => setShowPaywall(true)} style={{ position: "absolute", inset: 0, borderRadius: "14px", background: `rgba(220,232,255,0.92)`, backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: "4px", zIndex: 10 }}>
                                                    <div style={{ fontSize: "22px" }}>🔒</div>
                                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", color: BLK, letterSpacing: "2px" }}>PREMIUM</div>
                                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "1px" }}>£9.99/mo</div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Strategy tips */}
                            <div onClick={() => !isPremium && setShowPaywall(true)}
                                style={{ background: "rgba(0,0,0,0.1)", borderRadius: "12px", padding: "14px 18px", marginBottom: "18px", position: "relative", cursor: isPremium ? "default" : "pointer" }}>
                                {!isPremium && <div style={{ position: "absolute", inset: 0, borderRadius: "12px", backdropFilter: "blur(4px)", background: "rgba(220,232,255,0.75)", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", zIndex: 2 }}>
                                    <span style={{ fontSize: "18px" }}>🔒</span>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: BLK, letterSpacing: "2px" }}>UNLOCK STRATEGY INTEL — £9.99/mo</span>
                                </div>}
                                <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "3px", marginBottom: "10px" }}>💡 WHAT TO WATCH FOR</div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "8px" }}>
                                    {(pred.nextOvers || []).slice(0, 3).map((ov, i) => (
                                        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.3)", flexShrink: 0 }}>OV{ov.over}</span>
                                            <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.55)", lineHeight: 1.5 }}>{ov.tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Pitch + Weather + Phase */}
                            <div style={{ position: "relative" }} onClick={() => !isPremium && setShowPaywall(true)}>
                                {!isPremium && <div style={{ position: "absolute", inset: 0, borderRadius: "12px", backdropFilter: "blur(5px)", background: "rgba(220,232,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", zIndex: 4, cursor: "pointer" }}>
                                    <span style={{ fontSize: "24px" }}>🔒</span>
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: BLK, letterSpacing: "2px" }}>PREMIUM INTEL</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: BLK_DIM, letterSpacing: "1px" }}>Pitch wear · Weather · Phase analysis</div>
                                    </div>
                                </div>}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                                    {/* Pitch Deterioration */}
                                    <div style={{ background: CARD_BG, borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "2.5px", marginBottom: "10px" }}>PITCH WEAR</div>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color: BLK, marginBottom: "4px" }}>{pred.pitchCondition || "SHOWING WEAR"}</div>
                                        <div style={{ marginBottom: "8px" }}>
                                            <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                                                <div style={{ height: "100%", borderRadius: "4px", width: `${Math.min(((pred.deteriorationFactor || 1) - 1) * 400, 100)}%`, background: (pred.deteriorationFactor || 1) > 1.2 ? "#c0392b" : (pred.deteriorationFactor || 1) > 1.1 ? MUSTARD : "#2e7d32", transition: "width 1.5s ease" }} />
                                            </div>
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: BLK_DIM }}>Factor ×{pred.deteriorationFactor || 1.08} · {pred.pitchEmoji || "⚖️"} {pred.pitchLabel || "DRY/FAST"}</div>
                                    </div>
                                    {/* Weather Impact */}
                                    <div style={{ background: CARD_BG, borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "2.5px", marginBottom: "10px" }}>WEATHER IMPACT</div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                                            <span style={{ fontSize: "24px" }}>{pred.weatherImpact?.emoji || "☀️"}</span>
                                            <div>
                                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: BLK }}>{pred.weather?.condition || "SUNNY"} · {pred.weather?.temp || 28}°C</div>
                                                <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM }}>💧 {pred.weather?.humidity || 55}% · 💨 {pred.weather?.wind_speed || 10}km/h</div>
                                            </div>
                                        </div>
                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "6px" }}>
                                            {[["SWING", `×${pred.weatherImpact?.swingFactor || 1.0}`], ["DEW RISK", pred.weatherImpact?.dewFactor < 0.9 ? "HIGH ⚠️" : "LOW ✅"]].map(([l, v]) => (
                                                <div key={l} style={{ background: "rgba(0,0,0,0.07)", borderRadius: "6px", padding: "5px 8px", textAlign: "center" }}>
                                                    <div style={{ fontFamily: "monospace", fontSize: "7px", color: BLK_DIM, letterSpacing: "1px" }}>{l}</div>
                                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: BLK }}>{v}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, lineHeight: 1.5 }}>{pred.weatherImpact?.tip || "Clear conditions."}</div>
                                    </div>
                                    {/* Phase Analysis */}
                                    <div style={{ background: CARD_BG, borderRadius: "12px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, letterSpacing: "2.5px", marginBottom: "10px" }}>PHASE ANALYSIS</div>
                                        <div style={{ marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: "8px", fontWeight: "700", color: BLUE, letterSpacing: "1px" }}>🔵 POWERPLAY</span>
                                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", color: BLK }}>EXP: {pred.powerplay?.expectedScore || 58}/{pred.powerplay?.expectedWkts || 1.8}</span>
                                            </div>
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, lineHeight: 1.5 }}>RR {pred.powerplay?.expectedRR || 5.8} · {pred.powerplay?.advantage || "BATTING"} ADVANTAGE</div>
                                        </div>
                                        <div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                                <span style={{ fontFamily: "monospace", fontSize: "8px", fontWeight: "700", color: "#c0392b", letterSpacing: "1px" }}>🔴 DEATH OVERS</span>
                                                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "13px", color: BLK }}>EXP: +{pred.deathOvers?.expectedRuns || 65}</span>
                                            </div>
                                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM, lineHeight: 1.5 }}>RR {pred.deathOvers?.expectedRR || 7.2} · {pred.deathOvers?.oversLeft || 9} overs left</div>
                                            {pred.deathOvers?.dewImpact && (
                                                <div style={{ marginTop: "4px", background: "rgba(192,57,43,0.08)", borderRadius: "6px", padding: "4px 8px" }}>
                                                    <span style={{ fontFamily: "monospace", fontSize: "8px", color: "#c0392b" }}>⚠️ DEW EXPECTED — spin grip reduced</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                    {/* RIGHT SIDEBAR — MUSTARD */}
                    <aside className="sidebar-right-mustard" style={{ padding: "24px 18px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: BLK, letterSpacing: "3px", marginBottom: "18px", fontWeight: "700" }}>AI MODEL METRICS</div>
                        {[
                            ["MODEL ACCURACY", 78, "78.2%", "Backtested on 1.7M historical records"],
                            ["AI CONFIDENCE", 68, "68%", "Confidence for this specific match"],
                            ["DATA RECORDS", 90, "1.7M", "Total match data points trained on"],
                            ["VENUES COVERED", 55, "877", "Grounds with pitch & weather data"],
                        ].map(([k, v, label, tip]) => (
                            <div key={k} style={{ marginBottom: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", alignItems: "center" }}>
                                    <span className="tip" data-tip={tip} style={{ fontFamily: "monospace", fontSize: "9px", color: BLK, letterSpacing: "0.5px", cursor: "help" }}>{k} ⓘ</span>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: BLK, fontWeight: "700" }}>{label}</span>
                                </div>
                                <div style={{ height: "5px", background: "rgba(0,0,0,0.12)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div className="stat-bar-fill" style={{ height: "100%", width: `${v}%`, background: `linear-gradient(90deg, ${BLK}, rgba(0,0,0,0.6))`, borderRadius: "3px" }} />
                                </div>
                            </div>
                        ))}

                        <div style={{ borderTop: "1px solid rgba(0,0,0,0.12)", paddingTop: "20px", marginTop: "8px" }}>
                            {isPremium ? (
                                <button className="signal-btn" style={{ animation: "glow 2.5s infinite" }} onClick={() => setSignalModal(true)}>
                                    ⚡ GET LIVE SIGNAL
                                </button>
                            ) : (
                                <div>
                                    <button className="signal-btn" onClick={() => setShowPaywall(true)} style={{ fontSize: "16px", letterSpacing: "2px", background: "linear-gradient(135deg, #111, #333)" }}>
                                        🔒 UNLOCK PREMIUM
                                    </button>
                                    <div style={{ marginTop: "10px", background: "rgba(0,0,0,0.07)", borderRadius: "8px", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "7px", color: "rgba(0,0,0,0.5)", letterSpacing: "2px", marginBottom: "7px" }}>WHAT YOU GET:</div>
                                        {[
                                            ["⚡", "Over-by-over AI predictions"],
                                            ["📊", "Pitch deterioration tracker"],
                                            ["🌤", "Weather & dew impact"],
                                            ["🎯", "Death over strategy intel"],
                                        ].map(([icon, feat]) => (
                                            <div key={feat} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                                                <span style={{ fontSize: "11px" }}>{icon}</span>
                                                <span style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.6)" }}>{feat}</span>
                                            </div>
                                        ))}
                                        <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.08)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "15px", color: BLK, letterSpacing: "1px" }}>
                                            FROM £9.99/mo
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginTop: "12px" }}>
                                {[["🔴", "Real-time"], ["🎯", "95% Acc."], ["🔄", "Live"]].map(([icon, label]) => (
                                    <div key={label} style={{ background: "rgba(0,0,0,0.08)", borderRadius: "8px", padding: "6px 4px", textAlign: "center" }}>
                                        <div style={{ fontSize: "14px", marginBottom: "2px" }}>{icon}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "7px", color: BLK, letterSpacing: "0.5px", fontWeight: "700" }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                            <div style={{ background: "rgba(0,0,0,0.08)", border: "1px solid rgba(192,57,43,0.2)", borderRadius: "10px", padding: "14px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "rgba(192,57,43,0.1)", border: "2px solid rgba(192,57,43,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "12px", color: "#c0392b" }}>18+</span>
                                </div>
                                <div>
                                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#c0392b", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>FINANCIAL RISK WARNING</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.55)", lineHeight: 1.6 }}>Predictions based on 95% AI accuracy. Market conditions vary. BeGambleAware.org</div>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            )}

            {/* ══ MEDIA TAB ══════════════════════════════════════════════════════ */}
            {activeTab === "media" && (
                <div className="fade-up" style={{ background: BLUE, minHeight: "calc(100vh - 94px)", padding: "40px 48px" }}>
                    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
                        <div style={{ display: "flex", gap: "4px", marginBottom: "32px", background: "rgba(0,0,0,0.15)", borderRadius: "12px", padding: "4px", width: "fit-content" }}>
                            {[["videos", "▶  VIDEOS"], ["articles", "◈  ARTICLES"], ["news", "⚡  LIVE NEWS"]].map(([key, label]) => (
                                <button key={key} onClick={() => setMediaSubTab(key)} className="sub-tab"
                                    style={{ background: mediaSubTab === key ? BLK : "none", color: mediaSubTab === key ? MUSTARD : BLK }}>
                                    {label}
                                </button>
                            ))}
                        </div>

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
                                        <div key={v.id} className="media-card" style={{ background: CARD_BG, border: `1px solid rgba(53,77,151,0.2)` }}
                                            onClick={() => window.open(`https://www.youtube.com/watch?v=${v.id}`, '_blank')}>
                                            <div style={{ position: "relative", overflow: "hidden" }}>
                                                <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title}
                                                    style={{ width: "100%", height: "168px", objectFit: "cover", display: "block", transition: "transform .4s" }}
                                                    onMouseEnter={e => e.target.style.transform = "scale(1.06)"}
                                                    onMouseLeave={e => e.target.style.transform = "scale(1)"}
                                                    onError={e => { e.target.style.display = "none"; }} />
                                                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)" }} />
                                                <div style={{ position: "absolute", top: "10px", left: "10px", background: BLK, color: MUSTARD, fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 9px", borderRadius: "20px" }}>{v.tag}</div>
                                            </div>
                                            <div style={{ padding: "14px 16px" }}>
                                                <div style={{ fontSize: "13px", fontWeight: "700", color: BLK, lineHeight: "1.4", marginBottom: "6px" }}>{v.title}</div>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "monospace", fontSize: "9px" }}>
                                                    <span style={{ color: BLK_DIM }}>{v.channel}</span>
                                                    <span style={{ color: BLUE, letterSpacing: "1px", fontWeight: "700" }}>WATCH →</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: "16px 20px", background: CARD_BG, borderRadius: "12px", display: "flex", gap: "10px" }}>
                                    <input placeholder="Search cricket videos..." style={{ flex: 1, background: "rgba(0,0,0,0.07)", border: `1px solid rgba(53,77,151,0.2)`, color: BLK, padding: "9px 14px", borderRadius: "8px", fontSize: "13px", fontFamily: "inherit", outline: "none" }}
                                        onKeyDown={e => e.key === 'Enter' && window.open(`https://youtube.com/results?search_query=cricket+${encodeURIComponent(e.target.value)}`, '_blank')} />
                                    <button style={{ background: BLK, color: MUSTARD, border: "none", padding: "9px 20px", borderRadius: "8px", fontFamily: "monospace", fontWeight: "700", fontSize: "10px", letterSpacing: "2px", cursor: "pointer" }}
                                        onClick={e => window.open(`https://youtube.com/results?search_query=cricket+${encodeURIComponent(e.target.parentNode.querySelector('input').value)}`, '_blank')}>SEARCH</button>
                                </div>
                            </div>
                        )}

                        {mediaSubTab === "articles" && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "18px" }}>
                                {[
                                    { title: "IND vs ENG T20 WC Semi-Final: Pitch Report & Prediction", source: "ESPNCricinfo", url: "https://espncricinfo.com", tag: "PREVIEW", desc: "Wankhede expected to assist spinners in second innings." },
                                    { title: "Jasprit Bumrah: The Science Behind His Unplayable Yorker", source: "The Cricket Monthly", url: "https://espncricinfo.com/cricket-monthly", tag: "ANALYSIS", desc: "How his unique action generates late swing and pinpoint accuracy." },
                                    { title: "T20 World Cup 2026: Complete Stats & Records", source: "ICC", url: "https://icc-cricket.com", tag: "STATS", desc: "Full breakdown of team and individual records." },
                                    { title: "Harry Brook — England's Most Dangerous Modern Batter?", source: "Cricbuzz", url: "https://cricbuzz.com", tag: "PROFILE", desc: "A deep dive into Brook's meteoric rise." },
                                    { title: "Wankhede: Records, History & Classic Encounters", source: "Wisden", url: "https://wisden.com", tag: "HISTORY", desc: "From Sachin's final Test to World Cup finals." },
                                    { title: "How AI Is Changing Cricket Forever", source: "The Guardian", url: "https://theguardian.com/sport/cricket", tag: "TECH", desc: "Teams now use predictive models for pitch analysis and strategy." },
                                ].map((a, i) => (
                                    <div key={i} className="media-card" style={{ background: CARD_BG, border: `1px solid rgba(53,77,151,0.15)`, padding: "20px" }}
                                        onClick={() => window.open(a.url, '_blank')}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                            <span style={{ background: `rgba(53,77,151,0.1)`, color: BLUE, fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 10px", borderRadius: "20px" }}>{a.tag}</span>
                                            <span style={{ fontFamily: "monospace", fontSize: "8px", color: BLK_DIM }}>{a.source}</span>
                                        </div>
                                        <div style={{ fontSize: "14px", fontWeight: "800", color: BLK, lineHeight: "1.4", marginBottom: "8px" }}>{a.title}</div>
                                        <div style={{ fontSize: "12px", color: BLK_DIM, lineHeight: "1.6" }}>{a.desc}</div>
                                        <div style={{ marginTop: "14px", fontFamily: "monospace", fontSize: "9px", color: BLUE, letterSpacing: "2px", fontWeight: "700" }}>READ MORE →</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {mediaSubTab === "news" && (
                            <div>
                                {[
                                    { title: "INDIA VS ENGLAND LIVE: England need 170 — Wankhede T20 WC Semi Final", source: "ESPNCricinfo", time: "LIVE NOW", tag: "BREAKING", url: "https://espncricinfo.com", hot: true },
                                    { title: "New Zealand beat South Africa by 9 wickets to reach T20 WC Final", source: "ICC", time: "3h ago", tag: "RESULT", url: "https://icc-cricket.com", hot: false },
                                    { title: "Wankhede pitch: Spinner-friendly, dew expected to help chasers", source: "Cricbuzz", time: "5h ago", tag: "PITCH", url: "https://cricbuzz.com", hot: false },
                                    { title: "Finn Allen smashes fastest ever T20 WC century — 100* off 33 balls", source: "ICC", time: "6h ago", tag: "RECORD", url: "https://icc-cricket.com", hot: false },
                                    { title: "Rohit Sharma: 'We've been building for this moment for 4 years'", source: "BCCI", time: "8h ago", tag: "INTERVIEW", url: "https://bcci.tv", hot: false },
                                    { title: "Jasprit Bumrah named Player of the Tournament — T20 WC 2026", source: "ICC", time: "10h ago", tag: "AWARD", url: "https://icc-cricket.com", hot: false },
                                ].map((n, i) => (
                                    <div key={i} className="news-row" style={{ background: n.hot ? "rgba(192,57,43,0.1)" : CARD_BG, border: n.hot ? "1px solid rgba(192,57,43,0.25)" : `1px solid rgba(53,77,151,0.12)`, padding: "14px 18px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "14px" }}
                                        onClick={() => window.open(n.url, '_blank')}>
                                        <span style={{ background: n.hot ? "rgba(192,57,43,0.1)" : `rgba(53,77,151,0.1)`, color: n.hot ? "#c0392b" : BLUE, fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1.5px", padding: "3px 10px", borderRadius: "20px", whiteSpace: "nowrap", minWidth: "72px", textAlign: "center" }}>{n.tag}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "13px", fontWeight: "700", color: BLK, lineHeight: 1.4, marginBottom: "3px" }}>{n.title}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: BLK_DIM }}>{n.source} · {n.time}</div>
                                        </div>
                                        <div style={{ color: BLK_DIM, fontSize: "14px" }}>→</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── PAYWALL MODAL ─────────────────────────────────────────────────── */}
            {showPaywall && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setShowPaywall(false)}>
                    <div style={{ background: MUSTARD, borderRadius: "28px", padding: "44px 40px", maxWidth: "460px", width: "92%", textAlign: "center" }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: "36px", marginBottom: "8px" }}>🏏</div>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "42px", color: BLK, letterSpacing: "3px", lineHeight: 1 }}>UNLOCK PREMIUM</div>
                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.45)", letterSpacing: "3px", marginBottom: "28px", marginTop: "6px" }}>78% AI ACCURACY · LIVE SIGNALS</div>
                        <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: "14px", padding: "18px", marginBottom: "20px", textAlign: "left" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.4)", letterSpacing: "3px", marginBottom: "12px" }}>PREMIUM INCLUDES</div>
                            {[["🔮", "Next 5 overs prediction", "Run ranges + wicket probability"], ["📉", "Pitch deterioration tracker", "Know when pitch turns dangerous"], ["🌤️", "Weather impact analysis", "Swing, dew, humidity effects"], ["📊", "Phase strategy intel", "Powerplay + death overs tactics"], ["⚡", "Live signals every over", "Real-time AI recommendations"]].map(([icon, title, desc]) => (
                                <div key={title} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "10px" }}>
                                    <span style={{ fontSize: "16px", flexShrink: 0 }}>{icon}</span>
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "800", color: BLK, letterSpacing: "0.5px" }}>{title}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.5)", marginTop: "2px" }}>{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {paymentStep === "email" ? (
                            <div>
                                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.5)", letterSpacing: "2px", marginBottom: "12px" }}>{selectedPlan === "annual" ? "ANNUAL PLAN — £59.99/yr" : "MONTHLY PLAN — £9.99/mo"}</div>
                                <input type="email" placeholder="Enter your email..." value={emailInput} onChange={e => setEmailInput(e.target.value)}
                                    style={{ width: "100%", background: "rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.2)", color: BLK, padding: "12px 16px", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", marginBottom: "12px", boxSizing: "border-box" }}
                                    onKeyDown={e => e.key === "Enter" && emailInput && handleCheckout(selectedPlan)} />
                                <button onClick={() => handleCheckout(selectedPlan)} disabled={!emailInput || checkingPayment}
                                    style={{ width: "100%", background: emailInput ? BLK : "rgba(0,0,0,0.3)", color: MUSTARD, border: "none", padding: "14px", borderRadius: "10px", fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", letterSpacing: "3px", cursor: emailInput ? "pointer" : "not-allowed", marginBottom: "8px" }}>
                                    {checkingPayment ? "REDIRECTING..." : "PAY WITH STRIPE →"}
                                </button>
                                <button onClick={() => setPaymentStep("plans")} style={{ background: "none", border: "none", color: "rgba(0,0,0,0.4)", fontFamily: "monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "1.5px" }}>← BACK</button>
                            </div>
                        ) : (
                            [{ label: "MONTHLY", plan: "monthly", price: "£9.99", per: "/mo", desc: "Cancel anytime", highlight: false },
                            { label: "ANNUAL ★", plan: "annual", price: "£59.99", per: "/yr", desc: "Save 50% — best value", highlight: true }].map(p => (
                                <div key={p.label} onClick={() => { setSelectedPlan(p.plan); setPaymentStep("email"); }}
                                    style={{ background: p.highlight ? BLK : "rgba(0,0,0,0.12)", border: p.highlight ? `2px solid ${BLK}` : "1px solid rgba(0,0,0,0.15)", borderRadius: "14px", padding: "16px 20px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", transition: "all .2s" }}
                                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                                    <div style={{ textAlign: "left" }}>
                                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px", color: p.highlight ? MUSTARD : BLK, letterSpacing: "2px" }}>{p.label}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: p.highlight ? "rgba(200,150,30,0.7)" : "rgba(0,0,0,0.45)", marginTop: "2px" }}>{p.desc}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "30px", color: p.highlight ? MUSTARD : BLK }}>{p.price}</span>
                                        <span style={{ fontFamily: "monospace", fontSize: "10px", color: p.highlight ? "rgba(200,150,30,0.6)" : "rgba(0,0,0,0.4)" }}>{p.per}</span>
                                    </div>
                                </div>
                            ))
                        )}
                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.3)", letterSpacing: "1.5px", marginTop: "14px" }}>18+ · Gamble responsibly · BeGambleAware.org</div>
                        <button onClick={() => { setShowPaywall(false); setPaymentStep("plans"); }}
                            style={{ marginTop: "12px", background: "none", border: "none", color: "rgba(0,0,0,0.35)", fontFamily: "monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "2px" }}>MAYBE LATER</button>
                    </div>
                </div>
            )}

            {/* ── SIGNAL MODAL ──────────────────────────────────────────────────── */}
            {signalModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}
                    onClick={() => setSignalModal(false)}>
                    <div style={{ background: MUSTARD, borderRadius: "24px", padding: "44px 40px", maxWidth: "420px", width: "90%", textAlign: "center" }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "40px", color: BLK, marginBottom: "4px", letterSpacing: "2px" }}>LIVE SIGNAL</div>
                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.4)", letterSpacing: "3px", marginBottom: "28px" }}>PREMIUM PREDICTION ACCESS</div>
                        {[["£9.99/mo", "Daily AI Signals", "BASIC"], ["£24.99/mo", "Live Over-by-Over", "PRO ★"], ["£49.99/mo", "Full API Access", "ELITE"]].map(([price, desc, label]) => (
                            <div key={label} style={{ background: label === "PRO ★" ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)", border: label === "PRO ★" ? "1px solid rgba(0,0,0,0.25)" : "1px solid rgba(0,0,0,0.1)", borderRadius: "12px", padding: "14px 18px", marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                                <div style={{ textAlign: "left" }}>
                                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "14px", color: BLK, letterSpacing: "1px" }}>{label}</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,0.45)", marginTop: "2px" }}>{desc}</div>
                                </div>
                                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", color: BLK }}>{price}</div>
                            </div>
                        ))}
                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "rgba(0,0,0,0.3)", marginTop: "16px", letterSpacing: "1.5px" }}>18+ · Gamble responsibly · BeGambleAware.org</div>
                        <button onClick={() => setSignalModal(false)}
                            style={{ marginTop: "14px", background: BLK, border: "none", color: MUSTARD, padding: "8px 28px", borderRadius: "8px", cursor: "pointer", fontFamily: "monospace", fontSize: "10px", letterSpacing: "2px" }}>CLOSE</button>
                    </div>
                </div>
            )}
        </div>
    );
}