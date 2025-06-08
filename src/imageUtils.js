/**
 * Utility functions for image processing and handling
 */

// Default placeholder image
export const PLACEHOLDER_IMAGE = '/placeholder.png';

/**
 * Compresses an image file before upload to reduce size
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width of the compressed image (default: 1200)
 * @param {number} maxHeight - Maximum height of the compressed image (default: 1200)
 * @param {number} quality - JPEG quality (0-1) (default: 0.8)
 * @returns {Promise<File>} - The compressed image file
 */
export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Check if the file is actually an image
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please provide an image file.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        // Get original dimensions
        let width = img.width;
        let height = img.height;
        
        // Skip compression for small images
        if (width <= maxWidth && height <= maxHeight && file.size <= 1024 * 1024) {
          console.log('Image already optimized, skipping compression');
          resolve(file);
          return;
        }
        
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
        
        // Create canvas and resize image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to Blob/File
        canvas.toBlob((blob) => {
          // Create new File object from the blob
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          
          console.log(`Compressed image from ${(file.size/1024/1024).toFixed(2)}MB to ${(compressedFile.size/1024/1024).toFixed(2)}MB`);
          resolve(compressedFile);
        }, 'image/jpeg', quality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image for compression'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
  });
};

/**
 * Generates a representative image path for a plant label
 * @param {string} label - Plant label/scientific name
 * @param {string} extension - Image file extension (default: '.jpg')
 * @returns {string} - Path to the representative image
 */
export const getRepresentativeImagePath = (label, extension = '.jpg') => {
  if (!label) return PLACEHOLDER_IMAGE;
  // Replace spaces with underscores and remove unsafe characters
  const safeLabel = label.replace(/\s+/g, '_').replace(/[^\w\d_]/g, '');
  return `/representative_images/${safeLabel}${extension}`;
};

/**
 * Preloads an image to ensure it's cached
 * @param {string} src - Image source URL
 * @returns {Promise<string>} - The source URL when loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
  });
};

/**
 * Preloads multiple images in parallel
 * @param {Array<string>} sources - Array of image URLs to preload
 * @returns {Promise<Array<string>>} - Array of successfully loaded URLs
 */
export const preloadImages = (sources) => {
  return Promise.allSettled(
    sources.map(src => preloadImage(src))
  ).then(results => {
    // Return only successfully loaded images
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  });
};

/**
 * Creates a data URL from a file
 * @param {File} file - File to convert
 * @returns {Promise<string>} - Data URL
 */
export const fileToDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

/**
 * Handles image load errors by replacing with placeholder
 * @param {Event} event - Image error event
 */
export const handleImageError = (event) => {
  console.log('Image failed to load:', event.target.src);
  event.target.onerror = null; // Prevent infinite loop if placeholder fails
  
  // Check if we're already showing the placeholder image to avoid a loop
  if (!event.target.src.includes(PLACEHOLDER_IMAGE)) {
    event.target.src = PLACEHOLDER_IMAGE;
    event.target.alt = 'Hình ảnh không có sẵn';
  }
};