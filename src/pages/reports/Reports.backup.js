import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';

function Reports() {
  const { currentBusiness } = useApp();
  const [reportType, setReportType] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [productsData, setProductsData] = useState([]);
  const [clientsData, setClientsData] = useState([]);
  const [expensesData, setExpensesData] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  const reportTypes = [
    { value: 'dashboard', label: 'Resumen General' },
    { value: 'sales', label: 'Reportes de Ventas' },
    { value: 'inventory', label: 'Reporte de Inventario' },
    { value: 'customers', label: 'Reporte de Clientes' },
    { value: 'expenses', label: 'Reporte de Gastos' },
  ];

  useEffect(() => {
    if (currentBusiness) {
      fetchReportData();
    }
  }, [currentBusiness, reportType]);

  const fetchReportData = async () => {
    if (!currentBusiness) return;

    setLoading(true);
    setError('');
    
    try {
      switch (reportType) {
        case 'dashboard':
          await fetchDashboardData();
          break;
        case 'sales':
          await fetchSalesData();
          break;
        case 'inventory':
          await fetchInventoryData();
          break;
        case 'customers':
          await fetchCustomersData();
          break;
        case 'expenses':
          await fetchExpensesData();
          break;
        default:
          await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      setError('Error al cargar los datos del reporte');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get(`/dashboard/${currentBusiness.id}`);
      setDashboardData(response.data);
      
      // También cargar productos con stock bajo
      const lowStockResponse = await api.get(`/productos/${currentBusiness.id}/low-stock`);
      setLowStockProducts(lowStockResponse.data);
    } catch (error) {
      throw error;
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await api.get(`/ventas/${currentBusiness.id}`);
      setSalesData(response.data.slice(0, 20)); // Últimas 20 ventas
    } catch (error) {
      throw error;
    }
  };

  const fetchInventoryData = async () => {
    try {
      const response = await api.get(`/productos/${currentBusiness.id}`);
      setProductsData(response.data);
    } catch (error) {
      throw error;
    }
  };

  const fetchCustomersData = async () => {
    try {
      const response = await api.get(`/clientes/${currentBusiness.id}`);
      setClientsData(response.data);
    } catch (error) {
      throw error;
    }
  };

  const fetchExpensesData = async () => {
    try {
      const response = await api.get(`/egresos/${currentBusiness.id}`);
      setExpensesData(response.data.slice(0, 20)); // Últimos 20 gastos
    } catch (error) {
      throw error;
    }
  };

  const getStockStatusColor = (stock, stockMinimo) => {
    if (stock <= 0) return 'error';
    if (stock <= stockMinimo) return 'warning';
    return 'success';
  };

  const getStockStatusText = (stock, stockMinimo) => {
    if (stock <= 0) return 'Agotado';
    if (stock <= stockMinimo) return 'Stock Bajo';
    return 'Disponible';
  };

  const renderDashboardReport = () => {
    if (!dashboardData) return null;

    return (
      <Grid container spacing={3}>
        {/* Métricas principales */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <InventoryIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{dashboardData.totalProducts}</Typography>
              <Typography variant="body2">Productos</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{dashboardData.totalSales}</Typography>
              <Typography variant="body2">Ventas</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">{dashboardData.totalCustomers}</Typography>
              <Typography variant="body2">Clientes</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4">${dashboardData.totalRevenue?.toFixed(2)}</Typography>
              <Typography variant="body2">Ingresos</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Métricas financieras */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Métricas Financieras</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Valor de Inventario</Typography>
                <Typography variant="h5" color="primary">
                  ${dashboardData.inventoryValue?.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Ganancia Neta</Typography>
                <Typography 
                  variant="h5" 
                  color={dashboardData.netProfit >= 0 ? 'success.main' : 'error.main'}
                >
                  ${dashboardData.netProfit?.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2">Margen de Ganancia</Typography>
                <Typography variant="h5" color="info.main">
                  {dashboardData.profitMargin?.toFixed(1)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Productos con stock bajo */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Productos con Stock Bajo
              </Typography>
              {lowStockProducts.length === 0 ? (
                <Typography color="text.secondary">
                  ¡Genial! No hay productos con stock bajo.
                </Typography>
              ) : (
                <List dense>
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <ListItem key={product.id}>
                      <ListItemIcon>
                        <InventoryIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={product.nombre}
                        secondary={`Stock: ${product.stock} | Mínimo: ${product.stock_minimo}`}
                      />
                      <Chip
                        size="small"
                        label={getStockStatusText(product.stock, product.stock_minimo)}
                        color={getStockStatusColor(product.stock, product.stock_minimo)}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderSalesReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Últimas Ventas</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Método de Pago</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {new Date(sale.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sale.cliente_nombre || 'Cliente General'}</TableCell>
                  <TableCell>${parseFloat(sale.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={sale.metodo_pago} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderInventoryReport = () => {
    const lowStockCount = productsData.filter(p => p.stock <= p.stock_minimo).length;
    const outOfStockCount = productsData.filter(p => p.stock <= 0).length;
    const totalValue = productsData.reduce((sum, p) => sum + (p.precio_venta * p.stock), 0);

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{productsData.length}</Typography>
              <Typography>Total Productos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">{lowStockCount}</Typography>
              <Typography>Stock Bajo</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">{outOfStockCount}</Typography>
              <Typography>Agotados</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Productos por Stock</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Categoría</TableCell>
                      <TableCell>Stock</TableCell>
                      <TableCell>Stock Mínimo</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Estado</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productsData.slice(0, 10).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.nombre}</TableCell>
                        <TableCell>{product.categoria_nombre || 'Sin categoría'}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>{product.stock_minimo}</TableCell>
                        <TableCell>${parseFloat(product.precio_venta).toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={getStockStatusText(product.stock, product.stock_minimo)}
                            color={getStockStatusColor(product.stock, product.stock_minimo)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderCustomersReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Lista de Clientes</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Crédito Disponible</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientsData.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.nombre}</TableCell>
                  <TableCell>{client.email || '-'}</TableCell>
                  <TableCell>{client.telefono || '-'}</TableCell>
                  <TableCell>
                    ${parseFloat(client.credito_disponible || 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderExpensesReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Últimos Gastos</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Concepto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Método de Pago</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expensesData.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.fecha || expense.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.concepto}</TableCell>
                  <TableCell>
                    <Chip size="small" label={expense.categoria} />
                  </TableCell>
                  <TableCell>${parseFloat(expense.monto).toFixed(2)}</TableCell>
                  <TableCell>{expense.metodo_pago}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderReportContent = () => {
    switch (reportType) {
      case 'dashboard':
        return renderDashboardReport();
      case 'sales':
        return renderSalesReport();
      case 'inventory':
        return renderInventoryReport();
      case 'customers':
        return renderCustomersReport();
      case 'expenses':
        return renderExpensesReport();
      default:
        return renderDashboardReport();
    }
  };

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <AssessmentIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
        <Typography variant="h5" color="text.secondary">
          Selecciona un negocio para ver los reportes
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reportes y Análisis
      </Typography>

      {/* Selector de tipo de reporte */}
      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Tipo de Reporte</InputLabel>
          <Select
            value={reportType}
            label="Tipo de Reporte"
            onChange={(e) => setReportType(e.target.value)}
          >
            {reportTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Contenido del reporte */}
      {!loading && renderReportContent()}
    </Box>
  );
}

export default Reports; 