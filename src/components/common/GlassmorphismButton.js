import React from 'react';
import { Button } from '@mui/material';
import { useApp } from '../../context/AppContext';

export function CancelButton({ children, ...props }) {
  const { darkMode } = useApp();
  
  return (
    <Button 
      {...props}
      sx={{
        px: 3,
        py: 1.5,
        borderRadius: '12px',
        color: darkMode ? '#b3b3b3' : 'text.secondary',
        '&:hover': {
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        },
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
}

export function PrimaryButton({ children, loading, ...props }) {
  const { darkMode } = useApp();
  
  return (
    <Button
      variant="contained"
      {...props}
      sx={{ 
        px: 4,
        py: 1.5,
        borderRadius: '12px',
        background: darkMode 
          ? 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)' 
          : 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: darkMode 
          ? '0 8px 25px rgba(116, 185, 255, 0.4)' 
          : '0 4px 15px rgba(25, 118, 210, 0.3)',
        '&:hover': {
          background: darkMode 
            ? 'linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%)' 
            : 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          transform: 'translateY(-2px)',
          boxShadow: darkMode 
            ? '0 12px 30px rgba(116, 185, 255, 0.5)' 
            : '0 8px 20px rgba(25, 118, 210, 0.4)',
        },
        '&:disabled': {
          background: darkMode ? '#444' : '#e0e0e0',
          color: darkMode ? '#666' : '#999',
        },
        transition: 'all 0.3s ease-in-out',
        ...props.sx
      }}
    >
      {children}
    </Button>
  );
}
