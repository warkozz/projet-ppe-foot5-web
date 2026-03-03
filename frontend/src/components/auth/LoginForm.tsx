import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

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


  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.general && (
        <Alert variant="error">{errors.general}</Alert>
      )}

      <Input
        label="Nom d'utilisateur"
        id="username"
        name="username"
        type="text"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
        placeholder="votre_pseudo"
        autoComplete="username"
        disabled={isLoading}
      />

      <Input
        label="Mot de passe"
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="••••••••"
        autoComplete="current-password"
        disabled={isLoading}
      />

      <Button type="submit" variant="primary" size="lg" loading={isLoading} className="w-full mt-1">
        {isLoading ? 'Connexion…' : 'Se connecter'}
      </Button>

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