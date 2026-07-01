import Navbar from '../components/Navbar.jsx';

function Layout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">{children}</main>
    </div>
  );
}

export default Layout;
