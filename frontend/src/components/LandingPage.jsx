import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  Grid, 
  Card, 
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  Paper,
  Divider,
  Chip,
  Stack
} from '@mui/material';
import { 
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  Security as SecurityIcon,
  Menu as MenuIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  CloudDone as CloudDoneIcon,
  Timeline as TimelineIcon,
  Group as GroupIcon,
  Storage as StorageIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  CompareArrows as CompareArrowsIcon,
  AttachMoney as AttachMoneyIcon,
  Receipt as ReceiptIcon,
  Dashboard as DashboardIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  InsertChart as InsertChartIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Enhanced features with more details
  const coreFeatures = [
    {
      icon: <CalculateIcon sx={{ fontSize: 40 }} />,
      title: 'Smart Cost Input',
      description: 'Intelligent forms for labor, materials, resources, and miscellaneous expenses with auto-validation',
      color: '#4A9B9D',
      benefits: ['Real-time validation', 'Bulk import', 'Template saving']
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: 'Real-time Calculations',
      description: 'Instant cost breakdowns with automatic total calculations and tax adjustments',
      color: '#EAB464',
      benefits: ['Auto tax calculation', 'Discount handling', 'Instant updates']
    },
    {
      icon: <CurrencyExchangeIcon sx={{ fontSize: 40 }} />,
      title: 'Multi-Currency Support',
      description: 'Support for 15+ currencies with live exchange rates and automatic conversion',
      color: '#E67A6D',
      benefits: ['Live exchange rates', 'Historical rates', 'Currency favorites']
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, secure cloud backup, and role-based access control',
      color: '#B39BC8',
      benefits: ['256-bit encryption', '2FA support', 'Access control']
    }
  ];

  const additionalFeatures = [
    {
      icon: <DashboardIcon sx={{ fontSize: 32 }} />,
      title: 'Interactive Dashboard',
      description: 'Customizable dashboard with real-time project overview and quick actions'
    },
    {
      icon: <BarChartIcon sx={{ fontSize: 32 }} />,
      title: 'Advanced Analytics',
      description: 'Deep insights with predictive analytics and cost forecasting'
    },
    {
      icon: <TimelineIcon sx={{ fontSize: 32 }} />,
      title: 'Project Timeline',
      description: 'Visual timeline tracking with milestone management'
    },
    {
      icon: <GroupIcon sx={{ fontSize: 32 }} />,
      title: 'Team Collaboration',
      description: 'Real-time collaboration with team members and stakeholders'
    },
    {
      icon: <CompareArrowsIcon sx={{ fontSize: 32 }} />,
      title: 'Cost Comparison',
      description: 'Compare costs across multiple projects and scenarios'
    },
    {
      icon: <HistoryIcon sx={{ fontSize: 32 }} />,
      title: 'Version History',
      description: 'Track changes with complete version history and restore options'
    },
    {
      icon: <DownloadIcon sx={{ fontSize: 32 }} />,
      title: 'Export Reports',
      description: 'Export detailed reports in PDF, Excel, CSV formats'
    },
    {
      icon: <ShareIcon sx={{ fontSize: 32 }} />,
      title: 'Easy Sharing',
      description: 'Share projects with clients and team members via secure links'
    },
    {
      icon: <NotificationsIcon sx={{ fontSize: 32 }} />,
      title: 'Smart Alerts',
      description: 'Get notified about budget overruns and project milestones'
    },
    {
      icon: <ReceiptIcon sx={{ fontSize: 32 }} />,
      title: 'Invoice Generation',
      description: 'Generate professional invoices directly from cost estimates'
    },
    {
      icon: <StorageIcon sx={{ fontSize: 32 }} />,
      title: 'Cloud Storage',
      description: 'Secure cloud storage with 10GB free space for documents'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 32 }} />,
      title: 'ROI Analysis',
      description: 'Calculate and track return on investment for projects'
    }
  ];

  const stats = [
    { value: '500+', label: 'Active Users', icon: <GroupIcon />, color: '#4A9B9D' },
    { value: '1000+', label: 'Projects Completed', icon: <CheckCircleIcon />, color: '#EAB464' },
    { value: '95%', label: 'Accuracy Rate', icon: <AnalyticsIcon />, color: '#E67A6D' },
    { value: '24/7', label: 'Customer Support', icon: <NotificationsIcon />, color: '#B39BC8' },
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['3 active projects', 'Basic cost calculation', '5MB storage', 'Email support'],
      buttonText: 'Get Started',
      buttonVariant: 'outlined'
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per month',
      features: ['Unlimited projects', 'Advanced analytics', '10GB storage', 'Priority support', 'Multi-currency', 'Export reports'],
      buttonText: 'Start Free Trial',
      buttonVariant: 'contained',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
      buttonText: 'Contact Sales',
      buttonVariant: 'outlined'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Project Manager, TechCorp',
      content: 'This tool has revolutionized how we estimate project costs. Saved us 40% time on budgeting.',
      avatar: 'SJ',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Construction Director, BuildIt',
      content: 'The multi-currency feature is a game-changer for our international projects. Highly recommended!',
      avatar: 'MC',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Freelance Designer',
      content: 'Perfect for freelancers. Easy to use and the invoice generation saves me hours of work.',
      avatar: 'ER',
      rating: 5
    }
  ];

  const drawer = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
        <Typography variant="h6" sx={{ color: '#2A3B4C', fontWeight: 700 }}>
          <Box component="span" sx={{ color: '#EAB464' }}>Project</Box>CostPro
        </Typography>
      </Box>
      <List>
        <ListItem button onClick={() => navigate('/login')}>
          <ListItemIcon><LoginIcon sx={{ color: '#2A3B4C' }} /></ListItemIcon>
          <ListItemText primary="Login" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItem>
        <ListItem button onClick={() => navigate('/register')}>
          <ListItemIcon><PersonAddIcon sx={{ color: '#2A3B4C' }} /></ListItemIcon>
          <ListItemText primary="Register" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      flexGrow: 1, 
      bgcolor: '#F8FAFC', 
      minHeight: '100vh',
      width: '100%',
      overflowX: 'hidden'
    }}>
      {/* Navigation Bar */}
      <AppBar position="fixed" elevation={0} sx={{ 
        bgcolor: 'rgba(255,255,255,0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)'
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ 
            justifyContent: 'space-between',
            px: { xs: 1, sm: 2, md: 0 }
          }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#2A3B4C',
                  fontWeight: 800,
                  fontSize: { xs: '1.2rem', sm: '1.3rem', md: '1.5rem' },
                  letterSpacing: '-0.5px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Box component="span" sx={{ color: '#EAB464' }}>P</Box>
                roject
                <Box component="span" sx={{ color: '#EAB464' }}>C</Box>
                ostPro
              </Typography>
            </motion.div>
            
            {isMobile ? (
              <>
                <IconButton onClick={handleDrawerToggle} sx={{ color: '#2A3B4C' }}>
                  <MenuIcon />
                </IconButton>
                <Drawer 
                  anchor="right" 
                  open={mobileOpen} 
                  onClose={handleDrawerToggle}
                  PaperProps={{ 
                    sx: { 
                      width: { xs: '85%', sm: 320 },
                      borderRadius: '16px 0 0 16px'
                    } 
                  }}
                >
                  {drawer}
                </Drawer>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/login')}
                  sx={{ 
                    color: '#2A3B4C',
                    fontWeight: 600,
                    px: 2,
                    '&:hover': { bgcolor: 'rgba(234,180,100,0.1)' }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/register')}
                  sx={{ 
                    bgcolor: '#EAB464',
                    color: '#2A3B4C',
                    fontWeight: 600,
                    px: 3,
                    whiteSpace: 'nowrap',
                    '&:hover': { 
                      bgcolor: '#C49A4C',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(234,180,100,0.3)'
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
   {/* Hero Section - FIXED BUTTON ALIGNMENT */}
<Container maxWidth="xl" sx={{ 
  pt: { xs: 10, sm: 12, md: 15 }, 
  pb: { xs: 6, md: 10 },
  px: { xs: 2, sm: 3, md: 4 }
}}>
  <Grid 
    container 
    spacing={{ xs: 4, md: 6 }} 
    alignItems="center"
    direction={{ xs: 'column-reverse', md: 'row' }}
  >
    <Grid item xs={12} md={6}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Chip 
          label="⚡ Trusted by 500+ companies"
          sx={{ 
            bgcolor: 'rgba(234,180,100,0.1)',
            color: '#2A3B4C',
            fontWeight: 600,
            mb: 3,
            borderRadius: '20px',
            height: 32,
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        />
        
        <Typography 
          variant="h1" 
          sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '3.5rem' },
            fontWeight: 800,
            color: '#2A3B4C',
            lineHeight: 1.2,
            mb: 2
          }}
        >
          Estimate Projects with{' '}
          <Box 
            component="span" 
            sx={{ 
              color: '#EAB464',
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 5,
                left: 0,
                width: '100%',
                height: '8px',
                bgcolor: 'rgba(234,180,100,0.2)',
                zIndex: -1
              }
            }}
          >
            Confidence
          </Box>
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 4, 
            color: '#4A5568',
            lineHeight: 1.7,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            maxWidth: '100%',
            wordWrap: 'break-word',
            pr: { md: 4 }
          }}
        >
          Streamline your project cost estimation process with our intelligent platform. 
          Get accurate estimates, track resources, and generate professional reports in minutes.
        </Typography>
        
        {/* FIXED: Buttons centered */}
 <Stack 
  direction={{ xs: 'column', sm: 'row' }} 
  spacing={2}
  sx={{ 
    width: '100%',
    justifyContent: 'center', // Changed to center for all devices
    alignItems: 'center'
  }}
>
  <Button 
    variant="contained" 
    size="large" 
    onClick={() => navigate('/register')}
    endIcon={<ArrowForwardIcon />}
    fullWidth={isMobile}
    sx={{ 
      px: { xs: 2, sm: 4 }, 
      py: { xs: 1.2, sm: 1.5, md: 1.8 },
      bgcolor: '#EAB464',
      color: '#2A3B4C',
      fontWeight: 700,
      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
      whiteSpace: 'nowrap',
      minWidth: { sm: '200px', md: '220px' }, // Fixed width for buttons
      '&:hover': { 
        bgcolor: '#C49A4C',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 20px rgba(234,180,100,0.4)'
      }
    }}
  >
    Get Started Free
  </Button>
  <Button 
    variant="outlined" 
    size="large"
    onClick={() => navigate('/login')}
    fullWidth={isMobile}
    sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 1.5, sm: 1.8, md: 2 },
      color: '#2A3B4C',
      borderColor: '#2A3B4C',
      borderWidth: 2,
      fontWeight: 600,
      fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
      whiteSpace: 'nowrap',
      minWidth: { sm: '160px', md: '180px' }, // Fixed width for buttons
      '&:hover': {
        borderWidth: 2,
        borderColor: '#EAB464',
        bgcolor: 'rgba(234,180,100,0.05)'
      }
    }}
  >
    Sign In
  </Button>
</Stack>
      </motion.div>
    </Grid>
    
    <Grid item xs={12} md={6}>
      {/* Image section remains same */}
    </Grid>
  </Grid>
</Container>

      {/* Stats Section */}
      <Container maxWidth="xl" sx={{ 
        mb: 8,
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Grid 
          container 
          spacing={{ xs: 2, sm: 3 }} 
          justifyContent="center"
        >
          {stats.map((stat, index) => (
            <Grid 
              item 
              xs={6} 
              sm={6} 
              md={3} 
              key={index}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 2.5, md: 3 },
                    textAlign: 'center',
                    bgcolor: 'white',
                    borderRadius: 4,
                    border: '1px solid rgba(0,0,0,0.05)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      borderColor: stat.color
                    }
                  }}
                >
                  <Avatar sx={{ 
                    bgcolor: `${stat.color}20`, 
                    color: stat.color, 
                    width: { xs: 45, sm: 50, md: 60 }, 
                    height: { xs: 45, sm: 50, md: 60 }, 
                    mb: { xs: 1, sm: 1.5, md: 2 } 
                  }}>
                    {stat.icon}
                  </Avatar>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: stat.color, 
                      fontWeight: 700, 
                      mb: 0.5,
                      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.125rem' }
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.875rem' },
                      textAlign: 'center',
                      px: 0.5
                    }}
                  >
                    {stat.label}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Core Features Section */}
      <Container maxWidth="xl" sx={{ 
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Typography 
            variant="overline" 
            align="center" 
            sx={{ 
              color: '#EAB464', 
              fontWeight: 700, 
              letterSpacing: 2,
              display: 'block',
              mb: 2,
              textAlign: 'center',
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            WHY CHOOSE US
          </Typography>
          
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem', lg: '2.5rem' },
              fontWeight: 800,
              color: '#2A3B4C',
              mb: 2,
              textAlign: 'center',
              px: { xs: 1, sm: 2 }
            }}
          >
            Powerful Features for{' '}
            <Box component="span" sx={{ 
              color: '#EAB464', 
              display: { xs: 'block', sm: 'inline-block' },
              mt: { xs: 1, sm: 0 }
            }}>
              Accurate Estimates
            </Box>
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              color: '#718096',
              maxWidth: 700,
              mx: 'auto',
              mb: { xs: 4, sm: 6, md: 8 },
              textAlign: 'center',
              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
              px: { xs: 2, sm: 3 }
            }}
          >
            Everything you need to create professional project cost estimates and manage your projects effectively
          </Typography>
        </motion.div>

        <Grid 
          container 
          spacing={{ xs: 3, sm: 4 }} 
          justifyContent="center"
        >
          {coreFeatures.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={6} 
              lg={3} 
              key={index}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                style={{ height: '100%' }}
              >
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'visible',
                  '&:hover .feature-icon': {
                    transform: 'scale(1.1) rotate(5deg)',
                  }
                }}>
                  <CardContent sx={{ 
                    p: { xs: 2.5, sm: 3 }, 
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <Avatar 
                      className="feature-icon"
                      sx={{ 
                        bgcolor: `${feature.color}20`, 
                        color: feature.color, 
                        width: { xs: 60, sm: 70 }, 
                        height: { xs: 60, sm: 70 }, 
                        mb: 2,
                        transition: 'all 0.3s'
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#2A3B4C',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      {feature.title}
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#718096', 
                        mb: 2, 
                        lineHeight: 1.6,
                        fontSize: { xs: '0.85rem', sm: '0.875rem' }
                      }}
                    >
                      {feature.description}
                    </Typography>
                    
                    <Stack spacing={1} sx={{ mt: 'auto' }}>
                      {feature.benefits.map((benefit, i) => (
                        <Stack key={i} direction="row" spacing={1} alignItems="center">
                          <CheckCircleIcon sx={{ color: feature.color, fontSize: 18 }} />
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: '#4A5568', 
                              fontWeight: 500,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' }
                            }}
                          >
                            {benefit}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Container maxWidth="xl" sx={{ 
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4, md: 6, lg: 8 },
            bgcolor: 'white',
            borderRadius: 4,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            mx: 'auto',
            maxWidth: '100%'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography 
              variant="h3" 
              gutterBottom 
              sx={{ 
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.2rem', lg: '2.5rem' },
                fontWeight: 800,
                color: '#2A3B4C',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
                mb: 2
              }}
            >
              Ready to Streamline Your Project Estimates?
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#718096',
                mb: { xs: 3, sm: 4 },
                maxWidth: 600,
                mx: 'auto',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center',
                fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                px: { xs: 1, sm: 2 }
              }}
            >
              Join thousands of professionals who are already saving time and improving accuracy with ProjectCostPro
            </Typography>
            
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="center"
              sx={{ position: 'relative', zIndex: 1 }}
            >
              <Button 
                variant="contained" 
                size="large"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForwardIcon />}
                fullWidth={isMobile}
                sx={{ 
                  px: { xs: 3, sm: 4, md: 6 }, 
                  py: { xs: 1.5, sm: 1.8, md: 2 },
                  bgcolor: '#EAB464',
                  color: '#2A3B4C',
                  fontWeight: 700,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  whiteSpace: 'nowrap',
                  '&:hover': { 
                    bgcolor: '#C49A4C',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(234,180,100,0.4)'
                  }
                }}
              >
                Get Started Free
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/login')}
                fullWidth={isMobile}
                sx={{ 
                  px: { xs: 3, sm: 4, md: 6 }, 
                  py: { xs: 1.5, sm: 1.8, md: 2 },
                  color: '#2A3B4C',
                  borderColor: '#2A3B4C',
                  borderWidth: 2,
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    borderWidth: 2,
                    borderColor: '#EAB464',
                    bgcolor: 'rgba(234,180,100,0.05)'
                  }
                }}
              >
                Sign In
              </Button>
            </Stack>
          </motion.div>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ 
        bgcolor: '#1A2A3A', 
        color: 'white', 
        py: { xs: 4, sm: 5, md: 6 },
        px: { xs: 2, sm: 3, md: 0 }
      }}>
        <Container maxWidth="xl">
          <Grid 
            container 
            spacing={{ xs: 3, sm: 4 }} 
            justifyContent="space-between"
          >
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2, 
                  color: 'white',
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                <Box component="span" sx={{ color: '#EAB464' }}>Project</Box>CostPro
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  mb: 2,
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  maxWidth: { xs: '100%', md: '90%' }
                }}
              >
                Making project cost estimation simple, accurate, and efficient for professionals worldwide.
              </Typography>
            </Grid>
            
            {['Product', 'Company', 'Resources', 'Legal'].map((section, idx) => (
              <Grid item xs={6} sm={3} md={2} key={idx}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    color: 'white',
                    fontSize: { xs: '0.85rem', sm: '0.875rem' }
                  }}
                >
                  {section}
                </Typography>
                <Stack spacing={1}>
                  {section === 'Product' && ['Features', 'Pricing', 'Integrations', 'API'].map((item, i) => (
                    <Typography key={i} variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      cursor: 'pointer', 
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                      '&:hover': { color: '#EAB464' 
                    }}}>
                      {item}
                    </Typography>
                  ))}
                  {section === 'Company' && ['About', 'Blog', 'Careers', 'Press'].map((item, i) => (
                    <Typography key={i} variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      cursor: 'pointer',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                      '&:hover': { color: '#EAB464' 
                    }}}>
                      {item}
                    </Typography>
                  ))}
                  {section === 'Resources' && ['Documentation', 'Support', 'Guides', 'FAQ'].map((item, i) => (
                    <Typography key={i} variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      cursor: 'pointer',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                      '&:hover': { color: '#EAB464' 
                    }}}>
                      {item}
                    </Typography>
                  ))}
                  {section === 'Legal' && ['Privacy', 'Terms', 'Security', 'Cookies'].map((item, i) => (
                    <Typography key={i} variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      cursor: 'pointer',
                      fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
                      '&:hover': { color: '#EAB464' 
                    }}}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ 
            my: { xs: 3, sm: 4 }, 
            borderColor: 'rgba(255,255,255,0.1)' 
          }} />
          <Typography 
            variant="body2" 
            align="center" 
            sx={{ 
              color: 'rgba(255,255,255,0.5)',
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.875rem' }
            }}
          >
            © {new Date().getFullYear()} ProjectCostPro. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;