import React, { useState, useEffect, useRef } from 'react';
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
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ShoppingCart as ShoppingCartIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import GlassmorphismDialog from '../../components/common/GlassmorphismDialog';
import { CancelButton, PrimaryButton } from '../../components/common/GlassmorphismButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../context/AppContext';
import { useDashboard } from '../../context/DashboardContext';
import api from '../../config/axios';
import DataTable from '../../components/common/DataTable';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import { salesService, clientsService, productsService } from '../../services/firestoreService';

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
    fecha_venta: new Date(), // Fecha personalizada
    estado: 'completada', // Estado de la venta
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [editingSale, setEditingSale] = useState(null);
  const [viewDetailsDialog, setViewDetailsDialog] = useState(false);
  const [saleDetails, setSaleDetails] = useState(null);
  const [selectedClientCredit, setSelectedClientCredit] = useState(0);

  // Estados para filtros
  const [filters, setFilters] = useState({
    priceOrder: null, // null = sin filtro, 'desc' = mayor a menor, 'asc' = menor a mayor
    dateOrder: null,  // null = sin filtro, 'desc' = recientes primero, 'asc' = antiguas primero
    estado: '',
    metodoPago: ''
  });

  // Ref para el campo de búsqueda de productos
  const productSearchRef = useRef(null);

  useEffect(() => {
    if (currentBusiness) {
      loadClients();
      loadProducts();
    }
  }, [currentBusiness]);

  useEffect(() => {
    if (currentBusiness && clients.length > 0) {
      loadSales();
    }
  }, [currentBusiness, clients]);

  const loadSales = async () => {
    if (!currentBusiness) return;
    setLoading(true);
    try {
      // Cargar ventas desde Firestore filtradas por business_id
      const allSales = await salesService.getWhere('business_id', '==', currentBusiness.id);
      
      // Enriquecer ventas con nombres de clientes
      const enrichedSales = allSales.map(sale => {
        const client = clients.find(c => c.id === sale.cliente_id);
        return {
          ...sale,
          cliente_nombre: client ? client.nombre : 'Cliente General'
        };
      });
      
      setSales(enrichedSales);
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
      // Cargar clientes desde Firestore filtrados por business_id
      const allClients = await clientsService.getWhere('business_id', '==', currentBusiness.id);
      setClients(allClients);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const loadProducts = async () => {
    if (!currentBusiness) return;
    try {
      // Cargar productos desde Firestore filtrados por business_id
      const allProducts = await productsService.getWhere('business_id', '==', currentBusiness.id);
      setProducts(allProducts);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const loadSaleDetails = async (saleId) => {
    try {
      // Obtener la venta desde Firestore
      const sale = await salesService.getById(saleId);
      if (sale) {
        setSaleDetails(sale);
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      // Fallback: usar datos de la venta sin detalles
      const sale = sales.find(s => s.id === saleId);
      if (sale) {
        setSaleDetails(sale);
      }
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
        fecha_venta: sale.fecha_venta ? 
          (sale.fecha_venta?.toDate ? sale.fecha_venta.toDate() : new Date(sale.fecha_venta)) : 
          new Date(),
        estado: sale.estado || 'completada',
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
        fecha_venta: new Date(),
        estado: 'completada',
      });
    }
    setSelectedProduct('');
    setProductQuantity(1);
    setOpenDialog(true);
    setError('');
  };

  const loadSaleProducts = async (saleId) => {
    try {
      // Obtener la venta desde Firestore
      const sale = await salesService.getById(saleId);
      if (sale && sale.productos) {
        // Los productos ya están en el documento de la venta
        setSaleData(prev => ({
          ...prev,
          productos: sale.productos || []
        }));
      }
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
    
    // Si se selecciona un cliente, actualizar su crédito disponible
    if (name === 'cliente_id' && value) {
      const selectedClient = clients.find(client => client.id === value);
      const creditoDisponible = parseFloat(selectedClient?.credito_disponible) || 0;
      setSelectedClientCredit(creditoDisponible);
    } else if (name === 'cliente_id' && !value) {
      setSelectedClientCredit(0);
    }
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
      const newQuantity = updatedProducts[existingProductIndex].cantidad + productQuantity;
      
      if (newQuantity > product.stock) {
        setError('No hay suficiente stock para esta cantidad total');
        return;
      }
      
      updatedProducts[existingProductIndex] = {
        ...updatedProducts[existingProductIndex],
        cantidad: newQuantity,
        subtotal: newQuantity * product.precio_venta
      };
      
      setSaleData(prev => ({
        ...prev,
        productos: updatedProducts
      }));
    } else {
      // Agregar nuevo producto
      const newProduct = {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio_venta,
        cantidad: productQuantity,
        subtotal: productQuantity * product.precio_venta
      };
      
      setSaleData(prev => ({
        ...prev,
        productos: [...prev.productos, newProduct]
      }));
    }

    setSelectedProduct('');
    setProductQuantity(1);
    setError('');
    
    // Enfocar el campo de búsqueda para agregar más productos rápidamente
    setTimeout(() => {
      if (productSearchRef.current) {
        const input = productSearchRef.current.querySelector('input');
        if (input) {
          input.focus();
        }
      }
    }, 100);
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

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      setError('No hay suficiente stock disponible');
      return;
    }

    setSaleData(prev => ({
      ...prev,
      productos: prev.productos.map(p => 
        p.id === productId 
          ? { ...p, cantidad: newQuantity, subtotal: newQuantity * p.precio }
          : p
      )
    }));
    setError('');
  };

  const calculateTotal = () => {
    const subtotal = saleData.productos.reduce((sum, product) => sum + product.subtotal, 0);
    return Math.max(0, subtotal - (saleData.descuento_total || 0));
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit llamado'); // Debug
    console.log('📊 Estado actual:', {
      currentBusiness: currentBusiness?.id,
      productos: saleData.productos.length,
      productosData: saleData.productos
    }); // Debug
    
    if (!currentBusiness) {
      setError('No hay negocio seleccionado');
      console.error('❌ No hay negocio seleccionado');
      return;
    }

    if (saleData.productos.length === 0) {
      setError('Agrega al menos un producto a la venta');
      console.error('❌ No hay productos en la venta');
      return;
    }

    // Validar que la fecha no sea futura
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Permitir hasta el final del día actual
    if (saleData.fecha_venta > today) {
      setError('La fecha de venta no puede ser mayor a la fecha actual');
      console.error('❌ Fecha de venta futura');
      return;
    }

    // Validar crédito disponible si el método de pago es crédito
    if (saleData.metodo_pago === 'credito') {
      if (!saleData.cliente_id) {
        setError('Debe seleccionar un cliente para pagar con crédito');
        console.error('❌ No hay cliente seleccionado para pago con crédito');
        return;
      }
      
      const total = calculateTotal();
      const creditoDisponible = parseFloat(selectedClientCredit) || 0;
      
      if (creditoDisponible < total) {
        const deficit = total - creditoDisponible;
        setError(
          `El crédito disponible no es suficiente para esta venta.\n\n`
        );
        console.error('❌ Crédito insuficiente');
        return;
      }
    }

    console.log('✅ Todas las validaciones pasaron, enviando al servidor...');
    setLoading(true);
    setError('');

    try {
      const total = calculateTotal();
      console.log('💰 Total calculado:', total);
      
      const salePayload = {
        negocio_id: currentBusiness.id,
        cliente_id: saleData.cliente_id || null,
        metodo_pago: saleData.metodo_pago,
        descuento: saleData.descuento_total || 0,
        total: total,
        productos: saleData.productos,
        fecha_venta: saleData.fecha_venta.toISOString().split('T')[0], // Solo fecha, sin hora
        estado: saleData.estado,
      };

      console.log('📤 Enviando datos de venta:', salePayload); // Debug

      if (editingSale) {
        console.log('✏️ Actualizando venta existente:', editingSale.id);
        await salesService.update(editingSale.id, salePayload);
      } else {
        console.log('🆕 Creando nueva venta');
        await salesService.create(salePayload);
      }

      console.log('✅ Venta guardada en Firestore');
      console.log('🔄 Recargando ventas...');
      await loadSales();
      console.log('📊 Actualizando dashboard...');
      markDashboardForRefresh(editingSale ? 'venta_editada' : 'venta_nueva');
      console.log('🚪 Cerrando diálogo...');
      handleCloseDialog();
      setError('');
      console.log('✅ Venta procesada exitosamente');
    } catch (error) {
      console.error('❌ Error al guardar venta:', error);
      console.error('🔍 Respuesta del servidor:', error.response?.data); // Debug
      console.error('🔍 Status code:', error.response?.status); // Debug
      console.error('🔍 Error completo:', error); // Debug
      setError(error.response?.data?.error || 'Error al guardar la venta');
    } finally {
      setLoading(false);
      console.log('🏁 handleSubmit finalizado');
    }
  };

  // Función para filtrar y ordenar ventas
  const getFilteredSales = () => {
    let filteredSales = sales.filter(sale => {
      // Filtro por estado
      if (filters.estado && sale.estado !== filters.estado) {
        return false;
      }
      
      // Filtro por método de pago
      if (filters.metodoPago && sale.metodo_pago !== filters.metodoPago) {
        return false;
      }
      
      return true;
    });

    // Si no hay filtros de ordenamiento activos, ordenar por fecha (más reciente arriba)
    if (filters.priceOrder === null && filters.dateOrder === null) {
      filteredSales.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB - dateA; // Más reciente arriba
      });
      return filteredSales;
    }

    // Ordenar por precio si está activo
    if (filters.priceOrder !== null) {
      filteredSales.sort((a, b) => {
        const priceA = parseFloat(a.total) || 0;
        const priceB = parseFloat(b.total) || 0;
        
        if (filters.priceOrder === 'desc') {
          return priceB - priceA; // Mayor a menor
        } else {
          return priceA - priceB; // Menor a mayor
        }
      });
    }

    // Ordenar por fecha si está activo (puede sobrescribir el orden de precio)
    if (filters.dateOrder !== null) {
      filteredSales.sort((a, b) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        
        if (filters.dateOrder === 'desc') {
          return dateB - dateA; // Recientes primero
        } else {
          return dateA - dateB; // Antiguas primero
        }
      });
    }

    return filteredSales;
  };

  const handleDelete = async (saleId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
      try {
        await salesService.delete(saleId);
        await loadSales();
        markDashboardForRefresh();
      } catch (error) {
        console.error('Error al eliminar venta:', error);
        setError('Error al eliminar la venta');
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
      field: 'fecha_venta',
      headerName: 'Fecha',
      width: 120,
      renderCell: (params) => {
        if (!params.row.fecha_venta) return '-';
        const date = params.row.fecha_venta?.toDate ? 
          params.row.fecha_venta.toDate() : new Date(params.row.fecha_venta);
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
      headerName: 'Ver Productos',
      width: 150,
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
      width: 160,
      renderCell: (params) => (
        <CurrencyDisplay 
          amount={params.row.total}
          variant="body2"
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
    { field: 'metodo_pago', headerName: 'Método de Pago', width: 140 },
    {
      field: 'estado',
      headerName: 'Estado',
      width: 120,
      renderCell: (params) => {
        const estado = params.row.estado || 'completada';
        const getChipProps = (estado) => {
          switch (estado) {
            case 'pendiente':
              return { label: 'Pendiente', color: 'warning' };
            case 'en_proceso':
              return { label: 'En Proceso', color: 'info' };
            case 'completada':
              return { label: 'Completada', color: 'success' };
            case 'cancelada':
              return { label: 'Cancelada', color: 'error' };
            default:
              return { label: 'Completada', color: 'success' };
          }
        };
        
        const chipProps = getChipProps(estado);
        return (
          <Chip
            label={chipProps.label}
            color={chipProps.color}
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
        rows={getFilteredSales()}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        extraFilters={
          <>
            <Button
              variant={filters.priceOrder === 'desc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, priceOrder: prev.priceOrder === 'desc' ? null : 'desc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
             ^ Mayor $
            </Button>
            <Button
              variant={filters.priceOrder === 'asc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, priceOrder: prev.priceOrder === 'asc' ? null : 'asc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              v Menor $
            </Button>
            <Button
              variant={filters.dateOrder === 'desc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, dateOrder: prev.dateOrder === 'desc' ? null : 'desc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
              Recientes
            </Button>
            <Button
              variant={filters.dateOrder === 'asc' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setFilters(prev => ({ ...prev, dateOrder: prev.dateOrder === 'asc' ? null : 'asc' }))}
              sx={{ minWidth: 'auto', px: 1.5 }}
            >
             Antiguas
            </Button>
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filters.estado}
                onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                label="Estado"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="en_proceso">En Proceso</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
                <MenuItem value="cancelada">Cancelada</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Pago</InputLabel>
              <Select
                value={filters.metodoPago}
                onChange={(e) => setFilters(prev => ({ ...prev, metodoPago: e.target.value }))}
                label="Pago"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="efectivo">Efectivo</MenuItem>
                <MenuItem value="tarjeta">Tarjeta</MenuItem>
                <MenuItem value="transferencia">Transfer.</MenuItem>
                <MenuItem value="credito">Crédito</MenuItem>
              </Select>
            </FormControl>
            {(filters.priceOrder !== null || filters.dateOrder !== null || filters.estado || filters.metodoPago) && (
              <Button
                variant="text"
                size="small"
                onClick={() => setFilters({ priceOrder: null, dateOrder: null, estado: '', metodoPago: '' })}
                sx={{ minWidth: 'auto', px: 1, color: 'text.secondary' }}
              >
                ✕ Limpiar Todo
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
          handleOpenDialog(selectedSale);
          handleCloseMenu();
        }}>
          <EditIcon sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={() => {
          handleDelete(selectedSale.id);
          handleCloseMenu();
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar venta */}
      <GlassmorphismDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingSale ? 'Editar Venta' : 'Nueva Venta'}
        subtitle={editingSale ? 'Modifica los datos de la venta' : 'Registra una nueva venta para tu negocio'}
        icon={ReceiptIcon}
        maxWidth="lg"
        actions={
          <>
            <CancelButton onClick={handleCloseDialog} disabled={loading}>
              Cancelar
            </CancelButton>
            <PrimaryButton
              onClick={() => {
                console.log('🔘 Botón Procesar Venta presionado');
                console.log('🔧 Estado del botón:', {
                  loading,
                  productosLength: saleData.productos.length,
                  disabled: loading || saleData.productos.length === 0
                });
                handleSubmit();
              }}
              disabled={loading || saleData.productos.length === 0}
            >
              {loading ? 'Guardando...' : (editingSale ? 'Actualizar Venta' : 'Procesar Venta')}
            </PrimaryButton>
          </>
        }
      >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            {/* Información de la venta - Mejor distribución */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Información de la Venta
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Cliente (Opcional)</InputLabel>
                <Select
                  name="cliente_id"
                  value={saleData.cliente_id}
                  onChange={handleInputChange}
                  label="Cliente (Opcional)"
                >
                  <MenuItem value="">Cliente General</MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {saleData.cliente_id && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                   Crédito disponible: ${parseFloat(selectedClientCredit || 0).toFixed(2)}
                </Typography>
              )}
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

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Estado de la Venta</InputLabel>
                <Select
                  name="estado"
                  value={saleData.estado}
                  onChange={handleInputChange}
                  label="Estado de la Venta"
                >
                  <MenuItem value="pendiente">Pendiente</MenuItem>
                  <MenuItem value="en_proceso">En Proceso</MenuItem>
                  <MenuItem value="completada">Completada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Fecha de Venta"
                value={saleData.fecha_venta}
                onChange={(newValue) => 
                  setSaleData(prev => ({ ...prev, fecha_venta: newValue }))
                }
                renderInput={(params) => (
                  <TextField {...params} fullWidth />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Descuento Total"
                name="descuento_total"
                type="number"
                value={saleData.descuento_total}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h6">
                    Total: ${calculateTotal().toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Agregar productos */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" gutterBottom>
                  Productos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={products}
                getOptionLabel={(option) => 
                  `${option.nombre} - $${parseFloat(option.precio_venta || 0).toFixed(2)} (Stock: ${option.stock})`
                }
                value={products.find(p => p.id === selectedProduct) || null}
                onChange={(event, newValue) => {
                  setSelectedProduct(newValue ? newValue.id : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Buscar producto"
                    placeholder="Escribe para buscar..."
                    fullWidth
                  />
                )}
                ref={productSearchRef}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" component="div">
                        {option.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${parseFloat(option.precio_venta || 0).toFixed(2)} • Stock: {option.stock}
                        {option.categoria_nombre && ` • ${option.categoria_nombre}`}
                      </Typography>
                    </Box>
                  </Box>
                )}
                filterOptions={(options, { inputValue }) => {
                  const filtered = options.filter((option) =>
                    option.nombre.toLowerCase().includes(inputValue.toLowerCase()) ||
                    (option.categoria_nombre && option.categoria_nombre.toLowerCase().includes(inputValue.toLowerCase()))
                  );
                  return filtered;
                }}
                noOptionsText="No se encontraron productos"
                clearOnBlur={false}
                selectOnFocus
                handleHomeEndKeys
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(parseInt(e.target.value) || 1)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addProductToSale();
                  }
                }}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={addProductToSale}
                sx={{ height: '56px' }}
                disabled={!selectedProduct}
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
                            <CurrencyDisplay amount={product.precio} variant="body2" />
                          </TableCell>
                          <TableCell align="right">
                            <CurrencyDisplay 
                              amount={product.cantidad * product.precio} 
                              variant="body2" 
                              sx={{ fontWeight: 'bold' }}
                            />
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
          </Grid>
      </GlassmorphismDialog>

      {/* Dialog para ver detalles de venta */}
      <GlassmorphismDialog
        open={viewDetailsDialog}
        onClose={() => setViewDetailsDialog(false)}
        title="Detalles de Venta"
        subtitle="Información completa de la venta seleccionada"
        icon={ReceiptIcon}
        maxWidth="md"
        actions={
          <CancelButton onClick={() => setViewDetailsDialog(false)}>
            Cerrar
          </CancelButton>
        }
      >
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
                  {saleDetails.productos?.map((product, index) => {
                    const precio = parseFloat(product.precio_unitario || product.precio || 0);
                    const cantidad = parseInt(product.cantidad || 0);
                    const subtotal = cantidad * precio;
                    
                    return (
                      <TableRow key={index}>
                        <TableCell>{product.nombre}</TableCell>
                        <TableCell align="center">{cantidad}</TableCell>
                        <TableCell align="right">
                          <CurrencyDisplay amount={precio} variant="body2" />
                        </TableCell>
                        <TableCell align="right">
                          <CurrencyDisplay 
                            amount={subtotal} 
                            variant="body2" 
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  }) || (
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
      </GlassmorphismDialog>
    </Box>
  );
}

export default Sales; 