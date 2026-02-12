import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Divider
} from '@mui/material';
import { ArrowBack, Save, Edit, Home } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const validationSchema = yup.object({
  name: yup.string().required('Project name is required'),
  duration: yup.number().positive().required('Duration is required'),
  description: yup.string().required('Description is required'),
  laborCost: yup.number().min(0).required('Labor cost is required'),
  materialCost: yup.number().min(0).required('Material cost is required'),
  resourceCost: yup.number().min(0).required('Resource cost is required'),
  miscellaneousCost: yup.number().min(0).required('Miscellaneous cost is required'),
  currency: yup.string().required('Currency is required'),
});

const ProjectDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      duration: '',
      description: '',
      laborCost: '',
      materialCost: '',
      resourceCost: '',
      miscellaneousCost: '',
      currency: 'USD',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const totalCost = Number(values.laborCost || 0) + 
                         Number(values.materialCost || 0) + 
                         Number(values.resourceCost || 0) + 
                         Number(values.miscellaneousCost || 0);
        
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const updatedProjects = projects.map(p => 
          p._id === id ? { ...p, ...values, totalCost } : p
        );
        localStorage.setItem('projects', JSON.stringify(updatedProjects));
        
        setSuccess('Project updated successfully!');
        setIsEditing(false);
      } catch (err) {
        setError('Failed to update project');
      }
    },
  });

  useEffect(() => {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p._id === id);
    
    if (project) {
      formik.setValues({
        name: project.name,
        duration: project.duration,
        description: project.description,
        laborCost: project.laborCost,
        materialCost: project.materialCost,
        resourceCost: project.resourceCost,
        miscellaneousCost: project.miscellaneousCost,
        currency: project.currency || 'USD',
      });
    }
  }, [id]);

  const calculateTotalCost = (values) => {
    return Number(values.laborCost || 0) + 
           Number(values.materialCost || 0) + 
           Number(values.resourceCost || 0) + 
           Number(values.miscellaneousCost || 0);
  };

  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formik.values.currency);
    return currency?.symbol || '$';
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Improved Navbar Design */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          color: '#2A3B4C',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate('/dashboard')}
            sx={{ 
              mr: 2,
              color: '#2A3B4C',
              '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
            }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              color: '#2A3B4C'
            }}
          >
            {isEditing ? 'Edit Project' : 'Project Details'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={() => navigate('/')}
              sx={{ 
                color: '#2A3B4C',
                '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
              }}
              title="Go to Home"
            >
              <Home />
            </IconButton>
            
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                sx={{ 
                  color: '#2A3B4C',
                  borderColor: '#2A3B4C',
                  '&:hover': { 
                    borderColor: '#EAB464',
                    bgcolor: 'rgba(234,180,100,0.05)'
                  }
                }}
              >
                Edit
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Project Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  disabled={!isEditing}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#EAB464',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="duration"
                  name="duration"
                  label="Duration (days)"
                  type="number"
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                  error={formik.touched.duration && Boolean(formik.errors.duration)}
                  helperText={formik.touched.duration && formik.errors.duration}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#EAB464',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={!isEditing}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    id="currency"
                    name="currency"
                    value={formik.values.currency}
                    label="Currency"
                    onChange={formik.handleChange}
                    sx={{
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#EAB464',
                      },
                    }}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.symbol} - {currency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Project Description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#EAB464',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ color: '#2A3B4C', fontWeight: 600 }}>
                  Cost Breakdown ({getCurrencySymbol()})
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="laborCost"
                  name="laborCost"
                  label="Labor Cost"
                  type="number"
                  value={formik.values.laborCost}
                  onChange={formik.handleChange}
                  error={formik.touched.laborCost && Boolean(formik.errors.laborCost)}
                  helperText={formik.touched.laborCost && formik.errors.laborCost}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#EAB464',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="materialCost"
                  name="materialCost"
                  label="Material Cost"
                  type="number"
                  value={formik.values.materialCost}
                  onChange={formik.handleChange}
                  error={formik.touched.materialCost && Boolean(formik.errors.materialCost)}
                  helperText={formik.touched.materialCost && formik.errors.materialCost}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#EAB464',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="resourceCost"
                  name="resourceCost"
                  label="Resource Cost"
                  type="number"
                  value={formik.values.resourceCost}
                  onChange={formik.handleChange}
                  error={formik.touched.resourceCost && Boolean(formik.errors.resourceCost)}
                  helperText={formik.touched.resourceCost && formik.errors.resourceCost}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#EAB464',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="miscellaneousCost"
                  name="miscellaneousCost"
                  label="Miscellaneous Cost"
                  type="number"
                  value={formik.values.miscellaneousCost}
                  onChange={formik.handleChange}
                  error={formik.touched.miscellaneousCost && Boolean(formik.errors.miscellaneousCost)}
                  helperText={formik.touched.miscellaneousCost && formik.errors.miscellaneousCost}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#EAB464',
                      },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: '#EAB464',
                    color: '#2A3B4C',
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(234,180,100,0.25)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Total Estimated Cost:
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {getCurrencySymbol()}{calculateTotalCost(formik.values).toLocaleString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {isEditing && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
                        const project = projects.find(p => p._id === id);
                        if (project) {
                          formik.setValues(project);
                        }
                      }}
                      sx={{ 
                        color: '#2A3B4C', 
                        borderColor: '#2A3B4C',
                        '&:hover': { 
                          borderColor: '#EAB464',
                          bgcolor: 'rgba(234,180,100,0.05)'
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<Save />}
                      sx={{
                        bgcolor: '#EAB464',
                        color: '#2A3B4C',
                        '&:hover': { 
                          bgcolor: '#C49A4C',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(234,180,100,0.4)'
                        }
                      }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProjectDetails;