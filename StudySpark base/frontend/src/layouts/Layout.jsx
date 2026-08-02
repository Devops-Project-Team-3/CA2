import Navbar from '../components/Navbar.jsx';
import NotificationWatcher from '../components/NotificationWatcher.jsx';

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">{children}</main>
      <NotificationWatcher />
    </div>
  );
}

export default Layout;
