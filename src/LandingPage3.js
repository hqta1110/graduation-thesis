import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery,
  Grow
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import NatureIcon from '@mui/icons-material/Nature';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import BackgroundPattern from './BackgroundPattern';

const LandingPage = ({ onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [loaded, setLoaded] = useState(false);
  const [hoverLibrary, setHoverLibrary] = useState(false);
  const [hoverChatbot, setHoverChatbot] = useState(false);

  // Plants animation
  const [plantsAnimated, setPlantsAnimated] = useState([]);
  
  useEffect(() => {
    // Trigger entrance animation
    setLoaded(true);
    
    // Initialize plant animations
    const plants = [];
    for (let i = 0; i < 12; i++) {
      plants.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        rotation: Math.random() * 360,
        delay: i * 0.2,
        size: Math.random() * 20 + 20,
        duration: 2 + Math.random() * 3
      });
    }
    setPlantsAnimated(plants);
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      // Disable animations for accessibility
      setLoaded(true);
      setPlantsAnimated([]);
    }
  }, []);
  
  // Handle navigation to different sections
  const handleNavigate = (mode) => {
    if (onNavigate) {
      onNavigate(mode);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f4f9f4 0%, #e8f5e9 100%)'
      }}
    >
      {/* Background Pattern */}
      <BackgroundPattern />
      
      {/* Animated background elements */}
      {plantsAnimated.map((plant) => (
        <Box
          key={plant.id}
          sx={{
            position: 'absolute',
            top: `${plant.top}%`,
            left: `${plant.left}%`,
            transform: `rotate(${plant.rotation}deg)`,
            color: 'rgba(46, 125, 50, 0.1)',
            fontSize: plant.size,
            zIndex: 0,
            animation: `float ${plant.duration}s ease-in-out infinite alternate`,
            opacity: 0,
            transition: `opacity 1s ease-in-out ${plant.delay}s`,
            ...(loaded && { opacity: 0.7 }),
            // Simple leaf shape using CSS
            width: plant.size,
            height: plant.size,
            backgroundColor: 'transparent',
            borderRadius: plant.id % 2 === 0 ? '50%' : '0% 70% 0% 70%',
            border: '2px solid',
            borderColor: 'primary.main',
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in={loaded} timeout={1000}>
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h2" 
              component="h1" 
              gutterBottom
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.dark,
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                display: 'inline-block',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '60%',
                  height: '4px',
                  bottom: '-10px',
                  left: '20%',
                  backgroundColor: theme.palette.secondary.main,
                  borderRadius: '2px'
                }
              }}
            >
              Thực Vật Rừng Đà Nẵng
            </Typography>
            <Zoom in={loaded} style={{ transitionDelay: '300ms' }}>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  mt: 3, 
                  maxWidth: '800px', 
                  mx: 'auto',
                  lineHeight: 1.6
                }}
              >
                Khám phá, nhận dạng và tìm hiểu thông tin về hệ thực vật phong phú tại Đà Nẵng
              </Typography>
            </Zoom>
          </Box>
        </Fade>

        {/* Main content - Feature cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {/* Library Card */}
          <Grid item xs={12} md={6}>
            <Zoom in={loaded} style={{ transitionDelay: '500ms' }}>
              <Card 
                elevation={4}
                onMouseEnter={() => setHoverLibrary(true)}
                onMouseLeave={() => setHoverLibrary(false)}
                onClick={() => handleNavigate(0)}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: hoverLibrary ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
                  boxShadow: hoverLibrary ? '0 15px 30px rgba(0,0,0,0.15)' : '0 6px 12px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                  border: '1px solid',
                  borderColor: hoverLibrary ? 'primary.main' : 'transparent',
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: isTablet ? 'column' : 'row',
                    height: '100%'
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      width: isTablet ? '100%' : '40%',
                      height: isTablet ? '200px' : 'auto',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(315deg, #60ad5e 0%, #2e7d32 100%)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <MenuBookIcon 
                      sx={{ 
                        fontSize: 100, 
                        color: 'white',
                        opacity: 0.9,
                        transform: hoverLibrary ? 'scale(1.1) rotate(5deg)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                      }} 
                    />
                  </CardMedia>
                  <CardContent sx={{ 
                    flex: 1, 
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="h4" component="h2" gutterBottom color="primary.dark" fontWeight="bold">
                        Thư Viện Cây
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Truy cập kho dữ liệu đầy đủ về thực vật rừng tại Đà Nẵng. Khám phá thông tin chi tiết về đặc điểm sinh học, phân bố, và giá trị của từng loài.
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        alignSelf: 'flex-start',
                        mt: 2,
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        transform: hoverLibrary ? 'translateX(10px)' : 'translateX(0)',
                        opacity: hoverLibrary ? 1 : 0.9,
                      }}
                      onClick={() => handleNavigate(0)}
                    >
                      Khám Phá Ngay
                    </Button>
                  </CardContent>
                </Box>
              </Card>
            </Zoom>
          </Grid>

          {/* Chatbot Card */}
          <Grid item xs={12} md={6}>
            <Zoom in={loaded} style={{ transitionDelay: '700ms' }}>
              <Card 
                elevation={4}
                onMouseEnter={() => setHoverChatbot(true)}
                onMouseLeave={() => setHoverChatbot(false)}
                onClick={() => handleNavigate(1)}
                sx={{
                  height: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transform: hoverChatbot ? 'translateY(-12px) scale(1.03)' : 'translateY(0) scale(1)',
                  boxShadow: hoverChatbot ? '0 15px 30px rgba(0,0,0,0.15)' : '0 6px 12px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                  border: '1px solid',
                  borderColor: hoverChatbot ? 'secondary.main' : 'transparent',
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: isTablet ? 'column' : 'row-reverse',
                    height: '100%'
                  }}
                >
                  <CardMedia
                    component="div"
                    sx={{
                      width: isTablet ? '100%' : '40%',
                      height: isTablet ? '200px' : 'auto',
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'linear-gradient(315deg, #ffc947 0%, #ff9800 100%)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <QuestionAnswerIcon 
                      sx={{ 
                        fontSize: 100, 
                        color: 'white',
                        opacity: 0.9,
                        transform: hoverChatbot ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                      }} 
                    />
                  </CardMedia>
                  <CardContent sx={{ 
                    flex: 1, 
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <Box>
                      <Typography variant="h4" component="h2" gutterBottom color="secondary.dark" fontWeight="bold">
                        Hỏi Đáp
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Tương tác với trợ lý ảo để nhận diện cây qua hình ảnh và được giải đáp mọi thắc mắc về thực vật. Chỉ cần tải lên một bức ảnh hoặc đặt câu hỏi.
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        alignSelf: 'flex-start',
                        mt: 2,
                        px: 3,
                        py: 1.5,
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        transform: hoverChatbot ? 'translateX(10px)' : 'translateX(0)',
                        opacity: hoverChatbot ? 1 : 0.9,
                      }}
                      onClick={() => handleNavigate(1)}
                    >
                      Bắt Đầu Hỏi Đáp
                    </Button>
                  </CardContent>
                </Box>
              </Card>
            </Zoom>
          </Grid>
        </Grid>

                {/* Statistics */}
        <Fade in={loaded} timeout={1000} style={{ transitionDelay: '900ms' }}>
          <Box sx={{ mb: 6 }}>
            <Grid container spacing={3} justifyContent="center">
              {[
                { value: '500+', label: 'Loài thực vật', icon: <LocalFloristIcon color="primary" fontSize="large" /> },
                { value: '98%', label: 'Độ chính xác', icon: <CheckCircleIcon color="secondary" fontSize="large" /> },
                { value: '1000+', label: 'Người dùng', icon: <GroupIcon color="primary" fontSize="large" /> }
              ].map((stat, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Zoom in={loaded} style={{ transitionDelay: `${900 + index * 200}ms` }}>
                    <Paper
                      elevation={2}
                      sx={{
                        py: 3,
                        px: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <Box sx={{ mb: 1 }}>
                        {stat.icon}
                      </Box>
                      <Typography 
                        variant="h3" 
                        component="div" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: index % 2 === 0 ? 'primary.main' : 'secondary.main',
                          mb: 1
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Featured plants showcase */}
        <Fade in={loaded} timeout={1000} style={{ transitionDelay: '1100ms' }}>
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              component="h2" 
              align="center" 
              gutterBottom
              sx={{ 
                fontWeight: 600, 
                color: 'primary.dark',
                mb: 4,
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: '60px',
                  height: '3px',
                  bottom: '-10px',
                  left: 'calc(50% - 30px)',
                  backgroundColor: 'secondary.main',
                  borderRadius: '2px'
                }
              }}
            >
              Một số loài thực vật tiêu biểu
            </Typography>
            
            <Grid container spacing={3}>
              {[
                { 
                  name: 'Lim xanh', 
                  scientificName: 'Erythrophleum fordii', 
                  image: '/representative_images/Erythrophleum_fordii.jpg',
                  desc: 'Cây gỗ lớn quý hiếm, gỗ cứng và bền'
                },
                { 
                  name: 'Sao đen', 
                  scientificName: 'Hopea odorata', 
                  image: '/representative_images/Hopea_odorata.jpg',
                  desc: 'Cây cung cấp gỗ quý và dầu thơm'
                },
                { 
                  name: 'Trầm hương', 
                  scientificName: 'Aquilaria crassna', 
                  image: '/representative_images/Aquilaria_crassna.jpg',
                  desc: 'Cây có giá trị kinh tế và y học cao'
                },
              ].map((plant, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Zoom in={loaded} style={{ transitionDelay: `${1100 + index * 200}ms` }}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                        }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={plant.image}
                        alt={plant.name}
                        onError={(e) => {
                          e.target.src = '/placeholder.png';
                        }}
                        sx={{
                          transition: 'all 0.5s ease',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {plant.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                          {plant.scientificName}
                        </Typography>
                        <Typography variant="body2">
                          {plant.desc}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>

        {/* Footer info */}
        <Fade in={loaded} timeout={1000} style={{ transitionDelay: '1300ms' }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 4, 
              borderRadius: 3, 
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="h5" component="h3" gutterBottom color="primary.dark">
              Về Hệ Thống
            </Typography>
            <Typography variant="body1" paragraph>
              Hệ thống nhận dạng và hỏi đáp thực vật rừng Đà Nẵng là công cụ nghiên cứu và học tập
              được phát triển nhằm giúp người dùng dễ dàng tiếp cận thông tin về đa dạng sinh học thực vật trong khu vực.
              Hệ thống kết hợp công nghệ AI tiên tiến để nhận dạng chính xác các loài thực vật và cung cấp thông tin khoa học đáng tin cậy.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              © {new Date().getFullYear()} - Phiên bản 1.2.0
            </Typography>
          </Paper>
        </Fade>
      </Container>

      {/* Add custom keyframes for floating animation */}
      <style jsx="true">{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(${Math.random() * 360}deg);
          }
          100% {
            transform: translateY(20px) rotate(${Math.random() * 360 + 20}deg);
          }
        }
      `}</style>
    </Box>
  );
};

export default LandingPage3;