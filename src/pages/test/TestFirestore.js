import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { productsService } from '../../services/firestoreService';
import { useApp } from '../../context/AppContext';

function TestFirestore() {
  const { currentBusiness } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newProduct, setNewProduct] = useState({
    nombre: '',
    precio_venta: '',
    stock: '',
  });

  useEffect(() => {
    if (currentBusiness) {
      loadProducts();
    }
  }, [currentBusiness]);

  const loadProducts = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Cargando productos para business:', currentBusiness.id);
      const allProducts = await productsService.getWhere('business_id', '==', currentBusiness.id);
      console.log('✅ Productos cargados:', allProducts);
      setProducts(allProducts);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
      setError('Error al cargar los productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!currentBusiness) {
      setError('No hay negocio seleccionado');
      return;
    }

    if (!newProduct.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productData = {
        ...newProduct,
        business_id: currentBusiness.id,
        precio_venta: parseFloat(newProduct.precio_venta) || 0,
        stock: parseFloat(newProduct.stock) || 0,
        descripcion: 'Producto de prueba',
        precio_compra: 0,
        impuesto: 0,
        stock_minimo: 0,
        categoria_id: null,
        codigo_barras: '',
        imagen_url: '',
      };

      console.log('🚀 Creando producto:', productData);
      await productsService.create(productData);
      console.log('✅ Producto creado exitosamente');
      
      setSuccess('Producto creado exitosamente');
      setNewProduct({ nombre: '', precio_venta: '', stock: '' });
      await loadProducts();
    } catch (error) {
      console.error('❌ Error al crear producto:', error);
      setError('Error al crear el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Eliminar este producto de prueba?')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🗑️ Eliminando producto:', productId);
      await productsService.delete(productId);
      console.log('✅ Producto eliminado exitosamente');
      
      setSuccess('Producto eliminado exitosamente');
      await loadProducts();
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error);
      setError('Error al eliminar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Selecciona un negocio para probar Firestore
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Prueba de Firestore
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Negocio actual: <strong>{currentBusiness.nombre}</strong> (ID: {currentBusiness.id})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Agregar Producto de Prueba
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Nombre"
              value={newProduct.nombre}
              onChange={(e) => setNewProduct({ ...newProduct, nombre: e.target.value })}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Precio"
              type="number"
              value={newProduct.precio_venta}
              onChange={(e) => setNewProduct({ ...newProduct, precio_venta: e.target.value })}
              size="small"
              sx={{ width: 120 }}
            />
            <TextField
              label="Stock"
              type="number"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              size="small"
              sx={{ width: 120 }}
            />
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddProduct}
            disabled={loading}
          >
            {loading ? 'Creando...' : 'Crear Producto'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Productos en Firestore ({products.length})
            </Typography>
            <Button
              variant="outlined"
              onClick={loadProducts}
              disabled={loading}
            >
              {loading ? 'Cargando...' : 'Recargar'}
            </Button>
          </Box>

          {products.length === 0 ? (
            <Typography color="text.secondary">
              No hay productos. Crea uno para probar.
            </Typography>
          ) : (
            <List>
              {products.map((product, index) => (
                <React.Fragment key={product.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={loading}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={product.nombre}
                      secondary={`Precio: $${product.precio_venta} | Stock: ${product.stock} | ID: ${product.id}`}
                    />
                  </ListItem>
                  {index < products.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TestFirestore;
