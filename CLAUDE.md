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
├── AffiliateBanner.jsx     ← Picks ONE partner per visitor (Jul 25 2026)
├── BetwayBanner.jsx        ← Betway affiliate banner (Bet £10 Get £40)
├── WilliamHillBanner.jsx   ← William Hill affiliate banner (Bet £10 Get £30, Jul 22 2026)
├── shared/
│   ├── affiliates.js       ← AFFILIATES config + affiliateHref() — ALL tracking links
│   ├── constants.js        ← API_BASE, colors (C), IPL_TEAMS, helpers
│   ├── TeamLogo.jsx
│   └── MatchCard.jsx
├── hooks/
│   └── useMatchData.js     ← ALL API logic (fetchMatches + fetchPred)
├── predictions/
│   ├── MatchupCard.jsx     ← Batter vs current bowler head-to-head (Aug 15 2026)
│   ├── FeedbackPrompt.jsx  ← Asks what looked wrong, after 4 min (Aug 15 2026)
│   ├── PlayerMarkets.jsx   ← Player runs Over/Under (Jul 25 2026)
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

## MatchupCard.jsx — Batter vs Bowler Head-to-Head (Aug 15, 2026)
New file: `src/components/predictions/MatchupCard.jsx`, rendered in `PredictionsTab.jsx`
just before `PlayerMarkets`.

Reads `pred.matchups` (added to the backend the same day). MATCHUP_DB has held 64,968
of these records since the model was built and only the model ever read them —
"Kohli has faced Ashwin 157 balls for 181, out once" needs no explaining the way a
probability does.

A **record, not a forecast**: balls, runs, dismissals, strike rate, with the ball count
shown so a reader can weigh a thin sample. Colour keys off strike rate only —
dismissals are too sparse in these samples to read as good or bad. The backend drops
pairs under 6 balls, so the card renders nothing rather than something misleading.

**`useMatchData.js` merge gotcha:** `merged` starts from the `/match/<id>` response and
copies only *explicitly named* fields across from `/predict`. A field added to
`/predict` alone is silently dropped and looks like a broken component. `matchups` is
named there for that reason. **Add any new prediction field to that list.**

## FeedbackPrompt.jsx — "What looked wrong?" (Aug 15, 2026)
New file: `src/components/predictions/FeedbackPrompt.jsx`, rendered in `PredictionsTab.jsx`
next to the sticky bar. POSTs to `/feedback`.

The question is deliberately **not** "was this accurate?" — nobody can judge a
probability from one match (a 68% call is meant to be wrong a third of the time), so a
viewer scoring one result is scoring noise. It asks whether the number matched what
they were watching, and on "no", *when* it looked wrong. That names a defect; a star
rating never would.

- Waits **4 minutes** (`MIN_WATCH_MS`) so it asks people who used the thing
- Once per match per browser (`ci_fb_<matchId>` in localStorage), answered or dismissed
- POST is fire-and-forget — a failed request must never interrupt someone watching
- **`?feedback=now`** shows it immediately and ignores the once-per-match record

## Analytics bot + internal-traffic filter (Aug 15, 2026)
In `public/index.html`, above the gtag snippet. The tag is now loaded **conditionally**.

GA4 drops known crawlers off the IAB list but not headless browsers or scrapers
presenting an ordinary Chrome UA — the Phoenix and Prineville sessions in the reports
are datacenter regions, not places people watch cricket. The check is deliberately
narrow (wrongly dropping a real visitor is worse than counting a bot): only
`navigator.webdriver`, an openly declared headless/bot UA, and prerendered tabs.
**No fingerprinting** — nothing on screen size or plugins, which real browsers trip.

**`/?internal=1`** stops counting that device (stored in localStorage, so unlike GA's
IP-based filter it survives mobile data); **`/?internal=0`** undoes it. Both show a
15-second on-screen confirmation — without it there was no way to tell it had worked.

## Static league + international pages (Jul 29, 2026)
Generated, not hand-written — `scripts/gen_league_pages.py` and
`scripts/gen_international_pages.py`, both fed by `scripts/league_data.py`.

10 evergreen league pages (`/predictions/<slug>-predictions`) and 8 international
matchups (`/predictions/international/<a>-vs-<b>`), each built from that competition's
real ground records so no two read alike. **URLs carry no year** — fixture pages go
stale when a competition ends; league pages earn traffic every season.

**Two data traps `league_data.py` exists to prevent** (both found before publishing):
- Fuzzy venue matching is wrong. "oval" pulls in Botswana, Entebbe and Kuala Lumpur;
  "national stadium" merges Karachi, Hyderabad and Mirpur. **Every venue is an exact key.**
- One ground appears under several keys — "m chinnaswamy stadium",
  "m chinnaswamy stadium, bengaluru", "m.chinnaswamy stadium" are one venue with 111
  matches, not three. Keys are grouped per ground and averaged weighted by match count.

A first pass without these reported IPL at 844 matches across 25 venues; correct is
**569 across 10**. Re-run the generators after editing `venue_stats.json`, and check new
keywords both ways — must-match and must-not-match (Ranji, Vijay Hazare, ECA European Cup).

## PlayerMarkets.jsx — Player Runs Over/Under (Jul 25, 2026)
New file: `src/components/predictions/PlayerMarkets.jsx`, rendered in `PredictionsTab.jsx`
directly after `BatterMilestones`.

Sportsbook-style Over/Under markets for each batter at the crease, laid out like a
bookmaker's market list: `{name} · Runs · ({line}) · {n} Innings` above stacked
Under/Over rows.

