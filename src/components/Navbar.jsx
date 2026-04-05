import { useTheme, useRouter } from '../App';

function MoonIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
}
function SunIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
}
function UserIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function BookmarkIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>;
}

const NAV_LINKS = [
  { id:'home',    label:'Home'  },
  { id:'saved',   label:'Saved', icon:<BookmarkIcon /> },
  { id:'profile', label:'Pro'   },
];

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { route, navigate }    = useRouter();

  return (
    <nav className="nav">
      <div className="nav-inner">

        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate('home')}>
          <div className="nav-logo-mark">CA</div>
          <span>CAU<span className="nav-logo-dot">g</span>en</span>
        </div>

        {/* Center links */}
        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <button key={l.id}
              className={`nav-link${route===l.id?' active':''}`}
              onClick={() => navigate(l.id)}>
              {l.label}
            </button>
          ))}
          <button className="nav-link" style={{opacity:.35,cursor:'not-allowed'}}>Blog</button>
          <button className="nav-link" style={{opacity:.35,cursor:'not-allowed'}}>About</button>
        </div>

        {/* Right actions */}
        <div className="nav-actions">
          <button className="nav-btn-icon" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            {theme==='dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="nav-btn-icon" onClick={() => navigate('profile')} title="Profile" aria-label="Profile">
            <UserIcon />
          </button>
          <button className="nav-pro-btn" onClick={() => navigate('profile')}>✦ Pro</button>
        </div>

      </div>
    </nav>
  );
}
