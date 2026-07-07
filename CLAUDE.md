# CricIntel Frontend — CLAUDE.md

## ⚠️ Self-Update Rule
**After every code change in this repo, update this CLAUDE.md in the same commit.**
- New component added → add to File Structure section
- Bug fixed → add to Common Bugs Fixed section
- Polling interval changed → update Polling Intervals section
- New pred field used from backend → document it in relevant component section

## Project
- **Live URL:** https://www.cricintelligence.com (custom domain → Vercel)
- **Vercel URL:** https://cric-intelligence-terminal.vercel.app
- **Repo:** https://github.com/devemmadi/cric-intelligence-terminal
- **Deploy:** Vercel — auto-deploys on `git push origin main`
- **Stack:** React (CRA, no TypeScript), plain JS, inline styles

## API
```js
// src/components/shared/constants.js
API_BASE = "https://cricintel-backend-production.up.railway.app"
```
Never hardcode the Railway URL anywhere else — always import from constants.js.

## File Structure
```
src/components/
├── shared/
│   ├── constants.js        ← API_BASE, colors (C), IPL_TEAMS, helpers
│   ├── TeamLogo.jsx
│   └── MatchCard.jsx
├── hooks/
│   └── useMatchData.js     ← ALL API logic (fetchMatches + fetchPred)
├── predictions/
│   ├── PredictionsTab.jsx  ← Main prediction UI (2000+ lines)
│   ├── LiveEngine.jsx      ← Next 3 overs live prediction panel
│   └── ScoreboardTab.jsx   ← Full batting/bowling scorecard (polls /match/<id>/scoreboard every 12s)
├── matches/
│   └── MatchesTab.jsx
├── CricIntelligence.jsx    ← Thin shell, imports everything
└── TrackRecord.jsx         ← Accuracy dashboard
```

## Polling Intervals (useMatchData.js)
- Matches list: every 5s (`setInterval(fetchMatches, 5000)`)
- Prediction: every 12s (`setInterval(fetchPred, 12000)`)
- DO NOT change these without reason — synced with backend cache TTL

## PredictionsTab.jsx — Key Components (DO NOT restructure)
| Component | What it does |
|---|---|
| `HeroDecision` | Main signal card — confidence, %, Claude narrative |
| `PredictionCallBanner` | Secondary banner |
| `MiniTrustBlock` | Track record badge |
| `FeaturedMatchHero` | Pre-match upcoming card |

### HeroDecision — Critical Logic (DO NOT overwrite)
```js
// Confidence from BACKEND signal stacking — not from raw prob%
const _confData = pred.confidenceSignals || {};
const _confLevel = _confData.confidenceLevel || "LOW";
// HIGH   → "🔥 BACKED — 3/3 SIGNALS AGREE" (green)
// MEDIUM → "⏳ WAIT — 2/4 SIGNALS" (amber)
// LOW    → "⚠️ TOO CLOSE TO CALL" (red)

// Claude AI narrative — async fetch every ~3 overs
// useEffect deps: [pred?.id, pred?.innings, Math.floor(overs/3)]
// Calls: POST /claude-analysis with Sky Sports-style prompt
```

### Pitch Label Priority (MATCH CONTEXT section)
Always use this order — never show static venue tag when live data available:
1. `pred.livePitchRead.behavior` (actual ball data, conf HIGH/MEDIUM)
2. Weather override: RAIN/THUNDER/STORM/CLOUD → "Damp conditions"
3. Wickets override: 3+ wkts before over 10 → "Bowling-friendly · X wkts"
4. `pred.pitchLabel` — fallback only

### Data Bullets (3 reasons in HeroDecision)
Real data only — NO generic phrases:
- Inn 1: CRR vs venue avg RPO | striker SR vs bowler eco | next over ML projection
- Inn 2: exact RRR vs CRR with runs needed | partnership or wickets | last 3 overs stats

### Toss Banner
```js
// Uses pred.toss.{winner, decision} from backend
// Only renders if BOTH winner and decision are non-empty
// Format: "🪙 RCB WON TOSS · CHOSE TO BAT FIRST 🏏"
// Sub-label: "Dew factor..." (if field) or "Setting the target..." (if bat)
```

