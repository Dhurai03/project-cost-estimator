import { useState } from 'react';
import { Link } from 'react-router-dom';
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(formData.email, formData.password);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast('Google sign in coming soon!', {
      icon: '🔜'
    });
  };

  return (
    <div className="min-h-screen light-theme flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* InsideBox Label */}
        <div className="mb-8">
          <span className="text-xs font-semibold text-gray-400 tracking-[0.2em] uppercase">
            InsideBox
          </span>
        </div>

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold light-text-primary mb-1.5">
            Please enter your details
          </h1>
          <p className="text-sm light-text-secondary">
            Welcome back
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="light-label">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="light-input-border-bottom"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="light-label">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="light-input-border-bottom"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="light-checkbox"
              />
              <span className="text-xs text-gray-600">
                Remember for 30 days
              </span>
            </label>
            
            <button
              type="button"
              onClick={() => toast('Password reset coming soon!', { icon: '🔜' })}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              Forgot password
            </button>
          </div>

          {/* Sign In Button */}
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

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="light-btn-google"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </button>
        </form>

        {/* Sign Up Link */}
        <p className="mt-8 text-xs text-center light-text-muted">
          Don't have an account?{' '}
          <Link 
            to="/register" 
            className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;