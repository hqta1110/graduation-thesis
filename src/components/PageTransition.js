import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimation } from '../contexts/AnimationContext';

const PageTransition = ({ children, keyValue }) => {
  const { enableAnimations } = useAnimation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={keyValue}
        initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1 }}
        animate={enableAnimations ? { opacity: 1, y: 0 } : { opacity: 1 }}
        exit={enableAnimations ? { opacity: 0, y: -20 } : { opacity: 1 }}
        transition={{ 
          duration: 0.3,
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;