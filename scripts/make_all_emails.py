#!/usr/bin/env python3
"""
Write a finished, sendable email for every prospect that has a real address.

WHY EVERY EMAIL HERE IS COMPLETE, WITH NO PLACEHOLDER
-----------------------------------------------------
On 15 Sep 2026 an email went to CREX reading:

    "Hi, I use CREX - [ikkada nijam ga oka line raayi: CREX lo neeku em
    nachchindi ...]"

A Telugu instruction to the sender, sitting inside the English body of a
business email, got copied and sent. That is a handover failure, not a user
error: an instruction that lives inside the sendable text WILL eventually be
sent. So nothing in this file contains a bracket, a placeholder, or a note to
the sender. Every message can be pasted and sent exactly as written.

Where a genuinely personal line would help - the score apps - the email is
rewritten so it does not need one. A weaker email that is safe to send beats a
stronger one that ships a placeholder.

PACING
------
These go out 5-8 a day, not all at once. A burst of near-identical mail from a
personal Gmail is how an account gets flagged, and that account holds the site,
Railway, RapidAPI and AdSense.

Run:  python scripts/make_all_emails.py  ->  drafts/b2b-emails-remaining.txt
"""

import io
import os
import re
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "drafts", "b2b-emails-remaining.txt")
PROSPECTS_MD = os.path.join(BASE, "drafts", "b2b-prospects.md")

ACC = "https://cricintel-backend-production.up.railway.app/v1/accuracy"
RAPID = "https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability"

# Already contacted on 15 Sep - do not mail again.
DONE = {"goalserve.com", "entitysport.com", "sportmonks.com", "sports.roanuz.com",
        "crex.com", "cricketdata.org"}

PROOF = (
    "The model is trained on T20 up to 2024 and tested on 2,546 matches from\n"
    "2025-26 that were held out of training entirely - 19,340 predictions, 81.5%\n"
    "correct. The calibration table is public and needs no key, so you can check\n"
    "it rather than take my word for it:\n" + ACC + "\n")

SELF = ("Free tier, instant key, no card, if you would rather look than talk:\n"
        + RAPID + "\n")

SIGN = "\nEmmadi\ncricintelligence.com/api\n"


def tier1(name):
    return ("Subject: Cricket win probability - an add-on to your cricket data?\n\n"
            "Hi,\n\n"
            "I run CricIntelligence - a live cricket win-probability model for T20.\n\n"
            # CORRECTED 15 Sep 2026. This read "none of the cricket data providers
            # sell a prediction layer" until Roanuz replied within the hour to say
            # they already have one. The claim was false and the email was weaker for
            # it: the real differentiator was never the feature, it is that ours is
            # auditable and almost nobody publishes theirs.
            "Some cricket data providers now offer a win-probability figure. What is\n"
            "very hard to find is one a customer can audit - published accuracy, a\n"
            "published calibration table, and an open endpoint to check both against.\n\n"
            "I would like to explore offering it alongside your feed, under your brand.\n"
            "You keep the customer relationship and a revenue share; I maintain the model.\n"
            "It complements your data rather than competing with it - you supply what\n"
            "happened, this supplies what it means for the result. Our API returns no\n"
            "scores at all, by design.\n\n"
            + PROOF + "\n"
            "CricViz, who supply most of the broadcast market, publish no accuracy\n"
            "figure anywhere. Nor, as far as I can find, does anyone else. Ours is\n"
            "public and needs no key - that is the gap I am pointing at.\n\n"
            + SELF + "\nWorth a conversation?" + SIGN)


def tier2(name):
    # Deliberately no "I use your app" line - see the module docstring.
    return ("Subject: A live win-probability number for {NAME}\n\n"
            "Hi,\n\n"
            "{NAME} shows the score. What it does not show is what the score means - whether a\n"
            "side chasing 84 off 60 with six wickets down is genuinely ahead or quietly\n"
            "losing.\n\n"
            "That is a live win probability, and it is the hardest thing on a cricket page\n"
            "to add, because it needs a trained model rather than a feed. I have built one\n"
            "and expose it as a single HTTP call: probability for both sides, a confidence\n"
            "band, updated ball by ball. It returns no scores of its own, so it sits on top\n"
            "of whatever data you already use.\n\n"
            + PROOF + "\n"
            "I am not asking you to take the number on trust - the link above is the point.\n"
            "Nobody else in cricket publishes one, CricViz included.\n\n"
            + SELF + SIGN).replace("{NAME}", name)


