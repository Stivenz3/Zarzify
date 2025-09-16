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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';

function Categories() {
  const { currentBusiness } = useApp();
  const [categories, setCategories] = useState([]);
  const [categoriesWithInventory, setCategoriesWithInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [categoryData, setCategoryData] = useState({
    nombre: '',
    descripcion: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      loadCategories();
      loadCategoriesWithInventory();
    }
  }, [currentBusiness]);

  const loadCategories = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const response = await api.get(`/categorias/${currentBusiness.id}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoriesWithInventory = async () => {
    if (!currentBusiness) return;
    try {
      const response = await api.get(`/categorias/${currentBusiness.id}/inventory-value`);
      setCategoriesWithInventory(response.data);
    } catch (error) {
      console.error('Error al cargar valor de inventario:', error);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryData({
        nombre: category.nombre || '',
        descripcion: category.descripcion || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryData({
        nombre: '',
        descripcion: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!categoryData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...categoryData,
        negocio_id: currentBusiness.id,
      };

      if (editingCategory) {
        await api.put(`/categorias/${editingCategory.id}`, dataToSend);
      } else {
        await api.post('/categorias', dataToSend);
      }

      await loadCategories();
      await loadCategoriesWithInventory();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      setError(error.response?.data?.error || 'Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await api.delete(`/categorias/${categoryId}`);
        await loadCategories();
        await loadCategoriesWithInventory();
        handleCloseMenu();
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        alert(error.response?.data?.error || 'Error al eliminar la categoría');
      }
    }
  };

  const handleMenuClick = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCategory(null);
  };

  const columns = [
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { 
      field: 'productos_count', 
      headerName: 'Productos', 
      width: 120,
      renderCell: (params) => {
        const inventoryData = categoriesWithInventory.find(inv => inv.id === params.row.id);
        return inventoryData ? parseInt(inventoryData.productos_count) : 0;
      }
    },
    { 
      field: 'stock_total', 
      headerName: 'Stock Total', 
      width: 120,
      renderCell: (params) => {
        const inventoryData = categoriesWithInventory.find(inv => inv.id === params.row.id);
        return inventoryData ? parseInt(inventoryData.stock_total) : 0;
      }
    },
    { 
      field: 'valor_inventario', 
      headerName: 'Valor Inventario', 
      width: 150,
      renderCell: (params) => {
        const inventoryData = categoriesWithInventory.find(inv => inv.id === params.row.id);
        const valor = inventoryData ? parseFloat(inventoryData.valor_inventario) : 0;
        return (
          <CurrencyDisplay
            amount={valor}
            variant="body2"
            sx={{ 
              color: valor > 0 ? 'success.main' : 'text.secondary',
              fontWeight: valor > 0 ? 'bold' : 'normal'
            }}
          />
        );
      }
    },
    { field: 'descripcion', headerName: 'Descripción', flex: 2 },
    {
      field: 'created_at',
      headerName: 'Fecha Creación',
      width: 140,
      renderCell: ({ row }) => {
        const date = new Date(row.created_at);
        return date.toLocaleDateString();
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: ({ row }) => (
        <IconButton
          onClick={(e) => handleMenuClick(e, row)}
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
          Selecciona un negocio para ver las categorías
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Categorías
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Categoría
        </Button>
      </Box>

      <DataTable
        rows={categories}
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
          handleOpenDialog(selectedCategory);
          handleCloseMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedCategory?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar categoría */}
      <GlassmorphismDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        subtitle={editingCategory ? 'Modifica los datos de la categoría' : 'Agrega una nueva categoría para organizar tus productos'}
        icon={CategoryIcon}
        maxWidth="sm"
        actions={
          <>
            <CancelButton onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </CancelButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading || !categoryData.nombre.trim()}
            >
              {loading ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Crear')}
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre *"
              name="nombre"
              value={categoryData.nombre}
              onChange={handleInputChange}
              required
              error={Boolean(!categoryData.nombre.trim() && error)}
              helperText={!categoryData.nombre.trim() && error ? 'El nombre es requerido' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descripción"
              name="descripcion"
              value={categoryData.descripcion}
              onChange={handleInputChange}
              multiline
              rows={3}
              placeholder="Descripción opcional de la categoría"
            />
          </Grid>
        </Grid>
      </GlassmorphismDialog>
    </Box>
  );
}

export default Categories; 