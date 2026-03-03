import axios, { AxiosResponse } from 'axios';

// Configuration de base de l'API
const API_BASE_URL = 'http://localhost:8000/api';

// Instance Axios configurée
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT automatiquement
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré, rediriger vers login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types de base pour les réponses API
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Services API
export const authAPI = {
  login: (credentials: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
    // Convertir en form-data pour OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    return apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
    
  register: (userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<AxiosResponse<any>> =>
    apiClient.post('/auth/register', userData),
    
  getProfile: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/auth/me'),
};

export const terrainsAPI = {
  getAll: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/terrains'),
    
  getById: (id: number): Promise<AxiosResponse<any>> =>
    apiClient.get(`/terrains/${id}`),

  getAvailability: (terrain_id: number, date: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/terrains/availability/terrain/${terrain_id}?date=${date}`),

  getSlots: (terrain_id: number, date: string): Promise<AxiosResponse<any>> =>
    apiClient.get(`/reservations/availability/slots/${terrain_id}?date=${date}`),
};

export const reservationAPI = {
  getMine: (): Promise<AxiosResponse<any[]>> =>
    apiClient.get('/reservations'),
    
  getById: (id: number): Promise<AxiosResponse<any>> =>
    apiClient.get(`/reservations/${id}`),
    
  create: (data: { terrain_id: number; start: string; end: string; notes?: string }): Promise<AxiosResponse<any>> =>
    apiClient.post('/reservations', data),
    
  cancel: (id: number): Promise<AxiosResponse<any>> =>
    apiClient.delete(`/reservations/${id}`),
};