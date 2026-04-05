import { useRef, useEffect, useState } from 'react';

function useReveal(threshold = 0.12) {
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

const STEPS = [
  {
    num: '01',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    title: 'Input',
    desc: 'Drop your name, a phrase, or a brand word. That\'s the only thing we need.',
    accent: '#a855f7',
  },
  {
    num: '02',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: 'Generate',
    desc: 'Token engine builds variants. Pattern engine applies 22 templates across 220 candidates.',
    accent: '#06b6d4',
  },
  {
    num: '03',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    title: 'Rank',
    desc: 'Scoring engine weighs relevance, readability, length, vibe alignment, and entropy.',
    accent: '#10b981',
  },
  {
    num: '04',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: 'Use',
    desc: 'Copy, save, share. Availability checked against GitHub. Your identity, built.',
    accent: '#f59e0b',
  },
];

export default function HowItWorks() {
  const [ref, visible] = useReveal(0.1);

  return (
    <section ref={ref} className={`hiw-section reveal-section${visible ? ' revealed' : ''}`}>
      <div className="container">
        <div className="section-label">How it works</div>
        <h2 className="section-title">Four steps to your identity</h2>
        <p className="section-sub">From a single word to a ranked, available, shareable username — in under a second.</p>

        <div className="hiw-grid">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="hiw-card"
              style={{ '--step-acc': step.accent, transitionDelay: `${i * 80}ms` }}
            >
              {/* Connector line between cards */}
              {i < STEPS.length - 1 && <div className="hiw-connector" />}

              <div className="hiw-num" style={{ color: step.accent }}>{step.num}</div>
              <div className="hiw-icon-wrap" style={{ background: `${step.accent}18`, color: step.accent }}>
                {step.icon}
              </div>
              <div className="hiw-title">{step.title}</div>
              <div className="hiw-desc">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
