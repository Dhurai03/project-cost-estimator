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
  useTheme
} from '@mui/material';
import {
  Add,
  Assessment,
  Logout,
  Person,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [projects, setProjects] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Load mock projects from localStorage
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

  // Add this function to get currency symbol based on currency code
  const getCurrencySymbol = (currencyCode) => {
    const currencies = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
    };
    return currencies[currencyCode] || '$';
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ProjectCostPro
          </Typography>
          {!isMobile && (
            <Typography variant="body1" sx={{ mr: 2 }}>
              Welcome, {user.name || 'User'}
            </Typography>
          )}
          <IconButton color="inherit" onClick={handleMenu}>
            <Avatar sx={{ bgcolor: '#EAB464', color: '#2A3B4C', width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}>
              <Person />
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ 
        mt: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: { xs: 3, sm: 4 },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              color: '#2A3B4C',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            My Projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/project/new')}
            fullWidth={isMobile}
            sx={{
              bgcolor: '#EAB464',
              color: '#2A3B4C',
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.2 },
              fontSize: { xs: '0.875rem', sm: '0.9rem', md: '1rem' },
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#C49A4C' }
            }}
          >
            Start Calculating
          </Button>
        </Box>

        {projects.length === 0 ? (
          <Paper sx={{ 
            p: { xs: 4, sm: 6, md: 8 }, 
            textAlign: 'center', 
            bgcolor: 'white',
            mx: 'auto',
            maxWidth: '100%'
          }}>
            <Assessment sx={{ 
              fontSize: { xs: 40, sm: 50, md: 60 }, 
              color: '#EAB464', 
              mb: 2 
            }} />
            <Typography 
              variant="h5" 
              color="text.secondary" 
              gutterBottom
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}
            >
              No Projects Yet
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              paragraph
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Click the "Start Calculating" button to create your first project cost estimation.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} lg={4} key={project._id}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        {project.name}
                      </Typography>
                      <Chip
                        label={project.currency || 'USD'}
                        size="small"
                        sx={{ bgcolor: '#EAB464', color: '#2A3B4C' }}
                      />
                    </Box>
                    
                    <Typography color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      Duration: {project.duration} days
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 2, color: '#718096', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                      {project.description}
                    </Typography>

                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                        Labor: {getCurrencySymbol(project.currency)}{project.laborCost?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                        Material: {getCurrencySymbol(project.currency)}{project.materialCost?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                        Resource: {getCurrencySymbol(project.currency)}{project.resourceCost?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                        Misc: {getCurrencySymbol(project.currency)}{project.miscellaneousCost?.toLocaleString() || 0}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="h6" sx={{ color: '#2A3B4C', fontWeight: 700, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        Total: {getCurrencySymbol(project.currency)}{project.totalCost?.toLocaleString() || 0}
                      </Typography>
                      <Box>
                        <Button
                          size="small"
                          onClick={() => navigate(`/project/${project._id}`)}
                          sx={{ color: '#2A3B4C', mr: 1, fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleDelete(project._id)}
                          sx={{ color: '#F56565', fontSize: { xs: '0.7rem', sm: '0.8rem' } }}
                        >
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;