import apiClient from './api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'seller' | 'buyer';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'seller' | 'buyer';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token?: string;
    message?: string;
  };
  message?: string;
  error?: string;
}

// Authentication API functions
export const authApi = {
  // Register new user
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },
};