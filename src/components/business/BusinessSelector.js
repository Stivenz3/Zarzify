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
} from '@mui/material';
import {
  Store as StoreIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';

function BusinessSelector() {
  const { user, businesses, currentBusiness, loadBusinesses, switchBusiness } = useApp();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newBusiness, setNewBusiness] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
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
      
      // Primero verificar/crear el usuario en la base de datos con el nuevo formato
      await api.post('/usuarios', {
        id: user.uid,  // usar directamente el UID de Firebase
        email: user.email,
        nombre: user.displayName || user.email.split('@')[0],
        foto_url: user.photoURL || null
      });

      console.log('Usuario verificado/creado con ID:', user.uid);

      // Crear el negocio usando el UID de Firebase directamente
      const businessResponse = await api.post('/businesses', {
        nombre: newBusiness.nombre.trim(),
        direccion: newBusiness.direccion.trim(),
        telefono: newBusiness.telefono.trim(),
        usuario_id: user.uid,  // usar directamente el UID de Firebase
        moneda: 'COP',
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
      });
      
      // Cerrar el diálogo
      setOpenNewDialog(false);
      
      // Seleccionar el nuevo negocio automáticamente
      if (businessResponse.data && businessResponse.data.id) {
        switchBusiness(businessResponse.data.id);
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
    });
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<StoreIcon />}
        endIcon={<ArrowDownIcon />}
        sx={{
          color: 'inherit',
          textTransform: 'none',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
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
            minWidth: 250,
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }
        }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        {businesses && businesses.length > 0 ? (
          <>
            <Typography 
              variant="caption" 
              sx={{ 
                px: 2, 
                py: 1, 
                display: 'block',
                color: 'text.secondary',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
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
                  py: 1.5,
                  px: 2,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                    },
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
            <Divider sx={{ my: 1 }} />
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
            color: 'primary.main',
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: 'primary.light',
              color: 'primary.contrastText',
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
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StoreIcon sx={{ mr: 1, color: 'primary.main' }} />
            Crear Nuevo Negocio
          </Box>
        </DialogTitle>
        <DialogContent>
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
              error={!newBusiness.nombre.trim() && error}
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
              placeholder="Opcional"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateBusiness}
            variant="contained"
            disabled={!newBusiness.nombre.trim() || loading}
            sx={{ px: 3 }}
          >
            {loading ? 'Creando...' : 'Crear Negocio'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BusinessSelector; 