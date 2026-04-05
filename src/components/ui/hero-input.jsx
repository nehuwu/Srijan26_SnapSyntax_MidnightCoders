import { useState, useCallback } from 'react';
import { useRouter } from '../../App';

const TABS = [
  {
    id: 'username',
    label: 'Username',
    icon: '@',
    placeholder: 'Enter your name…',
    hint: 'We generate 30 ranked usernames from it',
    accent: '#a855f7',
    example: 'e.g. alex, j.doe, nova',
  },
  {
    id: 'email',
    label: 'Email',
    icon: '✉',
    placeholder: 'Enter your name…',
    hint: 'We suggest emails across Gmail, Proton, and more',
    accent: '#06b6d4',
    example: 'e.g. alex, nova, spark',
  },
  {
    id: 'password',
    label: 'Password',
    icon: '⌘',
    placeholder: 'Enter a base phrase…',
    hint: 'We transform it into a memorable strong password',
    accent: '#10b981',
    example: 'e.g. my cat loves pizza',
  },
  {
    id: 'domain',
    label: 'Domain',
    icon: '✦',
    placeholder: 'Enter a brand word…',
    hint: 'We suggest .com, .io, .ai and more domains',
    accent: '#f59e0b',
    example: 'e.g. nova, spark, forge',
  },
];

// Encode prefill into URL-safe base64
function encodePrefill(data) {
  try { return btoa(JSON.stringify(data)); } catch { return ''; }
}

export default function HeroInput() {
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [value, setValue] = useState('');

  const tab = TABS[activeTab];

  const handleSubmit = useCallback(() => {
    const v = value.trim();
    if (!v) return;

    // Encode the prefill payload so target page can auto-fill + generate
    const payload = encodePrefill({
      name:        tab.id !== 'password' ? v : '',
      baseInput:   tab.id === 'password' ? v : '',
      prefilled:   true,
    });

    // Navigate with hash data
    window.location.hash = `${tab.id}?data=${payload}`;
    navigate(tab.id);
  }, [value, tab, navigate]);

  const handleKey = e => { if (e.key === 'Enter') handleSubmit(); };

  const handleTabChange = (i) => {
    setActiveTab(i);
    setValue('');
  };

  return (
    <div className="hero-input-wrap">
      {/* Tab strip */}
      <div className="hi-tabs" role="tablist">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={i === activeTab}
            className={`hi-tab${i === activeTab ? ' active' : ''}`}
            style={i === activeTab ? { '--tab-acc': t.accent } : {}}
            onClick={() => handleTabChange(i)}
          >
            <span className="hi-tab-icon">{t.icon}</span>
            <span className="hi-tab-label">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="hi-input-row" style={{ '--bar-acc': tab.accent }}>
        <div className="hi-input-icon" style={{ color: tab.accent }}>{tab.icon}</div>
        <input
          className="hi-input"
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          placeholder={tab.placeholder}
          autoComplete="off"
          spellCheck="false"
          aria-label={tab.placeholder}
        />
        <button
          className="hi-submit"
          style={{ background: `linear-gradient(135deg, ${tab.accent}, ${tab.accent}aa)` }}
          onClick={handleSubmit}
          disabled={!value.trim()}
          aria-label="Generate"
        >
          Generate
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Hint row */}
      <div className="hi-hint">
        <span style={{ color: 'var(--text3)' }}>{tab.hint}</span>
        <span className="hi-example">{tab.example}</span>
      </div>
    </div>
  );
}
