# API outreach — email drafts (2026-08-26)

NOT SENT. Send from your own account. Strategy and prospect ranking are in
`2026-08-26-api-gtm-prospects.md`.

**Before sending email 1 or 2:** read the upstream Cricbuzz API licence terms. Both
propose redistribution at volume, and a partner deal that turns out to breach the data
licence is worse than no deal.

## What changed since these were written

**The API is now listed publicly on RapidAPI**, which makes every one of these
mails stronger without changing their argument:
https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability

"Reply and I'll send you a key" asks a stranger to trust you and then wait.
"Subscribe to the free tier and call it in a minute" asks them to try it. The
second one converts a curious engineer without either of you sending another
email — which matters most here, because the follow-up is the part that needs a
human and there is only one of you.

Every draft below now ends with that link. Keep it: it is the only thing in the
mail the reader can act on immediately.

**Rules applied to every draft below**
- No mention of betting, odds, tipping or gambling. Not once.
- The methodology leads; the accuracy number follows it. Reversed, it reads as a tipster.
- Short. Every one of these is under 180 words — a first cold email that scrolls does not
  get read.
- One ask, and the ask is small: a reply, not a meeting.
- `/v1/accuracy` is linked in every mail, because "go and check the claim yourself" is the
  only thing in this pitch that competitors cannot say.

---

## 1 — Roanuz (contact@roanuz.com) — highest leverage

**Subject:** Win probability as an add-on to the Roanuz cricket API

> Hi,
>
> I run CricIntelligence — a live cricket win-probability model, currently served through
> our own site and a small API.
>
> You already deliver the live feed that most cricket fantasy apps are built on. What
> those apps don't have is a probability layer, and building one is a training-data
> problem rather than an engineering one — which is why almost none of them do.
>
> I'd like to explore offering it through you, under your brand, as an add-on to your
> existing cricket product. You keep the customer relationship and a revenue share; I
> maintain the model.
>
> The model is trained on T20 matches up to 2024 and tested on 2,546 matches from 2025–26
> that were held out of training entirely — 19,340 predictions, 81.5% correct. The full
> methodology is public and unauthenticated, so you can verify it before replying:
> https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> It is live and self-serve on RapidAPI if your team would rather look than
> talk — free tier, instant key:
> https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability
>
> Worth a conversation?
>
> [name]
> https://www.cricintelligence.com/api

---

## 2 — Sportmonks (contact form on sportmonks.com)

**Subject:** Cricket win probability — partner or list alongside your API?

> Hi,
>
> Your cricket API covers 140+ leagues and your customers are developers, which is exactly
> who I built for.
>
> I run a live cricket win-probability model — one call returns a calibrated probability
> for both sides mid-match, with a confidence band and the match state it came from. It
> complements a data feed rather than competing with one: you supply what happened, this
> supplies what it means for the result.
>
> Two options I'd be glad to discuss: offering it as an add-on module to your cricket
> customers, or a straightforward mutual referral.
>
> Trained on T20 up to 2024, tested on 2,546 matches from 2025–26 held out of training.
> 19,340 predictions scored, 81.5% correct. Methodology and full breakdown, no key needed:
> https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> No need to wait on me to try it — it is live on RapidAPI with a free tier and
> an instant key:
> https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability
>
> [name]
> https://www.cricintelligence.com/api

---

## 3 — Score apps (CREX, Cricket LineX, CricRocket, Cricbites)

Send individually. Replace the bracketed line — a generic mail to four competitors reads
as a mailshot, and they will each be able to tell.

**Subject:** A win-probability bar for [App name]

> Hi,
>
> I use [App name] — [one specific true sentence: what you actually like, or the exact
> screen this would sit on. Delete this mail rather than sending it without this line.]
>
> One thing it doesn't show is a live win probability. It's the number that keeps someone
> watching between balls, and it's the hardest feature to add because it needs a trained
> model rather than a feed.
>
> I've built one and expose it as a single HTTP call — probability for both sides,
> confidence band, updated ball by ball. Trained on T20 up to 2024 and tested on 2,546
> matches from 2025–26 kept out of training: 19,340 predictions, 81.5% correct. Full
> methodology, open, no key required:
> https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> Free tier, instant key, no card, if you want to point it at a live match:
> https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability
>
> [name]

---

## 4 — Free-to-play fantasy operators (India, post-PROGA)

Do not mention the regulation directly — they have lived it and do not need it explained
back to them by a stranger. The mail should simply be about engagement, which is now
their only lever.

**Subject:** Keeping free-to-play users in the app between balls

> Hi,
>
> Free-to-play cricket contests live or die on whether people stay in the app during a
> match. A live win-probability bar is one of the few features that reliably does that —
> it changes every over, so there's always a reason to look again.
>
> I run the model behind cricintelligence.com and offer it as a single HTTP call. Trained
> on T20 up to 2024, tested on 2,546 matches from 2025–26 that were never in training:
> 19,340 predictions, 81.5% correct. The whole breakdown is public so you can check it
> before talking to me:
> https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> Free tier, no card. If it doesn't lift session length in a week, that's your
> answer and it costs you nothing to find out:
> https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability
>
> [name]

---

## 5 — Regional streaming (YuppTV, Willow TV, Premier Sports, FanCode)

Hold this one until at least one paying customer exists — the first question will be who
else uses it, and "nobody yet" ends the conversation.

**Subject:** Live win-probability overlay for cricket coverage

