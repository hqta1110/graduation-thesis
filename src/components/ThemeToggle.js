import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion } from 'framer-motion';
import { useAnimation } from '../contexts/AnimationContext';

const ThemeToggle = ({ onClick, mode }) => {
  const { enableAnimations } = useAnimation();
  
  return (
    <Tooltip title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
      <IconButton 
        onClick={onClick} 
        color="inherit" 
        aria-label="toggle theme"
        component={motion.button}
        whileHover={enableAnimations ? { scale: 1.1, rotate: 5 } : {}}
        whileTap={enableAnimations ? { scale: 0.9, rotate: 0 } : {}}
      >
        {mode === 'dark' ? (
          <Brightness7Icon sx={{ color: 'orange' }} />
        ) : (
          <Brightness4Icon sx={{ color: '#1b5e20' }} />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;