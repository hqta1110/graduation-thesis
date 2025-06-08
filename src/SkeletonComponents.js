import React from 'react';
import { Card, CardContent, Box, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import { useAnimation } from './contexts/AnimationContext';

// Skeleton card for loading plant cards
export const PlantCardSkeleton = () => {
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <Skeleton 
        variant="rectangular" 
        height={180} 
        animation="wave" 
        sx={{
          '&::after': {
            background: 'linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.04), transparent)',
          }
        }}
      />
      <CardContent>
        <Skeleton variant="text" height={32} width="80%" animation="wave" />
        <Skeleton variant="text" height={24} width="60%" animation="wave" />
        <Skeleton variant="text" height={24} width="90%" animation="wave" />
      </CardContent>
    </Card>
  );
};

// Skeleton for plant details with animation
export const PlantDetailSkeleton = () => {
  const { enableAnimations } = useAnimation();
  
  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={enableAnimations ? { opacity: 0 } : { opacity: 1 }}
    >
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Image skeleton */}
        <Box sx={{ flex: '0 0 40%', maxWidth: { xs: '100%', md: '40%' } }}>
          <Skeleton 
            variant="rectangular" 
            height={400} 
            animation="wave" 
            sx={{ borderRadius: 2 }} 
          />
        </Box>
        
        {/* Details skeleton */}
        <Box sx={{ flex: '1 1 60%' }}>
          <Skeleton variant="rectangular" height={600} animation="wave" sx={{ borderRadius: 2 }} />
        </Box>
      </Box>
    </motion.div>
  );
};

// Row of skeleton cards for the PlantLibrary with staggered animation
export const PlantGridSkeleton = ({ count = 6 }) => {
  const { enableAnimations } = useAnimation();
  
  return (
    <>
      {Array(count).fill(0).map((_, index) => (
        <motion.div
          key={index}
          initial={enableAnimations ? { opacity: 0, y: 20 } : { opacity: 1 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: enableAnimations ? index * 0.05 : 0 }}
        >
          <PlantCardSkeleton />
        </motion.div>
      ))}
    </>
  );
};

// Skeleton for the search bar with animation
export const SearchSkeleton = () => {
  const { enableAnimations } = useAnimation();
  
  return (
    <motion.div
      initial={enableAnimations ? { opacity: 0, y: -10 } : { opacity: 1 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Skeleton 
        variant="rectangular" 
        height={56} 
        animation="wave" 
        sx={{ borderRadius: 30, mb: 3 }} 
      />
    </motion.div>
  );
};