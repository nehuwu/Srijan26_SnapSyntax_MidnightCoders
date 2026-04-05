import { useState, useEffect, useRef } from 'react';
import { generateUsernames } from '../../services/generator';

// Lightweight debounce
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

// Scroll-reveal hook
function useReveal(threshold = 0.15) {
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

const DEMO_NAMES = ['alex', 'nova', 'spark', 'kai'];
const DEMO_VIBES = ['cool', 'aesthetic', 'dark', 'pro'];

function SkeletonRow({ delay = 0 }) {
  return (
    <div className="lp-skeleton-row" style={{ animationDelay: `${delay}ms` }}>
      <div className="lp-skel lp-skel-rank" />
      <div className="lp-skel lp-skel-name" style={{ width: `${100 + Math.random() * 80}px` }} />
      <div className="lp-skel lp-skel-score" />
    </div>
  );
}

function PreviewRow({ result, idx }) {
  const isTop = idx === 0;
  return (
    <div
      className={`lp-row${isTop ? ' lp-row-top' : ''}`}
      style={{ animationDelay: `${idx * 55}ms` }}
    >
      <span className="lp-rank">
        {idx === 0
          ? <span className="lp-badge">TOP</span>
          : <span className="lp-rank-num">#{String(idx + 1).padStart(2, '0')}</span>}
      </span>
      <span className="lp-name">{result.username}</span>
      <span className="lp-pattern">{result.pattern}</span>
      <span className="lp-score">{result.score}pts</span>
    </div>
  );
}

export default function LivePreview({ inputValue }) {
  const [ref, visible] = useReveal(0.1);
  const debounced = useDebounce(inputValue, 320);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [demoIdx, setDemoIdx] = useState(0);

  // Cycle demo names when no input
  useEffect(() => {
    if (debounced.trim()) return;
    const t = setInterval(() => setDemoIdx(i => (i + 1) % DEMO_NAMES.length), 2800);
    return () => clearInterval(t);
  }, [debounced]);

  useEffect(() => {
    const name = debounced.trim() || DEMO_NAMES[demoIdx];
    if (!name) return;
    setLoading(true);
    // yield to browser paint before heavy compute
    const raf = requestAnimationFrame(() => {
      const r = generateUsernames(
        { name, interests: ['tech'], vibe: DEMO_VIBES[demoIdx % DEMO_VIBES.length] },
        0
      ).slice(0, 5);
      setResults(r);
      setLoading(false);
    });
    return () => cancelAnimationFrame(raf);
  }, [debounced, demoIdx]);

  return (
    <section ref={ref} className={`lp-section reveal-section${visible ? ' revealed' : ''}`}>
      <div className="lp-header">
        <div className="lp-label">
          <span className="lp-live-dot" />
          Live preview
        </div>
        <div className="lp-header-name">
          {inputValue.trim()
            ? <><span style={{ color: 'var(--acc)' }}>{inputValue}</span> · generating…</>
            : <>Previewing <span style={{ color: 'var(--acc)' }}>{DEMO_NAMES[demoIdx]}</span></>}
        </div>
      </div>

      <div className="lp-list">
        {loading
          ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} delay={i * 40} />)
          : results.map((r, i) => <PreviewRow key={r.username} result={r} idx={i} />)}
      </div>

      <div className="lp-footer-note">
        Results are ranked by name relevance, interest match, readability, and entropy.
      </div>
    </section>
  );
}
