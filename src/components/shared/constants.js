/* eslint-disable */
export const API_BASE = "https://cricintel-backend-production.up.railway.app";

export const C = {
    bg: "#F0F2F8", surface: "#FFFFFF", border: "#DDE2EF",
    text: "#0A0A0A", muted: "#64748B", accent: "#1E2D6B",
    green: "#00B894", red: "#E53E3E", amber: "#F59E0B", gold: "#C8961E",
    navy: "#1E2D6B", navyMid: "#2A3F82", navyLight: "#4A5FAD",
    sidebarBg: "#141D4A",
};

export const IPL_TEAMS = ["RCB","RR","MI","CSK","KKR","DC","GT","SRH","LSG","PBKS"];
export const PSL_TEAMS = ["KRK","QTG","RWP","ISL","PSZ","MUL"];

export function cleanTeam(name) {
    if (!name) return "";
    const shorts = { "south africa": "SA", "new zealand": "NZ", "west indies": "WI", "sri lanka": "SL", "united arab emirates": "UAE" };
    const n = name.split(",")[0].trim();
    const key = n.toLowerCase();
    if (shorts[key]) return shorts[key];
    if (n.length > 12) return n.split(" ").filter(w => w.length > 1).map(w => w[0]).join("").toUpperCase();
    return n.toUpperCase();
}

export function isMatchEnded(status) {
    if (!status) return false;
    const s = status.toLowerCase();
    return s === "ended" ||
        s.includes("won") || s.includes("win") || s.includes("tied") ||
        s.includes("draw") || s.includes("no result") || s.includes("abandoned");
}

export function getLeague(m) {
    const n = (m.name || '').toUpperCase();
    const t = (m.matchType || '').toUpperCase();
    if (n.includes('IPL') || IPL_TEAMS.some(x => (m.t1||'')===x||(m.t2||'')===x)) return { label: 'IPL', color: '#F59E0B', key: 'IPL' };
    if (n.includes('PSL') || PSL_TEAMS.some(x => (m.t1||'')===x||(m.t2||'')===x)) return { label: 'PSL', color: '#10B981', key: 'PSL' };
    if (n.includes('BBL')) return { label: 'BBL', color: '#EF4444', key: 'BBL' };
    if (t === 'T20' || t === 'T20I') return { label: 'T20', color: '#6366F1', key: 'INT' };
    if (t === 'ODI') return { label: 'ODI', color: '#0891B2', key: 'INT' };
    if (t === 'TEST') return { label: 'TEST', color: '#64748B', key: 'INT' };
    return { label: 'T20', color: '#6366F1', key: 'INT' };
}

export const GLOBAL_CSS = (C) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: ${C.bg}; }
::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
@keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
@keyframes blink2 { 0%,100%{opacity:1} 50%{opacity:0.3} }
@keyframes labelPulse { 0%,100%{box-shadow:0 0 12px currentColor,0 2px 8px rgba(0,0,0,0.2)} 50%{box-shadow:0 0 24px currentColor,0 4px 16px rgba(0,0,0,0.3)} }
.fade { animation: fadeUp .35s cubic-bezier(.22,.68,0,1.2) forwards; }
.card { background: ${C.surface}; border: 1px solid ${C.border}; border-radius: 16px; transition: box-shadow .25s, transform .25s; position: relative; z-index: 1; }
.card:hover { box-shadow: 0 8px 32px rgba(30,45,107,0.15); transform: translateY(-1px); z-index: 2; }
.match-pill { transition: all .2s cubic-bezier(.22,.68,0,1.2); cursor: pointer; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); padding: 8px 12px; background: rgba(255,255,255,0.07); margin-bottom: 5px; color: rgba(255,255,255,0.75); }
.match-pill:hover { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.13); transform: translateX(2px); }
.match-pill.sel { border-color: ${C.gold}; background: rgba(200,150,30,0.18); box-shadow: 0 2px 12px rgba(200,150,30,0.2); }
.tab-btn { background: none; border: none; cursor: pointer; padding: 7px 13px; border-radius: 8px; font-family: Inter, system-ui; font-size: 13px; font-weight: 500; transition: all .2s; color: rgba(255,255,255,0.55); display: inline-flex; align-items: center; justify-content: center; line-height: 1; white-space: nowrap; }
.tab-btn:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.08); }
.tab-btn.on { background: rgba(255,255,255,0.18); color: #fff; font-weight: 700; }
.over-card { border-radius: 14px; border: 1.5px solid ${C.border}; padding: 14px 10px; text-align: center; background: ${C.surface}; transition: all .2s cubic-bezier(.22,.68,0,1.2); cursor: pointer; position: relative; overflow: hidden; }
.over-card:hover { border-color: ${C.navyLight}; transform: translateY(-3px); box-shadow: 0 6px 24px rgba(30,45,107,0.15); }
.over-card.sel { border-color: ${C.navy}; background: linear-gradient(135deg,#EEF3FF,#E5EDFF); box-shadow: 0 4px 16px rgba(30,45,107,0.18); }
.btn-p { background: linear-gradient(135deg, ${C.text}, #333); color: #fff; border: none; border-radius: 10px; padding: 14px 24px; font-family: Inter, system-ui; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; transition: opacity .2s, transform .1s; }
.btn-p:hover { opacity: 0.88; transform: translateY(-1px); }
.btn-p:active { transform: translateY(0); }
@media (max-width: 700px) {
    .sl { display: none !important; }
    .sr { display: none !important; }
    .mg { grid-template-columns: 1fr !important; }
    .cr { grid-template-columns: 1fr !important; }
    .og { grid-template-columns: repeat(2,1fr) !important; }
    .mn { display: flex !important; }
    .mc { padding: 12px !important; padding-bottom: 90px !important; }
    .hn { font-size: 26px !important; }
    /* Hero card — bigger on mobile for thumb reach */
    .hero-cta { padding: 16px 20px !important; font-size: 17px !important; border-radius: 14px !important; }
    /* Full-width trust chips */
    .trust-bar { gap: 5px !important; }
    .trust-bar span { font-size: 9px !important; }
    /* Compact fair odds row */
    .fair-odds { padding: 8px 12px !important; }
}
.mn { display: none; position: fixed; bottom: 0; left: 0; right: 0; background: ${C.navy}; border-top: 1px solid ${C.navyLight}; padding: 8px 0 18px; z-index: 200; box-shadow: 0 -4px 20px rgba(0,0,0,0.15); }
.mt { flex: 1; background: none; border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 0; font-family: Inter, system-ui; }
`;
