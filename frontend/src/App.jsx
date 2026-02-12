import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProjectForm from './components/ProjectForm';
import ProjectDetails from './components/ProjectDetails';
import PrivateRoute from './components/PrivateRoute';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>Something went wrong</h1>
          <p style={{ color: 'red' }}>{this.state.error?.toString()}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/project/new" element={
              <PrivateRoute>
                <ProjectForm />
              </PrivateRoute>
            } />
            <Route path="/project/:id" element={
              <PrivateRoute>
                <ProjectDetails />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;