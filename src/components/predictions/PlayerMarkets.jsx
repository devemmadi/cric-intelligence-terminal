import { C } from '../shared/constants';

/*
 * Player runs Over/Under markets, laid out the way a sportsbook lays them out.
 *
 * The number in each box is OUR MODEL'S PROBABILITY, not a price. A price would
 * have to come from a real book, and there isn't one: the odds feed
 * (the-odds-api) answers INVALID_MARKET for batter_runs / player_runs on
 * cricket - only match-winner exists. Deriving a price from our own probability
 * and printing it in a market box would be inventing a number that looks like
 * something a user could go and bet at, on a page that links straight to real
 * bookmakers. So: percentages, clearly labelled.
 *
 * A line of 49.5 is exactly P(final score >= 50), which is what the backend's
 * prob50plus already answers - "over 49.5" and "50 or more" are the same event.
 *
 * These probabilities carry a holdout number as of Jul 25 2026 (see
 * cricintel-backend/backtest_batter_milestone_holdout.py): 326 matches, 15,000
 * predictions, bias +4.9 / +4.8 / +2.3 points on the 20+ / 30+ / 50+ lines and
 * ~30% Brier skill over the base rate on each. Before that day's fix they ran
 * 10-23 points high and the 50+ line was worse than quoting a constant - which
 * is why this component reads backend values only and never falls back to a
 * locally-computed guess. An unvalidated shadow formula rendering into a
 * betting-shaped box is the thing to avoid here.
 */

// Backend milestone field -> the line a book would post for the same event.
const LINES = [
  { key: 'prob20plus', milestone: 20 },
  { key: 'prob30plus', milestone: 30 },
  { key: 'prob50plus', milestone: 50 },
];

function ordinal(n) {
  return n === 1 ? '1st' : n === 2 ? '2nd' : `${n}th`;
}

function OutcomeRow({ label, pct, lean }) {
  return (
    <div style={{
      background: C.bg,
      borderRadius: 8,
      padding: '11px 13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: `2px solid ${lean ? C.green : C.border}`,
    }}>
      <span style={{ fontSize: 12, color: lean ? C.text : C.muted, fontWeight: lean ? 700 : 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 800, color: lean ? C.green : C.muted }}>
        {pct}%
      </span>
    </div>
  );
}

function Market({ name, milestone, over, innings }) {
  const line = milestone - 0.5;
  const under = 100 - over;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{
        fontSize: 12,
        fontWeight: 700,
        color: C.text,
        marginBottom: 7,
        lineHeight: 1.4,
      }}>
        {name} · Runs · ({line}) · {ordinal(innings)} Innings
      </div>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 7,
      }}>
        <OutcomeRow label={`Under ${line}`} pct={under} lean={under > over} />
        <OutcomeRow label={`Over ${line}`} pct={over} lean={over >= under} />
      </div>
    </div>
  );
}

export default function PlayerMarkets({ pred }) {
  if (!pred || pred.matchEnded || !pred.batters?.length) return null;

  const paBatters = pred.playerAnalysis?.batters || [];
  const innings = pred.innings || 1;

  const markets = [];
  pred.batters.forEach((b) => {
    const pa = paBatters.find((x) => x.name === b.name);
    if (!pa || pa.noData) return;   // no backend probability => no market, see header comment
    LINES.forEach(({ key, milestone }) => {
      // A line the batter has already passed is settled, not a market.
      if (b.runs >= milestone) return;
      const over = pa[key];
      if (over == null) return;
      markets.push({ name: b.name, milestone, over, innings });
    });
  });

  if (!markets.length) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.muted,
        letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase',
      }}>
        Player Runs Markets
      </div>
      {markets.map((m) => (
        <Market key={`${m.name}-${m.milestone}`} {...m} />
      ))}
      <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.5, marginTop: 2 }}>
        Model probabilities, not betting odds — CricIntelligence does not take bets.
        Measured on 15,000 predictions across 326 unseen 2025–26 matches.
      </div>
    </div>
  );
}
