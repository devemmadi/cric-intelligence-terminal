"""
Rewrite the generic body of a Hundred matchup page with that fixture's real
ground record.

Why this exists
---------------
Search Console reported 74 of 84 sitemap URLs as "Discovered - currently not
indexed". Comparing two of the matchup pages showed why: 392 shared words, 16
unique to one and 17 to the other, and the unique words were only the team
names. Google was being asked to index ~76 copies of one page and declined.

This script replaces three blocks per page - the analysis section, the two team
cards, and the FAQs (visible copy AND the FAQPage JSON-LD, which must match) -
with numbers pulled from the backend's venue_stats.json. Each fixture compares
the two clubs' home grounds, so no two pages read alike.

What it will not do
-------------------
Invent a pre-match favourite. The model is a live model; it has nothing to say
before a ball is bowled, and a made-up percentage is exactly the kind of claim
that costs a site its credibility once someone checks. The pages say so.

It also refuses to run for a fixture where either ground is missing from
venue_stats.json (Headingley, at time of writing) rather than falling back to
generic filler - a page with nothing specific to say should be removed from the
sitemap, not padded.

Usage:  python scripts/enrich_matchup_pages.py [--dry-run]
"""
import argparse
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES_DIR = os.path.join(ROOT, "public", "predictions")
VENUE_JSON = os.path.join(
    os.path.dirname(ROOT), "cricintel-backend", "venue_stats.json"
)

# Hundred club -> (display name, home ground, venue_stats.json key)
TEAMS = {
    "birmingham-phoenix":       ("Birmingham Phoenix",      "Edgbaston, Birmingham",   "edgbaston"),
    "london-spirit":            ("London Spirit",           "Lord's, London",          "lord's"),
    "southern-brave":           ("Southern Brave",          "The Rose Bowl, Southampton", "the rose bowl"),
    "trent-rockets":            ("Trent Rockets",           "Trent Bridge, Nottingham","trent bridge"),
    "welsh-fire":               ("Welsh Fire",              "Sophia Gardens, Cardiff", "sophia gardens"),
    "manchester-super-giants":  ("Manchester Super Giants", "Old Trafford, Manchester","old trafford"),
    "mi-london":                ("MI London",               "The Oval, London",        "kennington oval"),
    # Sunrisers Leeds (Headingley) has no entry in venue_stats.json - fixtures
    # involving them are skipped rather than filled with generic copy.
}

FIXTURES = [
    "birmingham-phoenix-vs-london-spirit",
    "birmingham-phoenix-vs-welsh-fire",
    "birmingham-phoenix-vs-southern-brave",
    "birmingham-phoenix-vs-trent-rockets",
    "london-spirit-vs-welsh-fire",
    "manchester-super-giants-vs-welsh-fire",
    "manchester-super-giants-vs-southern-brave",
    "mi-london-vs-london-spirit",
    "mi-london-vs-southern-brave",
    "southern-brave-vs-welsh-fire",
    "trent-rockets-vs-welsh-fire",
]


def split_slug(slug):
    """Split 'a-vs-b' on the '-vs-' that separates two known team keys."""
    for i in range(len(slug)):
        if slug[i:i + 4] == "-vs-":
            left, right = slug[:i], slug[i + 4:]
            if left in TEAMS and right in TEAMS:
                return left, right
    return None, None


def ground(venues, key):
    v = venues[key]
    segs = {s["label"]: s for s in v["segments"]["inn1"]}
    segs2 = {s["label"]: s for s in v["segments"]["inn2"]}
    first, second = v["avg_first_innings"], v["avg_second_innings"]
    return {
        "n": v["match_count"],
        "first": first,
        "second": second,
        "gap": round(first - second, 1),
        "rpo": v["overall_avg_rpo"],
        "inn1": segs,
        "inn2": segs2,
        # Where a chase is most likely to come apart at this ground.
        "worst2": min(segs2.values(), key=lambda s: s["avg_rpo"]),
        "best1": max(segs.values(), key=lambda s: s["avg_rpo"]),
    }


def chase_verdict(gap):
    if gap < 6:
        return ("barely matters", "one of the few grounds where chasing costs a side almost nothing")
    if gap < 15:
        return ("mild", "a modest edge to batting first")
    if gap < 20:
        return ("real", "a clear edge to batting first")
    return ("severe", "one of the hardest grounds on this list to chase at")


