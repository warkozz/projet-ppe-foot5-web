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
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <span>⚽</span>
            <span className="text-brand-400">Football 5v5</span>
          </Link>

          {/* Liens publics */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-brand-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Accueil
            </Link>
            <Link
              to="/terrains"
              className={`text-sm font-medium transition-colors ${
                isActive('/terrains') ? 'text-brand-400' : 'text-gray-300 hover:text-white'
              }`}
            >
              Nos terrains
            </Link>

            {/* Liens connectés */}
            {isAuthenticated && (
              <Link
                to="/mon-espace"
                className={`text-sm font-medium transition-colors ${
                  isActive('/mon-espace') ? 'text-brand-400' : 'text-gray-300 hover:text-white'
                }`}
              >
                Mon espace
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-gray-400">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <Link
                to="/connexion"
                className="text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Burger mobile */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white mb-1"></div>
            <div className="w-5 h-0.5 bg-white"></div>
          </button>
        </div>

        {/* Menu mobile */}
        {menuOpen && (
          <div className="md:hidden py-3 border-t border-gray-700 space-y-2">
            <Link to="/" className="block py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Accueil</Link>
            <Link to="/terrains" className="block py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Nos terrains</Link>
            {isAuthenticated && <Link to="/mon-espace" className="block py-2 text-sm text-gray-300 hover:text-white" onClick={() => setMenuOpen(false)}>Mon espace</Link>}
            {isAuthenticated
              ? <button onClick={handleLogout} className="block py-2 text-sm text-red-400">Se déconnecter</button>
              : <Link to="/connexion" className="block py-2 text-sm text-brand-400" onClick={() => setMenuOpen(false)}>Connexion</Link>
            }
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
