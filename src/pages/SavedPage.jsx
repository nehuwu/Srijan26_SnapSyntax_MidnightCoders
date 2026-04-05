import { useState, useCallback } from 'react';
import { useRouter } from '../App';
import { MEM, IDENTITY } from '../services/memory';

async function copyText(t) {
  if (navigator?.clipboard?.writeText) { try { await navigator.clipboard.writeText(t); return true; } catch {} }
  try {
    const ta = Object.assign(document.createElement('textarea'),{value:t,style:'position:fixed;opacity:0;top:-9999px'});
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

function guessType(name) {
  if (name.includes('@')) return 'email';
  if (name.includes('.') && !name.includes('@') && name.length <= 30 && name.split('.').length >=2) return 'domain';
  if (/[A-Z]/.test(name) && name.length >= 10 && /[^a-zA-Z0-9]/.test(name)) return 'password';
  return 'username';
}

const TYPE_META = {
  username: { color:'var(--acc)',     label:'Username', icon:'@'  },
  email:    { color:'var(--acc3)',    label:'Email',    icon:'✉'  },
  domain:   { color:'#f59e0b',       label:'Domain',   icon:'✦'  },
  password: { color:'var(--acc2)',    label:'Password', icon:'⌘'  },
};

const FILTERS = ['All','Username','Email','Domain','Password'];

// ─── Individual saved card ────────────────────────────────────
function SavedCard({ name, onRemove, idx }) {
  const [copied, setCopied] = useState(false);
  const type = guessType(name);
  const meta = TYPE_META[type] || TYPE_META.username;

  const handleCopy = async () => {
    const ok = await copyText(name);
    if (ok) { setCopied(true); setTimeout(()=>setCopied(false), 2000); }
  };

  return (
    <div className="saved-card" style={{ animationDelay:`${idx*40}ms` }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
        <span style={{
          width:28, height:28, borderRadius:8,
          background:`${meta.color}18`, color:meta.color,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'.9rem', flexShrink:0,
        }}>{meta.icon}</span>
        <span className="saved-card-type" style={{ color:meta.color }}>{meta.label}</span>
      </div>
      <div className="saved-card-name" style={{
        fontSize: type==='password' ? '.82rem' : '1rem',
        letterSpacing: type==='password' ? '.06em' : '.02em',
        wordBreak:'break-all',
      }}>{name}</div>
      <div className="saved-card-actions">
        <button className={`btn-sm cpy${copied?' copied':''}`} onClick={handleCopy}>
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
        <button className="btn-sm del" onClick={() => onRemove(name)}>✕ Remove</button>
      </div>
    </div>
  );
}

// ─── Identity bundle card ─────────────────────────────────────
function IdentityCard({ bundle, onRemove }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const handleCopy = async (text) => {
    const ok = await copyText(text);
    if (ok) { setCopied(text); setTimeout(()=>setCopied(null), 2000); }
  };

  const dt = new Date(bundle.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'2-digit'});

  const rows = [
    bundle.username  && { label:'Username', icon:'@',  items:[bundle.username],  color:'var(--acc)'  },
    bundle.emails?.length  && { label:'Emails',   icon:'✉',  items:bundle.emails,      color:'var(--acc3)' },
    bundle.passwords?.length && { label:'Passwords',icon:'⌘', items:bundle.passwords,   color:'var(--acc2)' },
    bundle.domains?.length && { label:'Domains',  icon:'✦',  items:bundle.domains,     color:'#f59e0b'     },
  ].filter(Boolean);

  return (
    <div style={{
      background:'var(--surface)', border:'1px solid var(--border-soft)',
      borderRadius:'var(--radius-lg)', overflow:'hidden',
      animation:'card-in .3s ease both',
    }}>
      {/* Header */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'16px 20px', borderBottom: open ? '1px solid var(--border-soft)' : 'none',
        cursor:'pointer',
      }} onClick={() => setOpen(o=>!o)}>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'.96rem', color:'var(--text)', fontWeight:500 }}>
            {bundle.label}
          </div>
          <div style={{ fontSize:'.68rem', color:'var(--text3)', marginTop:3, display:'flex', gap:12 }}>
            <span>{dt}</span>
            <span>{rows.length} section{rows.length!==1?'s':''}</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'.75rem', color:'var(--text3)', transform:open?'rotate(180deg)':'', transition:'transform .2s' }}>▾</span>
        </div>
      </div>

      {/* Expanded body */}
      {open && (
        <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:16 }}>
          {rows.map(row => (
            <div key={row.label}>
              <div style={{ fontSize:'.68rem', color:row.color, fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>
                {row.icon} {row.label}
              </div>
              {row.items.map((item,i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
                  padding:'8px 10px', marginBottom:4, borderRadius:'var(--radius-sm)',
                  background:'var(--surface2)', border:'1px solid var(--border-soft)',
                }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'.84rem', color:'var(--text)', wordBreak:'break-all', flex:1 }}>{item}</span>
                  <button className={`card-action-btn${copied===item?' copied':''}`} onClick={()=>handleCopy(item)} style={{flexShrink:0}}>
                    {copied===item ? '✓' : '⎘'}
                  </button>
                </div>
              ))}
            </div>
          ))}
          <button className="btn-sm del" onClick={()=>onRemove(bundle.id)}
            style={{width:'100%', marginTop:4}}>
            ✕ Remove identity
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────
const TOP_FILTERS = ['Saved','Identities'];

