import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Container, Grid, Paper, Card, CardContent, Divider,
  Tabs, Tab, CircularProgress, Alert, Fade, Zoom, Collapse, useTheme,
  useMediaQuery, Tooltip, IconButton, alpha, Chip, Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import MapIcon from '@mui/icons-material/Map';
import HubIcon from '@mui/icons-material/Hub';
import NatureIcon from '@mui/icons-material/Nature';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoIcon from '@mui/icons-material/Info';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate } from 'react-router-dom';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, LineChart, Line, AreaChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Treemap, Scatter,
  ScatterChart, ZAxis, ComposedChart, ReferenceLine, RadialBarChart,
  RadialBar
} from 'recharts';

// API endpoint for backend
const API_URL = process.env.REACT_APP_API_URL || window.location.origin;

// Color constants
const COLORS = [
  '#2e7d32', '#43a047', '#66bb6a', '#81c784', '#a5d6a7', 
  '#c8e6c9', '#edf7ed', '#60ad5e', '#388e3c', '#1b5e20'
];

const ACCENT_COLORS = [
  '#9c27b0', '#ab47bc', '#ba68c8', '#ce93d8', '#e1bee7'
];

const CONSERVATION_COLORS = {
  'Critically Endangered': '#d32f2f',
  'Endangered': '#f44336',
  'Vulnerable': '#ff9800',
  'Near Threatened': '#ffc107',
  'Least Concern': '#4caf50',
  'Data Deficient': '#9e9e9e',
  'Not Evaluated': '#607d8b',
  'Unknown': '#9e9e9e'
};

