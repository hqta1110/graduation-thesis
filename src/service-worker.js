/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from 'workbox-precaching';

// This line is required for the build to succeed
precacheAndRoute(self.__WB_MANIFEST);
// Service Worker for Plant Classification and Q&A Application
const CACHE_NAME = 'plant-qa-cache-v1';

// Assets to cache initially
const INITIAL_CACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/main.js',
  '/static/css/main.css',
  '/placeholder.png',
  '/manifest.json',
  '/favicon.ico'
];

// Install event: cache the initial assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching initial assets');
        return cache.addAll(INITIAL_CACHE_URLS);
      })
      .then(() => self.skipWaiting()) // Force the service worker to become active
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Clearing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Take control of all clients
  );
});

// Helper function to determine if a request is for an API
const isApiRequest = (request) => {
  return request.url.includes('/api/');
};

// Helper function to determine if a request is for an image
const isImageRequest = (request) => {
  const url = new URL(request.url);
  return url.pathname.endsWith('.jpg') || 
         url.pathname.endsWith('.jpeg') || 
         url.pathname.endsWith('.png') || 
         url.pathname.endsWith('.gif') ||
         url.pathname.includes('representative_images');
};

// Helper to handle API requests - network first, no cache
const handleApiRequest = (request) => {
  return fetch(request).catch(error => {
    console.log('Service Worker: API request failed, returning offline response', error);
    return new Response(
      JSON.stringify({ 
        error: 'Bạn đang ngoại tuyến. Vui lòng kết nối Internet để sử dụng tính năng này.' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  });
};

// Handle image requests - cache first, then network
const handleImageRequest = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Image fetch failed, returning placeholder', error);
    // Return placeholder image from cache if available
    return caches.match('/placeholder.png') || new Response('Image not available offline', { status: 404 });
  }
};

// Fetch event: serve from cache or network
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Handle API requests
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle image requests
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle other requests with stale-while-revalidate strategy
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Revalidate cache in the background
          fetch(request)
            .then(networkResponse => {
              if (networkResponse.ok) {
                caches.open(CACHE_NAME)
                  .then(cache => cache.put(request, networkResponse));
              }
            })
            .catch(error => console.log('Failed to update cache:', error));
          
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(request)
          .then(networkResponse => {
            // Cache the response for future
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(request, responseToCache));
            }
            
            return networkResponse;
          })
          .catch(error => {
            console.log('Service Worker: Fetch failed, returning offline page', error);
            // If the request is for a page, return the offline page
            if (request.headers.get('Accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // For other requests, just fail
            return new Response('You are offline. Please reconnect to use this feature.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Listen for message events (useful for communication with the app)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CACHE_NEW_PLANT_IMAGE') {
    const { url, imagePath } = event.data;
    
    caches.open(CACHE_NAME)
      .then(cache => {
        fetch(imagePath)
          .then(response => {
            if (response.ok) {
              cache.put(url, response);
              console.log('Service Worker: Cached new plant image', url);
            }
          })
          .catch(error => console.log('Failed to cache plant image:', error));
      });
  }
});

// Background sync for offline form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-questions') {
    event.waitUntil(syncPendingQuestions());
  }
});

// Function to sync pending questions when online
async function syncPendingQuestions() {
  try {
    const db = await openDB();
    const pendingQuestions = await db.getAll('pendingQuestions');
    
    for (const data of pendingQuestions) {
      try {
        const response = await fetch('/api/qa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          await db.delete('pendingQuestions', data.id);
          console.log('Successfully synced question:', data.id);
        }
      } catch (error) {
        console.error('Error syncing question:', error);
      }
    }
  } catch (error) {
    console.error('Error accessing IndexedDB:', error);
  }
}

// Simple IndexedDB helper for offline storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PlantQAOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object store for pending questions
      if (!db.objectStoreNames.contains('pendingQuestions')) {
        const store = db.createObjectStore('pendingQuestions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Create object store for cached plants
      if (!db.objectStoreNames.contains('cachedPlants')) {
        const store = db.createObjectStore('cachedPlants', { keyPath: 'scientificName' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}