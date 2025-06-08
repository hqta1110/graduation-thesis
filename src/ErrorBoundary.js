import React, { Component } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Error Boundary component to catch and handle errors gracefully
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  // Catch errors in any children
  static getDerivedStateFromError(error) {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  // Log error details
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Optionally send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  // Example method to log to a service
  logErrorToService(error, errorInfo) {
    // This would be your error logging service integration
    console.log('Logging error to service:', error.toString());
  }

  // Reset the error state
  handleReset = () => {
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  // Refresh the page
  handleRefresh = () => {
    window.location.reload();
  }

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    // Return custom fallback UI if there's an error
    if (hasError) {
      // Use provided fallback or default error UI
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default error UI
      return (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            m: 2, 
            borderRadius: 2,
            backgroundColor: '#fff8e1' // Soft warning background color
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <ErrorOutlineIcon 
              color="error" 
              sx={{ fontSize: 60, mb: 2 }}
            />
            
            <Typography variant="h5" component="h2" gutterBottom color="error">
              Đã xảy ra lỗi
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ maxWidth: 500, mx: 'auto' }}>
              Rất tiếc, đã xảy ra lỗi trong ứng dụng. Vui lòng thử làm mới trang hoặc quay lại sau.
            </Typography>
            
            {process.env.NODE_ENV !== 'production' && error && (
              <Box 
                sx={{ 
                  bgcolor: 'grey.100', 
                  p: 2, 
                  borderRadius: 1,
                  mt: 2,
                  width: '100%',
                  textAlign: 'left',
                  overflow: 'auto',
                  maxHeight: 200
                }}
              >
                <Typography variant="caption" component="pre" sx={{ fontFamily: 'monospace' }}>
                  {error.toString()}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={this.handleReset}
                color="primary"
              >
                Thử lại
              </Button>
              
              <Button 
                variant="contained" 
                onClick={this.handleRefresh}
                color="primary"
                startIcon={<RefreshIcon />}
              >
                Làm mới trang
              </Button>
            </Box>
          </Box>
        </Paper>
      );
    }

    // If there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;