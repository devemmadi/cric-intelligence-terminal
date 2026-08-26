# CricIntelligence API — go-to-market and prospect list (2026-08-26)

NOT SENT. Every email in `2026-08-26-api-outreach-emails.md` is a draft for the user to
send from their own account. Nothing here was contacted.

---

## The one thing that changes the plan

**Stats Perform (Opta) already sells cricket win probability** — ball-by-ball Opta data,
OptaAI predictions and live win probability across 5M+ deliveries a year. Sportradar is
the other incumbent. Both are enterprise-only: no public pricing, no self-serve signup,
a sales conversation and a custom contract before you see a number.

So do **not** pitch Sky, Star, JioHotstar or the ICC. They already buy Opta, they will not
swap a tier-one contract for a solo developer's endpoint, and the meeting will not happen.

The wedge is everyone **priced out of Opta**: mid-size apps, regional streamers,
free-to-play fantasy operators and content businesses who want a win-probability number
and cannot justify an enterprise data contract to get one. That is a real, unserved
segment, and £99–£399/month is exactly the shape of budget it has.

## Rank by how fast money actually arrives

Ordered by effort-to-first-revenue, not by deal size. The top item needs no sales
conversation at all, which matters because the selling is the half that cannot be
automated.

---

### 1. RapidAPI listing — self-serve, no sales call *(do this first)*

RapidAPI Hub carries 40,000+ APIs in front of 4M+ developers and runs the billing rails,
so there is no invoicing, no contract, no call. Commission is 20–25% of revenue.

Why it is first: it is the only channel that converts while the user is asleep. It also
**prices the product for us** — if nobody subscribes at £99, that is a pricing answer we
currently do not have, and it is cheaper to learn it here than in ten sales emails.

- Action: publish `/v1` on RapidAPI with the Trial/Starter/Pro tiers already built.
- Effort: a listing, a logo, and the docs page that already exists.
- Realistic outcome: small MRR, but it is revenue with no human in the loop, and it
  validates the price before anyone is asked to sign anything.
- Secondary listing: api.market carries cricket APIs and ranks for "best cricket API".

---

### 2. Channel partners — one deal reaches hundreds of apps *(highest leverage)*

These companies already sell cricket data feeds to app builders. They do **not** sell a
measured win probability. CricIntelligence becomes an add-on line in a catalogue that
already has the customers, the billing and the trust.

| Company | Why them | Contact |
|---|---|---|
| **Roanuz** (cricketapi.com) | Claims to power 90%+ of cricket fantasy apps in market. Sells Cricket/Football/Kabaddi APIs and fantasy solutions — no predictive product listed. | contact@roanuz.com, support@roanuz.com |
| **Sportmonks** | Cricket API across 140+ leagues, developer-first, publishes pricing. Their buyer is exactly ours. | Contact form on sportmonks.com (their /contact/ 404s — use the site's current form) |
| **Entity Sport** (Jaipur) | Cricket, fantasy points API, 80+ widgets. **Caveat: they already advertise a "Cricket Prediction API"** — verify what it actually is before pitching, this may be a competitor rather than a partner. | sales@entitysport.com, +91 6377026492 |

The 90% figure is Roanuz's own marketing claim — treat it as a reason to talk to them,
not as a verified market share.

**Deal shape to propose:** they resell under their brand, revenue split, we stay the
model. No exclusivity on a first deal.

---

### 3. Score apps with large audiences and no predictive layer

They have the users and the live data already; what they lack is a reason to keep someone
in the app between balls. A win-probability bar is that reason.

- **CricHeroes** — 40M+ users, 10M+ matches scored, grassroots/club scoring. Their data is
  amateur cricket, so our T20-trained model does **not** transfer directly. Pitch only the
  professional-match surfaces of their app, or skip them.
- **CREX (Cricket Exchange)** — ball-by-ball, partnerships, player stats, already runs
  "free fantasy tips by experts". A measured probability is a direct upgrade to a feature
  they already believe in.
- **Cricket LineX**, **CricRocket** — fast-live-score apps competing purely on speed and
  depth. Differentiation is their whole problem.
- **Cricbites** — newer, explicitly positioning on doing what ESPNcricinfo does not.

Contact route for all of these: Play Store / App Store listing developer email, then
LinkedIn. Do not guess addresses.

---

### 4. Free-to-play fantasy operators — the timing is unusually good

India's Promotion and Regulation of Online Gaming Act 2025 (PROGA) took full effect
1 May 2026. Paid contests are now illegal nationwide; Dream11, MPL, My11Circle and the
rest suspended real-money contests and Dream11 dropped the BCCI shirt sponsorship because
the revenue stream collapsed.

What that leaves is a set of operators with large audiences, **no prize money to compete
on, and far less revenue** — so they now compete purely on product experience and cannot
afford an Opta contract. Cheap, differentiating engagement features are close to the only
lever they have left.

That is a genuinely good moment to arrive, and it is a moment, not a permanent state.

Related: [[project_geo_monetisation]] — this is also why the site's own India/Bangladesh
traffic cannot be monetised, which is what pushed us to sell the model instead.

---

### 5. Regional streaming and second-screen

Not tier-one rights holders — the tier below, who want an overlay and have no analytics
budget: **YuppTV** (South Asian OTT, 70+ countries), **Willow TV** (US/Canada cricket),
**Premier Sports** (UK/Ireland MLC), **FanCode**. Also broadcast graphics contractors, who
buy per-tournament rather than per-year.

---

## What to lead with, and what not to

**Lead with the methodology, not the number.** "81.5% accurate" is what every tipster
site claims and it will be read as noise. What is actually rare is that the number is
falsifiable: trained on T20 up to 2024, tested on 2,546 matches from 2025–26 that were
held out of training entirely, 19,340 predictions scored, and `/v1/accuracy` serves the
whole breakdown unauthenticated so a prospect can check it before paying. Say that first.
The number is the payoff, not the opening.

**Never mention betting.** Not once. The buyer is an engineering or product team whose
procurement will kill anything gambling-adjacent — the same reason the Virgin StartUp
application was rejected. The `/api` page is deliberately clean of it; the emails must be
too.

## Honest gaps a prospect will find

Worth knowing before they raise it, because they will:

- **No uptime history and no SLA.** Single Railway instance. Sell to people who do not yet
  need a guarantee, and say so plainly rather than implying otherwise.
- **T20 only.** The holdout is T20. ODI and Test are not covered by the 81.5%.
- **Data-source terms need checking before any partner deal.** The live feed comes from a
  third-party Cricbuzz API. Reselling a *derived* probability is a different thing from
  reselling raw scores, but the licence terms should be read before signing anything that
  redistributes at volume. This is the one item that could invalidate a partner deal after
  it is agreed — check it before pitching Roanuz or Sportmonks, not after.
- **One person.** Enterprise procurement will ask about bus factor. Fine for Starter/Pro
  buyers; do not chase Enterprise until there is a reason to.

## Sequence

1. List on RapidAPI. No conversation required, and it prices the product.
2. Read the upstream data licence. Blocking for step 3.
3. Email Roanuz and Sportmonks — highest leverage per email sent.
4. Email 5–8 score apps and F2P fantasy operators.
5. Only after one paying customer exists, approach regional streaming, where the first
   question will be "who else uses this".

Drafts for steps 3 and 4 are in `2026-08-26-api-outreach-emails.md`.
