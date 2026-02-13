import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

console.log('API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 10000
});

// Request interceptor - add timestamp to prevent caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add timestamp to GET requests to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now() // This makes every request unique
      };
    }
    
    console.log(`🚀 ${config.method.toUpperCase()} request to: ${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from: ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      return Promise.reject({ message: 'Request timeout. Please try again.' });
    }
    
    if (error.response) {
      console.error('❌ Error response:', {
        status: error.response.status,
        data: error.response.data
      });
      
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        delete api.defaults.headers.Authorization;
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;