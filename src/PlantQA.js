import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Box, Typography, Stepper, Step, StepLabel, Button,
  Paper, Grid, Card, CardContent, CardMedia, TextField, CircularProgress,
  Alert, AlertTitle, styled, Skeleton
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import the skeleton components
import { PlantCardSkeleton } from './SkeletonComponents';

const API_URL = process.env.REACT_APP_API_URL || window.location.origin;
// const API_URL = '';

const PLACEHOLDER_IMAGE = '/placeholder.png';
const IMAGE_EXTENSION = '.jpg';
// Improved function to convert server path to web path
const convertServerPathToWebPath = (serverPath) => {
  if (!serverPath) return PLACEHOLDER_IMAGE;
  
  try {
    // Check if it's an absolute server path
    if (serverPath.startsWith('/home/') || serverPath.includes('/pretrain-llm/data/data/')) {
      // Extract the plant name from the path
      const parts = serverPath.split('/');
      
      // Find the index where data/data appears
      let dataIndex = -1;
      for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i] === 'data' && parts[i+1] === 'data') {
          dataIndex = i;
          break;
        }
      }
      
      if (dataIndex !== -1 && dataIndex + 2 < parts.length) {
        // The plant name is right after data/data
        const plantName = parts[dataIndex + 2];
        
        if (plantName) {
          // Create a web-accessible path
          const safePlantName = plantName.replace(/\s+/g, '_');
          console.log(`Converting path for: ${plantName} -> ${safePlantName}`);
          return `/representative_images/${safePlantName}${IMAGE_EXTENSION}`;
        }
      }
    }
    
    // If we couldn't parse the server path, just use the path as is
    // (it might already be a relative web path)
    if (serverPath.startsWith('/representative_images/')) {
      return serverPath;
    }
    
    console.warn('Could not parse server path, using placeholder:', serverPath);
    return PLACEHOLDER_IMAGE;
  } catch (error) {
    console.error('Error converting server path:', error);
    return PLACEHOLDER_IMAGE;
  }
};
// Styled component for the hidden file input
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// Enhanced function to get representative image path
const getRepresentativeImagePath = (label) => {
  if (!label) return PLACEHOLDER_IMAGE;
  
  // Special case for problematic label
  if (label.includes("Barringtonia acutangula (L.) Gaertn")) {
    return `/representative_images/Barringtonia_acutangula_(L.)_Gaertn.jpg`; // Adjust filename as needed
  }
  
  // Standard case
  const safeLabel = label.replace(/\s+/g, '_');
  return `/representative_images/${safeLabel}${IMAGE_EXTENSION}`;
};

