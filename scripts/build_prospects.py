#!/usr/bin/env python3
"""
Build the B2B prospect list, and find each company's contact address automatically.

WHY A SCRIPT AND NOT A HAND-WRITTEN LIST
----------------------------------------
Visiting sixty sites by hand to copy an email address is the kind of work that
gets abandoned halfway and then half-remembered. This fetches each domain's
home, contact and about pages, pulls any address out of the HTML (including
mailto: links and the common obfuscations), and reports what it found and what
it did not. Re-runnable when a site changes.

WHY NOT 100 COMPANIES
---------------------
The ask was 100. Cricket is a small industry and the honest count of plausible
buyers is nearer 60. Padding a list to hit a round number is the same mistake as
publishing 120 ground pages that included a German club ground - it makes the
work look bigger and perform worse. Everything here is a real company that could
plausibly want a win-probability layer.

TIERS
-----
  1  data providers      - one deal reaches all their customers. Highest leverage.
  2  score/news apps     - large audiences, no prediction layer, cannot build one
  3  fantasy platforms   - post-PROGA free-to-play, badly need engagement features
  4  streaming/broadcast - second-screen and overlay use
  5  media/analytics     - cite the numbers rather than licence them

EXCLUDED ON PURPOSE (do not add them back):
  Cricbuzz, AllCric  - already ship win probability, they built it
  Sportradar, Stats Perform (Opta) - they sell cricket win probability already
  ESPNcricinfo       - owned by Disney, buys from Opta
  Anything India-facing and gambling - PROGA 2025 makes that advertising illegal

Run:  python scripts/build_prospects.py            -> drafts/b2b-prospects.md
      python scripts/build_prospects.py --no-fetch  (list only, no network)
"""

import argparse
import io
import os
import re
import socket
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "drafts", "b2b-prospects.md")

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")

