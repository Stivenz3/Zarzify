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
import api from '../config/axios';

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
  const { currentBusiness } = useApp();
  const { needsRefresh, markDashboardAsRefreshed, refreshDashboard } = useDashboard();
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
  }, [currentBusiness]);

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
      console.log('📊 Obteniendo datos del dashboard para:', currentBusiness.nombre);
      const response = await api.get(`/dashboard/${currentBusiness.id}`);
      const data = response.data;
      
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

      // Configurar datos de las gráficas
      const labels = data.monthlyStats.map(stat => stat.mes);
      const ingresos = data.monthlyStats.map(stat => parseFloat(stat.ingresos || 0));
      const egresos = data.monthlyStats.map(stat => parseFloat(stat.egresos || 0));

      setChartsData({
        labels: labels.length > 0 ? labels : ['Sin datos'],
        datasets: [
          {
            label: 'Ingresos',
            data: ingresos.length > 0 ? ingresos : [0],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
          },
          {
            label: 'Egresos',
            data: egresos.length > 0 ? egresos : [0],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1,
          },
        ],
      });
      
      setLastUpdate(new Date());
      console.log('✅ Dashboard actualizado exitosamente');
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

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Icon sx={{ fontSize: 40, color }} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4">
          {title === 'Ingresos' ? `$${Number(value).toFixed(2)}` : value}
        </Typography>
      </CardContent>
    </Card>
  );

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
                Se actualiza automáticamente al realizar cambios
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
          <StatCard
            title="Productos"
            value={stats.totalProducts}
            icon={InventoryOutlined}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ventas"
            value={stats.totalSales}
            icon={ShoppingCartOutlined}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clientes"
            value={stats.totalCustomers}
            icon={PeopleOutlined}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'secondary.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <InventoryOutlined sx={{ fontSize: 40, color: 'secondary.dark' }} />
                <Typography variant="h6" sx={{ ml: 2, color: 'secondary.dark' }}>
                  Valor Inventario
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'secondary.dark' }}>
                ${Number(stats.inventoryValue).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Segunda fila de métricas financieras */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'success.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ fontSize: 40, color: 'success.dark' }} />
                <Typography variant="h6" sx={{ ml: 2, color: 'success.dark' }}>
                  Ingresos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'success.dark' }}>
                ${Number(stats.totalRevenue).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ fontSize: 40, color: 'error.dark' }} />
                <Typography variant="h6" sx={{ ml: 2, color: 'error.dark' }}>
                  Egresos
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'error.dark' }}>
                ${Number(stats.totalExpenses).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: stats.netProfit >= 0 ? 'success.light' : 'error.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ fontSize: 40, color: stats.netProfit >= 0 ? 'success.dark' : 'error.dark' }} />
                <Typography variant="h6" sx={{ ml: 2, color: stats.netProfit >= 0 ? 'success.dark' : 'error.dark' }}>
                  Ganancia Neta
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: stats.netProfit >= 0 ? 'success.dark' : 'error.dark' }}>
                ${Number(stats.netProfit).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', bgcolor: 'info.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoneyOutlined sx={{ fontSize: 40, color: 'info.dark' }} />
                <Typography variant="h6" sx={{ ml: 2, color: 'info.dark' }}>
                  Margen de Ganancia
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'info.dark' }}>
                {Number(stats.profitMargin).toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: 'info.dark', mt: 1 }}>
                {stats.profitMargin >= 20 ? '🎯 Excelente' : 
                 stats.profitMargin >= 10 ? '✅ Bueno' : 
                 stats.profitMargin >= 0 ? '⚠️ Bajo' : '❌ Pérdidas'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Ingresos vs Egresos Mensuales
            </Typography>
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
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
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