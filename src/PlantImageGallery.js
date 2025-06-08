// Modified PlantImageGallery.js to accept plantImages as props
import React, { useState, useEffect } from 'react';
import {
  Box, IconButton, CircularProgress, Typography, Dialog, DialogContent,
  Fade, Zoom, Slide
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CloseIcon from '@mui/icons-material/Close';

const PLACEHOLDER_IMAGE = '/placeholder.png';
// const API_URL = process.env.REACT_APP_API_URL || window.location.origin;
// Add plantImages and isLoading props from parent
const PlantImageGallery = ({ plant, plantImages = [], isLoading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState({});
  
  // Update currentIndex when plantImages changes
  useEffect(() => {
    // Find primary image index if available
    if (plantImages.length > 0) {
      const primaryIndex = plantImages.findIndex(img => img.is_primary);
      setCurrentIndex(primaryIndex !== -1 ? primaryIndex : 0);
    } else {
      setCurrentIndex(0);
    }
    
    // Reset loaded state when images change
    setImagesLoaded({});
  }, [plantImages]);

  // Navigate to next image
  const handleNext = () => {
    if (plantImages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % plantImages.length);
    }
  };
  const getCorrectImagePath = (path) => {
    const API_URL = process.env.REACT_APP_API_URL || window.location.origin;
    
    if (!path) return PLACEHOLDER_IMAGE;
    
    // If it's already a complete URL, use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // For paths that start with /plant-images/
    if (path.startsWith('/plant-images/')) {
      return `${API_URL}${path}`;
    }
    
    // If it's a path from the API that needs formatting
    if (path.includes('/')) {
      const cleanPath = path.replace(/^\/+/, '');
      return `${API_URL}/plant-images/${cleanPath}`;
    }
    
    // For any other path
    return path;
  };
  // Navigate to previous image
  const handlePrevious = () => {
    if (plantImages.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + plantImages.length) % plantImages.length);
    }
  };
  
  // Open zoomed view
  const handleZoom = () => {
    const currentImage = plantImages[currentIndex];
    setZoomedImage(currentImage ? currentImage.path : plant.imagePath);
  };
  
  // Close zoomed view
  const handleCloseZoom = () => {
    setZoomedImage(null);
  };
  
  // Track which images have loaded
  const handleImageLoad = (index) => {
    setImagesLoaded(prev => ({ ...prev, [index]: true }));
  };
  
  // Handle image loading error
  const handleImageError = (index, event) => {
    console.error(`Failed to load image at index ${index}:`, event);
    // Mark as loaded to remove loading spinner
    setImagesLoaded(prev => ({ ...prev, [index]: true }));
    
    // Replace with placeholder if it's not already the placeholder
    if (!event.target.src.includes(PLACEHOLDER_IMAGE)) {
      event.target.src = PLACEHOLDER_IMAGE;
      event.target.alt = 'Hình ảnh không có sẵn';
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height={320}
        sx={{ backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Đang tải hình ảnh...
        </Typography>
      </Box>
    );
  }

  // Handle error or no images
  if ((error || plantImages.length === 0) && plant.imagePath) {
    return (
      <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
        <img
          src={plant.imagePath}
          alt={plant.vietnameseName}
          style={{ 
            width: '100%', 
            height: '320px', 
            objectFit: 'cover',
            borderRadius: 2
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />
        {error && (
          <Typography 
            variant="caption" 
            color="error"
            sx={{ 
              position: 'absolute', 
              bottom: 8, 
              right: 8, 
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '2px 8px',
              borderRadius: 1
            }}
          >
            {error}
          </Typography>
        )}
      </Box>
    );
  }

  const currentImage = plantImages[currentIndex];
  const imagePath = currentImage?.path || plant.imagePath;
  const isImageLoaded = imagesLoaded[currentIndex];

  // Rest of your component code remains largely the same...
  return (
    <Box className="plant-image-gallery" sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
      {/* Main image container */}
      <Box 
        sx={{ 
          position: 'relative',
          height: 320,
          backgroundColor: 'rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Loading indicator */}
        {!isImageLoaded && (
          <CircularProgress 
            sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 1
            }} 
          />
        )}
        {/* Add this inside PlantImageGallery component, right before or after the main image */}
        
        {/* Main image with fade in effect */}
        <Fade in={true} timeout={300}>
        <img
          src={getCorrectImagePath(imagePath)}
          alt={`${plant.vietnameseName} - ${currentIndex + 1}/${plantImages.length}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: isImageLoaded ? 'block' : 'block',
            opacity: isImageLoaded ? 1 : 0.3,
            transition: 'opacity 0.3s ease'
          }}
          onLoad={() => handleImageLoad(currentIndex)}
          onError={(e) => {
            console.error(`Failed to load image: ${e.target.src}`);
            handleImageError(currentIndex, e);
          }}
        />
        </Fade>

        {/* Navigation arrows - only show if multiple images */}
        {plantImages.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.7)',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                opacity: 0.7,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255,255,255,0.7)',
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-50%) scale(1.1)'
                },
                opacity: 0.7,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1
                }
              }}
            >
              <ArrowForwardIcon />
            </IconButton>
          </>
        )}
        
        {/* Zoom button */}
        <IconButton
          onClick={handleZoom}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,0.7)',
            '&:hover': { 
              backgroundColor: 'rgba(255,255,255,0.9)',
              transform: 'scale(1.1)'
            },
            opacity: 0.7,
            transition: 'all 0.2s ease',
            '&:hover': {
              opacity: 1
            }
          }}
        >
          <ZoomInIcon />
        </IconButton>
        
        {/* Image counter */}
        {plantImages.length > 1 && (
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              padding: '3px 8px',
              borderRadius: 10,
              fontWeight: 'bold'
            }}
          >
            {currentIndex + 1}/{plantImages.length}
          </Typography>
        )}
      </Box>
      
      {/* Thumbnails row - only show if multiple images */}
      {plantImages.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            padding: 1,
            backgroundColor: 'rgba(0,0,0,0.05)',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#2e7d32',
              borderRadius: '3px',
            }
          }}
        >
          {plantImages.map((img, idx) => (
          <Zoom 
            in={true} 
            key={idx}
            style={{ transitionDelay: `${idx * 50}ms` }}
          >
            <Box
              onClick={() => setCurrentIndex(idx)}
              sx={{
                width: 60,
                height: 60,
                flexShrink: 0,
                margin: '0 4px',
                cursor: 'pointer',
                border: idx === currentIndex ? '3px solid #2e7d32' : '3px solid transparent',
                borderRadius: 1,
                opacity: idx === currentIndex ? 1 : 0.7,
                transition: 'all 0.2s ease',
                '&:hover': { 
                  opacity: 1,
                  transform: 'translateY(-2px)'
                },
                overflow: 'hidden'
              }}
            >
              <img
                src={getCorrectImagePath(img.path)}
                alt={`Thumbnail ${idx + 1}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
                }}
                onLoad={() => handleImageLoad(`thumb-${idx}`)}
                onError={(e) => {
                  console.error(`Failed to load thumbnail: ${e.target.src}`);
                  e.target.onerror = null;
                  e.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </Box>
          </Zoom>
        ))}
        </Box>
      )}
      
      {/* Full screen image dialog */}
      <Dialog
        open={zoomedImage !== null}
        onClose={handleCloseZoom}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0,0,0,0.9)',
            boxShadow: 'none',
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogContent 
          sx={{ 
            p: 0, 
            display: 'flex', 
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            height: '90vh'
          }}
        >
          <img
            src={zoomedImage}
            alt={plant.vietnameseName}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
          
          <IconButton
            onClick={handleCloseZoom}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.5)',
              '&:hover': { 
                backgroundColor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PlantImageGallery;