# (name, domain, tier, note)  -- tier drives which email draft to use
PROSPECTS = [
    # ── tier 1: data providers / API vendors ──────────────────────────────────
    ("Sportmonks",        "sportmonks.com",        1, "SENT 26 Aug, auto-ack ticket #108620 - follow-up drafted"),
    ("Roanuz",            "sports.roanuz.com",     1, "SENT 26 Aug, no reply - one follow-up drafted"),
    ("EntitySport",       "entitysport.com",       1, "Has a competing prediction API but publishes no accuracy - send LAST"),
    ("Goalserve",         "goalserve.com",         1, "Multi-sport, 20 years, cricket feed customers"),
    ("CricketData.org",   "cricketdata.org",       1, "Ex-CricAPI, $5.99/mo, independent-developer customers"),
    ("SportsData.io",     "sportsdata.io",         1, "US sports data vendor with cricket coverage"),
    ("Broadage",          "broadage.com",          1, "Sports data + widgets; widgets are a natural home for a win-prob bar"),
    ("Highlightly",       "highlightly.net",       1, "Newer API aggregator, publishes cricket API comparisons"),
    ("API-Sports",        "api-sports.io",         1, "Multi-sport API family, RapidAPI-native"),
    ("Togwe",             "togwe.com",             1, "Sports tech vendor, publishes cricket API buyer guides"),
    ("Sportz Interactive","sportzinteractive.net", 1, "India, builds digital products for cricket boards and broadcasters"),
    ("SportsMechanics",   "sportsmechanics.in",    1, "India, cricket analytics for franchises and boards"),

    # ── tier 2: score and news apps with no prediction layer ──────────────────
    ("CREX",              "crex.com",              2, "Large audience, no win probability"),
    ("CricRocket",        "cricrocket.com",        2, "Fast-score app, no prediction layer"),
    ("Cricket LineX",     "cricketlinex.com",      2, "Fast-score app"),
    ("CricHeroes",        "cricheroes.com",        2, "40M+ users, grassroots scoring - different angle: club-level prediction"),
    ("Cricbites",         "cricbites.com",         2, "Scores + analysis, small team"),
    ("CricTracker",       "crictracker.com",       2, "Publishes pitch reports written from opinion - a measured number upgrades them"),
    ("Cricket Addictor",  "cricketaddictor.com",   2, "High-volume cricket content"),
    ("CricketNext",       "cricketnext.com",       2, "News18 property"),
    ("Crictoday",         "crictoday.com",         2, "Cricket news and stats"),
    ("Cricingif",         "cricingif.com",         2, "Pakistan, short-form cricket video + scores"),
    ("Cricwick",          "cricwick.net",          2, "Pakistan/MENA cricket streaming and scores"),
    ("Cricketnmore",      "cricketnmore.com",      2, "India cricket news"),
    ("Sportskeeda",       "sportskeeda.com",       2, "Large sports publisher, heavy cricket desk"),
    ("Gully Crix",        "gullycrix.com",         2, "Amateur scoring app"),
    ("CricPulse",         "cricketscoring.jathans.com", 2, "Club/amateur scoring app"),
    ("Just Cricket",      "justcricket.app",       2, "Was Cricket LineX - address is a gmail, see prospect notes"),

    # ── tier 3: fantasy platforms, now free-to-play in India ──────────────────
    ("Dream11",           "dream11.com",           3, "Paid contests banned by PROGA 2025; free-to-play needs engagement features"),
    ("FanCode",           "fancode.com",           3, "Dream Sports; 100+ live matches a month, second-screen"),
    ("My11Circle",        "my11circle.com",        3, "Games24x7"),
    ("MPL",               "mpl.live",              3, "Mobile Premier League"),
    ("Howzat",            "howzat.com",            3, "Junglee Games"),
    ("BalleBaazi",        "ballebaazi.com",        3, "Fantasy operator"),
    ("Vision11",          "vision11.in",           3, "Fantasy operator"),
    ("Real11",            "real11.com",            3, "Fantasy operator"),
    ("Fantasy Akhada",    "fantasyakhada.com",     3, "Fantasy operator"),
    ("Gamezy",            "gamezy.com",            3, "Dream Sports/Games24x7 family"),
    ("Sixer",             "sixer.io",              3, "Listed as a CricViz customer - already buys analytics"),
    ("Grand11",           "grand11.in",            3, "Fantasy prediction content site"),
    ("MyFinal11",         "myfinal11.in",          3, "Fantasy prediction content site"),
    ("Fantasy Khiladi",   "fantasykhiladi.com",    3, "Fantasy prediction content site"),
    ("BattingFirst",      "battingfirst.com",      3, "Cricket news + fantasy tips"),
    ("Sports Preferred",  "sportpreferred.com",    3, "Fantasy prediction content site"),

    # ── tier 4: streaming and broadcast ───────────────────────────────────────
    ("Willow TV",         "willow.tv",             4, "US cricket broadcaster, now Cricbuzz-owned - check before sending"),
    ("YuppTV",            "yupptv.com",            4, "South Asian OTT, cricket rights"),
    ("Premier Sports",    "premiersports.com",     4, "UK/Ireland, MLC and other cricket rights"),
    ("SuperSport",        "supersport.com",        4, "South Africa broadcaster"),
    ("T Sports",          "tsports.com",           4, "Bangladesh broadcaster"),
    ("PTV Sports",        "ptvsports.tv",          4, "Pakistan broadcaster"),
    ("Tapmad",            "tapmad.com",            4, "Pakistan OTT with cricket"),
    ("Rabbitholebd",      "rabbitholebd.com",      4, "Bangladesh cricket rights/OTT"),
    ("Sky Sports Cricket","skysports.com",         4, "Already a CricViz customer - long shot, but the pitch is the published record"),

    # ── tier 5: media, analytics, community ───────────────────────────────────
    ("The Cricket Monthly","thecricketmonthly.com",5, "Long-form cricket writing - citation route, not a licence"),
    ("Wisden",            "wisden.com",            5, "Cricket publisher, data-friendly editorial"),
    ("The Cricketer",     "thecricketer.com",      5, "UK cricket magazine"),
    ("Cricket Web",       "cricketweb.net",        5, "Already publishes on win probability as a concept"),
    ("White Ball Analytics","whiteballanalytics.com",5, "Independent cricket analytics - peer, possible collaborator"),
    ("Deep Point",        "deeppoint.substack.com",5, "Cricket analytics newsletter - citation route"),
    ("CricViz",           "cricviz.com",           5, "The benchmark. Not a buyer, but worth knowing who they talk to"),
]

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
# Addresses that are never the right contact
# Everything that looks like an address in HTML but is not one. The first pass
# returned sweetalert2@11.js (a JS library reference), user@domain.com and
# cricket.fan@email.com (placeholders in page copy), and a raw hosting hostname -
# all of which would have gone into a mail merge unnoticed.
JUNK = re.compile(
    r"(sentry|wixpress|example\.|@2x|\.png|\.jpg|\.jpeg|\.svg|\.webp|\.gif|"
    r"\.js$|\.css$|godaddy|cloudflare|domain(s)?by|privacyprotect|whoisguard|"
    r"@domain\.|@email\.|@yoursite|@yourdomain|@site\.|@company\.|"
    r"cloudwaysapps|amazonaws|herokuapp|\.local$|@sentry|noreply|no-reply|"
    r"donotreply|abuse@|postmaster@|webmaster@|dmarc|@\d)", re.I)
