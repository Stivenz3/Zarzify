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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  IconButton,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';

function Products() {
  const { currentBusiness } = useApp();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [productData, setProductData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    precio_compra: '',
    stock: '',
    categoria_id: '',
    codigo_barras: '',
    impuesto: '',
    stock_minimo: '',
    imagen_url: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      loadProducts();
      loadCategories();
    }
  }, [currentBusiness]);

  const loadProducts = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const response = await api.get(`/productos/${currentBusiness.id}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    if (!currentBusiness) return;
    try {
      const response = await api.get(`/categorias/${currentBusiness.id}`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio_venta: product.precio_venta || '',
        precio_compra: product.precio_compra || '',
        stock: product.stock || '',
        categoria_id: product.categoria_id || '',
        codigo_barras: product.codigo_barras || '',
        impuesto: product.impuesto || '',
        stock_minimo: product.stock_minimo || '',
        imagen_url: product.imagen_url || '',
      });
    } else {
      setEditingProduct(null);
      setProductData({
        nombre: '',
        descripcion: '',
        precio_venta: '',
        precio_compra: '',
        stock: '',
        categoria_id: '',
        codigo_barras: '',
        impuesto: '',
        stock_minimo: '',
        imagen_url: '',
      });
    }
    setOpenDialog(true);
    setError('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!productData.nombre.trim() || !productData.precio_venta) {
      setError('Nombre y precio de venta son requeridos');
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        ...productData,
        negocio_id: currentBusiness.id,
        precio_venta: parseFloat(productData.precio_venta) || 0,
        precio_compra: parseFloat(productData.precio_compra) || 0,
        stock: parseFloat(productData.stock) || 0,
        impuesto: parseFloat(productData.impuesto) || 0,
        stock_minimo: parseFloat(productData.stock_minimo) || 0,
      };

      if (editingProduct) {
        await api.put(`/productos/${editingProduct.id}`, dataToSend);
      } else {
        await api.post('/productos', dataToSend);
      }

      await loadProducts();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setError(error.response?.data?.error || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await api.delete(`/productos/${productId}`);
        await loadProducts();
        handleCloseMenu();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert(error.response?.data?.error || 'Error al eliminar el producto');
      }
    }
  };

  const handleMenuClick = (event, product) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(product);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const columns = [
    {
      field: 'imagen',
      headerName: 'Imagen',
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row.imagen_url}
          sx={{ width: 40, height: 40 }}
        >
          <ImageIcon />
        </Avatar>
      ),
    },
    { field: 'nombre', headerName: 'Nombre', flex: 1 },
    { field: 'categoria_nombre', headerName: 'Categoría', width: 150 },
    { field: 'codigo_barras', headerName: 'Código', width: 120 },
    {
      field: 'precio_venta',
      headerName: 'Precio Venta',
      width: 120,
      renderCell: (params) => `$${parseFloat(params.row.precio_venta || 0).toFixed(2)}`,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => {
        const stock = parseFloat(params.row.stock || 0);
        const stockMinimo = parseFloat(params.row.stock_minimo || 0);
        const isLowStock = stock <= stockMinimo;
        
        return (
          <Chip
            label={stock}
            color={isLowStock ? 'error' : 'success'}
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
          Selecciona un negocio para ver los productos
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Productos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Producto
        </Button>
      </Box>

      <DataTable
        rows={products}
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
          handleOpenDialog(selectedProduct);
          handleCloseMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedProduct?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar producto */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
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
                value={productData.nombre}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="categoria_id"
                  value={productData.categoria_id}
                  onChange={handleInputChange}
                  label="Categoría"
                >
                  <MenuItem value="">
                    <em>Sin categoría</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={productData.descripcion}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Código de Barras"
                name="codigo_barras"
                value={productData.codigo_barras}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="URL de Imagen"
                name="imagen_url"
                value={productData.imagen_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de Venta *"
                name="precio_venta"
                type="number"
                value={productData.precio_venta}
                onChange={handleInputChange}
                required
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Precio de Compra"
                name="precio_compra"
                type="number"
                value={productData.precio_compra}
                onChange={handleInputChange}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock"
                name="stock"
                type="number"
                value={productData.stock}
                onChange={handleInputChange}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                name="stock_minimo"
                type="number"
                value={productData.stock_minimo}
                onChange={handleInputChange}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Impuesto (%)"
                name="impuesto"
                type="number"
                value={productData.impuesto}
                onChange={handleInputChange}
                inputProps={{ step: "0.01", min: "0", max: "100" }}
              />
            </Grid>
            
            {productData.imagen_url && (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Vista previa:
                  </Typography>
                  <Avatar
                    src={productData.imagen_url}
                    sx={{ width: 100, height: 100, mx: 'auto' }}
                  >
                    <ImageIcon />
                  </Avatar>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Products; 