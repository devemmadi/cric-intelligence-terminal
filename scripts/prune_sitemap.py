"""
Cut the sitemap down to the pages that have something specific to say.

Background
----------
Search Console reported 74 of 84 sitemap URLs as "Discovered - currently not
indexed": Google found them, looked, and declined to crawl. Comparing two of the
matchup pages showed why - 392 shared words against 16 unique, and the unique
ones were the team names. Asking Google to index ~76 near-copies also risks the
whole site being read as low-value, which drags down the pages that are fine.

So the sitemap now lists only:
  * the real standalone pages (home, about, faq, how-it-works, odds, uk hub)
  * the competition hub pages
  * the Hundred matchups enriched by scripts/enrich_matchup_pages.py, which
    carry their own ground record and read differently from each other

Everything else is dropped. Dropping a URL from the sitemap does not deindex it,
so the static files among them also get <meta name="robots" content="noindex,
follow"> - that actively asks Google to let them go while still following the
links out of them.

The IPL matchup pages are dropped for a second reason on top of thinness: they
are 2026-season pages and that season finished in May. Re-add them, enriched,
ahead of the next one.

Usage:  python scripts/prune_sitemap.py [--dry-run]
"""
import argparse
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITEMAP = os.path.join(ROOT, "public", "sitemap.xml")
PAGES_DIR = os.path.join(ROOT, "public", "predictions")

# Enriched by enrich_matchup_pages.py - each carries its two grounds' records.
ENRICHED = [
    "birmingham-phoenix-vs-london-spirit-2026",
    "birmingham-phoenix-vs-welsh-fire-2026",
    "birmingham-phoenix-vs-southern-brave-2026",
    "birmingham-phoenix-vs-trent-rockets-2026",
    "london-spirit-vs-welsh-fire-2026",
    "manchester-super-giants-vs-welsh-fire-2026",
    "manchester-super-giants-vs-southern-brave-2026",
    "mi-london-vs-london-spirit-2026",
    "mi-london-vs-southern-brave-2026",
    "southern-brave-vs-welsh-fire-2026",
    "trent-rockets-vs-welsh-fire-2026",
]

KEEP_PATHS = {
    "/",
    "/about",
    "/faq",
    "/how-it-works",
    "/odds",
    "/cricket-predictions-uk",
    "/predictions/ipl-2026",
    "/predictions/t20-predictions",
    "/predictions/the-hundred-2026",
    "/predictions/vitality-blast-2026",
    "/predictions/cricket-win-probability",
} | {f"/predictions/{s}" for s in ENRICHED}

BASE = "https://www.cricintelligence.com"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    src = open(SITEMAP, encoding="utf-8").read()
    blocks = re.findall(r"[ \t]*<url>.*?</url>[ \t]*\n?", src, re.S)
    if not blocks:
        print("No <url> blocks found - sitemap format changed?")
        return 1

    kept, dropped = [], []
    for b in blocks:
        loc = re.search(r"<loc>([^<]+)</loc>", b)
        path = loc.group(1).replace(BASE, "").rstrip("/") or "/"
        (kept if path in KEEP_PATHS else dropped).append((path, b))

    missing = KEEP_PATHS - {p for p, _ in kept}
    for m in sorted(missing):
        print(f"  NOTE  keep-list entry not in sitemap: {m}")

    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ""]
    for _, b in kept:
        out.append("  " + b.strip())
    out += ["", "</urlset>", ""]

    if not args.dry_run:
        open(SITEMAP, "w", encoding="utf-8", newline="\n").write("\n".join(out))

    # Actively release the dropped static pages rather than just forgetting them.
    noindexed = 0
    for path, _ in dropped:
        if not path.startswith("/predictions/"):
            continue
        f = os.path.join(PAGES_DIR, path.split("/")[-1] + ".html")
        if not os.path.exists(f):
            continue
        s = open(f, encoding="utf-8").read()
        if 'content="noindex' in s:
            continue
        s2 = re.sub(r'<meta name="robots" content="[^"]*"\s*/?>',
                    '<meta name="robots" content="noindex, follow"/>', s, count=1)
        if s2 == s:
            s2 = s.replace("</head>", '<meta name="robots" content="noindex, follow"/>\n</head>', 1)
        if not args.dry_run:
            open(f, "w", encoding="utf-8", newline="\n").write(s2)
        noindexed += 1

    print(f"\nkept {len(kept)} URLs, dropped {len(dropped)}, "
          f"noindexed {noindexed} static files"
          + ("  [dry run, nothing written]" if args.dry_run else ""))
    print("\nKept:")
    for p, _ in kept:
        print("  " + p)
    return 0


if __name__ == "__main__":
    sys.exit(main())
