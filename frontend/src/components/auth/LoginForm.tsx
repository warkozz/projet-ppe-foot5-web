import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister }) => {
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({ username: '', password: '', general: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = { username: '', password: '', general: '' };
    if (!formData.username.trim()) newErrors.username = "Le nom d'utilisateur est requis";
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await login({
        username: formData.username.trim(),
        password: formData.password,
      });
      if (result.success) {
        onSuccess?.();
      } else {
        setErrors(prev => ({ ...prev, general: result.error || 'Identifiants incorrects' }));
      }
    } catch {
      setErrors(prev => ({ ...prev, general: 'Erreur inattendue. Veuillez réessayer.' }));
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition
     ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.general && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span> {errors.general}
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom d'utilisateur
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={inputClass(!!errors.username)}
          placeholder="votre_pseudo"
          autoComplete="username"
          disabled={isLoading}
        />
        {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Mot de passe
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={inputClass(!!errors.password)}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={isLoading}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-brand-500 hover:bg-brand-600
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                   disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>

      {onSwitchToRegister && (
        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-brand-500 hover:text-brand-600 font-semibold"
            disabled={isLoading}
          >
            Créer un compte
          </button>
        </p>
      )}
    </form>
  );
};

export default LoginForm;