import React from 'react';
import { Box } from '@mui/material';

// Animated background patterns for the landing page
const BackgroundPattern = () => {
  // Create a pattern of shapes
  const patternElements = [];
  
  // Generate random pattern elements
  for (let i = 0; i < 15; i++) {
    patternElements.push({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 40 + 30,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.06 + 0.02, // Very subtle
      animationDuration: 15 + Math.random() * 30,
      type: Math.random() > 0.5 ? 'circle' : 'leaf'
    });
  }
  
  return (
    <>
      {patternElements.map((element) => (
        <Box
          key={element.id}
          className="bg-pattern"
          sx={{
            position: 'absolute',
            top: `${element.top}%`,
            left: `${element.left}%`,
            width: element.size,
            height: element.size,
            opacity: element.opacity,
            backgroundColor: 'transparent',
            borderRadius: element.type === 'circle' ? '50%' : '0% 70% 0% 70%',
            border: '2px solid',
            borderColor: 'primary.main',
            transform: `rotate(${element.rotation}deg)`,
            animation: `float ${element.animationDuration}s ease-in-out infinite alternate`,
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
      ))}
    </>
  );
};

export default BackgroundPattern;