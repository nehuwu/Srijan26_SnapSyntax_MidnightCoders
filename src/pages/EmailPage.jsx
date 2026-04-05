import { useState, useCallback } from 'react';
import { useRouter } from '../App';
import { generateEmails } from '../services/emailGen';
import { MEM } from '../services/memory';

async function copyText(t) {
  if (navigator?.clipboard?.writeText) { try { await navigator.clipboard.writeText(t); return true; } catch {} }
  try {
    const ta = Object.assign(document.createElement('textarea'),{value:t,style:'position:fixed;opacity:0;top:-9999px'});
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

// ─── Service radio group ──────────────────────────────────────

const SERVICES = [
  { id:'gmail',   label:'Gmail',   color:'#ea4335' },
  { id:'yahoo',   label:'Yahoo',   color:'#720e9e' },
  { id:'outlook', label:'Outlook', color:'#0078d4' },
  { id:'proton',  label:'Proton',  color:'#6d4aff' },
  { id:'custom',  label:'Other',   color:'#10b981' },
];

const VIBES = [
  { id:'business',  label:'Business'  },
  { id:'casual',    label:'Casual'    },
  { id:'aesthetic', label:'Aesthetic' },
];

// ─── Email Card ───────────────────────────────────────────────

function EmailCard({ result, idx }) {
  const [copied, setCopied] = useState(false);
  const [saved,  setSaved]  = useState(() => MEM.isLiked(result.email));

  const handleCopy = async () => {
    const ok = await copyText(result.email);
    if (ok) { setCopied(true); setTimeout(()=>setCopied(false), 2000); }
  };
  const handleSave = () => { MEM.like(result.email); setSaved(true); };

  const parts = result.email.split('@');

  return (
    <div className="email-card" style={{ animationDelay:`${idx*35}ms` }}>
      <div className="email-card-left" style={{ flex:1, minWidth:0 }}>
        <div className="email-full">
          <span className="em-user">{parts[0]}</span>
          <span className="em-at">@</span>
          <span className="em-dom">{parts[1]}</span>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:5, alignItems:'center' }}>
          <div className="email-type">{result.pattern}</div>
          <div style={{
            fontFamily:'var(--mono)', fontSize:'.62rem',
            color:'var(--acc2)', background:'rgba(16,185,129,0.08)',
            border:'1px solid rgba(16,185,129,0.2)',
            padding:'1px 7px', borderRadius:4
          }}>{result.score}pts</div>
        </div>
      </div>
      <div className="card-actions">
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

export default function EmailPage() {
  const { navigate } = useRouter();
  const [name,      setName]      = useState('');
  const [service,   setService]   = useState('gmail');
  const [vibe,      setVibe]      = useState('casual');
  const [keyword,   setKeyword]   = useState('');
  const [results,   setResults]   = useState([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!name.trim()) return;
    setResults(generateEmails({ name, service, vibe, keyword }));
    setGenerated(true);
  }, [name, service, vibe, keyword]);

  const handleKey = e => { if (e.key==='Enter' && name.trim()) handleGenerate(); };

  const selectedSvc = SERVICES.find(s => s.id === service);

  return (
    <div className="tool-page">
      <div className="container">
        <div className="tool-page-header">
          <button className="tool-page-back" onClick={() => navigate('home')}>← Back to tools</button>
          <h1 className="tool-page-title">Email ID Generator</h1>
          <p className="tool-page-sub">Pattern-based email suggestions — scored and ranked</p>
        </div>

        <div className="tool-layout">
          {/* Form */}
          <div className="form-panel">

            {/* Name */}
            <div className="form-section">
              <label className="form-label">Name <span style={{color:'var(--acc)'}}>*</span></label>
              <input className="form-input" placeholder="your name..." value={name}
                onChange={e=>setName(e.target.value)} onKeyDown={handleKey} autoFocus />
            </div>

            {/* Service radio group */}
            <div className="form-section">
              <label className="form-label">Email service</label>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {SERVICES.map(s => (
                  <button key={s.id}
                    onClick={() => setService(s.id)}
                    style={{
                      padding:'8px 12px', borderRadius:'var(--radius-sm)',
                      border:`1px solid ${service===s.id ? s.color : 'var(--border-soft)'}`,
                      background: service===s.id ? `${s.color}18` : 'var(--surface2)',
                      color: service===s.id ? s.color : 'var(--text2)',
                      fontSize:'.8rem', fontWeight:600,
                      transition:'all .15s', cursor:'pointer', textAlign:'center',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
              {selectedSvc && (
                <div style={{marginTop:6, fontSize:'.7rem', color:'var(--text3)'}}>
                  Suggestions for <span style={{color:selectedSvc.color}}>{selectedSvc.label}</span> addresses
                </div>
              )}
            </div>

            {/* Vibe */}
            <div className="form-section">
              <label className="form-label">Style</label>
              <div className="tag-group">
                {VIBES.map(v => (
                  <button key={v.id}
                    className={`tag-btn${vibe===v.id?' active':''}`}
                    onClick={()=>setVibe(v.id)}>{v.label}</button>
                ))}
              </div>
            </div>

            {/* Keyword */}
            <div className="form-section">
              <label className="form-label">Keyword <span className="form-label-hint">(optional)</span></label>
              <input className="form-input" placeholder="e.g. design, dev, music..."
                value={keyword} onChange={e=>setKeyword(e.target.value)} onKeyDown={handleKey} />
              <div style={{fontSize:'.7rem', color:'var(--text3)', marginTop:6}}>
                Mixed into patterns: name.keyword, keyword.name, etc.
              </div>
            </div>

            <div className="divider" />

            <button className="gen-btn-main" onClick={handleGenerate} disabled={!name.trim()}
              style={{ background:'linear-gradient(135deg,#06b6d4,#0284c7)' }}>
              {generated ? '↻ Regenerate →' : 'Generate email IDs →'}
            </button>
          </div>

          {/* Results */}
          <div className="results-panel">
            {generated ? (
              <>
                <div className="results-header">
                  <div className="results-meta">
                    <strong>{results.length}</strong> email suggestions · {service}
                  </div>
                  <button className="btn-regen" onClick={handleGenerate}
                    style={{borderColor:'rgba(6,182,212,.3)', color:'var(--acc3)'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                    </svg>
                    Regen
                  </button>
                </div>
                <div className="email-grid">
                  {results.map((r,i) => <EmailCard key={r.email} result={r} idx={i} />)}
                </div>
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:380,gap:12}}>
                <div style={{fontSize:'3rem',opacity:.1}}>✉</div>
                <div style={{color:'var(--text3)',fontSize:'.88rem',textAlign:'center'}}>
                  Enter your name, pick a service,<br/>and hit Generate to see email suggestions
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
