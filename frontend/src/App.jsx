import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { CocomoProvider } from './context/CocomoContext'; // Keep this import
import PrivateRoute from './components/PrivateRoute';
import CocomoAnalysis from './pages/CocomoAnalysis';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEstimate from './pages/CreateEstimate';
import History from './pages/History';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <DataProvider>
          <ThemeProvider>
            {/* Add CocomoProvider here, inside other providers but before Routes */}
            <CocomoProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    theme: {
                      primary: 'green',
                      secondary: 'black',
                    },
                  },
                }}
              />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/create-estimate" element={<PrivateRoute><CreateEstimate /></PrivateRoute>} />
                <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
                <Route path="/cocomo" element={<PrivateRoute><CocomoAnalysis /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </CocomoProvider>
          </ThemeProvider>
        </DataProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;