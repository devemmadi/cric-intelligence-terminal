"""
Generate a static page per international T20 matchup.

These eight URLs already existed as React routes (InternationalPredictionPage.jsx),
which is part of why they were never indexed: the content only appears after the
bundle runs, and the HTML Google fetches is the empty SPA shell. Static files
plus a vercel rewrite put the words in the served markup.

The angle is the one thing that genuinely separates these fixtures: where they
are played. A touring side moves between grounds that behave very differently -
Pakistan's average a first innings of 172.4 and the West Indies' 149.3 - so each
page compares the two countries' ground records rather than repeating a generic
rivalry paragraph.

No pre-match tip, for the same reason as everywhere else: the model is a live
model and has nothing to say before a ball is bowled.

Usage:  python scripts/gen_international_pages.py [--dry-run]
"""
import argparse
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from league_data import COUNTRIES, league, VENUE_JSON  # noqa: E402
from gen_league_pages import CSS, BASE  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "predictions", "international")

NAMES = {
    "england": "England", "india": "India", "australia": "Australia",
    "pakistan": "Pakistan", "south-africa": "South Africa",
    "new-zealand": "New Zealand", "west-indies": "West Indies",
}

# Slug order matches the URLs already in the sitemap and React router.
FIXTURES = [
    ("england", "australia"),
    ("england", "india"),
    ("england", "new-zealand"),
    ("england", "pakistan"),
    ("england", "south-africa"),
    ("england", "west-indies"),
    ("india", "pakistan"),
    ("australia", "india"),
]


