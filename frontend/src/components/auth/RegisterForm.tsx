import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { AxiosError } from 'axios';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
    }
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = (): boolean => {
    const newErrors = { username: '', email: '', password: '', confirmPassword: '', general: '' };

    if (!formData.username.trim()) {
      newErrors.username = "Le nom d'utilisateur est requis";
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Minimum 3 caractères';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Lettres, chiffres et _ uniquement';
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmez votre mot de passe';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(e => !e);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authAPI.register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      onSuccess?.();
    } catch (error) {
      let errorMessage = "Erreur lors de l'inscription";

      if (error instanceof AxiosError) {
        const detail = error.response?.data?.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          const fieldErrors: Record<string, string> = {};
          detail.forEach((err: any) => {
            if (err.loc && err.msg) {
              fieldErrors[err.loc[err.loc.length - 1]] = err.msg;
            }
          });
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(prev => ({ ...prev, ...fieldErrors }));
            setIsLoading(false);
            return;
          }
        } else if (error.response?.status === 409) {
          errorMessage = "Ce nom d'utilisateur ou cet email est déjà utilisé.";
        }
      }

      setErrors(prev => ({ ...prev, general: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-lg border bg-gray-50 text-gray-900 placeholder-gray-400
     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition
     ${hasError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <span>⚠️</span> {errors.general}
        </div>
      )}

      <div>
        <label htmlFor="r-username" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nom d'utilisateur
        </label>
        <input
          type="text"
          id="r-username"
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
        <label htmlFor="r-email" className="block text-sm font-medium text-gray-700 mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="r-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={inputClass(!!errors.email)}
          placeholder="votre@email.com"
          autoComplete="email"
          disabled={isLoading}
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="r-password" className="block text-sm font-medium text-gray-700 mb-1.5">
          Mot de passe
        </label>
        <input
          type="password"
          id="r-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={inputClass(!!errors.password)}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="r-confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
          Confirmer le mot de passe
        </label>
        <input
          type="password"
          id="r-confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={inputClass(!!errors.confirmPassword)}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={isLoading}
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-lg font-semibold text-white bg-brand-500 hover:bg-brand-600
                   focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                   disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Création...' : 'Créer mon compte'}
      </button>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-brand-500 hover:text-brand-600 font-semibold"
            disabled={isLoading}
          >
            Se connecter
          </button>
        </p>
      )}
    </form>
  );
};

export default RegisterForm;
