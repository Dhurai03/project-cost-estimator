import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Chip,
  Avatar,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Divider,
  Stack
} from '@mui/material';
import {
  Add,
  Assessment,
  Logout,
  Person,
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  TrendingUp,
  AttachMoney,
  Category,
  Receipt,
  Download,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Timeline,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const COLORS = ['#4A9B9D', '#EAB464', '#E67A6D', '#B39BC8', '#A8D5BA', '#F5D7A1', '#9F7AEA', '#FBB6CE'];

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [projects, setProjects] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    setProjects(savedProjects);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = (projectId) => {
    const updatedProjects = projects.filter(p => p._id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const getCurrencySymbol = (currencyCode) => {
    const currencies = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
    };
    return currencies[currencyCode] || '$';
  };

  // Calculate dashboard metrics
  const totalProjects = projects.length;
  const totalCost = projects.reduce((sum, p) => sum + (p.totalCost || 0), 0);
  const avgProjectCost = totalProjects > 0 ? totalCost / totalProjects : 0;
  const totalDuration = projects.reduce((sum, p) => sum + (Number(p.duration) || 0), 0);

  // Calculate costs by category
  const totalLabor = projects.reduce((sum, p) => sum + (Number(p.laborCost) || 0), 0);
  const totalMaterial = projects.reduce((sum, p) => sum + (Number(p.materialCost) || 0), 0);
  const totalResource = projects.reduce((sum, p) => sum + (Number(p.resourceCost) || 0), 0);
  const totalMisc = projects.reduce((sum, p) => sum + (Number(p.miscellaneousCost) || 0), 0);

  // Mock growth percentages
  const projectGrowth = 12.5;
  const costGrowth = 8.3;
  const durationGrowth = -2.1;

  // Data for pie chart
  const costDistributionData = [
    { name: 'Labor', value: totalLabor, color: '#4A9B9D' },
    { name: 'Material', value: totalMaterial, color: '#EAB464' },
    { name: 'Resource', value: totalResource, color: '#E67A6D' },
    { name: 'Miscellaneous', value: totalMisc, color: '#B39BC8' },
  ].filter(item => item.value > 0);

  // Data for bar chart
  const topProjectsData = [...projects]
    .sort((a, b) => (b.totalCost || 0) - (a.totalCost || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.name.length > 12 ? p.name.substring(0, 10) + '...' : p.name,
      cost: p.totalCost || 0,
      currency: getCurrencySymbol(p.currency)
    }));

  // Data for category distribution
  const categoryData = [
    { name: 'Small (<$10k)', value: projects.filter(p => (p.totalCost || 0) < 10000).length, color: '#4A9B9D' },
    { name: 'Medium ($10k-$50k)', value: projects.filter(p => (p.totalCost || 0) >= 10000 && (p.totalCost || 0) < 50000).length, color: '#EAB464' },
    { name: 'Large ($50k-$100k)', value: projects.filter(p => (p.totalCost || 0) >= 50000 && (p.totalCost || 0) < 100000).length, color: '#E67A6D' },
    { name: 'Enterprise (>$100k)', value: projects.filter(p => (p.totalCost || 0) >= 100000).length, color: '#B39BC8' },
  ];

  // Mock timeline data
  const timelineData = [
    { month: 'Jan', cost: 45000, projects: 3 },
    { month: 'Feb', cost: 52000, projects: 4 },
    { month: 'Mar', cost: 48000, projects: 3 },
    { month: 'Apr', cost: 61000, projects: 5 },
    { month: 'May', cost: 55000, projects: 4 },
    { month: 'Jun', cost: 67000, projects: 6 },
    { month: 'Jul', cost: 72000, projects: 5 },
    { month: 'Aug', cost: 68000, projects: 6 },
    { month: 'Sep', cost: 79000, projects: 7 },
    { month: 'Oct', cost: 85000, projects: 8 },
    { month: 'Nov', cost: 82000, projects: 7 },
    { month: 'Dec', cost: 94000, projects: 9 },
  ];

  // Currency distribution data
  const currencyData = projects.reduce((acc, p) => {
    const currency = p.currency || 'USD';
    acc[currency] = (acc[currency] || 0) + 1;
    return acc;
  }, {});

  const currencyDistribution = Object.keys(currencyData).map((key, index) => ({
    name: key,
    value: currencyData[key],
    color: COLORS[index % COLORS.length]
  }));

  return (
    <Box sx={{ 
      flexGrow: 1, 
      bgcolor: '#F8FAFC', 
      minHeight: '100vh', 
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Modern App Bar - Fully Responsive */}
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(10px)',
          color: '#2A3B4C',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          <Toolbar disableGutters sx={{ 
            minHeight: { xs: 64, sm: 70 },
            justifyContent: 'space-between'
          }}>
            {/* Left Section - Logo & Home */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/')}
                sx={{ 
                  color: '#2A3B4C',
                  p: { xs: 1, sm: 1.5 },
                  mr: { xs: 0.5, sm: 1 },
                  '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
                }}
              >
                <HomeIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
              </IconButton>
              
              <DashboardIcon sx={{ 
                color: '#EAB464', 
                mr: 0.5, 
                fontSize: { xs: 20, sm: 24 } 
              }} />
              
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2A3B4C',
                  fontWeight: 700,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                ProjectCost
                <Box component="span" sx={{ color: '#EAB464', display: { xs: 'none', sm: 'inline' } }}>
                  Pro
                </Box>
              </Typography>
            </Box>

            {/* Center Section - Date & Time Range (Desktop only) */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: '#718096' }}>
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </Typography>
                <Chip 
                  label={timeRange === 'month' ? 'This Month' : 'This Year'} 
                  size="small"
                  onClick={() => setTimeRange(timeRange === 'month' ? 'year' : 'month')}
                  sx={{ 
                    bgcolor: 'rgba(234,180,100,0.1)',
                    color: '#2A3B4C',
                    fontWeight: 600,
                    '&:hover': { bgcolor: 'rgba(234,180,100,0.2)' }
                  }}
                />
              </Box>
            )}

            {/* Right Section - User Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isMobile && (
                <Typography variant="body2" sx={{ color: '#718096', mr: 2 }}>
                  {user.name || 'User'}
                </Typography>
              )}
              
              <IconButton onClick={handleMenu} sx={{ p: { xs: 0.5, sm: 1 } }}>
                <Avatar sx={{ 
                  bgcolor: '#EAB464', 
                  color: '#2A3B4C', 
                  width: { xs: 32, sm: 36, md: 40 }, 
                  height: { xs: 32, sm: 36, md: 40 },
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' }
                }}>
                  <Person sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    mt: 1,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                    minWidth: 200,
                    width: { xs: '90vw', sm: 250 },
                    maxWidth: 280
                  }
                }}
              >
                <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <Typography variant="subtitle2" sx={{ color: '#2A3B4C', fontWeight: 700, mb: 0.5 }}>
                    {user.name || 'Guest User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#718096', display: 'block', wordBreak: 'break-all' }}>
                    {user.email || 'guest@example.com'}
                  </Typography>
                </Box>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, px: 2.5 }}>
                  <Logout sx={{ mr: 1.5, color: '#F56565', fontSize: 20 }} /> 
                  <Typography color="#2A3B4C" fontWeight={500}>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content Container */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 }
        }}
      >
        {/* Header Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' }, 
          mb: { xs: 3, sm: 4 },
          gap: { xs: 2, sm: 3 }
        }}>
          <Box>
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 800, 
                color: '#2A3B4C',
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                letterSpacing: '-0.5px',
                lineHeight: 1.2
              }}
            >
              Dashboard
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#718096', 
                mt: 0.5,
                fontSize: { xs: '0.875rem', sm: '0.9rem' }
              }}
            >
              Welcome back! Here's your project overview
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            startIcon={<Add sx={{ fontSize: { xs: 18, sm: 20 } }} />}
            onClick={() => navigate('/project/new')}
            fullWidth={isMobile}
            sx={{
              bgcolor: '#EAB464',
              color: '#2A3B4C',
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, sm: 1.2, md: 1.4 },
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
              fontWeight: 700,
              whiteSpace: 'nowrap',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(234,180,100,0.25)',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { 
                bgcolor: '#C49A4C',
                transform: { sm: 'translateY(-2px)' },
                boxShadow: { sm: '0 8px 20px rgba(234,180,100,0.4)' }
              },
              transition: 'all 0.2s'
            }}
          >
            New Project Estimate
          </Button>
        </Box>

        {/* KPI Cards Row */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {/* Total Projects Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: { sm: 'translateY(-4px)' },
                boxShadow: { sm: '0 12px 40px rgba(0,0,0,0.08)' }
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                      Total Projects
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      color: '#2A3B4C', 
                      fontWeight: 800, 
                      fontSize: { xs: '1.75rem', sm: '1.8rem', md: '2rem' },
                      lineHeight: 1.2,
                      mb: 0.5
                    }}>
                      {totalProjects.toLocaleString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <ArrowUpward sx={{ color: '#48BB78', fontSize: { xs: 14, sm: 16 } }} />
                      <Typography variant="body2" sx={{ color: '#48BB78', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                        {projectGrowth}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#718096', fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>
                        vs last month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(74,155,157,0.1)', 
                    color: '#4A9B9D', 
                    width: { xs: 40, sm: 44, md: 48 }, 
                    height: { xs: 40, sm: 44, md: 48 } 
                  }}>
                    <Assessment sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ 
                    mt: { xs: 1.5, sm: 2 }, 
                    height: { xs: 3, sm: 4 }, 
                    borderRadius: 2,
                    bgcolor: 'rgba(74,155,157,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#4A9B9D', borderRadius: 2 }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Total Cost Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              '&:hover': {
                transform: { sm: 'translateY(-4px)' },
                boxShadow: { sm: '0 12px 40px rgba(0,0,0,0.08)' }
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                      Total Cost
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      color: '#2A3B4C', 
                      fontWeight: 800, 
                      fontSize: { xs: '1.75rem', sm: '1.8rem', md: '2rem' },
                      lineHeight: 1.2,
                      mb: 0.5
                    }}>
                      ${(totalCost / 1000).toFixed(1)}K
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <ArrowUpward sx={{ color: '#48BB78', fontSize: { xs: 14, sm: 16 } }} />
                      <Typography variant="body2" sx={{ color: '#48BB78', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                        {costGrowth}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#718096', fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>
                        vs last month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(234,180,100,0.1)', 
                    color: '#EAB464', 
                    width: { xs: 40, sm: 44, md: 48 }, 
                    height: { xs: 40, sm: 44, md: 48 } 
                  }}>
                    <AttachMoney sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={82} 
                  sx={{ 
                    mt: { xs: 1.5, sm: 2 }, 
                    height: { xs: 3, sm: 4 }, 
                    borderRadius: 2,
                    bgcolor: 'rgba(234,180,100,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#EAB464', borderRadius: 2 }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Average Project Cost Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              '&:hover': {
                transform: { sm: 'translateY(-4px)' },
                boxShadow: { sm: '0 12px 40px rgba(0,0,0,0.08)' }
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                      Average Project
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      color: '#2A3B4C', 
                      fontWeight: 800, 
                      fontSize: { xs: '1.75rem', sm: '1.8rem', md: '2rem' },
                      lineHeight: 1.2,
                      mb: 0.5
                    }}>
                      ${(avgProjectCost / 1000).toFixed(1)}K
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <ArrowDownward sx={{ color: '#F56565', fontSize: { xs: 14, sm: 16 } }} />
                      <Typography variant="body2" sx={{ color: '#F56565', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                        5.2%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#718096', fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>
                        vs last month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(230,122,109,0.1)', 
                    color: '#E67A6D', 
                    width: { xs: 40, sm: 44, md: 48 }, 
                    height: { xs: 40, sm: 44, md: 48 } 
                  }}>
                    <TrendingUp sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={45} 
                  sx={{ 
                    mt: { xs: 1.5, sm: 2 }, 
                    height: { xs: 3, sm: 4 }, 
                    borderRadius: 2,
                    bgcolor: 'rgba(230,122,109,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#E67A6D', borderRadius: 2 }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Total Duration Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              height: '100%',
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              '&:hover': {
                transform: { sm: 'translateY(-4px)' },
                boxShadow: { sm: '0 12px 40px rgba(0,0,0,0.08)' }
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: '#718096', fontWeight: 600, mb: 0.5, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                      Total Duration
                    </Typography>
                    <Typography variant="h3" sx={{ 
                      color: '#2A3B4C', 
                      fontWeight: 800, 
                      fontSize: { xs: '1.75rem', sm: '1.8rem', md: '2rem' },
                      lineHeight: 1.2,
                      mb: 0.5
                    }}>
                      {totalDuration.toLocaleString()}d
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                      <ArrowDownward sx={{ color: '#48BB78', fontSize: { xs: 14, sm: 16 } }} />
                      <Typography variant="body2" sx={{ color: '#48BB78', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' } }}>
                        {Math.abs(durationGrowth)}%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#718096', fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>
                        vs last month
                      </Typography>
                    </Box>
                  </Box>
                  <Avatar sx={{ 
                    bgcolor: 'rgba(179,155,200,0.1)', 
                    color: '#B39BC8', 
                    width: { xs: 40, sm: 44, md: 48 }, 
                    height: { xs: 40, sm: 44, md: 48 } 
                  }}>
                    <Timeline sx={{ fontSize: { xs: 20, sm: 22, md: 24 } }} />
                  </Avatar>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={38} 
                  sx={{ 
                    mt: { xs: 1.5, sm: 2 }, 
                    height: { xs: 3, sm: 4 }, 
                    borderRadius: 2,
                    bgcolor: 'rgba(179,155,200,0.1)',
                    '& .MuiLinearProgress-bar': { bgcolor: '#B39BC8', borderRadius: 2 }
                  }} 
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* First Row Charts - Responsive Grid */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {/* Cost Distribution Pie Chart */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h6" sx={{ 
                    color: '#2A3B4C', 
                    fontWeight: 700, 
                    fontSize: { xs: '1rem', sm: '1.1rem' } 
                  }}>
                    Cost Distribution
                  </Typography>
                  <Chip 
                    label="By category" 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(234,180,100,0.1)', 
                      color: '#2A3B4C', 
                      fontWeight: 600,
                      height: { xs: 24, sm: 28 },
                      fontSize: { xs: '0.65rem', sm: '0.75rem' }
                    }}
                  />
                </Box>
                
                {totalCost > 0 ? (
                  <>
                    <Box sx={{ height: { xs: 180, sm: 200, md: 220 }, width: '100%', mb: { xs: 1, sm: 2 } }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={costDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {costDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value) => [`$${value.toLocaleString()}`, 'Cost']}
                            contentStyle={{ 
                              borderRadius: 8, 
                              border: 'none', 
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              fontSize: '0.8rem'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr' },
                      gap: { xs: 1, sm: 1.5 },
                      mt: 1
                    }}>
                      {costDistributionData.map((item, index) => {
                        const percentage = totalCost > 0 ? ((item.value / totalCost) * 100).toFixed(1) : 0;
                        return (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: item.color, mr: 0.5 }} />
                            <Typography variant="caption" sx={{ color: '#4A5568', fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' } }}>
                              {item.name}: {percentage}%
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: { xs: 200, sm: 220, md: 250 } 
                  }}>
                    <PieChartIcon sx={{ fontSize: { xs: 50, sm: 60 }, color: '#EAB46420', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      No cost data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Top Projects Bar Chart */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h6" sx={{ 
                    color: '#2A3B4C', 
                    fontWeight: 700, 
                    fontSize: { xs: '1rem', sm: '1.1rem' } 
                  }}>
                    Top Projects
                  </Typography>
                  <Chip 
                    label="By cost" 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(234,180,100,0.1)', 
                      color: '#2A3B4C', 
                      fontWeight: 600,
                      height: { xs: 24, sm: 28 },
                      fontSize: { xs: '0.65rem', sm: '0.75rem' }
                    }}
                  />
                </Box>
                
                {topProjectsData.length > 0 ? (
                  <Box sx={{ height: { xs: 220, sm: 240, md: 260 } }}>
                    <ResponsiveContainer>
                      <BarChart data={topProjectsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={80} 
                          tick={{ fontSize: { xs: 10, sm: 11, md: 12 }, fill: '#4A5568' }} 
                        />
                        <RechartsTooltip 
                          formatter={(value, name, props) => [`${props.payload.currency}${value.toLocaleString()}`, 'Cost']}
                          contentStyle={{ 
                            borderRadius: 8, 
                            border: 'none', 
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            fontSize: '0.8rem'
                          }}
                        />
                        <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                          {topProjectsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: { xs: 200, sm: 220, md: 250 } 
                  }}>
                    <BarChartIcon sx={{ fontSize: { xs: 50, sm: 60 }, color: '#EAB46420', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      No projects yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Project Categories */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h6" sx={{ 
                    color: '#2A3B4C', 
                    fontWeight: 700, 
                    fontSize: { xs: '1rem', sm: '1.1rem' } 
                  }}>
                    Project Categories
                  </Typography>
                  <Chip 
                    label="By budget" 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(234,180,100,0.1)', 
                      color: '#2A3B4C', 
                      fontWeight: 600,
                      height: { xs: 24, sm: 28 },
                      fontSize: { xs: '0.65rem', sm: '0.75rem' }
                    }}
                  />
                </Box>
                
                {totalProjects > 0 ? (
                  <Box sx={{ mt: { xs: 1, sm: 1.5 } }}>
                    {categoryData.filter(c => c.value > 0).map((item, index) => {
                      const percentage = ((item.value / totalProjects) * 100).toFixed(1);
                      return (
                        <Box key={index} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                            <Typography variant="caption" sx={{ 
                              color: '#4A5568', 
                              fontWeight: 500,
                              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                            }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: '#2A3B4C', 
                              fontWeight: 600,
                              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                            }}>
                              {percentage}%
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={parseFloat(percentage)} 
                              sx={{ 
                                flex: 1,
                                height: { xs: 6, sm: 8 }, 
                                borderRadius: 4,
                                bgcolor: `${item.color}20`,
                                '& .MuiLinearProgress-bar': { 
                                  bgcolor: item.color,
                                  borderRadius: 4
                                }
                              }} 
                            />
                            <Typography variant="caption" sx={{ 
                              color: '#718096', 
                              ml: 1, 
                              minWidth: 30,
                              fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' }
                            }}>
                              {item.value}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: { xs: 180, sm: 200, md: 220 } 
                  }}>
                    <Category sx={{ fontSize: { xs: 50, sm: 60 }, color: '#EAB46420', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      No categories yet
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Second Row - Timeline and Currency Distribution */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
          {/* Project Timeline */}
          <Grid item xs={12} md={7}>
            <Card sx={{ 
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h6" sx={{ 
                    color: '#2A3B4C', 
                    fontWeight: 700, 
                    fontSize: { xs: '1rem', sm: '1.1rem' } 
                  }}>
                    Project Trends
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Chip 
                      label="Cost" 
                      size="small"
                      sx={{ 
                        bgcolor: '#EAB464', 
                        color: '#2A3B4C', 
                        fontWeight: 600,
                        height: { xs: 24, sm: 28 },
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    />
                    <Chip 
                      label="Volume" 
                      size="small"
                      sx={{ 
                        bgcolor: 'rgba(74,155,157,0.1)', 
                        color: '#4A9B9D', 
                        fontWeight: 600,
                        height: { xs: 24, sm: 28 },
                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                      }}
                    />
                  </Box>
                </Box>
                
                <Box sx={{ height: { xs: 200, sm: 220, md: 250 } }}>
                  <ResponsiveContainer>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: { xs: 10, sm: 11, md: 12 }, fill: '#718096' }} 
                        interval={isMobile ? 1 : 0}
                      />
                      <YAxis 
                        yAxisId="left" 
                        tick={{ fontSize: { xs: 10, sm: 11, md: 12 }, fill: '#718096' }} 
                        tickFormatter={(value) => `$${value/1000}K`}
                        width={40}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        tick={{ fontSize: { xs: 10, sm: 11, md: 12 }, fill: '#718096' }}
                        width={30}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          borderRadius: 8, 
                          border: 'none', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          fontSize: '0.8rem'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }} />
                      <Line yAxisId="left" type="monotone" dataKey="cost" stroke="#EAB464" strokeWidth={2.5} dot={{ fill: '#EAB464', r: 3 }} activeDot={{ r: 5 }} name="Cost ($)" />
                      <Line yAxisId="right" type="monotone" dataKey="projects" stroke="#4A9B9D" strokeWidth={2.5} dot={{ fill: '#4A9B9D', r: 3 }} activeDot={{ r: 5 }} name="Projects" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Currency Distribution */}
          <Grid item xs={12} md={5}>
            <Card sx={{ 
              borderRadius: { xs: '12px', sm: '16px' },
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              height: '100%'
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 2 } }}>
                  <Typography variant="h6" sx={{ 
                    color: '#2A3B4C', 
                    fontWeight: 700, 
                    fontSize: { xs: '1rem', sm: '1.1rem' } 
                  }}>
                    Currency Distribution
                  </Typography>
                  <Chip 
                    label="By projects" 
                    size="small"
                    sx={{ 
                      bgcolor: 'rgba(234,180,100,0.1)', 
                      color: '#2A3B4C', 
                      fontWeight: 600,
                      height: { xs: 24, sm: 28 },
                      fontSize: { xs: '0.65rem', sm: '0.75rem' }
                    }}
                  />
                </Box>
                
                {currencyDistribution.length > 0 ? (
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1, sm: 1.5 },
                    mt: { xs: 1, sm: 1.5 }
                  }}>
                    {currencyDistribution.map((item, index) => (
                      <Box key={index} sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pb: { xs: 0.8, sm: 1 },
                        borderBottom: index < currencyDistribution.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ 
                            width: { xs: 8, sm: 10 }, 
                            height: { xs: 8, sm: 10 }, 
                            borderRadius: '50%', 
                            bgcolor: item.color, 
                            mr: 1 
                          }} />
                          <Typography variant="body2" sx={{ 
                            color: '#2A3B4C', 
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' }
                          }}>
                            {item.name}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ 
                            color: '#2A3B4C', 
                            fontWeight: 700, 
                            mr: 1,
                            fontSize: { xs: '0.8rem', sm: '0.875rem', md: '0.9rem' }
                          }}>
                            {((item.value / totalProjects) * 100).toFixed(1)}%
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: '#718096',
                            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' }
                          }}>
                            ({item.value})
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: { xs: 150, sm: 180, md: 200 } 
                  }}>
                    <AttachMoney sx={{ fontSize: { xs: 50, sm: 60 }, color: '#EAB46420', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: '#718096', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      No currency data
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Projects Section */}
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: { xs: 2, sm: 2.5 },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography variant="h6" sx={{ 
              color: '#2A3B4C', 
              fontWeight: 700, 
              fontSize: { xs: '1rem', sm: '1.1rem' } 
            }}>
              Recent Projects
            </Typography>
            <Button 
              endIcon={<Download sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              size="small"
              sx={{ 
                color: '#2A3B4C', 
                fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
              }}
            >
              Export Report
            </Button>
          </Box>

          {projects.length === 0 ? (
            <Paper sx={{ 
              p: { xs: 3, sm: 4, md: 5 }, 
              textAlign: 'center', 
              bgcolor: 'white',
              borderRadius: { xs: '12px', sm: '16px' }
            }}>
              <Assessment sx={{ 
                fontSize: { xs: 40, sm: 48 }, 
                color: '#EAB464', 
                mb: { xs: 1.5, sm: 2 } 
              }} />
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' } }}>
                No Projects Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                Click "New Project Estimate" to create your first project
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/project/new')}
                sx={{
                  bgcolor: '#EAB464',
                  color: '#2A3B4C',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.8, sm: 1 },
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  '&:hover': { bgcolor: '#C49A4C' }
                }}
              >
                Create Your First Project
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {projects.slice(0, 6).map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card sx={{ 
                    height: '100%',
                    borderRadius: { xs: '12px', sm: '12px' },
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      transform: { sm: 'translateY(-4px)' },
                      boxShadow: { sm: '0 12px 40px rgba(0,0,0,0.08)' }
                    }
                  }}>
                    <CardContent sx={{ 
                      p: { xs: 2, sm: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                      height: '100%'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 700, 
                          color: '#2A3B4C',
                          fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                          lineHeight: 1.2,
                          flex: 1,
                          mr: 1
                        }}>
                          {project.name}
                        </Typography>
                        <Chip
                          label={project.currency || 'USD'}
                          size="small"
                          sx={{ 
                            bgcolor: '#EAB464', 
                            color: '#2A3B4C', 
                            fontWeight: 600,
                            fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' },
                            height: { xs: 20, sm: 22, md: 24 }
                          }}
                        />
                      </Box>
                      
                      <Typography variant="caption" sx={{ 
                        color: '#718096', 
                        display: 'block', 
                        mb: 1.5,
                        fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                        lineHeight: 1.4,
                        flex: '0 0 auto'
                      }}>
                        {project.description?.length > 40 
                          ? `${project.description.substring(0, 40)}...` 
                          : project.description}
                      </Typography>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mt: 'auto',
                        pt: 1,
                        borderTop: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Box>
                          <Typography variant="caption" sx={{ 
                            color: '#718096', 
                            display: 'block',
                            fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' }
                          }}>
                            Duration
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#2A3B4C', 
                            fontWeight: 600,
                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                          }}>
                            {project.duration}d
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" sx={{ 
                            color: '#718096', 
                            display: 'block',
                            fontSize: { xs: '0.6rem', sm: '0.65rem', md: '0.7rem' }
                          }}>
                            Total Cost
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: '#2A3B4C', 
                            fontWeight: 700,
                            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' }
                          }}>
                            {getCurrencySymbol(project.currency)}{project.totalCost?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: 1, 
                        mt: 1.5,
                        pt: 1,
                        borderTop: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <Button
                          size="small"
                          onClick={() => navigate(`/project/${project._id}`)}
                          sx={{ 
                            color: '#2A3B4C', 
                            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDelete(project._id)}
                          sx={{ 
                            color: '#F56565', 
                            fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.75rem' },
                            minWidth: 'auto',
                            px: 1,
                            py: 0.5,
                            '&:hover': { bgcolor: 'rgba(245,101,101,0.1)' }
                          }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;