def build(a, b, da, db, all_c):
    an, bn = NAMES[a], NAMES[b]
    slug = f"{a}-vs-{b}"
    url = f"{BASE}/predictions/international/{slug}"
    diff = round(da["first"] - db["first"], 1)
    high, low = (an, bn) if da["first"] >= db["first"] else (bn, an)
    hd, ld = (da, db) if da["first"] >= db["first"] else (db, da)

    ranked = sorted(all_c.items(), key=lambda kv: -kv[1]["first"])
    top, bottom = ranked[0], ranked[-1]

    title = f"{an} vs {bn} T20 Predictions — Ground Records and Live Win Probability | CricIntelligence"
    desc = (f"{an} vs {bn} T20 prediction. Ground records from both countries: "
            f"{an} average {da['first']} batting first, {bn} {db['first']}. "
            f"Live AI win probability updated every ball. Free, no sign-up.")

    def table(name, d):
        rows = "\n".join(
            f"<tr><td>{html.escape(r['name'])}</td><td>{r['n']}</td><td>{r['first']}</td>"
            f"<td>{r['second']}</td><td>{r['gap']:+}</td><td>{r['rpo']}</td></tr>"
            for r in d["rows"])
        return f"""  <h2>{html.escape(name)} &mdash; grounds ranked by what chasing costs</h2>
  <div class="tw">
    <table>
      <thead><tr><th>Ground</th><th>Matches</th><th>1st inns</th><th>Chasing</th><th>Gap</th><th>RPO</th></tr></thead>
      <tbody>
{rows}
      </tbody>
    </table>
  </div>"""

    faqs = [
        (f"Is {an} vs {bn} higher scoring in {an} or {bn}?",
         f"In {high}. Sides batting first there average {hd['first']} against {ld['first']} in {low}, a "
         f"{abs(diff)}-run difference, and {hd['rpo']} runs an over against {ld['rpo']}. Across the countries we "
         f"hold ground data for, {NAMES[top[0]]} is the highest scoring at {top[1]['first']} and "
         f"{NAMES[bottom[0]]} the lowest at {bottom[1]['first']}."),
        (f"Which ground is hardest to chase at in this fixture?",
         f"In {an} it is {da['hardest']['name']}, where sides batting first average {da['hardest']['first']} and "
         f"chasing sides {da['hardest']['second']} across {da['hardest']['n']} matches — a {da['hardest']['gap']}-run "
         f"gap. In {bn} it is {db['hardest']['name']} at {db['hardest']['gap']}. The most forgiving are "
         f"{da['easiest']['name']} ({da['easiest']['gap']}) and {db['easiest']['name']} ({db['easiest']['gap']})."),
        (f"Who will win {an} vs {bn}?",
         "We do not publish pre-match tips. The model is a live model: it has nothing useful to say until a ball is "
         "bowled, and then recalculates win probability after every one from the score, wickets in hand, required "
         "rate and how the pitch is actually playing. It measures 81.5% accuracy on a true holdout — trained on "
         "2017-2024 matches only, then scored on 2,546 matches from 2025-26 it had never seen."),
        ("Where do these numbers come from?",
         f"Ball-by-ball T20 records for the main grounds in each country — {da['matches']} matches across "
         f"{da['grounds']} grounds in {an}, {db['matches']} across {db['grounds']} in {bn}. They cover all T20 "
         "cricket at those venues, not internationals alone, so read them as ground character. Per-ground sample "
         "sizes are in the tables; some are small and deserve less weight."),
        ("Is it free?",
         "Yes. Live win probability, score projections and next-over forecasts are free, with no sign-up."),
    ]

    faq_ld = json.dumps([{"@type": "Question", "name": q,
                          "acceptedAnswer": {"@type": "Answer", "text": ans}} for q, ans in faqs],
                        indent=1, ensure_ascii=False)
    faq_html = "\n".join(
        f'<div class="faq"><div class="q">{html.escape(q)}</div><div class="a">{html.escape(ans)}</div></div>'
        for q, ans in faqs)

    others = " &middot; ".join(
        f'<a href="/predictions/international/{x}-vs-{y}">{NAMES[x]} v {NAMES[y]}</a>'
        for x, y in FIXTURES if (x, y) != (a, b))

    return slug, f"""<!DOCTYPE html>
<html lang="en">
<head>
<!-- generated by scripts/gen_international_pages.py from venue_stats.json - do not hand-edit -->
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(desc)}"/>
<link rel="canonical" href="{url}"/>
<meta name="robots" content="index, follow"/>
<meta property="og:type" content="website"/>
<meta property="og:title" content="{html.escape(title)}"/>
<meta property="og:description" content="{html.escape(desc)}"/>
<meta property="og:url" content="{url}"/>
<meta property="og:image" content="{BASE}/logo512.png"/>
<meta name="twitter:card" content="summary_large_image"/>
<script type="application/ld+json">
{{
 "@context": "https://schema.org",
 "@graph": [
  {{"@type": "WebPage", "name": {json.dumps(title)}, "url": {json.dumps(url)},
   "description": {json.dumps(desc)}}},
  {{"@type": "FAQPage", "mainEntity": {faq_ld}}}
 ]
}}
</script>
<style>{CSS}</style>
</head>
<body>
<nav>
  <a class="logo" href="/"><span>CRIC</span><span>INTELLIGENCE</span></a>
  <a class="cta-btn" href="/">Live Predictions &rarr;</a>
</nav>
<div class="container">
  <div class="hero">
    <div class="tag">Ground records &middot; {html.escape(an)} v {html.escape(bn)}</div>
    <h1>{html.escape(an)} vs {html.escape(bn)} &mdash; What the Grounds Actually Do</h1>
    <p>Where this fixture is played changes it more than anything either side does at the toss. Ground records from
       both countries below, plus live AI win probability updated after every ball once a match starts.</p>
    <div class="stats">
      <div class="stat"><div class="v">{da['first']}</div><div class="l">{html.escape(an)}, batting first</div></div>
      <div class="stat"><div class="v">{db['first']}</div><div class="l">{html.escape(bn)}, batting first</div></div>
      <div class="stat"><div class="v">{abs(diff)}</div><div class="l">Runs between them</div></div>
    </div>
    <a class="btn" href="/">See live predictions &rarr;</a>
  </div>

  <h2>{html.escape(high)} is the higher-scoring country of the two, by {abs(diff)} runs</h2>
  <div class="card">
    <p>A first innings averages <strong>{hd['first']}</strong> at the {hd['grounds']} {html.escape(high)} grounds we
       hold ball-by-ball data for, across {hd['matches']} matches, against <strong>{ld['first']}</strong> in
       {html.escape(low)} over {ld['matches']} matches. Scoring rates run {hd['rpo']} an over against {ld['rpo']}.
       Of the countries we track, {html.escape(NAMES[top[0]])} is the highest at {top[1]['first']} and
       {html.escape(NAMES[bottom[0]])} the lowest at {bottom[1]['first']}.</p>
    <p>Chasing costs <strong>{round(da['first'] - da['second'], 1)}</strong> runs on average in {html.escape(an)} and
       <strong>{round(db['first'] - db['second'], 1)}</strong> in {html.escape(bn)} &mdash; but the country average
       hides the spread that matters. It is {da['hardest']['gap']} at {html.escape(da['hardest']['name'])} and
       {da['easiest']['gap']} at {html.escape(da['easiest']['name'])}. A total that defends comfortably at one ground
       is chased down at another.</p>
  </div>

{table(an, da)}
{table(bn, db)}
  <p class="note">These cover all T20 cricket at those grounds rather than internationals alone, so treat them as
     ground character. Sample sizes are per ground in the tables and vary widely &mdash; a venue with five matches
     behind it deserves far less weight than one with a hundred. The live model does not use these averages: once a
     ball is bowled it reads the actual over-by-over run and wicket pattern instead.</p>

  <h2>How the live prediction works</h2>
  <div class="card">
    <p><strong>It starts when the match does.</strong> There is no pre-match tip here. Win probability is recalculated
       after every ball from the score, wickets in hand, balls and runs remaining, and how the pitch is behaving in
       this innings rather than on average.</p>
    <p><strong>Measured, not claimed.</strong> 81.5% win-probability accuracy on a true holdout: trained on 2017-2024
       matches only, then scored on 2,546 matches from 2025-26 the model had never seen, rising from 79.2% at over 6
       to 82.2% by over 15.</p>
  </div>

  <h2>{html.escape(an)} vs {html.escape(bn)} &mdash; FAQs</h2>
{faq_html}

  <div class="links">Other fixtures: {others}</div>

  <div class="cta-box">
    <div class="t">Live win probability, free</div>
    <div class="s">Updated after every ball. No sign-up, no paywall.</div>
    <a class="btn" href="/">Open live predictions &rarr;</a>
  </div>
</div>
<footer>
  &copy; 2026 CricIntelligence &middot; <a href="/about">About</a> &middot; <a href="/faq">FAQ</a> &middot;
  <a href="/how-it-works">How it works</a><br/>
  Predictions are statistical estimates, not guarantees. 18+ &middot;
  <a href="https://www.begambleaware.org" rel="nofollow noopener" target="_blank">BeGambleAware.org</a>
</footer>
</body>
</html>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    venues = json.load(open(VENUE_JSON, encoding="utf-8"))
    data = {c: league(c, venues, table=COUNTRIES) for c in COUNTRIES}
    missing = [c for c, d in data.items() if not d]
    if missing:
        print(f"  no ground data for: {missing}")

    if not args.dry_run:
        os.makedirs(OUT_DIR, exist_ok=True)

    n = 0
    for a, b in FIXTURES:
        if not data.get(a) or not data.get(b):
            print(f"  SKIP {a}-vs-{b}: missing country data")
            continue
        slug, page = build(a, b, data[a], data[b], data)
        if not args.dry_run:
            open(os.path.join(OUT_DIR, f"{slug}.html"), "w",
                 encoding="utf-8", newline="\n").write(page)
        print(f"  OK   international/{slug}.html  ({len(page)} bytes)")
        n += 1

    print(f"\n{n} international pages"
          + ("  [dry run, nothing written]" if args.dry_run else " written"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
