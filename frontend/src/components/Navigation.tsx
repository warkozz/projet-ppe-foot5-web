import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `relative text-sm font-medium transition-colors pb-0.5 ${
      isActive(path)
        ? 'text-brand-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-500 after:rounded-full'
        : 'text-gray-500 hover:text-gray-900'
    }`;

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-base leading-none">⚽</span>
            </div>
            <span className="font-bold text-gray-900 text-[15px] tracking-tight hidden sm:block">
              Football <span className="text-brand-500">5v5</span>
            </span>
          </Link>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-7">
            <Link to="/" className={navLinkClass('/')}>Accueil</Link>
            <Link to="/terrains" className={navLinkClass('/terrains')}>Nos terrains</Link>
            {isAuthenticated && (
              <Link to="/mon-espace" className={navLinkClass('/mon-espace')}>Mon espace</Link>
            )}
          </div>

          {/* Auth desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profil"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold group-hover:bg-brand-200 transition-colors">
                    {initials}
                  </div>
                  <span className="font-medium">{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                to="/connexion"
                className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-5 py-2 rounded-xl transition-colors font-semibold shadow-sm"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className={`w-5 h-0.5 bg-gray-700 transition-all mb-1.5 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-700 transition-all mt-1.5 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-1">
            {[
              { to: '/', label: 'Accueil' },
              { to: '/terrains', label: 'Nos terrains' },
              ...(isAuthenticated ? [{ to: '/mon-espace', label: 'Mon espace' }] : []),
              ...(isAuthenticated ? [{ to: '/profil', label: 'Mon profil' }] : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 mt-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Se déconnecter
                </button>
              ) : (
                <Link
                  to="/connexion"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 text-center transition-colors"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