def build_analysis(a_name, a_g, a_ground, b_name, b_g, b_ground):
    """The fixture's headline finding: which of the two grounds punishes a chase."""
    hard, easy = (a_name, b_name) if a_g["gap"] >= b_g["gap"] else (b_name, a_name)
    hg, eg = (a_g, b_g) if a_g["gap"] >= b_g["gap"] else (b_g, a_g)
    hgr, egr = (a_ground, b_ground) if a_g["gap"] >= b_g["gap"] else (b_ground, a_ground)
    _, hard_phrase = chase_verdict(hg["gap"])
    _, easy_phrase = chase_verdict(eg["gap"])
    w = hg["worst2"]

    heading = (f"Chasing costs more at {hgr.split(',')[0]} than at {egr.split(',')[0]} "
               f"&mdash; {hg['gap']} runs against {eg['gap']}")

    body = f"""
    <p>Across the T20 cricket we hold ball-by-ball data for at these two grounds, sides batting first at
       <strong>{hgr.split(',')[0]}</strong> average <strong>{hg['first']}</strong> and sides chasing average
       <strong>{hg['second']}</strong> &mdash; a <strong>{hg['gap']}-run gap</strong>, {hard_phrase}. At
       <strong>{egr.split(',')[0]}</strong> the same gap is <strong>{eg['gap']}</strong> runs
       ({eg['first']} batting first, {eg['second']} chasing), {easy_phrase}.</p>
    <p>{hgr.split(',')[0]} scores at <strong>{hg['rpo']}</strong> an over overall against
       <strong>{eg['rpo']}</strong> at {egr.split(',')[0]}. The chase at {hgr.split(',')[0]} is at its worst through
       overs <strong>{w['label']}</strong>, where it manages just <strong>{w['avg_rpo']}</strong> an over and loses
       <strong>{w['avg_wickets']}</strong> wickets; a first innings there peaks at
       <strong>{hg['best1']['avg_rpo']}</strong> in overs {hg['best1']['label']}.</p>
    <p><strong>What that means for this fixture:</strong> the toss is worth more at {hgr.split(',')[0]} than at
       {egr.split(',')[0]}, and a chase there that loses an early wicket is in more trouble than the scoreboard
       suggests. At {egr.split(',')[0]} a side batting second has more room to absorb one.</p>
    <p style="color:#64748B;font-size:13px;margin-top:14px">Small samples &mdash; <strong>{hg['n']} matches</strong> at
       {hgr.split(',')[0]}, <strong>{eg['n']}</strong> at {egr.split(',')[0]} &mdash; and drawn from T20 fixtures at
       those grounds rather than from The Hundred, whose innings is 20 balls shorter. Read them as ground character,
       not as a forecast. The live model does not use these averages at all: once a ball is bowled it works from the
       actual over-by-over run and wicket pattern.</p>"""
    return heading, body.strip()


def build_cards(a_name, a_ground, a_g, b_name, b_ground, b_g):
    out = []
    for name, gr, g in ((a_name, a_ground, a_g), (b_name, b_ground, b_g)):
        w = g["worst2"]
        out.append(
            f'<div class="tcard"><div class="nm">{html.escape(name)}</div>'
            f'<div class="sub">{html.escape(gr)} &middot; {g["n"]} T20s on record</div>'
            f'<div class="st"><strong>Batting first:</strong> {g["first"]} avg &middot; '
            f'<strong>Chasing:</strong> {g["second"]} avg<br/>'
            f'<strong>Scoring rate:</strong> {g["rpo"]} an over<br/>'
            f'<strong>Chase low point:</strong> overs {w["label"]} at {w["avg_rpo"]} an over, '
            f'{w["avg_wickets"]} wickets</div></div>'
        )
    return "\n".join(out)


def build_faqs(a_name, a_ground, a_g, b_name, b_ground, b_g):
    hard, hg, hgr = ((a_name, a_g, a_ground) if a_g["gap"] >= b_g["gap"]
                     else (b_name, b_g, b_ground))
    easy, eg, egr = ((b_name, b_g, b_ground) if a_g["gap"] >= b_g["gap"]
                     else (a_name, a_g, a_ground))
    hs, es = hgr.split(",")[0], egr.split(",")[0]
    w = hg["worst2"]
    return [
        (f"Who will win {a_name} vs {b_name}?",
         "We do not publish a pre-match favourite, because we have nothing to base one on that you could check. "
         "Our model is a live model: it produces nothing useful until a ball is bowled, and then recalculates after "
         f"every one from the score, wickets in hand, required rate and how the pitch is actually playing. What the "
         f"ground record does say is that the toss matters more at {hs}, where sides batting first average "
         f"{hg['first']} and chasing sides {hg['second']} across {hg['n']} recorded T20s — a {hg['gap']}-run gap, "
         f"against {eg['gap']} at {es}."),
        (f"Is it harder to chase at {hs} or {es}?",
         f"{hs}, on this data. The gap between batting first and chasing there is {hg['gap']} runs against "
         f"{eg['gap']} at {es}. A chase at {hs} is at its worst through overs {w['label']}, scoring "
         f"{w['avg_rpo']} an over and losing {w['avg_wickets']} wickets."),
        (f"Where is {a_name} vs {b_name} played?",
         f"{a_name} play home matches at {a_ground}; {b_name} play at {b_ground}. "
         f"{a_ground.split(',')[0]} scores at {a_g['rpo']} an over and {b_ground.split(',')[0]} at {b_g['rpo']}. "
         f"Both figures come from T20 fixtures at those grounds — {a_g['n']} and {b_g['n']} matches "
         "respectively — not from The Hundred, whose innings is 20 balls shorter."),
    ]


