import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    console.log('Checking user with token:', token ? 'Token exists' : 'No token');
    
    if (token) {
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      try {
        const response = await api.get('/auth/me');
        console.log('User check response:', response.data);
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth check failed:', error.response?.data || error.message);
        localStorage.removeItem('token');
        delete api.defaults.headers.Authorization;
      }
    }
    
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt for:', email);
      console.log('API URL:', api.defaults.baseURL);
      
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(user);
        
        toast.success('Successfully logged in!');
        navigate('/dashboard');
        return response.data;
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      // Handle specific error cases
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to server. Make sure backend is running on port 5000');
      } else if (error.response?.status === 401) {
        toast.error('Invalid email or password');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found. Check backend routes');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
      
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Registration attempt for:', email);
      
      const response = await api.post('/auth/register', { name, email, password });
      
      console.log('Registration response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.Authorization = `Bearer ${token}`;
        setUser(user);
        
        toast.success('Registration successful!');
        navigate('/dashboard');
        return response.data;
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Registration failed');
      } else {
        toast.error('Registration failed. Please try again.');
      }
      
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.Authorization;
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};