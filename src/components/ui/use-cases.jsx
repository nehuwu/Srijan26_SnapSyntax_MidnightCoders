import { useRef, useEffect, useState } from 'react';
import { useRouter } from '../../App';

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

const CASES = [
  {
    emoji: '🎨',
    audience: 'Creators',
    tagline: 'Aesthetic social handles',
    desc: 'Build a cohesive identity across Instagram, TikTok, and YouTube. Let the vibe do the talking.',
    tags: ['Username', 'Email', 'Domain'],
    examples: ['nova.ether', 'voidluna', 'bloom_kai'],
    tool: 'username',
    accent: '#a855f7',
    cta: 'Generate username',
  },
  {
    emoji: '💻',
    audience: 'Developers',
    tagline: 'GitHub-ready handles',
    desc: 'Craft a dev identity that reads well in package names, npm, and commit histories.',
    tags: ['Username', 'Domain'],
    examples: ['alexdev', 'kai.labs', 'neobyte'],
    tool: 'username',
    accent: '#06b6d4',
    cta: 'Generate handle',
  },
  {
    emoji: '🚀',
    audience: 'Startups',
    tagline: 'Brand name + domain',
    desc: 'Find a short, pronounceable, available brand name with the right TLD. .io, .ai, .co — your pick.',
    tags: ['Domain', 'Email'],
    examples: ['forge.io', 'launchco', 'sparkai.dev'],
    tool: 'domain',
    accent: '#f59e0b',
    cta: 'Generate domain',
  },
  {
    emoji: '🎓',
    audience: 'Students',
    tagline: 'Professional email identity',
    desc: 'A clean, professional email handle that works on CVs, LinkedIn, and cold emails.',
    tags: ['Email', 'Username'],
    examples: ['alex.ko@pm.me', 'nova@hey.com', 'kai.dev@proton'],
    tool: 'email',
    accent: '#10b981',
    cta: 'Generate email',
  },
];

export default function UseCases() {
  const [ref, visible] = useReveal(0.08);
  const { navigate } = useRouter();

  return (
    <section ref={ref} className={`uc-section reveal-section${visible ? ' revealed' : ''}`}>
      <div className="container">
        <div className="section-label">Use cases</div>
        <h2 className="section-title">Built for every identity need</h2>
        <p className="section-sub">Whether you're building a personal brand or launching a startup, CAUgen adapts to your context.</p>

        <div className="uc-grid">
          {CASES.map((c, i) => (
            <div
              key={c.audience}
              className="uc-card"
              style={{ '--uc-acc': c.accent, transitionDelay: `${i * 70}ms` }}
            >
              <div className="uc-card-top">
                <div className="uc-emoji">{c.emoji}</div>
                <div className="uc-tags">
                  {c.tags.map(t => (
                    <span key={t} className="uc-tag" style={{ color: c.accent, borderColor: `${c.accent}30`, background: `${c.accent}0e` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="uc-audience" style={{ color: c.accent }}>{c.audience}</div>
              <div className="uc-tagline">{c.tagline}</div>
              <div className="uc-desc">{c.desc}</div>

              {/* Example handles */}
              <div className="uc-examples">
                {c.examples.map(ex => (
                  <span key={ex} className="uc-example">{ex}</span>
                ))}
              </div>

              <button
                className="uc-cta"
                style={{ color: c.accent, borderColor: `${c.accent}35` }}
                onClick={() => navigate(c.tool)}
              >
                {c.cta}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 5 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
