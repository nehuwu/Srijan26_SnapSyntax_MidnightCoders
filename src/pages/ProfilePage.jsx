import { useRouter } from '../App';
import { MEM } from '../services/memory';

export default function ProfilePage() {
  const { navigate } = useRouter();
  const stats   = MEM.getStats();
  const history = MEM.getHistory();

  const PRO_FEATURES = [
    { icon: '⚡', title: 'Bulk Generation',    desc: 'Generate 200+ usernames at once with advanced filters and export to CSV.' },
    { icon: '🌐', title: 'Domain Checker',     desc: 'Check .com, .io, .co availability alongside social platforms.' },
    { icon: '🧠', title: 'ML Coolness Score',  desc: 'AI-powered ranking that learns from trending username patterns.' },
    { icon: '📦', title: 'Saved Collections',  desc: 'Organise saved items into named collections. Shareable links.' },
    { icon: '🎨', title: 'Brand Kit',          desc: 'Export colour palettes, logo concepts, and brand name ideas.' },
    { icon: '🔒', title: 'Premium Modes',      desc: 'Rare patterns, deeper entropy, and curated aesthetic presets.' },
  ];

  return (
    <div className="profile-page">
      <div className="container">

        <div className="tool-page-header">
          <button className="tool-page-back" onClick={() => navigate('home')}>← Back to home</button>
          <h1 className="tool-page-title">Profile</h1>
          <p className="tool-page-sub">Your session data and upgrade options</p>
        </div>

        <div className="profile-grid">

          {/* Left — profile card */}
          <div>
            <div className="profile-card">
              <div className="profile-avatar">👤</div>
              <div className="profile-name">Anonymous</div>
              <div className="profile-tier">
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--acc2)', display: 'inline-block' }} />
                Free tier
              </div>

              <div className="divider" />

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Saved',    val: stats.liked   },
                  { label: 'Sessions', val: stats.history },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'var(--surface2)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '1.4rem', color: 'var(--acc)' }}>{s.val}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <button className="pro-upgrade-btn">
                ✦ Upgrade to Pro
              </button>

              <div style={{ fontSize: '.72rem', color: 'var(--text3)', textAlign: 'center', marginTop: 10 }}>
                Coming soon · waitlist open
              </div>
            </div>

            {/* Recent history */}
            {history.length > 0 && (
              <div className="profile-card" style={{ marginTop: 16 }}>
                <div className="activity-title">Recent sessions</div>
                {history.slice(0,5).map((h, i) => (
                  <div key={i} className="activity-row">
                    <span className="activity-label">{h.name || '—'}</span>
                    <span className="activity-val">
                      {h.vibe || 'cool'}
                      {h.interests?.length > 0 && ` · ${h.interests[0]}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Pro features */}
          <div>
            <div style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              marginBottom: 16,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 24,
              }}>
                <span style={{ fontSize: '1.4rem' }}>✦</span>
                <div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)' }}>
                    CAUgen Pro
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text3)' }}>Everything you need to own your identity online</div>
                </div>
              </div>

              <div className="pro-features-list">
                {PRO_FEATURES.map(f => (
                  <div key={f.title} className="pro-feature">
                    <div className="pro-feature-icon">{f.icon}</div>
                    <div>
                      <div className="pro-feature-title">{f.title}</div>
                      <div className="pro-feature-text">{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="activity-card">
              <div className="activity-title">Quick actions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { label: 'Username Generator', route: 'username' },
                  { label: 'Password Generator', route: 'password' },
                  { label: 'Email Generator',    route: 'email'    },
                  { label: 'Saved items',         route: 'saved'    },
                ].map(a => (
                  <button
                    key={a.route}
                    className="btn-ghost"
                    onClick={() => navigate(a.route)}
                    style={{ fontSize: '.78rem' }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
