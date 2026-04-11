const fs = require('fs');
const path = require('path');

const f = path.join(process.cwd(), 'src', 'components', 'CricIntelligence.jsx');
const lines = fs.readFileSync(f, 'utf8').split('\n');

// Find sidebar section boundaries
let sStart = -1, sEnd = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Live now') && sStart < 0) sStart = i;
    if (sStart > 0 && lines[i].trim() === '))}' && i > 1030) { sEnd = i; break; }
}

console.log('Found: sStart=' + (sStart+1) + ' sEnd=' + (sEnd+1));

if (sStart < 0 || sEnd < 0) {
    console.log('ERROR: Could not find section boundaries');
    process.exit(1);
}

const newSection = [
'                            {(() => {',
'                                const IPL_T = ["RCB","RR","MI","CSK","KKR","DC","GT","SRH","LSG","PBKS"];',
'                                const PSL_T = ["KRK","QTG","RWP","ISL","PSZ","MUL"];',
'                                const isIPL = function(m) { return IPL_T.some(function(t) { return (m.t1||"")===t||(m.t2||"")===t; }); };',
'                                const isPSL = function(m) { return PSL_T.some(function(t) { return (m.t1||"")===t||(m.t2||"")===t; }); };',
'                                const mk = function(m) { return function() { setSelectedMatch(m); setCurMatchId(m.id||m.matchId||null); setActiveTab("predict"); }; };',
'                                const groups = [',
'                                    { key:"IPL", label:"IPL 2026", color:"#F59E0B", ms: liveMatches.filter(function(m){ return isIPL(m); }) },',
'                                    { key:"PSL", label:"PSL 2026", color:"#10B981", ms: liveMatches.filter(function(m){ return isPSL(m); }) },',
'                                    { key:"INT", label:"International", color:"#6366F1", ms: liveMatches.filter(function(m){ return !isIPL(m) && !isPSL(m); }) },',
'                                ];',
'                                return groups.map(function(g) {',
'                                    if (g.ms.length === 0) return null;',
'                                    return (',
'                                        <div key={g.key}>',
'                                            <div style={{ fontSize: 10, fontWeight: 700, color: g.color, letterSpacing: 1, margin: "10px 0 5px", display: "flex", alignItems: "center", gap: 5 }}>',
'                                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: g.color, display: "inline-block" }}></span>',
'                                                {g.label}',
'                                            </div>',
'                                            {g.ms.map(function(m) {',
'                                                return <MatchPill key={m.id} m={m} selected={selectedMatch != null && selectedMatch.id === m.id} onClick={mk(m)} />;',
'                                            })}',
'                                        </div>',
'                                    );',
'                                });',
'                            })()}'
];

const before = lines.slice(0, sStart);
const after = lines.slice(sEnd + 1);
const final = before.concat(newSection).concat(after);

fs.writeFileSync(f, final.join('\n'), 'utf8');
console.log('Done! Lines: ' + final.length);
