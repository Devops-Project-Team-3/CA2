import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/planner', label: 'Study Planner' },
  { to: '/ai-quiz', label: 'AI Quiz' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/profile', label: 'Profile' },
  { to: '/login', label: 'Login' }
];

function Navbar() {
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
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