PREFER = ("partnership", "bizdev", "business", "sales", "hello", "contact",
          "info", "support", "team", "admin")


def fetch(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA,
                                                   "Accept": "text/html"})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read(400000).decode("utf-8", "ignore")
    except Exception:
        return ""


def emails_for(domain):
    """Try the pages a contact address actually lives on. Return ranked hits."""
    found = set()
    for path in ("", "/contact", "/contact-us", "/about", "/about-us",
                 "/contact.html", "/support"):
        for scheme in ("https://www.", "https://"):
            html = fetch(scheme + domain + path)
            if html:
                for m in EMAIL_RE.findall(html):
                    dom = m.rsplit("@", 1)[-1].lower()
                    ok = (not JUNK.search(m) and len(m) < 60
                          and "." in dom and not dom[0].isdigit()
                          and len(dom.rsplit(".", 1)[-1]) >= 2
                          and dom.rsplit(".", 1)[-1].isalpha())
                    if ok:
                        found.add(m.lower())
                break            # one scheme is enough per path
        if len(found) >= 4:
            break
    ranked = sorted(found, key=lambda e: (
        min((i for i, p in enumerate(PREFER) if e.startswith(p)), default=99), e))
    return ranked[:3]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-fetch", action="store_true")
    args = ap.parse_args()
    socket.setdefaulttimeout(15)

    results = {}
    if not args.no_fetch:
        with ThreadPoolExecutor(max_workers=10) as ex:
            futs = {ex.submit(emails_for, d): (n, d)
                    for n, d, t, note in PROSPECTS}
            for f in futs:
                n, d = futs[f]
                try:
                    results[d] = f.result()
                except Exception:
                    results[d] = []

    tiers = {
        1: "Tier 1 - data providers (one deal reaches all their customers)",
        2: "Tier 2 - score and news apps with no prediction layer",
        3: "Tier 3 - fantasy platforms, free-to-play since PROGA 2025",
        4: "Tier 4 - streaming and broadcast",
        5: "Tier 5 - media and analytics (citation, not licence)",
    }

    lines = [
        "# B2B prospect list", "",
        "Generated by `scripts/build_prospects.py`. Addresses are harvested from each",
        "company's own site, not guessed - a blank means the script found none and you",
        "will need the contact form instead.", "",
        "**%d companies.** The ask was 100; cricket is a small industry and padding a" % len(PROSPECTS),
        "list to a round number would put junk in it. Everything here is a real company",
        "that could plausibly want a win-probability layer.", "",
        "**Send 5-8 a day, not all at once.** A hundred near-identical mails from a",
        "personal Gmail in one session is how an account gets flagged - and that account",
        "holds the site, Railway, RapidAPI and AdSense.", "",
        "**Excluded deliberately:** Cricbuzz and AllCric (they already ship win",
        "probability), Sportradar and Stats Perform (they already sell it), and anything",
        "India-facing and gambling (PROGA 2025 bans that advertising).", "",
    ]
    hit = 0
    for tier in (1, 2, 3, 4, 5):
        rows = [p for p in PROSPECTS if p[2] == tier]
        lines += ["## " + tiers[tier], "",
                  "| Company | Contact found | Site | Note |",
                  "|---|---|---|---|"]
        for name, domain, _, note in rows:
            got = results.get(domain, [])
            if got:
                hit += 1
            addr = "<br>".join("`%s`" % e for e in got) if got else "_use contact form_"
            lines.append("| **%s** | %s | %s | %s |" % (name, addr, domain, note))
        lines.append("")

    lines += ["---", "",
              "**%d of %d have a harvested address.** For the rest, open the site and use"
              % (hit, len(PROSPECTS)),
              "the contact form - a form submission is often read faster than a cold mail.", ""]

    io.open(OUT, "w", encoding="utf-8").write("\n".join(lines))
    print("wrote %s" % OUT)
    print("  %d companies, %d with a harvested address" % (len(PROSPECTS), hit))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
