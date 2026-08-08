"""
Per-league ground records, merged and de-duplicated from venue_stats.json.

Two traps this module exists to avoid, both found by inspection before anything
was published:

1. Fuzzy venue matching is wrong. Searching "oval" pulls in Botswana, Entebbe
   and Kuala Lumpur; "national stadium" merges Karachi, Hyderabad and Mirpur;
   "county ground" matches four different English grounds. Every venue below is
   listed by its exact key.

2. The same physical ground appears under several keys - "m chinnaswamy
   stadium", "m chinnaswamy stadium, bengaluru" and "m.chinnaswamy stadium" are
   one venue with 111 matches between them, not three venues. GROUNDS groups the
   keys per ground and averages them weighted by match count.

Adding a league: give each ground a display name and the exact keys it appears
under. Run this file directly to print what each league page would say; it warns
on any key it cannot find rather than silently dropping it.
"""
import json
import os

VENUE_JSON = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "cricintel-backend", "venue_stats.json",
)

# league -> [(display name, [exact venue_stats.json keys for that one ground])]
GROUNDS = {
    "ipl": [
        ("Wankhede Stadium, Mumbai", ["wankhede stadium"]),
        ("Eden Gardens, Kolkata", ["eden gardens"]),
        ("M Chinnaswamy Stadium, Bengaluru",
         ["m chinnaswamy stadium", "m chinnaswamy stadium, bengaluru", "m.chinnaswamy stadium"]),
        ("MA Chidambaram Stadium, Chennai",
         ["ma chidambaram stadium, chepauk", "ma chidambaram stadium, chepauk, chennai",
          "ma chidambaram stadium"]),
        ("Rajiv Gandhi International Stadium, Hyderabad",
         ["rajiv gandhi international stadium, uppal",
          "rajiv gandhi international stadium, uppal, hyderabad",
          "rajiv gandhi international stadium"]),
        ("Arun Jaitley Stadium, Delhi", ["arun jaitley stadium"]),
        ("Sawai Mansingh Stadium, Jaipur", ["sawai mansingh stadium"]),
        ("PCA IS Bindra Stadium, Mohali", ["punjab cricket association is bindra stadium"]),
        ("Narendra Modi Stadium, Ahmedabad", ["narendra modi stadium"]),
        ("Ekana Cricket Stadium, Lucknow",
         ["bharat ratna shri atal bihari vajpayee ekana cricket stadium, lucknow"]),
    ],
    "big-bash": [
        ("Melbourne Cricket Ground", ["melbourne cricket ground"]),
        ("Sydney Cricket Ground", ["sydney cricket ground"]),
        ("Adelaide Oval", ["adelaide oval"]),
        ("The Gabba, Brisbane", ["brisbane cricket ground, woolloongabba"]),
        ("Perth Stadium", ["perth stadium"]),
        ("Bellerive Oval, Hobart", ["bellerive oval", "bellerive oval, hobart"]),
        ("Carrara Oval, Gold Coast", ["carrara oval"]),
        ("Manuka Oval, Canberra", ["manuka oval"]),
        ("Docklands Stadium, Melbourne", ["docklands stadium"]),
        ("Sydney Showground Stadium", ["sydney showground stadium"]),
    ],
    "psl": [
        ("Gaddafi Stadium, Lahore", ["gaddafi stadium"]),
        ("National Stadium, Karachi", ["national stadium, karachi"]),
        ("Rawalpindi Cricket Stadium", ["rawalpindi cricket stadium"]),
        ("Multan Cricket Stadium", ["multan cricket stadium"]),
    ],
    "cpl": [
        ("Queen's Park Oval, Trinidad", ["queen's park oval, port of spain"]),
        ("Kensington Oval, Barbados", ["kensington oval, bridgetown"]),
        ("Providence Stadium, Guyana", ["providence stadium"]),
        ("Brian Lara Stadium, Tarouba", ["brian lara stadium, tarouba"]),
        ("Warner Park, St Kitts", ["warner park, basseterre"]),
        ("Daren Sammy Stadium, St Lucia",
         ["daren sammy national cricket stadium, gros islet",
          "daren sammy national cricket stadium, gros islet, st lucia"]),
    ],
    "sa20": [
        ("Newlands, Cape Town", ["newlands"]),
        ("The Wanderers, Johannesburg", ["the wanderers stadium"]),
        ("Kingsmead, Durban", ["kingsmead"]),
        ("SuperSport Park, Centurion", ["supersport park"]),
        ("St George's Park, Gqeberha", ["st george's park"]),
    ],
    "ilt20": [
        ("Dubai International Cricket Stadium", ["dubai international cricket stadium"]),
        ("Sharjah Cricket Stadium", ["sharjah cricket stadium"]),
        ("Sheikh Zayed Stadium, Abu Dhabi",
         ["sheikh zayed stadium", "sheikh zayed stadium, abu dhabi",
          "zayed cricket stadium, abu dhabi"]),
    ],
    "lpl": [
        ("R Premadasa Stadium, Colombo",
         ["r premadasa stadium", "r premadasa stadium, colombo",
          "r.premadasa stadium, khettarama"]),
        ("Pallekele International Stadium", ["pallekele international cricket stadium"]),
        ("Rangiri Dambulla International Stadium", ["rangiri dambulla international stadium"]),
        ("Galle International Stadium", ["galle international stadium"]),
    ],
    "bpl": [
        ("Shere Bangla National Stadium, Mirpur",
         ["shere bangla national stadium, mirpur", "shere bangla national stadium"]),
        ("Zahur Ahmed Chowdhury Stadium, Chattogram", ["zahur ahmed chowdhury stadium"]),
        ("Sylhet International Cricket Stadium", ["sylhet international cricket stadium"]),
    ],
    "the-hundred": [
        ("Lord's, London", ["lord's"]),
        ("The Oval, London", ["kennington oval"]),
        ("Edgbaston, Birmingham", ["edgbaston"]),
        ("Old Trafford, Manchester", ["old trafford"]),
        ("Trent Bridge, Nottingham", ["trent bridge"]),
        ("The Rose Bowl, Southampton", ["the rose bowl"]),
        ("Sophia Gardens, Cardiff", ["sophia gardens"]),
    ],
    "vitality-blast": [
        ("Edgbaston, Birmingham", ["edgbaston"]),
        ("The Oval, London", ["kennington oval"]),
        ("Old Trafford, Manchester", ["old trafford"]),
        ("Trent Bridge, Nottingham", ["trent bridge"]),
        ("The Rose Bowl, Southampton", ["the rose bowl"]),
        ("Sophia Gardens, Cardiff", ["sophia gardens"]),
        ("County Ground, Bristol", ["county ground, bristol"]),
        ("County Ground, Hove", ["county ground, hove"]),
        ("County Ground, Chelmsford", ["county ground, chelmsford"]),
        ("Riverside Ground, Chester-le-Street", ["riverside ground"]),
    ],
}


