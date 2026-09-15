# B2B outreach — CricIntelligence win-probability API

**Written 15 Sep 2026.** The API went live on RapidAPI on 26 Aug and three weeks later
has **1 key (our own proxy), 0 calls, 0 leads**. That is not a failed experiment — it is
an untried one. Nobody was ever told it exists.

Claude wrote this list and these emails. **Emmadi sends them.** Nothing here is sent
automatically.

---

## What we are actually selling

One number — a live win probability — plus the record behind it.

**Not** a score feed. `/v1` deliberately returns no runs, wickets, overs or target,
because the live data comes from a third-party RapidAPI listing with no redistribution
licence. That is a constraint, but it is also the pitch: we are an **add-on to whatever
feed a buyer already pays for**, not a replacement for it.

**The one thing we have that the market does not:**

| | CricViz (WinViz) | Sportmonks / Roanuz / EntitySport | Us |
|---|---|---|---|
| Win probability | yes | no | yes |
| Published accuracy figure | **none** | n/a | **81.5%** |
| Published calibration table | **none** | n/a | **10 buckets, 19,340 predictions** |
| Public endpoint to verify it | no | n/a | `GET /v1/accuracy`, no key needed |

Checked 15 Sep 2026: CricViz's own WinViz and data-science pages carry no accuracy
number anywhere, and their stated inputs (every major T20 played, team strength, ground
history) are the same as ours. **A buyer cannot audit their model and can audit ours.**
That is the entire wedge. Lead with it every time.

---

## Segment 1 — data providers (HIGHEST LEVERAGE, do these first)

They already sell cricket feeds to paying customers. **None of them sell a prediction
layer.** One deal here puts us in front of their whole customer base, and they have the
sales machinery we do not. This is a partnership conversation, not a licence sale —
revenue share or wholesale, whatever they prefer.

| Company | Why them | Contact route |
|---|---|---|
| **Sportmonks** (NL) | Cricket API from EUR 29/mo, no contracts, self-serve. Small enough to answer email. Explicitly markets "ball-by-ball" depth and has no prediction product | sportmonks.com contact form / support |
| **EntitySport** (IN) | Cricket API from $150/mo, India-based, sells to fantasy operators — exactly the buyers who want a prediction layer | entitysport.com contact |
| **Roanuz** (IN) | ~$210/mo entry, strong fantasy-operator base, publishes developer docs so there is an engineering contact | sports.roanuz.com |
| **Highlightly / API.market listings** | Aggregators — being listed is free distribution | via their listing forms |

### Email — data providers

> **Subject:** A win-probability layer for your cricket API
>
> Hi [name],
>
> I run CricIntelligence. We publish a live cricket win probability and, unusually,
> the measured record behind it — 81.5% across 19,340 predictions on 2,546 matches
> the model never saw in training, with the full calibration table public. You can
> check it without a key: https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> You sell the data. We are not trying to compete with that — our API deliberately
> returns no scores, only the derived probability. It is meant to sit on top of a feed
> like yours.
>
> Your customers ask for prediction features and none of the cricket data providers
> offer one. CricViz does, but sells direct to broadcasters and publishes no accuracy
> figure at all, so a buyer cannot audit it.
>
> Would a white-label or revenue-share arrangement be worth twenty minutes? I can send
> a key today and you can point it at a live match.
>
> Emmadi
> cricintelligence.com/api

---

## Segment 2 — cricket apps WITHOUT a prediction layer

**Do not pitch Cricbuzz or AllCric.** Checked 15 Sep 2026: Cricbuzz ships real-time win
probability already, and AllCric ships "AI Win Probability / AI Predicted Score Range /
AI Over Prediction". They built it; they will not buy it.

Target the tier below — apps with scores and news but no prediction layer, who cannot
justify building a model.

| Target | Why |
|---|---|
| **CricTracker** | Large audience, publishes pitch reports and previews written from **opinion**. A measured number is a direct upgrade to content they already produce daily |
| **MyFinal11, Grand11, BattingFirst, Fantasy Khiladi** | Fantasy-tip sites whose paid-contest revenue was removed by PROGA 2025. They need engagement features that are not real-money |
| **Regional / language cricket apps** | Serve markets the big two under-serve, and have no in-house data science |
| **Cricket podcasts and YouTube analysts** | Not a licence sale, but a citation route — they need numbers to talk about |

### Email — apps and publishers

> **Subject:** Live win probability for [product], with a published accuracy record
>
> Hi [name],
>
> [Product] shows the score and the story. What it does not show is what the score
> actually means — whether a side chasing 84 off 60 with six wickets is genuinely
> ahead.
>
> We publish exactly that, updated every ball, and unlike anyone else in cricket we
> publish the record behind it: 81.5% across 19,340 predictions on matches the model
> had never seen, with the calibration table showing what actually happened at each
> probability we quoted. Verify it with no key:
> https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> It is a REST call returning one JSON object. It does not replace your data feed —
> it has no scores in it at all, by design.
>
> Trial tier is free, 100 calls a day, no card. Happy to set you up today.
>
> Emmadi
> cricintelligence.com/api

---

## Segment 3 — UK betting affiliates and tipster sites

Legal in the UK, and these sites already buy odds feeds. **Do not pitch anything
India-facing** — PROGA 2025 bans real-money gaming advertising there, with prison and
₹50 lakh penalties, and Google Ads dropped fantasy and rummy from Indian advertising in
January 2026.

Angle: a model probability next to a bookmaker price is content their readers want, and
they have no way to generate it.

---

## What to send with every email

1. **The accuracy link** — `/v1/accuracy`, no key. This is the whole pitch; it is the
   one thing a prospect can check in ten seconds and nobody else offers.
2. **The docs page** — cricintelligence.com/api
3. **A working key** if they show any interest at all. Do not make them ask twice.

## Do NOT claim

- Any uptime or SLA. There is none — a single Railway instance.
- That we supply scores or a data feed. We do not, deliberately.
- Any accuracy figure other than what `/v1/accuracy` returns that day.
- Customer names or logos. There are none yet, and inventing one ends the conversation
  the moment it is checked.

## Honest odds

Cold B2B email converts at roughly 1-3%. 30 emails is a coin flip on one reply; 100 is a
realistic shot at 1-3 customers. At £149/mo that is £150-450 a month — against the
400x traffic growth AdSense would need to reach the same figure.

**Track replies.** Leads through the form now persist (the Supabase `api_leads` table was
created 15 Sep 2026 and verified with a marked test row — delete that row). Before that
date they were written to a file Railway wipes on every deploy, so anything submitted
between 26 Aug and 15 Sep is gone.