**The number in each box is a model probability, not a price — and that is not a
styling choice.** There is no real price available: `the-odds-api` returns
`INVALID_MARKET` for `batter_runs` / `player_runs` on cricket (only `h2h` exists, and
the key is currently `OUT_OF_USAGE_CREDITS`). Deriving a price from our own
probability would put an invented, bettable-looking number on a page that links
straight to real bookmakers. Do not "finish" this component by adding decimal odds
unless a genuine player-props feed is wired up first.

| Line shown | Backend field | Same event as |
|---|---|---|
| Over 19.5 | `playerAnalysis.batters[].prob20plus` | final score ≥ 20 |
| Over 29.5 | `prob30plus` | ≥ 30 |
| Over 49.5 | `prob50plus` | ≥ 50 |

Lines the batter has already passed are dropped (settled, not a market). Under = 100 − Over.

**Reads backend values only — never computes a fallback.** `BatterMilestones.jsx` has a
local `computeProbs()` logistic fallback for when backend data is missing; that formula
is unvalidated and now disagrees with the corrected backend. An unvalidated shadow
model rendering inside a betting-shaped box is exactly what to avoid, so if
`playerAnalysis` is absent this component renders nothing.

**These probabilities are backtested** (backend commit Jul 25 2026, see
`cricintel-backend/backtest_batter_milestone_holdout.py`): 326 matches / 15,000
predictions on unseen 2025-26 data, bias +4.9 / +4.8 / +2.3 points on the 20+/30+/50+
lines, ~30% Brier skill over base rate on each. Before that fix they ran 10-23 points
high and `prob50plus` was *worse than quoting a constant*. If the backend milestone
formula is touched again, re-run that backtest before shipping.

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

## Addiction / Retention Features (Jul 15, 2026)

### UserPrediction.jsx — "What's Your Call?"
New file: `src/components/predictions/UserPrediction.jsx`

- Shows "WHO WINS THIS MATCH?" two-button UI before user picks
- After pick: shows selected team + live win% for that team + delta since pick
- After match ends: shows WIN/LOSS result + share button (Web Share API or clipboard fallback)
- Shareable text: "I predicted [Team] to win — nailed it! 🎯 cricintelligence.com"
- Tracks cumulative accuracy record in `localStorage("ci_pred_record")` `{wins, losses}`
- Per-match pick stored in `localStorage("ci_pick_${matchId}")`
- No login required — fully localStorage based
- Rendered in `PredictionsTab.jsx` above HeroDecision in prediction view

### AiCalledIt.jsx — "AI Called It" Banner
New file: `src/components/predictions/AiCalledIt.jsx`

- Fires when probability swings ≥ 22% between polls → "🔮 AI CALLED IT — [Team] swung momentum X%"
- Fires when wicket falls after high wicket-risk signal (>55%) → "🔮 AI CALLED IT — predicted high wicket risk..."
- Auto-dismisses after 5s, manual × close also available
- Renders above HeroDecision, below UserPrediction

### FOMO Push Notifications — Probability Swing Trigger
Added in `PredictionsTab.jsx` (fomoRef useEffect):

- Fires ServiceWorker `showNotification` when |prob change| ≥ 22% between polls
- Rate-limited: max 1 notification per 2 minutes per match
- Only fires when user already has push enabled (pushStatus === "on")
- Message: "Match ALIVE — [Leading team] now at X% 🔥"

## Next-Over Card — Dual Range Display (Jul 15, 2026)
`PredictionsTab.jsx` ~line 2519 (inside the "Next N overs prediction" card, both the O/U-betting branch and the plain expected-runs branch): added a caption below the big expected-runs number showing `ov.runRange` (tight, ~70%-coverage estimate — unchanged, already existed) alongside the new `ov.range90` field (wider ~90%-coverage band) from the backend: "Likely: {runRange} runs · Safe range (rarely wrong): {range90}". Guarded with `{ov.runRange && (...)}` — renders nothing if the backend hasn't added the field yet (older cached responses), so this is safe to deploy independently of the backend rollout.

Backend context: 90% coverage on the tight range alone would require widening it to near-uninformative width (~+/-7-10 runs on an 8-run over) — inherent per-over variance in T20, not a fixable model gap. `range90` gives users who want a rarely-wrong number a separate, honestly-labeled wider band instead of silently widening the primary estimate. See `cricintel-backend/CLAUDE.md` "Session 8" for the measurement.

## video/ — Daily YouTube Short generator (Jul 24, 2026)
Python toolkit (not part of the React build, not bundled, not deployed) that renders a
vertical 1080x1920 promo video from live backend data into `drafts/`. Full docs in
`video/README.md`.

```bash
python video/make_short.py            # auto-rotates format by day-of-year
python video/make_short.py --voice    # + Windows SAPI voiceover
```

| File | Job |
|---|---|
| `video/brand.py` | Palette (mirrors `shared/constants.js` C.*), fonts, Pillow primitives |
| `video/ci_data.py` | Only file that calls the backend — `/matches`, `/predict`, `/backtest-results`, `/match-record` |
| `video/scenes.py` | Storyboards, one builder per content type |
| `video/render.py` | Pillow frames piped to ffmpeg (imageio-ffmpeg binary), optional TTS mux |
| `video/make_short.py` | CLI; writes `drafts/<date>-youtube-short.{mp4,md}` |

**Voice:** `edge-tts` neural (default `en-IN-PrabhatNeural`, rate `+18%`), free and
keyless, network call to Microsoft carrying only the narration line. Falls back to
offline Windows SAPI, then to silent. `--voice-name` / `--voice-speed` override.

