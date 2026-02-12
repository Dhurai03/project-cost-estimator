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
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  CheckCircle as CheckCircleIcon,
  Google as GoogleIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { motion } from 'framer-motion';

const steps = ['Account Details', 'Personal Information', 'Complete'];

const validationSchema = yup.object({
  name: yup.string().required('Full name is required'),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // Mock registration for demo
  const mockRegister = async (values) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (values.email && values.password && values.name) {
          resolve({
            data: {
              message: 'Registration successful',
              user: {
                id: 1,
                name: values.name,
                email: values.email,
              }
            }
          });
        } else {
          reject({ response: { data: { message: 'Registration failed' } } });
        }
      }, 1000);
    });
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');
      
      try {
        const response = await mockRegister(values);
        setSuccess(response.data.message || 'Registration successful!');
        setActiveStep(2);
        
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
        setActiveStep(0);
      } finally {
        setLoading(false);
      }
    },
  });

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formik.values.password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const strengthColors = ['#f44336', '#ff9800', '#ffc107', '#4caf50', '#2e7d32'];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, #2A3B4C 0%, #1A2A3A 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        px: { xs: 2, sm: 3 }
      }}
    >
      <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1, px: { xs: 0, sm: 2 } }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper 
            elevation={24} 
            sx={{ 
              p: { xs: 3, sm: 4 }, 
              borderRadius: 4,
              backdropFilter: 'blur(10px)',
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              width: '100%'
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar 
                sx={{ 
                  bgcolor: '#EAB464', 
                  width: { xs: 50, sm: 60 }, 
                  height: { xs: 50, sm: 60 },
                  mb: 2,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                }}
              >
                <PersonAddIcon sx={{ fontSize: { xs: 24, sm: 30 }, color: '#2A3B4C' }} />
              </Avatar>
              <Typography 
                component="h1" 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: '#2A3B4C',
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
                }}
              >
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Join thousands of professionals using ProjectCostPro
              </Typography>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4, '& .MuiStepLabel-label': { fontSize: { xs: '0.7rem', sm: '0.875rem' } } }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                  }}
                  icon={<CheckCircleIcon />}
                >
                  {success} Redirecting to login...
                </Alert>
              </motion.div>
            )}

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Full Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                margin="normal"
                size={window.innerWidth < 600 ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
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
                      <EmailIcon color="action" />
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
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
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

              {formik.values.password && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                      Password Strength:
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: strengthColors[passwordStrength - 1] || 'text.secondary',
                        fontWeight: 600,
                        fontSize: { xs: '0.6rem', sm: '0.7rem' }
                      }}
                    >
                      {strengthLabels[passwordStrength - 1] || 'Too weak'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {[...Array(5)].map((_, index) => (
                      <Box
                        key={index}
                        sx={{
                          flex: 1,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: index < passwordStrength ? strengthColors[passwordStrength - 1] : 'rgba(0,0,0,0.1)',
                          transition: 'background-color 0.3s',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                margin="normal"
                size={window.innerWidth < 600 ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        size={window.innerWidth < 600 ? "small" : "medium"}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                disabled={loading || success}
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
                  },
                  '&:disabled': {
                    bgcolor: '#F5D7A1',
                  }
                }}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                  OR
                </Typography>
              </Divider>

              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GoogleIcon />}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                  sx={{ 
                    borderRadius: 2,
                    py: { xs: 1, sm: 1 },
                    borderColor: 'rgba(0,0,0,0.1)',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': {
                      borderColor: '#EAB464',
                      bgcolor: 'rgba(234, 180, 100, 0.04)'
                    }
                  }}
                >
                  Google
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHubIcon />}
                  size={window.innerWidth < 600 ? "small" : "medium"}
                  sx={{ 
                    borderRadius: 2,
                    py: { xs: 1, sm: 1 },
                    borderColor: 'rgba(0,0,0,0.1)',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    '&:hover': {
                      borderColor: '#EAB464',
                      bgcolor: 'rgba(234, 180, 100, 0.04)'
                    }
                  }}
                >
                  GitHub
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Already have an account?{' '}
                  <Link 
                    href="/login" 
                    variant="body2"
                    sx={{ 
                      color: '#EAB464',
                      fontWeight: 600,
                      textDecoration: 'none',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                By signing up, you agree to our{' '}
                <Link href="#" color="#EAB464" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>Terms of Service</Link>{' '}
                and{' '}
                <Link href="#" color="#EAB464" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>Privacy Policy</Link>
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                Demo: Use any details to register
              </Typography>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Register;