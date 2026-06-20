import { C } from '../shared/constants';

function milestoneColor(prob) {
  if (prob >= 65) return C.green;
  if (prob >= 35) return C.amber;
  return C.red;
}

function computeProbs(batter, ballsLeftMatch) {
  const { runs, balls, sr } = batter;
  const effectiveSR = sr > 0 ? sr : balls > 0 ? (runs / balls) * 100 : 115;
  const ballsEach = Math.max(4, Math.floor(ballsLeftMatch / 2));
  const expectedMore = (effectiveSR / 100) * ballsEach;
  const spread = Math.max(3, Math.sqrt(ballsEach) * 0.65);

  const prob = (milestone) => {
    if (runs >= milestone) return 99;
    const needed = milestone - runs;
    const z = (expectedMore - needed) / spread;
    return Math.round(Math.max(1, Math.min(98, (1 / (1 + Math.exp(-z))) * 100)));
  };

  return { p30: prob(30), p50: prob(50), p100: prob(100) };
}

function MilestoneRow({ label, prob, done }) {
  const color = done ? C.green : milestoneColor(prob);
  const display = done ? '✓' : `${prob}%`;
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color }}>{display}</span>
      </div>
      <div style={{ height: 3, background: '#1E293B', borderRadius: 2 }}>
        <div style={{
          height: '100%',
          width: done ? '100%' : `${prob}%`,
          background: color,
          borderRadius: 2,
          transition: 'width 0.6s ease'
        }} />
      </div>
    </div>
  );
}

function BatterCard({ batter, paData, livePred, ballsLeftMatch }) {
  // Prefer backend-computed probs, fall back to live computation
  const computed = computeProbs(batter, ballsLeftMatch);

  const p30 = batter.runs >= 30 ? 99
    : (paData && !paData.noData && paData.prob30plus != null ? paData.prob30plus : computed.p30);
  const p50 = batter.runs >= 50 ? 99
    : (paData && !paData.noData && paData.prob50plus != null ? paData.prob50plus
      : batter.isStriker && livePred?.batsman50?.prob != null ? livePred.batsman50.prob
      : computed.p50);
  const p100 = batter.runs >= 100 ? 99 : computed.p100;

  const srVal = batter.sr > 0 ? Math.round(batter.sr)
    : batter.balls > 0 ? Math.round((batter.runs / batter.balls) * 100) : null;

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: '11px 13px',
      marginBottom: 8,
    }}>
      {/* Name + current score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{batter.name}</span>
          {batter.isStriker && (
            <span style={{ fontSize: 9, color: C.amber, marginLeft: 7, fontWeight: 800, letterSpacing: 1 }}>
              ON STRIKE
            </span>
          )}
        </div>
        <div style={{ textAlign: 'right', lineHeight: 1.2 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: C.text }}>{batter.runs}</span>
          <span style={{ fontSize: 11, color: C.muted }}> ({batter.balls}b)</span>
          {srVal != null && (
            <div style={{ fontSize: 10, color: C.muted }}>SR {srVal}</div>
          )}
        </div>
      </div>

      {/* Milestone rows */}
      <MilestoneRow label="Will score 30+" prob={p30} done={batter.runs >= 30} />
      <MilestoneRow label="Will score 50+" prob={p50} done={batter.runs >= 50} />
      <MilestoneRow label="Will score 100+" prob={p100} done={batter.runs >= 100} />
    </div>
  );
}

export default function BatterMilestones({ pred }) {
  if (!pred || !pred.batters?.length || pred.matchEnded) return null;

  const batters = pred.batters; // [{ name, runs, balls, sr, isStriker, fours, sixes }]
  const paBatters = pred.playerAnalysis?.batters || [];
  const livePred = pred.livePredictions || {};
  const ballsLeftMatch = pred.playerAnalysis?.partnership?.ballsLeftMatch
    ?? pred.matchIntelligence?.ballsLeft
    ?? 30;

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>
        Batter Milestones
      </div>
      {batters.map((b) => (
        <BatterCard
          key={b.name}
          batter={b}
          paData={paBatters.find((pa) => pa.name === b.name)}
          livePred={b.isStriker ? livePred : null}
          ballsLeftMatch={ballsLeftMatch}
        />
      ))}
    </div>
  );
}
