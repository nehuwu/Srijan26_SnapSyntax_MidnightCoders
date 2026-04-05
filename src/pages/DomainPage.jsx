import { useState, useCallback } from 'react';
import { useRouter } from '../App';
import { generateDomains } from '../services/domaingen';
import { MEM } from '../services/memory';

async function copyText(t) {
  if (navigator?.clipboard?.writeText) { try { await navigator.clipboard.writeText(t); return true; } catch {} }
  try {
    const ta = Object.assign(document.createElement('textarea'),{value:t,style:'position:fixed;opacity:0;top:-9999px'});
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

// ─── TLD color map ────────────────────────────────────────────

const TLD_COLORS = {
  '.com':    '#f59e0b',
  '.io':     '#a855f7',
  '.ai':     '#06b6d4',
  '.co':     '#10b981',
  '.app':    '#f43f5e',
  '.dev':    '#6366f1',
  '.design': '#ec4899',
  '.studio': '#8b5cf6',
  '.me':     '#14b8a6',
};
function tldColor(tld) { return TLD_COLORS[tld] || 'var(--text3)'; }

// ─── Domain Card ──────────────────────────────────────────────

function DomainCard({ result, idx }) {
  const [copied, setCopied] = useState(false);
  const [saved,  setSaved]  = useState(() => MEM.isLiked(result.domain));

  const handleCopy = async () => {
    const ok = await copyText(result.domain);
    if (ok) { setCopied(true); setTimeout(()=>setCopied(false),2000); }
  };
  const handleSave = () => { MEM.like(result.domain); setSaved(true); };

  const color = tldColor(result.tld);

  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border-soft)',
      borderRadius:'var(--radius)', padding:'16px 20px',
      display:'flex', alignItems:'center', justifyContent:'space-between', gap:16,
      transition:'all .18s', animationDelay:`${idx*32}ms`,
      animation:'card-in .3s ease both',
    }}
      onMouseEnter={e=>e.currentTarget.style.borderColor='var(--border-hover)'}
      onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-soft)'}
    >
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:'1rem', color:'var(--text)', display:'flex', alignItems:'baseline', gap:0 }}>
          <span style={{ color:'var(--text)' }}>{result.name}</span>
          <span style={{ color, fontWeight:700 }}>{result.tld}</span>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:5 }}>
          <span style={{
            fontSize:'.65rem', letterSpacing:'.08em', textTransform:'uppercase',
            color:'var(--text3)', background:'var(--surface2)',
            border:'1px solid var(--border-soft)', padding:'1px 7px', borderRadius:4,
          }}>{result.type}</span>
          <span style={{
            fontSize:'.62rem', color:'var(--acc2)', fontFamily:'var(--mono)',
            background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)',
            padding:'1px 7px', borderRadius:4,
          }}>{result.score}pts</span>
          {/* Phase 5 stub */}
          <span style={{
            fontSize:'.62rem', color:'var(--text3)',
            background:'var(--surface2)', border:'1px solid var(--border-soft)',
            padding:'1px 7px', borderRadius:100, opacity:.5,
          }}>⬤ check soon</span>
        </div>
      </div>
      <div className="card-actions">
        <button className={`card-action-btn${saved?' liked':''}`} onClick={handleSave} disabled={saved} title="Save">
          {saved ? '♥' : '♡'}
        </button>
        <button className={`card-action-btn${copied?' copied':''}`} onClick={handleCopy} title="Copy domain">
          {copied ? '✓' : '⎘'}
        </button>
      </div>
    </div>
  );
}

// ─── Vibe options ─────────────────────────────────────────────

const VIBES = [
  { id:'startup',  label:'Startup'   },
  { id:'brand',    label:'Brand'     },
  { id:'creative', label:'Creative'  },
  { id:'tech',     label:'Tech'      },
  { id:'minimal',  label:'Minimal'   },
];

// ─── Page ─────────────────────────────────────────────────────

export default function DomainPage() {
  const { navigate } = useRouter();
  const [name,      setName]      = useState('');
  const [keyword,   setKeyword]   = useState('');
  const [vibe,      setVibe]      = useState('startup');
  const [results,   setResults]   = useState([]);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!name.trim()) return;
    setResults(generateDomains({ name, keyword, vibe }));
    setGenerated(true);
  }, [name, keyword, vibe]);

  const handleKey = e => { if (e.key==='Enter' && name.trim()) handleGenerate(); };

  return (
    <div className="tool-page">
      <div className="container">
        <div className="tool-page-header">
          <button className="tool-page-back" onClick={() => navigate('home')}>← Back to tools</button>
          <h1 className="tool-page-title">Brand Name Generator</h1>
          <p className="tool-page-sub">Domain-ready brand names — scored by brandability</p>
        </div>

        {/* Phase 5 notice */}
        <div style={{
          background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.2)',
          borderRadius:'var(--radius-sm)', padding:'10px 16px', marginBottom:24,
          fontSize:'.78rem', color:'#f59e0b', display:'flex', alignItems:'center', gap:8
        }}>
          <span>⚡</span>
          Real-time domain availability check coming in Phase 5. Results are suggestions only.
        </div>

        <div className="tool-layout">
          {/* Form */}
          <div className="form-panel">
            <div className="form-section">
              <label className="form-label">Brand word <span style={{color:'var(--acc)'}}>*</span></label>
              <input className="form-input" placeholder="e.g. nova, spark, forge..."
                value={name} onChange={e=>setName(e.target.value)} onKeyDown={handleKey} autoFocus />
            </div>

            <div className="form-section">
              <label className="form-label">Keyword <span className="form-label-hint">(optional)</span></label>
              <input className="form-input" placeholder="e.g. design, data, labs..."
                value={keyword} onChange={e=>setKeyword(e.target.value)} onKeyDown={handleKey} />
            </div>

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

            <div className="divider" />

            <button className="gen-btn-main" onClick={handleGenerate} disabled={!name.trim()}
              style={{ background:'linear-gradient(135deg,#f59e0b,#f43f5e)' }}>
              {generated ? '↻ Regenerate →' : 'Generate domains →'}
            </button>
          </div>

          {/* Results */}
          <div className="results-panel">
            {generated ? (
              <>
                <div className="results-header">
                  <div className="results-meta">
                    <strong>{results.length}</strong> domain suggestions · sorted by score
                  </div>
                  <button className="btn-regen" onClick={handleGenerate}
                    style={{borderColor:'rgba(245,158,11,.3)', color:'#f59e0b'}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                    </svg>
                    Regen
                  </button>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {results.map((r,i) => <DomainCard key={r.domain} result={r} idx={i} />)}
                </div>
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:380,gap:12}}>
                <div style={{fontSize:'3rem',opacity:.1}}>✦</div>
                <div style={{color:'var(--text3)',fontSize:'.88rem',textAlign:'center'}}>
                  Enter a brand word to generate<br/>domain name suggestions
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
