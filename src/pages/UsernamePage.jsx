import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '../App';
import { generateUsernames } from '../services/generator';
import { checkGitHub } from '../services/availability';
import { MEM } from '../services/memory';

// ─── Copy util ────────────────────────────────────────────────
async function copyText(text) {
  if (navigator?.clipboard?.writeText) { try { await navigator.clipboard.writeText(text); return true; } catch {} }
  try {
    const ta = Object.assign(document.createElement('textarea'),{value:text,style:'position:fixed;opacity:0;top:-9999px;left:-9999px'});
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

// ─── Share helpers ────────────────────────────────────────────
function encodeShare(data)  { try { return btoa(JSON.stringify(data)); } catch { return null; } }
function decodeShare(str)   { try { return JSON.parse(atob(str)); } catch { return null; } }

function buildShareUrl(form, regenCount) {
  const payload = encodeShare({ name:form.name, birthYear:form.birthYear, interests:form.interests, vibe:form.vibe, regenOffset:regenCount });
  if (!payload) return null;
  return `${window.location.origin}${window.location.pathname}#username?data=${payload}`;
}

function parseUrlData() {
  const hash  = window.location.hash; // e.g. #username?data=xxx
  const qIdx  = hash.indexOf('?');
  if (qIdx === -1) return null;
  const params = new URLSearchParams(hash.slice(qIdx + 1));
  const raw    = params.get('data');
  return raw ? decodeShare(raw) : null;
}

// ─── Availability Badge ───────────────────────────────────────
function AvailBadge({ username }) {
  const [status, setStatus] = useState('checking');
  useEffect(() => {
    let alive = true;
    checkGitHub(username).then(r => { if (alive) setStatus(r); });
    return () => { alive = false; };
  }, [username]);

  const cfg = {
    checking:  { cls:'ab-checking',  label:'checking…'  },
    available: { cls:'ab-available', label:'✓ available' },
    taken:     { cls:'ab-taken',     label:'✕ taken'     },
    unknown:   { cls:'ab-unknown',   label:'? unknown'   },
  }[status] || { cls:'ab-unknown', label:'? unknown' };

  return <span className={`avail-badge ${cfg.cls}`}><span className="avail-dot" />{cfg.label}</span>;
}

// ─── Username Card ────────────────────────────────────────────
function UsernameCard({ result, rank }) {
  const [copied, setCopied] = useState(false);
  const [liked,  setLiked]  = useState(() => MEM.isLiked(result.username));

  const handleCopy = async () => {
    const ok = await copyText(result.username);
    if (ok) { setCopied(true); setTimeout(()=>setCopied(false), 2000); }
  };
  const handleLike = () => {
    if (liked) { MEM.unlike(result.username); setLiked(false); }
    else        { MEM.like(result.username);   setLiked(true);  }
  };

  const isTop = rank <= 3;
  const rankEl = rank===1 ? <span className="rank-badge rb-1">1</span>
               : rank===2 ? <span className="rank-badge rb-2">2</span>
               : rank===3 ? <span className="rank-badge rb-3">3</span>
               : <span style={{fontFamily:'var(--mono)',fontSize:'.68rem',color:'var(--text3)'}}>{String(rank).padStart(2,'0')}</span>;

  return (
    <div className={`uname-card${isTop?' rank-top':''}`} style={{animationDelay:`${(rank-1)*28}ms`}}>
      <div className="uname-rank">{rankEl}</div>
      <div className="uname-main">
        <div className="uname-text">{result.username}</div>
        <div className="uname-meta">
          <span className="uname-score">{result.score}pts</span>
          <span className="uname-pattern">{result.pattern}</span>
        </div>
      </div>
      <AvailBadge username={result.username} />
      <div className="card-actions">
        <button className={`card-action-btn${liked?' liked':''}`} onClick={handleLike} title={liked?'Unsave':'Save'}>
          {liked ? '♥' : '♡'}
        </button>
        <button className={`card-action-btn${copied?' copied':''}`} onClick={handleCopy} title="Copy">
          {copied ? '✓' : '⎘'}
        </button>
      </div>
    </div>
  );
}

// ─── Options ──────────────────────────────────────────────────
const INTERESTS = [
  {id:'tech',label:'Tech'},{id:'gaming',label:'Gaming'},{id:'aesthetic',label:'Aesthetic'},
  {id:'business',label:'Business'},{id:'music',label:'Music'},{id:'art',label:'Art'},
];
const VIBES = [
  {id:'cool',label:'Cool'},{id:'aesthetic',label:'Aesthetic'},{id:'gamer',label:'Gamer'},
  {id:'pro',label:'Pro'},{id:'minimal',label:'Minimal'},{id:'dark',label:'Dark'},
];
const MODES  = ['All','High score','Available','Clean'];
const PAGE_SIZE = 10;

// ─── Icons ────────────────────────────────────────────────────
function RefreshIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>;
}
function ShareIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
}
function LinkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
}