def patch(path, heading, body, cards, faqs, dry):
    src = open(path, encoding="utf-8").read()
    orig = src

    # 1. Analysis section: the <h2> before the first .card, and that card's body.
    m = re.search(r"<h2>[^<]*how the model reads this fixture</h2>\s*<div class=\"card\">(.*?)</div>",
                  src, re.S)
    if not m:
        return None, "analysis block not found"
    src = src[:m.start()] + f"<h2>{heading}</h2>\n  <div class=\"card\">\n    {body}\n  </div>" + src[m.end():]

    # 2. Team cards.
    m = re.search(r"(<h2>Team analysis</h2>\s*<div class=\"grid\">\s*).*?(\s*</div>\s*<h2>)", src, re.S)
    if not m:
        return None, "team cards not found"
    src = src[:m.start()] + m.group(1) + cards + m.group(2) + src[m.end():]

    # 3. Visible FAQs: replace the first two, keep the boilerplate ones after.
    vis = "\n".join(
        f'<div class="faq"><div class="q">{html.escape(q)}</div>'
        f'<div class="a">{html.escape(a)}</div></div>'
        for q, a in faqs
    )
    m = re.search(r"(<h2>[^<]*FAQs</h2>\s*)(<div class=\"faq\">.*?</div></div>\s*){3}", src, re.S)
    if not m:
        return None, "visible faqs not found"
    src = src[:m.start()] + m.group(1) + vis + "\n" + src[m.end():]

    # 4. FAQPage JSON-LD - Google requires this to match the visible copy.
    m = re.search(r'("@type":\s*"FAQPage",\s*"mainEntity":\s*\[)(.*?)(\s*\]\s*\})', src, re.S)
    if not m:
        return None, "faq schema not found"
    tail = json.loads("[" + m.group(2).rstrip().rstrip(",") + "]")[3:]
    entries = [{"@type": "Question", "name": q,
                "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs] + tail
    payload = json.dumps(entries, indent=1, ensure_ascii=False)[1:-1]
    src = src[:m.start()] + m.group(1) + payload + m.group(3) + src[m.end():]

    if not dry:
        open(path, "w", encoding="utf-8", newline="\n").write(src)
    return len(src) - len(orig), None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    venues = json.load(open(VENUE_JSON, encoding="utf-8"))
    ok = skipped = failed = 0

    for slug in FIXTURES:
        a_key, b_key = split_slug(slug)
        if not a_key:
            print(f"  SKIP  {slug}: could not split into two known teams")
            skipped += 1
            continue
        a_name, a_ground, a_vk = TEAMS[a_key]
        b_name, b_ground, b_vk = TEAMS[b_key]
        if a_vk not in venues or b_vk not in venues:
            print(f"  SKIP  {slug}: no venue record for one of the grounds")
            skipped += 1
            continue

        a_g, b_g = ground(venues, a_vk), ground(venues, b_vk)
        heading, body = build_analysis(a_name, a_g, a_ground, b_name, b_g, b_ground)
        cards = build_cards(a_name, a_ground, a_g, b_name, b_ground, b_g)
        faqs = build_faqs(a_name, a_ground, a_g, b_name, b_ground, b_g)

        path = os.path.join(PAGES_DIR, f"{slug}-2026.html")
        if not os.path.exists(path):
            print(f"  SKIP  {slug}: no static file")
            skipped += 1
            continue
        delta, err = patch(path, heading, body, cards, faqs, args.dry_run)
        if err:
            print(f"  FAIL  {slug}: {err}")
            failed += 1
        else:
            print(f"  OK    {slug}  ({delta:+d} bytes)")
            ok += 1

    print(f"\n{ok} rewritten, {skipped} skipped, {failed} failed"
          + ("  [dry run, nothing written]" if args.dry_run else ""))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
