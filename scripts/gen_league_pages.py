"""
Generate one evergreen predictions page per T20 league.

Why evergreen and not per-fixture
---------------------------------
The Hundred fixture pages built earlier go stale the day the competition ends,
and a new set has to be written every season. A league page keeps the same URL
year after year and earns search traffic each time the competition comes round,
so the effort compounds instead of resetting. The URLs here deliberately carry
no year - /predictions/ipl-predictions, not ipl-2026.

Each page is built from that league's real ground records (scripts/league_data.py,
merged from the backend's venue_stats.json), so no two read alike: the PSL page
opens on 172.4 first-innings runs, the BPL page on 139.2, and each carries its
own table of grounds ranked by how much chasing costs.

What these pages will not do
----------------------------
Predict winners. The model is a live model - it has nothing to say until a ball
is bowled, and a made-up pre-match number is the fastest way to lose a reader who
checks. The pages say what the grounds have actually done and link to the live
product for the rest.

Usage:  python scripts/gen_league_pages.py [--dry-run]
"""
import argparse
import html
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from league_data import GROUNDS, league, VENUE_JSON  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "public", "predictions")
BASE = "https://www.cricintelligence.com"

# slug -> (competition name, short name, country/region blurb)
LEAGUES = {
    "ipl":            ("Indian Premier League", "IPL", "India"),
    "big-bash":       ("Big Bash League", "BBL", "Australia"),
    "psl":            ("Pakistan Super League", "PSL", "Pakistan"),
    "cpl":            ("Caribbean Premier League", "CPL", "the West Indies"),
    "sa20":           ("SA20", "SA20", "South Africa"),
    "ilt20":          ("International League T20", "ILT20", "the UAE"),
    "lpl":            ("Lanka Premier League", "LPL", "Sri Lanka"),
    "bpl":            ("Bangladesh Premier League", "BPL", "Bangladesh"),
    "the-hundred":    ("The Hundred", "The Hundred", "England and Wales"),
    "vitality-blast": ("Vitality Blast", "Vitality Blast", "England and Wales"),
}

CSS = """*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Inter,-apple-system,system-ui,sans-serif;background:#EEF2FF;color:#0A0A0A}
nav{background:#1E2D6B;padding:0 24px;height:54px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.logo{display:flex;flex-direction:column;line-height:1.1;text-decoration:none}
.logo span:first-child{font-weight:800;font-size:13px;color:#fff;letter-spacing:2px;font-family:Georgia,serif}
.logo span:last-child{font-weight:400;font-size:9px;color:#C8961E;letter-spacing:3.5px;font-family:Georgia,serif}
.cta-btn{background:#C8961E;color:#1E2D6B;font-size:12px;font-weight:700;padding:7px 16px;border-radius:8px;text-decoration:none}
.container{max-width:880px;margin:0 auto;padding:36px 20px 60px}
.hero{background:linear-gradient(135deg,#1E2D6B 0%,#2A3F82 100%);border-radius:18px;padding:32px 28px;margin-bottom:28px;color:#fff}
.tag{font-size:11px;font-weight:700;color:#C8961E;letter-spacing:2px;margin-bottom:12px;text-transform:uppercase}
h1{font-size:clamp(22px,4vw,34px);font-weight:900;margin:0 0 12px;line-height:1.2}
.hero p{font-size:14px;color:rgba(255,255,255,.72);line-height:1.7;max-width:620px;margin-bottom:20px}
.stats{display:flex;gap:26px;flex-wrap:wrap;margin-bottom:20px}
.stat .v{font-size:24px;font-weight:900;color:#C8961E}
.stat .l{font-size:11px;color:rgba(255,255,255,.5)}
.btn{display:inline-block;background:#C8961E;color:#1E2D6B;font-weight:800;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none}
h2{font-size:20px;font-weight:800;color:#1E2D6B;margin:0 0 14px}
.card{background:#fff;border:1px solid #E2E8F0;border-radius:14px;padding:20px 22px;margin-bottom:22px}
.card p{font-size:14px;color:#64748B;line-height:1.75;margin-bottom:10px}
.tw{overflow-x:auto;background:#fff;border:1px solid #E2E8F0;border-radius:14px;margin-bottom:22px}
table{border-collapse:collapse;width:100%;min-width:520px}
th{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#64748B;text-align:right;padding:12px 14px;border-bottom:1px solid #E2E8F0;font-weight:700}
th:first-child{text-align:left}
td{font-size:13px;color:#334155;text-align:right;padding:11px 14px;border-bottom:1px solid #F1F5F9}
td:first-child{text-align:left;font-weight:600;color:#1E2D6B}
tr:last-child td{border-bottom:none}
.faq{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:16px 20px;margin-bottom:10px}
.faq .q{font-size:14px;font-weight:700;color:#1E2D6B;margin-bottom:6px}
.faq .a{font-size:13px;color:#64748B;line-height:1.7}
.links{display:flex;gap:14px;flex-wrap:wrap;margin:22px 0}
.links a{font-size:13px;color:#1E2D6B;font-weight:700}
.cta-box{background:linear-gradient(135deg,#1E2D6B,#2A3F82);border-radius:16px;padding:26px 22px;text-align:center;color:#fff}
.cta-box .t{font-size:18px;font-weight:800;margin-bottom:8px}
.cta-box .s{font-size:13px;color:rgba(255,255,255,.65);margin-bottom:16px}
.note{color:#64748B;font-size:12.5px;line-height:1.7;margin-top:14px}
footer{background:#0F172A;color:#94A3B8;font-size:12px;padding:22px 20px;text-align:center;line-height:1.8}
footer a{color:#C8961E}"""


