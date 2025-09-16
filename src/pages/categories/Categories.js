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
  Card,
  CardContent,
  CardMedia,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Stack,
  Divider,
  FormControlLabel,
  Switch,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Category as CategoryIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  Image as ImageIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';
import { formatCurrency } from '../../utils/currency';

function Categories() {
  const { currentBusiness } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [useImageUrl, setUseImageUrl] = useState(true); // true para URL, false para upload
  
  const [categoryData, setCategoryData] = useState({
    nombre: '',
    descripcion: '',
    imagen_url: '',
    imagen_file: null,
  });

  useEffect(() => {
    if (currentBusiness) {
      loadCategories();
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

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryData({
        nombre: category.nombre || '',
        descripcion: category.descripcion || '',
        imagen_url: category.imagen_url || '',
        imagen_file: null,
      });
      setUseImageUrl(true); // Por defecto usar URL al editar
    } else {
      setEditingCategory(null);
      setCategoryData({
        nombre: '',
        descripcion: '',
        imagen_url: '',
        imagen_file: null,
      });
      setUseImageUrl(true);
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

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('La imagen no debe superar los 5MB');
        return;
      }
      setCategoryData(prev => ({
        ...prev,
        imagen_file: file
      }));
      setError('');
    }
  };

  const uploadImageToLocal = async (file) => {
    const formData = new FormData();
    formData.append('imagen', file);
    
    try {
      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.imageUrl;
    } catch (error) {
      if (error.message.includes('fetch')) {
        throw new Error('Error de conexión. Verifica que el servidor esté corriendo en puerto 3001.');
      }
      throw new Error(`Error al subir la imagen: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!categoryData.nombre.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = categoryData.imagen_url;

      // Si hay un archivo de imagen, subirlo
      if (!useImageUrl && categoryData.imagen_file) {
        imageUrl = await uploadImageToLocal(categoryData.imagen_file);
      }

      const dataToSend = {
        nombre: categoryData.nombre.trim(),
        descripcion: categoryData.descripcion.trim(),
        imagen_url: imageUrl,
        negocio_id: currentBusiness.id,
      };

      if (editingCategory) {
        await api.put(`/categorias/${editingCategory.id}`, dataToSend);
      } else {
        await api.post('/categorias', dataToSend);
      }

      await loadCategories();
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
    { 
      field: 'imagen_url', 
      headerName: 'Imagen', 
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row.imagen_url}
          alt={params.row.nombre}
          sx={{ width: 40, height: 40 }}
        >
          <CategoryIcon />
        </Avatar>
      )
    },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'descripcion', headerName: 'Descripción', flex: 2 },
    {
      field: 'created_at',
      headerName: 'Fecha Creación',
      width: 150,
      renderCell: (params) => new Date(params.row.created_at).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row)}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const renderCardsView = () => (
      <Grid container spacing={3}>
        {categories.map((category) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
          <Card 
            sx={{ 
              height: 280,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: 6 
              }
            }}
          >
            <CardMedia
              component="div"
              sx={{
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.100',
                backgroundImage: category.imagen_url ? `url(${category.imagen_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!category.imagen_url && (
                <CategoryIcon sx={{ fontSize: 60, color: 'grey.400' }} />
              )}
            </CardMedia>
            <CardContent sx={{ height: 140, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                  {category.nombre}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClick(e, category);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  flexGrow: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {category.descripcion || 'Sin descripción'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="text.secondary">
                Creada: {new Date(category.created_at).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
      </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Categorías
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newViewMode) => {
              if (newViewMode !== null) {
                setViewMode(newViewMode);
              }
            }}
            size="small"
          >
            <ToggleButton value="cards" aria-label="vista de tarjetas">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="table" aria-label="vista de tabla">
              <TableRowsIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Nueva Categoría
          </Button>
        </Box>
      </Box>

      {!currentBusiness ? (
        <Alert severity="warning">
          Selecciona un negocio para gestionar las categorías
        </Alert>
      ) : (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {viewMode === 'cards' ? renderCardsView() : (
            <DataTable
              rows={categories}
              columns={columns}
              loading={loading}
              getRowId={(row) => row.id}
            />
          )}
        </>
      )}

      {/* Menu de acciones */}
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
        <MenuItem onClick={() => {
          handleDelete(selectedCategory?.id);
        }}>
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
              label="Nombre de la Categoría"
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
          
          {/* Sección de imagen */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Imagen de la Categoría
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={useImageUrl}
                  onChange={(e) => setUseImageUrl(e.target.checked)}
                />
              }
              label={useImageUrl ? "Usar URL de imagen" : "Subir imagen desde dispositivo"}
            />
          </Grid>

          {useImageUrl ? (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de la Imagen"
                name="imagen_url"
                value={categoryData.imagen_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ height: 56 }}
              >
                {categoryData.imagen_file ? categoryData.imagen_file.name : 'Seleccionar imagen'}
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageFileChange}
                />
              </Button>
            </Grid>
          )}

          {/* Preview de la imagen */}
          {(categoryData.imagen_url || categoryData.imagen_file) && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Avatar
                  src={categoryData.imagen_file ? URL.createObjectURL(categoryData.imagen_file) : categoryData.imagen_url}
                  alt="Preview"
                  sx={{ width: 100, height: 100 }}
                >
                  <CategoryIcon sx={{ fontSize: 40 }} />
                </Avatar>
              </Box>
            </Grid>
          )}
        </Grid>
      </GlassmorphismDialog>
    </Box>
  );
}

export default Categories; 