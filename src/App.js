import React, { useState, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Container, Box, Typography, Paper, CircularProgress,
  Slide, Fade, Zoom, useMediaQuery, useTheme, Snackbar, Alert
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import './App.css';

// Lazy load components for better performance
const PlantLibrary = lazy(() => import('./PlantLibrary'));
const PlantChatbot = lazy(() => import('./PlantChatbot'));
const LandingPage = lazy(() => import('./LandingPage'));
const StatisticsDashboard = lazy(() => import('./StatisticsDashboard')); // Add the new component

// Loading fallback component with enhanced animation
const ComponentLoader = () => {
  const [loadingDots, setLoadingDots] = useState('');
  
  // Animated loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 400,
        flexDirection: 'column',
        p: 3,
        textAlign: 'center'
      }}
    >
      <Zoom in={true} style={{ transitionDelay: '150ms' }}>
        <CircularProgress color="primary" size={60} thickness={4} sx={{ mb: 2 }} />
      </Zoom>
      <Fade in={true} timeout={800}>
        <Typography variant="h6" color="primary">
          Đang tải{loadingDots}
        </Typography>
      </Fade>
    </Box>
  );
};

// Main application component that now includes routing
function App() {
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pageLoaded, setPageLoaded] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkAlert(true);
      setTimeout(() => setShowNetworkAlert(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNetworkAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Simulate page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // The ApplicationWrapper component for library and chatbot pages
  const ApplicationWrapper = ({ children }) => (
    <Fade in={pageLoaded} timeout={1000}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Slide direction="down" in={pageLoaded} timeout={800} mountOnEnter unmountOnExit>
          <Typography 
            variant="h3" 
            component="h1" 
            align="center" 
            gutterBottom 
            className="title"
            sx={{
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '4px',
                backgroundColor: 'primary.main',
                margin: '16px auto 0',
                borderRadius: '2px',
                transition: 'width 0.5s ease'
              },
              '&:hover::after': {
                width: '120px',
              }
            }}
          >
            Hệ thống hỏi đáp thực vật rừng Đà Nẵng
          </Typography>
        </Slide>

        <Zoom in={pageLoaded} timeout={800} style={{ transitionDelay: '300ms' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 3 }, 
              mb: 3, 
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                transform: prefersReducedMotion ? 'none' : 'translateY(-4px)'
              }
            }}
          >
            {/* Network status indicator */}
            <Snackbar 
              open={showNetworkAlert} 
              autoHideDuration={isOnline ? 5000 : null}
              anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
              onClose={() => setShowNetworkAlert(false)}
            >
              <Alert 
                severity={isOnline ? "success" : "warning"} 
                icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
                onClose={() => setShowNetworkAlert(false)}
                sx={{ width: '100%' }}
              >
                {isOnline 
                  ? 'Đã kết nối lại mạng thành công!' 
                  : 'Bạn đang trong chế độ ngoại tuyến. Một số tính năng có thể không khả dụng.'}
              </Alert>
            </Snackbar>

            {children}
          </Paper>
        </Zoom>
        
        {/* Version Info */}
        <Fade in={pageLoaded} timeout={1000} style={{ transitionDelay: '500ms' }}>
          <Typography 
            variant="body2" 
            align="center" 
            color="text.secondary" 
            sx={{ 
              mt: 2, 
              opacity: 0.7,
              '&:hover': {
                opacity: 1
              },
              transition: 'opacity 0.3s ease'
            }}
          >
            Phiên bản 1.1.0 • {new Date().getFullYear()}
          </Typography>
        </Fade>
      </Container>
    </Fade>
  );

  return (
    <Router>
      <Suspense fallback={<ComponentLoader />}>
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={<LandingPage />} />

          {/* Library Route */}
          <Route path="/library" element={
            <ApplicationWrapper>
              <PlantLibrary />
            </ApplicationWrapper>
          } />

          {/* Q&A/Chatbot Route */}
          <Route path="/qa" element={
            <ApplicationWrapper>
              <PlantChatbot />
            </ApplicationWrapper>
          } />

          {/* Statistics Dashboard Route */}
          <Route path="/statistics" element={
            <ApplicationWrapper>
              <StatisticsDashboard />
            </ApplicationWrapper>
          } />

          {/* Redirect any unknown routes to the landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      
      {/* Global network alert for routes outside of ApplicationWrapper */}
      <Snackbar 
        open={showNetworkAlert} 
        autoHideDuration={isOnline ? 5000 : null}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setShowNetworkAlert(false)}
      >
        <Alert 
          severity={isOnline ? "success" : "warning"} 
          icon={isOnline ? <WifiIcon /> : <WifiOffIcon />}
          onClose={() => setShowNetworkAlert(false)}
          sx={{ width: '100%' }}
        >
          {isOnline 
            ? 'Đã kết nối lại mạng thành công!' 
            : 'Bạn đang trong chế độ ngoại tuyến. Một số tính năng có thể không khả dụng.'}
        </Alert>
      </Snackbar>
    </Router>
  );
}

export default App;