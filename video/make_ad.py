#!/usr/bin/env python3
"""
A 5-second vertical ad for CricIntelligence.

WHY IT IS NOT A `scenes.py` SHORT
---------------------------------
`scenes.py` builds the house format: a studio plate, a presenter, a lower third.
That works for a 40-second explainer and is far too much furniture for five
seconds — by the time the set has drawn, the ad is over. This is deliberately
bare: big type, one number, one URL, constant motion.

THE CLAIM IS FETCHED, NOT TYPED
-------------------------------
The accuracy figure comes from /backtest-results at render time. An ad is the
worst possible place for a stale number: it outlives the render, gets reposted,
and cannot be corrected once it is on someone else's feed. If the endpoint is
unreachable or reports a thin sample, this refuses to render rather than
guessing — the same guard that stopped the 0.0% incident in August.

FIVE SECONDS, THREE BEATS
-------------------------
  0.0-1.6s   hook      a live win probability moving, because that is the product
  1.6-3.4s   proof     the holdout number and what it was measured on
  3.4-5.0s   payoff    the URL, and that it costs nothing

Run:  python video/make_ad.py                 -> drafts/<date>-ad-5s.mp4
      python video/make_ad.py --voice         -> with narration (runs ~6-7s)
      python video/make_ad.py --out promo.mp4
"""

import argparse
import datetime
import json
import math
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import brand as b                                   # noqa: E402
from brand import (C, font, text_center, text_size, fit_font, fade,   # noqa: E402
                   pop, clamp01, ease_out, ease_out_back, lerp)
from render import render                           # noqa: E402
from scenes import Scene                            # noqa: E402

API = "https://cricintel-backend-production.up.railway.app"
W, H = b.W, b.H


# ---------------------------------------------------------------- the claim

def fetch_claim():
    """Read the published holdout result. Refuse to invent one."""
    try:
        with urllib.request.urlopen(API + "/backtest-results", timeout=25) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        raise SystemExit(
            "Refusing to render: could not reach /backtest-results (%s). An ad "
            "outlives the render and gets reposted - it must not carry a number "
            "nobody checked." % e)
    wp = data.get("win_probability") or {}
    total = wp.get("total_predictions") or 0
    if total < 100:
        raise SystemExit(
            "Refusing to render: the endpoint reports %d predictions. That is the "
            "state that put 0.0%% on the public accuracy page in August." % total)
    return {
        "pct": wp.get("overall_accuracy"),
        "matches": data.get("matches_tested") or 0,
        "preds": total,
    }


# ---------------------------------------------------------------- ingredients

def _bg(img, t, tint=None):
    """Never a still frame. A motionless frame is where a thumb starts scrolling."""
    b.motion_bg(img, t)


