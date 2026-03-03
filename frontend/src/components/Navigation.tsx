import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Ne pas afficher la navigation sur la page de login
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-brand">
          <h2>Football 5v5 Manager</h2>
        </div>
        
        <div className="nav-content">
          <div className="nav-links">
            <button onClick={() => navigate('/dashboard')} className="nav-link">
              Dashboard
            </button>
          </div>
          
          <div className="nav-user">
            {isAuthenticated && user ? (
              <div className="user-info">
                <span className="connection-status">✅ Connecté</span>
                <span className="user-name">
                  {user.username}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  Se déconnecter
                </button>
              </div>
            ) : (
              <div className="user-info">
                <span className="connection-status">❌ Non connecté</span>
                <button onClick={() => navigate('/login')} className="login-btn">
                  Se connecter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;