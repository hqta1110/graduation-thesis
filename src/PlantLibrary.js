import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, IconButton, 
  Grid, Card, CardMedia, CardContent, Button, Paper, Chip, Pagination, 
  Fade, Zoom, Collapse, useMediaQuery, useTheme, Tooltip, 
  Tabs, Tab, CircularProgress, Alert, Stack, Divider, Container,
  SwipeableDrawer, Backdrop, Menu, MenuItem, ListItemIcon, 
  ListItemText, alpha, Dialog, DialogContent, SvgIcon,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import BookmarkIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import SortIcon from '@mui/icons-material/Sort';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import SpaIcon from '@mui/icons-material/Spa';
import NatureIcon from '@mui/icons-material/Nature';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import PlaceIcon from '@mui/icons-material/Place';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import CompareIcon from '@mui/icons-material/Compare';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import HeightIcon from '@mui/icons-material/Height';
import OpacityIcon from '@mui/icons-material/Opacity';
import LightModeIcon from '@mui/icons-material/LightMode';
import SendIcon from '@mui/icons-material/Send'; // Added missing SendIcon import
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined'; // Replace Eco with NatureOutlined

import PlantImageGallery from './PlantImageGallery';
import { PlantCardSkeleton, PlantDetailSkeleton, SearchSkeleton } from './SkeletonComponents';

// API endpoint and image constants
const API_URL = process.env.REACT_APP_API_URL || window.location.origin;
const PLACEHOLDER_IMAGE = '/placeholder.png';
const IMAGE_EXTENSION = '.jpg';
const ITEMS_PER_PAGE = 30;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// Ecological categories for the enhanced filter
const ECOLOGICAL_CATEGORIES = [
  { id: 'rainforest', name: 'Rừng mưa nhiệt đới', icon: <LocalFloristIcon /> },
  { id: 'highland', name: 'Vùng cao nguyên', icon: <SpaIcon /> },
  { id: 'coastal', name: 'Vùng duyên hải', icon: <OpacityIcon /> },
  { id: 'woodland', name: 'Rừng thưa', icon: <NatureIcon /> },
  { id: 'mountain', name: 'Vùng núi cao', icon: <HeightIcon /> },
  { id: 'lowland', name: 'Vùng đồng bằng', icon: <NatureOutlinedIcon /> },
  { id: 'sun_tolerant', name: 'Chịu nắng', icon: <LightModeIcon /> },
];

// Usage categories for the enhanced filter
const USAGE_CATEGORIES = [
  { id: 'medicinal', name: 'Dược liệu', icon: <FavoriteIcon /> },
  { id: 'food', name: 'Thực phẩm', icon: <LocalFloristIcon /> },
  { id: 'ornamental', name: 'Cây cảnh', icon: <WallpaperIcon /> },
  { id: 'ecological', name: 'Sinh thái', icon: <NatureOutlinedIcon /> },
  { id: 'industrial', name: 'Công nghiệp', icon: <CategoryIcon /> },
];

// Tree component for the immersive header (CSS-only stylized tree)
const TreeIcon = () => (
  <SvgIcon viewBox="0 0 100 120" sx={{ 
    width: 60, 
    height: 72, 
    color: 'primary.main', 
    filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.2))'
  }}>
    <path d="M50,10 C55,25 70,30 70,45 C70,55 60,65 50,65 C40,65 30,55 30,45 C30,30 45,25 50,10 Z" />
    <path d="M50,65 L50,110 L60,110 L60,120 L40,120 L40,110 L50,110" />
    <path d="M50,40 C55,40 65,45 68,50 L68,55 L74,50 M50,40 C45,40 35,45 32,50 L32,55 L26,50" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
    />
  </SvgIcon>
);

