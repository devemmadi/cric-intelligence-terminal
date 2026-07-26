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

## SEO — The Hundred 2026 full matchup coverage (Jul 26 2026)
Added sitemap entries for all 28 unique Hundred men's team pairings (21 new + 7 already present). This is legitimate rather than doorway-page spam because the 2026 format has **every team playing every other team once** (7 matches each) plus a regional-derby rematch = 32 group games, so each pairing is a real fixture at some point between Jul 21 and Aug 12. All 8 team slugs already existed in `MatchPredictionPage.jsx` `TEAMS`; verified two of the new URLs render (london-spirit-vs-welsh-fire, birmingham-phoenix-vs-southern-brave). Priority 0.88, changefreq daily. Motivation: user is UK-targeted and GA showed Organic Search sessions +240% w/w, so UK-tournament pages are the highest-leverage SEO surface.

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
- Sticky Betway bottom bar added (Jul 13 2026): fixed bottom bar on mobile (position:fixed, bottom:56px, above bottom nav), dismissible with X button + localStorage("bw_dismissed"). Added `mob-only` CSS class (display:none desktop / display:flex mobile). State: `showStickyBar` in PredictionsTab.jsx.
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
