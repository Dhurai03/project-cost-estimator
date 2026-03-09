// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

console.log('🌐 API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000
});

// Request interceptor - add token to EVERY request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Token added to ${config.method.toUpperCase()} ${config.url}`);
    } else {
      console.log(`⚠️ No token for ${config.method.toUpperCase()} ${config.url}`);
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors gracefully
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, config } = error.response;

      // Handle 401 Unauthorized - but ONLY redirect if it's the /auth/me route
      // Background stat/data calls should fail silently
      if (status === 401) {
        const isAuthCheck = config?.url?.includes('/auth/me');
        if (isAuthCheck) {
          console.log('🔒 Auth check failed - clearing session');
          localStorage.removeItem('token');
          delete api.defaults.headers.Authorization;
          if (!window.location.pathname.includes('/login') &&
              !window.location.pathname.includes('/register')) {
            window.location.href = '/login';
          }
        }
        // For other 401s (background data fetches), just reject silently
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
    } else {
      console.error('⚙️ Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;