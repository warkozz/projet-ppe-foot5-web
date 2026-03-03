import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

type AuthMode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Page d'origine avant redirection vers /connexion
  const from = (location.state as any)?.from?.pathname || '/mon-espace';

  useEffect(() => {
    // Détecter si la session a expiré (flag posé par l'intercepteur Axios)
    if (localStorage.getItem('session_expired')) {
      setSessionExpired(true);
      localStorage.removeItem('session_expired');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = () => {
    navigate(from, { replace: true });
  };

  const handleRegisterSuccess = () => {
    setRegisterSuccess(true);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ⚽ <span className="text-brand-500">Football 5v5</span>
          </h1>
          <p className="text-gray-500">Réservez votre terrain en ligne</p>
        </div>

        {/* Banière session expirée */}
        {sessionExpired && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
            <span>⏱️</span>
            <span>Votre session a expiré. Reconnectez-vous pour continuer.</span>
          </div>
        )}

        {/* Banière inscription réussie */}
        {registerSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm flex items-center gap-2">
            <span>✅</span>
            <span>Compte créé avec succès ! Connectez-vous maintenant.</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                authMode === 'login'
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                authMode === 'register'
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Inscription
            </button>
          </div>

          <div className="p-6">
            {authMode === 'login' ? (
              <LoginForm
                onSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;