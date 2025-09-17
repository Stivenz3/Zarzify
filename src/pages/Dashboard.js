import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  InventoryOutlined,
  ShoppingCartOutlined,
  PeopleOutlined,
  AttachMoneyOutlined,
  Business as BusinessIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { useApp } from '../context/AppContext';
import { useDashboard } from '../context/DashboardContext';
import { useTheme } from '@mui/material/styles';
import CurrencyDisplay from '../components/common/CurrencyDisplay';
import { 
  productsService, 
  salesService, 
  clientsService, 
  expensesService 
} from '../services/firestoreService';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

function Dashboard() {
  const { currentBusiness, darkMode } = useApp();
  const { needsRefresh, markDashboardAsRefreshed, refreshDashboard } = useDashboard();
  const theme = useTheme();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    inventoryValue: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const [chartsData, setChartsData] = useState({
    labels: [],
    datasets: [],
  });
  
  const [chartPeriod, setChartPeriod] = useState('weekly'); // 'weekly', 'monthly', 'yearly'

  // Cargar datos cuando cambia el negocio actual
  useEffect(() => {
    if (currentBusiness) {
      fetchDashboardData();
    } else {
      // Reset stats cuando no hay negocio
      setStats({
        totalProducts: 0,
        totalSales: 0,
        totalCustomers: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        inventoryValue: 0,
        netProfit: 0,
        profitMargin: 0,
      });
      setChartsData({
        labels: [],
        datasets: [],
      });
      setLastUpdate(null);
    }
  }, [currentBusiness, chartPeriod]);

  // Escuchar cambios que requieren actualización del dashboard
  useEffect(() => {
    if (needsRefresh && currentBusiness) {
      console.log('🔄 Dashboard detectó cambios, actualizando...');
      fetchDashboardData();
      markDashboardAsRefreshed();
    }
  }, [needsRefresh, currentBusiness, markDashboardAsRefreshed]);

  const fetchDashboardData = async () => {
    if (!currentBusiness) return;
    
    setLoading(true);
    setError('');
    try {
      // Obtener datos de Firestore
      const [products, sales, clients, expenses] = await Promise.all([
        productsService.getWhere('business_id', '==', currentBusiness.id),
        salesService.getWhere('business_id', '==', currentBusiness.id),
        clientsService.getWhere('business_id', '==', currentBusiness.id),
        expensesService.getWhere('business_id', '==', currentBusiness.id)
      ]);

      // Calcular estadísticas
      const totalProducts = products.length;
      const totalSales = sales.length;
      const totalCustomers = clients.length;
      const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (parseFloat(expense.monto) || 0), 0);
      const inventoryValue = products.reduce((sum, product) => {
        return sum + ((product.precio_compra || 0) * (product.stock || 0));
      }, 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      const data = {
        totalProducts,
        totalSales,
        totalCustomers,
        totalRevenue,
        totalExpenses,
        inventoryValue,
        netProfit,
        profitMargin,
        monthlyStats: [] // Se calculará abajo
      };
      
      setStats({
        totalProducts: data.totalProducts,
        totalSales: data.totalSales,
        totalCustomers: data.totalCustomers,
        totalRevenue: data.totalRevenue,
        totalExpenses: data.totalExpenses,
        inventoryValue: data.inventoryValue,
        netProfit: data.netProfit,
        profitMargin: data.profitMargin,
      });

      // Configurar datos de las gráficas según el período
      let labels, ingresos, egresos;
      
      if (chartPeriod === 'weekly') {
        // Para vista semanal, mostrar días de la semana
        const dayMapping = {
          'Sun': 'Dom', 'Mon': 'Lun', 'Tue': 'Mar', 'Wed': 'Mié', 
          'Thu': 'Jue', 'Fri': 'Vie', 'Sat': 'Sáb'
        };
        
        // Crear array con los últimos 7 días
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          last7Days.push(dayName);
        }
        
        const weeklyData = last7Days.map(dayName => {
          const dayStart = new Date();
          dayStart.setDate(dayStart.getDate() - (6 - last7Days.indexOf(dayName)));
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(dayStart);
          dayEnd.setHours(23, 59, 59, 999);
          
          const daySales = sales.filter(sale => {
            const saleDate = sale.fecha_venta?.toDate ? sale.fecha_venta.toDate() : new Date(sale.fecha_venta || sale.created_at);
            return saleDate >= dayStart && saleDate <= dayEnd;
          });
          
          const dayExpenses = expenses.filter(expense => {
            const expenseDate = expense.fecha_pago?.toDate ? expense.fecha_pago.toDate() : new Date(expense.fecha_pago || expense.created_at);
            return expenseDate >= dayStart && expenseDate <= dayEnd;
          });
          
          return {
            mes: dayMapping[dayName] || dayName,
            ingresos: daySales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0),
            egresos: dayExpenses.reduce((sum, expense) => sum + (parseFloat(expense.monto) || 0), 0)
          };
        });
        labels = weeklyData.map(stat => stat.mes);
        ingresos = weeklyData.map(stat => stat.ingresos);
        egresos = weeklyData.map(stat => stat.egresos);
      } else if (chartPeriod === 'yearly') {
        // Para vista anual, asegurar que tengamos al menos 3 años
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let i = 2; i >= 0; i--) {
          years.push((currentYear - i).toString());
        }
        
        const yearlyData = years.map(year => {
          const yearStart = new Date(parseInt(year), 0, 1);
          const yearEnd = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
          
          const yearSales = sales.filter(sale => {
            const saleDate = sale.fecha_venta?.toDate ? sale.fecha_venta.toDate() : new Date(sale.fecha_venta || sale.created_at);
            return saleDate >= yearStart && saleDate <= yearEnd;
          });
          
          const yearExpenses = expenses.filter(expense => {
            const expenseDate = expense.fecha_pago?.toDate ? expense.fecha_pago.toDate() : new Date(expense.fecha_pago || expense.created_at);
            return expenseDate >= yearStart && expenseDate <= yearEnd;
          });
          
          return {
            mes: year,
            ingresos: yearSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0),
            egresos: yearExpenses.reduce((sum, expense) => sum + (parseFloat(expense.monto) || 0), 0)
          };
        });
        
        labels = yearlyData.map(stat => stat.mes);
        ingresos = yearlyData.map(stat => stat.ingresos);
        egresos = yearlyData.map(stat => stat.egresos);
      } else {
        // Vista mensual por defecto - últimos 12 meses
        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
          
          const monthSales = sales.filter(sale => {
            const saleDate = sale.fecha_venta?.toDate ? sale.fecha_venta.toDate() : new Date(sale.fecha_venta || sale.created_at);
            return saleDate >= monthStart && saleDate <= monthEnd;
          });
          
          const monthExpenses = expenses.filter(expense => {
            const expenseDate = expense.fecha_pago?.toDate ? expense.fecha_pago.toDate() : new Date(expense.fecha_pago || expense.created_at);
            return expenseDate >= monthStart && expenseDate <= monthEnd;
          });
          
          monthlyData.push({
            mes: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
            ingresos: monthSales.reduce((sum, sale) => sum + (parseFloat(sale.total) || 0), 0),
            egresos: monthExpenses.reduce((sum, expense) => sum + (parseFloat(expense.monto) || 0), 0)
          });
        }
        
        labels = monthlyData.map(stat => stat.mes);
        ingresos = monthlyData.map(stat => stat.ingresos);
        egresos = monthlyData.map(stat => stat.egresos);
      }

      setChartsData({
        labels: labels.length > 0 ? labels : ['Sin datos'],
        datasets: [
          {
            label: 'Ingresos',
            data: ingresos.length > 0 ? ingresos : [0],
            borderColor: darkMode ? '#55efc4' : 'rgb(75, 192, 192)',
            backgroundColor: darkMode ? 'rgba(85, 239, 196, 0.2)' : 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: darkMode ? '#00b894' : 'rgb(75, 192, 192)',
            pointBorderColor: darkMode ? '#ffffff' : 'rgb(75, 192, 192)',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
          {
            label: 'Egresos',
            data: egresos.length > 0 ? egresos : [0],
            borderColor: darkMode ? '#ff7675' : 'rgb(255, 99, 132)',
            backgroundColor: darkMode ? 'rgba(255, 118, 117, 0.2)' : 'rgba(255, 99, 132, 0.2)',
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: darkMode ? '#e17055' : 'rgb(255, 99, 132)',
            pointBorderColor: darkMode ? '#ffffff' : 'rgb(255, 99, 132)',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8,
          },
        ],
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRefresh = () => {
    const timestamp = refreshDashboard('manual');
    fetchDashboardData();
  };

  // Función para obtener el tamaño de fuente basado en la longitud del número
  const getResponsiveFontSize = (value) => {
    const str = String(value);
    if (str.length > 15) return { fontSize: '1.5rem', lineHeight: 1.2 }; // Muy largo
    if (str.length > 12) return { fontSize: '1.7rem', lineHeight: 1.3 }; // Largo
    if (str.length > 9) return { fontSize: '1.9rem', lineHeight: 1.4 };  // Medio
    return { fontSize: '2.125rem', lineHeight: 1.2 }; // Normal (h4)
  };


  // Mostrar mensaje cuando no hay negocio seleccionado
  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Dashboard
        </Typography>
        
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Selecciona un negocio
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Para ver las estadísticas del dashboard, primero selecciona un negocio desde el menú superior.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Dashboard - {currentBusiness.nombre}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {lastUpdate && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
              </Typography>
            </Box>
          )}
          
          <Tooltip title="Actualizar manualmente">
            <IconButton 
              onClick={handleManualRefresh}
              disabled={loading}
              color="primary"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: theme.palette.dashboard.products.light,
            background: `linear-gradient(135deg, ${theme.palette.dashboard.products.light} 0%, ${theme.palette.dashboard.products.main} 100%)`,
            boxShadow: darkMode ? '0 8px 32px rgba(108, 92, 231, 0.3)' : '0 4px 20px rgba(25, 118, 210, 0.15)',
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryOutlined sx={{ fontSize: 40, color: theme.palette.dashboard.products.dark }} />
                <Typography variant="h6" sx={{ ml: 2, color: theme.palette.dashboard.products.dark }}>
                  Productos
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: theme.palette.dashboard.products.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(stats.totalProducts)
                }}
              >
                {stats.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: theme.palette.dashboard.sales.light,
            background: `linear-gradient(135deg, ${theme.palette.dashboard.sales.light} 0%, ${theme.palette.dashboard.sales.main} 100%)`,
            boxShadow: darkMode ? '0 8px 32px rgba(0, 184, 148, 0.3)' : '0 4px 20px rgba(46, 125, 50, 0.15)',
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingCartOutlined sx={{ fontSize: 40, color: theme.palette.dashboard.sales.dark }} />
                <Typography variant="h6" sx={{ ml: 2, color: theme.palette.dashboard.sales.dark }}>
                  Ventas
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: theme.palette.dashboard.sales.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(stats.totalSales)
                }}
              >
                {stats.totalSales}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: theme.palette.dashboard.clients.light,
            background: `linear-gradient(135deg, ${theme.palette.dashboard.clients.light} 0%, ${theme.palette.dashboard.clients.main} 100%)`,
            boxShadow: darkMode ? '0 8px 32px rgba(253, 203, 110, 0.3)' : '0 4px 20px rgba(237, 108, 2, 0.15)',
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleOutlined sx={{ fontSize: 40, color: theme.palette.dashboard.clients.dark }} />
                <Typography variant="h6" sx={{ ml: 2, color: theme.palette.dashboard.clients.dark }}>
                  Clientes
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: theme.palette.dashboard.clients.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(stats.totalCustomers)
                }}
              >
                {stats.totalCustomers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: theme.palette.dashboard.inventory.light,
            background: `linear-gradient(135deg, ${theme.palette.dashboard.inventory.light} 0%, ${theme.palette.dashboard.inventory.main} 100%)`,
            boxShadow: darkMode ? '0 8px 32px rgba(253, 121, 168, 0.3)' : '0 4px 20px rgba(156, 39, 176, 0.15)',
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryOutlined sx={{ fontSize: 40, color: theme.palette.dashboard.inventory.dark }} />
                <Typography variant="h6" sx={{ ml: 2, color: theme.palette.dashboard.inventory.dark }}>
                  Valor Inventario
                </Typography>
              </Box>
              <CurrencyDisplay
                amount={stats.inventoryValue}
                variant="h4"
                sx={{ 
                  color: theme.palette.dashboard.inventory.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(`$ ${Number(stats.inventoryValue).toLocaleString()} USD`)
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Segunda fila de métricas financieras */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: theme.palette.dashboard.revenue.light,
            background: `linear-gradient(135deg, ${theme.palette.dashboard.revenue.light} 0%, ${theme.palette.dashboard.revenue.main} 100%)`,
            boxShadow: darkMode ? '0 8px 32px rgba(85, 239, 196, 0.3)' : '0 4px 20px rgba(76, 175, 80, 0.15)',
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ fontSize: 40, color: theme.palette.dashboard.revenue.dark }} />
                <Typography variant="h6" sx={{ ml: 2, color: theme.palette.dashboard.revenue.dark }}>
                  Ingresos
                </Typography>
              </Box>
              <CurrencyDisplay
                amount={stats.totalRevenue}
                variant="h4"
                sx={{ 
                  color: theme.palette.dashboard.revenue.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(`$ ${Number(stats.totalRevenue).toLocaleString()} USD`)
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: theme.palette.dashboard.expenses.light,
            background: `linear-gradient(135deg, ${theme.palette.dashboard.expenses.light} 0%, ${theme.palette.dashboard.expenses.main} 100%)`,
            boxShadow: darkMode ? '0 8px 32px rgba(231, 25, 25, 0.3)' : '0 4px 20px rgba(244, 67, 54, 0.15)',
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ fontSize: 40, color: theme.palette.dashboard.expenses.dark }} />
                <Typography variant="h6" sx={{ ml: 2, color: theme.palette.dashboard.expenses.dark }}>
                  Egresos
                </Typography>
              </Box>
              <CurrencyDisplay
                amount={stats.totalExpenses}
                variant="h4"
                sx={{ 
                  color: theme.palette.dashboard.expenses.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(`$ ${Number(stats.totalExpenses).toLocaleString()} USD`)
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: stats.netProfit >= 0 ? theme.palette.dashboard.revenue.light : theme.palette.dashboard.expenses.light,
            background: stats.netProfit >= 0 
              ? `linear-gradient(135deg, ${theme.palette.dashboard.revenue.light} 0%, ${theme.palette.dashboard.revenue.main} 100%)`
              : `linear-gradient(135deg, ${theme.palette.dashboard.expenses.light} 0%, ${theme.palette.dashboard.expenses.main} 100%)`,
            boxShadow: stats.netProfit >= 0 
              ? (darkMode ? '0 8px 32px rgba(85, 239, 196, 0.3)' : '0 4px 20px rgba(76, 175, 80, 0.15)')
              : (darkMode ? '0 8px 32px rgba(255, 118, 117, 0.3)' : '0 4px 20px rgba(244, 67, 54, 0.15)'),
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ 
                  fontSize: 40, 
                  color: stats.netProfit >= 0 ? theme.palette.dashboard.revenue.dark : theme.palette.dashboard.expenses.dark 
                }} />
                <Typography variant="h6" sx={{ 
                  ml: 2, 
                  color: stats.netProfit >= 0 ? theme.palette.dashboard.revenue.dark : theme.palette.dashboard.expenses.dark 
                }}>
                  Ganancia Neta
                </Typography>
              </Box>
              <CurrencyDisplay
                amount={stats.netProfit}
                variant="h4"
                sx={{ 
                  color: stats.netProfit >= 0 ? theme.palette.dashboard.revenue.dark : theme.palette.dashboard.expenses.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(`$ ${Number(stats.netProfit).toLocaleString()} USD`)
                }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            height: 160, 
            bgcolor: theme.palette.dashboard.profit.light,
            background: `linear-gradient(135deg, ${theme.palette.dashboard.profit.light} 0%, ${theme.palette.dashboard.profit.main} 100%)`,
            boxShadow: darkMode ? '0 8px 32px rgba(116, 185, 255, 0.3)' : '0 4px 20px rgba(33, 150, 243, 0.15)',
          }}>
            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ fontSize: 40, color: theme.palette.dashboard.profit.dark }} />
                <Typography variant="h6" sx={{ ml: 2, color: theme.palette.dashboard.profit.dark }}>
                  Margen de Ganancia
                </Typography>
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: theme.palette.dashboard.profit.dark,
                  textAlign: 'center',
                  ...getResponsiveFontSize(`${Number(stats.profitMargin).toFixed(1)}%`)
                }}
              >
                {Number(stats.profitMargin).toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.dashboard.profit.dark, mt: 1 }}>
                {stats.profitMargin >= 20 ? ' Excelente' : 
                 stats.profitMargin >= 10 ? ' Bueno' : 
                 stats.profitMargin >= 0 ? ' Bajo' : ' Pérdidas'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Ingresos vs Egresos {chartPeriod === 'weekly' ? 'por Día de la Semana' : chartPeriod === 'monthly' ? 'Mensuales' : 'Anuales'}
              </Typography>
              <ToggleButtonGroup
                value={chartPeriod}
                exclusive
                onChange={(event, newPeriod) => {
                  if (newPeriod !== null) {
                    setChartPeriod(newPeriod);
                  }
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    px: 2,
                    py: 0.5,
                    fontSize: '0.875rem',
                  }
                }}
              >
                <ToggleButton value="weekly">
                  Semanal
                </ToggleButton>
                <ToggleButton value="monthly">
                  Mensual
                </ToggleButton>
                <ToggleButton value="yearly">
                  Anual
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 300 }}>
              {chartsData.labels.length > 0 ? (
                <Line
                  data={chartsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          color: darkMode ? '#ffffff' : '#000000',
                          font: {
                            size: 14,
                            weight: 'bold',
                          },
                          padding: 20,
                          usePointStyle: true,
                          pointStyle: 'circle',
                        },
                      },
                      tooltip: {
                        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: darkMode ? '#ffffff' : '#000000',
                        bodyColor: darkMode ? '#ffffff' : '#000000',
                        borderColor: darkMode ? '#555' : '#e0e0e0',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                      },
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        grid: {
                          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          borderColor: darkMode ? '#555' : '#e0e0e0',
                        },
                        ticks: {
                          color: darkMode ? '#b3b3b3' : '#666666',
                          font: {
                            size: 12,
                          },
                        },
                      },
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                          borderColor: darkMode ? '#555' : '#e0e0e0',
                        },
                        ticks: {
                          color: darkMode ? '#b3b3b3' : '#666666',
                          font: {
                            size: 12,
                          },
                          callback: function(value) {
                            return '$' + new Intl.NumberFormat('es-ES').format(value);
                          },
                        },
                      },
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index',
                    },
                    elements: {
                      point: {
                        hoverBorderWidth: 3,
                      },
                    },
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="body1">
                    No hay datos financieros para mostrar
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 