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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';

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

  useEffect(() => {
    if (currentBusiness) {
      loadClients();
    }
  }, [currentBusiness]);

  const loadClients = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const response = await api.get(`/clientes/${currentBusiness.id}`);
      setClients(response.data);
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

    setLoading(true);
    try {
      const dataToSend = {
        ...clientData,
        negocio_id: currentBusiness.id,
        credito_disponible: parseFloat(clientData.credito_disponible) || 0,
      };

      if (editingClient) {
        await api.put(`/clientes/${editingClient.id}`, dataToSend);
      } else {
        await api.post('/clientes', dataToSend);
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

  const handleDelete = async (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await api.delete(`/clientes/${clientId}`);
        await loadClients();
        handleCloseMenu();
        markDashboardForRefresh();
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert(error.response?.data?.error || 'Error al eliminar el cliente');
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
      width: 120,
      renderCell: (params) => {
        const credito = parseFloat(params.row.credito_disponible || 0);
        return (
          <Chip
            label={`$${credito.toFixed(2)}`}
            color={credito > 0 ? 'success' : 'default'}
            size="small"
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
        rows={clients}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        </DialogTitle>
        <DialogContent>
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
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={clientData.telefono}
                onChange={handleInputChange}
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Guardando...' : editingClient ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Clients; 