// ClassificationCard with improved lifecycle handling
const ClassificationCard = ({ label, confidence, imagePath, selected, onClick, isLoading }) => {
  // Track both loading and error states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Force re-render on component mount
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Get image path from label
  const representativeImagePath = getRepresentativeImagePath(label);
  
  // Log for debugging
  console.log(`Rendering card for ${label} with path ${representativeImagePath}`);
  
  // When component mounts, force a re-render after a short delay
  // This helps ensure the image loads properly
  useEffect(() => {
    const timer = setTimeout(() => {
      setForceUpdate(prev => prev + 1);
      console.log(`Forcing update for ${label}`);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [label]);
  
  // Pre-load the image when component mounts
  useEffect(() => {
    // Pre-load the image
    const img = new Image();
    img.onload = () => {
      console.log(`Image loaded for ${label}`);
      setImageLoaded(true);
      setImageError(false);
    };
    img.onerror = () => {
      console.error(`Failed to load image for ${label}`);
      setImageError(true);
    };
    img.src = representativeImagePath;
    
    return () => {
      // Cancel the image load if component unmounts
      img.onload = null;
      img.onerror = null;
    };
  }, [representativeImagePath, label, forceUpdate]);

  const handleImageLoad = () => {
    console.log(`handleImageLoad called for ${label}`);
    setImageLoaded(true);
  };

  const handleImageError = (event) => {
    console.error(`handleImageError called for ${label}`);
    setImageError(true);
    event.target.onerror = null;
    event.target.src = PLACEHOLDER_IMAGE;
  };

  return (
    <Card
      className={`classification-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
        },
        ...(selected && {
          border: '3px solid #2e7d32',
          boxShadow: '0 4px 8px rgba(46, 125, 50, 0.4)',
          transform: 'translateY(-2px)'
        })
      }}
    >
      {/* Show skeleton while loading or if there's no error but image isn't loaded yet */}
      {isLoading || (!imageLoaded && !imageError) ? (
        <Skeleton variant="rectangular" height={180} animation="wave" />
      ) : null}
      
      <CardMedia
        component="img"
        height="180"
        image={imageError ? PLACEHOLDER_IMAGE : representativeImagePath}
        alt={`Representative image of ${label}`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sx={{ 
          objectFit: 'cover',
          display: isLoading ? 'none' : 'block'
        }}
        loading="eager" // Changed to eager loading
      />
      
      <CardContent sx={{ flexGrow: 1 }}>
        {isLoading ? (
          <>
            <Skeleton variant="text" height={32} animation="wave" />
            <Skeleton variant="text" height={24} width="60%" animation="wave" />
          </>
        ) : (
          <>
            <Typography variant="h6" component="div">
              {label.replace(/\s+\(\d+\.\d+%\)$/, '')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Confidence: {(confidence * 100).toFixed(1)}%
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};
const PlantQA = () => {
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [classifications, setClassifications] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [compressingImage, setCompressingImage] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null); // For debugging image paths
  
  // Refs
  const fileInputRef = useRef(null);

  // Steps for the stepper component
  const steps = ['Tải ảnh lên', 'Chọn loại thực vật', 'Hỏi & đáp'];

  // Clear error message
  const clearError = useCallback(() => setError(''), []);

  // Debug function to check if images exist
  const checkImagesExist = useCallback((classifications) => {
    const results = classifications.map(item => {
      const webPath = getRepresentativeImagePath(item.label);
      
      return {
        label: item.label,
        webPath: webPath,
        serverPath: item.image_path || "No server path provided"
      };
    });
    
    setDebugInfo(results);
    console.log('Web paths being used:', results);
  }, []);

  // Function to compress image before upload
  const compressImage = useCallback(async (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * maxHeight / height);
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to file
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          }, 'image/jpeg', quality);
        };
      };
    });
  }, []);

  // Handle file selection with compression
  const handleFileChange = async (event) => {
    clearError();
    const file = event.target.files[0];
    
    if (file && file.type.startsWith('image/')) {
      // Create preview immediately for better UX
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const immediatePreview = URL.createObjectURL(file);
      setPreviewUrl(immediatePreview);
      setImageLoaded(false);
      setImageFile(null); // Clear previous file while compressing
      
      // Compress image if it's larger than 1MB
      if (file.size > 1024 * 1024) {
        setCompressingImage(true);
        try {
          const compressedFile = await compressImage(file);
          setImageFile(compressedFile);
          console.log(`Compressed image from ${(file.size/1024/1024).toFixed(2)}MB to ${(compressedFile.size/1024/1024).toFixed(2)}MB`);
        } catch (err) {
          console.error('Error compressing image:', err);
          setImageFile(file); // Use original file if compression fails
        } finally {
          setCompressingImage(false);
        }
      } else {
        // Use original file if it's small enough
        setImageFile(file);
      }
      
      setClassifications([]); // Reset classifications if new image is chosen
      setAnswer('');          // Reset answer
      setSelectedLabel('');   // Reset selected label
      setDebugInfo(null);     // Reset debug info
    } else {
      setImageFile(null);
      setPreviewUrl(null);
      setError('Hãy lựa chọn định dạng thích hợp (e.g., JPG, PNG, GIF).');
    }
  };

  // Handle image load event
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle form submission for classification
  const handleClassify = async () => {
    if (!imageFile) {
      setError('Hãy chọn một ảnh!');
      return;
    }

    setLoading(true);
    clearError();
    setAnswer(''); // Clear previous answer
    setClassifications([]); // Clear previous classifications
    setDebugInfo(null); // Reset debug info

    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      console.log(`Sending classification request to ${API_URL}/api/classify`);
      const response = await fetch(`${API_URL}/api/classify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        throw new Error(errorData.detail || `Classification failed (HTTP ${response.status})`);
      }

      const data = await response.json();
      console.log('Classification API response:', data);

      // Assuming backend returns { results: [{ label: '...', confidence: 0.95 }, ...] }
      if (data.results && data.results.length > 0) {
        // Process each result to ensure it has the expected format
        const processedResults = data.results.map(item => ({
          label: item.label || 'Unknown',
          confidence: item.confidence || 0,
          image_path: item.image_path || null
        }));
        
        setClassifications(processedResults);
        // Debug image paths
        checkImagesExist(processedResults);
        setActiveStep(1); // Move to next step
      } else {
        setError('No classifications found for this image.');
        setActiveStep(0); // Stay on upload step if no results
      }

    } catch (err) {
      console.error("Classification Error:", err);
      setError(`Error classifying image: ${err.message}`);
      setActiveStep(0); // Reset to step 0 on error
    } finally {
      setLoading(false);
    }
  };

  // Handle selection of a classification
  const handleSelectLabel = (label) => {
    setSelectedLabel(label);
    setQuestion(''); // Clear question when changing selection
    setAnswer('');   // Clear answer when changing selection
    setActiveStep(2);
    clearError();
  };

  // Handle question submission
  const handleAskQuestion = async () => {
    if (!selectedLabel || !question.trim()) {
      setError('Hãy lựa chọn loại thực vật phù hợp và thực hiện hỏi đáp');
      return;
    }

    setLoading(true);
    clearError();
    setAnswer(''); // Clear previous answer

    try {
      console.log(`Sending Q&A request for: ${selectedLabel}, Question: ${question}`);
      const response = await fetch(`${API_URL}/api/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: selectedLabel, // Send the selected label
          question: question,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to get answer (HTTP ${response.status})`);
      }

      const data = await response.json();
      console.log('Q&A API response:', data);
      setAnswer(data.answer); // Assuming backend returns { answer: '...' }
    } catch (err) {
      console.error("Q&A Error:", err);
      setError(`Error getting answer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset the application state
  const handleReset = () => {
    setActiveStep(0);
    setImageFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setClassifications([]);
    setSelectedLabel('');
    setQuestion('');
    setAnswer('');
    setDebugInfo(null);
    clearError();
  };

  // Go back one step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    clearError();
    // Optionally clear state specific to the step you are leaving
    if (activeStep === 2) {
        setAnswer('');
        setQuestion('');
    }
  };

  return (
    <Box className="plant-qa fade-in">
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 2, mb: 2, minHeight: 350 }}> {/* Added min height for content area */}
        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={clearError} sx={{ mb: 2 }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Step 0: Upload */}
        {activeStep === 0 && (
          <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                backgroundColor: 'rgba(46, 125, 50, 0.05)',
                borderRadius: 3,
                border: '2px dashed rgba(46, 125, 50, 0.3)',
                maxWidth: 600,
                mx: 'auto'
              }}
            >
              <Typography variant="h5" gutterBottom color="primary.dark">
                Tải ảnh thực vật lên để phân loại
              </Typography>
              <Typography variant="body1" paragraph color="text.secondary">
                Tải lên một hình ảnh cây để hệ thống xác định loài và trả lời câu hỏi của bạn
              </Typography>
              
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
                size="large"
                sx={{ 
                  backgroundColor: '#2e7d32', 
                  '&:hover': { backgroundColor: '#1b5e20' },
                  py: 1.5,
                  px: 3,
                  mb: 2
                }}
                disabled={loading || compressingImage}
              >
                {compressingImage ? 'Đang xử lý ảnh...' : 'Chọn ảnh'}
                <VisuallyHiddenInput 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </Button>
            </Paper>

            {previewUrl && (
              <Box display="flex" flexDirection="column" alignItems="center" gap={2} width="100%" maxWidth="500px">
                <Paper elevation={3} sx={{ width: '100%', p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" align="center" gutterBottom>
                    Xem trước hình ảnh
                  </Typography>
                  <Box sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: 2, 
                    p: 1, 
                    background: '#f9f9f9',
                    textAlign: 'center',
                    position: 'relative',
                    minHeight: '200px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    {!imageLoaded && (
                      <Skeleton 
                        variant="rectangular" 
                        width="100%" 
                        height={200} 
                        animation="wave"
                        sx={{ position: 'absolute', borderRadius: 1 }}
                      />
                    )}
                    <img 
                      src={previewUrl} 
                      alt="Selected preview" 
                      className="image-preview" 
                      onLoad={handleImageLoad}
                      style={{ 
                        display: imageLoaded ? 'block' : 'none',
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '8px'
                      }}
                    />
                  </Box>
                </Paper>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleClassify}
                  disabled={loading || !imageFile || compressingImage}
                  sx={{ 
                    width: '200px',
                    py: 1
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : compressingImage ? (
                    'Đang xử lý...'
                  ) : (
                    'Phân loại'
                  )}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* Step 1: Classification Results */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h5" component="h2" gutterBottom align="center">
              Top 5 loại thực vật khớp nhất - Hãy lựa chọn loại thực vật phù hợp:
            </Typography>
            
            {/* Debug info for development */}
            {debugInfo && process.env.NODE_ENV !== 'production' && (
              <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: '12px' }}>
                <Typography variant="caption" component="div" sx={{ fontWeight: 'bold' }}>
                  Debug Image Paths:
                </Typography>
                <pre style={{ overflow: 'auto', maxHeight: '100px' }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </Box>
            )}
            
            <Grid container spacing={3} justifyContent="center">
              {loading ? (
                // Skeleton cards while loading
                Array(5).fill(0).map((_, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={`skeleton-${idx}`}>
                  <ClassificationCard
                    label=""
                    confidence={0}
                    imagePath=""
                    selected={false}
                    onClick={() => {}}
                    isLoading={true}
                  />
                </Grid>
              ))
            ) : (
              // Actual classification results
              classifications.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.label}>
                  <ClassificationCard
                    label={item.label}
                    confidence={item.confidence}
                    imagePath={item.image_path}
                    selected={selectedLabel === item.label}
                    onClick={() => handleSelectLabel(item.label)}
                    isLoading={false}
                  />
                </Grid>
              ))
            )}
          </Grid>
          <Box className="step-buttons" sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleReset} variant="outlined" color="secondary">
              Reset
            </Button>
          </Box>
        </Box>
      )}

      {/* Step 2: Q&A */}
      {activeStep === 2 && selectedLabel && ( // Check selectedLabel too
        <Box>
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: 'rgba(46, 125, 50, 0.05)'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom align="center">
              Hỏi đáp về: <Typography component="span" variant="h5" color="primary">{selectedLabel.replace(/\s+\(\d+\.\d+%\)$/, '')}</Typography>
            </Typography>
            <TextField
              label="Câu hỏi của bạn"
              variant="outlined"
              fullWidth
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              margin="normal"
              multiline
              rows={3}
              placeholder={`Ví dụ: Các công dụng của ${selectedLabel.replace(/\s+\(\d+\.\d+%\)$/, '')}?`}
            />
            <Box textAlign="center" mt={1} mb={3}> {/* Center the button */}
              <Button
                variant="contained"
                color="primary"
                onClick={handleAskQuestion}
                disabled={loading || !question.trim()}
                endIcon={loading ? <CircularProgress size={20} color="inherit"/> : <SendIcon />}
                sx={{ 
                  backgroundColor: '#2e7d32', 
                  '&:hover': { backgroundColor: '#1b5e20' },
                  px: 4,
                  py: 1
                }}
              >
                Gửi câu hỏi
              </Button>
            </Box>
          </Paper>

          {loading && !answer && (
            <Box sx={{ mt: 3, p: 3 }}>
              <Skeleton variant="text" height={30} width="20%" animation="wave" />
              <Skeleton variant="text" height={20} animation="wave" />
              <Skeleton variant="text" height={20} animation="wave" />
              <Skeleton variant="text" height={20} width="80%" animation="wave" />
            </Box>
          )}

          {answer && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mt: 3, 
                backgroundColor: '#e8f5e9',
                borderRadius: 2,
                borderLeft: '5px solid #2e7d32'
              }}
            >
              <Typography variant="h6" gutterBottom>Câu trả lời:</Typography>
              <Typography variant="body1" component="div" className="answer-text">
                {answer}
              </Typography>
            </Paper>
          )}

          <Box className="step-buttons" sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleBack} variant="outlined" startIcon={<ArrowBackIcon />}>
              Quay lại
            </Button>
            <Button onClick={handleReset} variant="outlined" color="secondary">
              Reset
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  </Box>
);
};

export default PlantQA;