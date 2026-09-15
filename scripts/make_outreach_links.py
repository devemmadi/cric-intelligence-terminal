#!/usr/bin/env python3
"""
Turn the Aug 26 outreach drafts into one-click mailto links.

WHY THIS EXISTS
---------------
drafts/2026-08-26-api-outreach-emails.md holds seven finished emails. Two were
sent on 26 Aug; five were written and never sent. Three weeks later the API has
0 leads and 0 calls - which is not a verdict on B2B, it is a sample of two.

The bottleneck was never the writing. It was the copy-paste. So this renders
each draft as a mailto: link with recipient, subject and body pre-filled -
clicking one opens the mail client with the email ready to read and send.

NOTHING IS SENT FROM HERE. The links open a compose window; a person presses
Send. That is deliberate and should stay that way.

Run:  python scripts/make_outreach_links.py   ->  drafts/b2b-send-these.html
"""

import io
import os
import urllib.parse

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "drafts", "b2b-send-these.html")

ACC = "https://cricintel-backend-production.up.railway.app/v1/accuracy"
RAPID = "https://rapidapi.com/emmadidev/api/cricintelligence-cricket-win-probability"
SIGN = "\n\nEmmadi\ncricintelligence.com/api\n"

# ── the proof paragraph, identical in every mail so the claim cannot drift ─────
PROOF = (
    "The model is trained on T20 up to 2024 and tested on 2,546 matches from\n"
    "2025-26 that were held out of training entirely - 19,340 predictions, 81.5%\n"
    "correct. The methodology and the calibration table are public and need no key,\n"
    "so you can check it before replying:\n" + ACC + "\n")

SELF_SERVE = (
    "It is also live and self-serve on RapidAPI if your team would rather look than\n"
    "talk - free tier, instant key, no card:\n" + RAPID + "\n")


def channel_mail(opening):
    """Drafts 1/6 shape: a reseller or data provider. Partnership framing."""
    return (
        "Hi,\n\n"
        "I run CricIntelligence - a live cricket win-probability model for T20.\n\n"
        + opening + "\n\n"
        "I would like to explore offering it alongside your cricket feed, under your\n"
        "brand, as an add-on. You keep the customer relationship and a revenue share; I\n"
        "maintain the model. It complements your feed rather than competing with it - you\n"
        "supply what happened, this supplies what it means for the result.\n\n"
        + PROOF + "\n" + SELF_SERVE +
        "\nWorth a conversation?" + SIGN)


def app_mail(app):
    """Draft 3 shape: a score app. NEEDS a real first line - see the warning."""
    return (
        "Hi,\n\n"
        "I use " + app + " - [REPLACE THIS with one specific true sentence: what you\n"
        "actually like about it, or the exact screen this would sit on. The draft says\n"
        "delete this mail rather than send it without this line, and that is right - a\n"
        "generic mail to four competing apps reads as a mailshot and they can each tell.]\n\n"
        "One thing it does not show is a live win probability. It is the number that keeps\n"
        "someone watching between balls, and it is the hardest feature to add because it\n"
        "needs a trained model rather than a feed.\n\n"
        "I have built one and expose it as a single HTTP call - probability for both\n"
        "sides, confidence band, updated ball by ball.\n\n"
        + PROOF + "\n" + SELF_SERVE + SIGN)


MAILS = [
    # (key, to, subject, body, note, needs_edit)
    ("goalserve", "support@goalserve.com",
     "Cricket win probability - an add-on to your cricket feed?",
     channel_mail(
         "You have supplied cricket data feeds for two decades, and your customers build\n"
         "livescore and fantasy products on them. What almost none of those products have\n"
         "is a win-probability layer, because adding one is a training-data problem rather\n"
         "than an engineering one."),
     "Draft 6, unchanged. Multi-sport and twenty years old, so no flattery about "
     "powering fantasy apps - they would know it was wrong.", False),

    ("cricketdata", "contact@cricketdata.org",
     "Cricket win probability - an add-on to your cricket API?",
     channel_mail(
         "Your customers are independent developers building cricket apps. What almost\n"
         "none of those apps have is a win-probability layer, because adding one is a\n"
         "training-data problem rather than an engineering one."),
     "Draft 6 with the opening swapped, exactly as the draft file instructs.", False),

    ("entitysport", "sales@entitysport.com",
     "The measured probability behind a cricket prediction API",
     "Hi,\n\n"
     "I run CricIntelligence - a live cricket win-probability model for T20.\n\n"
     "Your prediction API answers questions about a match - will India win, will Kohli\n"
     "hit seven or more fours. This is the measured probability those questions rest on:\n"
     "one continuous number that moves ball by ball, rather than a set of answers.\n\n"
     + PROOF + "\n"
     "That is the difference I would want to talk about. A question like \"India to win\n"
     "match?\" needs a probability behind it, and ours is the only one in cricket with a\n"
     "published calibration table - CricViz does not publish one, and nor does anyone\n"
     "else I can find.\n\n" + SELF_SERVE +
     "\nWorth a conversation, or is this too close to what you already do?" + SIGN,
     "Draft 7. The file says send this one LAST - they publish a competing "
     "prediction API (but no accuracy figure). Send it after the others have "
     "had a chance to reply.", False),

    ("crex", "support@crex.com",
     "A win-probability bar for CREX",
     app_mail("CREX"),
     "Draft 3. MUST be personalised before sending - see the bracketed line.", True),

    ("justcricket", "support.justcricket@gmail.com",
     "A win-probability bar for Just Cricket",
     app_mail("Just Cricket"),
     "Draft 3. MUST be personalised before sending - see the bracketed line.", True),

    ("sportmonks-fu", "sales@sportmonks.com",
     "Re: win probability as an add-on (ticket #108620)",
     "Hi,\n\n"
     "I wrote on 26 August about offering a cricket win-probability layer as an add-on\n"
     "to your API. It came back as support ticket #108620, so I suspect it was routed to\n"
     "the support queue rather than to whoever handles partnerships.\n\n"
     "Could you forward it on? The short version: a live T20 win probability, published\n"
     "accuracy and calibration table, meant to sit on top of a feed like yours rather\n"
     "than replace it. No scores in the payload at all, by design.\n\n"
     + PROOF + "\n"
     "If win probability is not on the roadmap, just say so and I will not chase it.\n"
     + SIGN,
     "The Aug 26 send auto-acked with a TICKET NUMBER, which means it landed in "
     "support, not sales. This asks for a routing, which is a much easier yes than "
     "a meeting.", False),

    ("roanuz-fu", "contact@roanuz.com",
     "Re: win probability as an add-on to the Roanuz cricket API",
     "Hi,\n\n"
     "Following up once on the below, in case it landed at a bad moment.\n\n"
     "Short version: a live T20 win-probability model, offered as an add-on under your\n"
     "brand alongside your cricket API. Published accuracy and calibration table, which\n"
     "as far as I can tell nobody else in cricket publishes - CricViz included.\n\n"
     + PROOF + "\n"
     "If win probability is not on your roadmap, just say so and I will not chase it. If\n"
     "it is but not this quarter, I will check back after the season.\n"
     + SIGN,
     "The draft file's own rule: follow up ONCE, then stop. Two unanswered mails "
     "is a no; a third is how senders get marked as spam. This is the one.", False),
]


