import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useApp } from '../../context/AppContext';

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useApp();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    toggleDarkMode();
    
    // Resetear la animación después de completarse
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <Tooltip title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
      <IconButton 
        onClick={handleToggle}
        color="inherit"
        sx={{
          transition: 'all 0.3s ease-in-out',
          transform: isAnimating ? 'scale(1.2) rotate(360deg)' : 'scale(1)',
          '&:hover': {
            transform: isAnimating ? 'scale(1.2) rotate(360deg)' : 'scale(1.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
}

export default ThemeToggle;