const PlantRelationships = React.memo(({ plantName, onSelectPlant }) => {
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  
  // Use useCallback to memoize the fetch function
  const fetchRelationships = useCallback(async () => {
    if (!plantName) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/plant-relationships?plant=${plantName}`);
      const data = await response.json();
      setRelationships(data.relationships || []);
    } catch (error) {
      console.error("Error fetching plant relationships:", error);
    } finally {
      setLoading(false);
    }
  }, [plantName]);
  
  // Use dependency array with memoized fetch function
  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);
  
  if (loading) return <PlantCardSkeleton variant="rectangular" height={200} />;
  
  if (!relationships.length) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mt: 3,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Typography variant="h6" gutterBottom>
          Cây thuốc liên quan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chưa có thông tin về các cây thuốc liên quan với {plantName}
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box 
      sx={{ 
        mt: 6,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -30,
          left: '10%',
          right: '10%',
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent)'
        }
      }}
    >
      <Typography variant="h5" gutterBottom color="primary.dark" sx={{ 
        textAlign: 'center',
        fontWeight: 600,
        position: 'relative',
        display: 'inline-block',
        '&::after': {
          content: '""',
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: '100%',
          height: '3px',
          borderRadius: '3px',
          background: 'linear-gradient(90deg, transparent, #2e7d32, transparent)'
        }
      }}>
        Cây thuốc liên quan với {plantName}
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 3 }}>
        {relationships.map((rel, index) => {
          // Determine which plant is the related one
          const isFromPlant = rel.plant_from_scientific === plantName;
          const relatedPlant = isFromPlant ? rel.plant_to_vietnamese : rel.plant_from_vietnamese;
          const relatedScientific = isFromPlant ? rel.plant_to_scientific : rel.plant_from_scientific;
          
          return (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                onClick={() => onSelectPlant({
                  scientificName: relatedScientific,
                  vietnameseName: relatedPlant
                })}
                sx={{ 
                  height: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:hover': {
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  }
                }}
              >
                <Box sx={{ 
                  p: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
                }}>
                  <Typography variant="h6" component="div" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600 }}>
                    {relatedPlant}
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 2 }}>
                    {relatedScientific}
                  </Typography>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {rel.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                    {rel.conditions.map((condition, idx) => (
                      <Chip 
                        key={idx} 
                        label={condition} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: '20px',
                          '&:hover': { boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
});

// Main PlantLibrary component
const PlantLibrary = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const gridRef = useRef(null);
  
  // Basic state
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [plantDetailLoading, setPlantDetailLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [answerLoading, setAnswerLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLetter, setSelectedLetter] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [imageLoadFailed, setImageLoadFailed] = useState({});
  const [zoomedImage, setZoomedImage] = useState(null);
  const [pageTransitioning, setPageTransitioning] = useState(false);
  const [cardsReady, setCardsReady] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [plantImages, setPlantImages] = useState([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  
  // Enhanced state for new features
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', 'mosaic'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: all, 1: ecological, 2: usage
  const [savedPlants, setSavedPlants] = useState([]); // For collection feature
  const [showingSaved, setShowingSaved] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    ecological: [],
    usage: [],
  });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [plantsToCompare, setPlantsToCompare] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [hoverCardId, setHoverCardId] = useState(null);
  
  // Animation related states
  const [searchFocused, setSearchFocused] = useState(false);
  const [letterBarHovered, setLetterBarHovered] = useState(false);
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
  
  // Check for stored selected plant from landing page
  useEffect(() => {
    const checkForSelectedPlant = async () => {
      const storedPlant = localStorage.getItem('selectedPlant');
      
      if (storedPlant) {
        try {
          const plant = JSON.parse(storedPlant);
          localStorage.removeItem('selectedPlant');
          
          if (plants.length > 0) {
            const matchingPlant = plants.find(p => p.scientificName === plant.scientificName);
            
            if (matchingPlant) {
              setTimeout(() => {
                handleSelectPlant(matchingPlant);
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }, 300);
            }
          }
        } catch (error) {
          console.error('Error handling selected plant from landing page:', error);
        }
      }
    };
    
    if (plants.length > 0 && !loading) {
      checkForSelectedPlant();
    }
  }, [plants, loading]);
  
  // Load saved plants from localStorage
  useEffect(() => {
    const loadSavedPlants = () => {
      const saved = localStorage.getItem('savedPlants');
      if (saved) {
        try {
          setSavedPlants(JSON.parse(saved));
        } catch (error) {
          console.error('Error loading saved plants:', error);
        }
      }
    };
    
    loadSavedPlants();
  }, []);
  
  // Save plants to localStorage when updated
  useEffect(() => {
    if (savedPlants.length > 0) {
      localStorage.setItem('savedPlants', JSON.stringify(savedPlants));
    }
  }, [savedPlants]);
  
  // Fetch plant images
  const fetchPlantImages = async (scientificName) => {
    if (!scientificName) return;
    
    setImagesLoading(true);
    try {
      const apiUrl = `${API_URL}/api/plant-images/${encodeURIComponent(scientificName)}`;
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch images (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      
      if (data.images && data.images.length > 0) {
        const processedImages = data.images.map(img => {
          const fullPath = img.path || '';
          const pathParts = fullPath.split('/');
          const speciesFolder = pathParts[pathParts.length - 2];
          const filename = pathParts[pathParts.length - 1];
          const processedPath = `/plant-images/${encodeURIComponent(speciesFolder)}/${filename}`;
          
          return {
            ...img,
            original_path: img.path,
            path: processedPath,
            is_primary: img.is_primary || false,
            order: img.order || 0
          };
        });
        
        setPlantImages(processedImages);
      } else {
        setPlantImages([{ 
          path: selectedPlant.imagePath,
          filename: 'representative.jpg',
          is_primary: true,
          order: 1
        }]);
      }
    } catch (error) {
      console.error('Error in fetchPlantImages:', error);
    } finally {
      setImagesLoading(false);
    }
  };
  
  // Get representative image path
  const getRepresentativeImagePath = (label) => {
    const safeLabel = label.replace(/\s+/g, '_');
    return `/representative_images/${safeLabel}${IMAGE_EXTENSION}`;
  };
  
  // Calculate paged plants for current view
  const currentPagePlants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPlants.slice(startIndex, endIndex);
  }, [filteredPlants, currentPage]);
  
  // Count plants by first letter for the letter navigation
  const letterCounts = useMemo(() => {
    const counts = {};
    ALPHABET.forEach(letter => {
      counts[letter] = filteredPlants.filter(plant => 
        plant.scientificName.charAt(0).toUpperCase() === letter ||
        plant.vietnameseName.charAt(0).toUpperCase() === letter
      ).length;
    });
    return counts;
  }, [filteredPlants]);
  
  // Sort plants list by various criteria
  const sortPlantsList = (plantsList) => {
    return [...plantsList].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.scientificName.localeCompare(b.scientificName);
      }
      return b.scientificName.localeCompare(a.scientificName);
    });
  };
  
  // Fetch plant metadata from backend
  useEffect(() => {
    const fetchPlantMetadata = async () => {
      setLoading(true);
      setInitialLoading(true);
      setError(null);
      
      try {
        const fetchPromise = fetch(`${API_URL}/api/plants`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          }
        });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
        );
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch plants (HTTP ${response.status}): ${response.statusText}`);
        }
        
        const metadataJson = await response.json();
        
        if (!metadataJson || typeof metadataJson !== 'object') {
          throw new Error('Invalid metadata format received from server');
        }
        
        const plantsList = Object.entries(metadataJson).map(([scientificName, metadata], index) => {
          metadata = metadata || {};
          
          // Extract habitat information for filtering
          const habitatInfo = (metadata["Phân bố"] || "").toLowerCase();
          const habitats = [];
          
          ECOLOGICAL_CATEGORIES.forEach(category => {
            // Add simple keyword matching for demo
            if (habitatInfo.includes(category.id) || 
                habitatInfo.includes(category.name.toLowerCase())) {
              habitats.push(category.id);
            }
          });
          
          // Extract usage information for filtering
          const usageInfo = (metadata["Giá trị"] || "").toLowerCase();
          const uses = [];
          
          USAGE_CATEGORIES.forEach(category => {
            if (usageInfo.includes(category.id) || 
                usageInfo.includes(category.name.toLowerCase())) {
              uses.push(category.id);
            }
          });
          
          return {
            id: index + 1,
            scientificName: scientificName,
            vietnameseName: (metadata["Tên tiếng Việt"] || "Không có tên tiếng Việt").split(';')[0].replace(/\s+sp2?$/i, '').trim(),
            synonyms: metadata["Tên đồng nghĩa"] || "Không có thông tin",
            distribution: metadata["Phân bố"] || "Không có thông tin",
            biology: metadata["Sinh học & Sinh thái"] || "Không có thông tin",
            value: metadata["Giá trị"] || "Không có thông tin",
            conservationStatus: metadata["Tình trạng bảo tồn"] || "Không có thông tin",
            lifeform: metadata["Dạng sống"] || "Không có thông tin",
            description: metadata["Mô tả"] || "Không có thông tin",
            familyScientific: metadata["Tên họ khoa học"] || "Không có thông tin",
            familyVietnamese: metadata["Tên họ tiếng Việt"] || "Không có thông tin",
            divisionScientific: metadata["Tên ngành khoa học"] || "Không có thông tin",
            divisionVietnamese: metadata["Tên ngành tiếng Việt"] || "Không có thông tin",
            imagePath: getRepresentativeImagePath(scientificName),
            // Add enhanced filter fields
            habitats: habitats,
            uses: uses,
            category: metadata["Tên họ tiếng Việt"] || ""
          };
        });
        
        const sortedPlants = sortPlantsList(plantsList);
        
        setPlants(sortedPlants);
        setFilteredPlants(sortedPlants);
      } catch (error) {
        console.error('Error fetching plant metadata:', error);
        setError(`Không thể tải dữ liệu: ${error.message}`);
        setPlants([]);
        setFilteredPlants([]);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setInitialLoading(false);
          setTimeout(() => {
            setCardsReady(true);
          }, 100);
        }, 800);
      }
    };

    fetchPlantMetadata();
  }, []);

  // Toggle plant save state
  const toggleSavePlant = (plant, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    const isAlreadySaved = savedPlants.some(p => p.id === plant.id);
    
    if (isAlreadySaved) {
      setSavedPlants(savedPlants.filter(p => p.id !== plant.id));
    } else {
      setSavedPlants([...savedPlants, plant]);
    }
  };
  
  // Add plant to comparison
  const toggleCompare = (plant, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    const isAlreadyComparing = plantsToCompare.some(p => p.id === plant.id);
    
    if (isAlreadyComparing) {
      setPlantsToCompare(plantsToCompare.filter(p => p.id !== plant.id));
    } else {
      if (plantsToCompare.length < 3) {
        setPlantsToCompare([...plantsToCompare, plant]);
      } else {
        // Could show notification that max is 3
      }
    }
  };
  
  // Handle search functionality with enhanced filtering
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);
    
    applyFilters(query, selectedFilters, categoryFilter);
  };
  
  // Apply all filters
  const applyFilters = (query = searchQuery, filters = selectedFilters, category = categoryFilter) => {
    let filtered = [...plants];
    
    // Text search
    if (query.trim() !== '') {
      filtered = filtered.filter(
        plant => 
          plant.vietnameseName.toLowerCase().includes(query) || 
          plant.scientificName.toLowerCase().includes(query) ||
          plant.familyVietnamese.toLowerCase().includes(query) ||
          plant.familyScientific.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (category) {
      filtered = filtered.filter(plant => 
        plant.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    // Ecological filter
    if (filters.ecological.length > 0) {
      filtered = filtered.filter(plant => 
        filters.ecological.some(habitat => plant.habitats.includes(habitat))
      );
    }
    
    // Usage filter
    if (filters.usage.length > 0) {
      filtered = filtered.filter(plant => 
        filters.usage.some(use => plant.uses.includes(use))
      );
    }
    
    // Show saved plants only
    if (showingSaved) {
      const savedIds = savedPlants.map(plant => plant.id);
      filtered = filtered.filter(plant => savedIds.includes(plant.id));
    }
    
    // Letter filter
    if (selectedLetter) {
      filtered = filtered.filter(plant => 
        plant.scientificName.charAt(0).toUpperCase() === selectedLetter ||
        plant.vietnameseName.charAt(0).toUpperCase() === selectedLetter
      );
    }
    
    // Sort the results
    filtered = sortPlantsList(filtered);
    
    setFilteredPlants(filtered);
  };
  
  // Update filters by category
  const handleFilterToggle = (category, filterId) => {
    const newFilters = { ...selectedFilters };
    
    if (newFilters[category].includes(filterId)) {
      newFilters[category] = newFilters[category].filter(id => id !== filterId);
    } else {
      newFilters[category] = [...newFilters[category], filterId];
    }
    
    setSelectedFilters(newFilters);
    applyFilters(searchQuery, newFilters, categoryFilter);
  };
  
  // Handle category filter change
  const handleCategoryChange = (category) => {
    setCategoryFilter(category);
    applyFilters(searchQuery, selectedFilters, category);
  };
  
  // Toggle saved plants filter
  const toggleSavedFilter = () => {
    const newShowingSaved = !showingSaved;
    setShowingSaved(newShowingSaved);
    applyFilters(searchQuery, selectedFilters, categoryFilter);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedLetter('');
    setSelectedFilters({ ecological: [], usage: [] });
    setCategoryFilter('');
    setShowingSaved(false);
    setFilteredPlants(sortPlantsList(plants));
    setCurrentPage(1);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPageTransitioning(true);
    setTimeout(() => {
      setCurrentPage(value);
      setPageTransitioning(false);
      window.scrollTo({
        top: document.getElementById('plant-list-top')?.offsetTop || 0,
        behavior: 'smooth'
      });
    }, 300);
  };
  
  // Handle letter filter click
  const handleLetterClick = (letter) => {
    if (selectedLetter === letter) {
      setSelectedLetter('');
      applyFilters(searchQuery, selectedFilters, categoryFilter);
    } else {
      setSelectedLetter(letter);
      const newFiltered = plants.filter(plant => 
        plant.scientificName.charAt(0).toUpperCase() === letter ||
        plant.vietnameseName.charAt(0).toUpperCase() === letter
      );
      setFilteredPlants(sortPlantsList(newFiltered));
    }
    setCurrentPage(1);
  };
  
  // Toggle sort order
  const toggleSort = () => {
    setPageTransitioning(true);
    
    setTimeout(() => {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
      
      const sortedPlants = [...filteredPlants].sort((a, b) => {
        if (newSortOrder === 'asc') {
          return a.scientificName.localeCompare(b.scientificName);
        } else {
          return b.scientificName.localeCompare(a.scientificName);
        }
      });
      
      setFilteredPlants(sortedPlants);
      setCurrentPage(1);
      setPageTransitioning(false);
    }, 300);
  };
  
  // Handle plant selection
  const handleSelectPlant = (plant) => {
    setPageTransitioning(true);
    setTimeout(() => {
      setPlantDetailLoading(true);
      setSelectedPlant(plant);
      setQuestion('');
      setAnswer('');
      setCurrentImageIndex(0);
      setPlantImages([]);
      setPageTransitioning(false);
      
      fetchPlantImages(plant.scientificName);
      
      setTimeout(() => {
        setPlantDetailLoading(false);
      }, 500);
    }, 300);
  };
  
  // Go back to plant list with animation
  const handleBackToList = () => {
    setPageTransitioning(true);
    setTimeout(() => {
      setSelectedPlant(null);
      setPageTransitioning(false);
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 300);
  };
  
  // Handle image loading errors
  const handleImageError = (event) => {
    const plantId = event.target.dataset.plantId;
    if (plantId) {
      setImageLoadFailed(prev => ({...prev, [plantId]: true}));
    }
    
    if (!event.target.src.includes(PLACEHOLDER_IMAGE)) {
      event.target.src = PLACEHOLDER_IMAGE;
      event.target.alt = 'Hình ảnh không có sẵn';
    }
  };
  
  // Handle image zoom
  const handleImageZoom = (imagePath, event) => {
    if (event) {
      event.stopPropagation();
    }
    setZoomedImage(imagePath);
  };
  
  // Close zoomed image
  const handleCloseZoom = () => {
    setZoomedImage(null);
  };
  
  // Handle menu click
  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  // Close menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  // Handle question submission
  const handleAskQuestion = async () => {
    if (!question.trim()) return;

    setAnswerLoading(true);
    setAnswer('');

    try {
      const response = await fetch(`${API_URL}/api/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: selectedPlant.scientificName,
          question: question,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get answer (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      setAnswer(data.answer);
    } catch (error) {
      console.error('Error getting answer:', error);
      setAnswer('Rất tiếc, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.');
    } finally {
      setAnswerLoading(false);
    }
  };
  
  // Create staggered card animation 
  const getCardDelay = (index) => {
    const baseDelay = 30;
    if (viewMode === 'grid') {
      // For grid view, stagger in a grid pattern
      const rowDelay = Math.floor(index / 3) * baseDelay;
      const colDelay = (index % 3) * baseDelay;
      return rowDelay + colDelay;
    } else if (viewMode === 'mosaic') {
      // For mosaic view, stagger from center outward
      return Math.abs(index - (currentPagePlants.length / 2)) * baseDelay;
    } else {
      // For list view, simple top to bottom stagger
      return index * baseDelay;
    }
  };
  
  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    handleMenuClose();
  };
  
  // Render plant cards based on view mode
  const renderPlantCard = (plant, index) => {
    const isPlantSaved = savedPlants.some(p => p.id === plant.id);
    const isComparing = plantsToCompare.some(p => p.id === plant.id);
    const isHovered = hoverCardId === plant.id;
    
    switch (viewMode) {
      case 'list':
        // List view - horizontal cards with more details
        return (
          <Fade in={cardsReady && !pageTransitioning} timeout={600}>
            <Card 
              onMouseEnter={() => setHoverCardId(plant.id)}
              onMouseLeave={() => setHoverCardId(null)}
              onClick={() => handleSelectPlant(plant)}
              sx={{
                display: 'flex',
                mb: 2,
                borderRadius: 4,
                overflow: 'hidden',
                height: 160,
                cursor: 'pointer',
                boxShadow: isHovered 
                  ? '0 8px 30px rgba(0,0,0,0.15)' 
                  : '0 4px 12px rgba(0,0,0,0.08)',
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                border: isComparing ? `2px solid ${theme.palette.secondary.main}` : 'none',
                position: 'relative'
              }}
            >
              <Box 
                sx={{ 
                  width: { xs: 120, sm: 160 }, 
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                <CardMedia
                  component="img"
                  height="160"
                  image={imageLoadFailed[plant.id] ? PLACEHOLDER_IMAGE : plant.imagePath}
                  alt={plant.vietnameseName}
                  data-plant-id={plant.id}
                  onError={handleImageError}
                  sx={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                    },
                    opacity: isPlantSaved || isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.2s ease',
                    transform: isPlantSaved ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={(e) => toggleSavePlant(plant, e)}
                >
                  {isPlantSaved ? <BookmarkAddedIcon color="secondary" /> : <BookmarkIcon />}
                </IconButton>
              </Box>
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                p: 2, 
                width: '100%',
                position: 'relative'
              }}>
                <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: 'primary.dark' }}>
                  {plant.vietnameseName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                  {plant.scientificName}
                </Typography>
                
                <Divider sx={{ my: 1, width: '40%' }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                  <Typography variant="body2" color="text.secondary">
                    Họ: {plant.familyVietnamese}
                  </Typography>
                  
                  <Chip 
                    label={isComparing ? "Đang so sánh" : "So sánh"} 
                    size="small"
                    color={isComparing ? "secondary" : "default"}
                    onClick={(e) => toggleCompare(plant, e)}
                    sx={{ 
                      opacity: isComparing || isHovered ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                      height: 24
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Fade>
        );
        
      case 'mosaic':
        // Mosaic view - dynamic sizes in a Pinterest-like layout
        const isBig = index % 5 === 0 || index % 5 === 3;
        return (
          <Zoom 
            in={cardsReady && !pageTransitioning} 
            style={{ 
              transitionDelay: `${getCardDelay(index)}ms`,
              transitionDuration: '700ms'
            }}
          >
            <Card 
              onMouseEnter={() => setHoverCardId(plant.id)}
              onMouseLeave={() => setHoverCardId(null)}
              onClick={() => handleSelectPlant(plant)}
              sx={{
                height: '100%',
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.15)' : '0 6px 16px rgba(0,0,0,0.08)',
                transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                border: isComparing ? `2px solid ${theme.palette.secondary.main}` : 'none',
              }}
            >
              <Box sx={{ position: 'relative', height: isBig ? 260 : 200, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height={isBig ? 260 : 200}
                  image={imageLoadFailed[plant.id] ? PLACEHOLDER_IMAGE : plant.imagePath}
                  alt={plant.vietnameseName}
                  data-plant-id={plant.id}
                  onError={handleImageError}
                  sx={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                
                <Box sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0,
                  p: 2,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white'
                }}>
                  <Typography variant="h6" component="div" sx={{ 
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}>
                    {plant.vietnameseName}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    fontStyle: 'italic',
                    opacity: 0.9,
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                  }}>
                    {plant.scientificName}
                  </Typography>
                </Box>
                
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    opacity: isPlantSaved || isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.2s ease',
                    transform: isPlantSaved ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={(e) => toggleSavePlant(plant, e)}
                >
                  {isPlantSaved ? <BookmarkAddedIcon color="secondary" /> : <BookmarkIcon />}
                </IconButton>
                
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: isComparing ? theme.palette.secondary.main : 'rgba(255,255,255,0.8)',
                    color: isComparing ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: isComparing ? theme.palette.secondary.dark : 'rgba(255,255,255,0.95)',
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    opacity: isComparing || isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.2s ease',
                    transform: isComparing ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={(e) => toggleCompare(plant, e)}
                >
                  <CompareIcon />
                </IconButton>
              </Box>
            </Card>
          </Zoom>
        );
        
      case 'grid':
      default:
        // Grid view (default) - uniform sized cards
        return (
          <Zoom 
            in={cardsReady && !pageTransitioning} 
            style={{ 
              transitionDelay: `${getCardDelay(index)}ms`,
              transitionDuration: '500ms'
            }}
          >
            <Card 
              onMouseEnter={() => setHoverCardId(plant.id)}
              onMouseLeave={() => setHoverCardId(null)}
              onClick={() => handleSelectPlant(plant)}
              sx={{
                height: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.15)' : '0 6px 16px rgba(0,0,0,0.08)',
                transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                border: isComparing ? `2px solid ${theme.palette.secondary.main}` : 'none',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Box sx={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={imageLoadFailed[plant.id] ? PLACEHOLDER_IMAGE : plant.imagePath}
                  alt={plant.vietnameseName}
                  data-plant-id={plant.id}
                  onError={handleImageError}
                  sx={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)'
                  }}
                />
                
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    opacity: isPlantSaved || isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.2s ease',
                    transform: isPlantSaved ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={(e) => toggleSavePlant(plant, e)}
                >
                  {isPlantSaved ? <BookmarkAddedIcon color="secondary" /> : <BookmarkIcon />}
                </IconButton>
                
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: isComparing ? theme.palette.secondary.main : 'rgba(255,255,255,0.8)',
                    color: isComparing ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: isComparing ? theme.palette.secondary.dark : 'rgba(255,255,255,0.95)',
                    },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    opacity: isComparing || isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease, transform 0.2s ease',
                    transform: isComparing ? 'scale(1.1)' : 'scale(1)'
                  }}
                  onClick={(e) => toggleCompare(plant, e)}
                >
                  <CompareIcon />
                </IconButton>
              </Box>
              
              <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" component="div" sx={{ 
                  color: 'primary.dark',
                  fontWeight: 600,
                  mb: 0.5
                }}>
                  {plant.vietnameseName}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                  <i>{plant.scientificName}</i>
                </Typography>
                
                <Divider sx={{ my: 1, width: '30%' }} />
                
                <Typography variant="body2" sx={{ mt: 'auto' }}>
                  Họ: {plant.familyVietnamese} ({plant.familyScientific})
                </Typography>
              </CardContent>
            </Card>
          </Zoom>
        );
    }
  };

  // Render the filter drawer content
  const renderFilterDrawer = () => (
    <Box
      sx={{ width: { xs: 280, sm: 350 }, p: 3 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.dark' }}>
        Bộ lọc thực vật
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Tất cả" />
        <Tab label="Sinh thái" />
        <Tab label="Công dụng" />
      </Tabs>
      
      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Bộ sưu tập
          </Typography>
          <Button
            fullWidth
            variant={showingSaved ? "contained" : "outlined"}
            color="primary"
            startIcon={<BookmarkAddedIcon />}
            onClick={toggleSavedFilter}
            sx={{ mb: 2 }}
          >
            {showingSaved ? "Đang hiển thị đã lưu" : "Hiển thị đã lưu"}
          </Button>
          
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Họ thực vật
          </Typography>
          <TextField
            select
            fullWidth
            label="Chọn họ thực vật"
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">
              <em>Tất cả</em>
            </MenuItem>
            {Array.from(new Set(plants.map(plant => plant.familyVietnamese)))
              .sort()
              .map((family) => (
                <MenuItem key={family} value={family}>{family}</MenuItem>
              ))}
          </TextField>
          
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={handleClearSearch}
            sx={{ mt: 2 }}
          >
            Xóa tất cả bộ lọc
          </Button>
        </Box>
      )}
      
      {activeTab === 1 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Theo sinh cảnh
          </Typography>
          
          <Stack spacing={1.5}>
            {ECOLOGICAL_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                icon={category.icon}
                label={category.name}
                clickable
                onClick={() => handleFilterToggle('ecological', category.id)}
                color={selectedFilters.ecological.includes(category.id) ? "primary" : "default"}
                variant={selectedFilters.ecological.includes(category.id) ? "filled" : "outlined"}
                sx={{ 
                  height: 36,
                  '& .MuiChip-label': { px: 1 }, 
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
      
      {activeTab === 2 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Theo công dụng
          </Typography>
          
          <Stack spacing={1.5}>
            {USAGE_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                icon={category.icon}
                label={category.name}
                clickable
                onClick={() => handleFilterToggle('usage', category.id)}
                color={selectedFilters.usage.includes(category.id) ? "secondary" : "default"}
                variant={selectedFilters.usage.includes(category.id) ? "filled" : "outlined"}
                sx={{ 
                  height: 36,
                  '& .MuiChip-label': { px: 1 }, 
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
  
  // Render error state
  if (error && !loading) {
    return (
      <Fade in={true} timeout={800}>
        <Box className="plant-library" sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
              >
                Tải lại
              </Button>
            }
          >
            <Typography variant="subtitle1" gutterBottom>
              Không thể tải dữ liệu thư viện cây
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>
          
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              p: 5
            }}
          >
            <Box sx={{ fontSize: 80, mb: 3, color: 'error.main', animation: 'pulse 2s infinite ease-in-out' }}>
              🍂
            </Box>
            <Typography variant="h5" gutterBottom align="center">
              Không thể kết nối đến máy chủ
            </Typography>
            <Typography variant="body1" align="center" paragraph>
              Hãy kiểm tra kết nối mạng và thử làm mới trang
            </Typography>
            <Button 
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  transition: '0.5s',
                },
                '&:hover::after': {
                  left: '100%',
                }
              }}
            >
              Thử lại
            </Button>
          </Box>
        </Box>
      </Fade>
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
      {!selectedPlant ? (
        // Plant library list view
        <Fade in={true} timeout={600}>
          <Box>
            {/* Immersive Header with Moving Parallax Effect */}
            <Box 
              sx={{
                position: 'relative',
                bgcolor: 'primary.main',
                py: { xs: 6, md: 8 },
                mb: 4,
                overflow: 'hidden',
                transform: headerScrolled ? 'translateY(-15px) scale(0.98)' : 'translateY(0) scale(1)',
                boxShadow: headerScrolled ? '0 10px 30px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.5s ease',
                height: { xs: 220, sm: 250, md: 320 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: 'url("/forest-bg.jpg")',
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
                    transform: headerScrolled ? 'translateY(0)' : 'translateY(0)',
                    transition: 'transform 0.5s ease',
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
                      Thư viện Thực vật
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
                      Khám phá các loài thực vật đa dạng tại rừng Đà Nẵng - Quảng Nam
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: { xs: 'none', md: 'flex' },
                    gap: { md: 3, lg: 4 },
                    transform: headerScrolled ? 'translateX(20px) scale(0.95)' : 'translateX(0) scale(1)',
                    transition: 'transform 0.5s ease'
                  }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Box 
                        key={i} 
                        sx={{ 
                          animation: `float ${2 + i * 0.3}s infinite ease-in-out alternate`,
                          animationDelay: `${i * 0.2}s`,
                          transform: `scale(${0.8 + i * 0.1}) translateY(${i * 5}px)`,
                          '@keyframes float': {
                            '0%': { transform: `scale(${0.8 + i * 0.1}) translateY(${i * 5}px)` },
                            '100%': { transform: `scale(${0.8 + i * 0.1}) translateY(${i * 5 - 10}px)` }
                          }
                        }}
                      >
                        <TreeIcon />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Container>
            </Box>
            
            <Container maxWidth="xl">
              {/* Search and Filter Tools */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  alignItems: 'stretch',
                  gap: 2, 
                  mb: 4,
                  position: 'relative',
                  zIndex: 2,
                  mt: { xs: -6, sm: -7, md: -8 },
                  transform: headerScrolled ? 'translateY(5px)' : 'translateY(0)',
                  transition: 'transform 0.5s ease',
                }}
              >
                {initialLoading ? (
                  <SearchSkeleton />
                ) : (
                  <>
                    <Paper
                      elevation={6}
                      sx={{ 
                        flexGrow: 1,
                        borderRadius: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        p: '4px',
                        pl: 2,
                        boxShadow: searchFocused ? '0 8px 25px rgba(0,0,0,0.15)' : '0 4px 15px rgba(0,0,0,0.1)',
                        transition: 'all 0.3s ease',
                        transform: searchFocused ? 'translateY(-3px)' : 'none',
                      }}
                    >
                      <SearchIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
                      <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Tìm kiếm tên cây, họ thực vật..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        InputProps={{
                          disableUnderline: true,
                          sx: { 
                            fontSize: '1.1rem',
                            py: 1,
                          }
                        }}
                      />
                      {searchQuery && (
                        <IconButton 
                          onClick={handleClearSearch} 
                          edge="end"
                          sx={{
                            transition: 'transform 0.2s ease',
                            '&:hover': {
                              transform: 'rotate(90deg)'
                            }
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      )}
                    </Paper>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<FilterListIcon />}
                        onClick={toggleDrawer(true)}
                        sx={{ 
                          borderRadius: '50px',
                          px: 3,
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                          }
                        }}
                      >
                        {isMobile ? '' : 'Bộ lọc'}
                        {(selectedFilters.ecological.length > 0 || 
                          selectedFilters.usage.length > 0 || 
                          showingSaved || 
                          categoryFilter) && (
                          <Box 
                            component="span" 
                            sx={{ 
                              ml: 1, 
                              bgcolor: 'white', 
                              color: 'primary.main',
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '0.8rem'
                            }}
                          >
                            {selectedFilters.ecological.length + 
                              selectedFilters.usage.length + 
                              (showingSaved ? 1 : 0) + 
                              (categoryFilter ? 1 : 0)
                            }
                          </Box>
                        )}
                      </Button>
                      
                      <IconButton 
                        onClick={handleMenuClick}
                        sx={{ 
                          bgcolor: 'white',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                          '&:hover': {
                            bgcolor: alpha(theme.palette.background.paper, 0.9),
                          }
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      
                      <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                          elevation: 3,
                          sx: { borderRadius: 2, minWidth: 200 }
                        }}
                      >
                        <MenuItem onClick={() => handleViewModeChange('grid')}>
                          <ListItemIcon>
                            <ViewModuleIcon color={viewMode === 'grid' ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText primary="Dạng lưới" />
                        </MenuItem>
                        <MenuItem onClick={() => handleViewModeChange('list')}>
                          <ListItemIcon>
                            <ViewListIcon color={viewMode === 'list' ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText primary="Dạng danh sách" />
                        </MenuItem>
                        <MenuItem onClick={() => handleViewModeChange('mosaic')}>
                          <ListItemIcon>
                            <ViewQuiltIcon color={viewMode === 'mosaic' ? 'primary' : 'inherit'} />
                          </ListItemIcon>
                          <ListItemText primary="Dạng khảm" />
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={toggleSort}>
                          <ListItemIcon>
                            <SortIcon />
                          </ListItemIcon>
                          <ListItemText primary={sortOrder === 'asc' ? "Sắp xếp Z → A" : "Sắp xếp A → Z"} />
                        </MenuItem>
                      </Menu>
                    </Box>
                  </>
                )}
              </Box>
              
              {/* Applied Filters Display */}
              {(selectedFilters.ecological.length > 0 || 
                selectedFilters.usage.length > 0 || 
                showingSaved || 
                categoryFilter || 
                selectedLetter) && (
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Bộ lọc:
                  </Typography>
                  
                  {selectedLetter && (
                    <Chip 
                      label={`Chữ cái: ${selectedLetter}`}
                      onDelete={() => handleLetterClick(selectedLetter)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                  
                  {showingSaved && (
                    <Chip 
                      label="Đã lưu"
                      icon={<BookmarkAddedIcon />}
                      onDelete={() => toggleSavedFilter()}
                      color="secondary"
                      size="small"
                    />
                  )}
                  
                  {categoryFilter && (
                    <Chip 
                      label={`Họ: ${categoryFilter}`}
                      onDelete={() => handleCategoryChange('')}
                      color="primary"
                      size="small"
                    />
                  )}
                  
                  {selectedFilters.ecological.map(filterId => {
                    const category = ECOLOGICAL_CATEGORIES.find(c => c.id === filterId);
                    return (
                      <Chip 
                        key={filterId}
                        label={category?.name}
                        icon={category?.icon}
                        onDelete={() => handleFilterToggle('ecological', filterId)}
                        color="primary"
                        size="small"
                      />
                    );
                  })}
                  
                  {selectedFilters.usage.map(filterId => {
                    const category = USAGE_CATEGORIES.find(c => c.id === filterId);
                    return (
                      <Chip 
                        key={filterId}
                        label={category?.name}
                        icon={category?.icon}
                        onDelete={() => handleFilterToggle('usage', filterId)}
                        color="secondary"
                        size="small"
                      />
                    );
                  })}
                  
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={handleClearSearch}
                    sx={{ ml: 'auto' }}
                  >
                    Xóa tất cả
                  </Button>
                </Box>
              )}
              
              {/* Alphabet Filter - now always visible */}
              <Box 
                sx={{ 
                  overflowX: 'auto', 
                  mb: 4, 
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: alpha(theme.palette.primary.main, 0.3),
                    borderRadius: '4px',
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.5),
                    }
                  }
                }}
                onMouseEnter={() => setLetterBarHovered(true)}
                onMouseLeave={() => setLetterBarHovered(false)}
              >
                {!initialLoading && (
                  <Stack 
                    direction="row" 
                    spacing={0.6} 
                    sx={{ 
                      minWidth: 'max-content',
                      flexWrap: 'nowrap', 
                      justifyContent: 'flex-start',
                      transition: 'transform 0.3s ease',
                      transform: letterBarHovered ? 'translateY(-3px)' : 'translateY(0)',
                      py: 1
                    }}
                  >
                    {ALPHABET.map((letter, index) => (
                      <Zoom 
                        in={true} 
                        key={letter}
                        style={{ 
                          transitionDelay: `${index * 15}ms`,
                          transitionDuration: '0.4s'
                        }}
                      >
                        <Box
                          onClick={() => handleLetterClick(letter)}
                          sx={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            cursor: letterCounts[letter] > 0 ? 'pointer' : 'default',
                            opacity: letterCounts[letter] > 0 ? 1 : 0.3,
                            backgroundColor: selectedLetter === letter 
                              ? 'primary.main' 
                              : letterBarHovered && letterCounts[letter] > 0
                                ? alpha(theme.palette.primary.main, 0.1)
                                : 'transparent',
                            color: selectedLetter === letter ? 'white' : 'inherit',
                            fontWeight: selectedLetter === letter ? 600 : 400,
                            boxShadow: selectedLetter === letter ? '0 4px 10px rgba(46, 125, 50, 0.2)' : 'none',
                            transition: 'all 0.2s ease',
                            '&:hover': letterCounts[letter] > 0 ? {
                              transform: selectedLetter === letter ? 'scale(1.1)' : 'scale(1.05)',
                              backgroundColor: selectedLetter === letter 
                                ? 'primary.main' 
                                : alpha(theme.palette.primary.main, 0.15),
                              boxShadow: selectedLetter === letter 
                                ? '0 6px 12px rgba(46, 125, 50, 0.25)'
                                : '0 2px 8px rgba(46, 125, 50, 0.1)',
                            } : {},
                            ...(selectedLetter === letter && {
                              transform: 'scale(1.05)',
                            })
                          }}
                        >
                          {letter}
                          {letterCounts[letter] > 0 && letterCounts[letter] > 10 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: -3,
                                right: -3,
                                backgroundColor: 'secondary.main',
                                color: 'white',
                                borderRadius: '50%',
                                width: 16,
                                height: 16,
                                fontSize: '0.6rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                opacity: letterBarHovered ? 1 : 0,
                                transform: letterBarHovered ? 'scale(1)' : 'scale(0.8)',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              {Math.min(letterCounts[letter], 99)}
                            </Box>
                          )}
                        </Box>
                      </Zoom>
                    ))}
                  </Stack>
                )}
              </Box>
              
              {/* Compare Plants Panel */}
              <Collapse in={plantsToCompare.length > 0} timeout={500}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    mb: 4, 
                    p: 2,
                    borderRadius: 3,
                    background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.98))',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                    boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.15)}`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="secondary.dark" sx={{ fontWeight: 600 }}>
                      So sánh các loài thực vật ({plantsToCompare.length}/3)
                    </Typography>
                    <Button 
                      variant="text" 
                      size="small" 
                      color="secondary"
                      onClick={() => setPlantsToCompare([])}
                    >
                      Hủy so sánh
                    </Button>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {plantsToCompare.map((plant) => (
                      <Grid item xs={12} sm={4} key={plant.id}>
                        <Card sx={{ 
                          display: 'flex', 
                          height: '100%',
                          borderRadius: 2,
                          boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.15)}`
                        }}>
                          <CardMedia
                            component="img"
                            sx={{ width: 80 }}
                            image={imageLoadFailed[plant.id] ? PLACEHOLDER_IMAGE : plant.imagePath}
                            alt={plant.vietnameseName}
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', p: 1.5, width: '100%' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {plant.vietnameseName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontStyle: 'italic' }}>
                              {plant.scientificName}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 'auto', fontSize: '0.8rem' }}>
                              Họ: {plant.familyVietnamese}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                              <IconButton 
                                size="small" 
                                onClick={() => toggleCompare(plant)}
                                color="secondary"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Collapse>
              
              {/* Plant List Header with Count */}
              <Box sx={{ mb: 2 }} id="plant-list-top">
                {!initialLoading && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Typography 
                      variant="h5" 
                      component="h2" 
                      gutterBottom={false}
                      sx={{ 
                        fontWeight: 600, 
                        color: 'primary.dark',
                        position: 'relative',
                        display: 'inline-block',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: -8,
                          left: 0,
                          width: selectedLetter ? '100%' : '70%',
                          height: '3px',
                          borderRadius: '3px',
                          background: 'linear-gradient(90deg, #2e7d32, transparent)',
                          transition: 'width 0.5s ease'
                        }
                      }}
                    >
                      Danh sách thực vật ({filteredPlants.length})
                      {selectedLetter && ` - Bắt đầu với "${selectedLetter}"`}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        icon={<ViewModuleIcon />} 
                        label={viewMode === 'grid' ? 'Lưới' : viewMode === 'list' ? 'Danh sách' : 'Khảm'}
                        size="small"
                        color="primary"
                        variant="outlined"
                        onClick={handleMenuClick}
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                      />
                      
                      {plantsToCompare.length > 0 && (
                        <Chip 
                          icon={<CompareIcon />} 
                          label={`So sánh (${plantsToCompare.length})`}
                          size="small"
                          color="secondary"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        />
                      )}
                      
                      {savedPlants.length > 0 && (
                        <Chip 
                          icon={<BookmarkAddedIcon />} 
                          label={`Đã lưu (${savedPlants.length})`}
                          size="small"
                          color={showingSaved ? "secondary" : "default"}
                          onClick={toggleSavedFilter}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
              
              {/* Main Plant Grid */}
              {loading ? (
                <Grid container spacing={3}>
                  {Array(9).fill(0).map((_, idx) => (
                    <Grid item xs={12} sm={6} md={4} key={`skeleton-${idx}`}>
                      <PlantCardSkeleton />
                    </Grid>
                  ))}
                </Grid>
              ) : filteredPlants.length === 0 ? (
                <Fade in={true} timeout={800}>
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    px: 2,
                    borderRadius: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                  }}>
                    <Box sx={{ fontSize: 60, mb: 2 }}>🌿</Box>
                    <Typography variant="h5" gutterBottom>
                      Không tìm thấy kết quả phù hợp
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
                      Vui lòng thử lại với từ khóa khác hoặc điều chỉnh bộ lọc.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={handleClearSearch}
                      startIcon={<ClearIcon />}
                    >
                      Xóa bộ lọc và tìm kiếm
                    </Button>
                  </Box>
                </Fade>
              ) : (
                <Box>
                  {viewMode === 'list' ? (
                    // List View
                    <Box>
                      {pageTransitioning ? (
                        Array(Math.min(currentPagePlants.length, 10)).fill(0).map((_, idx) => (
                          <PlantCardSkeleton key={`transition-skeleton-${idx}`} height={160} />
                        ))
                      ) : (
                        currentPagePlants.map((plant, index) => (
                          <Box key={plant.id} sx={{ mb: 2 }}>
                            {renderPlantCard(plant, index)}
                          </Box>
                        ))
                      )}
                    </Box>
                  ) : viewMode === 'mosaic' ? (
                    // Mosaic View
                    <Box>
                      {pageTransitioning ? (
                        <Grid container spacing={3}>
                          {Array(Math.min(currentPagePlants.length, 9)).fill(0).map((_, idx) => (
                            <Grid 
                              item 
                              xs={12} 
                              sm={idx % 5 === 0 || idx % 5 === 3 ? 6 : 6} 
                              md={idx % 5 === 0 || idx % 5 === 3 ? 4 : 4} 
                              key={`transition-skeleton-${idx}`}
                            >
                              <PlantCardSkeleton height={200} />
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ 
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: 'repeat(2, 1fr)',
                            sm: 'repeat(3, 1fr)',
                            md: 'repeat(4, 1fr)',
                            lg: 'repeat(5, 1fr)'
                          },
                          gap: 3
                        }}>
                          {currentPagePlants.map((plant, index) => (
                            <Box 
                              key={plant.id} 
                              sx={{ 
                                gridColumn: index % 5 === 0 ? 'span 2' : 'span 1',
                                gridRow: index % 5 === 0 ? 'span 2' : 'span 1',
                                display: { xs: 'block', md: 'block' }
                              }}
                            >
                              {renderPlantCard(plant, index)}
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    // Grid View (default)
                    <Grid container spacing={3} ref={gridRef}>
                      {pageTransitioning ? (
                        Array(Math.min(currentPagePlants.length, 9)).fill(0).map((_, idx) => (
                          <Grid item xs={12} sm={6} md={4} key={`transition-skeleton-${idx}`}>
                            <PlantCardSkeleton />
                          </Grid>
                        ))
                      ) : (
                        currentPagePlants.map((plant, index) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id}>
                            {renderPlantCard(plant, index)}
                          </Grid>
                        ))
                      )}
                    </Grid>
                  )}
                  
                  {/* Pagination */}
                  {filteredPlants.length > ITEMS_PER_PAGE && (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      mt: 6, 
                      mb: 4,
                      opacity: pageTransitioning ? 0.5 : 1,
                      transition: 'opacity 0.3s ease',
                      pointerEvents: pageTransitioning ? 'none' : 'auto'
                    }}>
                      <Pagination 
                        count={Math.ceil(filteredPlants.length / ITEMS_PER_PAGE)} 
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              backgroundColor: 'rgba(46, 125, 50, 0.08)'
                            },
                            '&.Mui-selected': {
                              fontWeight: 'bold',
                              transform: 'scale(1.05)'
                            }
                          }
                        }}
                        />
                    </Box>
                  )}
                </Box>
              )}
            </Container>
          </Box>
        </Fade>
      ) : (
        // Plant Detail View
        <Fade in={!pageTransitioning} timeout={800}>
          <Box>
            {/* Top Background Image with Blurred Effect */}
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40vh',
                zIndex: 0,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${selectedPlant.imagePath})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 30%',
                  filter: 'blur(15px)',
                  opacity: 0.4,
                  zIndex: -1
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, rgba(46, 125, 50, 0.6), transparent)',
                  zIndex: -1
                }
              }}
            />
            
            <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: 2 }}>
              {/* Back button with animation */}
              <Button
                variant="contained"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackToList}
                sx={{
                  mb: 3,
                  mt: 2,
                  py: 1,
                  px: 3,
                  borderRadius: '30px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(10px)',
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  color: 'primary.dark',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(-5px)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)'
                  }
                }}
              >
                Quay lại danh sách
              </Button>
              
              {/* Plant details display with loading state */}
              {plantDetailLoading ? (
                <PlantDetailSkeleton />
              ) : (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: { xs: 4, md: 6 },
                    pb: 8,
                    position: 'relative',
                    zIndex: 3
                  }}>
                    {/* Left Side - Plant Gallery */}
                    <Box sx={{ 
                      width: { xs: '100%', md: '45%' },
                      position: 'relative',
                      borderRadius: 5,
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      alignSelf: 'flex-start',
                      bgcolor: 'white',
                      minHeight: 400,
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                      }
                    }}>
                      <PlantImageGallery 
                        plant={selectedPlant}
                        plantImages={plantImages}
                        isLoading={imagesLoading}
                      />
                      
                      {/* Plant Actions */}
                      <Box sx={{ 
                        position: 'absolute', 
                        bottom: 16, 
                        right: 16, 
                        display: 'flex',
                        gap: 1,
                        zIndex: 2
                      }}>
                        <Tooltip title="Thêm vào bộ sưu tập">
                          <IconButton 
                            sx={{ 
                              bgcolor: 'white', 
                              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                              '&:hover': { 
                                bgcolor: 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => toggleSavePlant(selectedPlant)}
                          >
                            {savedPlants.some(p => p.id === selectedPlant.id) 
                              ? <BookmarkAddedIcon color="secondary" /> 
                              : <BookmarkIcon />
                            }
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Thêm vào so sánh">
                          <IconButton 
                            sx={{ 
                              bgcolor: plantsToCompare.some(p => p.id === selectedPlant.id) 
                                ? theme.palette.secondary.main 
                                : 'white',
                              color: plantsToCompare.some(p => p.id === selectedPlant.id) 
                                ? 'white' 
                                : 'inherit',
                              boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                              '&:hover': { 
                                bgcolor: plantsToCompare.some(p => p.id === selectedPlant.id) 
                                  ? theme.palette.secondary.dark 
                                  : 'white',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s ease'
                            }}
                            onClick={() => toggleCompare(selectedPlant)}
                          >
                            <CompareIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    {/* Right Side - Plant Information */}
                    <Box sx={{ 
                      width: { xs: '100%', md: '55%' },
                      pt: { xs: 0, md: 2 }
                    }}>
                      <Paper elevation={0} sx={{ 
                        p: { xs: 3, md: 4 }, 
                        borderRadius: 4, 
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                        height: '100%'
                      }}>
                        <Box>
                          <Typography variant="h3" component="h1" gutterBottom color="primary.dark" sx={{ 
                            fontWeight: 700, 
                            borderBottom: '3px solid #60ad5e', 
                            paddingBottom: '8px',
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              bottom: '-3px',
                              width: '30%',
                              height: '3px',
                              backgroundColor: '#ff9800'
                            }
                          }}>
                            {selectedPlant.vietnameseName}
                          </Typography>
                          <Typography variant="h5" component="h2" gutterBottom sx={{ 
                            fontStyle: 'italic', 
                            color: '#555',
                            fontWeight: 400
                          }}>
                            {selectedPlant.scientificName}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 1, 
                            mb: 3, 
                            mt: 2 
                          }}>
                            {[...new Set([...selectedPlant.habitats, ...selectedPlant.uses])].map((tag) => {
                              const ecological = ECOLOGICAL_CATEGORIES.find(c => c.id === tag);
                              const usage = USAGE_CATEGORIES.find(c => c.id === tag);
                              const category = ecological || usage;
                              
                              if (!category) return null;
                              
                              return (
                                <Chip
                                  key={tag}
                                  icon={category.icon}
                                  label={category.name}
                                  size="small"
                                  color={ecological ? "primary" : "secondary"}
                                  sx={{ 
                                    fontWeight: 500,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                    }
                                  }}
                                />
                              );
                            })}
                          </Box>
                          
                          <Box sx={{ mt: 4 }}>
                            <Grid container spacing={3}>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'bold', 
                                  color: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  '&::before': {
                                    content: '""',
                                    display: 'inline-block',
                                    width: 4,
                                    height: 20,
                                    backgroundColor: 'primary.main',
                                    marginRight: 1.5,
                                    borderRadius: 4
                                  }
                                }}>
                                  Họ thực vật:
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ pl: 2.5 }}>
                                  {selectedPlant.familyVietnamese} ({selectedPlant.familyScientific})
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'bold', 
                                  color: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  '&::before': {
                                    content: '""',
                                    display: 'inline-block',
                                    width: 4,
                                    height: 20,
                                    backgroundColor: 'primary.main',
                                    marginRight: 1.5,
                                    borderRadius: 4
                                  }
                                }}>
                                  Ngành thực vật:
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ pl: 2.5 }}>
                                  {selectedPlant.divisionVietnamese} ({selectedPlant.divisionScientific})
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'bold', 
                                  color: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  '&::before': {
                                    content: '""',
                                    display: 'inline-block',
                                    width: 4,
                                    height: 20,
                                    backgroundColor: 'primary.main',
                                    marginRight: 1.5,
                                    borderRadius: 4
                                  }
                                }}>
                                  Tên đồng nghĩa:
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ pl: 2.5 }}>
                                  {selectedPlant.synonyms}
                                </Typography>
                              </Grid>
                              <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ 
                                  fontWeight: 'bold', 
                                  color: 'primary.main',
                                  display: 'flex',
                                  alignItems: 'center',
                                  '&::before': {
                                    content: '""',
                                    display: 'inline-block',
                                    width: 4,
                                    height: 20,
                                    backgroundColor: 'primary.main',
                                    marginRight: 1.5,
                                    borderRadius: 4
                                  }
                                }}>
                                  Dạng sống:
                                </Typography>
                                <Typography variant="body1" paragraph sx={{ pl: 2.5 }}>
                                  {selectedPlant.lifeform}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                  
                  {/* Additional plant details in separate cards */}
                  <Box sx={{ position: 'relative', zIndex: 2 }}>
                    <Grid container spacing={4}>
                      {/* Description */}
                      <Grid item xs={12} md={6}>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            p: 0, 
                            height: '100%',
                            borderRadius: 4,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            '&:hover': {
                              boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            background: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.light, 0.05)}, ${alpha(theme.palette.primary.main, 0.08)})`
                          }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                              color: 'primary.dark',
                              fontWeight: 600,
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
                            }}>
                              Mô tả
                            </Typography>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                              {selectedPlant.description}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                      
                      {/* Distribution */}
                      <Grid item xs={12} md={6}>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            p: 0, 
                            height: '100%',
                            borderRadius: 4,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            '&:hover': {
                              boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: -20,
                              right: -20,
                              width: 150,
                              height: 150,
                              borderRadius: '50%',
                              background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.15)}, transparent 70%)`,
                              zIndex: 0
                            }
                          }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                              color: 'primary.dark',
                              fontWeight: 600,
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
                            }}>
                              Phân bố
                            </Typography>
                            <Typography variant="body1" sx={{ position: 'relative', zIndex: 1 }}>
                              {selectedPlant.distribution}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                      
                      {/* Biology */}
                      <Grid item xs={12} md={6}>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            p: 0, 
                            height: '100%',
                            borderRadius: 4,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            '&:hover': {
                              boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            background: `linear-gradient(to bottom left, ${alpha(theme.palette.secondary.light, 0.05)}, ${alpha(theme.palette.secondary.main, 0.08)})`
                          }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                              color: 'primary.dark',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              '&::before': {
                                content: '""',
                                display: 'inline-block',
                                width: 12,
                                height: 30,
                                backgroundColor: 'secondary.main',
                                marginRight: 2,
                                borderRadius: 4
                              }
                            }}>
                              Sinh học & Sinh thái
                            </Typography>
                            <Typography variant="body1">
                              {selectedPlant.biology}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                      
                      {/* Value */}
                      <Grid item xs={12} md={6}>
                        <Card 
                          elevation={0} 
                          sx={{ 
                            p: 0, 
                            height: '100%',
                            borderRadius: 4,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            '&:hover': {
                              boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            p: 3,
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: -20,
                              left: -20,
                              width: 150,
                              height: 150,
                              borderRadius: '50%',
                              background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.15)}, transparent 70%)`,
                              zIndex: 0
                            }
                          }}>
                            <Typography variant="h5" gutterBottom sx={{ 
                              color: 'primary.dark',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              '&::before': {
                                content: '""',
                                display: 'inline-block',
                                width: 12,
                                height: 30,
                                backgroundColor: 'secondary.main',
                                marginRight: 2,
                                borderRadius: 4
                              }
                            }}>
                              Giá trị
                            </Typography>
                            <Typography variant="body1" sx={{ position: 'relative', zIndex: 1 }}>
                              {selectedPlant.value}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                      
                      {/* Conservation Status - Only show if has status */}
                      {selectedPlant.conservationStatus && selectedPlant.conservationStatus !== "Không có thông tin" && (
                        <Grid item xs={12}>
                          <Card 
                            elevation={0} 
                            sx={{ 
                              p: 0,
                              borderRadius: 4,
                              overflow: 'hidden',
                              transition: 'all 0.3s ease',
                              borderLeft: '4px solid #ff5722',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                              '&:hover': {
                                boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
                                transform: 'translateY(-5px)'
                              }
                            }}
                          >
                            <Box sx={{ 
                              p: 3,
                              background: `linear-gradient(to right, ${alpha('#ff5722', 0.05)}, transparent)`
                            }}>
                              <Typography variant="h5" gutterBottom sx={{ 
                                color: '#d84315',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                '&::before': {
                                  content: '""',
                                  display: 'inline-block',
                                  width: 12,
                                  height: 30,
                                  backgroundColor: '#ff5722',
                                  marginRight: 2,
                                  borderRadius: 4
                                }
                              }}>
                                Tình trạng bảo tồn
                              </Typography>
                              <Typography variant="body1">
                                {selectedPlant.conservationStatus}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      )}
                    </Grid>
                    
                    {/* Plant Relationships */}
                    <PlantRelationships 
                      plantName={selectedPlant.scientificName} 
                      onSelectPlant={handleSelectPlant}
                    />
                    
                    {/* Q&A section */}
                    <Card 
                      elevation={0} 
                      sx={{ 
                        p: 0,
                        mt: 6, 
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        background: 'linear-gradient(to right, rgba(255,255,255,0.97), rgba(255,255,255,0.9))',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Box sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{
                          color: 'primary.dark',
                          fontWeight: 600,
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
                        }}>
                          Hỏi đáp về "{selectedPlant.vietnameseName}"
                        </Typography>
                        <Box sx={{ mt: 3 }}>
                          <TextField
                            fullWidth
                            label="Đặt câu hỏi của bạn"
                            variant="outlined"
                            multiline
                            rows={3}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ví dụ: Công dụng của cây này là gì? Cách nhận biết loài này như thế nào?"
                            sx={{
                              mb: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                transition: 'all 0.3s ease',
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                  borderColor: '#2e7d32',
                                },
                                '&.Mui-focused': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: '0 4px 12px rgba(46, 125, 50, 0.15)'
                                }
                              }
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              endIcon={answerLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                              onClick={handleAskQuestion}
                              disabled={answerLoading || !question.trim()}
                              sx={{ 
                                position: 'relative',
                                borderRadius: '30px',
                                px: 3,
                                py: 1,
                                boxShadow: '0 4px 14px rgba(46, 125, 50, 0.25)',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                fontWeight: 600,
                                '&:hover': {
                                  boxShadow: '0 6px 20px rgba(46, 125, 50, 0.35)',
                                  transform: 'translateY(-3px)'
                                },
                                '&::after': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: '-100%',
                                  width: '100%',
                                  height: '100%',
                                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                  transition: '0.5s',
                                  pointerEvents: 'none'
                                },
                                '&:hover::after': {
                                  left: '100%',
                                }
                              }}
                            >
                              Gửi câu hỏi
                            </Button>
                          </Box>
                        </Box>
                        
                        {/* Answer display */}
                        {answerLoading && (
                          <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress size={30} sx={{ mr: 2 }} />
                            <Typography variant="body1">Đang xử lý câu hỏi...</Typography>
                          </Box>
                        )}
                        
                        {answer && (
                          <Fade in={true} timeout={1000}>
                            <Card 
                              elevation={0} 
                              sx={{ 
                                mt: 4, 
                                p: 3, 
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.04),
                                borderLeft: '4px solid #2e7d32',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                              }}
                            >
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'primary.dark' }}>
                                Câu trả lời:
                              </Typography>
                              <Typography variant="body1" className="answer-text" sx={{ whiteSpace: 'pre-line' }}>
                                {answer}
                              </Typography>
                            </Card>
                          </Fade>
                        )}
                      </Box>
                    </Card>
                  </Box>
                </Box>
              )}
            </Container>
          </Box>
        </Fade>
      )}
      
      {/* Drawer for Filters */}
      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        onOpen={toggleDrawer(true)}
        PaperProps={{
          sx: {
            borderRadius: '16px 0 0 16px',
            overflow: 'hidden',
            boxShadow: '-5px 0 25px rgba(0,0,0,0.1)'
          }
        }}
      >
        {renderFilterDrawer()}
      </SwipeableDrawer>
      
      {/* Image Zoom Dialog */}
      <Dialog
        open={Boolean(zoomedImage)}
        onClose={handleCloseZoom}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.85)',
            boxShadow: 'none',
            position: 'relative',
            m: 1,
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <IconButton
          onClick={handleCloseZoom}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.3)',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.2)'
            },
            zIndex: 1
          }}
        >
          <CloseIcon />
        </IconButton>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            p: { xs: 2, sm: 4 }
          }}
        >
          <img
            src={zoomedImage || PLACEHOLDER_IMAGE}
            alt="Zoomed plant"
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 4
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
        </Box>
      </Dialog>
      
      {/* Page Background Element (Decorative) */}
      <Box 
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '20vh',
          background: `linear-gradient(to top, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
    </Box>
  );
};

export default PlantLibrary;