import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, LoginRequest, LoginResponse } from '../services/api';
import { AxiosError } from 'axios';

// Types pour le contexte d'authentification
interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook pour utiliser le contexte d'authentification
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          // Vérifier si le token est toujours valide
          const response = await authAPI.getProfile();
          const userFromApi = response.data;
          setUser(userFromApi);
          
          // Mettre à jour les données locales si nécessaire
          localStorage.setItem('user_data', JSON.stringify(userFromApi));
        } catch (error) {
          // Token invalide, nettoyer le localStorage
          console.error('Token invalid, clearing auth data:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Fonction de connexion
  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await authAPI.login(credentials);
      const loginData: LoginResponse = response.data;
      
      // Stocker le token et les données utilisateur
      localStorage.setItem('access_token', loginData.access_token);
      localStorage.setItem('user_data', JSON.stringify(loginData.user));
      
      setUser(loginData.user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Erreur de connexion';
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          errorMessage = 'Identifiants incorrects';
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  // Rafraîchir le profil utilisateur
  const refreshProfile = async (): Promise<void> => {
    try {
      const response = await authAPI.getProfile();
      const userData = response.data;
      
      setUser(userData);
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Si erreur, déconnecter l'utilisateur
      logout();
    }
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;