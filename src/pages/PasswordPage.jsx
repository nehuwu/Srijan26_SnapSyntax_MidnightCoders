import { useState, useCallback } from 'react';
import { useRouter } from '../App';
import { generatePasswords, analyzeStrength } from '../services/passwordGen';
import { MEM } from '../services/memory';

async function copyText(t) {
  if (navigator?.clipboard?.writeText) { try { await navigator.clipboard.writeText(t); return true; } catch {} }
  try {
    const ta = Object.assign(document.createElement('textarea'),{value:t,style:'position:fixed;opacity:0;top:-9999px'});
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

// ─── Password Card ────────────────────────────────────────────

function PasswordCard({ pw, idx }) {
  const [copied, setCopied] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const info = analyzeStrength(pw);

  const handleCopy = async () => {
    const ok = await copyText(pw);
    if (ok) { setCopied(true); setTimeout(()=>setCopied(false), 2000); }
  };
  const handleSave = () => { MEM.like(pw); setSaved(true); };

  return (
    <div className="pw-card" style={{ animationDelay:`${idx*30}ms` }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="pw-text" style={{ wordBreak:'break-all' }}>{pw}</div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:7 }}>
          {/* Strength bar */}
          <div style={{ flex:1, height:3, borderRadius:2, background:'var(--surface3)' }}>
            <div style={{ height:3, borderRadius:2, width:`${info.pct}%`, background:info.color, transition:'width .6s ease' }} />
          </div>
          <span style={{ fontSize:'.65rem', color:info.color, fontWeight:600, flexShrink:0 }}>
            {info.label}
          </span>
          <span style={{ fontSize:'.62rem', color:'var(--text3)', fontFamily:'var(--mono)', flexShrink:0 }}>
            {pw.length}ch
          </span>
        </div>
      </div>
      <div className="card-actions" style={{ flexShrink:0 }}>
        <button className={`card-action-btn${saved?' liked':''}`} onClick={handleSave} disabled={saved} title="Save">
          {saved ? '♥' : '♡'}
        </button>
        <button className={`card-action-btn${copied?' copied':''}`} onClick={handleCopy} title="Copy">
          {copied ? '✓' : '⎘'}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function PasswordPage() {
  const { navigate } = useRouter();
  const [length,       setLength]       = useState(16);
  const [strength,     setStrength]     = useState('high');
  const [symbols,      setSymbols]      = useState(true);
  const [strengthMode, setStrengthMode] = useState('strong');   // 'strong' | 'normal' (memorable)
  const [baseInput,    setBaseInput]    = useState('');
  const [passwords,    setPasswords]    = useState([]);
  const [generated,    setGenerated]    = useState(false);

  const handleGenerate = useCallback(() => {
    setPasswords(generatePasswords({ length, strength, symbols, strengthMode, baseInput }, 12));
    setGenerated(true);
  }, [length, strength, symbols, strengthMode, baseInput]);

  const STRENGTHS = [
    { id:'low',    label:'Low',    color:'#10b981' },
    { id:'medium', label:'Medium', color:'#f59e0b' },
    { id:'high',   label:'High',   color:'#f43f5e' },
  ];

  return (
    <div className="tool-page">
      <div className="container">
        <div className="tool-page-header">
          <button className="tool-page-back" onClick={() => navigate('home')}>← Back to tools</button>
          <h1 className="tool-page-title">Password Generator</h1>
          <p className="tool-page-sub">Strong random or memorable — generated locally, never sent anywhere</p>
        </div>

        <div className="tool-layout">
          {/* Form */}
          <div className="form-panel">

            {/* Mode toggle: Strong vs Memorable */}
            <div className="form-section">
              <label className="form-label">Generation mode</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {[
                  { id:'strong', label:'Random', desc:'Maximum entropy' },
                  { id:'normal', label:'Memorable', desc:'Based on a phrase' },
                ].map(m => (
                  <button key={m.id} onClick={() => setStrengthMode(m.id)}
                    style={{
                      padding:'10px 12px', borderRadius:'var(--radius-sm)', textAlign:'left',
                      border:`1px solid ${strengthMode===m.id ? 'var(--acc)' : 'var(--border-soft)'}`,
                      background: strengthMode===m.id ? 'rgba(168,85,247,.1)' : 'var(--surface2)',
                      color: strengthMode===m.id ? 'var(--acc)' : 'var(--text2)',
                      transition:'all .15s', cursor:'pointer',
                    }}>
                    <div style={{ fontWeight:600, fontSize:'.82rem' }}>{m.label}</div>
                    <div style={{ fontSize:'.68rem', opacity:.6, marginTop:2 }}>{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Base phrase (only in memorable mode) */}
            {strengthMode === 'normal' && (
              <div className="form-section">
                <label className="form-label">
                  Base phrase <span style={{color:'var(--acc)'}}>*</span>
                </label>
                <input className="form-input" placeholder="e.g. myCat loves pizza..."
                  value={baseInput} onChange={e=>setBaseInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter') handleGenerate(); }} autoFocus />
                <div style={{ fontSize:'.7rem', color:'var(--text3)', marginTop:6 }}>
                  Chunks are transformed and shuffled — not stored anywhere
                </div>
              </div>
            )}

            {/* Length */}
            <div className="form-section">
              <label className="form-label">
                Length — <span style={{color:'var(--acc)', fontFamily:'var(--mono)'}}>{length}</span>
              </label>
              <input type="range" min={8} max={64} value={length} step={1}
                onChange={e=>setLength(Number(e.target.value))}
                style={{ width:'100%', accentColor:'var(--acc)', cursor:'pointer', marginTop:8 }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.68rem', color:'var(--text3)', marginTop:4 }}>
                <span>8</span><span>32</span><span>64</span>
              </div>
            </div>

            {/* Complexity (only in strong mode) */}
            {strengthMode === 'strong' && (
              <div className="form-section">
                <label className="form-label">Complexity</label>
                <div className="strength-btns">
                  {STRENGTHS.map(s => (
                    <button key={s.id}
                      className={`strength-btn${strength===s.id?` active ${s.id}`:''}`}
                      onClick={()=>setStrength(s.id)}
                      style={strength===s.id ? { borderColor:s.color, color:s.color, background:`${s.color}14` } : {}}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Symbols toggle */}
            <div className="form-section">
              <div className="toggle-row">
                <span className="toggle-label">Include symbols</span>
                <button className={`toggle-switch${symbols?' on':''}`}
                  onClick={()=>setSymbols(s=>!s)} aria-label="Toggle symbols" />
              </div>
            </div>

            <div className="divider" />

            <div style={{ fontSize:'.78rem', color:'var(--text3)', lineHeight:1.6, marginBottom:16 }}>
              {strengthMode==='normal' ? 'Memorable' : 'Random'} · {length} chars
              {symbols ? ' · symbols' : ''} · {strength} complexity
            </div>

            <button className="gen-btn-main" onClick={handleGenerate}
              disabled={strengthMode==='normal' && !baseInput.trim()}>
              {generated ? '↻ Regenerate →' : 'Generate passwords →'}
            </button>
          </div>

          {/* Results */}
          <div className="results-panel">
            {generated ? (
              <>
                <div className="results-header">
                  <div className="results-meta">
                    <strong>{passwords.length}</strong> passwords generated ·{' '}
                    <span style={{color:'var(--acc2)'}}>{strengthMode==='normal'?'memorable':'random'}</span>
                  </div>
                  <button className="btn-regen" onClick={handleGenerate}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                    </svg>
                    Regen
                  </button>
                </div>
                <div className="pw-grid">
                  {passwords.map((pw,i) => <PasswordCard key={`${pw}-${i}`} pw={pw} idx={i} />)}
                </div>
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:380,gap:12}}>
                <div style={{fontSize:'3rem',opacity:.1}}>⌘</div>
                <div style={{color:'var(--text3)',fontSize:'.88rem',textAlign:'center'}}>
                  {strengthMode==='normal'
                    ? 'Enter a base phrase and hit Generate\nto create memorable passwords'
                    : 'Configure options and hit Generate\nto create secure passwords'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
