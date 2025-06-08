import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a custom theme for the application
const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Green color for plant theme
      light: '#60ad5e',
      dark: '#005005',
      // Add extra shades
      lightest: '#e8f5e9',
      lighter: '#c8e6c9',
      darker: '#003300',
    },
    secondary: {
      main: '#ff9800', // Orange color for contrast
      light: '#ffc947',
      dark: '#c66900',
      // Add extra shades
      lightest: '#fff8e1',
      lighter: '#ffecb3',
      darker: '#b26a00',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'Montserrat',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px', // Add subtle letter spacing
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.25px', // Add subtle letter spacing
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease', // Enhanced transition
        },
        containedPrimary: {
          boxShadow: '0 4px 10px rgba(46, 125, 50, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(46, 125, 50, 0.4)',
            transform: 'translateY(-2px)', // Add subtle lift on hover
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Enhanced transition
          '&:hover': {
            transform: 'translateY(-5px)', // Add hover lift effect
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)', // Enhanced shadow on hover
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // Add TextField overrides for better focus states
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
              borderColor: '#2e7d32',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#60ad5e',
            },
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);