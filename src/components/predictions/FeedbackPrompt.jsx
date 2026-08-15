import { useEffect, useState } from 'react';
import { API_BASE, C } from '../shared/constants';

/*
 * Ask the one question a viewer can actually answer.
 *
 * "Was the prediction accurate?" is unanswerable from a single match - a 68%
 * call is supposed to be wrong a third of the time, so a viewer judging one
 * result is judging noise. What they genuinely can tell you is whether the
 * number matched what they were watching, and if not, WHEN it looked wrong.
 * That second answer points at a real defect; a star rating never would.
 *
 * Timing matters as much as wording. This waits until someone has watched for
 * a few minutes, so it asks people who actually used the thing rather than
 * interrupting a visitor who arrived ten seconds ago. It appears once per match
 * per browser and never returns for that match, answered or dismissed.
 */

const MIN_WATCH_MS = 4 * 60 * 1000;   // long enough to have formed a view
const seenKey = (id) => `ci_fb_${id}`;

export default function FeedbackPrompt({ pred, matchId }) {
  const [phase, setPhase] = useState('hidden');   // hidden | ask | why | done
  const [moment, setMoment] = useState('');
  const [since] = useState(() => Date.now());

  const id = matchId || pred?.id;

  useEffect(() => {
    if (!id || phase !== 'hidden') return;
    // ?feedback=now shows it immediately and ignores the once-per-match record,
    // so the prompt can be looked at without sitting through a match first.
    const preview = typeof window !== 'undefined'
      && window.location.search.indexOf('feedback=now') > -1;
    if (preview) { setPhase('ask'); return; }
    try { if (localStorage.getItem(seenKey(id))) return; } catch { /* private mode */ }
    const t = setInterval(() => {
      if (Date.now() - since >= MIN_WATCH_MS) setPhase('ask');
    }, 15000);
    return () => clearInterval(t);
  }, [id, phase, since]);

  const close = () => {
    try { localStorage.setItem(seenKey(id), '1'); } catch { /* private mode */ }
    setPhase('done');
  };

  const send = (rating, text) => {
    // Fire and forget - a failed POST must never interrupt someone watching.
    fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        moment: text || '',
        matchId: String(id || ''),
        teams: pred?.team1 && pred?.team2 ? `${pred.team1} vs ${pred.team2}` : '',
        overs: pred?.overs,
        prob: pred?.aiProbability,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      }),
    }).catch(() => {});
  };

  if (phase === 'hidden' || phase === 'done') return null;

  const wrap = {
    position: 'fixed', left: 12, right: 12, bottom: 'calc(var(--mob-nav-h, 79px) + 92px)',
    maxWidth: 420, margin: '0 auto', zIndex: 1300,
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: '14px 16px', boxShadow: '0 10px 34px rgba(0,0,0,0.45)',
  };

  if (phase === 'ask') {
    return (
      <div style={wrap}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
          Did the win probability match what you were seeing?
        </div>
        <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>
          One tap. It helps more than you'd think.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { send('up'); close(); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer',
              border: `1px solid ${C.green}55`, background: 'rgba(16,185,129,0.12)',
              color: C.green, fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            Yes, looked right
          </button>
          <button
            onClick={() => setPhase('why')}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer',
              border: `1px solid ${C.red}55`, background: 'rgba(239,68,68,0.10)',
              color: C.red, fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            No, looked off
          </button>
        </div>
        <button
          onClick={close}
          style={{
            marginTop: 8, width: '100%', background: 'none', border: 'none',
            color: C.muted, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          Not now
        </button>
      </div>
    );
  }

  // The answer worth having: not a score, but where it went wrong.
  return (
    <div style={wrap}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
        What looked wrong?
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>
        The over, the score, anything you remember. A few words is plenty.
      </div>
      <textarea
        value={moment}
        onChange={(e) => setMoment(e.target.value.slice(0, 500))}
        placeholder="e.g. they needed 6 off 12 and it still said 45%"
        rows={3}
        style={{
          width: '100%', resize: 'none', borderRadius: 9, padding: '9px 11px',
          background: C.bg, border: `1px solid ${C.border}`, color: C.text,
          fontSize: 12, fontFamily: 'inherit', lineHeight: 1.5, marginBottom: 10,
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { send('down', moment); close(); }}
          style={{
            flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer', border: 'none',
            background: C.accent, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'inherit',
          }}
        >
          Send
        </button>
        <button
          onClick={() => { send('down'); close(); }}
          style={{
            padding: '10px 14px', borderRadius: 9, cursor: 'pointer',
            border: `1px solid ${C.border}`, background: 'none',
            color: C.muted, fontSize: 12, fontFamily: 'inherit',
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
