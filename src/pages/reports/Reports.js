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
  Switch,
  FormControlLabel,
  Slider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  PictureAsPdf as PdfIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Colores para gráficas
const CHART_COLORS = ['#1976d2', '#dc004e', '#ff9800', '#2e7d32', '#9c27b0', '#00bcd4', '#ff5722', '#795548'];

function Reports() {
  const { currentBusiness } = useApp();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  
  // Nuevos estados para optimización
  const [chartMode, setChartMode] = useState('summary'); // 'summary' o 'detailed'
  const [dataLimit, setDataLimit] = useState(20);
  const [groupByCategory, setGroupByCategory] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [chartType, setChartType] = useState(0); // Para tabs de tipos de gráfica

  const reportTypes = [
    { value: 'sales', label: 'Ventas' },
    { value: 'inventory', label: 'Inventario' },
    { value: 'customers', label: 'Clientes' },
    { value: 'expenses', label: 'Gastos' },
  ];

  useEffect(() => {
    if (currentBusiness) {
      fetchReportData();
      fetchLowStockProducts();
    }
  }, [currentBusiness, reportType, dateRange, chartMode, dataLimit, groupByCategory]);

  const fetchLowStockProducts = async () => {
    if (!currentBusiness) return;

    setLoadingLowStock(true);
    try {
      const response = await api.get(`/productos/${currentBusiness.id}/low-stock`);
      setLowStockProducts(response.data);
    } catch (error) {
      console.error('Error al cargar productos con stock bajo:', error);
    } finally {
      setLoadingLowStock(false);
    }
  };

  const fetchReportData = async () => {
    if (!currentBusiness) return;

    setLoading(true);
    try {
      let response;
      let processedData = [];

      switch (reportType) {
        case 'sales':
          response = await api.get(`/ventas/${currentBusiness.id}`);
          const salesData = response.data.filter(venta => {
            const ventaDate = new Date(venta.created_at);
            return ventaDate >= dateRange.startDate && ventaDate <= dateRange.endDate;
          });
          
          if (chartMode === 'summary') {
            // Agrupar por semana o mes según el rango
            const daysDiff = Math.ceil((dateRange.endDate - dateRange.startDate) / (1000 * 60 * 60 * 24));
            const groupBy = daysDiff > 90 ? 'month' : daysDiff > 30 ? 'week' : 'day';
            
            const salesByPeriod = salesData.reduce((acc, venta) => {
              const date = new Date(venta.created_at);
              let key;
              
              if (groupBy === 'month') {
                key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
              } else if (groupBy === 'week') {
                const weekStart = new Date(date);
                weekStart.setDate(date.getDate() - date.getDay());
                key = weekStart.toLocaleDateString();
              } else {
                key = date.toLocaleDateString();
              }
              
              if (!acc[key]) {
                acc[key] = { date: key, total: 0, count: 0 };
              }
              acc[key].total += parseFloat(venta.total || 0);
              acc[key].count += 1;
              return acc;
            }, {});

            processedData = Object.values(salesByPeriod).slice(0, dataLimit);
          } else {
            // Mostrar datos diarios limitados
            const salesByDate = salesData.reduce((acc, venta) => {
              const date = new Date(venta.created_at).toLocaleDateString();
              if (!acc[date]) {
                acc[date] = { date, total: 0, count: 0 };
              }
              acc[date].total += parseFloat(venta.total || 0);
              acc[date].count += 1;
              return acc;
            }, {});
            processedData = Object.values(salesByDate).slice(0, dataLimit);
          }
          setTotalItems(salesData.length);
          break;

        case 'inventory':
          response = await api.get(`/productos/${currentBusiness.id}`);
          const allProducts = response.data;
          setTotalItems(allProducts.length);
          
          if (groupByCategory && chartMode === 'summary') {
            // Agrupar por categoría para manejar miles de productos
            const productsByCategory = allProducts.reduce((acc, producto) => {
              const categoria = producto.categoria_nombre || 'Sin Categoría';
              if (!acc[categoria]) {
                acc[categoria] = { 
                  name: categoria, 
                  stock: 0, 
                  valor: 0, 
                  productos: 0,
                  stockMinimo: 0 
                };
              }
              acc[categoria].stock += parseFloat(producto.stock || 0);
              acc[categoria].valor += parseFloat(producto.precio_venta || 0) * parseFloat(producto.stock || 0);
              acc[categoria].productos += 1;
              acc[categoria].stockMinimo += parseFloat(producto.stock_minimo || 0);
              return acc;
            }, {});
            
            processedData = Object.values(productsByCategory);
          } else {
            // Mostrar top productos por valor de inventario
            const productsWithValue = allProducts
              .map(producto => ({
                name: producto.nombre,
                stock: parseFloat(producto.stock || 0),
                stockMinimo: parseFloat(producto.stock_minimo || 0),
                valor: parseFloat(producto.precio_venta || 0) * parseFloat(producto.stock || 0),
                categoria: producto.categoria_nombre || 'Sin Categoría'
              }))
              .sort((a, b) => b.valor - a.valor)
              .slice(0, dataLimit);
            
            processedData = productsWithValue;
          }
          break;

        case 'customers':
          response = await api.get(`/clientes/${currentBusiness.id}`);
          setTotalItems(response.data.length);
          processedData = response.data.slice(0, dataLimit);
          break;

        case 'expenses':
          response = await api.get(`/egresos/${currentBusiness.id}`);
          const expensesData = response.data.filter(egreso => {
            const egresoDate = new Date(egreso.fecha_pago || egreso.created_at);
            return egresoDate >= dateRange.startDate && egresoDate <= dateRange.endDate;
          });

          setTotalItems(expensesData.length);

          // Agrupar gastos por categoría (siempre)
          const expensesByCategory = expensesData.reduce((acc, egreso) => {
            const categoria = egreso.categoria || 'otros';
            if (!acc[categoria]) {
              acc[categoria] = { categoria, total: 0, count: 0 };
            }
            acc[categoria].total += parseFloat(egreso.monto || 0);
            acc[categoria].count += 1;
            return acc;
          }, {});

          processedData = Object.values(expensesByCategory);
          break;

        default:
          processedData = [];
      }

      setData(processedData);
    } catch (error) {
      console.error('Error al cargar los datos del reporte:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF();
      
      // Título principal
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text('REPORTE ZARZIFY', 105, 20, { align: 'center' });
      
      // Línea decorativa
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      // Información del negocio y reporte
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Negocio: ${currentBusiness.nombre}`, 20, 40);
      doc.text(`Tipo de Reporte: ${reportTypes.find(r => r.value === reportType)?.label}`, 20, 50);
      doc.text(`Fecha de Generación: ${new Date().toLocaleDateString()}`, 20, 60);
      doc.text(`Período: ${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`, 20, 70);
      doc.text(`Total de registros: ${totalItems} | Mostrando: ${data.length}`, 20, 80);

      let currentY = 95;

      // Alertas de stock bajo (si existen)
      if (lowStockProducts.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(255, 87, 34);
        doc.text('⚠️ ALERTAS DE STOCK BAJO', 20, currentY);
        currentY += 15;

        const stockData = lowStockProducts.map(producto => [
          producto.nombre || '',
          (producto.stock || 0).toString(),
          (producto.stock_minimo || 0).toString(),
          producto.stock <= 0 ? 'AGOTADO' : 'STOCK BAJO'
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Producto', 'Stock Actual', 'Stock Mínimo', 'Estado']],
          body: stockData,
          styles: { 
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: { 
            fillColor: [255, 87, 34],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          margin: { left: 20, right: 20 }
        });

        currentY = doc.lastAutoTable.finalY + 20;
      }

      // Datos del reporte principal
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text(`DATOS DEL REPORTE - ${reportTypes.find(r => r.value === reportType)?.label.toUpperCase()}`, 20, currentY);
      currentY += 15;

      if (data.length > 0) {
        let tableData = [];
        let headers = [];

        switch (reportType) {
          case 'sales':
            headers = ['Fecha', 'Total Ventas ($)', 'Cantidad de Ventas'];
            tableData = data.map(item => [
              item.date || '',
              `$${(item.total || 0).toFixed(2)}`,
              (item.count || 0).toString()
            ]);
            break;

          case 'inventory':
            if (groupByCategory && chartMode === 'summary') {
              headers = ['Categoría', 'Stock Total', 'Productos', 'Valor Total ($)'];
              tableData = data.map(item => [
                item.name || '',
                (item.stock || 0).toString(),
                (item.productos || 0).toString(),
                `$${(item.valor || 0).toFixed(2)}`
              ]);
            } else {
              headers = ['Producto', 'Stock', 'Stock Mínimo', 'Valor Total ($)'];
              tableData = data.map(item => [
                item.name || '',
                (item.stock || 0).toString(),
                (item.stockMinimo || 0).toString(),
                `$${(item.valor || 0).toFixed(2)}`
              ]);
            }
            break;

          case 'customers':
            headers = ['Cliente', 'Email', 'Teléfono'];
            tableData = data.map(item => [
              item.nombre || 'N/A',
              item.email || 'N/A',
              item.telefono || 'N/A'
            ]);
            break;

          case 'expenses':
            headers = ['Categoría', 'Total ($)', 'Cantidad de Gastos'];
            tableData = data.map(item => [
              item.categoria || '',
              `$${(item.total || 0).toFixed(2)}`,
              (item.count || 0).toString()
            ]);
            break;
        }

        autoTable(doc, {
          startY: currentY,
          head: [headers],
          body: tableData,
          styles: { 
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: { 
            fillColor: [25, 118, 210],
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          margin: { left: 20, right: 20 },
          alternateRowStyles: { fillColor: [245, 245, 245] }
        });
      } else {
        doc.setFontSize(12);
        doc.setTextColor(128, 128, 128);
        doc.text('No hay datos disponibles para el período seleccionado', 20, currentY);
      }

      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;
      
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generado con Zarzify - ${new Date().toLocaleString()}`, 20, pageHeight - 20);
      doc.text(`Página 1 de ${pageCount}`, 170, pageHeight - 20);

      // Descargar el PDF
      const fileName = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert(`Error al generar el PDF: ${error.message}. Por favor, inténtalo de nuevo.`);
    } finally {
      setPdfLoading(false);
    }
  };

  const getStockStatusColor = (stock, stockMinimo) => {
    if (stock <= 0) return 'error';
    if (stock <= stockMinimo) return 'warning';
    return 'success';
  };

  const renderChart = () => {
    if (!data.length) return null;

    const chartTabs = ['Barras', 'Línea', 'Circular'];

    switch (reportType) {
      case 'sales':
        return (
          <>
            <Tabs value={chartType} onChange={(e, v) => setChartType(v)} sx={{ mb: 2 }}>
              {chartTabs.slice(0, 2).map((tab, index) => (
                <Tab key={index} label={tab} />
              ))}
            </Tabs>
            
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 0 ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Total Ventas']} />
                  <Legend />
                  <Bar dataKey="total" fill="#1976d2" name="Ventas" />
                </BarChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Total Ventas']} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#1976d2" name="Ventas" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </>
        );
      
      case 'inventory':
        return (
          <>
            <Tabs value={chartType} onChange={(e, v) => setChartType(v)} sx={{ mb: 2 }}>
              {chartTabs.map((tab, index) => (
                <Tab key={index} label={tab} />
              ))}
            </Tabs>
            
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 2 ? (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="valor"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Valor']} />
                </PieChart>
              ) : chartType === 0 ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" fill="#2e7d32" name="Stock Actual" />
                  {!groupByCategory && <Bar dataKey="stockMinimo" fill="#ff9800" name="Stock Mínimo" />}
                </BarChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="valor" stroke="#2e7d32" name="Valor Inventario" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </>
        );

      case 'expenses':
        return (
          <>
            <Tabs value={chartType} onChange={(e, v) => setChartType(v)} sx={{ mb: 2 }}>
              {chartTabs.map((tab, index) => (
                <Tab key={index} label={tab} />
              ))}
            </Tabs>
            
            <ResponsiveContainer width="100%" height={400}>
              {chartType === 2 ? (
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="total"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ categoria, percent }) => `${categoria}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Total']} />
                </PieChart>
              ) : chartType === 0 ? (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Total']} />
                  <Legend />
                  <Bar dataKey="total" fill="#d32f2f" name="Gastos" />
                </BarChart>
              ) : (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="categoria" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Total']} />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#d32f2f" name="Gastos" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </>
        );

      default:
        return null;
    }
  };

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="info">
          Selecciona un negocio para ver los reportes
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Reportes y Alertas
      </Typography>

      {/* Alertas de Stock Bajo */}
      {lowStockProducts.length > 0 && (
        <Card sx={{ mb: 3, bgcolor: '#fff3e0', borderLeft: '4px solid #ff9800' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <WarningIcon sx={{ color: '#ff9800', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#e65100' }}>
                Alertas de Inventario ({lowStockProducts.length})
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, color: '#e65100' }}>
              Los siguientes productos necesitan reposición:
            </Typography>
            <List dense>
              {lowStockProducts.slice(0, 5).map((producto) => (
                <ListItem key={producto.id} sx={{ py: 0.5 }}>
                  <ListItemIcon>
                    <InventoryIcon sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={producto.nombre}
                    secondary={`Stock: ${producto.stock} / Mínimo: ${producto.stock_minimo}`}
                  />
                  <Chip
                    label={producto.stock <= 0 ? 'AGOTADO' : 'STOCK BAJO'}
                    color={getStockStatusColor(producto.stock, producto.stock_minimo)}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
            {lowStockProducts.length > 5 && (
              <Typography variant="caption" sx={{ color: '#e65100', mt: 1 }}>
                ... y {lowStockProducts.length - 5} productos más
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              {/* Tipo de Reporte */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Tipo de Reporte</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  label="Tipo de Reporte"
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Rango de Fechas */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Período del Reporte
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <DatePicker
                  label="Fecha Inicial"
                  value={dateRange.startDate}
                  onChange={(newValue) =>
                    setDateRange((prev) => ({ ...prev, startDate: newValue }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: { mb: 2 }
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <DatePicker
                  label="Fecha Final"
                  value={dateRange.endDate}
                  onChange={(newValue) =>
                    setDateRange((prev) => ({ ...prev, endDate: newValue }))
                  }
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small'
                    }
                  }}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Controles de Optimización */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Opciones de Visualización
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={chartMode === 'summary'}
                    onChange={(e) => setChartMode(e.target.checked ? 'summary' : 'detailed')}
                  />
                }
                label="Vista Resumida"
                sx={{ mb: 2 }}
              />

              {reportType === 'inventory' && (
                <FormControlLabel
                  control={
                    <Switch
                      checked={groupByCategory}
                      onChange={(e) => setGroupByCategory(e.target.checked)}
                    />
                  }
                  label="Agrupar por Categoría"
                  sx={{ mb: 2 }}
                />
              )}

              <Typography variant="body2" gutterBottom>
                Límite de datos: {dataLimit}
              </Typography>
              <Slider
                value={dataLimit}
                onChange={(e, value) => setDataLimit(value)}
                min={10}
                max={100}
                step={10}
                marks={[
                  { value: 10, label: '10' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
                sx={{ mb: 3 }}
              />

              <Divider sx={{ my: 3 }} />

              {/* Exportar PDF */}
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                Exportar Reporte
              </Typography>
              <Button
                variant="contained"
                onClick={handleExportPDF}
                startIcon={pdfLoading ? <CircularProgress size={20} color="inherit" /> : <PdfIcon />}
                fullWidth
                disabled={pdfLoading || loading}
                sx={{ 
                  mt: 1,
                  bgcolor: '#d32f2f',
                  '&:hover': { bgcolor: '#c62828' },
                  '&:disabled': { bgcolor: '#cccccc' }
                }}
              >
                {pdfLoading ? 'Generando PDF...' : 'Descargar PDF'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  {reportTypes.find(r => r.value === reportType)?.label}
                </Typography>
                {loading && <CircularProgress size={24} />}
              </Box>

              {/* Información de datos */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <InfoIcon sx={{ mr: 1, color: 'info.main' }} />
                <Typography variant="body2">
                  Mostrando {data.length} de {totalItems} registros totales
                  {totalItems > dataLimit && ` (limitado a ${dataLimit} para mejor rendimiento)`}
                </Typography>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <CircularProgress />
                </Box>
              ) : data.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Sin datos disponibles
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No hay datos para mostrar en el período seleccionado
                  </Typography>
                </Box>
              ) : (
                renderChart()
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports; 