## Colors (from constants.js — always import C)
```js
C.bg = "#080D16"      C.surface = "#111827"   C.accent = "#4A6FD4"
C.green = "#10B981"   C.red = "#EF4444"       C.amber = "#F59E0B"
C.gold = "#C8961E"    C.muted = "#6B7280"     C.text = "#E2E8F0"
```

## CORS (backend whitelist)
These domains are whitelisted on backend:
- https://cricintelligence.com
- https://www.cricintelligence.com
- https://cric-intelligence-terminal.vercel.app
- http://localhost:3000

If adding a new deploy URL, update CORS in app_v5.py too.

## .gitignore — IMPORTANT
`node_modules/` is in .gitignore. NEVER commit node_modules.
History: node_modules was committed before → broke Netlify (permission denied on Linux).
Fixed April 2026 — 38,118 files removed in cleanup commit.

## Dev Workflow
1. Make changes locally
2. `git add <specific files>` (never `git add .` blindly)
3. `git commit -m "..."` 
4. `git push origin main` → Netlify auto-deploys in ~2 min
5. Test on https://cricintelligence.netlify.app

## LiveEngine.jsx — Plain English UX (redesigned May 2026)
Calls `GET /pure-predict/{id}` every 12s. Translates raw numbers into human labels:

| Helper | Input | Output example |
|---|---|---|
| `getMood(pitchBehavior, trend)` | "Flat pitch" | 🔥 Batters are dominating! |
| `getStrikerLabel(sr, balls)` | sr=210, balls=20 | ON FIRE ⚡ |
| `getBowlerLabel(eco, overs)` | eco=5.2, overs=2 | Very tight 🔒 |
| `getWicketLabel(pct, risk)` | pct=45 | DANGER! Wicket very likely 🔴 |
| `getRunsLabel(lo, hi)` | lo=14, hi=18 | 💥 Big over coming! |

Key sections:
- **"WHAT'S HAPPENING RIGHT NOW"** — mood card (replaces technical "PITCH BEHAVIOR")
- **BATTER / BOWLER cards** — plain English performance labels
- **"WHAT TO EXPECT NEXT"** — 3 over cards with big run number + wicket risk line
- Polling: 12s (same as useMatchData.js — DO NOT change)

## ScoreboardTab.jsx — Scoreboard Feature (Jun 17, 2026)
- Tab added to PredictionsTab.jsx view switcher: `📋 Scoreboard` with red `NEW` badge (top-right)
- `activeView` now: `"prediction" | "liveengine" | "scoreboard"`
- `ScoreboardTab` polls `GET /match/<id>/scoreboard` every 12s
- Shows batting table (R/B/4s/6s/SR/dismissal), bowling table (O/M/R/W/Eco), extras, fall of wickets
- Innings selector tabs shown when scoreboard has > 1 innings
- Wickets column highlighted green when bowler.wickets > 0

## BatterMilestones.jsx — Milestone Predictions (Jun 20, 2026)
New file: `src/components/predictions/BatterMilestones.jsx`

Shows Bet365-style milestone probability cards for both current batters.

| Field consumed | Source |
|---|---|
| `pred.batters[].{name, runs, balls, sr, isStriker}` | Current batters at crease |
| `pred.playerAnalysis.batters[].{prob30plus, prob50plus}` | Backend ML probs (used when available) |
| `pred.livePredictions.batsman50.prob` | Striker 50+ prob fallback |
| `pred.playerAnalysis.partnership.ballsLeftMatch` | Balls remaining estimate |

Milestone logic:
- Prefers backend `prob30plus`/`prob50plus` from `playerAnalysis.batters` when `noData !== true`
- Falls back to `livePredictions.batsman50.prob` for striker's 50+ when backend has no career data
- Computes live SR-based probability as final fallback
- Only renders when `!pred.matchEnded && pred.batters?.length > 0`

Rendered in `PredictionsTab.jsx` after `LivePitchReadCard`, before sidebar.

