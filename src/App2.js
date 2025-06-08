import React, { useState, lazy, Suspense, useEffect } from 'react';
import {
  Container, Box, Typography, Paper, Tabs, Tab, CircularProgress,
  Slide, Fade, Zoom, useMediaQuery, useTheme, Snackbar, Alert
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import WifiIcon from '@mui/icons-material/Wifi';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import HomeIcon from '@mui/icons-material/Home';
import './App.css'; // Keep your CSS for base styles and overrides

// Import the landing page
const LandingPage = lazy(() => import('./LandingPage'));

// Lazy load components for better performance
const PlantLibrary = lazy(() => import('./PlantLibrary'));
// Replace PlantQA with PlantChatbot
const PlantChatbot = lazy(() => import('./PlantChatbot'));

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

function App() {
  // State to determine whether to show landing page or main app
  const [showLanding, setShowLanding] = useState(true);
  
  // State to track active tab - 0 for Library mode, 1 for Q&A mode
  const [activeTab, setActiveTab] = useState(0);
  const [showNetworkAlert, setShowNetworkAlert] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showBackToHome, setShowBackToHome] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Handle tab change with smoother transition
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle navigation from landing page
  const handleNavigateFromLanding = (mode) => {
    // Add a slight delay to allow for a smooth transition
    setPageLoaded(false); // Fade out
    
    setTimeout(() => {
      setActiveTab(mode); // Set the active tab based on selection from landing page
      setShowLanding(false); // Hide the landing page
      setShowBackToHome(true); // Show the back to home button
      
      // Fade back in
      setTimeout(() => {
        setPageLoaded(true);
      }, 300);
    }, 500);
  };
  
  // Handle back to landing page
  const handleBackToLanding = () => {
    // Add a slight delay to allow for a smooth transition
    setPageLoaded(false); // Fade out
    
    setTimeout(() => {
      setShowLanding(true); // Show the landing page
      setShowBackToHome(false); // Hide the back to home button
      
      // Fade back in
      setTimeout(() => {
        setPageLoaded(true);
      }, 300);
    }, 500);
  };
  
  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNetworkAlert(true);
      // Auto-hide after 5 seconds
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
    // Short delay to ensure smooth animation on initial load
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Detect if we're in a reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <Fade in={pageLoaded} timeout={1000}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back to Home floating button */}
        {showBackToHome && (
          <Zoom in={true}>
            <Box 
              onClick={handleBackToLanding}
              className="back-to-landing"
              sx={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 1000,
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.main',
                color: 'white',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'scale(1.1)',
                  backgroundColor: 'primary.dark',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                }
              }}
            >
              <HomeIcon />
            </Box>
          </Zoom>
        )}
        
        <Suspense fallback={<ComponentLoader />}>
          {showLanding ? (
            // Show landing page when showLanding is true
            <LandingPage onNavigate={handleNavigateFromLanding} />
          ) : (
            // Show main application when showLanding is false
            <>
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
                
                  {/* Tabs for Library/Q&A modes */}
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    variant="fullWidth" 
                    textColor="primary"
                    indicatorColor="primary"
                    className="mode-tabs"
                    sx={{ 
                      mb: 3, 
                      borderBottom: 1, 
                      borderColor: 'divider',
                      '& .MuiTabs-indicator': {
                        height: '3px',
                        borderRadius: '1.5px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                      },
                      '& .MuiTab-root': {
                        transition: 'all 0.3s ease',
                        opacity: 0.7,
                        '&.Mui-selected': {
                          opacity: 1,
                          fontWeight: 'bold',
                          transform: prefersReducedMotion ? 'none' : 'scale(1.05)'
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(46, 125, 50, 0.04)'
                        }
                      }
                    }}
                  >
                    <Tab 
                      icon={<MenuBookIcon />} 
                      label="Thư viện cây" 
                      iconPosition="start" 
                      sx={{ fontWeight: isMobile ? 'normal' : 'bold' }}
                    />
                    <Tab 
                      icon={<QuestionAnswerIcon />} 
                      label="Hỏi đáp" 
                      iconPosition="start" 
                      sx={{ fontWeight: isMobile ? 'normal' : 'bold' }}
                    />
                  </Tabs>

                  {/* Render either PlantLibrary or PlantChatbot based on active tab */}
                  <Suspense fallback={<ComponentLoader />}>
                    <Fade 
                      in={true} 
                      key={activeTab} // Force re-render animation on tab change
                      timeout={500}
                    >
                      <Box
                        className={prefersReducedMotion ? '' : 'fade-in'}
                        sx={{ minHeight: 400 }}
                      >
                        {activeTab === 0 ? <PlantLibrary /> : <PlantChatbot />}
                      </Box>
                    </Fade>
                  </Suspense>
                </Paper>
              </Zoom>
            </>
          )}
        </Suspense>
        
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
            Phiên bản 1.2.0 • {new Date().getFullYear()}
          </Typography>
        </Fade>
      </Container>
    </Fade>
  );
}

export default App2;