import { useState, useEffect } from 'react';

/**
 * Custom hook to track and manage network connectivity
 * @returns {Object} - Network status and functions
 */
const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // If we were previously offline, set wasOffline to true
      if (!navigator.onLine) {
        setWasOffline(true);
        // Simulate reconnection process
        setReconnecting(true);
        setTimeout(() => {
          setReconnecting(false);
          setWasOffline(false);
        }, 3000); // Show reconnecting for 3 seconds
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Check and optionally retry if offline
   * @param {Function} callback - Function to call if online
   * @param {string} errorMessage - Message to return if offline
   * @returns {Promise<any>} - Result of callback or error
   */
  const withNetworkCheck = async (callback, errorMessage = 'Bạn đang ngoại tuyến.') => {
    if (navigator.onLine) {
      try {
        return await callback();
      } catch (error) {
        // If the error seems to be connectivity related, update state
        if (error.message.includes('network') || error.message.includes('fetch')) {
          setIsOnline(false);
        }
        throw error;
      }
    } else {
      // We're offline, throw an error
      setIsOnline(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Manual connect attempt
   * @returns {boolean} - Success status
   */
  const tryReconnect = async () => {
    if (!navigator.onLine) {
      setReconnecting(true);
      
      try {
        // Try to fetch a tiny resource to test connectivity
        const response = await fetch('/favicon.ico', {
          method: 'HEAD',
          // Short timeout to avoid hanging
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          setIsOnline(true);
          setTimeout(() => {
            setReconnecting(false);
            setWasOffline(false);
          }, 1000);
          return true;
        }
      } catch (e) {
        console.log('Reconnection attempt failed:', e);
      }
      
      setReconnecting(false);
      return false;
    }
    
    return true; // Already online
  };

  return {
    isOnline,
    wasOffline,
    reconnecting,
    withNetworkCheck,
    tryReconnect
  };
};

export default useNetwork;