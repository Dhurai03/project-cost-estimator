// frontend/src/components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('🔐 PrivateRoute - User:', user, 'Loading:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F15] light-theme:bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 light-theme:text-gray-600 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ User authenticated, rendering protected route');
  return children;
};

export default PrivateRoute;