def link(to, subject, body):
    return "mailto:%s?subject=%s&body=%s" % (
        to, urllib.parse.quote(subject), urllib.parse.quote(body))


def main():
    cards = []
    for i, (key, to, subj, body, note, edit) in enumerate(MAILS, 1):
        url = link(to, subj, body)
        warn = ("<div class='warn'>Personalise the bracketed line first. "
                "Sending it as-is is worse than not sending it.</div>" if edit else "")
        cards.append(
            "<li class='%s'><div class='top'><span class='n'>%d</span>"
            "<a class='go' href='%s'>Open in mail &rarr;</a></div>"
            "<div class='to'>%s</div><div class='sub'>%s</div>"
            "%s<div class='note'>%s</div>"
            "<details><summary>Read the whole email</summary><pre>%s</pre></details></li>"
            % ("edit" if edit else "", i, url, to, subj, warn, note,
               body.replace("&", "&amp;").replace("<", "&lt;")))

    html = """<meta charset="utf-8">
<title>B2B outreach - ready to send</title>
<body style="font:16px/1.65 -apple-system,system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 18px;background:#0B1220;color:#E2E8F0">
<h1 style="font-size:24px;margin:0 0 6px">Ready to send</h1>
<p style="color:#94A3B8;margin:0 0 6px">Five never sent from 26 August, plus two follow-ups.
Click a link, read it, press Send. Nothing is sent from this page.</p>
<p style="color:#94A3B8;margin:0 0 24px;font-size:14px"><b>Order:</b> 1&ndash;2 first (easiest yes),
then 6&ndash;7 (the follow-ups), then 4&ndash;5 once personalised. <b>3 (Entity Sport) last</b> &mdash;
they publish a competing prediction API.</p>
<style>
ol{list-style:none;padding:0}
li{background:#111827;border:1px solid #1F2937;border-radius:12px;padding:16px 18px;margin:0 0 14px}
li.edit{border-color:#7C5E10}
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}
.n{color:#64748B;font-size:12px;font-weight:700;letter-spacing:1px}
.go{background:#C8961E;color:#0B1220;text-decoration:none;font-weight:700;font-size:13px;padding:7px 13px;border-radius:8px;white-space:nowrap}
.to{font-weight:700;color:#fff}
.sub{color:#94A3B8;font-size:14px;margin:2px 0 8px}
.note{color:#64748B;font-size:13px;margin-top:8px}
.warn{background:#2A2109;border:1px solid #7C5E10;color:#E8C468;font-size:13px;padding:8px 11px;border-radius:8px;margin:8px 0}
details{margin-top:10px}summary{cursor:pointer;color:#C8961E;font-size:13px}
pre{white-space:pre-wrap;background:#0B1220;border:1px solid #1F2937;border-radius:8px;padding:12px;font-size:12.5px;color:#CBD5E1;overflow-x:auto}
a{color:#C8961E}
</style>
<ol>%s</ol>
<p style="color:#64748B;font-size:13px;margin-top:26px">Every email carries the same proof
paragraph and the same unauthenticated link to
<a href="%s">/v1/accuracy</a>, so the claim cannot drift between them.
Do not promise an SLA &mdash; there isn't one.</p>
</body>""" % ("".join(cards), ACC)

    io.open(OUT, "w", encoding="utf-8").write(html)
    print("wrote %s" % OUT)
    for i, (key, to, subj, _, _, edit) in enumerate(MAILS, 1):
        print("  %d. %-34s %s%s" % (i, to, subj[:42],
                                    "   [needs personalising]" if edit else ""))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
