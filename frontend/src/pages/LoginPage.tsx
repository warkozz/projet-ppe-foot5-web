import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import Alert from '../components/ui/Alert';

type AuthMode = 'login' | 'register';

const LoginPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [sessionExpired, setSessionExpired] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/mon-espace';

  useEffect(() => {
    if (localStorage.getItem('session_expired')) {
      setSessionExpired(true);
      localStorage.removeItem('session_expired');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const handleLoginSuccess = () => navigate(from, { replace: true });

  const handleRegisterSuccess = () => {
    setRegisterSuccess(true);
    setAuthMode('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="py-6 px-4 text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-lg">⚽</span>
          </div>
          <span className="font-extrabold text-gray-900 text-lg tracking-tight">
            Football <span className="text-brand-500">5v5</span>
          </span>
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
              {authMode === 'login' ? 'Bon retour 👋' : 'Créer un compte'}
            </h1>
            <p className="text-sm text-gray-500">
              {authMode === 'login'
                ? 'Connectez-vous pour accéder à vos réservations'
                : 'Rejoignez-nous gratuitement pour réserver un terrain'}
            </p>
          </div>

          {/* Alerts */}
          {sessionExpired && (
            <div className="mb-5">
              <Alert variant="warning">
                Votre session a expiré. Reconnectez-vous pour continuer.
              </Alert>
            </div>
          )}
          {registerSuccess && (
            <div className="mb-5">
              <Alert variant="success">
                Compte créé avec succès ! Connectez-vous maintenant.
              </Alert>
            </div>
          )}

          {/* Main card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex p-1.5 gap-1.5 border-b border-gray-100 bg-gray-50">
              {(['login', 'register'] as AuthMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    authMode === mode
                      ? 'bg-white text-brand-600 shadow-sm border border-gray-100'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {mode === 'login' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
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

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-6">
            En continuant, vous acceptez nos{' '}
            <span className="underline cursor-default">conditions d'utilisation</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;