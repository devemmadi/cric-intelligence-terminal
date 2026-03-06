import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://web-production-b53b1.up.railway.app";
const STRIPE_PK = "pk_test_51T7nucBCZG94uH6ZX1dEhm8Ee8FWFEgFi6OlrzUEMtMVp5vzQOQ67NdmdoPGzLaJyrAQaAfssLE2BXoUB24Cqna200AKM4scTU";

function cleanTeam(name) {
    if (!name) return "";
    let n = name.split(",")[0].trim();
    const shorts = {
        "south australia": "SA", "new south wales": "NSW", "western australia": "WA",
        "queensland": "QLD", "victoria": "VIC", "tasmania": "TAS",
        "south africa": "SA", "new zealand": "NZ", "west indies": "WI",
        "sri lanka": "SL", "united arab emirates": "UAE", "papua new guinea": "PNG", "united states": "USA",
    };
    const key = n.toLowerCase();
    if (shorts[key]) return shorts[key];
    const words = n.split(" ").filter(w => w.length > 1);
    if (n.length > 12 && words.length >= 2) return words.map(w => w[0].toUpperCase()).join("");
    return n.toUpperCase();
}

const MOCK_MATCHES = [
    { id: 1, t1: "INDIA", t2: "AUSTRALIA", status: "LIVE", detail: "Day 3 · India lead by 140", t1Score: 350, t2Score: 210, over: 68.4 },
    { id: 2, t1: "ENGLAND", t2: "PAKISTAN", status: "SOON", detail: "Starts in 2 hours", t1Score: null, t2Score: null },
    { id: 3, t1: "NZ", t2: "SOUTH AFRICA", status: "TMR", detail: "Cape Town · Day 1", t1Score: null, t2Score: null },
];

const MOCK_PRED = {
    aiProbability: 68, team1: "India", team2: "Australia",
    score: 350, wickets: 4, overs: "68.4",
    venue: "Wankhede Stadium, Mumbai",
    pitchLabel: "DRY / SPIN FRIENDLY", pitchEmoji: "🏜️",
    weather: { temp: 28, condition: "SUNNY", humidity: 55, wind_speed: 10 },
    strengths: ["Strong opening stand", "Fast bowling pace", "Spin control"],
    weaknesses: ["Vulnerable to short ball", "Death over leakage", "Unstable middle order"],
    overHistory: [{ over: 60, runs: 310 }, { over: 62, runs: 322 }, { over: 64, runs: 331 }, { over: 66, runs: 339 }, { over: 68, runs: 350 }],
    currentRunRate: 5.1, requiredRunRate: 0,
    pitchCondition: "SHOWING WEAR", deteriorationFactor: 1.08,
    currentPhase: "MIDDLE OVERS",
    weatherImpact: { swingFactor: 1.0, dewFactor: 0.9, battingAdvantage: 8, tip: "Clear skies favour batters. Dew expected after over 35.", emoji: "☀️" },
    nextOvers: [
        { over: 69, expectedRuns: 9, wicketProb: 28, confidence: 85, tip: "Slog overs — back yourself to hit boundaries", runRange: "7–11", phase: "DEATH" },
        { over: 70, expectedRuns: 10, wicketProb: 35, confidence: 77, tip: "Yorkers & variations are key", runRange: "8–12", phase: "DEATH" },
        { over: 71, expectedRuns: 11, wicketProb: 42, confidence: 69, tip: "High wicket risk — trust the yorker", runRange: "9–13", phase: "DEATH" },
        { over: 72, expectedRuns: 10, wicketProb: 38, confidence: 61, tip: "Dew expected — spin grip reduced", runRange: "8–12", phase: "DEATH" },
        { over: 73, expectedRuns: 11, wicketProb: 44, confidence: 53, tip: "Final over — maximum attack", runRange: "9–13", phase: "DEATH" },
    ],
    powerplay: { expectedScore: 58, expectedWkts: 1.8, expectedRR: 5.8, tip: "Good batting in powerplay. Expect 58 runs." },
    deathOvers: { expectedRR: 7.2, expectedRuns: 65, oversLeft: 9, tip: "Set a strong total. Dew will help batters." },
};

// Win probability arc
function WinArc({ value }) {
    const r = 54, cx = 70, cy = 70, circ = Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const col = value > 65 ? "#22c55e" : value > 45 ? "#f59e0b" : "#ef4444";
    return (
        <svg width="140" height="80" viewBox="0 0 140 80">
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="10" strokeLinecap="round" />
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
                fill="none" stroke={col} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.2s ease" }} />
            <text x={cx} y={cy - 10} textAnchor="middle" fill="#111"
                fontSize="26" fontWeight="900" fontFamily="'Bebas Neue',sans-serif">{value}%</text>
            <text x={cx} y={cy + 4} textAnchor="middle" fill="rgba(0,0,0,0.4)"
                fontSize="8" fontFamily="monospace" letterSpacing="2">WIN CHANCE</text>
        </svg>
    );
}