def rank_note(d, all_leagues):
    """Where this league sits against the others on first-innings scoring."""
    order = sorted(all_leagues.items(), key=lambda kv: -kv[1]["first"])
    names = {k: LEAGUES[k][1] for k in all_leagues}
    top, bottom = order[0], order[-1]
    return top, bottom, names


def build(slug, d, all_leagues):
    full, short, region = LEAGUES[slug]
    gap = round(d["first"] - d["second"], 1)
    top, bottom, names = rank_note(d, all_leagues)
    pos = [k for k, _ in sorted(all_leagues.items(), key=lambda kv: -kv[1]["first"])].index(slug) + 1

    title = f"{full} Predictions — Ground Records and Live AI Win Probability | CricIntelligence"
    desc = (f"{short} ground records from {d['matches']} matches: first innings average {d['first']}, "
            f"chasing {d['second']}. Live AI win probability updated every ball. Free, no sign-up.")

    rows = "\n".join(
        f"<tr><td>{html.escape(r['name'])}</td><td>{r['n']}</td><td>{r['first']}</td>"
        f"<td>{r['second']}</td><td>{r['gap']:+}</td><td>{r['rpo']}</td></tr>"
        for r in d["rows"]
    )

    faqs = [
        (f"Which {short} ground is hardest to chase at?",
         f"{d['hardest']['name']}. Across {d['hardest']['n']} matches there, sides batting first average "
         f"{d['hardest']['first']} and sides chasing {d['hardest']['second']} — a {d['hardest']['gap']}-run gap. "
         f"The most forgiving is {d['easiest']['name']}, where the same gap is {d['easiest']['gap']}."),
        (f"What is a good score in the {full}?",
         f"Across {d['matches']} matches at the grounds listed, a first innings averages {d['first']} and a chase "
         f"{d['second']}, at {d['rpo']} runs an over. That puts the {short} "
         + (f"top of the T20 leagues we track for first-innings scoring"
            if pos == 1 else
            f"{pos}th of the {len(all_leagues)} T20 leagues we track for first-innings scoring")
         + f", against {names[top[0]]} at {top[1]['first']} and {names[bottom[0]]} at {bottom[1]['first']}."),
        (f"Who will win tonight's {short} match?",
         "We do not publish pre-match tips. The model is a live model: it has nothing useful to say until a ball is "
         "bowled, and then recalculates win probability after every one from the score, wickets in hand, required "
         "rate and how the pitch is actually playing. It measures 81.5% accuracy on a true holdout — trained on "
         "2017-2024 matches only, then scored on 2,546 matches from 2025-26 it had never seen."),
        ("Where do these numbers come from?",
         f"Ball-by-ball records for the grounds this competition uses, {d['matches']} matches in total. They are "
         "T20 records for each ground rather than records for this competition alone, so read them as ground "
         "character. Sample sizes are shown per ground in the table — some are small, and a ground with 5 matches "
         "behind it deserves less weight than one with 100."),
        ("Is it free?",
         "Yes. Live win probability, score projections and next-over forecasts are free, with no sign-up."),
    ]

    faq_ld = json.dumps(
        [{"@type": "Question", "name": q,
          "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs],
        indent=1, ensure_ascii=False)

    faq_html = "\n".join(
        f'<div class="faq"><div class="q">{html.escape(q)}</div><div class="a">{html.escape(a)}</div></div>'
        for q, a in faqs)

    others = " · ".join(
        f'<a href="/predictions/{s}-predictions">{LEAGUES[s][1]}</a>'
        for s in LEAGUES if s != slug)

    url = f"{BASE}/predictions/{slug}-predictions"
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<!-- generated by scripts/gen_league_pages.py from venue_stats.json - do not hand-edit -->
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
    <div class="tag">Ground records &middot; {html.escape(full)}</div>
    <h1>{html.escape(full)} Predictions &mdash; What the Grounds Actually Do</h1>
    <p>Ball-by-ball records for the {d['grounds']} grounds this competition uses, {d['matches']} matches in total,
       plus live AI win probability updated after every ball once a match starts.</p>
    <div class="stats">
      <div class="stat"><div class="v">{d['first']}</div><div class="l">Batting first, avg</div></div>
      <div class="stat"><div class="v">{d['second']}</div><div class="l">Chasing, avg</div></div>
      <div class="stat"><div class="v">{gap:+}</div><div class="l">Cost of chasing</div></div>
      <div class="stat"><div class="v">{d['rpo']}</div><div class="l">Runs per over</div></div>
    </div>
    <a class="btn" href="/">See live {html.escape(short)} predictions &rarr;</a>
  </div>

  <h2>Chasing costs {gap} runs in the {html.escape(short)} &mdash; but that hides a wide spread</h2>
  <div class="card">
    <p>Across {d['matches']} matches at these grounds a first innings averages <strong>{d['first']}</strong> and a
       chase <strong>{d['second']}</strong>, at <strong>{d['rpo']}</strong> runs an over. On first-innings scoring
       that places the {html.escape(short)} {'top of' if pos == 1 else f'{pos}th among'} the
       {len(all_leagues)} T20 leagues we hold ground data for, against
       {html.escape(names[top[0]])} at {top[1]['first']} and {html.escape(names[bottom[0]])} at {bottom[1]['first']}.</p>
    <p>The league average is the least interesting number on this page. Chasing costs
       <strong>{d['hardest']['gap']}</strong> runs at <strong>{html.escape(d['hardest']['name'])}</strong> and only
       <strong>{d['easiest']['gap']}</strong> at <strong>{html.escape(d['easiest']['name'])}</strong>. The
       highest-scoring ground on the list is <strong>{html.escape(d['highest']['name'])}</strong> at
       {d['highest']['rpo']} an over. A total that wins comfortably at one of these grounds loses at another.</p>
  </div>

  <h2>{html.escape(short)} grounds, ranked by how much chasing costs</h2>
  <div class="tw">
    <table>
      <thead><tr><th>Ground</th><th>Matches</th><th>1st inns</th><th>Chasing</th><th>Gap</th><th>RPO</th></tr></thead>
      <tbody>
{rows}
      </tbody>
    </table>
  </div>
  <p class="note">These are T20 records for each ground rather than for this competition alone, so treat them as ground
     character. Sample sizes vary a lot &mdash; a ground with five matches behind it deserves far less weight than one
     with a hundred, and both are in the table rather than hidden behind an average. The live model does not use these
     figures: once a ball is bowled it reads the actual over-by-over run and wicket pattern instead.</p>

  <h2>How the live prediction works</h2>
  <div class="card">
    <p><strong>It starts when the match does.</strong> There is no pre-match tip here. Win probability is recalculated
       after every ball from the score, wickets in hand, balls and runs remaining, and how the pitch is behaving in
       this innings rather than on average.</p>
    <p><strong>Measured, not claimed.</strong> 81.5% win-probability accuracy on a true holdout: trained on 2017-2024
       matches only, then scored on 2,546 matches from 2025-26 the model had never seen. Accuracy rises through an
       innings, from 79.2% at over 6 to 82.2% by over 15.</p>
    <p><strong>Next-over forecasts too.</strong> Expected runs for the coming over land inside the published range
       72.3% of the time, measured across 46,718 over-boundary snapshots.</p>
  </div>

  <h2>{html.escape(short)} predictions &mdash; FAQs</h2>
{faq_html}

  <div class="links">Other competitions: {others}</div>

  <div class="cta-box">
    <div class="t">Live {html.escape(short)} win probability, free</div>
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
    data = {}
    for slug in LEAGUES:
        d = league(slug, venues)
        if not d:
            print(f"  SKIP {slug}: no ground data")
            continue
        data[slug] = d

    written = 0
    for slug, d in data.items():
        page = build(slug, d, data)
        path = os.path.join(OUT_DIR, f"{slug}-predictions.html")
        if not args.dry_run:
            open(path, "w", encoding="utf-8", newline="\n").write(page)
        print(f"  OK   {slug}-predictions.html  ({len(page)} bytes, "
              f"{d['grounds']} grounds / {d['matches']} matches)")
        written += 1

    print(f"\n{written} league pages"
          + ("  [dry run, nothing written]" if args.dry_run else " written"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
