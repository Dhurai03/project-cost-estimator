import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper,
  Link,
  Alert,
  Avatar,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  LockOutlined as LockIcon,
  Email as EmailIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        // Mock login
        if (values.email && values.password) {
          localStorage.setItem('token', 'mock-token-' + Date.now());
          localStorage.setItem('user', JSON.stringify({
            id: 1,
            name: values.email.split('@')[0],
            email: values.email
          }));
          navigate('/dashboard');
        } else {
          throw new Error('Invalid credentials');
        }
      } catch (err) {
        setError('Login failed. Please check your credentials.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#2A3B4C',
      px: { xs: 2, sm: 3 }
    }}>
      <Container component="main" maxWidth="xs" sx={{ 
        px: { xs: 0, sm: 2 },
        width: '100%'
      }}>
        <Paper elevation={24} sx={{ 
          p: { xs: 3, sm: 4 }, 
          borderRadius: 4,
          width: '100%',
          mx: 'auto'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            mb: 3 
          }}>
            <Avatar sx={{ 
              bgcolor: '#EAB464', 
              width: { xs: 50, sm: 60 }, 
              height: { xs: 50, sm: 60 }, 
              mb: 2 
            }}>
              <LockIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: '#2A3B4C' }} />
            </Avatar>
            <Typography 
              component="h1" 
              variant="h4" 
              sx={{ 
                fontWeight: 700, 
                color: '#2A3B4C',
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              Welcome Back
            </Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email Address"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              size={window.innerWidth < 600 ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
            
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
              size={window.innerWidth < 600 ? "small" : "medium"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size={window.innerWidth < 600 ? "small" : "medium"}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ 
                mt: 3, 
                mb: 2,
                py: { xs: 1.2, sm: 1.5 },
                borderRadius: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                bgcolor: '#EAB464',
                color: '#2A3B4C',
                '&:hover': { 
                  bgcolor: '#C49A4C',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 20px rgba(234,180,100,0.4)'
                },
                '&:disabled': {
                  bgcolor: '#F5D7A1',
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link 
                href="/register" 
                variant="body2" 
                sx={{ 
                  color: '#EAB464',
                  fontWeight: 600,
                  textDecoration: 'none',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Don't have an account? Sign Up
              </Link>
            </Box>
          </form>
          
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
              Demo: Use any email and password to login
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;