// Main component
const StatisticsDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const headerRef = useRef(null);
  
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  
  // Listen for scroll to animate header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setHeaderScrolled(scrollPosition > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Fetch statistics data
  useEffect(() => {
    const fetchStatistics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${API_URL}/api/statistics/all`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch statistics (HTTP ${response.status})`);
        }
        
        const data = await response.json();
        setStatsData(data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError(`Không thể tải dữ liệu thống kê: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Helper functions for data formatting
  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return num.toLocaleString('vi-VN');
  };
  
  const getPercentage = (part, total) => {
    if (!part || !total) return 0;
    return ((part / total) * 100).toFixed(1);
  };
  
  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
        <CircularProgress size={60} thickness={4} color="primary" sx={{ mb: 3 }}/>
        <Typography variant="h6" color="primary" gutterBottom>
          Đang tải dữ liệu thống kê...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Vui lòng đợi trong giây lát
        </Typography>
      </Box>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        px={2}
      >
        <Alert 
          severity="error"
          sx={{ 
            mb: 3, 
            maxWidth: 600,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 2
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2">
            Vui lòng thử làm mới trang hoặc quay lại sau.
          </Typography>
        </Alert>
        
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Quay về trang chủ
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      margin: { xs: '-16px', sm: '-24px' },
      overflow: 'hidden',
      position: 'relative',
      minHeight: '100vh',
      bgcolor: '#f8fdf8'
    }}>
      {/* Immersive Header */}
      <Box 
        ref={headerRef}
        sx={{
          position: 'relative',
          bgcolor: 'primary.main',
          py: { xs: 6, md: 8 },
          mb: 4,
          overflow: 'hidden',
          transform: headerScrolled ? 'translateY(-15px) scale(0.98)' : 'translateY(0) scale(1)',
          boxShadow: headerScrolled ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
          transition: 'all 0.5s ease',
          height: { xs: 180, sm: 220, md: 280 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url("/forest-bg.jpg")', // Using existing forest background
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.2,
            filter: 'blur(5px)',
            transform: headerScrolled ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.5s ease'
          }
        }}
      >
        <Container maxWidth="xl" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}>
            <Box sx={{ 
              textAlign: { xs: 'center', md: 'left' },
              color: 'white'
            }}>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                  letterSpacing: 0.5
                }}
              >
                Thống kê & Phân tích
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  opacity: 0.9,
                  maxWidth: 600,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  fontWeight: 400
                }}
              >
                Hiểu sâu về đa dạng sinh học thực vật tại Đà Nẵng - Quảng Nam
              </Typography>
            </Box>
            
            {/* Decorative stats-themed graphic */}
            <Box sx={{ 
              display: { xs: 'none', md: 'flex' },
              gap: 2,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Box component="svg" viewBox="0 0 100 100" width={120} height={120} sx={{ fill: 'none', stroke: 'white', opacity: 0.8 }}>
                <circle cx="50" cy="50" r="40" strokeWidth="2" />
                <path d="M20,80 L50,30 L80,50 L95,40" strokeWidth="3" />
                <circle cx="20" cy="80" r="4" />
                <circle cx="50" cy="30" r="4" />
                <circle cx="80" cy="50" r="4" />
                <circle cx="95" cy="40" r="4" />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth="xl">
        {/* Key Metrics Cards */}
        <Grid container spacing={3} sx={{ mt: { xs: -6, sm: -7, md: -8 }, mb: 4, position: 'relative', zIndex: 2 }}>
          {/* Total Species */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={6}
              sx={{
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #e8f5e9 0%, #ffffff 100%)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NatureIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="primary.dark">Tổng số loài</Typography>
              </Box>
              <Typography variant="h3" color="primary.dark" sx={{ fontWeight: 700, mt: 2 }}>
                {formatNumber(statsData?.basic?.total_plants)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                loài thực vật được ghi nhận
              </Typography>
            </Paper>
          </Grid>
          
          {/* Threatened Species */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={6}
              sx={{
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="error" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="error.dark">Loài bị đe dọa</Typography>
              </Box>
              <Typography variant="h3" color="error.dark" sx={{ fontWeight: 700, mt: 2 }}>
                {formatNumber(statsData?.conservation?.threatened_count)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                chiếm {getPercentage(statsData?.conservation?.threatened_count, statsData?.basic?.total_plants)}% tổng số loài
              </Typography>
            </Paper>
          </Grid>
          
          {/* Families */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={6}
              sx={{
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CategoryIcon color="info" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="info.dark">Họ thực vật</Typography>
              </Box>
              <Typography variant="h3" color="info.dark" sx={{ fontWeight: 700, mt: 2 }}>
                {formatNumber(statsData?.basic?.total_families)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                trung bình {((statsData?.basic?.total_plants || 0) / (statsData?.basic?.total_families || 1)).toFixed(1)} loài/họ
              </Typography>
            </Paper>
          </Grid>
          
          {/* Medicinal Plants */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper 
              elevation={6}
              sx={{
                p: 2,
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocalFloristIcon color="secondary" sx={{ mr: 1, fontSize: 24 }} />
                <Typography variant="h6" color="secondary.dark">Loài dược liệu</Typography>
              </Box>
              <Typography variant="h3" color="secondary.dark" sx={{ fontWeight: 700, mt: 2 }}>
                {formatNumber(statsData?.properties?.medicinal_count)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                chiếm {getPercentage(statsData?.properties?.medicinal_count, statsData?.basic?.total_plants)}% tổng số loài
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Tabbed Navigation */}
        <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              '& .MuiTab-root': {
                py: 2,
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: 'primary.dark',
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              label="Tổng quan" 
              icon={<DashboardIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Phân loại học" 
              icon={<CategoryIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Bảo tồn" 
              icon={<WarningIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Phân bố" 
              icon={<MapIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Mối quan hệ" 
              icon={<HubIcon />} 
              iconPosition="start"
            />
          </Tabs>
          
          {/* Tab content panels */}
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            {activeTab === 0 && <OverviewTab data={statsData} />}
            {activeTab === 1 && <TaxonomyTab data={statsData} />}
            {activeTab === 2 && <ConservationTab data={statsData} />}
            {activeTab === 3 && <GeographicTab data={statsData} />}
            {activeTab === 4 && <RelationshipsTab data={statsData} />}
          </Box>
        </Paper>
        
        {/* Generation metadata */}
        {statsData?.metadata && (
          <Typography variant="caption" color="text.secondary" align="right" display="block" sx={{ mt: 2, mb: 4 }}>
            Dữ liệu được cập nhật lúc: {new Date(statsData.metadata.generated_at || Date.now()).toLocaleString('vi-VN')}
          </Typography>
        )}
      </Container>
      
      {/* Background decorative elements */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20vh',
          background: 'linear-gradient(to top, rgba(46, 125, 50, 0.05), transparent)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
    </Box>
  );
};

// Overview Tab Component
const OverviewTab = ({ data }) => {
  return (
    <Grid container spacing={3}>
      {/* Tab title */}
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom sx={{ 
          fontWeight: 600, 
          color: 'primary.dark',
          position: 'relative',
          mb: 3,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: '80px',
            height: '3px',
            borderRadius: '3px',
            background: 'linear-gradient(90deg, #2e7d32, transparent)'
          }
        }}>
          Tổng quan đa dạng sinh học
        </Typography>
      </Grid>
      
      {/* Taxonomic Distribution Chart */}
      <Grid item xs={12} md={6}>
        <TaxonomyDistributionChart data={data} />
      </Grid>
      
      {/* Conservation Status Chart */}
      <Grid item xs={12} md={6}>
        <ConservationStatusChart data={data} />
      </Grid>
      
      {/* Additional charts would go here */}
      {/* Plant Properties Chart */}
      <Grid item xs={12} md={6}>
        <PlantPropertiesChart data={data} />
      </Grid>
      
      {/* Value Categories Chart */}
      <Grid item xs={12} md={6}>
        <ValueCategoriesChart data={data} />
      </Grid>
    </Grid>
  );
};

// Chart Components
const TaxonomyDistributionChart = ({ data }) => {
  if (!data || !data.taxonomic || !data.taxonomic.by_family) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="text.secondary">Không có dữ liệu phân loại</Typography>
      </Card>
    );
  }
  
  // Transform data for visualization
  const chartData = Object.entries(data.taxonomic.by_family)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([family, count], index) => ({
      name: family,
      value: count,
      // Add a custom color gradient based on value
      fill: `rgba(46, 125, 50, ${0.4 + (count / Math.max(...Object.values(data.taxonomic.by_family)) * 0.6)})`
    }));

  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        transform: 'translateY(-4px)'
      }
    }}>
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.dark',
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              display: 'inline-block',
              width: 12,
              height: 30,
              backgroundColor: 'primary.main',
              marginRight: 2,
              borderRadius: 4
            }
          }}
        >
          Các họ thực vật phổ biến
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Phân bố số lượng loài theo họ thực vật (12 họ hàng đầu)
        </Typography>
        
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120}
                tick={{ fontSize: 12 }}
              />
              <RechartsTooltip
                formatter={(value) => [value.toLocaleString(), "Số loài"]}
                contentStyle={{
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: 'none'
                }}
              />
              <Bar 
                dataKey="value" 
                animationDuration={1500} 
                animationEasing="ease-out"
                label={{
                  position: 'right',
                  formatter: (value) => value > Math.max(...chartData.map(d => d.value)) * 0.2 ? value : '',
                  fill: '#666',
                  fontSize: 12
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fill}
                    style={{
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
                    }}
                  />
                ))}
              </Bar>
              <ReferenceLine 
                x={Math.round(chartData.reduce((acc, cur) => acc + cur.value, 0) / chartData.length)} 
                stroke="#ff9800" 
                strokeDasharray="3 3"
                label={{
                  value: 'Trung bình',
                  position: 'insideBottomRight',
                  fill: '#ff9800',
                  fontSize: 12
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
      <Box
        sx={{
          p: 2,
          bgcolor: 'rgba(46, 125, 50, 0.03)',
          borderTop: '1px solid rgba(46, 125, 50, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <InfoIcon color="primary" fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          {chartData[0]?.name || 'N/A'} là họ đa dạng nhất với {chartData[0]?.value || 0} loài, chiếm {chartData[0]?.value && data.basic.total_plants ? ((chartData[0]?.value / data.basic.total_plants) * 100).toFixed(1) : 0}% tổng số loài.
        </Typography>
      </Box>
    </Card>
  );
};

const ConservationStatusChart = ({ data }) => {
  if (!data || !data.conservation || !data.conservation.by_status) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="text.secondary">Không có dữ liệu bảo tồn</Typography>
      </Card>
    );
  }
  
  // Prepare conservation data
  const conservationData = Object.entries(data.conservation.by_status)
    .map(([status, count]) => ({
      name: status,
      value: count,
      color: CONSERVATION_COLORS[status] || '#9e9e9e'
    }));

  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        transform: 'translateY(-4px)'
      }
    }}>
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.dark',
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              display: 'inline-block',
              width: 12,
              height: 30,
              backgroundColor: 'primary.main',
              marginRight: 2,
              borderRadius: 4
            }
          }}
        >
          Tình trạng bảo tồn
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Phân bố loài theo các danh mục bảo tồn của IUCN
        </Typography>
        
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={conservationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => 
                  percent > 0.05 ? `${name}: ${(percent * 100).toFixed(1)}%` : ''
                }
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {conservationData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke="none"
                    style={{
                      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.1))'
                    }}
                  />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value, name) => [`${value} loài (${((value / data.basic.total_plants) * 100).toFixed(1)}%)`, name]}
                contentStyle={{
                  borderRadius: 8,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  border: 'none'
                }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
      <Box
        sx={{
          p: 2,
          bgcolor: 'rgba(244, 67, 54, 0.03)',
          borderTop: '1px solid rgba(244, 67, 54, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <WarningIcon color="error" fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          {data.conservation.threatened_count || 0} loài ({data.conservation.threatened_percentage?.toFixed(1) || 0}%) đang bị đe dọa tuyệt chủng (CR, EN, VU).
        </Typography>
      </Box>
    </Card>
  );
};

const PlantPropertiesChart = ({ data }) => {
  if (!data || !data.properties || !data.properties.by_lifeform) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="text.secondary">Không có dữ liệu về dạng sống</Typography>
      </Card>
    );
  }
  
  // Prepare lifeform data
  const lifeformData = Object.entries(data.properties.by_lifeform)
    .sort((a, b) => b[1] - a[1])
    .map(([lifeform, count]) => ({
      name: lifeform,
      value: count
    }));

  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        transform: 'translateY(-4px)'
      }
    }}>
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.dark',
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              display: 'inline-block',
              width: 12,
              height: 30,
              backgroundColor: 'primary.main',
              marginRight: 2,
              borderRadius: 4
            }
          }}
        >
          Dạng sống thực vật
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Phân bố loài theo các dạng sống (cây gỗ, cây bụi, dây leo,...)
        </Typography>
        
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={lifeformData}
              margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <RechartsTooltip formatter={(value) => [`${value} loài`, 'Số loài']} />
              <Bar 
                dataKey="value" 
                animationDuration={1500}
              >
                {lifeformData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
      <Box
        sx={{
          p: 2,
          bgcolor: 'rgba(46, 125, 50, 0.03)',
          borderTop: '1px solid rgba(46, 125, 50, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <InfoIcon color="primary" fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          {lifeformData[0]?.name || 'N/A'} là dạng sống phổ biến nhất với {lifeformData[0]?.value || 0} loài.
        </Typography>
      </Box>
    </Card>
  );
};

const ValueCategoriesChart = ({ data }) => {
  if (!data || !data.properties || !data.properties.by_value) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography color="text.secondary">Không có dữ liệu về giá trị sử dụng</Typography>
      </Card>
    );
  }
  
  // Prepare value categories data
  const valueData = Object.entries(data.properties.by_value)
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      name: value,
      value: count
    }));

  return (
    <Card sx={{ 
      height: '100%', 
      boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        transform: 'translateY(-4px)'
      }
    }}>
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            fontWeight: 600, 
            color: 'primary.dark',
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              display: 'inline-block',
              width: 12,
              height: 30,
              backgroundColor: 'primary.main',
              marginRight: 2,
              borderRadius: 4
            }
          }}
        >
          Giá trị sử dụng
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Phân bố loài theo các giá trị sử dụng
        </Typography>
        
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={valueData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <RechartsTooltip formatter={(value) => [`${value} loài`, 'Số loài']} />
              <Bar 
                dataKey="value" 
                animationDuration={1500}
              >
                {valueData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={ACCENT_COLORS[index % ACCENT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
      <Box
        sx={{
          p: 2,
          bgcolor: 'rgba(156, 39, 176, 0.03)',
          borderTop: '1px solid rgba(156, 39, 176, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <InfoIcon color="secondary" fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          {valueData[0]?.name || 'N/A'} là giá trị sử dụng phổ biến nhất với {valueData[0]?.value || 0} loài.
        </Typography>
      </Box>
    </Card>
  );
};

// Placeholder components for other tabs
const TaxonomyTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 600, 
        color: 'primary.dark',
        position: 'relative',
        mb: 3,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -8,
          left: 0,
          width: '80px',
          height: '3px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #2e7d32, transparent)'
        }
      }}>
        Phân tích Phân loại học
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Alert severity="info">
        Chức năng phân tích phân loại học đang được phát triển. Vui lòng quay lại sau.
      </Alert>
    </Grid>
  </Grid>
);

const ConservationTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 600, 
        color: 'primary.dark',
        position: 'relative',
        mb: 3,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -8,
          left: 0,
          width: '80px',
          height: '3px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #2e7d32, transparent)'
        }
      }}>
        Phân tích tình trạng bảo tồn
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Alert severity="info">
        Chức năng phân tích tình trạng bảo tồn đang được phát triển. Vui lòng quay lại sau.
      </Alert>
    </Grid>
  </Grid>
);

const GeographicTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 600, 
        color: 'primary.dark',
        position: 'relative',
        mb: 3,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -8,
          left: 0,
          width: '80px',
          height: '3px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #2e7d32, transparent)'
        }
      }}>
        Phân tích phân bố địa lý
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Alert severity="info">
        Chức năng phân tích phân bố địa lý đang được phát triển. Vui lòng quay lại sau.
      </Alert>
    </Grid>
  </Grid>
);

const RelationshipsTab = ({ data }) => (
  <Grid container spacing={3}>
    <Grid item xs={12}>
      <Typography variant="h5" gutterBottom sx={{ 
        fontWeight: 600, 
        color: 'primary.dark',
        position: 'relative',
        mb: 3,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -8,
          left: 0,
          width: '80px',
          height: '3px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, #2e7d32, transparent)'
        }
      }}>
        Phân tích mối quan hệ thực vật
      </Typography>
    </Grid>
    <Grid item xs={12}>
      <Alert severity="info">
        Chức năng phân tích mối quan hệ thực vật đang được phát triển. Vui lòng quay lại sau.
      </Alert>
    </Grid>
  </Grid>
);

export default StatisticsDashboard;