def _merge(venues, keys):
    """Weighted merge of several keys that are the same physical ground."""
    parts = [venues[k] for k in keys if k in venues]
    if not parts:
        return None
    n = sum(p["match_count"] for p in parts)
    if n == 0:
        return None
    wavg = lambda f: round(sum(p[f] * p["match_count"] for p in parts) / n, 1)
    return {
        "n": n,
        "first": wavg("avg_first_innings"),
        "second": wavg("avg_second_innings"),
        "rpo": round(sum(p["overall_avg_rpo"] * p["match_count"] for p in parts) / n, 2),
    }


def league(name, venues=None, warn=True):
    """Ground records for one league, plus league-wide weighted aggregates."""
    venues = venues if venues is not None else json.load(open(VENUE_JSON, encoding="utf-8"))
    rows = []
    for display, keys in GROUNDS[name]:
        missing = [k for k in keys if k not in venues]
        if missing and warn:
            print(f"  WARN {name}: key(s) not in venue_stats: {missing}")
        g = _merge(venues, keys)
        if not g:
            continue
        g["name"] = display
        g["gap"] = round(g["first"] - g["second"], 1)
        rows.append(g)
    if not rows:
        return None
    total = sum(r["n"] for r in rows)
    return {
        "rows": sorted(rows, key=lambda r: -r["gap"]),
        "grounds": len(rows),
        "matches": total,
        "first": round(sum(r["first"] * r["n"] for r in rows) / total, 1),
        "second": round(sum(r["second"] * r["n"] for r in rows) / total, 1),
        "rpo": round(sum(r["rpo"] * r["n"] for r in rows) / total, 2),
        "hardest": max(rows, key=lambda r: r["gap"]),
        "easiest": min(rows, key=lambda r: r["gap"]),
        "highest": max(rows, key=lambda r: r["rpo"]),
    }


if __name__ == "__main__":
    venues = json.load(open(VENUE_JSON, encoding="utf-8"))
    for lg in GROUNDS:
        d = league(lg, venues)
        if not d:
            print(f"{lg}: NO DATA")
            continue
        print(f"\n=== {lg}  {d['grounds']} grounds, {d['matches']} matches")
        print(f"    league avg: 1st {d['first']}  chasing {d['second']}  "
              f"gap {round(d['first'] - d['second'], 1)}  rpo {d['rpo']}")
        print(f"    hardest chase: {d['hardest']['name']} (+{d['hardest']['gap']})")
        print(f"    easiest chase: {d['easiest']['name']} (+{d['easiest']['gap']})")
        print(f"    highest scoring: {d['highest']['name']} ({d['highest']['rpo']} rpo)")
