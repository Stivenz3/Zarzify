import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';

function Business() {
  const { user, businesses, currentBusiness } = useApp();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    rfc: '',
    descripcion: '',
  });

  const handleOpenDialog = (business = null) => {
    if (business) {
      setSelectedBusiness(business);
      setFormData(business);
    } else {
      setSelectedBusiness(null);
      setFormData({
        nombre: '',
        direccion: '',
        telefono: '',
        email: '',
        rfc: '',
        descripcion: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBusiness(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedBusiness) {
        await api.put(`/businesses/${selectedBusiness.id}`, {
          ...formData,
          usuario_id: user.uid
        });
      } else {
        await api.post('/businesses', {
          ...formData,
          usuario_id: user.uid
        });
      }
      // Recargar la página para actualizar la lista de negocios
      window.location.reload();
    } catch (error) {
      setError('Error al guardar el negocio');
    }
  };

  const handleDelete = async (business) => {
    if (window.confirm('¿Está seguro de eliminar este negocio?')) {
      try {
        await api.delete(`/businesses/${business.id}`);
        window.location.reload();
      } catch (error) {
        setError('Error al eliminar el negocio');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Mis Negocios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Negocio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {businesses.map((business) => (
          <Grid item xs={12} sm={6} md={4} key={business.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
              }}
            >
              {business.id === currentBusiness?.id && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                  }}
                >
                  Actual
                </Box>
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    {business.nombre}
                  </Typography>
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  {business.direccion}
                </Typography>
                <Typography variant="body2">
                  Teléfono: {business.telefono}
                </Typography>
                {business.email && (
                  <Typography variant="body2">
                    Email: {business.email}
                  </Typography>
                )}
                {business.rfc && (
                  <Typography variant="body2">
                    RFC: {business.rfc}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  size="small"
                  onClick={() => handleOpenDialog(business)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleDelete(business)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedBusiness ? 'Editar Negocio' : 'Nuevo Negocio'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Negocio"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="RFC"
                name="rfc"
                value={formData.rfc}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.nombre || !formData.direccion}
          >
            {selectedBusiness ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Business; 