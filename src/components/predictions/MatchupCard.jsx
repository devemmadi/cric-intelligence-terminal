import { C } from '../shared/constants';

/*
 * How the batters at the crease have gone against the bowler currently on.
 *
 * The backend has held 64,968 of these head-to-head records since the model was
 * built, but only the model ever read them. This is the one number on the page
 * that needs no explaining: "157 balls, 181 runs, out once" lands with anyone
 * watching, in a way a probability never quite does.
 *
 * It is a record, not a prediction. No projection, no confidence, nothing
 * derived - just what has already happened between these two, with the sample
 * size stated so a reader can weigh it themselves. Pairs with fewer than six
 * balls between them are dropped by the backend rather than shown as insight.
 */

function Row({ m }) {
  const outs = m.dismissals || 0;
  const sr = m.strikeRate;
  // Colour on strike rate only. Dismissals are too sparse in these samples to
  // read as good or bad without over-claiming.
  const srColor = sr >= 140 ? C.green : sr >= 110 ? C.amber : C.red;

  return (
    <div style={{
      background: C.bg,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '11px 13px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{m.batter}</span>
        {m.isStriker && (
          <span style={{ fontSize: 9, fontWeight: 800, color: C.amber, letterSpacing: 1 }}>ON STRIKE</span>
        )}
        <span style={{ fontSize: 12, color: C.muted }}>vs</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{m.bowler}</span>
      </div>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.text }}>
            {m.runs}<span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}> off {m.balls}</span>
          </div>
          <div style={{ fontSize: 10, color: C.muted }}>Career head-to-head</div>
        </div>
        {sr != null && (
          <div>
            <div style={{ fontSize: 17, fontWeight: 900, color: srColor }}>{sr}</div>
            <div style={{ fontSize: 10, color: C.muted }}>Strike rate</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: 17, fontWeight: 900, color: C.text }}>{outs}</div>
          <div style={{ fontSize: 10, color: C.muted }}>
            {outs === 1 ? 'Dismissal' : 'Dismissals'}
            {outs > 0 && m.balls ? ` · every ${Math.round(m.balls / outs)} balls` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MatchupCard({ pred }) {
  const rows = pred?.matchups || [];
  if (!rows.length || pred?.matchEnded) return null;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: C.muted,
        letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase',
      }}>
        Head to head
      </div>
      {rows.map((m) => <Row key={`${m.batter}-${m.bowler}`} m={m} />)}
      <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.5 }}>
        Every ball these players have faced each other in recorded T20 cricket. A record of what
        happened, not a forecast — and a small sample can mislead, so the ball count is shown.
      </div>
    </div>
  );
}
