import React, { useState } from 'react';
import Logo from './Logo';

const OddsCalculator = () => {
  const [aiProb, setAiProb] = useState('');
  const [bookOdds, setBookOdds] = useState('');
  const [bookmaker, setBookmaker] = useState('Bet365');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const ai = parseFloat(aiProb);
    const odds = parseFloat(bookOdds);
    if (!ai || !odds || ai < 0 || ai > 100 || odds < 1) return;
    const impliedProb = (1 / odds) * 100;
    const edge = ai - impliedProb;
    const ev = ((ai / 100) * (odds - 1)) - ((1 - ai / 100) * 1);
    setResult({ impliedProb: impliedProb.toFixed(1), edge: edge.toFixed(1), ev: (ev * 100).toFixed(1), isValue: edge > 0 });
  };

  const reset = () => { setAiProb(''); setBookOdds(''); setResult(null); };

  const navStyle = {
    background: '#1a2540', borderBottom: '1px solid #2a3f5f',
    padding: '0 20px', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', height: '52px', position: 'sticky', top: 0, zIndex: 100
  };

  const logoStyle = {
    display: 'flex', flexDirection: 'column', lineHeight: 1.1, cursor: 'pointer'
  };

  const tabs = [['predict','Predictions'],['matches','Matches'],['media','Media'],['odds','Odds 🎯']];

  return (
    <div style={{ background: '#0d1b2e', minHeight: '100vh', fontFamily: 'monospace' }}>

      {/* Header — same as main site */}
      <div style={navStyle}>
        <Logo />
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map(([k, l]) => (
            <button key={k}
              onClick={() => { if (k === 'odds') return; window.location.href = '/'; }}
              style={{
                padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: k === 'odds' ? 700 : 400,
                background: k === 'odds' ? '#C8961E' : 'transparent',
                color: k === 'odds' ? '#0d1b2e' : '#aac'
              }}>{l}</button>
          ))}
        </div>
        <div style={{ width: 80 }} />
      </div>

      {/* Content */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '30px 20px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ color: '#C8961E', margin: 0, fontSize: '18px', letterSpacing: '2px' }}>ODDS VALUE CALCULATOR</h2>
          <p style={{ color: '#5a7a9a', fontSize: '12px', margin: '6px 0 0' }}>Compare AI probability vs bookmaker implied odds</p>
        </div>

        {/* Bookmaker */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#8899aa', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>BOOKMAKER</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Bet365', 'Betway', 'Paddy Power', 'William Hill', 'Other'].map(b => (
              <button key={b} onClick={() => setBookmaker(b)} style={{
                padding: '8px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px',
                background: bookmaker === b ? '#C8961E' : '#1a2940',
                color: bookmaker === b ? '#0d1b2e' : '#8899aa', fontWeight: bookmaker === b ? 'bold' : 'normal'
              }}>{b}</button>
            ))}
          </div>
        </div>

        {/* AI Prob */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#8899aa', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>OUR AI WIN PROBABILITY (%)</label>
          <input type="number" min="0" max="100" value={aiProb} onChange={e => setAiProb(e.target.value)} placeholder="e.g. 73"
            style={{ width: '100%', padding: '14px 16px', background: '#1a2940', border: '1px solid #2a3f5f', borderRadius: '8px', color: '#00d4ff', fontSize: '24px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Book Odds */}
        <div style={{ marginBottom: '28px' }}>
          <label style={{ color: '#8899aa', fontSize: '11px', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>{bookmaker.toUpperCase()} DECIMAL ODDS</label>
          <input type="number" min="1" step="0.01" value={bookOdds} onChange={e => setBookOdds(e.target.value)} placeholder="e.g. 1.45"
            style={{ width: '100%', padding: '14px 16px', background: '#1a2940', border: '1px solid #2a3f5f', borderRadius: '8px', color: '#C8961E', fontSize: '24px', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }} />
          <p style={{ color: '#5a7a9a', fontSize: '11px', margin: '6px 0 0' }}>Decimal odds format (1.45 = 45% implied probability)</p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
          <button onClick={calculate} style={{ flex: 1, padding: '14px', background: '#C8961E', border: 'none', borderRadius: '8px', color: '#0d1b2e', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', letterSpacing: '1px' }}>CALCULATE VALUE</button>
          <button onClick={reset} style={{ padding: '14px 20px', background: '#1a2940', border: '1px solid #2a3f5f', borderRadius: '8px', color: '#8899aa', fontSize: '14px', cursor: 'pointer' }}>RESET</button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ padding: '24px', borderRadius: '12px', border: `2px solid ${result.isValue ? '#00c853' : '#ff3d00'}`, background: result.isValue ? 'rgba(0,200,83,0.08)' : 'rgba(255,61,0,0.08)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '32px' }}>{result.isValue ? '✅' : '❌'}</span>
              <div>
                <div style={{ color: result.isValue ? '#00c853' : '#ff3d00', fontSize: '20px', fontWeight: 'bold' }}>
                  {result.isValue ? 'VALUE BET FOUND!' : 'NO VALUE'}
                </div>
                <div style={{ color: '#8899aa', fontSize: '12px' }}>
                  {result.isValue ? 'AI probability > bookmaker implied odds' : 'Bookmaker odds are too short'}
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#0d1b2e', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#00d4ff', fontSize: '24px', fontWeight: 'bold' }}>{aiProb}%</div>
                <div style={{ color: '#5a7a9a', fontSize: '11px', marginTop: '4px' }}>AI PROBABILITY</div>
              </div>
              <div style={{ background: '#0d1b2e', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#C8961E', fontSize: '24px', fontWeight: 'bold' }}>{result.impliedProb}%</div>
                <div style={{ color: '#5a7a9a', fontSize: '11px', marginTop: '4px' }}>IMPLIED ODDS</div>
              </div>
              <div style={{ background: '#0d1b2e', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: result.isValue ? '#00c853' : '#ff3d00', fontSize: '24px', fontWeight: 'bold' }}>{result.edge > 0 ? '+' : ''}{result.edge}%</div>
                <div style={{ color: '#5a7a9a', fontSize: '11px', marginTop: '4px' }}>EDGE</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', padding: '14px', background: '#0d1b2e', borderRadius: '8px', textAlign: 'center' }}>
              <span style={{ color: '#8899aa', fontSize: '12px' }}>EXPECTED VALUE per £100 stake: </span>
              <span style={{ color: result.isValue ? '#00c853' : '#ff3d00', fontSize: '18px', fontWeight: 'bold' }}>{result.ev > 0 ? '+' : ''}£{result.ev}</span>
            </div>
          </div>
        )}

        {/* How to use */}
        <div style={{ padding: '20px', background: '#1a2940', borderRadius: '10px', border: '1px solid #2a3f5f' }}>
          <div style={{ color: '#C8961E', fontSize: '12px', letterSpacing: '1px', marginBottom: '12px' }}>HOW TO USE</div>
          <div style={{ color: '#8899aa', fontSize: '12px', lineHeight: '1.8' }}>
            1. Go to <strong style={{ color: '#fff' }}>Predictions</strong> tab and note AI win probability<br/>
            2. Check the same match odds on {bookmaker}<br/>
            3. Enter both values above<br/>
            4. <span style={{ color: '#00c853' }}>Green ✅</span> = AI sees more value than the bookmaker<br/>
            5. <span style={{ color: '#ff3d00' }}>Red ❌</span> = Bookmaker odds are too short, no value
          </div>
          <div style={{ marginTop: '14px', padding: '10px', background: '#0d1b2e', borderRadius: '6px' }}>
            <span style={{ color: '#ff9800', fontSize: '11px' }}>⚠️ 18+ | Please gamble responsibly | BeGambleAware.org</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OddsCalculator;