# RapidAPI listing pack — mostly DONE (2026-08-26)

**The listing now exists.** It was created in the user's own RapidAPI account
(provider 11607415) and is **private**, which is RapidAPI's default. Nothing is public.

Already done in the account:
- API created: *CricIntelligence Cricket Win Probability*, category Sports
- Short and long description, website and terms-of-use links
- `openapi_v1.yaml` imported — base URL and all five endpoints came through, grouped as
  Predictions / Discovery / Account / Proof
- Public plans configured (see the table below for what actually went in)

**Two things remain, and the first blocks the second:**

1. **Mint the proxy key and paste it as a header.** Needs `ADMIN_TOKEN`, which only the
   user has. Until this is done every subscriber's call returns `missing_api_key`, so the
   listing must not go public first.
2. **Make it public.** One toggle, once step 1 is verified.

The copy below is what was actually used, kept for reference and for re-editing.

---

## Step 0 — the one code change this needs first

RapidAPI meters **per month**. Our backend meters **per day**. If both enforce, a customer
who is well inside their RapidAPI plan gets a surprise 429 from us on a busy match day,
which is the worst possible first impression.

So let RapidAPI do the metering and mint **one `enterprise` (unmetered) key** for their
proxy. RapidAPI holds that single key, checks each subscriber's monthly quota itself, then
forwards to us.

```bash
curl -X POST https://cricintel-backend-production.up.railway.app/v1/admin/keys \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"enterprise","label":"RapidAPI proxy"}'
```

Save the key it returns — it is shown once. Paste it into RapidAPI as the header
`X-API-Key` under **Rapid Settings → Headers** so subscribers never see it.

> Because that key is unmetered, our own abuse ceiling for RapidAPI traffic is whatever
> RapidAPI enforces. Watch `/v1/admin/keys` usage for the first few weeks; if traffic
> looks wrong, revoke and reissue as `pro`.

---

## Step 1 — import the spec

`cricintel-backend/openapi_v1.yaml` is a valid OpenAPI 3.0.3 document covering all five
endpoints with example payloads and descriptions. Add New API → **Import from OpenAPI**.

That fills in every endpoint, parameter and response example automatically, so none of it
needs retyping — and re-importing after a code change is how the listing stays current.

---

## Step 2 — listing fields

**API name**

```
CricIntelligence Cricket Win Probability
```

**Category:** Sports · **Secondary:** Data

**Short description** (one line, appears in search results)

```
Live T20 cricket win probability, measured at 81.5% on 2,546 matches held out of training. Full methodology published.
```

**Tags**

```
cricket, win probability, sports, t20, ipl, live scores, prediction, machine learning, sports data, analytics
```

**Website:** `https://www.cricintelligence.com/api`
**Terms:** `https://www.cricintelligence.com/terms`

**Long description** (markdown — paste as-is)

```markdown
## Live cricket win probability, in one call

`GET /v1/predict/{match_id}` returns a calibrated win probability for both sides of a
live T20 match, the confidence band around it, and the match state it was derived from.
It updates ball by ball, so it is safe to poll during play.

## The accuracy claim is checkable

Most prediction APIs ask you to take a number on trust. This one does not.

The model was trained on T20 matches up to 2024, then tested on **2,546 matches from
2025-26 that were held out of training entirely** — 19,340 predictions scored, 81.5%
correct. Not a score on its own training data.

`GET /v1/accuracy` serves the whole breakdown — methodology, sample size, accuracy at
each stage of the innings, and the command that reproduces it — **with no key required**.
Check it before you subscribe.

| After over | Accuracy |
|---|---|
| 6 | 79.2% |
| 10 | 82.1% |
| 12 | 82.6% |
| 15 | 82.2% |

## What you get back

- Win probability for both sides as 0-1 floats that sum to 1
- A confidence level — `HIGH` is deliberately rare, requiring several independent signals
  to agree rather than just a wide gap
- Monte Carlo and Bayesian intervals around the estimate
- Live match state: runs, wickets, overs, target, run rates, phase
- Pressure index and momentum
- A `low_confidence` flag for the early first innings, when too little has happened for
  the number to mean much — so you can suppress the display instead of showing noise

## Built for

Score apps, fantasy platforms, streaming overlays, second-screen apps and sports media —
anyone who wants a win-probability feature without building a model, a data pipeline and
a training set first.

## Honest limits

- **T20 and T20I only.** The accuracy above does not cover ODI or Test.
- **No SLA on self-serve plans.** If you need a guarantee, contact us rather than
  subscribing here.
- Predictions are statistical estimates for analytics, media and product use. They are
  not advice, and no outcome is guaranteed.
```

---

## Step 3 — pricing plans

Converted to monthly, because RapidAPI meters per month. Same daily shape as the site:
2,000/day ≈ 60,000/month, 20,000/day ≈ 600,000/month.

**As actually configured:**

| RapidAPI tier | Price | Monthly quota | Limit type | Site equivalent |
|---|---|---|---|---|
| **Basic** | Free | 500 / month | Hard | Trial |
| **Pro** ⭐ | $39 | 60,000 / month | Hard | Starter (£29) |
| **Ultra** | $189 | 600,000 / month | Hard | Pro (£149) |
| **Mega** | disabled | — | — | Enterprise (talk to us) |

**Rate limit:** 60 requests/minute on Pro and Ultra. Generous for a live match (one call
every few seconds per match) and enough to stop a scraper. Pro carries the
"Recommended" badge, matching the highlighted tier on the site.

**Deviation from the original plan, deliberate:** hard limits everywhere instead of
per-call overage. A first customer who gets an unexpected bill is a first customer lost,
and an overage tier also removes our own ceiling on upstream API cost. Revisit once
somebody actually hits a quota.

**Order matters when editing:** RapidAPI caps a plan's quota by its price, so a $0 plan
refuses a 600,000 quota. Set the price first, then the quota.

Notes on the numbers:
- Prices are USD because RapidAPI bills in USD. $39/$189 are the GBP tiers converted with
  headroom, not a second pricing decision.
- **RapidAPI keeps 20-25%**, so $39 gross is roughly $30 net. That is the cost of not
  having to sell, invoice, or chase anybody — worth it while there are no customers.
- Free tier at 500/month is deliberately usable: enough to build and demo an integration,
  not enough to run a product on.

---

## Step 4 — after publishing

- Add a "Also on RapidAPI" link to `/api` once the listing is live.
- The listing ranks on "cricket API" searches, which is the whole point — the marketplace
  is the distribution, not the billing.
- Give it 30 days before judging. **If nobody subscribes at $39, that is the pricing
  answer we have never had**, and it cost one evening instead of ten sales emails. Halve
  it and watch again.

---

## What is still not automatable

1. **Minting the proxy key** — needs `ADMIN_TOKEN`. Blocks going public.
2. **Connecting a payout method** — needs bank details.
3. **Replying to subscribers** who ask questions on the listing.

Everything else is done and in the account.
