import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, Grid, Card, CardMedia, CardContent, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import BarChartIcon from '@mui/icons-material/BarChart';
const LandingPage = () => {
  const navigate = useNavigate();
  const [featuredPlants, setFeaturedPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const API_URL = process.env.REACT_APP_API_URL || window.location.origin;
  const PLACEHOLDER_IMAGE = '/placeholder.png';
  
  useEffect(() => {
    const fetchFeaturedPlants = async () => {
      try {
        const response = await fetch(`${API_URL}/api/plants`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'  // Add this header!
          }
        });
        const data = await response.json();
        
        // Convert the data object to an array of plants
        const plantsArray = Object.entries(data).map(([scientificName, metadata]) => ({
          scientificName,
          vietnameseName: (metadata["Tên tiếng Việt"] || "Không có tên tiếng Việt").split(';')[0].trim(),
          familyVietnamese: metadata["Tên họ tiếng Việt"] || "Không có thông tin",
          familyScientific: metadata["Tên họ khoa học"] || "Không có thông tin",
          imagePath: getRepresentativeImagePath(scientificName)
        }));
        
        // Get 3 random plants
        const randomPlants = getRandomItems(plantsArray, 3);
        setFeaturedPlants(randomPlants);
      } catch (error) {
        console.error('Error fetching plants:', error);
        setFeaturedPlants([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFeaturedPlants();
  }, [API_URL]);
  
  // Helper function to get random items from an array
  const getRandomItems = (array, count) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // Function to get representative image path (same as in your existing components)
  const getRepresentativeImagePath = (label) => {
    if (!label) return PLACEHOLDER_IMAGE;
    const safeLabel = label.replace(/\s+/g, '_');
    return `/representative_images/${safeLabel}.jpg`;
  };
  
  // Handle image loading errors
  const handleImageError = (event) => {
    event.target.onerror = null;
    event.target.src = PLACEHOLDER_IMAGE;
  };
  
  // Navigate to plant detail in the library
  const handlePlantSelect = (plant) => {
    // Store the selected plant in localStorage to retrieve it in the library
    localStorage.setItem('selectedPlant', JSON.stringify(plant));
    navigate('/library');
  };
  
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      {/* Header with full width */}
      <Box sx={{ width: '100%', py: 2, px: 0, mb: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '100%',
            px: { xs: 3, md: 5, lg: 8 }, // Increased padding on larger screens
            maxWidth: '2000px', // Much wider max-width
            mx: 'auto'
          }}
        >
          <Typography variant="h6" component="div" color="primary.dark" sx={{ fontWeight: 600 }}>
            Đà Nẵng Flora
          </Typography>
          
          <Box>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<MenuBookIcon />}
              sx={{ mr: 2 }}
              onClick={() => navigate('/library')}
            >
              Thư viện
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<QuestionAnswerIcon />}
              onClick={() => navigate('/qa')}
            >
              Hỏi đáp
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<BarChartIcon />}
              onClick={() => navigate('/statistics')}
            >
            Thống kê
          </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Hero Section with wider container */}
      <Box sx={{ width: '100%', px: { xs: 3, md: 5, lg: 8 }, maxWidth: '2000px', mx: 'auto', mt: 8, mb: 10 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ 
              textAlign: { xs: 'center', md: 'left' }, 
              maxWidth: '100%', // Allow content to use full width
              pl: { md: 0, lg: 0 } // Remove any left padding on larger screens
            }}>
              <Typography 
                variant="h2" 
                component="h1" 
                color="primary.dark"
                sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' }, // Larger on big screens
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    display: 'block',
                    width: { xs: '80px', md: '120px', lg: '150px' },
                    height: '4px',
                    backgroundColor: 'primary.main',
                    mt: 2,
                    mb: 3,
                    borderRadius: '2px',
                    mx: { xs: 'auto', md: 0 }
                  }
                }}
              >
                Khám phá thực vật rừng Đà Nẵng
              </Typography>
              
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  mb: 4,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  textAlign: { xs: 'center', md: 'left' },
                  maxWidth: { md: '90%', lg: '80%' } // Slightly narrower than full width for readability
                }}
              >
                Khám phá, nhận diện và tìm hiểu về hơn 100 loài thực vật quý hiếm tại Đà Nẵng và Quảng Nam
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 14px rgba(46, 125, 50, 0.25)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(46, 125, 50, 0.35)'
                    }
                  }}
                  onClick={() => navigate('/qa')}
                >
                  Nhận diện cây
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 6px 20px rgba(46, 125, 50, 0.15)'
                    }
                  }}
                  onClick={() => navigate('/library')}
                >
                  Thư viện cây
                </Button>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '80%',
                  height: '80%',
                  border: '2px dashed rgba(46, 125, 50, 0.2)',
                  borderRadius: '50%',
                  zIndex: 0,
                  animation: 'spin 60s linear infinite'
                }
              }}
            >
              <img 
                src="/illustration.png" 
                alt="Illustration of forest plants" 
                style={{ 
                  maxWidth: '100%', 
                  height: 'auto',
                  position: 'relative',
                  zIndex: 1
                }}
                onError={(e) => {
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {/* Featured Plants Section - wider container */}
      <Box sx={{ bgcolor: '#f0f7f0', py: 8 }}>
        <Box sx={{ width: '100%', px: { xs: 3, md: 5, lg: 8 }, maxWidth: '2000px', mx: 'auto' }}>
          <Typography 
            variant="h4" 
            component="h2" 
            color="primary.dark"
            sx={{ 
              mb: 5, 
              fontWeight: 600,
              textAlign: { xs: 'center', md: 'left' },
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '80px',
                height: '3px',
                backgroundColor: 'secondary.main',
                mt: 2,
                mx: { xs: 'auto', md: 0 }
              }
            }}
          >
            Khám phá các loài thực vật nổi bật
          </Typography>
          
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card sx={{ height: '100%', boxShadow: 3 }}>
                    <Box sx={{ height: 200, bgcolor: 'rgba(0,0,0,0.1)' }} />
                    <CardContent>
                      <Box sx={{ height: 30, width: '80%', bgcolor: 'rgba(0,0,0,0.1)', mb: 1 }} />
                      <Box sx={{ height: 20, width: '60%', bgcolor: 'rgba(0,0,0,0.1)' }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {featuredPlants.map((plant, index) => (
                <Grid item xs={12} sm={6} md={4} lg={4} key={index}>
                  <Card 
                    className="plant-card" 
                    onClick={() => handlePlantSelect(plant)}
                    sx={{
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      cursor: 'pointer',
                      height: '100%',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <Box className="zoomable-image">
                      <CardMedia
                        component="img"
                        height="200"
                        image={plant.imagePath}
                        alt={plant.vietnameseName}
                        onError={handleImageError}
                        sx={{ objectFit: 'cover' }}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {plant.vietnameseName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <em>{plant.scientificName}</em>
                      </Typography>
                      <Typography variant="body2">
                        Họ: {plant.familyVietnamese} ({plant.familyScientific})
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mt: 6 }}>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(46, 125, 50, 0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.35)'
                }
              }}
              onClick={() => navigate('/library')}
            >
              Khám phá thêm
            </Button>
          </Box>
        </Box>
      </Box>
      
      {/* Footer with full width */}
      <Box sx={{ bgcolor: '#333', color: 'white', py: 4 }}>
        <Box sx={{ width: '100%', px: { xs: 3, md: 5, lg: 8 }, maxWidth: '2000px', mx: 'auto' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Đà Nẵng Flora
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                Hệ thống nhận diện và cung cấp thông tin về thực vật rừng tại khu vực Đà Nẵng - Quảng Nam.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Phiên bản 1.1.0 • {new Date().getFullYear()}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.6 }}>
                Nghiên cứu và phát triển bởi Khoa Công nghệ Thông tin, Đại học Bách Khoa Đà Nẵng
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Box>
      
      {/* Animation CSS */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
};

export default LandingPage;