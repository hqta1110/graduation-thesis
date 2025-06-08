import { useState, useEffect, useCallback, useRef } from 'react';
import cacheService, { generateHash } from './cacheService';
import { compressImage } from './imageUtils';

// API URL from environment or default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Custom hook for fetching plants data with caching
 * @returns {Object} - Plants data and loading state
 */
export const usePlantsData = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Fetch plants data
  const fetchPlants = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    // Create abort controller for cleanup
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Try to get from cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedPlants = await cacheService.getCachedPlantsData();
        if (cachedPlants) {
          console.log('Using cached plants data');
          setPlants(cachedPlants);
          setLoading(false);
          return;
        }
      }

      // Fetch from API with timeout
      const fetchPromise = fetch(`${API_URL}/api/plants`, {
        signal: abortControllerRef.current.signal,
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

      // Transform the data
      const plantsList = Object.entries(metadataJson).map(([scientificName, metadata], index) => {
        metadata = metadata || {};

        return {
          id: index + 1,
          scientificName,
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
          imagePath: `/representative_images/${scientificName.replace(/\s+/g, '_')}.jpg`
        };
      });

      // Cache the transformed data
      await cacheService.cachePlantsData(plantsList);

      setPlants(plantsList);
    } catch (error) {
      // Only set error if not aborted
      if (error.name !== 'AbortError') {
        console.error('Error fetching plant metadata:', error);
        setError(`Không thể tải dữ liệu: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load plants data on mount
  useEffect(() => {
    fetchPlants();

    return () => {
      // Clean up fetch on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPlants]);

  return { plants, loading, error, refreshPlants: fetchPlants };
};

/**
 * Custom hook for plant classification 
 * @returns {Object} - Classification functions and state
 */
export const useClassification = () => {
  const [classifications, setClassifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Clear classifications
  const clearClassifications = useCallback(() => {
    setClassifications([]);
  }, []);

  // Function to create a hash of an image for caching
  const createImageHash = useCallback(async (imageFile) => {
    try {
      // Simple hash based on the file name and last modified date
      return generateHash(`${imageFile.name}-${imageFile.lastModified}-${imageFile.size}`);
    } catch (error) {
      console.error('Error creating image hash:', error);
      return null;
    }
  }, []);

  // Classify image function
  const classifyImage = useCallback(async (imageFile) => {
    if (!imageFile) {
      setError('No image file provided');
      return null;
    }

    setLoading(true);
    setError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Try to get from cache first
      const imageHash = await createImageHash(imageFile);
      if (imageHash) {
        const cachedClassifications = await cacheService.getCachedClassifications(imageHash);
        if (cachedClassifications) {
          console.log('Using cached classifications');
          setClassifications(cachedClassifications);
          setLoading(false);
          return cachedClassifications;
        }
      }

      // Compress image if needed
      let processedFile = imageFile;
      if (imageFile.size > 1024 * 1024) { // Compress if > 1MB
        processedFile = await compressImage(imageFile);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', processedFile);

      // Fetch classification from API
      const response = await fetch(`${API_URL}/api/classify`, {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Classification failed (HTTP ${response.status})`);
      }

      const data = await response.json();

      // Check if we have valid results
      if (!data.results || !Array.isArray(data.results)) {
        throw new Error('Invalid classification response format');
      }

      // Cache the results if we have a valid image hash
      if (imageHash) {
        await cacheService.cacheClassifications(imageHash, data.results);
      }

      setClassifications(data.results);
      return data.results;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Classification error:', error);
        setError(`Error classifying image: ${error.message}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, [createImageHash]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    classifications,
    loading,
    error,
    classifyImage,
    clearClassifications
  };
};

/**
 * Custom hook for plant Q&A
 * @returns {Object} - Q&A functions and state
 */
export const useQA = () => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Clear answer
  const clearAnswer = useCallback(() => {
    setAnswer('');
    setError(null);
  }, []);

  // Ask question function
  const askQuestion = useCallback(async (label, question) => {
    if (!label || !question.trim()) {
      setError('Both label and question are required');
      return null;
    }

    setLoading(true);
    setError(null);
    setAnswer('');

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Create a hash for caching
      const questionHash = generateHash(`${label}-${question.trim()}`);
      
      // Try to get from cache first
      const cachedAnswer = await cacheService.getCachedQAResponse(questionHash);
      if (cachedAnswer) {
        console.log('Using cached Q&A response');
        setAnswer(cachedAnswer);
        setLoading(false);
        return cachedAnswer;
      }

      // Check if we're offline
      if (!navigator.onLine) {
        throw new Error('Bạn đang ngoại tuyến. Vui lòng kết nối mạng để sử dụng tính năng này.');
      }

      // Send question to API
      const response = await fetch(`${API_URL}/api/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label, question }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to get answer (HTTP ${response.status})`);
      }

      const data = await response.json();
      
      // Cache the answer
      await cacheService.cacheQAResponse(questionHash, data.answer);
      
      setAnswer(data.answer);
      return data.answer;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Q&A error:', error);
        setError(`Error getting answer: ${error.message}`);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    answer,
    loading,
    error,
    askQuestion,
    clearAnswer
  };
};

export default {
  usePlantsData,
  useClassification,
  useQA
};