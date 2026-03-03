import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { AxiosError } from 'axios';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.general && (
        <Alert variant="error">{errors.general}</Alert>
      )}

      <Input
        label="Nom d'utilisateur"
        id="r-username"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="votre_pseudo"
        autoComplete="username"
        disabled={isLoading}
        hint="Lettres, chiffres et _ uniquement (min. 3 caractères)"
      />

      <Input
        label="Email"
        id="r-email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="votre@email.com"
        autoComplete="email"
        disabled={isLoading}
      />

      <Input
        label="Mot de passe"
        id="r-password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="new-password"
        disabled={isLoading}
        hint="Minimum 6 caractères"
      />

      <Input
        label="Confirmer le mot de passe"
        id="r-confirmPassword"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        placeholder="••••••••"
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-1">
        {isLoading ? 'Création…' : 'Créer mon compte'}
      </Button>

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
