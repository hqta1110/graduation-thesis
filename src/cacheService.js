/**
 * Cache service for managing API responses and plants data
 */

// Cache names for different types of data
const CACHE_NAMES = {
    PLANTS: 'plants-data-cache',
    CLASSIFICATIONS: 'classifications-cache',
    QA: 'qa-responses-cache'
  };
  
  // Cache expiration times (in milliseconds)
  const CACHE_EXPIRY = {
    PLANTS: 24 * 60 * 60 * 1000, // 24 hours for plant data
    CLASSIFICATIONS: 30 * 60 * 1000, // 30 minutes for classifications
    QA: 60 * 60 * 1000 // 1 hour for Q&A responses
  };
  
  // Check if IndexedDB is available
  const idbAvailable = 'indexedDB' in window;
  
  // Open the IndexedDB
  const openDatabase = () => {
    return new Promise((resolve, reject) => {
      if (!idbAvailable) {
        reject(new Error('IndexedDB not available'));
        return;
      }
      
      const request = indexedDB.open('PlantQACache', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        
        // Create object stores for different cache types
        Object.values(CACHE_NAMES).forEach(cacheName => {
          if (!db.objectStoreNames.contains(cacheName)) {
            const store = db.createObjectStore(cacheName, { keyPath: 'key' });
            store.createIndex('expiry', 'expiry', { unique: false });
          }
        });
      };
    });
  };
  
  /**
   * Set an item in the cache
   * @param {string} cacheName - Name of the cache
   * @param {string} key - Cache key
   * @param {any} value - Value to store
   * @param {number} expiryTime - Custom expiry time in ms (optional)
   */
  const setCache = async (cacheName, key, value, expiryTime) => {
    if (!idbAvailable) {
      return null;
    }
    
    try {
      const db = await openDatabase();
      const tx = db.transaction(cacheName, 'readwrite');
      const store = tx.objectStore(cacheName);
      
      // Calculate expiry time
      const expiry = Date.now() + (expiryTime || CACHE_EXPIRY[cacheName.toUpperCase()] || 0);
      
      // Store item with expiry
      await store.put({
        key,
        value,
        expiry
      });
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('Cache set error:', error);
      return null;
    }
  };
  
  /**
   * Get an item from the cache
   * @param {string} cacheName - Name of the cache 
   * @param {string} key - Cache key
   * @returns {Promise<any>} - The cached value or null if not found/expired
   */
  const getCache = async (cacheName, key) => {
    if (!idbAvailable) {
      return null;
    }
    
    try {
      const db = await openDatabase();
      const tx = db.transaction(cacheName, 'readonly');
      const store = tx.objectStore(cacheName);
      const request = store.get(key);
      
      const result = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      
      // Check if result exists and is not expired
      if (result && result.expiry > Date.now()) {
        return result.value;
      }
      
      // If expired, remove it
      if (result) {
        const deleteTx = db.transaction(cacheName, 'readwrite');
        const deleteStore = deleteTx.objectStore(cacheName);
        deleteStore.delete(key);
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  };
  
  /**
   * Clear all expired items from caches
   */
  const clearExpiredCache = async () => {
    if (!idbAvailable) {
      return;
    }
    
    try {
      const db = await openDatabase();
      const now = Date.now();
      
      // Clear expired items from each cache
      for (const cacheName of Object.values(CACHE_NAMES)) {
        const tx = db.transaction(cacheName, 'readwrite');
        const store = tx.objectStore(cacheName);
        const index = store.index('expiry');
        
        // Get all expired items
        const range = IDBKeyRange.upperBound(now);
        const request = index.openCursor(range);
        
        request.onsuccess = event => {
          const cursor = event.target.result;
          if (cursor) {
            // Delete expired item
            store.delete(cursor.primaryKey);
            cursor.continue();
          }
        };
      }
    } catch (error) {
      console.error('Error clearing expired cache:', error);
    }
  };
  
  // Clear expired cache on startup
  clearExpiredCache();
  
  // Plant-specific cache functions
  /**
   * Caches plants data from the API
   * @param {Array} plants - Plants data to cache
   */
  export const cachePlantsData = async (plants) => {
    return setCache(CACHE_NAMES.PLANTS, 'all-plants', plants);
  };
  
  /**
   * Retrieves cached plants data
   * @returns {Promise<Array>} - Cached plants or null
   */
  export const getCachedPlantsData = async () => {
    return getCache(CACHE_NAMES.PLANTS, 'all-plants');
  };
  
  /**
   * Caches classification results for an image hash
   * @param {string} imageHash - Hash of the image
   * @param {Array} classifications - Classification results
   */
  export const cacheClassifications = async (imageHash, classifications) => {
    return setCache(CACHE_NAMES.CLASSIFICATIONS, imageHash, classifications);
  };
  
  /**
   * Gets cached classification results for an image hash
   * @param {string} imageHash - Hash of the image
   * @returns {Promise<Array>} - Cached classifications or null
   */
  export const getCachedClassifications = async (imageHash) => {
    return getCache(CACHE_NAMES.CLASSIFICATIONS, imageHash);
  };
  
  /**
   * Caches a Q&A response
   * @param {string} questionHash - Hash of the label + question
   * @param {string} answer - Answer to cache
   */
  export const cacheQAResponse = async (questionHash, answer) => {
    return setCache(CACHE_NAMES.QA, questionHash, answer);
  };
  
  /**
   * Gets a cached Q&A response
   * @param {string} questionHash - Hash of the label + question
   * @returns {Promise<string>} - Cached answer or null
   */
  export const getCachedQAResponse = async (questionHash) => {
    return getCache(CACHE_NAMES.QA, questionHash);
  };
  
  /**
   * Generates a simple hash from a string
   * @param {string} str - String to hash
   * @returns {string} - Hash string
   */
  export const generateHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  };
  
  export default {
    cachePlantsData,
    getCachedPlantsData,
    cacheClassifications,
    getCachedClassifications,
    cacheQAResponse,
    getCachedQAResponse,
    generateHash,
    clearExpiredCache
  };