## PitchTab.jsx — Validated Pitch Score (Jun 19, 2026)
New components added at top of `PitchTab.jsx`:

| Component | What it does |
|---|---|
| `computePitchScore(ovRuns, ovWkts)` | JS port of validated Python algo — r=0.689 on 12,951 matches |
| `scoreColor(score)` | Maps 0-10 score to color (red→amber→green) |
| `PitchScoreMeter` | Headline 0-10 gauge with gradient bar + narrative. Reads `pred.pitchScoreValidated` (from backend) or recomputes from `overHistory` |
| `PitchEvolutionChart` | SVG line chart — pitch score after each over, color-coded zones |

Rendered in this order inside `PitchTab`:
1. ConditionBar (chips)
2. **PitchScoreMeter** ← NEW headline
3. **PitchEvolutionChart** ← NEW per-over chart
4. BehaviourTimeline (existing)
5. LiveCard / NextCard / PastRow (existing)

Backend field consumed: `pred.pitchScoreValidated.{score, label, narrative}` (added Jun 19 backend commit c623c85f)

## SEO — Per-Tab Canonical + Meta (Jul 3, 2026)
`CricIntelligence.jsx` `useEffect` sets canonical URL, `document.title`, and `<meta name="description">` on every `activeTab` change (and when live match teams load for the predict tab).

| Tab | Canonical URL |
|---|---|
| predict | `https://www.cricintelligence.com/` |
| matches | `https://www.cricintelligence.com/?tab=matches` |
| pitch | `https://www.cricintelligence.com/?tab=pitch` |
| record | `https://www.cricintelligence.com/?tab=record` |
| media | `https://www.cricintelligence.com/?tab=media` |

`src/index.js` has `<HelmetProvider>` wrapper (react-helmet-async installed). Canonical tag is set via `setCanonical()` DOM helper — no `<Helmet>` components needed (DOM manipulation is sufficient for SPA SEO).

## Common Bugs Fixed
- Netlify "react-scripts: Permission denied" → node_modules in git (FIXED)
- Old Railway URL in build → was `web-production-91f0.up.railway.app` (FIXED, now correct)
- "Flat pitch" showing during thunderstorm + 3 wickets → livePitchRead + weather override (FIXED)
- Toss showing "won ·" empty → null guard added (FIXED)
- Generic bullet phrases → replaced with real match data (FIXED)
- LiveEngine showing raw numbers/factors → redesigned to plain English labels (FIXED May 2026)
- Win probability displayed as fake high % (e.g. 97%) → capped at 75% max, floor 25% (FIXED May 2026)
- MiniTrustBlock too subtle → redesigned as full social proof card: 38px hit rate, accuracy bar, last verified prediction tag (FIXED May 2026)
- HeroDecision card no visual state change → dynamic border: RED pulse when pressureScore>70, GREEN glow when prob>=65 (FIXED May 2026)
- Decision Zone sidebar generic → VERDICT + STRONGEST SIGNAL with live CRR/RRR/pressure specific numbers (FIXED May 2026)
- Global keyframes: added redGlow + greenGlow to constants.js for border animations (May 2026)

## Mobile UX — Bottom Nav + Swipe Gestures (Jul 7, 2026)
Targeting UK and South Africa mobile users.

- Mobile bottom nav (`.mn`): upgraded from text-only to emoji + label (🏏 Predict, 📅 Matches, 🟤 Pitch, 🎯 Record, 📰 Media, 💰 Odds)
- Touch target height increased: `.mt` now `min-height: 52px` (was ~32px)
- Swipe gestures in `PredictionsTab.jsx`: left/right swipe switches between Prediction → Live Engine → Scoreboard views (60px threshold)
- Swipe indicator dots shown below view switcher on mobile (`.mob-swipe` class, `display:none` on desktop)
- `VIEWS` array: `["prediction", "liveengine", "scoreboard"]` — order is fixed, swipe follows this order

## User Preferences
- Telugu + English mixed communication is fine
- Push to GitHub directly — no local testing required before deploy
- Loosely coupled code — new features = new component files
- One file change should not break others
- Keep PredictionsTab.jsx sections intact — don't restructure existing components
