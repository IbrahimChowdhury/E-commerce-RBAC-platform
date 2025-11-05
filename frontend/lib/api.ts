import axios from 'axios';

// Base URL configuration pointing to Express server
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for JWT authentication
});

// Request interceptor to add auth token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (since cookies don't work cross-origin)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token) {
        // Add token to Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different types of errors with user-friendly messages
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expired or invalid - clear localStorage and redirect
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/auth/login';
          }
          error.message = 'Your session has expired. Please log in again.';
          break;
        case 403:
          error.message = 'You do not have permission to perform this action.';
          break;
        case 404:
          error.message = 'The requested resource was not found.';
          break;
        case 409:
          error.message = data?.message || 'This item already exists or conflicts with existing data.';
          break;
        case 422:
          error.message = data?.message || 'The provided data is invalid. Please check your input.';
          break;
        case 429:
          error.message = 'Too many requests. Please try again in a few minutes.';
          break;
        case 500:
          error.message = 'Server error. Please try again later or contact support.';
          break;
        case 502:
        case 503:
          error.message = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          error.message = data?.message || 'An unexpected error occurred. Please try again.';
      }
    } else if (error.request) {
      // Network error
      error.message = 'Network error. Please check your internet connection and try again.';
    } else {
      // Other error
      error.message = error.message || 'An unexpected error occurred.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;