// Sparkline for runs trend
function Sparkline({ data }) {
    if (!data || data.length < 2) return null;
    const vals = data.map(d => d.runs);
    const min = Math.min(...vals), max = Math.max(...vals);
    const w = 160, h = 40;
    const pts = vals.map((v, i) => [
        (i / (vals.length - 1)) * w,
        h - ((v - min) / (max - min || 1)) * (h - 8) - 4
    ]);
    const polyline = pts.map(p => p.join(",")).join(" ");
    const area = `M ${pts[0][0]},${pts[0][1]} ${pts.map(p => `L ${p[0]},${p[1]}`).join(" ")} L ${w},${h} L 0,${h} Z`;
    return (
        <svg width={w} height={h} style={{ overflow: "visible" }}>
            <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d97706" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill="url(#sg)" />
            <polyline points={polyline} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
            {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i === pts.length - 1 ? 5 : 3} fill={i === pts.length - 1 ? "#fff" : "#d97706"} />)}
        </svg>
    );
}

export default function CricIntelligence() {
    const [activeTab, setActiveTab] = useState("match");
    const [selectedMatch, setSelectedMatch] = useState(MOCK_MATCHES[0]);
    const [pred, setPred] = useState(MOCK_PRED);
    const [isPremium, setIsPremium] = useState(() => {
        try { return localStorage.getItem("cricintel_premium") === "true"; } catch { return false; }
    });
    const [userEmail, setUserEmail] = useState(() => {
        try { return localStorage.getItem("cricintel_email") || ""; } catch { return ""; }
    });
    const [showPaywall, setShowPaywall] = useState(false);
    const [emailInput, setEmailInput] = useState("");
    const [payStep, setPayStep] = useState("plans");
    const [selectedPlan, setSelectedPlan] = useState("monthly");
    const [checkingPayment, setCheckingPayment] = useState(false);
    const [liveTime, setLiveTime] = useState(new Date());
    const [ticker, setTicker] = useState(0);
    const [mediaSubTab, setMediaSubTab] = useState("videos");

    useEffect(() => { const t = setInterval(() => setLiveTime(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const t = setInterval(() => setTicker(p => p + 1), 12000); return () => clearInterval(t); }, []);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("premium") === "true") {
            setIsPremium(true);
            localStorage.setItem("cricintel_premium", "true");
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, []);

    const fetchPred = useCallback(async () => {
        try { const r = await fetch(`${API_BASE}/predict`); if (r.ok) setPred(await r.json()); } catch { }
    }, []);
    useEffect(() => { fetchPred(); }, [fetchPred, ticker]);

    const handleCheckout = async (plan) => {
        setCheckingPayment(true);
        try {
            const res = await fetch(`${API_BASE}/create-checkout-session`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, email: emailInput }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert("Payment error: " + (data.error || "Unknown"));
        } catch { alert("Could not connect to payment server."); }
        finally { setCheckingPayment(false); }
    };

    const prob = pred.aiProbability || 68;
    const team1 = cleanTeam(pred.team1 || "INDIA");
    const team2 = cleanTeam(pred.team2 || "AUSTRALIA");

    // Verdict text — plain English
    const verdict = prob >= 65
        ? `${team1} likely to win`
        : prob >= 50
            ? `${team1} slight edge`
            : prob >= 35
                ? `${team2} slight edge`
                : `${team2} likely to win`;

    const TABS = [
        { key: "match", icon: "🏏", label: "Match" },
        { key: "overs", icon: "📊", label: "Overs" },
        { key: "conditions", icon: "🌤️", label: "Conditions" },
        { key: "media", icon: "▶️", label: "Media" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: "#fdf4e3", fontFamily: "'Barlow Condensed','Arial Narrow',sans-serif", color: "#111", overflowX: "hidden" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@300;400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:#d97706;border-radius:2px;}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.6)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .fade{animation:fadeUp .35s ease forwards;}
        .ticker-wrap{overflow:hidden;background:#1a2a4a;padding:7px 0;}
        .ticker-inner{display:inline-block;animation:ticker 28s linear infinite;white-space:nowrap;}
        .match-card{transition:all .2s;cursor:pointer;border-radius:14px;border:2px solid transparent;padding:14px 16px;}
        .match-card:active{transform:scale(.98);}
        .match-card.sel{border-color:#d97706;background:rgba(217,119,6,.08);}
        .tab-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:10px 0;border:none;background:none;cursor:pointer;flex:1;transition:all .2s;font-family:inherit;}
        .tab-btn.on .tab-dot{background:#d97706;}
        .over-card{border-radius:16px;padding:16px 12px;text-align:center;position:relative;overflow:hidden;transition:all .2s;}
        .over-card:active{transform:scale(.97);}
        .lock-btn{width:100%;border:none;cursor:pointer;border-radius:12px;padding:16px;font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:3px;transition:all .25s;}
        .lock-btn:active{transform:scale(.97);}
        .strength-pill{display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:100px;margin:4px;font-size:13px;font-weight:700;}
      `}</style>

            {/* ── TICKER ── */}
            <div className="ticker-wrap">
                <div className="ticker-inner">
                    {[
                        `◆ ${team1} ${pred.score || 350}/${pred.wickets || 4} (${pred.overs || 68.4} ov)`,
                        `◆ AI CONFIDENCE: ${prob}%`,
                        `◆ 877 VENUES · 1.7M RECORDS · 78.2% ACCURACY`,
                        `◆ PITCH: ${pred.pitchLabel || "DRY / SPIN"}`,
                        `◆ WEATHER: ${pred.weather?.condition || "SUNNY"} ${pred.weather?.temp || 28}°C`,
                        `◆ ${team1} ${pred.score || 350}/${pred.wickets || 4} (${pred.overs || 68.4} ov)`,
                        `◆ AI CONFIDENCE: ${prob}%`,
                        `◆ 877 VENUES · 1.7M RECORDS · 78.2% ACCURACY`,
                        `◆ PITCH: ${pred.pitchLabel || "DRY / SPIN"}`,
                        `◆ WEATHER: ${pred.weather?.condition || "SUNNY"} ${pred.weather?.temp || 28}°C`,
                    ].map((item, i) => (
                        <span key={i} style={{ color: "#d97706", fontFamily: "monospace", fontSize: "10px", fontWeight: "700", marginRight: "60px", letterSpacing: "1.5px" }}>{item}</span>
                    ))}
                </div>
            </div>

            {/* ── HEADER ── */}
            <header style={{ background: "#0f1e3d", padding: "0 20px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,.3)" }}>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "22px", letterSpacing: "2px" }}>
                    <span style={{ color: "#f5f0e8" }}>Cric</span><span style={{ color: "#d97706" }}>Intelligence</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", animation: "pulse 2s infinite" }} />
                        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#22c55e", letterSpacing: "2px" }}>LIVE</span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "#4878c0" }}>{liveTime.toLocaleTimeString("en-GB")}</span>
                </div>
            </header>

            {/* ── MATCH SELECTOR — horizontal scroll ── */}
            <div style={{ background: "#0f1e3d", padding: "12px 16px", display: "flex", gap: "10px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                {MOCK_MATCHES.map(m => (
                    <div key={m.id} onClick={() => setSelectedMatch(m)}
                        className={`match-card ${selectedMatch.id === m.id ? "sel" : ""}`}
                        style={{ background: "rgba(255,255,255,.05)", minWidth: "180px", flexShrink: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "15px", color: "#f5f0e8", letterSpacing: "0.5px" }}>
                                {m.t1} <span style={{ color: "#4878c0", fontSize: "10px" }}>vs</span> {m.t2}
                            </span>
                            <span style={{
                                fontFamily: "monospace", fontSize: "8px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px",
                                background: m.status === "LIVE" ? "rgba(239,68,68,.2)" : "rgba(255,255,255,.08)",
                                color: m.status === "LIVE" ? "#ef4444" : "#6090c8",
                                border: m.status === "LIVE" ? "1px solid rgba(239,68,68,.4)" : "1px solid rgba(96,144,200,.3)",
                            }}>{m.status}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#4878c0" }}>{m.detail}</div>
                    </div>
                ))}
            </div>

            {/* ── MAIN CONTENT ── */}
            <main style={{ maxWidth: "640px", margin: "0 auto", padding: "0 0 90px" }}>

                {/* ═══ MATCH TAB ═══ */}
                {activeTab === "match" && (
                    <div className="fade">

                        {/* Match hero — mustard card */}
                        <div style={{ background: "#d97706", padding: "28px 20px", textAlign: "center" }}>
                            {/* Teams */}
                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "38px", letterSpacing: "2px", lineHeight: 1, marginBottom: "4px" }}>
                                <span style={{ color: "#111" }}>{team1}</span>
                                <span style={{ color: "rgba(0,0,0,.25)", fontSize: "20px", margin: "0 14px" }}>vs</span>
                                <span style={{ color: "rgba(0,0,0,.5)" }}>{team2}</span>
                            </div>
                            {pred.venue && <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,.4)", letterSpacing: "2px", marginBottom: "20px" }}>{pred.venue.toUpperCase()}</div>}

                            {/* Big win probability */}
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                                <WinArc value={prob} />
                            </div>

                            {/* Plain English verdict */}
                            <div style={{ background: "rgba(0,0,0,.15)", borderRadius: "12px", padding: "12px 20px", margin: "0 auto", maxWidth: "280px" }}>
                                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "22px", color: "#111", letterSpacing: "1.5px" }}>{verdict}</div>
                                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(0,0,0,.45)", letterSpacing: "2px", marginTop: "2px" }}>AI PREDICTION</div>
                            </div>
                        </div>

                        {/* Score card */}
                        <div style={{ background: "#fff", margin: "16px", borderRadius: "18px", padding: "20px", boxShadow: "0 2px 20px rgba(0,0,0,.08)" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "3px", marginBottom: "14px" }}>CURRENT SCORE</div>
                            <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "52px", color: "#111", lineHeight: 1 }}>{pred.score || 350}</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#9ca3af", letterSpacing: "2px", marginTop: "2px" }}>/{pred.wickets || 4} · {pred.overs || 68.4} ov</div>
                                    <div style={{ fontWeight: "800", fontSize: "13px", color: "#d97706", marginTop: "4px" }}>{team1}</div>
                                </div>
                                <div style={{ width: "1px", height: "60px", background: "#f3f4f6" }} />
                                <div style={{ textAlign: "center", opacity: .5 }}>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "52px", color: "#111", lineHeight: 1 }}>—</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#9ca3af", letterSpacing: "2px", marginTop: "2px" }}>YET TO BAT</div>
                                    <div style={{ fontWeight: "800", fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>{team2}</div>
                                </div>
                            </div>

                            {/* Run rates */}
                            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                                {[
                                    { label: "Run Rate", value: pred.currentRunRate || 5.1, suffix: "/ov" },
                                    { label: "Venue Avg", value: "5.3", suffix: "/ov" },
                                ].map(({ label, value, suffix }) => (
                                    <div key={label} style={{ flex: 1, background: "#fdf4e3", borderRadius: "10px", padding: "10px", textAlign: "center" }}>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "22px", color: "#111" }}>{value}<span style={{ fontSize: "11px", color: "#9ca3af" }}>{suffix}</span></div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#9ca3af", letterSpacing: "1.5px" }}>{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strengths & Weaknesses — plain English */}
                        <div style={{ margin: "0 16px 16px", borderRadius: "18px", overflow: "hidden", boxShadow: "0 2px 20px rgba(0,0,0,.08)" }}>
                            <div style={{ background: "#fff", padding: "20px" }}>
                                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "3px", marginBottom: "14px" }}>TEAM ANALYSIS</div>

                                <div style={{ marginBottom: "14px" }}>
                                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#16a34a", fontWeight: "800", letterSpacing: "2px", marginBottom: "8px" }}>✅ GOING WELL</div>
                                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                                        {(pred.strengths || []).map((s, i) => (
                                            <span key={i} className="strength-pill" style={{ background: "#dcfce7", color: "#15803d" }}>
                                                ✓ {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#dc2626", fontWeight: "800", letterSpacing: "2px", marginBottom: "8px" }}>⚠️ WATCH OUT FOR</div>
                                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                                        {(pred.weaknesses || []).map((w, i) => (
                                            <span key={i} className="strength-pill" style={{ background: "#fee2e2", color: "#dc2626" }}>
                                                ✗ {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Runs trend */}
                        <div style={{ margin: "0 16px 16px", background: "#0f1e3d", borderRadius: "18px", padding: "20px", boxShadow: "0 2px 20px rgba(0,0,0,.1)" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#4878c0", letterSpacing: "3px", marginBottom: "14px" }}>RUNS TREND</div>
                            <Sparkline data={pred.overHistory || MOCK_PRED.overHistory} />
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                                {(pred.overHistory || []).map((d, i) => (
                                    <div key={i} style={{ textAlign: "center" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#d97706", fontWeight: "700" }}>{d.runs}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "7px", color: "#4878c0" }}>ov{d.over}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ margin: "0 16px" }}>
                            <button className="lock-btn"
                                onClick={() => isPremium ? null : setShowPaywall(true)}
                                style={{ background: "#111", color: "#d97706", fontSize: "20px" }}>
                                {isPremium ? "✅ PREMIUM ACTIVE" : "🔒 GET LIVE SIGNALS — £9.99/mo"}
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══ OVERS TAB ═══ */}
                {activeTab === "overs" && (
                    <div className="fade" style={{ padding: "16px" }}>
                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "24px", letterSpacing: "2px", color: "#111", marginBottom: "4px" }}>NEXT 5 OVERS</div>
                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "2px", marginBottom: "16px" }}>AI PREDICTION PER OVER</div>

                        {(pred.nextOvers || []).map((ov, i) => (
                            <div key={i} className="over-card"
                                style={{
                                    background: i === 0 ? "#d97706" : "#fff",
                                    marginBottom: "10px",
                                    boxShadow: "0 2px 14px rgba(0,0,0,.07)",
                                    border: i === 0 ? "none" : "1px solid #f3f4f6",
                                }}>

                                {/* Lock overlay for overs 2-5 */}
                                {i > 0 && !isPremium && (
                                    <div onClick={() => setShowPaywall(true)} style={{
                                        position: "absolute", inset: 0, borderRadius: "16px",
                                        background: "rgba(253,244,227,.95)", backdropFilter: "blur(3px)",
                                        display: "flex", flexDirection: "column", alignItems: "center",
                                        justifyContent: "center", cursor: "pointer", gap: "6px", zIndex: 5,
                                    }}>
                                        <div style={{ fontSize: "24px" }}>🔒</div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "16px", color: "#111", letterSpacing: "2px" }}>UNLOCK FOR £9.99/mo</div>
                                    </div>
                                )}

                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px" }}>
                                    {/* Over number */}
                                    <div>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: i === 0 ? "rgba(0,0,0,.5)" : "#9ca3af", letterSpacing: "2px" }}>OVER</div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "36px", color: i === 0 ? "#111" : "#d97706", lineHeight: 1 }}>{ov.over}</div>
                                    </div>

                                    {/* Expected runs — BIG */}
                                    <div style={{ textAlign: "center" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: i === 0 ? "rgba(0,0,0,.5)" : "#9ca3af", letterSpacing: "2px", marginBottom: "2px" }}>EXPECTED RUNS</div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "52px", color: "#111", lineHeight: 1 }}>{ov.expectedRuns}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: i === 0 ? "rgba(0,0,0,.4)" : "#9ca3af" }}>range: {ov.runRange}</div>
                                    </div>

                                    {/* Wicket risk */}
                                    <div style={{ textAlign: "right" }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: i === 0 ? "rgba(0,0,0,.5)" : "#9ca3af", letterSpacing: "2px", marginBottom: "4px" }}>WICKET RISK</div>
                                        <div style={{
                                            fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", lineHeight: 1,
                                            color: ov.wicketProb > 40 ? "#dc2626" : ov.wicketProb > 25 ? "#f59e0b" : "#16a34a"
                                        }}>{ov.wicketProb}%</div>
                                        <div style={{
                                            fontFamily: "monospace", fontSize: "8px", marginTop: "2px",
                                            color: ov.wicketProb > 40 ? "#dc2626" : ov.wicketProb > 25 ? "#f59e0b" : "#16a34a"
                                        }}>{ov.wicketProb > 40 ? "HIGH ⚠️" : ov.wicketProb > 25 ? "MEDIUM" : "LOW ✅"}</div>
                                    </div>
                                </div>

                                {/* Tip — plain English */}
                                <div style={{
                                    background: i === 0 ? "rgba(0,0,0,.12)" : "#fdf4e3",
                                    padding: "10px 18px",
                                    borderRadius: "0 0 16px 16px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "10px", color: i === 0 ? "rgba(0,0,0,.6)" : "#6b7280", lineHeight: 1.4 }}>{ov.tip}</span>
                                    <span style={{ fontFamily: "monospace", fontSize: "8px", color: i === 0 ? "rgba(0,0,0,.35)" : "#9ca3af", marginLeft: "12px", whiteSpace: "nowrap" }}>AI: {ov.confidence}%</span>
                                </div>
                            </div>
                        ))}

                        {/* Phase summary */}
                        <div style={{ background: "#fff", borderRadius: "18px", padding: "20px", marginTop: "8px", boxShadow: "0 2px 14px rgba(0,0,0,.07)" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "3px", marginBottom: "16px" }}>PHASE SUMMARY</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {/* Powerplay */}
                                <div style={{ background: "#eff6ff", borderRadius: "14px", padding: "16px" }}>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#2563eb", fontWeight: "800", letterSpacing: "1.5px", marginBottom: "8px" }}>🔵 POWERPLAY</div>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", color: "#111", lineHeight: 1 }}>{pred.powerplay?.expectedScore || 58}</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#6b7280", marginTop: "4px" }}>expected runs</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#4b5563", marginTop: "8px", lineHeight: 1.5 }}>{pred.powerplay?.tip || "Good batting conditions."}</div>
                                </div>
                                {/* Death overs */}
                                <div style={{ background: "#fff1f2", borderRadius: "14px", padding: "16px" }}>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#dc2626", fontWeight: "800", letterSpacing: "1.5px", marginBottom: "8px" }}>🔴 DEATH OVERS</div>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28px", color: "#111", lineHeight: 1 }}>{pred.deathOvers?.expectedRR || 7.2}</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#6b7280", marginTop: "4px" }}>runs per over</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#4b5563", marginTop: "8px", lineHeight: 1.5 }}>{pred.deathOvers?.tip || "Set a strong total."}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══ CONDITIONS TAB ═══ */}
                {activeTab === "conditions" && (
                    <div className="fade" style={{ padding: "16px" }}>

                        {/* Weather card */}
                        <div style={{
                            background: pred.weather?.condition === "SUNNY"
                                ? "linear-gradient(135deg,#c2410c,#ea580c)"
                                : pred.weather?.condition === "RAINY"
                                    ? "linear-gradient(135deg,#0c4a6e,#0369a1)"
                                    : "linear-gradient(135deg,#374151,#4b5563)",
                            borderRadius: "18px", padding: "24px 20px", marginBottom: "14px", color: "#fff",
                        }}>
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,.5)", letterSpacing: "3px", marginBottom: "14px" }}>TODAY'S WEATHER</div>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                    <span style={{ fontSize: "52px" }}>{pred.weather?.condition === "SUNNY" ? "☀️" : pred.weather?.condition === "RAINY" ? "🌧️" : "⛅"}</span>
                                    <div>
                                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "52px", lineHeight: 1 }}>{pred.weather?.temp || 28}°C</div>
                                        <div style={{ fontWeight: "800", fontSize: "14px", letterSpacing: "2px", opacity: .9 }}>{pred.weather?.condition || "SUNNY"}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right", opacity: .8 }}>
                                    <div style={{ fontFamily: "monospace", fontSize: "11px", marginBottom: "4px" }}>💧 {pred.weather?.humidity || 55}%</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "11px" }}>💨 {pred.weather?.wind_speed || 10} km/h</div>
                                </div>
                            </div>
                        </div>

                        {/* What weather means — plain English */}
                        <div style={{ background: "#fff", borderRadius: "18px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 14px rgba(0,0,0,.07)" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "3px", marginBottom: "14px" }}>WHAT THIS MEANS</div>
                            {[
                                { icon: "🏏", label: "For batting", value: pred.weatherImpact?.battingAdvantage > 0 ? "Conditions favour batters" : "Tough batting conditions", positive: pred.weatherImpact?.battingAdvantage > 0 },
                                { icon: "💧", label: "Dew risk", value: pred.weatherImpact?.dewFactor < 0.9 ? "High — spinners will struggle later" : "Low — pitch stays consistent", positive: pred.weatherImpact?.dewFactor >= 0.9 },
                                { icon: "🌊", label: "Swing", value: pred.weatherImpact?.swingFactor > 1.1 ? "High swing — pacers get help" : "Low swing — flat conditions", positive: pred.weatherImpact?.swingFactor <= 1.1 },
                            ].map(({ icon, label, value, positive }) => (
                                <div key={label} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
                                    <span style={{ fontSize: "22px", flexShrink: 0 }}>{icon}</span>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "1.5px" }}>{label}</div>
                                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#111", marginTop: "2px" }}>{value}</div>
                                    </div>
                                    <span style={{ fontSize: "18px" }}>{positive ? "✅" : "⚠️"}</span>
                                </div>
                            ))}
                            <div style={{ fontFamily: "monospace", fontSize: "10px", color: "#6b7280", lineHeight: 1.6, marginTop: "12px", padding: "12px", background: "#fdf4e3", borderRadius: "10px" }}>
                                💡 {pred.weatherImpact?.tip || "Clear conditions. Good batting surface."}
                            </div>
                        </div>

                        {/* Pitch card */}
                        <div style={{ background: "#fff", borderRadius: "18px", padding: "20px", marginBottom: "14px", boxShadow: "0 2px 14px rgba(0,0,0,.07)" }}>
                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "3px", marginBottom: "14px" }}>PITCH CONDITION</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                                <span style={{ fontSize: "36px" }}>{pred.pitchEmoji || "🏜️"}</span>
                                <div>
                                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "24px", color: "#111", letterSpacing: "1.5px" }}>{pred.pitchLabel || "DRY / SPIN FRIENDLY"}</div>
                                    <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", marginTop: "2px" }}>{pred.pitchCondition || "SHOWING WEAR"}</div>
                                </div>
                            </div>

                            {/* Wear meter */}
                            <div style={{ marginBottom: "12px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#6b7280", letterSpacing: "1.5px" }}>PITCH WEAR</span>
                                    <span style={{
                                        fontFamily: "monospace", fontSize: "9px", fontWeight: "700",
                                        color: (pred.deteriorationFactor || 1) > 1.15 ? "#dc2626" : (pred.deteriorationFactor || 1) > 1.05 ? "#f59e0b" : "#16a34a"
                                    }}>{(pred.deteriorationFactor || 1) > 1.15 ? "HIGH" : ((pred.deteriorationFactor || 1) > 1.05 ? "MEDIUM" : "LOW")}</span>
                                </div>
                                <div style={{ background: "#f3f4f6", borderRadius: "6px", height: "8px", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", borderRadius: "6px",
                                        width: `${Math.min(((pred.deteriorationFactor || 1) - 1) * 500, 100)}%`,
                                        background: (pred.deteriorationFactor || 1) > 1.15 ? "#dc2626" : (pred.deteriorationFactor || 1) > 1.05 ? "#f59e0b" : "#16a34a",
                                        transition: "width 1.2s ease",
                                    }} />
                                </div>
                            </div>

                            {/* What pitch means — plain English */}
                            {[
                                { label: "For spinners", value: (pred.deteriorationFactor || 1) > 1.05 ? "Getting sharp turn — dangerous!" : "Playing normally" },
                                { label: "For pacers", value: "Good bounce in early overs" },
                                { label: "For batters", value: (pred.deteriorationFactor || 1) > 1.15 ? "Getting tough — keep wickets in hand" : "Still good batting surface" },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid #f3f4f6" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "1px" }}>{label}</span>
                                    <span style={{ fontFamily: "monospace", fontSize: "10px", fontWeight: "700", color: "#111" }}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Premium lock for full analysis */}
                        {!isPremium && (
                            <button className="lock-btn" onClick={() => setShowPaywall(true)}
                                style={{ background: "#d97706", color: "#111", marginBottom: "8px" }}>
                                🔒 FULL CONDITIONS ANALYSIS — £9.99/mo
                            </button>
                        )}
                    </div>
                )}

                {/* ═══ MEDIA TAB ═══ */}
                {activeTab === "media" && (
                    <div className="fade" style={{ padding: "16px" }}>
                        {/* Sub tabs */}
                        <div style={{ display: "flex", gap: "6px", marginBottom: "16px", background: "#f3f4f6", borderRadius: "12px", padding: "4px" }}>
                            {[["videos", "▶ Videos"], ["news", "⚡ News"]].map(([key, label]) => (
                                <button key={key} onClick={() => setMediaSubTab(key)}
                                    style={{
                                        flex: 1, padding: "10px", border: "none", borderRadius: "10px", fontFamily: "inherit", fontSize: "13px", fontWeight: "700", cursor: "pointer",
                                        background: mediaSubTab === key ? "#111" : "none",
                                        color: mediaSubTab === key ? "#d97706" : "#6b7280",
                                    }}>{label}</button>
                            ))}
                        </div>

                        {mediaSubTab === "videos" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                {[
                                    { id: "c_LLXt8bPD0", title: "Rohit Sharma Pre-Match Press Conference", channel: "BCCI Official", tag: "PRESS" },
                                    { id: "3T8LvBDc_4o", title: "Harry Brook on England's T20 World Cup Campaign", channel: "England Cricket", tag: "INTERVIEW" },
                                    { id: "K4TOrB7at0Y", title: "Wankhede Pitch Report | IND vs ENG Semi Final", channel: "ICC", tag: "PITCH" },
                                    { id: "9bZkp7q19f0", title: "T20 World Cup 2026 — Best Moments", channel: "ICC Official", tag: "HIGHLIGHTS" },
                                ].map(v => (
                                    <div key={v.id} onClick={() => window.open(`https://www.youtube.com/watch?v=${v.id}`, "_blank")}
                                        style={{ background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,.07)", cursor: "pointer", display: "flex", gap: "0" }}>
                                        <div style={{ position: "relative", width: "140px", flexShrink: 0 }}>
                                            <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title}
                                                style={{ width: "100%", height: "90px", objectFit: "cover", display: "block" }}
                                                onError={e => { e.target.style.display = "none"; }} />
                                            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>▶</div>
                                            </div>
                                        </div>
                                        <div style={{ padding: "12px 14px", flex: 1 }}>
                                            <div style={{ background: "#d97706", color: "#fff", fontFamily: "monospace", fontSize: "7px", fontWeight: "700", letterSpacing: "1.5px", padding: "2px 8px", borderRadius: "20px", display: "inline-block", marginBottom: "6px" }}>{v.tag}</div>
                                            <div style={{ fontWeight: "700", fontSize: "13px", color: "#111", lineHeight: 1.4, marginBottom: "4px" }}>{v.title}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af" }}>{v.channel}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {mediaSubTab === "news" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {[
                                    { title: "INDIA VS ENGLAND LIVE: England need 170 to win", source: "ESPNCricinfo", time: "LIVE NOW", hot: true, url: "https://espncricinfo.com" },
                                    { title: "NZ beat South Africa to reach T20 WC Final", source: "ICC", time: "3h ago", hot: false, url: "https://icc-cricket.com" },
                                    { title: "Wankhede pitch: Spinner-friendly, dew expected", source: "Cricbuzz", time: "5h ago", hot: false, url: "https://cricbuzz.com" },
                                    { title: "Finn Allen smashes fastest ever T20 WC century", source: "ICC", time: "6h ago", hot: false, url: "https://icc-cricket.com" },
                                    { title: "Rohit Sharma: We've been building for this for 4 years", source: "BCCI", time: "8h ago", hot: false, url: "https://bcci.tv" },
                                ].map((n, i) => (
                                    <div key={i} onClick={() => window.open(n.url, "_blank")}
                                        style={{
                                            background: n.hot ? "#fff1f2" : "#fff", borderRadius: "14px", padding: "14px 16px",
                                            border: n.hot ? "1px solid rgba(220,38,38,.2)" : "1px solid #f3f4f6",
                                            cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                                            boxShadow: "0 2px 10px rgba(0,0,0,.05)"
                                        }}>
                                        {n.hot && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444", animation: "pulse 2s infinite", flexShrink: 0 }} />}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: "700", fontSize: "13px", color: "#111", lineHeight: 1.4, marginBottom: "4px" }}>{n.title}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af" }}>{n.source} · {n.time}</div>
                                        </div>
                                        <span style={{ color: "#d1d5db", fontSize: "16px" }}>→</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ── BOTTOM NAV (Mobile) ── */}
            <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #f3f4f6", display: "flex", zIndex: 100, boxShadow: "0 -4px 20px rgba(0,0,0,.08)" }}>
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} className={`tab-btn ${activeTab === t.key ? "on" : ""}`}>
                        <span style={{ fontSize: "20px" }}>{t.icon}</span>
                        <span style={{ fontFamily: "monospace", fontSize: "8px", fontWeight: "700", letterSpacing: "1px", color: activeTab === t.key ? "#d97706" : "#9ca3af" }}>{t.label}</span>
                        <div className="tab-dot" style={{ width: "4px", height: "4px", borderRadius: "50%", background: activeTab === t.key ? "#d97706" : "transparent", transition: "background .2s" }} />
                    </button>
                ))}
            </nav>

            {/* ── PAYWALL MODAL ── */}
            {showPaywall && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", backdropFilter: "blur(10px)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                    onClick={() => { setShowPaywall(false); setPayStep("plans"); }}>
                    <div style={{ background: "#fdf4e3", borderRadius: "28px 28px 0 0", padding: "32px 24px 40px", width: "100%", maxWidth: "480px" }}
                        onClick={e => e.stopPropagation()}>

                        {/* Handle bar */}
                        <div style={{ width: "40px", height: "4px", background: "#d1d5db", borderRadius: "2px", margin: "0 auto 24px" }} />

                        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "36px", color: "#111", letterSpacing: "2px", textAlign: "center" }}>UNLOCK PREMIUM</div>
                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "3px", textAlign: "center", marginBottom: "24px", marginTop: "4px" }}>78% AI ACCURACY · LIVE SIGNALS</div>

                        {/* Features */}
                        <div style={{ background: "#fff", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
                            {[
                                ["🔮", "Next 5 overs predicted", "Run ranges + wicket risk per over"],
                                ["📉", "Pitch wear tracker", "Know when pitch becomes dangerous"],
                                ["🌤️", "Weather impact", "How conditions affect the game"],
                                ["📊", "Phase strategy", "Powerplay + death overs breakdown"],
                                ["⚡", "Live signals", "Real-time AI tip every over"],
                            ].map(([icon, title, desc]) => (
                                <div key={title} style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                                    <span style={{ fontSize: "20px", flexShrink: 0 }}>{icon}</span>
                                    <div>
                                        <div style={{ fontWeight: "800", fontSize: "14px", color: "#111" }}>{title}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", marginTop: "2px" }}>{desc}</div>
                                    </div>
                                    <span style={{ marginLeft: "auto", color: "#16a34a", fontSize: "16px" }}>✓</span>
                                </div>
                            ))}
                        </div>

                        {payStep === "email" ? (
                            <div>
                                <div style={{ fontFamily: "monospace", fontSize: "9px", color: "#9ca3af", letterSpacing: "2px", textAlign: "center", marginBottom: "12px" }}>
                                    {selectedPlan === "annual" ? "ANNUAL — £59.99/yr (save 50%)" : "MONTHLY — £9.99/mo"}
                                </div>
                                <input type="email" placeholder="Your email address" value={emailInput}
                                    onChange={e => setEmailInput(e.target.value)}
                                    style={{ width: "100%", background: "#f3f4f6", border: "none", color: "#111", padding: "14px 16px", borderRadius: "12px", fontSize: "16px", fontFamily: "inherit", outline: "none", marginBottom: "12px" }} />
                                <button onClick={() => handleCheckout(selectedPlan)}
                                    disabled={!emailInput || checkingPayment}
                                    style={{ width: "100%", background: emailInput ? "#111" : "#d1d5db", color: emailInput ? "#d97706" : "#fff", border: "none", padding: "16px", borderRadius: "12px", fontFamily: "'Bebas Neue',sans-serif", fontSize: "20px", letterSpacing: "3px", cursor: emailInput ? "pointer" : "not-allowed", marginBottom: "10px" }}>
                                    {checkingPayment ? "REDIRECTING..." : "PAY WITH STRIPE →"}
                                </button>
                                <button onClick={() => setPayStep("plans")}
                                    style={{ background: "none", border: "none", color: "#9ca3af", fontFamily: "monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "1.5px", width: "100%", textAlign: "center" }}>
                                    ← BACK
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {[
                                    { plan: "monthly", label: "MONTHLY", price: "£9.99", per: "/mo", desc: "Cancel anytime", dark: false },
                                    { plan: "annual", label: "ANNUAL ★ BEST VALUE", price: "£59.99", per: "/yr", desc: "Save 50% vs monthly", dark: true },
                                ].map(p => (
                                    <div key={p.plan} onClick={() => { setSelectedPlan(p.plan); setPayStep("email"); }}
                                        style={{
                                            background: p.dark ? "#111" : "#fff", border: p.dark ? "none" : "1px solid #f3f4f6",
                                            borderRadius: "16px", padding: "16px 20px", cursor: "pointer",
                                            display: "flex", justifyContent: "space-between", alignItems: "center"
                                        }}>
                                        <div>
                                            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "16px", color: p.dark ? "#d97706" : "#111", letterSpacing: "1.5px" }}>{p.label}</div>
                                            <div style={{ fontFamily: "monospace", fontSize: "9px", color: p.dark ? "rgba(217,119,6,.7)" : "#9ca3af", marginTop: "2px" }}>{p.desc}</div>
                                        </div>
                                        <div>
                                            <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "30px", color: p.dark ? "#d97706" : "#111" }}>{p.price}</span>
                                            <span style={{ fontFamily: "monospace", fontSize: "10px", color: p.dark ? "rgba(217,119,6,.6)" : "#9ca3af" }}>{p.per}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ fontFamily: "monospace", fontSize: "8px", color: "#d1d5db", letterSpacing: "1.5px", textAlign: "center", marginTop: "16px" }}>
                            18+ · Gamble responsibly · BeGambleAware.org
                        </div>

                        <button onClick={() => { setShowPaywall(false); setPayStep("plans"); }}
                            style={{ background: "none", border: "none", color: "#9ca3af", fontFamily: "monospace", fontSize: "10px", cursor: "pointer", letterSpacing: "2px", width: "100%", textAlign: "center", marginTop: "10px" }}>
                            MAYBE LATER
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
