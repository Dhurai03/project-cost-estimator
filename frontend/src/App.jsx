import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { CocomoProvider } from './context/CocomoContext';
import PrivateRoute from './components/PrivateRoute';
import CocomoAnalysis from './pages/CocomoAnalysis';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FunctionPointAnalysis from './pages/FunctionPointAnalysis';
import AnalogyEstimation from './pages/AnalogyEstimation';
import History from './pages/History';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <DataProvider>
          <ThemeProvider>
            <CocomoProvider>
              <Toaster
                position="bottom-right"
                gutter={10}
                toastOptions={{
                  duration: 4000,
                  style: {
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: '500',
                    maxWidth: '360px',
                    animation: 'slideInRight 0.3s ease',
                  },
                  success: {
                    duration: 3500,
                    style: {
                      background: 'linear-gradient(135deg, #0f2117 0%, #0d1f16 100%)',
                      color: '#34d399',
                      border: '1px solid rgba(52,211,153,0.25)',
                      boxShadow: '0 4px 20px rgba(52,211,153,0.12)',
                    },
                    iconTheme: {
                      primary: '#34d399',
                      secondary: '#0d1f16',
                    },
                  },
                  error: {
                    duration: 4500,
                    style: {
                      background: 'linear-gradient(135deg, #1f0d0d 0%, #1a0c0c 100%)',
                      color: '#f87171',
                      border: '1px solid rgba(248,113,113,0.25)',
                      boxShadow: '0 4px 20px rgba(248,113,113,0.12)',
                    },
                    iconTheme: {
                      primary: '#f87171',
                      secondary: '#1f0d0d',
                    },
                  },
                  loading: {
                    style: {
                      background: 'linear-gradient(135deg, #0d1017 0%, #0b0f15 100%)',
                      color: '#a5b4fc',
                      border: '1px solid rgba(165,180,252,0.2)',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.12)',
                    },
                    iconTheme: {
                      primary: '#6366f1',
                      secondary: '#0d1017',
                    },
                  },
                }}
              />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/fpa" element={
                  <PrivateRoute>
                    <FunctionPointAnalysis />
                  </PrivateRoute>
                } />
                <Route path="/analogy" element={
                  <PrivateRoute>
                    <AnalogyEstimation />
                  </PrivateRoute>
                } />
                <Route path="/cocomo" element={
                  <PrivateRoute>
                    <CocomoAnalysis />
                  </PrivateRoute>
                } />
                <Route path="/history" element={
                  <PrivateRoute>
                    <History />
                  </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </CocomoProvider>
          </ThemeProvider>
        </DataProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;