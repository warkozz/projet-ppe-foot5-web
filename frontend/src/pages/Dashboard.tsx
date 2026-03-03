import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Rediriger vers login si pas connecté
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Afficher loading pendant vérification
  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="welcome-section">
          <h1>Bienvenue, {user?.username}! 👋</h1>
          <p className="welcome-text">
            Vous êtes connecté au système de gestion Football 5v5
          </p>
        </div>

        <div className="user-details-card">
          <h2>Vos informations</h2>
          <div className="user-details">
            <div className="detail-item">
              <strong>Nom d'utilisateur:</strong>
              <span>{user?.username}</span>
            </div>
            <div className="detail-item">
              <strong>Email:</strong>
              <span>{user?.email}</span>
            </div>
            <div className="detail-item">
              <strong>Rôle:</strong>
              <span>{user?.role || 'user'}</span>
            </div>
            <div className="detail-item">
              <strong>ID Utilisateur:</strong>
              <span>#{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="action-cards">
          <div className="action-card">
            <h3>🏟️ Terrains</h3>
            <p>Gérer les terrains de football 5v5</p>
            <button className="action-btn">Voir les terrains</button>
          </div>
          
          <div className="action-card">
            <h3>📅 Réservations</h3>
            <p>Gérer vos réservations</p>
            <button className="action-btn">Mes réservations</button>
          </div>
          
          <div className="action-card">
            <h3>🔧 Test DB</h3>
            <p>Tester la connexion à la base de données</p>
            <button className="action-btn" onClick={() => window.open('/test-db', '_blank')}>
              Ouvrir Test DB
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;