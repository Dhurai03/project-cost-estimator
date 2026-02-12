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
  Divider,
  Card,
  CardContent,
  Slider,
  InputAdornment,
  Chip,
  LinearProgress,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  ArrowBack, 
  Calculate, 
  Home, 
  PieChart as PieChartIcon,
  PictureAsPdf,
  AttachMoney,
  Timeline,
  Category,
  Engineering,
  Inventory,
  Receipt
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

const COLORS = ['#4A9B9D', '#EAB464', '#E67A6D', '#B39BC8'];

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

const ProjectForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(null);
  const [chartData, setChartData] = useState([]);

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
        
        const newProject = {
          ...values,
          _id: Date.now().toString(),
          totalCost,
          createdAt: new Date().toISOString(),
          laborCost: Number(values.laborCost),
          materialCost: Number(values.materialCost),
          resourceCost: Number(values.resourceCost),
          miscellaneousCost: Number(values.miscellaneousCost),
        };

        const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        localStorage.setItem('projects', JSON.stringify([...existingProjects, newProject]));
        
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to create project');
      }
    },
  });

  // Update chart data whenever costs change
  useEffect(() => {
    const labor = Number(formik.values.laborCost) || 0;
    const material = Number(formik.values.materialCost) || 0;
    const resource = Number(formik.values.resourceCost) || 0;
    const misc = Number(formik.values.miscellaneousCost) || 0;
    const total = labor + material + resource + misc;

    const newChartData = [
      { name: 'Labor', value: labor, color: COLORS[0] },
      { name: 'Material', value: material, color: COLORS[1] },
      { name: 'Resource', value: resource, color: COLORS[2] },
      { name: 'Miscellaneous', value: misc, color: COLORS[3] },
    ].filter(item => item.value > 0);

    setChartData(newChartData);
  }, [formik.values.laborCost, formik.values.materialCost, formik.values.resourceCost, formik.values.miscellaneousCost]);

  const calculateTotalCost = () => {
    return Number(formik.values.laborCost || 0) + 
           Number(formik.values.materialCost || 0) + 
           Number(formik.values.resourceCost || 0) + 
           Number(formik.values.miscellaneousCost || 0);
  };

  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formik.values.currency);
    return currency?.symbol || '$';
  };

  const totalCost = calculateTotalCost();

  // Generate PDF Report
  const generatePDF = async () => {
    const input = document.getElementById('project-form-content');
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;

    pdf.addImage(imgData, 'PNG', (pdfWidth - width) / 2, 20, width, height);
    
    // Add footer
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pdfHeight - 20);
    pdf.text('ProjectCostPro - Professional Cost Estimation Tool', pdfWidth - 200, pdfHeight - 20);
    
    pdf.save(`${formik.values.name || 'project'}-estimate.pdf`);
  };

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* Modern Navbar */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
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
              color: '#2A3B4C',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Calculate sx={{ color: '#EAB464' }} />
            Create New Project
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Generate PDF Report">
              <IconButton
                onClick={generatePDF}
                sx={{ 
                  color: '#2A3B4C',
                  '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
                }}
              >
                <PictureAsPdf />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Go to Home">
              <IconButton
                onClick={() => navigate('/')}
                sx={{ 
                  color: '#2A3B4C',
                  '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
                }}
              >
                <Home />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }} id="project-form-content">
        <Grid container spacing={4}>
          {/* Left Column - Form */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                bgcolor: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                height: '100%'
              }}
            >
              <Typography 
                variant="h5" 
                gutterBottom 
                sx={{ 
                  color: '#2A3B4C', 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Category sx={{ color: '#EAB464' }} />
                Project Details
              </Typography>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
                      variant="outlined"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category sx={{ color: '#EAB464' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#EAB464',
                          },
                          '&.Mui-focused fieldset': {
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Timeline sx={{ color: '#EAB464' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#EAB464',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#EAB464',
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Currency</InputLabel>
                      <Select
                        id="currency"
                        name="currency"
                        value={formik.values.currency}
                        label="Currency"
                        onChange={formik.handleChange}
                        sx={{
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#EAB464',
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#EAB464',
                          },
                        }}
                      >
                        {currencies.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ fontWeight: 600 }}>{currency.symbol}</Typography>
                              <Typography>{currency.code} - {currency.name}</Typography>
                            </Box>
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
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#EAB464',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#EAB464',
                          },
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Chip 
                        label="Cost Breakdown" 
                        sx={{ 
                          bgcolor: '#EAB464', 
                          color: '#2A3B4C',
                          fontWeight: 600,
                          px: 2
                        }} 
                      />
                    </Divider>
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Engineering sx={{ color: COLORS[0] }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {getCurrencySymbol()}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: COLORS[0],
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Inventory sx={{ color: COLORS[1] }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {getCurrencySymbol()}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: COLORS[1],
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Category sx={{ color: COLORS[2] }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {getCurrencySymbol()}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: COLORS[2],
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
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Receipt sx={{ color: COLORS[3] }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {getCurrencySymbol()}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: COLORS[3],
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
                        bgcolor: 'linear-gradient(135deg, #EAB464 0%, #C49A4C 100%)',
                        color: '#2A3B4C',
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(234,180,100,0.3)',
                        mt: 2
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.5 }}>
                            Total Estimated Cost
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1 }}>
                            {getCurrencySymbol()}{totalCost.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                            Including all cost components
                          </Typography>
                        </Box>
                        <Fab 
                          size="medium" 
                          sx={{ 
                            bgcolor: 'white', 
                            color: '#2A3B4C',
                            '&:hover': { bgcolor: '#F8FAFC' }
                          }}
                        >
                          <AttachMoney />
                        </Fab>
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/dashboard')}
                        sx={{ 
                          color: '#2A3B4C', 
                          borderColor: '#2A3B4C',
                          borderRadius: 2,
                          px: 4,
                          py: 1.2,
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
                        startIcon={<Calculate />}
                        sx={{
                          bgcolor: '#EAB464',
                          color: '#2A3B4C',
                          borderRadius: 2,
                          px: 4,
                          py: 1.2,
                          fontWeight: 600,
                          '&:hover': { 
                            bgcolor: '#C49A4C',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 20px rgba(234,180,100,0.4)'
                          }
                        }}
                      >
                        Create Project
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>

          {/* Right Column - Live Pie Chart & Summary */}
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: 4,
                bgcolor: 'white',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  color: '#2A3B4C', 
                  fontWeight: 700, 
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PieChartIcon sx={{ color: '#EAB464' }} />
                Live Cost Distribution
              </Typography>

              {totalCost > 0 ? (
                <>
                  <Box sx={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          onMouseEnter={onPieEnter}
                          onMouseLeave={onPieLeave}
                          animationBegin={0}
                          animationDuration={500}
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color}
                              stroke={activeIndex === index ? '#fff' : 'none'}
                              strokeWidth={activeIndex === index ? 2 : 0}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => [`${getCurrencySymbol()}${value.toLocaleString()}`, 'Cost']}
                          contentStyle={{
                            borderRadius: 8,
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value, entry) => (
                            <span style={{ color: '#4A5568', fontSize: '0.875rem' }}>
                              {value} ({getCurrencySymbol()}{entry.payload?.value?.toLocaleString()})
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>

                  <Box sx={{ mt: 3, p: 3, bgcolor: '#F8FAFC', borderRadius: 3 }}>
                    <Typography variant="subtitle2" sx={{ color: '#718096', mb: 2 }}>
                      Cost Summary
                    </Typography>
                    {chartData.map((item, index) => {
                      const percentage = ((item.value / totalCost) * 100).toFixed(1);
                      return (
                        <Box key={index} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" sx={{ color: '#2A3B4C', fontWeight: 600 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#2A3B4C' }}>
                              {getCurrencySymbol()}{item.value.toLocaleString()} ({percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={parseFloat(percentage)} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: `${item.color}20`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: item.color,
                                borderRadius: 3
                              }
                            }} 
                          />
                        </Box>
                      );
                    })}
                  </Box>
                </>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 400,
                    textAlign: 'center'
                  }}
                >
                  <PieChartIcon sx={{ fontSize: 80, color: '#EAB46420', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#2A3B4C', fontWeight: 600, mb: 1 }}>
                    No Data Yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#718096' }}>
                    Enter cost values to see the live pie chart visualization
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProjectForm;