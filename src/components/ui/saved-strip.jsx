import { useRef, useEffect, useState } from 'react';
import { useRouter } from '../../App';
import { MEM } from '../../services/memory';

function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

async function copyText(text) {
  if (navigator?.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch {}
  }
  try {
    const ta = Object.assign(document.createElement('textarea'), { value: text, style: 'position:fixed;opacity:0;top:-9999px' });
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok;
  } catch { return false; }
}

function guessType(name) {
  if (name.includes('@')) return { label: 'Email', color: 'var(--acc3)', icon: '✉' };
  if (name.includes('.') && !name.includes('@') && name.length <= 30) return { label: 'Domain', color: '#f59e0b', icon: '✦' };
  if (/[A-Z]/.test(name) && name.length >= 10 && /[^a-zA-Z0-9]/.test(name)) return { label: 'Password', color: 'var(--acc2)', icon: '⌘' };
  return { label: 'Username', color: 'var(--acc)', icon: '@' };
}

function SavedChip({ name, onCopy }) {
  const [copied, setCopied] = useState(false);
  const type = guessType(name);

  const handleCopy = async () => {
    const ok = await onCopy(name);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <div className="ss-chip">
      <span className="ss-chip-icon" style={{ color: type.color }}>{type.icon}</span>
      <span className="ss-chip-name" style={{ fontFamily: 'var(--mono)' }}>{name}</span>
      <span className="ss-chip-type" style={{ color: type.color }}>{type.label}</span>
      <button
        className={`ss-chip-copy${copied ? ' ok' : ''}`}
        onClick={handleCopy}
        title="Copy"
      >
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  );
}

export default function SavedStrip() {
  const [ref, visible] = useReveal(0.1);
  const { navigate } = useRouter();
  const [items] = useState(() => MEM.getLiked().slice(0, 4));

  if (items.length === 0) return null;

  return (
    <section ref={ref} className={`ss-section reveal-section${visible ? ' revealed' : ''}`}>
      <div className="container">
        <div className="ss-inner">
          <div className="ss-left">
            <div className="ss-label">Saved items</div>
            <div className="ss-count">{MEM.getLiked().length} item{MEM.getLiked().length !== 1 ? 's' : ''} saved</div>
          </div>
          <div className="ss-chips">
            {items.map(name => (
              <SavedChip key={name} name={name} onCopy={copyText} />
            ))}
          </div>
          <button className="ss-cta" onClick={() => navigate('saved')}>
            Open Saved
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 5 }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
