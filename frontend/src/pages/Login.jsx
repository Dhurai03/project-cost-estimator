// frontend/src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    console.log('📝 Submitting login form...');
    
    try {
      await login(formData.email, formData.password);
      // Don't navigate here - let the auth context handle it
    } catch (error) {
      console.error('❌ Login error in component:', error);
      // Error is already handled in auth context
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials for testing
  const fillDemoCredentials = () => {
    setFormData({
      email: 'demo@example.com',
      password: 'password123'
    });
  };

  return (
    <div className="min-h-screen light-theme flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Demo button for testing */}
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="mb-4 text-xs text-indigo-600 hover:text-indigo-700"
        >
          Use Demo Credentials
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold light-text-primary mb-1.5">
            Welcome back
          </h1>
          <p className="text-sm light-text-secondary">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="light-label">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="light-input-border-bottom"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="light-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="light-input-border-bottom"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="light-checkbox"
                disabled={loading}
              />
              <span className="text-xs text-gray-600">Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="light-btn-primary"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-8 text-xs text-center light-text-muted">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;