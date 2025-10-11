import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Store as StoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useTheme } from '@mui/material/styles';
import api from '../../config/axios';
import { getCurrencyOptions } from '../../utils/currency';

function BusinessSelector() {
  const { user, businesses, currentBusiness, loadBusinesses, switchBusiness, darkMode } = useApp();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    divisa: 'COP',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSwitchBusiness = (business) => {
    switchBusiness(business.id);
    handleClose();
  };

  const handleNewBusinessChange = (e) => {
    const { name, value } = e.target;
    setNewBusiness(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error al escribir
    if (error) setError('');
  };

  const handleCreateBusiness = async () => {
    if (!user || !user.uid) {
      setError('Error: Usuario no autenticado');
      return;
    }

    if (!newBusiness.nombre.trim()) {
      setError('El nombre del negocio es requerido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Creando negocio para usuario:', user.uid);
      
      // El usuario ya se guarda automáticamente en el login
      console.log('Usuario ya registrado en Firestore');

      // Crear el negocio usando el UID de Firebase directamente
      const businessResponse = await api.post('/negocios', {
        nombre: newBusiness.nombre.trim(),
        direccion: newBusiness.direccion.trim(),
        telefono: newBusiness.telefono.trim(),
        user_id: user.uid,  // usar directamente el UID de Firebase
        email: user.email,
        impuesto_default: 0.00
      });

      console.log('Negocio creado:', businessResponse.data);

      // Recargar la lista de negocios
      await loadBusinesses();
      
      // Limpiar el formulario
      setNewBusiness({
        nombre: '',
        direccion: '',
        telefono: '',
        divisa: 'COP',
      });
      
      // Cerrar el diálogo
      setOpenNewDialog(false);
      
      // Seleccionar el nuevo negocio automáticamente
      if (businessResponse.data && businessResponse.data.id) {
        await switchBusiness(businessResponse.data.id);
      }
      
    } catch (error) {
      console.error('Error detallado al crear negocio:', error);
      if (error.response) {
        setError(`Error del servidor: ${error.response.data.error || 'Error desconocido'}`);
      } else if (error.request) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
      } else {
        setError('Error al crear el negocio: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenNewDialog(false);
    setError('');
    setNewBusiness({
      nombre: '',
      direccion: '',
      telefono: '',
      divisa: 'COP',
    });
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<StoreIcon />}
        endIcon={<ArrowDownIcon />}
        sx={{
          color: darkMode ? '#ffffff' : '#000000',
          textTransform: 'none',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          backgroundColor: darkMode 
            ? 'rgba(255, 255, 255, 0.08)' 
            : 'rgba(255, 255, 255, 0.9)',
          border: `1px solid ${darkMode 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'rgba(0, 0, 0, 0.1)'}`,
          borderRadius: '12px',
          padding: '8px 16px',
          backdropFilter: 'blur(10px)',
          boxShadow: darkMode 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            backgroundColor: darkMode 
              ? 'rgba(255, 255, 255, 0.15)' 
              : 'rgba(255, 255, 255, 1)',
            borderColor: darkMode 
              ? 'rgba(255, 255, 255, 0.25)' 
              : 'rgba(0, 0, 0, 0.2)',
            transform: 'translateY(-1px)',
            boxShadow: darkMode 
              ? '0 6px 25px rgba(0, 0, 0, 0.4)' 
              : '0 4px 15px rgba(0, 0, 0, 0.15)',
          },
          minWidth: '200px',
          justifyContent: 'flex-start',
        }}
      >
        <Box sx={{ textAlign: 'left', flexGrow: 1 }}>
          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.7rem', opacity: 0.8 }}>
            Negocio Actual
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
            {currentBusiness?.nombre || 'Seleccionar Negocio'}
          </Typography>
        </Box>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { 
            minWidth: 280,
            borderRadius: '16px',
            backgroundColor: darkMode ? '#2d2d2d' : '#ffffff',
            backgroundImage: darkMode 
              ? 'linear-gradient(135deg, #2d2d2d 0%, #1e1e1e 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: darkMode 
              ? '0 16px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${darkMode 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'rgba(0, 0, 0, 0.05)'}`,
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            mt: 1,
          }
        }}
      >
        {businesses && businesses.length > 0 ? (
          <>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 3, 
                py: 2, 
                display: 'block',
                color: darkMode ? '#b3b3b3' : 'text.secondary',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.75rem',
                borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                mb: 1,
              }}
            >
              Mis Negocios
            </Typography>
            {businesses.map((business) => (
              <MenuItem
                key={business.id}
                onClick={() => handleSwitchBusiness(business)}
                selected={currentBusiness?.id === business.id}
                sx={{
                  py: 2,
                  px: 3,
                  mx: 1,
                  my: 0.5,
                  borderRadius: '12px',
                  transition: 'all 0.3s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: darkMode 
                      ? 'rgba(25, 118, 210, 0.3)' 
                      : 'rgba(25, 118, 210, 0.1)',
                    color: darkMode ? '#ffffff' : 'primary.main',
                    backgroundImage: darkMode 
                      ? 'linear-gradient(135deg, rgba(25, 118, 210, 0.3) 0%, rgba(25, 118, 210, 0.1) 100%)'
                      : 'linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0.05) 100%)',
                    border: `1px solid ${darkMode ? 'rgba(25, 118, 210, 0.5)' : 'rgba(25, 118, 210, 0.3)'}`,
                    '&:hover': {
                      backgroundColor: darkMode 
                        ? 'rgba(25, 118, 210, 0.4)' 
                        : 'rgba(25, 118, 210, 0.15)',
                      transform: 'translateX(4px)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: darkMode 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                    transform: 'translateX(2px)',
                  },
                }}
              >
                <StoreIcon sx={{ mr: 2, fontSize: 20 }} />
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {business.nombre}
                  </Typography>
                  {business.direccion && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {business.direccion}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))}
            <Divider sx={{ 
              my: 2, 
              mx: 2,
              borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            }} />
          </>
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              No hay negocios disponibles
            </Typography>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleClose();
            setOpenNewDialog(true);
          }}
          sx={{ 
            color: darkMode ? '#74b9ff' : 'primary.main',
            py: 2,
            px: 3,
            mx: 1,
            mb: 1,
            borderRadius: '12px',
            background: darkMode 
              ? 'linear-gradient(135deg, rgba(116, 185, 255, 0.1) 0%, rgba(116, 185, 255, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.02) 100%)',
            border: `1px dashed ${darkMode ? 'rgba(116, 185, 255, 0.3)' : 'rgba(25, 118, 210, 0.3)'}`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: darkMode 
                ? 'rgba(116, 185, 255, 0.15)' 
                : 'rgba(25, 118, 210, 0.1)',
              color: darkMode ? '#ffffff' : 'primary.main',
              transform: 'translateX(4px) scale(1.02)',
              borderColor: darkMode ? 'rgba(116, 185, 255, 0.5)' : 'rgba(25, 118, 210, 0.5)',
              borderStyle: 'solid',
            },
          }}
        >
          <AddIcon sx={{ mr: 2, fontSize: 20 }} />
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            Nuevo Negocio
          </Typography>
        </MenuItem>
      </Menu>

      <Dialog
        open={openNewDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
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
      >
        <DialogTitle sx={{ 
          pb: 1, 
          pt: 3,
          px: 3,
          borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: darkMode ? 'rgba(116, 185, 255, 0.15)' : 'rgba(25, 118, 210, 0.1)',
              mr: 2,
            }}>
              <StoreIcon sx={{ 
                color: darkMode ? '#74b9ff' : 'primary.main',
                fontSize: 24,
              }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ 
                fontWeight: 'bold',
                color: darkMode ? '#ffffff' : '#000000',
              }}>
                Crear Nuevo Negocio
              </Typography>
              <Typography variant="body2" sx={{ 
                color: darkMode ? '#b3b3b3' : 'text.secondary',
                mt: 0.5,
              }}>
                Agrega un nuevo negocio a tu cuenta
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Nombre del Negocio"
              name="nombre"
              value={newBusiness.nombre}
              onChange={handleNewBusinessChange}
              sx={{ mb: 2 }}
              required
              error={Boolean(!newBusiness.nombre.trim() && error)}
              helperText={!newBusiness.nombre.trim() && error ? 'El nombre es requerido' : ''}
            />
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={newBusiness.direccion}
              onChange={handleNewBusinessChange}
              sx={{ mb: 2 }}
              placeholder="Opcional"
            />
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={newBusiness.telefono}
              onChange={handleNewBusinessChange}
              sx={{ mb: 2 }}
              placeholder="Opcional"
            />
            <FormControl fullWidth>
              <InputLabel>Divisa</InputLabel>
              <Select
                name="divisa"
                value={newBusiness.divisa}
                onChange={handleNewBusinessChange}
                label="Divisa"
              >
                {getCurrencyOptions().map((currency) => (
                  <MenuItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          gap: 2,
        }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={loading}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: '12px',
              color: darkMode ? '#b3b3b3' : 'text.secondary',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateBusiness}
            variant="contained"
            disabled={!newBusiness.nombre.trim() || loading}
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
            }}
          >
            {loading ? 'Creando...' : ' Crear Negocio'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BusinessSelector; 