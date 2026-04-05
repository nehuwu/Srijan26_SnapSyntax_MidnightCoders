import { useState } from 'react';
import { useRouter } from '../App';
import HeroInput from '../components/ui/hero-input';
import LivePreview from '../components/ui/live-preview';
import HowItWorks from '../components/ui/how-it-works';
import SystemCards from '../components/ui/system-cards';
import UseCases from '../components/ui/use-cases';
import SavedStrip from '../components/ui/saved-strip';

// ─── Tool cards (kept + enhanced) ─────────────────────────────

const TOOLS = [
  {
    id: 'username', cls: 'tc-username', icon: '@',
    title: 'Username Generator',
    desc: 'Context-aware. 30 ranked results. GitHub availability per card.',
    preview: ['nova_void', 'alexneo', 'kai.labs'],
    accent: '#a855f7', cta: 'Generate →',
  },
  {
    id: 'password', cls: 'tc-password', icon: '⌘',
    title: 'Password Generator',
    desc: 'Memorable phrase-to-password or maximum-entropy random.',
    preview: ['MyCat@42spark!', 'R3d#Wave_99', 'Forge$01kai'],
    accent: '#10b981', cta: 'Generate →',
  },
  {
    id: 'email', cls: 'tc-email', icon: '✉',
    title: 'Email ID Generator',
    desc: 'Pattern-scored emails across Gmail, Proton, Outlook, and more.',
    preview: ['alex.dev@pm.me', 'nova@hey.com', 'kai.hq@proton'],
    accent: '#06b6d4', cta: 'Generate →',
  },
  {
    id: 'domain', cls: 'tc-brand', icon: '✦',
    title: 'Brand Name Generator',
    desc: 'Domain-ready names ranked by brandability — .com to .ai.',
    preview: ['getforge.io', 'sparkai.co', 'novahq.dev'],
    accent: '#f59e0b', cta: 'Generate →',
  },
];

function ToolCard({ t, i, navigate }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      className={`tool-card ${t.cls} hp-tool-card`}
      onClick={() => navigate(t.id)}
      style={{ animationDelay: `${i * 55}ms`, '--card-accent': t.accent }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="tool-card-icon">{t.icon}</div>
      <div className="tool-card-title">{t.title}</div>
      <div className="tool-card-desc">{t.desc}</div>

      {/* Mini preview examples */}
      <div className={`tc-preview${hovered ? ' tc-preview-show' : ''}`}>
        {t.preview.map(ex => (
          <span key={ex} className="tc-preview-item" style={{ fontFamily: 'var(--mono)', color: t.accent }}>
            {ex}
          </span>
        ))}
      </div>

      <div className="tool-card-cta" style={{ color: t.accent }}>
        {t.cta}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}

// ─── Scroll CTA arrow ─────────────────────────────────────────

function ScrollArrow() {
  return (
    <div className="hero-scroll-arrow" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function HomePage() {
  const { navigate } = useRouter();
  const [heroInput, setHeroInput] = useState('');

  return (
    <div className="hp-root">

      {/* ── 1. HERO ── full-viewport entry */}
      <section className="hp-hero">
        {/* Ambient grid overlay */}
        <div className="hp-grid-overlay" aria-hidden="true" />

        <div className="container hp-hero-inner">
          {/* Eyebrow */}
          <div className="hp-eyebrow">
            <span className="hp-eyebrow-dot" />
            Identity generation platform
          </div>

          {/* Headline */}
          <h1 className="hp-title">
            Your identity,<br />
            <span className="hp-title-acc">built in seconds</span>
          </h1>
          <p className="hp-subtitle">
            Drop a name or a phrase. Get usernames, emails, passwords, and domains — context-aware, ranked, available.
          </p>

          {/* Central input (passes value up for live preview) */}
          <HeroInputWrapper onInputChange={setHeroInput} />
        </div>

        <ScrollArrow />
      </section>

      {/* ── 2. LIVE PREVIEW ── */}
      <LivePreview inputValue={heroInput} />

      {/* ── 3. TOOL CARDS ── */}
      <section className="hp-tools-section">
        <div className="container">
          <div className="section-label">All tools</div>
          <h2 className="section-title">Everything you need</h2>
          <div className="tools-grid">
            {TOOLS.map((t, i) => (
              <ToolCard key={t.id} t={t} i={i} navigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. HOW IT WORKS ── */}
      <HowItWorks />

      {/* ── 5. SYSTEM EXPLANATION ── */}
      <SystemCards />

      {/* ── 6. USE CASES ── */}
      <UseCases />

      {/* ── 7. SAVED STRIP (conditional) ── */}
      <SavedStrip />

      {/* ── 8. FOOTER CTA ── */}
      <FooterCta navigate={navigate} />

    </div>
  );
}

// ─── Hero input wrapper — passes live value up ─────────────────

function HeroInputWrapper({ onInputChange }) {
  // Intercept typing for live preview without breaking HeroInput internals
  return (
    <div className="hp-hero-input-wrap" onInput={e => onInputChange(e.target.value || '')}>
      <HeroInput />
    </div>
  );
}

// ─── Footer CTA ───────────────────────────────────────────────

function FooterCta({ navigate }) {
  return (
    <section className="footer-cta-section">
      <div className="container footer-cta-inner">
        <div className="footer-cta-glow" aria-hidden="true" />
        <div className="section-label" style={{ justifyContent: 'center' }}>Ready?</div>
        <h2 className="footer-cta-title">
          Start building your<br />
          <span style={{ color: 'var(--acc)' }}>digital identity</span>
        </h2>
        <p className="footer-cta-sub">
          No account. No tracking. Everything stays on your device.
        </p>
        <div className="footer-cta-btns">
          <button className="gen-btn-main footer-btn-primary" onClick={() => navigate('username')}>
            Generate a username →
          </button>
          <button className="footer-btn-ghost" onClick={() => navigate('saved')}>
            Open saved
          </button>
        </div>
        <div className="footer-meta">
          <span>Open source friendly</span>
          <span className="footer-meta-dot">·</span>
          <span>No ads</span>
          <span className="footer-meta-dot">·</span>
          <span>localStorage only</span>
          <span className="footer-meta-dot">·</span>
          <span>Vercel hosted</span>
        </div>
      </div>
    </section>
  );
}
