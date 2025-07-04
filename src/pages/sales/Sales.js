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
  Grid,
  Menu,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ShoppingCart as ShoppingCartIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';

function Sales() {
  const { currentBusiness } = useApp();
  const { markDashboardForRefresh } = useDashboard();
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  
  const [saleData, setSaleData] = useState({
    cliente_id: '',
    metodo_pago: 'efectivo',
    descuento_total: 0,
    productos: [],
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [editingSale, setEditingSale] = useState(null);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [saleDetails, setSaleDetails] = useState(null);

  useEffect(() => {
    if (currentBusiness) {
      loadSales();
      loadClients();
      loadProducts();
    }
  }, [currentBusiness]);

  const loadSales = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      const response = await api.get(`/ventas/${currentBusiness.id}`);
      setSales(response.data);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
      setError('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    if (!currentBusiness) return;
    try {
      const response = await api.get(`/clientes/${currentBusiness.id}`);
      setClients(response.data);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const loadProducts = async () => {
    if (!currentBusiness) return;
    try {
      const response = await api.get(`/productos/${currentBusiness.id}`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const loadSaleDetails = async (saleId) => {
    try {
      const response = await api.get(`/ventas/${saleId}/details`);
      setSaleDetails(response.data);
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      // Fallback: usar datos de la venta sin detalles
      const sale = sales.find(s => s.id === saleId);
      setSaleDetails(sale);
    }
  };

  const handleOpenDialog = (sale = null) => {
    if (sale) {
      setEditingSale(sale);
      setSaleData({
        cliente_id: sale.cliente_id || '',
        metodo_pago: sale.metodo_pago || 'efectivo',
        descuento_total: sale.descuento || 0,
        productos: [], // Se cargarán los productos desde la BD
      });
      // Cargar productos de la venta para edición
      loadSaleProducts(sale.id);
    } else {
      setEditingSale(null);
      setSaleData({
        cliente_id: '',
        metodo_pago: 'efectivo',
        descuento_total: 0,
        productos: [],
      });
    }
    setSelectedProduct('');
    setProductQuantity(1);
    setOpenDialog(true);
    setError('');
  };

  const loadSaleProducts = async (saleId) => {
    try {
      const response = await api.get(`/ventas/${saleId}/products`);
      setSaleData(prev => ({
        ...prev,
        productos: response.data
      }));
    } catch (error) {
      console.error('Error al cargar productos de venta:', error);
    }
  };

  const handleViewDetails = (sale) => {
    loadSaleDetails(sale.id);
    setViewDetailsDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSaleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addProductToSale = () => {
    if (!selectedProduct) {
      setError('Selecciona un producto');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    if (productQuantity <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (productQuantity > product.stock) {
      setError('No hay suficiente stock disponible');
      return;
    }

    // Verificar si el producto ya está en la venta
    const existingProductIndex = saleData.productos.findIndex(p => p.id === selectedProduct);
    
    if (existingProductIndex >= 0) {
      // Actualizar cantidad del producto existente
      const updatedProducts = [...saleData.productos];
      updatedProducts[existingProductIndex].cantidad += productQuantity;
      setSaleData(prev => ({
        ...prev,
        productos: updatedProducts
      }));
    } else {
      // Agregar nuevo producto
      const newProduct = {
        id: product.id,
        nombre: product.nombre,
        precio_unitario: product.precio_venta,
        cantidad: productQuantity,
        impuesto: product.impuesto || 0,
      };

      setSaleData(prev => ({
        ...prev,
        productos: [...prev.productos, newProduct]
      }));
    }

    setSelectedProduct('');
    setProductQuantity(1);
    setError('');
  };

  const removeProductFromSale = (productId) => {
    setSaleData(prev => ({
      ...prev,
      productos: prev.productos.filter(p => p.id !== productId)
    }));
  };

  const updateProductQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProductFromSale(productId);
      return;
    }

    setSaleData(prev => ({
      ...prev,
      productos: prev.productos.map(p => 
        p.id === productId ? { ...p, cantidad: newQuantity } : p
      )
    }));
  };

  const calculateTotal = () => {
    const subtotal = saleData.productos.reduce((sum, product) => {
      return sum + (product.precio_unitario * product.cantidad);
    }, 0);
    
    const total = subtotal - (saleData.descuento_total || 0);
    return Math.max(0, total);
  };

  const handleSubmit = async () => {
    if (!saleData.cliente_id) {
      setError('Selecciona un cliente');
      return;
    }

    if (saleData.productos.length === 0) {
      setError('Agrega al menos un producto');
      return;
    }

    setLoading(true);
    try {
      const subtotal = saleData.productos.reduce((sum, product) => {
        return sum + (product.precio_unitario * product.cantidad);
      }, 0);
      
      const descuento = parseFloat(saleData.descuento_total) || 0;
      const total = subtotal - descuento;

      const dataToSend = {
        cliente_id: saleData.cliente_id || null,
        total: Math.max(0, total),
        subtotal: subtotal,
        impuesto: 0,
        descuento: descuento,
        metodo_pago: saleData.metodo_pago || 'efectivo',
        productos: saleData.productos,
        negocio_id: currentBusiness.id,
      };

      console.log('Enviando datos de venta:', dataToSend);

      await api.post('/ventas', dataToSend);
      markDashboardForRefresh('nueva venta registrada');
      await loadSales();
      handleCloseDialog();
    } catch (error) {
      console.error('Error al guardar venta:', error);
      setError(error.response?.data?.error || 'Error al guardar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta venta? Esto restaurará el stock de los productos.')) {
      try {
        await api.delete(`/ventas/${saleId}`);
        markDashboardForRefresh('venta eliminada');
        await loadSales();
        handleCloseMenu();
      } catch (error) {
        console.error('Error al eliminar venta:', error);
        alert(error.response?.data?.error || 'Error al eliminar la venta');
      }
    }
  };

  const handleMenuClick = (event, sale) => {
    setAnchorEl(event.currentTarget);
    setSelectedSale(sale);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedSale(null);
  };

  const columns = [
    {
      field: 'created_at',
      headerName: 'Fecha',
      width: 120,
      renderCell: (params) => {
        const date = new Date(params.row.created_at);
        return date.toLocaleDateString();
      },
    },
    {
      field: 'cliente_nombre',
      headerName: 'Cliente',
      flex: 1,
      renderCell: (params) => {
        return params.row.cliente_nombre || 'Cliente General';
      },
    },
    {
      field: 'productos_info',
      headerName: 'Productos',
      width: 200,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleViewDetails(params.row)}
        >
          Ver productos
        </Button>
      ),
    },
    {
      field: 'total',
      headerName: 'Total',
      width: 120,
      renderCell: (params) => `$${parseFloat(params.row.total || 0).toFixed(2)}`,
    },
    { field: 'metodo_pago', headerName: 'Método de Pago', width: 140 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.estado || 'completada'}
          color={params.row.estado === 'completada' ? 'success' : 'warning'}
          size="small"
        />
      ),
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
          Selecciona un negocio para ver las ventas
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Ventas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nueva Venta
        </Button>
      </Box>

      <DataTable
        rows={sales}
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
          handleViewDetails(selectedSale);
          handleCloseMenu();
        }}>
          <ShoppingCartIcon sx={{ mr: 1 }} />
          Ver productos
        </MenuItem>
        <MenuItem onClick={() => {
          handleOpenDialog(selectedSale);
          handleCloseMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedSale?.id)}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear venta */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingSale ? 'Editar Venta' : 'Nueva Venta'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Información de la venta */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cliente *</InputLabel>
                <Select
                  name="cliente_id"
                  value={saleData.cliente_id}
                  onChange={handleInputChange}
                  label="Cliente *"
                >
                  <MenuItem value="">
                    <em>Cliente General</em>
                  </MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Método de Pago</InputLabel>
                <Select
                  name="metodo_pago"
                  value={saleData.metodo_pago}
                  onChange={handleInputChange}
                  label="Método de Pago"
                >
                  <MenuItem value="efectivo">Efectivo</MenuItem>
                  <MenuItem value="tarjeta">Tarjeta</MenuItem>
                  <MenuItem value="transferencia">Transferencia</MenuItem>
                  <MenuItem value="credito">Crédito</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Agregar productos */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Productos
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Seleccionar Producto</InputLabel>
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  label="Seleccionar Producto"
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.nombre} - ${parseFloat(product.precio_venta || 0).toFixed(2)} (Stock: {product.stock})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={addProductToSale}
                sx={{ height: '56px' }}
              >
                Agregar
              </Button>
            </Grid>

            {/* Lista de productos en la venta */}
            {saleData.productos.length > 0 && (
              <Grid item xs={12}>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell align="center">Cantidad</TableCell>
                        <TableCell align="right">Precio Unit.</TableCell>
                        <TableCell align="right">Subtotal</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {saleData.productos.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.nombre}</TableCell>
                          <TableCell align="center">
                            <TextField
                              type="number"
                              value={product.cantidad}
                              onChange={(e) => updateProductQuantity(product.id, parseInt(e.target.value) || 0)}
                              inputProps={{ min: 0 }}
                              size="small"
                              sx={{ width: '80px' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            ${parseFloat(product.precio_unitario).toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            ${(product.precio_unitario * product.cantidad).toFixed(2)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              onClick={() => removeProductFromSale(product.id)}
                              color="error"
                              size="small"
                            >
                              <RemoveIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}

            {/* Total y descuento */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descuento Total"
                name="descuento_total"
                type="number"
                value={saleData.descuento_total}
                onChange={handleInputChange}
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" align="right">
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || saleData.productos.length === 0}
            startIcon={<ShoppingCartIcon />}
          >
            {loading ? 'Guardando...' : 'Procesar Venta'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para ver detalles de venta */}
      <Dialog open={viewDetailsDialog} onClose={() => setViewDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Detalles de Venta
        </DialogTitle>
        <DialogContent>
          {saleDetails && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">
                    <strong>Cliente:</strong> {saleDetails.cliente_nombre || 'Cliente General'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">
                    <strong>Fecha:</strong> {new Date(saleDetails.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">
                    <strong>Método de Pago:</strong> {saleDetails.metodo_pago}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle1">
                    <strong>Total:</strong> ${parseFloat(saleDetails.total || 0).toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Productos Vendidos
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="center">Cantidad</TableCell>
                      <TableCell align="right">Precio Unit.</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {saleDetails.productos?.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell>{product.nombre}</TableCell>
                        <TableCell align="center">{product.cantidad}</TableCell>
                        <TableCell align="right">${parseFloat(product.precio_unitario || 0).toFixed(2)}</TableCell>
                        <TableCell align="right">${(product.cantidad * product.precio_unitario).toFixed(2)}</TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">
                            No se pudieron cargar los detalles de productos
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Sales; 