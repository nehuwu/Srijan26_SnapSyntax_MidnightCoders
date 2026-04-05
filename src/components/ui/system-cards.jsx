import { useRef, useEffect, useState } from 'react';

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

const ENGINES = [
  {
    id: 'token',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    title: 'Token Engine',
    desc: 'Breaks your input into 7 name variants — full, short, phonetic, leet, initial combos — building a rich token pool.',
    accent: '#a855f7',
    stat: '7 variants',
  },
  {
    id: 'pattern',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    title: 'Pattern Engine',
    desc: '22 weighted templates — name·vibe, prefix·name·suffix, name·hex — applied across 10 iterations, generating 220+ candidates.',
    accent: '#06b6d4',
    stat: '22 templates',
  },
  {
    id: 'scoring',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    title: 'Scoring Engine',
    desc: 'Five weighted signals: name relevance (30%), interest match (20%), vibe (15%), readability (15%), length + entropy (20%).',
    accent: '#10b981',
    stat: '5 signals',
  },
  {
    id: 'uniqueness',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: 'Uniqueness Engine',
    desc: 'Seeded RNG from name + birthYear + interests. Collisions trigger 5 mutation strategies — suffix, syllable, hex, prefix swap.',
    accent: '#f59e0b',
    stat: 'Seeded RNG',
  },
  {
    id: 'availability',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: 'Availability Layer',
    desc: 'Async GitHub API checks per card. Results cached in localStorage for 1 hour. Instagram and domain checks coming in Phase 5.',
    accent: '#f43f5e',
    stat: '1hr cache',
  },
  {
    id: 'identity',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
    title: 'Identity System',
    desc: 'Bundle username + emails + passwords + domains into a named identity object. Stored locally, structured for cloud sync in Pro.',
    accent: '#8b5cf6',
    stat: 'Bundled',
  },
];

export default function SystemCards() {
  const [ref, visible] = useReveal(0.08);

  return (
    <section ref={ref} className={`sc-section reveal-section${visible ? ' revealed' : ''}`}>
      <div className="container">
        <div className="section-label">Under the hood</div>
        <h2 className="section-title">What powers CAUgen</h2>
        <p className="section-sub">Six interconnected engines working together to make every result feel intentional, not random.</p>

        <div className="sc-grid">
          {ENGINES.map((e, i) => (
            <div
              key={e.id}
              className="sc-card"
              style={{ '--card-acc': e.accent, transitionDelay: `${i * 60}ms` }}
            >
              <div className="sc-card-top">
                <div className="sc-icon" style={{ background: `${e.accent}18`, color: e.accent }}>
                  {e.icon}
                </div>
                <span className="sc-stat" style={{ color: e.accent, borderColor: `${e.accent}30`, background: `${e.accent}10` }}>
                  {e.stat}
                </span>
              </div>
              <div className="sc-title">{e.title}</div>
              <div className="sc-desc">{e.desc}</div>
              {/* Subtle bottom glow line */}
              <div className="sc-glow-bar" style={{ background: `linear-gradient(90deg, transparent, ${e.accent}50, transparent)` }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
