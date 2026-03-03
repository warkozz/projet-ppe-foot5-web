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
    `text-[13px] font-extrabold uppercase tracking-wider transition-colors ${
      isActive(path) ? 'text-brand-500' : 'text-gray-900 hover:text-brand-500'
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-white border-b-2 border-brand-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-[64px] gap-10">

          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/logo5V5.png"
              alt="Five V Five"
              className="h-14 w-auto object-contain"
            />
          </Link>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-8 flex-1">
            <Link to="/terrains" className={navLinkClass('/terrains')}>Nos terrains</Link>
            {isAuthenticated && (
              <Link to="/mon-espace" className={navLinkClass('/mon-espace')}>Mon espace</Link>
            )}
          </div>

          {/* Auth desktop — séparés par un trait vertical */}
          <div className="hidden md:flex items-stretch h-full ml-auto">
            {/* CTA Réserver */}
            <Link
              to={isAuthenticated ? '/reserver' : '/connexion'}
              className="flex items-center px-6 border-l border-gray-200 text-[13px] font-extrabold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 transition-colors"
            >
              Je réserve
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  to="/profil"
                  className="flex items-center px-6 border-l border-gray-200 text-[13px] font-extrabold uppercase tracking-wider text-gray-900 hover:text-brand-500 hover:bg-gray-50 transition-colors"
                >
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-6 border-l border-gray-200 text-[13px] font-extrabold uppercase tracking-wider text-gray-900 hover:text-brand-500 hover:bg-gray-50 transition-colors"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="flex items-center px-6 border-l border-gray-200 text-[13px] font-extrabold uppercase tracking-wider text-gray-900 hover:text-brand-500 hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/connexion?tab=register"
                  className="flex items-center px-6 border-l border-gray-200 text-[13px] font-extrabold uppercase tracking-wider text-gray-900 hover:text-brand-500 hover:bg-gray-50 transition-colors"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <div className={`w-5 h-0.5 bg-gray-900 transition-all mb-1.5 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-900 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-5 h-0.5 bg-gray-900 transition-all mt-1.5 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
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
                className={`block px-4 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wider transition-colors ${
                  isActive(to)
                    ? 'bg-brand-50 text-brand-500'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-brand-500'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-100 mt-2 space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wider text-red-500 hover:bg-red-50 transition-colors"
                >
                  Déconnexion
                </button>
              ) : (
                <>
                  <Link
                    to="/connexion"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-wider text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/connexion?tab=register"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-sm font-extrabold uppercase tracking-wider text-white bg-brand-500 hover:bg-brand-600 text-center transition-colors"
                  >
                    Inscription
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
