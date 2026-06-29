import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/'); setMenuOpen(false); };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-logo">
          <div className="logo-mark">M</div>
          <span>Mentora</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Müəllimlər</Link>
          <Link to="/how-it-works" className="nav-link">Necə işləyir</Link>
          <Link to="/billing" className="nav-link">Qiymətlər</Link>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm">Dashboard</Link>
              <Link to="/messages" className="btn btn-ghost btn-sm">Mesajlar</Link>
              <Link to="/me" className="nav-avatar" title={user.name}>
                {user.photo_url ? <img src={user.photo_url} alt="" /> : user.name?.[0]?.toUpperCase()}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Çıxış</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Daxil ol</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Qeydiyyat</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menyu">
          <span /><span /><span />
        </button>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)}>Müəllimlər tap</Link>
          <Link to="/billing" onClick={() => setMenuOpen(false)}>Qiymətlər</Link>
          {user ? (
            <>
              <Link to="/me" onClick={() => setMenuOpen(false)}>Profilim</Link>
              <Link to="/messages" onClick={() => setMenuOpen(false)}>Mesajlar</Link>
              <button onClick={handleLogout}>Çıxış et</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Daxil ol</Link>
              <Link to="/signup" onClick={() => setMenuOpen(false)}>Qeydiyyat</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .navbar {
          background: #fff; border-bottom: 1px solid var(--grey-200);
          position: sticky; top: 0; z-index: 100;
        }
        .navbar-inner { display: flex; align-items: center; height: 68px; gap: 32px; }
        .navbar-logo { display: flex; align-items: center; gap: 10px; font-size: 19px; font-weight: 800; color: var(--grey-900); text-decoration: none; }
        .logo-mark { width: 34px; height: 34px; border-radius: 9px; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 800; flex-shrink: 0; }
        .navbar-links { display: flex; gap: 4px; flex: 1; }
        .nav-link { padding: 8px 14px; border-radius: 8px; font-size: 14.5px; font-weight: 500; color: var(--grey-500); transition: all 0.15s; }
        .nav-link:hover, .nav-link.active { color: var(--grey-900); background: var(--grey-100); }
        .navbar-actions { display: flex; align-items: center; gap: 8px; }
        .nav-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--teal); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; overflow: hidden; }
        .nav-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; padding: 4px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: var(--grey-700); border-radius: 2px; }
        .mobile-menu { background: #fff; border-top: 1px solid var(--grey-200); padding: 16px; display: flex; flex-direction: column; gap: 4px; }
        .mobile-menu a, .mobile-menu button { display: block; padding: 12px 16px; border-radius: 8px; font-size: 15px; font-weight: 500; color: var(--grey-700); background: none; border: none; text-align: left; width: 100%; }
        .mobile-menu a:hover, .mobile-menu button:hover { background: var(--grey-100); }
        @media (max-width: 768px) {
          .navbar-links, .navbar-actions { display: none; }
          .hamburger { display: flex; margin-left: auto; }
        }
      `}</style>
    </nav>
  );
}
