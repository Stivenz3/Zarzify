import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Inventory as InventoryIcon 
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import DataTable from '../../components/common/DataTable';
import api from '../../config/axios';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_venta: '',
    precio_compra: '',
    stock: '',
    categoria_id: '',
    codigo_barras: '',
    impuesto: '',
    stock_minimo: '',
  });

  const columns = [
    { field: 'nombre', headerName: 'Nombre' },
    { field: 'codigo_barras', headerName: 'Código de Barras' },
    {
      field: 'precio_venta',
      headerName: 'Precio de Venta',
      numeric: true,
      renderCell: (value) => `$${value.toFixed(2)}`,
    },
    {
      field: 'stock',
      headerName: 'Stock',
      numeric: true,
    },
    {
      field: 'categoria_id',
      headerName: 'Categoría',
      renderCell: (value) =>
        categories.find((cat) => cat.id === value)?.nombre || '',
    },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/productos');
      setProducts(response.data);
    } catch (error) {
      setError('Error al cargar los productos');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categorias');
      setCategories(response.data);
    } catch (error) {
      setError('Error al cargar las categorías');
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData(product);
    } else {
      setSelectedProduct(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio_venta: '',
        precio_compra: '',
        stock: '',
        categoria_id: '',
        codigo_barras: '',
        impuesto: '',
        stock_minimo: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProduct(null);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (selectedProduct) {
        await api.put(`/productos/${selectedProduct.id}`, formData);
      } else {
        await api.post('/productos', formData);
      }
      fetchProducts();
      handleCloseDialog();
    } catch (error) {
      setError('Error al guardar el producto');
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      try {
        await api.delete(`/productos/${product.id}`);
        fetchProducts();
      } catch (error) {
        setError('Error al eliminar el producto');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={products}
        onEdit={handleOpenDialog}
        onDelete={handleDelete}
        searchFields={['nombre', 'codigo_barras']}
      />

      <GlassmorphismDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={selectedProduct ? 'Editar Producto' : 'Nuevo Producto'}
        subtitle={selectedProduct ? 'Modifica los datos del producto' : 'Agrega un nuevo producto al inventario'}
        icon={InventoryIcon}
        maxWidth="md"
        actions={
          <>
            <CancelButton onClick={handleCloseDialog}>
              Cancelar
            </CancelButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={!formData.nombre.trim()}
            >
              {selectedProduct ? 'Actualizar' : 'Crear'}
            </PrimaryButton>
          </>
        }
      >
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Nombre *"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              error={Boolean(!formData.nombre.trim() && error)}
              helperText={!formData.nombre.trim() && error ? 'El nombre es requerido' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Código de Barras"
              name="codigo_barras"
              value={formData.codigo_barras}
              onChange={handleInputChange}
              placeholder="123456789012"
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
              placeholder="Descripción detallada del producto"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Precio de Venta"
              name="precio_venta"
              value={formData.precio_venta}
              onChange={handleInputChange}
              inputProps={{ step: "0.01", min: "0" }}
              placeholder="0.00"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Precio de Compra"
              name="precio_compra"
              value={formData.precio_compra}
              onChange={handleInputChange}
              inputProps={{ step: "0.01", min: "0" }}
              placeholder="0.00"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              inputProps={{ min: "0" }}
              placeholder="0"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Stock Mínimo"
              name="stock_minimo"
              value={formData.stock_minimo}
              onChange={handleInputChange}
              inputProps={{ min: "0" }}
              placeholder="0"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Categoría</InputLabel>
              <Select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleInputChange}
                label="Categoría"
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Impuesto (%)"
              name="impuesto"
              value={formData.impuesto}
              onChange={handleInputChange}
              inputProps={{ step: "0.01", min: "0", max: "100" }}
              placeholder="0.00"
            />
          </Grid>
        </Grid>
      </GlassmorphismDialog>
    </Box>
  );
}

export default Products; 