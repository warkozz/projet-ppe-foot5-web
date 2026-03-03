import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { AxiosError } from 'axios';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  // État du formulaire
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  });

  // État des erreurs
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  // État de chargement
  const [isLoading, setIsLoading] = useState(false);

  // Gérer les changements dans les inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur quand l'utilisateur tape
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: '',
      }));
    }
  };

  // Validation email
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors = {
      username: '',
      email: '',
      full_name: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    // Validation nom d'utilisateur
    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username.trim())) {
      newErrors.username = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et _';
    }

    // Validation email
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!isValidEmail(formData.email.trim())) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    // Validation nom complet
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Le nom complet est requis';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Le nom complet doit contenir au moins 2 caractères';
    }

    // Validation mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
    }

    // Validation confirmation mot de passe
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => !error);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        password: formData.password,
      };

      await authAPI.register(userData);

      // Inscription réussie
      console.log('Inscription réussie');
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);

      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error instanceof AxiosError) {
        if (error.response?.data?.detail) {
          // Gérer les erreurs spécifiques de l'API
          const detail = error.response.data.detail;
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            // Erreurs de validation
            const fieldErrors: { [key: string]: string } = {};
            detail.forEach((err: any) => {
              if (err.loc && err.msg) {
                const field = err.loc[err.loc.length - 1];
                fieldErrors[field] = err.msg;
              }
            });
            
            if (Object.keys(fieldErrors).length > 0) {
              setErrors(prev => ({
                ...prev,
                ...fieldErrors,
              }));
              return;
            }
          }
        } else if (error.response?.status === 400) {
          errorMessage = 'Données invalides. Vérifiez vos informations.';
        } else if (error.response?.status === 409) {
          errorMessage = 'Ce nom d\'utilisateur ou email est déjà utilisé.';
        }
      }

      setErrors(prev => ({
        ...prev,
        general: errorMessage,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
          Créer un compte
        </h2>

        {/* Erreur générale */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Champ nom d'utilisateur */}
          <div className="mb-4">
            <label 
              htmlFor="username" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Nom d'utilisateur *
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.username ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Choisissez un nom d'utilisateur"
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Champ email */}
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="votre.email@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Champ nom complet */}
          <div className="mb-4">
            <label 
              htmlFor="full_name" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Nom complet *
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.full_name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Votre nom et prénom"
              disabled={isLoading}
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
            )}
          </div>

          {/* Champ mot de passe */}
          <div className="mb-4">
            <label 
              htmlFor="password" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Mot de passe *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Choisissez un mot de passe sécurisé"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Champ confirmation mot de passe */}
          <div className="mb-6">
            <label 
              htmlFor="confirmPassword" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Confirmer le mot de passe *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirmez votre mot de passe"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Bouton d'inscription */}
          <div className="mb-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 px-4 rounded-lg font-bold text-white transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:shadow-outline'
              }`}
            >
              {isLoading ? 'Inscription...' : 'Créer le compte'}
            </button>
          </div>

          {/* Lien vers la connexion */}
          {onSwitchToLogin && (
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-green-600 hover:text-green-800 font-semibold"
                  disabled={isLoading}
                >
                  Se connecter
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;