def _rule(d, y, p, colour, width=520, at=0.0, thick=8):
    """A line that draws itself outward from the centre."""
    g = ease_out(clamp01((p - at) / 0.30))
    if g <= 0:
        return
    half = int(width * g / 2)
    d.rounded_rectangle([W // 2 - half, y, W // 2 + half, y + thick],
                        radius=thick // 2, fill=colour)


def _counter(d, y, target, p, colour, at=0.0, span=0.55, size=300, suffix="%"):
    """A number that counts up. Landing on the value reads as a result, not a label."""
    g = ease_out(clamp01((p - at) / span))
    val = target * g
    s = ("%.1f" % val) + suffix
    f = fit_font(d, s, "black", W - 150, size)
    # A tiny settle-back once it lands, so it stops rather than simply ceasing.
    dy = int(10 * math.sin(math.pi * clamp01((p - at - span) / 0.18))) if g >= 1 else 0
    d.text((W // 2, y + dy), s, font=f, fill=colour, anchor="ma")
    return text_size(d, s, f)[1]


# ---------------------------------------------------------------- beat 1: hook

def beat_hook():
    """A win probability moving between two sides. The product, in one image."""
    def draw(img, d, t, p, ctx):
        _bg(img, t)

        text_center(d, 300, "WHO ACTUALLY WINS FROM HERE?",
                    font("bold", 46), fade(C["muted"], clamp01(p / 0.18)))

        # The bar swings across, then settles - a match turning, compressed.
        swing = 0.38 + 0.34 * ease_out(clamp01(p / 0.72))
        x, y, w, h = 90, 980, W - 180, 44
        b.split_bar(d, x, y, w, h, swing, C["green"], C["red"])

        pct = int(round(swing * 100))
        f = font("black", 250)
        d.text((W // 2, 660), "%d%%" % pct, font=f, fill=C["white"], anchor="ma")

        text_center(d, 1070, "UPDATED EVERY BALL",
                    font("bold", 40), fade(C["accent"], clamp01((p - 0.30) / 0.22)))

        # Two team labels either side, so the bar reads as a contest.
        d.text((x, y - 58), "CHASING", font=font("bold", 34), fill=C["green"], anchor="la")
        d.text((x + w, y - 58), "DEFENDING", font=font("bold", 34), fill=C["red"], anchor="ra")

    return Scene(1.6, draw, "Who actually wins from here?")


# ---------------------------------------------------------------- beat 2: proof

def beat_proof(claim):
    """The number, and immediately what it was measured on. Order matters."""
    def draw(img, d, t, p, ctx):
        _bg(img, t)

        text_center(d, 470, "TESTED ON MATCHES IT HAD NEVER SEEN",
                    font("bold", 40), fade(C["muted"], clamp01(p / 0.16)))

        _rule(d, 560, p, C["green"], width=560, at=0.06)

        h = _counter(d, 660, claim["pct"], p, C["green"], at=0.10, span=0.52, size=300)

        y = 660 + h + 70
        text_center(d, y, "WIN PROBABILITY ACCURACY",
                    font("bold", 52), fade(C["text"], clamp01((p - 0.55) / 0.18)))

        # The sample size is the part that makes the percentage mean anything.
        y += 96
        text_center(d, y, "%s predictions  ·  %s matches"
                    % ("{:,}".format(claim["preds"]), "{:,}".format(claim["matches"])),
                    font("reg", 40), fade(C["muted"], clamp01((p - 0.66) / 0.18)))

    return Scene(1.8, draw,
                 "%.1f percent accurate on matches it had never seen." % claim["pct"])


# ---------------------------------------------------------------- beat 3: payoff

def beat_payoff():
    """Name, then the two objections killed in four words."""
    def draw(img, d, t, p, ctx):
        _bg(img, t)

        # Wordmark scales in with a slight overshoot so it arrives rather than appears.
        g = ease_out_back(clamp01(p / 0.34))
        size = int(lerp(70, 104, clamp01(g)))
        f = fit_font(d, "CRICINTELLIGENCE", "black", W - 130, size)
        d.text((W // 2, 700), "CRICINTELLIGENCE", font=f, fill=C["white"], anchor="ma")

        _rule(d, 850, p, C["gold"], width=620, at=0.26)

        text_center(d, 910, "cricintelligence.com",
                    font("bold", 62), fade(C["gold"], clamp01((p - 0.34) / 0.18)))

        # Free and no sign-up are the two reasons people bounce off rivals.
        for i, chip in enumerate(("FREE", "NO SIGN-UP", "LIVE")):
            a = clamp01((p - 0.48 - i * 0.07) / 0.16)
            if a <= 0:
                continue
            cx = W // 2 + (i - 1) * 300
            b.pill(d, cx, 1060, chip, font("bold", 38),
                   fade(C["bg"], a), fade(C["text"], a))

    return Scene(1.6, draw, "Cric Intelligence dot com. Free.")


# ---------------------------------------------------------------- cli

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=None)
    ap.add_argument("--voice", action="store_true",
                    help="add narration (stretches the ad past 5s to fit speech)")
    ap.add_argument("--voice-name", default=None)
    args = ap.parse_args()

    claim = fetch_claim()
    print("claim: %.1f%% over %s predictions / %s matches"
          % (claim["pct"], "{:,}".format(claim["preds"]),
             "{:,}".format(claim["matches"])))

    scenes = [beat_hook(), beat_proof(claim), beat_payoff()]
    total = sum(s.duration for s in scenes)
    print("beats: %s  = %.1fs" % (" + ".join("%.1f" % s.duration for s in scenes), total))

    out = args.out
    if not out:
        day = datetime.date.today().isoformat()
        out = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                           "drafts", "%s-ad-5s.mp4" % day)

    kw = {}
    if args.voice_name:
        kw["voice_name"] = args.voice_name
    render(scenes, out, voice=args.voice, **kw)
    print("\nwrote %s" % out)
    return 0


if __name__ == "__main__":
    sys.exit(main())
