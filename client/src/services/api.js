import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pedigree_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle expired tokens or 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or invalid
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        !currentPath.includes('/expert-system') &&
        !currentPath.includes('/about') &&
        currentPath !== '/'
      ) {
        localStorage.removeItem('pedigree_token');
        localStorage.removeItem('pedigree_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
