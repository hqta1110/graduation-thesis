import React, { createContext, useContext, useState, useEffect } from 'react';

const AnimationContext = createContext({
  prefersReducedMotion: false,
  enableAnimations: true,
});

export const AnimationProvider = ({ children }) => {
  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  
  // Derived state - enable animations unless user prefers reduced motion
  const enableAnimations = !prefersReducedMotion;
  
  // Listen for changes to motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return (
    <AnimationContext.Provider value={{ prefersReducedMotion, enableAnimations }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => useContext(AnimationContext);