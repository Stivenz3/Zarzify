import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from '@mui/material';
import { useApp } from '../../context/AppContext';

function GlassmorphismDialog({ 
  open, 
  onClose, 
  title, 
  subtitle, 
  icon: IconComponent,
  maxWidth = "sm",
  fullWidth = true,
  children,
  actions,
  ...props 
}) {
  const { darkMode } = useApp();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
          backgroundImage: darkMode 
            ? 'linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          boxShadow: darkMode 
            ? '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
            : '0 20px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(20px)',
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: darkMode 
            ? 'rgba(0, 0, 0, 0.8)' 
            : 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
        }
      }}
      {...props}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        pt: 3,
        px: 3,
        borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {IconComponent && (
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(116, 185, 255, 0.15)' : 'rgba(25, 118, 210, 0.1)',
              mr: 2,
            }}>
              <IconComponent sx={{ 
                color: darkMode ? '#74b9ff' : 'primary.main',
                fontSize: 24,
              }} />
            </Box>
          )}
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 'bold',
              color: darkMode ? '#ffffff' : '#000000',
            }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ 
                color: darkMode ? '#b3b3b3' : 'text.secondary',
                mt: 0.5,
              }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ px: 3, py: 3 }}>
        {children}
      </DialogContent>
      
      {actions && (
        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          gap: 2,
        }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}

export default GlassmorphismDialog;