> Hi,
>
> Tier-one broadcasters put a live win-probability bar on cricket coverage. It comes from
> enterprise analytics contracts that only make sense at tier-one budgets.
>
> I supply the same graphic from a single HTTP call, priced for coverage that isn't
> tier-one. One call every few seconds per match; your graphics team owns the look.
>
> Trained on T20 up to 2024, tested on 2,546 matches from 2025–26 held out of training —
> 19,340 predictions, 81.5% correct, methodology published in full:
> https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> Happy to run it live alongside a match you're already covering, at no cost, so your team
> can judge it on air-worthiness rather than on my description of it. It is also
> on RapidAPI if they would rather just try it:
> https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability
>
> [name]
> https://www.cricintelligence.com/api

---

## Sent log

| Prospect | Address | Status |
|---|---|---|
| Roanuz | contact@roanuz.com | **sent** Aug 26 |
| Sportmonks | sales@entitysport.com is NOT this one — **sales@sportmonks.com** | **sent** Aug 26, auto-ack ticket #108620 |
| CREX | support@crex.com | ready |
| Just Cricket (was Cricket LineX) | support.justcricket@gmail.com | ready |
| Goalserve | support@goalserve.com | ready — draft 6 below |
| cricketdata.org | contact@cricketdata.org | ready — reuse draft 6 |
| Entity Sport | sales@entitysport.com | **last**, see caveat in draft 7 |
| Dream11 / MPL / My11Circle | — | **dropped**, see below |
| Streaming (draft 5) | — | hold until one paying customer |

**Addresses were read off the live pages, not off search snippets.** CREX and Just
Cricket came from their Play Store listings; Sportmonks' came from its own contact page,
where the two real addresses are `sales@` and `support@` — a search result claiming
`hello@sportmonks.com` was wrong.

**Draft 4 (free-to-play fantasy) is dropped, not pending.** The only reachable addresses
for Dream11 and the rest are consumer support inboxes (`helpdesk@dream11.com`). A
partnership mail into a support queue is read by an agent whose job is to close tickets.
The reasoning behind the draft still holds; there is simply no door to knock on. If a
named contact ever turns up, the draft is still there.

**CricRocket has no published developer email** — the Play Store listing hides it behind a
control this session could not open. Worth another try; the app is by Absolute Sports.

---

## 6 — Goalserve (support@goalserve.com)

Same channel logic as Roanuz, different framing. Goalserve is multi-sport and twenty
years old, so "you power most cricket fantasy apps" would be wrong and they would know it.

**Subject:** Cricket win probability — an add-on to your cricket feed?

> Hi,
>
> I run CricIntelligence — a live cricket win-probability model for T20.
>
> You've supplied cricket data feeds for two decades, and your customers build livescore
> and fantasy products on them. What almost none of those products have is a
> win-probability layer, because adding one is a training-data problem rather than an
> engineering one.
>
> I'd like to explore offering it alongside your cricket feed, under your brand, as an
> add-on. You keep the customer relationship and a revenue share; I maintain the model. It
> complements your feed rather than competing with it — you supply what happened, this
> supplies what it means for the result.
>
> The model is trained on T20 matches up to 2024 and tested on 2,546 matches from 2025–26
> that were held out of training entirely — 19,340 predictions, 81.5% correct. The full
> methodology is public and unauthenticated, so you can check it before replying:
> https://cricintel-backend-production.up.railway.app/v1/accuracy
>
> It is also live and self-serve on RapidAPI if your team would rather look than talk —
> free tier, instant key:
> https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability
>
> Worth a conversation?
>
> [name]

**cricketdata.org** takes the same mail with one change: their customers are small
independent developers, not established data buyers, so swap the opening paragraph for
"your customers are independent developers building cricket apps".

---

## 7 — Entity Sport (sales@entitysport.com) — send LAST

**Check before sending.** They already publish a "Cricket Prediction API". Reading their
page: it answers *questions* — "India to win match?", "Kohli to hit 7 or more fours?",
300+ per match — rather than serving one continuous, moving probability. **They publish no
accuracy figure and no methodology at all.**

That makes them adjacent rather than identical, and arguably a partner: a measured
probability is what a question like "India to win match?" needs behind it. But they may
equally read this as competitive, which is why it goes last — after the replies from
prospects with nothing to defend.

Lead on the difference, not the similarity:

> Your prediction API answers questions about a match. This is the measured probability
> those questions rest on — trained on T20 up to 2024, tested on 2,546 matches held out of
> training, 19,340 predictions, 81.5% correct, with the methodology and calibration table
> published openly.

---

## Follow-up (once, after 6 working days, then stop)

Two unanswered mails is a no. A third is why people mark senders as spam.

> Hi — following up once on the below in case it landed at a bad moment.
>
> If win probability isn't on your roadmap, just say so and I won't chase it. If it is but
> not this quarter, I'll check back after the season.
>
> [name]

---

## Handling the four questions that will come back

- **"How do I know 81.5% is real?"** — The test matches were held out of training
  entirely, and `/v1/accuracy` publishes the sample size, the per-checkpoint breakdown and
  the command that reproduces it. Offer them a trial key and a live match. Do not argue
  the number; hand them the means to check it.
- **"What's your uptime?"** — Answer honestly: no formal SLA today, and say what the
  actual setup is. Offer a month-to-month term instead of a guarantee. An invented SLA is
  the fastest way to lose a customer who then holds you to it.
- **"We already use Opta / Sportradar."** — Then they are not the buyer, and pushing costs
  the relationship. Ask who in their network is priced out of that contract.
- **"Can we get ODI/Test?"** — Not covered by the holdout. Say so. Offer to measure it if
  they would actually buy it — that is a real signal about what to build next.
