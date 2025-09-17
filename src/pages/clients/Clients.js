import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Grid,
  Menu,
  MenuItem,
  Chip,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import { useApp } from '../../context/AppContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { clientsService } from '../../services/firestoreService';

function Clients() {
  const { currentBusiness } = useApp();
  const { markDashboardForRefresh } = useDashboard();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  
  const [clientData, setClientData] = useState({
    nombre: '',
    telefono: '',
    direccion: '',
    email: '',
    credito_disponible: '',
  });

  // Estados para filtros
  const [creditOrder, setCreditOrder] = useState(null); // null = sin filtro, 'desc' = mayor a menor, 'asc' = menor a mayor

  useEffect(() => {
    if (currentBusiness) {
      loadClients();
    }
  }, [currentBusiness]);

  const loadClients = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      // Cargar clientes desde Firestore filtrados por business_id
      const allClients = await clientsService.getWhere('business_id', '==', currentBusiness.id);
      setClients(allClients);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
      setError('Error al cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (client = null) => {
    if (client) {
      setEditingClient(client);
      setClientData({
        nombre: client.nombre || '',
        telefono: client.telefono || '',
        direccion: client.direccion || '',
        email: client.email || '',
        credito_disponible: client.credito_disponible || '',
      });
    } else {
      setEditingClient(null);
      setClientData({
        nombre: '',
        telefono: '',
        direccion: '',
        email: '',
        credito_disponible: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClient(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!clientData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    // Validación del teléfono - obligatorio y formato colombiano
    if (!clientData.telefono.trim()) {
      setError('El teléfono es requerido');
      return;
    }

    // Validar formato colombiano: 10 dígitos empezando por 3
    const telefonoRegex = /^3\d{9}$/;
    if (!telefonoRegex.test(clientData.telefono.trim())) {
      setError('El teléfono debe tener 10 dígitos');
      return;
    }

    // Validación del email - opcional pero si se proporciona debe ser válido
    if (clientData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email.trim())) {
        setError('Por favor ingresa un email válido');
        return;
      }
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...clientData,
        business_id: currentBusiness.id,
        credito_disponible: parseFloat(clientData.credito_disponible) || 0,
        // Limpiar espacios
        nombre: clientData.nombre.trim(),
        telefono: clientData.telefono.trim(),
        direccion: clientData.direccion.trim(),
        email: clientData.email.trim() || null, // null si está vacío
      };

      if (editingClient) {
        // Actualizar cliente existente en Firestore
        await clientsService.update(editingClient.id, dataToSend);
      } else {
        // Crear nuevo cliente en Firestore
        await clientsService.create(dataToSend);
      }

      await loadClients();
      handleCloseDialog();
      markDashboardForRefresh();
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      setError(error.response?.data?.error || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener clientes ordenados
  const getFilteredClients = () => {
    return [...clients].sort((a, b) => {
      if (creditOrder === null) {
        // Sin filtro activo: ordenar por fecha de registro (más reciente arriba)
        const dateA = new Date(a.created_at || a.id);
        const dateB = new Date(b.created_at || b.id);
        return dateB - dateA;
      }
      
      // Con filtro activo: ordenar por crédito
      const creditoA = parseFloat(a.credito_disponible) || 0;
      const creditoB = parseFloat(b.credito_disponible) || 0;
      
      if (creditOrder === 'desc') {
        return creditoB - creditoA; // Mayor a menor
      } else {
        return creditoA - creditoB; // Menor a mayor
      }
    });
  };

  const handleDelete = async (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        // Eliminar cliente de Firestore
        await clientsService.delete(clientId);
        await loadClients();
        handleCloseMenu();
        markDashboardForRefresh();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  const handleMenuClick = (event, client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const columns = [
    {
      field: 'nombre',
      headerName: 'Nombre',
      flex: 1,
    },
    { field: 'telefono', headerName: 'Teléfono', width: 120 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'direccion', headerName: 'Dirección', width: 200 },
    {
      field: 'credito_disponible',
      headerName: 'Crédito',
      width: 180,
      renderCell: (params) => {
        const credito = parseFloat(params.row.credito_disponible || 0);
        return (
          <CurrencyDisplay
            amount={credito}
            showAsChip={true}
            chipProps={{
              color: credito > 0 ? 'success' : 'default',
              variant: 'filled'
            }}
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, params.row)}
          size="small"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          Selecciona un negocio para ver los clientes
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Cliente
        </Button>
      </Box>

      <DataTable
        rows={getFilteredClients()}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        extraFilters={
          <>
            <Button
              variant={creditOrder === 'desc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setCreditOrder(creditOrder === 'desc' ? null : 'desc')}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Mayor Crédito
            </Button>
            <Button
              variant={creditOrder === 'asc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setCreditOrder(creditOrder === 'asc' ? null : 'asc')}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              Menor Crédito
            </Button>
            {creditOrder !== null && (
              <Button
                variant="text"
                size="small"
                onClick={() => setCreditOrder(null)}
                sx={{ minWidth: 'auto', px: 1, color: 'text.secondary' }}
              >
                ✕ Limpiar
              </Button>
            )}
          </>
        }
      />

      {/* Menú de acciones */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          handleOpenDialog(selectedClient);
          handleCloseMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedClient?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar cliente */}
      <GlassmorphismDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        subtitle={editingClient ? 'Modifica los datos del cliente' : 'Agrega un nuevo cliente a tu cartera'}
        icon={PersonIcon}
        maxWidth="md"
        actions={
          <>
            <CancelButton onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </CancelButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading || !clientData.nombre.trim()}
            >
              {loading ? 'Guardando...' : (editingClient ? 'Actualizar' : 'Crear')}
            </PrimaryButton>
          </>
        }
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre *"
              name="nombre"
              value={clientData.nombre}
              onChange={handleInputChange}
              required
              error={Boolean(!clientData.nombre.trim() && error)}
              helperText={!clientData.nombre.trim() && error ? 'El nombre es requerido' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono"
              name="telefono"
              value={clientData.telefono}
              onChange={handleInputChange}
              placeholder="Teléfono de contacto"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={clientData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dirección"
              name="direccion"
              value={clientData.direccion}
              onChange={handleInputChange}
              multiline
              rows={2}
              placeholder="Dirección completa del cliente"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Crédito Disponible"
              name="credito_disponible"
              type="number"
              value={clientData.credito_disponible}
              onChange={handleInputChange}
              inputProps={{ step: "0.01", min: "0" }}
              placeholder="0.00"
            />
          </Grid>
        </Grid>
      </GlassmorphismDialog>
    </Box>
  );
}

export default Clients; 