import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
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
  Stack,
  Chip,
  Menu,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Divider,
  CardActions,
  Tooltip,
  Paper,
  InputAdornment,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Image as ImageIcon,
  GridView as GridViewIcon,
  TableRows as TableRowsIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  ShoppingCart as ShoppingCartIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import { useApp } from '../../context/AppContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import getImageUrl from '../../utils/imageUtils';
import { productsService, categoriesService } from '../../services/firestoreService';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function Products() {
  const { currentBusiness } = useApp();
  const { markDashboardForRefresh } = useDashboard();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [useImageUrl, setUseImageUrl] = useState(true); // true para URL, false para upload
  
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
    imagen_file: null,
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
      // Cargar productos desde Firestore filtrados por business_id
      const allProducts = await productsService.getWhere('business_id', '==', currentBusiness.id);
      setProducts(allProducts);
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
      // Cargar categorías desde Firestore filtradas por business_id
      const allCategories = await categoriesService.getWhere('business_id', '==', currentBusiness.id);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.codigo_barras && product.codigo_barras.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || product.categoria_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
        imagen_file: null,
      });
      setUseImageUrl(true); // Por defecto usar URL al editar
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
        imagen_file: null,
      });
      setUseImageUrl(true);
    }
    setOpenDialog(true);
    setError('');
  };

  const handleOpenDetailDialog = (product) => {
    setViewingProduct(product);
    setOpenDetailDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
    setError('');
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setViewingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({
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
      setProductData(prev => ({
        ...prev,
        imagen_file: file
      }));
      setError('');
    }
  };

  const uploadImageToFirebase = async (file) => {
    try {
      const timestamp = Date.now();
      const fileName = `productos/${currentBusiness.id}/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error al subir la imagen a Firebase:', error);
      throw new Error(`Error al subir la imagen: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!productData.nombre.trim() || !productData.precio_venta) {
      setError('Nombre y precio de venta son requeridos');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = productData.imagen_url;

      // Si hay un archivo de imagen, subirlo a Firebase Storage
      if (productData.imagen_file) {
        imageUrl = await uploadImageToFirebase(productData.imagen_file);
      }

      const dataToSend = {
        ...productData,
        imagen_url: imageUrl,
        business_id: currentBusiness.id,
        precio_venta: parseFloat(productData.precio_venta) || 0,
        precio_compra: parseFloat(productData.precio_compra) || 0,
        stock: parseFloat(productData.stock) || 0,
        impuesto: parseFloat(productData.impuesto) || 0,
        stock_minimo: parseFloat(productData.stock_minimo) || 0,
        categoria_id: productData.categoria_id || null, // Convertir cadena vacía a null
      };

      // Removemos imagen_file del dataToSend ya que no debe enviarse al backend
      delete dataToSend.imagen_file;

      if (editingProduct) {
        // Actualizar producto existente en Firestore
        await productsService.update(editingProduct.id, dataToSend);
        markDashboardForRefresh('producto actualizado');
      } else {
        // Crear nuevo producto en Firestore
        await productsService.create(dataToSend);
        markDashboardForRefresh('nuevo producto creado');
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
        // Eliminar producto de Firestore
        await productsService.delete(productId);
        markDashboardForRefresh('producto eliminado');
        await loadProducts();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar el producto');
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nombre : 'Sin categoría';
  };

  const getStockStatus = (stock, stockMinimo) => {
    if (stock <= 0) return { color: 'error', label: 'Agotado' };
    if (stock <= stockMinimo) return { color: 'warning', label: 'Stock Bajo' };
    return { color: 'success', label: 'En Stock' };
  };

  // Componente ProductCard
  const ProductCard = ({ product }) => {
    const [localMenuAnchor, setLocalMenuAnchor] = useState(null);
    const stock = parseFloat(product.stock || 0);
    const stockMinimo = parseFloat(product.stock_minimo || 0);
    const stockStatus = getStockStatus(stock, stockMinimo);

    const handleLocalMenuClick = (event) => {
      event.stopPropagation();
      setLocalMenuAnchor(event.currentTarget);
    };

    const handleLocalMenuClose = () => {
      setLocalMenuAnchor(null);
    };

    return (
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6,
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="div"
            sx={{
              height: 200,
              backgroundImage: product.imagen_url 
                ? `url(${getImageUrl(product.imagen_url)})` 
                : 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!product.imagen_url && (
              <ImageIcon sx={{ fontSize: 60, color: 'grey.400' }} />
            )}
          </CardMedia>
          
          {/* Badge de stock */}
          <Chip
            label={stockStatus.label}
            color={stockStatus.color}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontWeight: 'bold'
            }}
          />
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="h6" component="h3" noWrap gutterBottom>
            {product.nombre}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {getCategoryName(product.categoria_id)}
          </Typography>
          
          {product.descripcion && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.descripcion}
            </Typography>
          )}

          <Box sx={{ mt: 'auto' }}>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={6}>
              <CurrencyDisplay
                  amount={product.precio_venta}
                  variant="body1"
                  sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.9rem' }}
                />
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Chip 
                  label={`Stock: ${stock}`}
                  color={stockStatus.color}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => handleOpenDetailDialog(product)}
          >
            Ver Detalles
          </Button>
          <Box sx={{ position: 'relative' }}>
            <IconButton
              size="small"
              onClick={handleLocalMenuClick}
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={localMenuAnchor}
              open={Boolean(localMenuAnchor)}
              onClose={handleLocalMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  elevation: 8,
                  sx: {
                    minWidth: 160,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                      gap: 1.5,
                      fontSize: '0.875rem',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem onClick={() => {
                handleOpenDetailDialog(product);
                handleLocalMenuClose();
              }}>
                <VisibilityIcon fontSize="small" />
                Ver Detalles
              </MenuItem>
              <MenuItem onClick={() => {
                handleOpenDialog(product);
                handleLocalMenuClose();
              }}>
                <EditIcon fontSize="small" />
                Editar
              </MenuItem>
              <MenuItem onClick={() => {
                handleDelete(product.id);
                handleLocalMenuClose();
              }}>
                <DeleteIcon fontSize="small" />
                Eliminar
              </MenuItem>
            </Menu>
          </Box>
        </CardActions>
      </Card>
    );
  };

  // Componente para acciones de tabla
  const TableActions = ({ product }) => {
    const [localMenuAnchor, setLocalMenuAnchor] = useState(null);

    const handleLocalMenuClick = (event) => {
      event.stopPropagation();
      setLocalMenuAnchor(event.currentTarget);
    };

    const handleLocalMenuClose = () => {
      setLocalMenuAnchor(null);
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Ver detalles">
          <IconButton
            size="small"
            onClick={() => handleOpenDetailDialog(product)}
          >
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ position: 'relative' }}>
          <IconButton
            size="small"
            onClick={handleLocalMenuClick}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={localMenuAnchor}
            open={Boolean(localMenuAnchor)}
            onClose={handleLocalMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            slotProps={{
              paper: {
                elevation: 8,
                sx: {
                  minWidth: 160,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1,
                    gap: 1.5,
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  },
                },
              },
            }}
          >
            <MenuItem onClick={() => {
              handleOpenDetailDialog(product);
              handleLocalMenuClose();
            }}>
              <VisibilityIcon fontSize="small" />
              Ver Detalles
            </MenuItem>
            <MenuItem onClick={() => {
              handleOpenDialog(product);
              handleLocalMenuClose();
            }}>
              <EditIcon fontSize="small" />
              Editar
            </MenuItem>
            <MenuItem onClick={() => {
              handleDelete(product.id);
              handleLocalMenuClose();
            }}>
              <DeleteIcon fontSize="small" />
              Eliminar
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    );
  };

  // Configuración de columnas para la tabla
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
      width: 160,
      renderCell: (params) => (
        <CurrencyDisplay 
          amount={params.row.precio_venta}
          variant="body2"
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      renderCell: (params) => {
        const stock = parseFloat(params.row.stock || 0);
        const stockMinimo = parseFloat(params.row.stock_minimo || 0);
        const stockStatus = getStockStatus(stock, stockMinimo);
        
        return (
          <Chip
            label={stock}
            color={stockStatus.color}
            size="small"
          />
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params) => (
        <TableActions product={params.row} />
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
      {/* Header con controles */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Productos ({filteredProducts.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="cards">
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton value="table">
              <TableRowsIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Nuevo Producto
          </Button>
        </Box>
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrar por categoría</InputLabel>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Filtrar por categoría"
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredProducts.length} productos encontrados
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Vista de tarjetas o tabla */}
      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <ProductCard product={product} />
            </Grid>
          ))}
          {filteredProducts.length === 0 && !loading && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <InventoryIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No se encontraron productos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || filterCategory 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Comienza agregando tu primer producto'
                  }
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        <DataTable
          rows={filteredProducts}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
        />
      )}

      {/* Dialog de detalles del producto */}
      <GlassmorphismDialog
        open={openDetailDialog}
        onClose={handleCloseDetailDialog}
        title="Detalles del Producto"
        subtitle="Información completa del producto seleccionado"
        icon={InfoIcon}
        maxWidth="md"
        actions={
          <>
            <CancelButton onClick={handleCloseDetailDialog}>
              Cerrar
            </CancelButton>
            <PrimaryButton 
              startIcon={<EditIcon />}
              onClick={() => {
                handleCloseDetailDialog();
                handleOpenDialog(viewingProduct);
              }}
            >
              Editar Producto
            </PrimaryButton>
          </>
        }
      >
          {viewingProduct && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {/* Imagen del producto */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: 300 }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: '100%',
                      backgroundImage: viewingProduct.imagen_url 
                        ? `url(${viewingProduct.imagen_url})` 
                        : 'linear-gradient(45deg, #f5f5f5 30%, #e0e0e0 90%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {!viewingProduct.imagen_url && (
                      <ImageIcon sx={{ fontSize: 80, color: 'grey.400' }} />
                    )}
                  </CardMedia>
                </Card>
              </Grid>

              {/* Información del producto */}
              <Grid item xs={12} md={8}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {viewingProduct.nombre}
                    </Typography>
                    <Chip 
                      label={getCategoryName(viewingProduct.categoria_id)}
                      color="primary"
                      variant="outlined"
                      icon={<CategoryIcon />}
                    />
                  </Box>

                  {viewingProduct.descripcion && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Descripción
                      </Typography>
                      <Typography variant="body1">
                        {viewingProduct.descripcion}
                      </Typography>
                    </Box>
                  )}

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                        <MoneyIcon sx={{ color: 'success.dark', mb: 1 }} />
                        <Typography variant="subtitle2" color="success.dark">
                          Precio de Venta
                        </Typography>
                        <CurrencyDisplay
                          amount={viewingProduct.precio_venta}
                          variant="h6"
                          sx={{ color: 'success.dark' }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        <InventoryIcon sx={{ color: 'info.dark', mb: 1 }} />
                        <Typography variant="subtitle2" color="info.dark">
                          Stock Disponible
                        </Typography>
                        <Typography variant="h6" color="info.dark">
                          {parseFloat(viewingProduct.stock || 0)} unidades
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Grid container spacing={2}>
                    {viewingProduct.precio_compra && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Precio de Compra
                        </Typography>
                        <CurrencyDisplay
                          amount={viewingProduct.precio_compra}
                          variant="body1"
                        />
                      </Grid>
                    )}
                    {viewingProduct.codigo_barras && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Código de Barras
                        </Typography>
                        <Typography variant="body1" fontFamily="monospace">
                          {viewingProduct.codigo_barras}
                        </Typography>
                      </Grid>
                    )}
                    {viewingProduct.stock_minimo > 0 && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Stock Mínimo
                        </Typography>
                        <Typography variant="body1">
                          {parseFloat(viewingProduct.stock_minimo || 0)} unidades
                        </Typography>
                      </Grid>
                    )}
                    {viewingProduct.impuesto > 0 && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Impuesto
                        </Typography>
                        <Typography variant="body1">
                          {parseFloat(viewingProduct.impuesto || 0)}%
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {/* Estado del stock */}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Estado del Stock
                    </Typography>
                    {(() => {
                      const stock = parseFloat(viewingProduct.stock || 0);
                      const stockMinimo = parseFloat(viewingProduct.stock_minimo || 0);
                      const stockStatus = getStockStatus(stock, stockMinimo);
                      
                      return (
                        <Chip
                          label={stockStatus.label}
                          color={stockStatus.color}
                          icon={<InventoryIcon />}
                        />
                      );
                    })()}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          )}
      </GlassmorphismDialog>

      {/* Dialog para crear/editar producto - mantener el existente */}
      <GlassmorphismDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        subtitle={editingProduct ? 'Modifica los datos del producto' : 'Agrega un nuevo producto a tu inventario'}
        icon={ShoppingCartIcon}
        maxWidth="md"
        actions={
          <>
            <CancelButton onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </CancelButton>
            <PrimaryButton
              onClick={handleSubmit}
              disabled={loading || !productData.nombre.trim() || !productData.precio_venta}
            >
              {loading ? 'Guardando...' : (editingProduct ? 'Actualizar' : 'Crear')}
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
              value={productData.nombre}
              onChange={handleInputChange}
              required
              error={Boolean(!productData.nombre.trim() && error)}
              helperText={!productData.nombre.trim() && error ? 'El nombre es requerido' : ''}
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
              placeholder="Descripción detallada del producto"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Código de Barras"
              name="codigo_barras"
              value={productData.codigo_barras}
              onChange={handleInputChange}
              placeholder="123456789012"
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Imagen del Producto
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={useImageUrl}
                  onChange={(e) => setUseImageUrl(e.target.checked)}
                />
              }
              label={useImageUrl ? "Usar URL de imagen" : "Subir imagen desde dispositivo"}
              sx={{ mb: 2 }}
            />

            {useImageUrl ? (
              <TextField
                fullWidth
                label="URL de la Imagen"
                name="imagen_url"
                value={productData.imagen_url}
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
            ) : (
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<CloudUploadIcon />}
                sx={{ height: 56 }}
              >
                {productData.imagen_file ? productData.imagen_file.name : 'Seleccionar imagen'}
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageFileChange}
                />
              </Button>
            )}
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
              error={Boolean(!productData.precio_venta && error)}
              helperText={!productData.precio_venta && error ? 'El precio de venta es requerido' : ''}
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
              placeholder="0.00"
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
              placeholder="0"
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
              placeholder="0"
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
              placeholder="0.00"
            />
          </Grid>
          
          {(productData.imagen_url || productData.imagen_file) && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Vista previa:
                </Typography>
                <Avatar
                  src={productData.imagen_file ? URL.createObjectURL(productData.imagen_file) : getImageUrl(productData.imagen_url)}
                  sx={{ width: 100, height: 100, mx: 'auto' }}
                >
                  <ImageIcon />
                </Avatar>
              </Box>
            </Grid>
          )}
        </Grid>
      </GlassmorphismDialog>
    </Box>
  );
}

export default Products; 