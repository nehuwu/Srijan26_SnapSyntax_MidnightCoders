import { useState, useEffect, createContext, useContext } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import UsernamePage from './pages/UsernamePage';
import PasswordPage from './pages/PasswordPage';
import EmailPage from './pages/EmailPage';
import DomainPage from './pages/DomainPage';
import SavedPage from './pages/SavedPage';
import ProfilePage from './pages/ProfilePage';
import './index.css';

export const ThemeContext  = createContext({ theme:'dark', toggleTheme:()=>{} });
export const RouterContext = createContext({ route:'home', navigate:()=>{} });
export function useTheme()  { return useContext(ThemeContext);  }
export function useRouter() { return useContext(RouterContext); }

const ROUTES = ['home','username','password','email','domain','saved','profile'];

function parseHash() {
  // Support #route?query format
  const h = window.location.hash.replace('#','').split('?')[0];
  return ROUTES.includes(h) ? h : 'home';
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('caugen_theme') || 'dark');
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('caugen_theme', theme);
  }, [theme]);

  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = r => {
    window.location.hash = r;
    setRoute(r);
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const toggleTheme = () => setTheme(t => t==='dark' ? 'light' : 'dark');

  const pages = {
    home:     <HomePage />,
    username: <UsernamePage />,
    password: <PasswordPage />,
    email:    <EmailPage />,
    domain:   <DomainPage />,
    saved:    <SavedPage />,
    profile:  <ProfilePage />,
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <RouterContext.Provider value={{ route, navigate }}>
        <div className="app-root">
          <Navbar />
          <div className="page-wrapper">{pages[route] || pages.home}</div>
        </div>
      </RouterContext.Provider>
    </ThemeContext.Provider>
  );
}