def tier3(name):
    return ("Subject: Keeping users on the screen between balls\n\n"
            "Hi,\n\n"
            "Since the paid-contest rules changed, the hard part is not acquisition - it is\n"
            "keeping someone in the app through an over where nothing happens.\n\n"
            "A live win probability is the cheapest thing that does that. It moves on every\n"
            "ball, it gives people something to argue with, and it needs no entry fee and no\n"
            "prize. I run CricIntelligence and expose ours as a single HTTP call:\n"
            "probability for both sides, confidence band, updated ball by ball.\n\n"
            + PROOF + "\n"
            "It returns no scores, so it sits alongside whatever feed you already pay for\n"
            "rather than replacing it.\n\n"
            + SELF + "\nWorth twenty minutes?" + SIGN)


def tier4(name):
    return ("Subject: A live win-probability overlay for cricket coverage\n\n"
            "Hi,\n\n"
            "I run CricIntelligence - a live cricket win-probability model for T20.\n\n"
            "A moving probability bar is standard in cricket broadcast now, and the reason\n"
            "smaller rights-holders go without is that it needs a trained model rather than\n"
            "a data feed. Ours is a single HTTP call and returns no scores, so it drops on\n"
            "top of the graphics and data you already have.\n\n"
            + PROOF + "\n"
            "Unusually, that record is public. CricViz supplies most of the broadcast market\n"
            "and publishes no accuracy figure at all, so nobody can check theirs.\n\n"
            + SELF + "\nWorth a conversation?" + SIGN)


def tier5(name):
    return ("Subject: A cricket win-probability model with its workings published\n\n"
            "Hi,\n\n"
            "I run CricIntelligence. We publish a live T20 win probability and - unusually\n"
            "for cricket - the full record behind it, free and without a key:\n"
            + ACC + "\n\n"
            "81.5% across 19,340 predictions on 2,546 matches the model never saw during\n"
            "training, with the calibration table showing what actually happened at each\n"
            "probability we quoted. CricViz, who supply most of the broadcast market, do not\n"
            "publish an accuracy figure anywhere.\n\n"
            "I am not selling you anything. If any of it is useful for a piece, the numbers\n"
            "are open and I am happy to pull specific cuts - per ground, per phase, per\n"
            "competition - for anything you are writing.\n\n"
            "We also publish scoring records for 48 grounds, built from ball-by-ball data\n"
            "rather than opinion: https://www.cricintelligence.com/venues\n"
            + SIGN)


BUILDERS = {1: tier1, 2: tier2, 3: tier3, 4: tier4, 5: tier5}


def parse_prospects():
    """Read the generated list rather than keeping a second copy of it here."""
    rows, tier = [], None
    for line in io.open(PROSPECTS_MD, encoding="utf-8"):
        m = re.match(r"## Tier (\d)", line)
        if m:
            tier = int(m.group(1))
            continue
        m = re.match(r"\| \*\*(.+?)\*\* \| (.+?) \| (\S+) \|", line)
        if not m or tier is None:
            continue
        name, addr_cell, domain = m.group(1), m.group(2), m.group(3)
        addrs = re.findall(r"`([^`]+)`", addr_cell)
        if not addrs or domain in DONE:
            continue
        rows.append((tier, name, addrs[0], domain))
    return rows


def main():
    rows = parse_prospects()
    out = [
        "READY TO SEND - no placeholders, nothing to fill in.",
        "",
        "Paste each one exactly as written. Every line is sendable.",
        "",
        "PACE: 5-8 a day. A burst of near-identical mail from a personal Gmail is how",
        "an account gets flagged, and that account holds the site, Railway, RapidAPI",
        "and AdSense.",
        "",
        "Already contacted 15 Sep, do NOT mail again: Goalserve, EntitySport,",
        "Sportmonks, Roanuz, CREX, cricketdata.org.",
        "", "=" * 72, "",
    ]
    for i, (tier, name, addr, domain) in enumerate(rows, 1):
        body = BUILDERS[tier](name)
        subj, rest = body.split("\n\n", 1)
        out += ["=" * 72,
                "%d.  %s   (tier %d)" % (i, name, tier),
                "=" * 72,
                "TO:      " + addr,
                subj.replace("Subject: ", "SUBJECT: "),
                "", rest.strip(), ""]

    txt = "\n".join(out)
    # A placeholder must never reach this file again.
    bad = re.findall(r"\[[^\]]{4,}\]", txt)
    if bad:
        raise SystemExit("Refusing to write: placeholder(s) found - %s" % bad[:3])

    io.open(OUT, "w", encoding="utf-8").write(txt)
    print("wrote %s" % OUT)
    print("  %d emails, no placeholders" % len(rows))
    for tier in (1, 2, 3, 4, 5):
        n = len([r for r in rows if r[0] == tier])
        if n:
            print("   tier %d: %d" % (tier, n))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