export default function SavedPage() {
  const { navigate } = useRouter();
  const [tab,    setTab]    = useState('Saved');
  const [items,  setItems]  = useState(() => MEM.getLiked());
  const [bundles,setBundles]= useState(() => IDENTITY.getAll());
  const [filter, setFilter] = useState('All');

  const handleRemoveItem = useCallback(name => {
    MEM.unlike(name); setItems(prev => prev.filter(n=>n!==name));
  }, []);

  const handleRemoveBundle = useCallback(id => {
    IDENTITY.remove(id); setBundles(IDENTITY.getAll());
  }, []);

  const filtered = filter==='All' ? items
    : items.filter(n => guessType(n) === filter.toLowerCase());

  return (
    <div className="saved-page">
      <div className="container">

        {/* Header */}
        <div className="saved-header">
          <div>
            <h1 className="tool-page-title">Saved</h1>
            <p className="tool-page-sub">
              {items.length} item{items.length!==1?'s':''} · {bundles.length} identity bundle{bundles.length!==1?'s':''}
            </p>
          </div>
          {(items.length > 0 || bundles.length > 0) && (
            <button className="btn-ghost"
              onClick={() => { MEM.clearAll(); IDENTITY.clearAll(); setItems([]); setBundles([]); }}
              style={{color:'var(--acc-red)',borderColor:'rgba(244,63,94,.2)'}}>
              Clear all
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid var(--border-soft)', paddingBottom:0 }}>
          {TOP_FILTERS.map(t => (
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'8px 18px', border:'none', background:'transparent',
              color: tab===t ? 'var(--acc)' : 'var(--text3)',
              fontWeight: tab===t ? 600 : 400, fontSize:'.88rem', cursor:'pointer',
              borderBottom: tab===t ? '2px solid var(--acc)' : '2px solid transparent',
              transition:'all .15s', marginBottom:-1,
            }}>{t} {t==='Saved'?`(${items.length})`:`(${bundles.length})`}</button>
          ))}
        </div>

        {/* SAVED tab */}
        {tab === 'Saved' && (
          <>
            {items.length > 0 && (
              <div className="saved-filter">
                {FILTERS.map(f => (
                  <button key={f} className={`filter-pill${filter===f?' active':''}`} onClick={()=>setFilter(f)}>{f}</button>
                ))}
              </div>
            )}
            {filtered.length > 0 ? (
              <div className="saved-grid">
                {filtered.map((name,i) => (
                  <SavedCard key={name} name={name} onRemove={handleRemoveItem} idx={i} />
                ))}
              </div>
            ) : (
              <div className="saved-empty">
                <div className="saved-empty-icon">♡</div>
                <div className="saved-empty-text">
                  {items.length===0
                    ? <>Nothing saved yet.<br/>Hit ♡ on any result to save it here.</>
                    : `No ${filter.toLowerCase()} items saved.`}
                  {items.length===0 && (
                    <div style={{marginTop:20}}>
                      <button className="gen-btn-main" onClick={()=>navigate('username')}
                        style={{width:'auto',padding:'10px 28px',display:'inline-block'}}>
                        Generate usernames →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* IDENTITIES tab */}
        {tab === 'Identities' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {bundles.length > 0 ? (
              bundles.map(b => <IdentityCard key={b.id} bundle={b} onRemove={handleRemoveBundle} />)
            ) : (
              <div className="saved-empty">
                <div className="saved-empty-icon" style={{fontSize:'2rem',opacity:.2}}>⬡</div>
                <div className="saved-empty-text">
                  No identity bundles yet.<br/>
                  <span style={{opacity:.6,fontSize:'.82rem'}}>Identity groups coming in the next update.</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