// ─── Share Bar component ──────────────────────────────────────
function ShareBar({ form, regenCount }) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [shared,     setShared]     = useState(false);

  const url = buildShareUrl(form, regenCount);

  const handleCopyLink = async () => {
    if (!url) return;
    const ok = await copyText(url);
    if (ok) { setLinkCopied(true); setTimeout(()=>setLinkCopied(false), 2500); }
  };

  const handleShare = async () => {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title:'CAUgen — Username Results', url });
        setShared(true); setTimeout(()=>setShared(false), 2000);
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div style={{ display:'flex', gap:6 }}>
      <button
        className="btn-regen"
        onClick={handleCopyLink}
        title="Copy share link"
        style={{ gap:6, fontSize:'.78rem',
          borderColor: linkCopied ? 'var(--acc2)' : undefined,
          color:        linkCopied ? 'var(--acc2)' : undefined,
        }}>
        <LinkIcon /> {linkCopied ? 'Link copied!' : 'Copy link'}
      </button>
      {typeof navigator !== 'undefined' && navigator.share && (
        <button className="btn-regen" onClick={handleShare} title="Share"
          style={{ gap:6, fontSize:'.78rem' }}>
          <ShareIcon /> {shared ? 'Shared!' : 'Share'}
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function UsernamePage() {
  const { navigate } = useRouter();

  const [form, setForm] = useState({ name:'', birthYear:'', interests:[], vibe:'cool' });
  const [results,    setResults]    = useState([]);
  const [regenCount, setRegenCount] = useState(0);
  const [visible,    setVisible]    = useState(PAGE_SIZE);
  const [mode,       setMode]       = useState('All');
  const [generated,  setGenerated]  = useState(false);

  // ── Restore from shared link on mount ──
  useEffect(() => {
    const shared = parseUrlData();
    if (shared) {
      const restored = {
        name:       shared.name       || '',
        birthYear:  shared.birthYear  || '',
        interests:  shared.interests  || [],
        vibe:       shared.vibe       || 'cool',
      };
      const offset = shared.regenOffset || 0;
      setForm(restored);
      setRegenCount(offset);
      const r = generateUsernames(restored, offset);
      setResults(r);
      setGenerated(true);
      // Clean the hash so back/forward doesn't re-trigger
      window.history.replaceState(null,'','#username');
    }
  }, []); // eslint-disable-line

  const handleGenerate = useCallback(() => {
    if (!form.name.trim()) return;
    MEM.pushHistory({...form});
    setResults(generateUsernames(form, 0));
    setRegenCount(0);
    setVisible(PAGE_SIZE);
    setGenerated(true);
  }, [form]);

  const handleRegen = useCallback(() => {
    const next = regenCount + 1;
    setRegenCount(next);
    setResults(generateUsernames(form, next));
    setVisible(PAGE_SIZE);
  }, [form, regenCount]);

  const toggleInterest = id => {
    setForm(f => {
      const arr = f.interests;
      if (arr.includes(id)) return {...f, interests:arr.filter(x=>x!==id)};
      if (arr.length >= 3)  return f;
      return {...f, interests:[...arr, id]};
    });
  };

  const handleKey = e => { if (e.key==='Enter' && form.name.trim()) handleGenerate(); };

  const filtered = (() => {
    if (mode==='High score') return results.filter(r=>r.score>=70);
    if (mode==='Clean')      return results.filter(r=>!r.username.includes('.')&&!r.username.includes('_'));
    return results;
  })();
  const shown   = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  useEffect(() => { setVisible(PAGE_SIZE); }, [mode, results]);

  return (
    <div className="tool-page">
      <div className="container">
        <div className="tool-page-header">
          <button className="tool-page-back" onClick={() => navigate('home')}>← Back to tools</button>
          <h1 className="tool-page-title">Username Generator</h1>
          <p className="tool-page-sub">Context-aware · ranked by relevance · GitHub availability checked</p>
        </div>

        <div className="tool-layout">
          {/* Form */}
          <div className="form-panel">
            <div className="form-section">
              <label className="form-label">Name <span style={{color:'var(--acc)'}}>*</span></label>
              <input className="form-input" placeholder="your name..." value={form.name}
                onChange={e=>setForm(f=>({...f,name:e.target.value}))} onKeyDown={handleKey} autoFocus />
            </div>
            <div className="form-section">
              <label className="form-label">Birth Year <span className="form-label-hint">(optional)</span></label>
              <input className="form-input" placeholder="e.g. 2001" maxLength={4} value={form.birthYear}
                onChange={e=>setForm(f=>({...f,birthYear:e.target.value.replace(/\D/g,'')}))} />
            </div>
            <div className="form-section">
              <label className="form-label">Interests <span className="form-label-hint">(up to 3)</span></label>
              <div className="tag-group">
                {INTERESTS.map(o => (
                  <button key={o.id} className={`tag-btn${form.interests.includes(o.id)?' active':''}`}
                    onClick={()=>toggleInterest(o.id)}>{o.label}</button>
                ))}
              </div>
            </div>
            <div className="form-section">
              <label className="form-label">Vibe</label>
              <div className="tag-group">
                {VIBES.map(o => (
                  <button key={o.id} className={`tag-btn${form.vibe===o.id?' active':''}`}
                    onClick={()=>setForm(f=>({...f,vibe:o.id}))}>{o.label}</button>
                ))}
              </div>
            </div>
            <button className="gen-btn-main" onClick={handleGenerate} disabled={!form.name.trim()}>
              {generated ? '↻ Regenerate' : 'Generate →'}
            </button>
          </div>

          {/* Results */}
          <div className="results-panel">
            {generated ? (
              <>
                <div className="results-header">
                  <div className="results-meta">
                    Showing <strong>{shown.length}</strong> of <strong>{filtered.length}</strong>
                    {regenCount > 0 && <span style={{color:'var(--acc)',opacity:.7,marginLeft:8}}>· regen #{regenCount}</span>}
                  </div>
                  <div className="results-actions">
                    <button className="btn-regen" onClick={handleRegen}>
                      <RefreshIcon /> Regen
                    </button>
                  </div>
                </div>

                {/* Share bar */}
                <div style={{ marginBottom:12 }}>
                  <ShareBar form={form} regenCount={regenCount} />
                </div>

                {/* Filter bar */}
                <div className="filter-bar">
                  {MODES.map(m => (
                    <button key={m} className={`filter-pill${mode===m?' active':''}`} onClick={()=>setMode(m)}>
                      {m}
                    </button>
                  ))}
                </div>

                <div className="uname-grid">
                  {shown.map((r,i) => (
                    <UsernameCard key={`${r.username}-${regenCount}`} result={r} rank={i+1} />
                  ))}
                </div>

                {hasMore && (
                  <div className="load-more-row">
                    <button className="load-more-btn"
                      onClick={()=>setVisible(v=>Math.min(v+PAGE_SIZE,filtered.length))}>
                      Load {Math.min(PAGE_SIZE,filtered.length-visible)} more
                      <span style={{opacity:.4,marginLeft:8,fontSize:'.78em'}}>({filtered.length-visible} left)</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:380,gap:12}}>
                <div style={{fontSize:'3rem',opacity:.1}}>@</div>
                <div style={{color:'var(--text3)',fontSize:'.88rem',textAlign:'center'}}>
                  Enter your name and hit Generate<br/>to see 30 ranked username suggestions
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
