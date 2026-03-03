import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

type AuthMode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Gérer le succès de la connexion
  const handleLoginSuccess = () => {
    console.log('Connexion réussie, redirection vers dashboard...');
    navigate('/dashboard', { replace: true });
  };

  // Gérer le succès de l'inscription
  const handleRegisterSuccess = () => {
    console.log('Inscription réussie, basculer vers connexion...');
    setAuthMode('login');
    // Optionnel: afficher un message de succès
    alert('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
  };

  // Basculer entre login et register
  const switchToRegister = () => {
    setAuthMode('register');
  };

  const switchToLogin = () => {
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header de la page */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            ⚽ Football Manager 5v5
          </h1>
          <p className="text-gray-600 text-lg">
            Réservez votre terrain de football
          </p>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Onglets de navigation */}
        <div className="bg-white rounded-t-lg shadow-md">
          <div className="flex">
            <button
              onClick={switchToLogin}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-tl-lg transition-colors ${
                authMode === 'login'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={switchToRegister}
              className={`flex-1 py-3 px-4 text-center font-medium rounded-tr-lg transition-colors ${
                authMode === 'register'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inscription
            </button>
          </div>
        </div>

        {/* Formulaires */}
        <div className="bg-white shadow-md rounded-b-lg">
          {authMode === 'login' ? (
            <div className="p-6">
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={switchToRegister}
              />
            </div>
          ) : (
            <div className="p-6">
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={switchToLogin}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm">
          © 2026 Football Manager 5v5 - Système de réservation de terrains
        </p>
        <p className="text-gray-400 text-xs mt-2">
          Backend API: {process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}
          {' | '}
          <a href="/test-db" className="text-blue-500 hover:text-blue-700">
            🧪 Test DB
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;