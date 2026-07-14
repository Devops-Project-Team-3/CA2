import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  getStoredAvatar,
  getStoredToken,
  getStoredUser
} from '../services/authService-Izzul.js';

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planner', label: 'Study Planner' },
  { to: '/ai-quiz', label: 'AI Quiz' },
  { to: '/notifications', label: 'Notifications' }
];

const avatarStyles = {
  blob: { face: '^_^', background: '#dbeafe', color: '#1d4ed8' },
  sprout: { face: 'o_o', background: '#dcfce7', color: '#166534' },
  star: { face: '*_*', background: '#fef3c7', color: '#92400e' },
  zap: { face: '>_<', background: '#ede9fe', color: '#5b21b6' },
  bookbug: { face: '@_@', background: '#fee2e2', color: '#991b1b' },
  loggedOut: { face: '-_-', background: '#e5e7eb', color: '#6b7280' }
};

const themeOrder = ['light', 'dark', 'cozy'];
const themeLabels = {
  cozy: 'Cozy',
  dark: 'Dark',
  light: 'Light'
};

function Navbar() {
  const [user, setUser] = useState(() => getStoredUser());
  const [avatarId, setAvatarId] = useState(() => getStoredAvatar());
  const [theme, setTheme] = useState(() => localStorage.getItem('studyspark_theme') || 'light');

  useEffect(() => {
    function syncProfileState() {
      setUser(getStoredUser());
      setAvatarId(getStoredAvatar());
    }

    window.addEventListener('storage', syncProfileState);
    window.addEventListener('studyspark-profile-updated', syncProfileState);

    return () => {
      window.removeEventListener('storage', syncProfileState);
      window.removeEventListener('studyspark-profile-updated', syncProfileState);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('studyspark_theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const currentIndex = themeOrder.indexOf(currentTheme);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % themeOrder.length;
      return themeOrder[nextIndex];
    });
  }

  const isLoggedIn = Boolean(getStoredToken() && user);
  const avatar = isLoggedIn
    ? avatarStyles[avatarId] || avatarStyles.blob
    : avatarStyles.loggedOut;

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <NavLink className="brand" to="/">
          StudySpark
        </NavLink>
        <div className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              to={link.to}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            to="/login"
          >
            Login
          </NavLink>
          <button
            aria-label="Switch color theme"
            className="theme-toggle"
            onClick={toggleTheme}
            type="button"
          >
            <span>{themeLabels[theme] || 'Light'}</span>
          </button>
          <NavLink
            className={({ isActive }) =>
              isActive ? 'profile-chip active-profile-chip' : 'profile-chip'
            }
            to="/profile"
          >
            <span
              className="profile-avatar"
              style={{ background: avatar.background, color: avatar.color }}
            >
              {avatar.face}
            </span>
            <span className="profile-chip-text">
              {isLoggedIn ? user.name.split(' ')[0] : 'Profile'}
            </span>
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