**Motion:** `brand.motion_bg` (drifting orbs, composited with `ImageChops.add` — an
opaque ellipse over the plate glow reads as a grey blotch), `brand.retention_bar`,
`brand.kinetic` (word-by-word headlines), `brand.pop` / `shake` / `_flash`. Both the
background and retention bar are drawn by `render._render_frames`, not by scenes.
Pacing rule: no beat holds longer than ~3s. On the accuracy payoff frame all bars
share one grow factor — a per-bar stagger let a late checkpoint read lower than an
earlier one mid-animation, inverting the claim.

**Four formats:** `predictions` (fixtures + animated win%), `record` (backtest accuracy
by checkpoint), `stats` (pitch meter + model error facts), `recap` (completed results).
`auto` = `day_of_year % 4`, falling through to whichever format has data.

**Never uploads** — writes drafts only, matching the own-channel stance in
`drafts/2026-07-23-youtube.md`.

**Claim guards (deliberate — don't loosen without a reason):**
- `record` labels its numbers "Backtest · 400 IPL matches" because `/match-record` is
  still empty (backend only logs crystal-clear calls). `ci_data.fetch_live_record()`
  already reads it; swap the label when it has rows.
- Prediction headline follows `confidenceSignals.confidenceLevel` — HIGH "MODEL FAVOURS",
  MEDIUM "MODEL LEANS", else "SLIGHT EDGE". The big % is coloured by confidence, not by
  its own magnitude.
- `probLowConfidence` renders an "early innings" caveat line on the card.
- Pitch scene is skipped before the first ball — backend returns a neutral 5.0 /
  "No data" placeholder that would read as a real signal.

**If `shared/constants.js` colours change, change `video/brand.py` PALETTE in the same
commit** — it is a copy, not an import.

## Affiliate Slots — One Partner Per Visitor (Jul 25, 2026)

`shared/affiliates.js` is the **single source of truth for every affiliate tracking
link**. Never paste a tracking URL into a component — import `affiliateHref(name,
placement)` instead.

| Partner | Network | IDs |
|---|---|---|
| `williamhill` | Income Access | affid 1745040, siteid 215184 (cricintelligence.com), adid 1439 |
| `betway` | SuperPartners | affiliate id sp53067 |

**Primary vs secondary.** `PRIMARY` in `AffiliateBanner.jsx` names the partner that
owns the prominent slots — desktop sidebar card, mobile card and mobile sticky bar,
all reading it through `useAffiliateBrand()`. Change that one constant and every
prominent surface follows. Secondary partners get `<BetwayBanner compact />`, a
single-line strip placed far down the page instead.

Currently **William Hill is primary** (Jul 25 2026). Betway ran for two months and
produced 14 clicks / 0 signups / $0.00, and William Hill pays 30% revenue share, so
it gets the traffic. Betway stays live in the compact slot rather than being dropped,
so there is still a comparison to read if William Hill also fails to convert.

**Why not both at full size:** the sidebar previously stacked `<WilliamHillBanner />`
directly above `<BetwayBanner />` while a third hardcoded Betway bar sat at the bottom
on mobile. Three competing gambling brands on one screen reads as ad spam and costs
more in trust than it gains in clicks.

Attribution is read in the **partner's own reports** — nothing is logged from this
codebase:

| Placement | William Hill (`c=`) | Betway (`a=`) |
|---|---|---|
| Desktop sidebar (primary) | `c=sidebar` | — |
| Mobile card (primary) | `c=mobile` | — |
| Mobile sticky bar (primary) | `c=stickybar` | — |
| Sidebar compact (secondary) | — | `a=sidebar-secondary` |
| Mobile compact (secondary) | — | `a=mobile-secondary` |

**Geo is deliberately NOT part of the choice** — both offers are UK (`en-gb`, £
denominated), so there is currently nothing to route non-UK visitors to. If a non-UK
brand is ever added, geo routing belongs in `pickBrand()` in `AffiliateBanner.jsx`.

**Offer copy lives in `affiliates.js`** (`offerLead` / `offerHighlight`) so the full
banner and the sticky bar can never drift apart. An overstated or stale offer claim is
grounds for an affiliate account being pulled — if a partner changes their offer,
change it here and in the matching banner component in the same commit.

**1xBet is intentionally not wired up.** It lost its UK licence in 2020 and cannot be
advertised to UK users; this site is UK-angled (UKGC references, £ offers, GamCare /
GAMSTOP / national helpline in the age gate), so adding it would undercut the site's
own credibility. Revisit only if traffic data shows the audience is overwhelmingly
non-UK.

## Tournament hub pages — TheHundred2026.jsx / VitalityBlast2026.jsx (Jul 26 2026)
Two new UK-focused hub pages, plus routes in `App.js`:

| Route | Component | Notes |
|---|---|---|
| `/predictions/the-hundred-2026` | `TheHundred2026.jsx` | 8 teams w/ home grounds, links to all 28 matchup pages, 100-ball format explainer, FAQPage schema |
| `/predictions/vitality-blast-2026` | `VitalityBlast2026.jsx` | Finals Day section, all 18 counties split North/South, 6 derby matchup links, FAQPage schema |
| `/predictions/vitality-blast-2026-quarter-finals` | `VitalityBlast2026.jsx` | Old sitemap slug, pointed at the same component so the indexed URL isn't dead |

**Bug this fixed:** `/predictions/the-hundred-2026` and `/predictions/vitality-blast-2026-quarter-finals` were already in sitemap.xml but had **no route**, so they fell through to `/predictions/:matchup` → `MatchPredictionPage` → no `-vs-` in slug → `navigate("/")`. Both were dead URLs redirecting to home while being submitted to Google.

Also: `CricketPredictionsUK.jsx` gained a "UK Domestic T20" section linking to both hubs, and the broken `href="/record"` link (no such route) was corrected to `/?tab=record` in `CricketPredictionsUK.jsx` and `HowItWorks.jsx`.

`.claude/launch.json`: dropped the hardcoded `"port": 3000` and set `"autoPort": true` so a second session can start its own dev server instead of colliding.

**Note on nested anchors:** the existing pages wrap `<Logo />` (which itself renders a react-router `Link`) in an `<a href="/">`, producing `<a>` inside `<a>` hydration warnings in the console. The two new hub pages render `<Logo />` bare. The older pages still have the nested pattern — not touched here.

**Marketing claims corrected sitewide (Jul 26 2026).** Nine components carried figures nothing in the codebase could evidence. Replaced with what the backend can actually show:

| Old claim | Replaced with | Evidence |
|---|---|---|
| "1.7 million cricket matches" | "a decade of ball-by-ball T20 data (2017-2026)" | Cricsheet T20 corpus; no 1.7M figure exists anywhere |
| "877 venues" | "335 tracked venues" | `len(venue_stats.json)` in the backend repo = 335 |
| "78% accuracy" / "80.2%" / "74%+ verified" | "81.5% on unseen 2025-2026 matches" | `backtest_comprehensive.py --holdout`, trained 2017-2024, tested on 2,546 unseen matches — re-verified Jul 2026, see backend CLAUDE.md |
| "publicly verified on the Track Record page" | "logged on the Track Record page as they resolve" | `/match-record` currently returns 0 resolved rows, so nothing is publicly verified yet |
| "accurate to within ±5%" | removed | no measurement behind it |

Files touched: `CricketPredictionsUK.jsx`, `AboutUs.jsx`, `FAQ.jsx`, `CricketWinProbability.jsx`, `HowItWorks.jsx`, `InternationalPredictionPage.jsx`, `MediaTerminal.js`, `IPL2026Predictions.jsx`, `T20Predictions.jsx`, `MatchPredictionPage.jsx`. **Why it matters:** the site is gambling-adjacent and UK-facing, so unevidenced accuracy claims are an ASA/CAP exposure, not just a tidiness issue. Keep any future accuracy number tied to a named backtest script. Note `CricketWinProbability.jsx` still shows "82.3% death overs" and "±3.9% average error" alongside the corrected 81.5% — those two were left as-is and have not been traced to a backtest; worth verifying or removing next time this file is touched.

## SEO — The Hundred 2026 full matchup coverage (Jul 26 2026)
Added sitemap entries for all 28 unique Hundred men's team pairings (21 new + 7 already present). This is legitimate rather than doorway-page spam because the 2026 format has **every team playing every other team once** (7 matches each) plus a regional-derby rematch = 32 group games, so each pairing is a real fixture at some point between Jul 21 and Aug 12. All 8 team slugs already existed in `MatchPredictionPage.jsx` `TEAMS`; verified two of the new URLs render (london-spirit-vs-welsh-fire, birmingham-phoenix-vs-southern-brave). Priority 0.88, changefreq daily. Motivation: user is UK-targeted and GA showed Organic Search sessions +240% w/w, so UK-tournament pages are the highest-leverage SEO surface.

## ⚠️ SEO — this is a client-rendered SPA, so static HTML is the ONLY thing Google reliably sees
`public/index.html` ships an empty `<div id="root"></div>`. Every one of the ~84 sitemap URLs serves that same shell with the same generic title until React boots, so per-route `<title>`/meta set in `useEffect` only exist after JS executes. The workaround in this repo is hand-written prerendered pages in `public/predictions/*.html`, wired up by **explicit rewrites in `vercel.json`** (Vercel checks the filesystem before rewrites, and the files are `.html` while the URLs are extensionless — so without a rewrite the catch-all `/(.*) → /index.html` swallows them).

**Fixed Jul 27 2026:** three prerendered pages existed but had no rewrite, so Google was still being served the empty shell for them — `the-hundred-2026.html`, `vitality-blast-2026-quarter-finals.html`, `mi-london-vs-sunrisers-leeds-2026.html`. Added their rewrites. **Rule: adding a file to `public/predictions/` does nothing on its own — you must add the matching rewrite to `vercel.json`, and every rewrite destination must exist or the URL 404s.** Also corrected "877 venues" → "335 venues" in `ipl-2026.html` (matches `len(venue_stats.json)`); the static pages' "1.7 million ball-by-ball records" phrasing was left alone — that's deliveries, not matches, which is plausible, unlike the React components' old "1.7 million cricket matches".

Note the React routes for these slugs (`TheHundred2026.jsx`, `VitalityBlast2026.jsx`) still exist and are what renders in local dev; in production the static file wins. Keep both in sync if the content changes materially.

**Generator: `scripts/gen_static_matchups.py` (added Jul 27 2026).** Writes prerendered HTML for all 28 Hundred matchup pairings and patches `vercel.json` in one go (`--write-vercel`; `--dry-run` to preview). Key behaviours worth knowing before re-running it:
- Generated files carry a `<!-- generated by scripts/gen_static_matchups.py -->` marker. Files **without** that marker are treated as hand-written and are never overwritten — that's why `mi-london-vs-sunrisers-leeds-2026.html` is skipped.
- It always re-appends the `/(.*) → /index.html` catch-all **last**; Vercel evaluates rewrites in order, so a catch-all placed above the specific rules would swallow every page.
- Content mirrors `MatchPredictionPage.jsx` (same rating-derived pre-match %, same clamp of 38-72) and reuses the site's evidenced figures — 81.5% holdout, 335 venues. Don't let the static and React copies drift on accuracy claims.
- To extend to Blast/IPL matchups, add a team dict alongside `HUNDRED` and pass it to `page()`; the rest is competition-agnostic.

## Telegram Channel CTA (Aug 9 2026)
The site had **zero mention of the Telegram channel** (`https://t.me/CricIntelligence`) anywhere, despite the channel being actively promoted externally (hourly live-match posts). Real site traffic (organic search +240% w/w) had no way to discover or join it — the actual growth bottleneck, not posting frequency. Added a plain `📢 Join our Telegram for live updates` / `📢 Join us on Telegram` link (gold, `C.gold`) in three places:
- `SubscribeCard.jsx` compact version (desktop sidebar, below the email form)
- `SubscribeCard.jsx` full version (mobile, below the email form, its own divider)
- `RGFooter.jsx` (site-wide footer, first item in the links row)

All three link directly to `https://t.me/CricIntelligence`, `target="_blank"`. No tracking/UTM params attached (Telegram doesn't support query-string attribution the way the affiliate links do) — if channel-growth attribution is ever needed, that's the gap to fill.

## Quota-paused banner — dataStale (Aug 19 2026)
`useMatchData.js` returns `dataStale`; `CricIntelligence.jsx` renders an amber strip
under the nav when it is true.

The backend sets `quotaExhausted` on `/matches` when the Cricbuzz monthly allowance
runs out, and **keeps serving the last known matches** rather than an empty list. The
hook only acted on that flag inside `if (!list.length)`, so when quota ran out
*mid-match* — which is exactly what happened on Aug 19, one live match still in the
payload — nothing fired at all: a frozen scoreline kept rendering as live and simply
never moved. For a visitor that reads as a broken prediction, which is worse than an
empty site, so `setDataStale` now runs on every response regardless of list length.
The existing empty-list handling (mark matches ENDED, clear cached pred) is unchanged.

The banner says the feed is paused and resets shortly, and points out that ground
records and accuracy pages are unaffected — those pages are static and genuinely still
work, so they are the safe thing to promote during a quota gap.

## Empty state now links to the evergreen pages (Aug 22 2026)
`EvergreenLinks` in `PredictionsTab.jsx`, rendered inside `NoMatchesScreen` above
`MockPredictionDemo`. 10 league pages + 4 international matchups, all verified 200.

**Why:** a real visitor emailed twice saying the site "isn't working" (Aug 21 21:47,
Aug 22 08:46). It was up — `/` 200, backend 200 — but the Cricbuzz quota ran out at
04:35 on Aug 22, so `/matches` returned an empty list and the homepage fell through to
`NoMatchesScreen`, which showed an intro, a **mock** prediction demo and nothing a
visitor could actually click. Reading "no match live right now" next to a fake demo is
indistinguishable from a broken site.

The prerendered `/predictions/*` pages need no live feed at all — they are built from
`venue_stats.json` — so they are exactly what should be offered when the feed is down.
They go **above** the demo deliberately: the demo is a mockup, and the real pages
should be the first thing a stranded visitor sees.

**Keep the two lists in sync with `public/predictions/`.** They are hardcoded, and a
link to a page that does not exist 404s — worse than the empty state it replaces.
Re-check with a HEAD request per URL after editing.

## Accuracy page now shows the calibration table (Aug 22 2026)
`AccuracyDashboard.jsx` reads `win_probability.calibration` from `/backtest-results`
and renders it after `IndustryComparison`.

**Why:** a Google AI review said the 81.5% was "just a marketing number". Half fair —
the figure is a real true-holdout measurement, but the page showed only the number and
never the evidence, so a sceptic had nothing to check.

**The calibration table is the part that cannot be faked.** A hit-rate can be inflated
by only ever backing the obvious favourite; a calibration curve cannot. Grouped by what
the model said, then compared with what actually happened, across 19,340 predictions:
3.8% / 15.3% / 25.4% / 34.5% / 43.9% / 50.4% / 62.1% / 72.5% / 81.1% / 96.1% — monotonic,
worst gap 4.6 points. The data had been in the endpoint since Aug 15 and simply was not
rendered.

**Still unanswered, and it is the sharper criticism:** live win probability adds little
when the scoreboard already makes the answer obvious. Value only exists where a viewer's
read is uncertain or wrong — early innings (over 6 is 79.2%), close games, and moments
where the model disagrees with the obvious read. Presenting the number identically at
every stage invites exactly this complaint. Not addressed yet; it is a product change,
not a model change.

## ContrarianCall.jsx — shows the number only when it contradicts the scoreboard (Aug 22 2026)
New file: `src/components/predictions/ContrarianCall.jsx`, rendered in `PredictionsTab.jsx`
immediately above `HeroDecision`.

**Why:** a Google AI review made the sharpest criticism the site has had — live win
probability mostly tells you what you can already see. A side needing 20 off 30 with
eight wickets is obviously winning; printing "89%" beside that is decoration, and a
reader is right to say so. The number only earns attention when the viewer's own read
would be **wrong**.

So this card renders **only** when the model and the plain scoreboard read disagree by
15+ points, and is silent otherwise. It is meant to be rare.

**`plainRead()` is a model of a VIEWER, not of cricket.** It is a crude proxy for what
someone concludes from "are they ahead of the rate" and "how many wickets are left". It
is never backtested and **its value is never displayed** — only the direction of the gap
is. Putting that percentage on screen would create an unvalidated second model competing
with the real one, which is exactly what `PlayerMarkets.jsx` refuses to do. Do not.

**Second innings only**, and only from over 4. A chase has an explicit target, so "what
the scoreboard plainly says" is a real shared thing; in the first innings there is no
target and nothing to disagree with.

Verified against eight hand-built states: obvious win (gap 6) and obvious loss (gap 3)
stay silent, ordinary close game (gap 3) stays silent, while "ahead on rate but 8 down"
(gap -15) and "behind on rate but all wickets intact" (gap +20) both fire. Innings 1,
over 2, and ended matches are all correctly suppressed.

**If it starts appearing every over, raise `MIN_GAP`.** A card that always shows teaches
viewers to ignore it, which defeats the entire purpose.

## Non-UK visitors now see an ad unit where the bookmaker banner would be (Aug 22 2026)
`PredictionsTab.jsx` mobile slot: `showAffiliates ? <AffiliateBanner/> : <AdUnit/>`.

`isUkVisitor()` already hid the bookmaker banners outside the UK, which left mobile
visitors from India and Bangladesh — a growing share of real traffic — seeing nothing at
all in that slot. The desktop sidebar has carried an `AdUnit` all along; mobile had none.

**The geo gate is a legal requirement, not just a conversion tweak.** India's Promotion
and Regulation of Online Gaming Act 2025 bans advertising real-money gaming outright,
with penalties up to 2 years' imprisonment and a ₹50 lakh fine, and a regulator (OGAI)
was created in May 2026 to enforce it. Gambling is illegal in Bangladesh. **Never remove
the geo gate, and do not add a bookmaker aimed at those markets** — AdSense is the
monetisation that is both legal and available there.

## ReportProblem.jsx — an always-available way to complain (Aug 22 2026)
New file: `src/components/shared/ReportProblem.jsx`, rendered by `RGFooter.jsx`, so it
is on **every page** of the site.

**The gap it closes.** `FeedbackPrompt.jsx` only appears once a match is selected, is
still live, and the visitor has stayed four minutes. That is the narrowest possible
window and it misses the moments people actually want to complain.

Proof, from the same week: a visitor emailed twice. First that the site "isn't working"
— the Cricbuzz feed had run out, so there were **no matches at all** and the prompt could
never have rendered. Then that the live score was two overs behind, which turned out to
be a real defect that had been shipping for a month. He only reached us because he went
hunting for the address on the About page. Almost nobody does that; they just leave.

**Design choices, deliberate:**
- **One free-text box, no star rating.** A rating tells you nothing you can act on;
  "score stuck two overs behind" names a defect. Same reasoning as `FeedbackPrompt`.
- **No email field.** Asking for one costs more reports than the replies are worth.
- **Fire-and-forget POST**, and it thanks the visitor even if the request fails — showing
  an error to someone already annoyed loses the report and the person.
- Posts to the existing `/feedback` with `source: "footer"`, so footer reports can be told
  apart from in-match ones in the log.

**Verified against production:** a footer-shaped body with no match context returns
`{"ok": true}` / 200, and a malformed rating still returns 400. One test entry labelled
"TEST from footer … verification only" exists in the feedback log from that check.

**Read the reports:** `GET /feedback/recent` on the backend, admin token required.

## Prerendered content pages — /accuracy, /how-it-works, /faq (Aug 23 2026)
`scripts/gen_content_pages.py` (new) writes `public/accuracy.html`,
`public/how-it-works.html`, `public/faq.html` and patches `vercel.json`.

**Why:** AdSense refused the site with two reasons — *"Google-served ads on screens
without publisher-content"* and *"Low value content"* (Sites page, last checked May 21
2026). Both describe the same thing: 17 React routes serve the same **375-word shell**,
because content only exists after JavaScript runs. That is also why they do not rank,
which is the actual traffic bottleneck — measured at 116 users / 2,495 views in 28 days.

Served word counts, same measurement (tags and script stripped):

| | words |
|---|---|
| `public/index.html` shell | 375 |
| an existing `predictions/*` page | 814 |
| new `/accuracy` | **576** |
| new `/how-it-works` | **678** |
| new `/faq` | **527** |

**Accuracy figures are fetched from `/backtest-results` at generation time, never typed.**
If the holdout is re-run and the number moves, regenerating updates the prose. Hardcoding
"81.5%" into HTML is exactly how the July marketing copy ended up claiming things the
backend had stopped saying. The generator **refuses to run** if the endpoint reports under
100 predictions — the same guard that stopped the 0.0% incident.

**Nothing in the React app changed.** These are standalone HTML files with no bundle and
no AdSense script, exactly like the 50 pages already under `public/predictions/`. The
React routes still exist, so in-app navigation is unaffected; the static file wins only
for a direct load or a crawler. **Both versions must stay in sync** — the React
`/accuracy` renders the same calibration table (added the same week).

`/accuracy` was missing from `sitemap.xml` entirely and is now listed at priority 0.8 —
it is the strongest evidence page on the site.

**Still unfixed, deliberately:** the homepage. It is the live dashboard and must stay the
React app, so the shell-content problem there needs a different approach — content inside
`#root` that React replaces on mount. Not attempted here because all routes serve
`index.html`, so that content would leak onto every route as duplicate.

## Common Bugs Fixed (most recent first)
- Matches tab stuck forever on "Loading matches..." when the tab loads in the background/
  unfocused (Jul 26 2026): `fetchMatches()` in `useMatchData.js` bailed via `if
  (document.hidden) return` — including on the very first mount call. If the page loaded
  hidden (background tab, or any embedding context where `document.hidden` starts true),
  the initial fetch never fired, and since the 5s interval re-checks the same guard, it
  never recovered without a genuine hidden→visible `visibilitychange` transition. This is
  the root cause of the bug flagged-but-unfixed on 2026-07-22 ("matches tab rendering
  bug"/"no backend fetch ever firing"). Fix: `fetchMatches` now takes a `force` param that
  bypasses the hidden check; the mount effect calls `fetchMatches(true)` so the first load
  always fetches regardless of tab visibility, while the interval and visibilitychange
  listener still skip while genuinely backgrounded (no wasteful polling).
- Score card showed the PREVIOUS match's team/score data under the NEW match's header
  after switching matches (Jul 26 2026): in `PredictionsTab.jsx`, the header team names
  render from `selectedMatch` (updates synchronously on click) but the score row
  (score/rate/target/momentum) renders from `pred` (only updates once `fetchPred`'s
  network round-trip resolves) — so there's a window, or an indefinite hang if the fetch
  silently fails, where the two are out of sync and a genuinely different match's score
  shows under the new header. Added `predMatchesSelection` (compares `cleanTeam`'d
  `selectedMatch.t1/t2` against `pred.team1/team2`, either order) right after the `isEnded`
  computation; the score-row block and the "Loading prediction..." fallback now both key
  off it instead of rendering `pred` unconditionally. Note: other `pred`-driven widgets on
  this page (AI Signal panel, "Who wins this match?", live-engine mood text) were NOT
  covered by this fix and likely have the same staleness window — only the header/score
  hero row was in scope for this fix.
- LPL team names reverted to correct 2026 names (Jul 25 2026): a Jul 22 commit (e989d665) renamed `galle-gallants`→`galle-marvels` and `kandy-royals`→`kandy-falcons` based on a web search that turned out to describe the OLD names. Verified against the live `/matches` feed (team codes `GAG`, `KRL` — matching Gallants/Royals) plus a follow-up search: LPL 2026's actual five teams are Jaffna Kings, **Galle Gallants**, Colombo Kaps, **Kandy Royals**, Dambulla Sixers (Galle went Marvels→Gallants, Kandy went Falcons→Royals, Colombo Strikers→Kaps for 2026). Slugs/short codes restored to `galle-gallants`/GAG and `kandy-royals`/KRL, sitemap URL restored to `jaffna-kings-vs-galle-gallants-2026`. **Note:** the upstream Cricbuzz feed is itself inconsistent — status strings for the same `KRL` code appear as both "Kandy Royals won by 11 runs" and "Kandy Falcons won by 43 runs", so don't treat a single status string as authoritative for team naming.
- MatchPredictionPage.jsx TEAMS dict had zero Lanka Premier League 2026 teams (Jul 17 2026, LPL start day): added all 5 franchises (jaffna-kings, galle-gallants, colombo-kaps, kandy-royals, dambulla-sixers — confirmed via web search) plus a sitemap.xml entry for the opening fixture (Jaffna Kings vs Galle Gallants, SSC Colombo). Short codes for colombo-kaps/kandy-royals/dambulla-sixers are best-guess (CLK/KDR/DBS) since Cricbuzz's exact abbreviations weren't confirmed — cosmetic only, doesn't affect routing since these are hand-authored SEO slugs, not tied to the live /matches API team codes.
- MatchPredictionPage.jsx TEAMS dict still missing 10/18 Blast counties + 5/8 Hundred teams (Jul 17 2026): same redirect-to-home bug as Jul 16 fix below, just for the teams that fix didn't cover yet. Added worcs, sus, lancs, dur, derby, leic, kent, mdx, warks, glam (Vitality Blast) and birmingham-phoenix, southern-brave, trent-rockets, london-spirit, welsh-fire (Hundred 2026, confirmed via web search — Hundred rebrand + fixtures). Sitemap.xml got the 5 real opening-week Hundred fixtures (Jul 21-25, found via search: MI London vs Sunrisers Leeds, Southern Brave vs Welsh Fire, London Spirit vs Manchester Super Giants, Birmingham Phoenix vs Trent Rockets, Sunrisers Leeds vs Southern Brave, Welsh Fire vs MI London). No H2H entries added for the new teams — falls back to the existing generic 10-10 default in `getH2H()`, same as any other team pair without a recorded H2H.
- MatchPredictionPage.jsx silently redirected non-IPL matchup slugs to home (Jul 16 2026): `TEAMS` dict only had 10 IPL teams, so any Vitality Blast/Hundred slug hit `if (!t1 || !t2) navigate("/")` — sitemap URLs for `mi-london-vs-sunrisers-leeds-2026` etc. were indexed but rendered zero content. Added Vitality Blast counties (ham, ess, yorks, som, notts, sur, nhnts, gloucs) and Hundred teams (mi-london, sunrisers-leeds, manchester-super-giants) to `TEAMS`, each with `league`/`competition` fields. Page copy (meta title/desc, schema, H1, FAQs) now reads `t1.competition` instead of hardcoded "IPL 2026". Slug parsing also strips a trailing `-2026` (previously only `-ipl-2026`) so non-IPL slugs resolve. `team.titles` can be `null` for counties/Hundred teams (unverified historical counts) — render falls back to showing `team.league` instead of a title count in that case. Added matching sitemap.xml entries for the 4 live Vitality Blast matchups.
- AdUnit.jsx added (Jul 13 2026): explicit AdSense ad unit component (`ca-pub-5447761777263695`, auto-format). Placed in right sidebar. Auto-ads alone fail in React SPAs; this component calls `adsbygoogle.push({})` in useEffect with a ref guard to prevent double-push.
- SubscribeCard.jsx added (Jul 13 2026): push notification + email alert signup card. Full version (mobile, inside `mob-intel`) and compact version (desktop sidebar). Email submits to `POST /email-subscribe` backend endpoint. Push uses `usePushNotifications` hook. Placed after HeroDecision on mobile, after BetwayBanner in sidebar.
- Sticky affiliate bottom bar on mobile: `position:fixed`, offset by `calc(var(--mob-nav-h) + 6px)`, dismissible with X + localStorage("bw_dismissed"). `mob-only` class (display:none desktop / display:flex mobile). State: `showStickyBar` in PredictionsTab.jsx.
- **Two bugs fixed here Jul 29 2026, both reported by a visitor as "things were overlapping so much I couldn't press any buttons" on mobile:**
  1. `@keyframes fadeUp` ended on `transform:translateY(0)` and `.fade` uses `animation-fill-mode:forwards`, so the main layout wrapper (`div.mg.fade`, PredictionsTab ~line 1965) kept a permanent transform. **Any** transform on an ancestor makes it the containing block for `position:fixed` descendants — so the sticky bar rendered ~3086px down the page over the content, and the full-screen wicket overlay (`inset:0`) could not cover the screen. The `to` frame no longer declares a transform. Do not add `translateY(0)` back; `none` and `translateY(0)` are not equivalent for this purpose.
  2. The bar's offset was a hardcoded `bottom:56px` while `.mn` is 79px tall (1px border + 6px + 52px button + 20px), so it covered the nav's top 23px. Nav height now lives once as `--mob-nav-h` in constants.js; change it there if `.mn`/`.mt` padding changes.
- **Testing note:** CSS animations are throttled in a hidden browser pane, so `.fade` sits frozen at its `from` frame and the wrapper reads `matrix(1,0,0,1,0,16)` forever. To verify fixed-position layout, remove the `fade` class first to simulate the finished animation.
- BetwayBanner moved to top positions for visibility (Jul 13 2026): mobile banner now renders right after HeroDecision (was after MiniTrustBlock, way below fold); desktop banner now first item in right sidebar (was last item, required full scroll). Both changes in PredictionsTab.jsx.
- "Wicket Threat Rising" fired at start of inn2 using stale inn1 last3Wkts → added `&& (pred.overs||0) > 3` guard (PredictionsTab.jsx line 2271, Jul 12 2026)
- "74%+ accurate" banner claim → changed to "66%+ in death overs" in 3 places (PredictionsTab.jsx lines 1635/1988/2188, Jul 12 2026) — matches verified accuracy page
- LiveEngine shows "Over 1 POWERPLAY" during innings break → added `isInnBreak` guard in LiveEngine.jsx; shows "Innings Break ☕" screen when `innings=2 && overs=0` (Jul 9, 2026)
- Innings break hero shows completed inn1 score: when `innings=2 && overs=0`, hero score row now shows batting team1's score (`selectedMatch.t1Score/t1Wkts/t1Overs`) + "ENG to bat · Target N" instead of wrong "ENG 0/0 (0.0 ov)" (Jul 9, 2026)
- Tab hidden → 0 matches shown → `visibilitychange` listener added to `useMatchData.js` so data fetches immediately when user switches to the tab (Jul 9, 2026)
- "Chase Slipping Away" shown at innings break (overs=0) → added `overs > 0` guard in PredictionsTab.jsx (lines 57, 2258); shows "Innings break" instead (Jul 9, 2026)
- `"draw" in string` TypeError in valueBets filter → replaced with `.includes("draw")` (PredictionsTab.jsx:2680) — crashed predictions for matches where team name was "england" etc.
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

## Mobile Bug Fixes (Jul 7, 2026)
- Tab switch now scrolls to top: `window.scrollTo(0,0)` added to `setActiveTab()` in CricIntelligence.jsx
- "sidebar" text → "matches list": `HowItWorksSteps` step 1 desc updated (no sidebar on mobile)
- Pitch empty state: `NoPitchData` `minHeight: 100vh` removed → `padding: "60px 20px 40px"` only
- Mobile blank gap: `.mg { min-height: auto !important }` added to mobile media query in constants.js

## Live Match Animations — Addictive UX (Jul 7, 2026)
New state in `PredictionsTab.jsx` (all inside `export default function PredictionsTab`):

| State | Trigger | Effect |
|---|---|---|
| `displayProb` + `probFlash` | `prob` changes | Win% counts up/down via `requestAnimationFrame` (900ms easeOutCubic) + `probChange` scale pop |
| `wicketMoment` | `pred.wickets` increases | Full-screen 🎳 WICKET! overlay (2.8s) + `navigator.vibrate([80,40,120,40,80])` on mobile |
| `scorePulsing` | `pred.score` changes | Score row glows green briefly via `scorePop` animation (0.7s) |

CSS keyframes added to `constants.js`: `wicketSlam`, `scorePop`, `probChange`, `wicketBg`.
Big number displays use `displayProb` (animated) instead of raw `prob`.

## Mobile UX — Bottom Nav + Swipe Gestures (Jul 7, 2026)
Targeting UK and South Africa mobile users.

- Mobile bottom nav (`.mn`): text-only labels (Predict, Matches, Pitch, Record, Media, Odds). Active tab has gold 3px top-border bar indicator. NO emoji icons — emoji looked like a second CI logo ("two logos" bug).
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
