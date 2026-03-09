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

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}`);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('🔒 401 Unauthorized - redirecting to login');
        localStorage.removeItem('token');
        delete api.defaults.headers.Authorization;
        
        // Only redirect if not on login page
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
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