import { createTheme } from '@mui/material/styles';

// Modern, professional color palette
const colors = {
  primary: {
    main: '#2A3B4C', // Deep blue-gray
    light: '#4A6572',
    dark: '#1A2A3A',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#EAB464', // Warm gold
    light: '#F5D7A1',
    dark: '#C49A4C',
    contrastText: '#2A3B4C',
  },
  accent: {
    teal: '#4A9B9D', // Muted teal
    coral: '#E67A6D', // Soft coral
    mint: '#A8D5BA', // Mint green
    lavender: '#B39BC8', // Soft lavender
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  text: {
    primary: '#2D3748',
    secondary: '#718096',
    disabled: '#A0AEC0',
  },
  success: {
    main: '#48BB78',
    light: '#9AE6B4',
    dark: '#2F855A',
  },
  warning: {
    main: '#F6AD55',
    light: '#FEEBC8',
    dark: '#DD6B20',
  },
  error: {
    main: '#F56565',
    light: '#FED7D7',
    dark: '#C53030',
  },
};

const theme = createTheme({
  palette: colors,
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            '&:hover fieldset': {
              borderColor: colors.primary.main,
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;