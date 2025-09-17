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
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  TextField,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  PictureAsPdf as PdfIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../context/AppContext';
import { 
  productsService, 
  salesService, 
  clientsService, 
  expensesService,
  employeesService,
  categoriesService
} from '../../services/firestoreService';
import CurrencyDisplay from '../../components/common/CurrencyDisplay';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoZarzify from '../../logo zarzify.png';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

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

  // Estados para rango de fechas
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1); // Por defecto último mes
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

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
  }, [currentBusiness, reportType, startDate, endDate]);

  // Función para obtener el tamaño de fuente basado en la longitud del número
  const getResponsiveFontSize = (value) => {
    const str = String(value);
    if (str.length > 15) return { fontSize: '1.5rem', lineHeight: 1.2 }; // Muy largo
    if (str.length > 12) return { fontSize: '1.7rem', lineHeight: 1.3 }; // Largo
    if (str.length > 9) return { fontSize: '1.9rem', lineHeight: 1.4 };  // Medio
    return { fontSize: '2.125rem', lineHeight: 1.2 }; // Normal (h4)
  };

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
      const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
      const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.monto || 0), 0);
      const inventoryValue = products.reduce((sum, product) => {
        return sum + ((product.precio_compra || 0) * (product.stock || 0));
      }, 0);
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      
      setDashboardData({
        totalProducts,
        totalSales,
        totalCustomers,
        totalRevenue,
        totalExpenses,
        inventoryValue,
        netProfit,
        profitMargin
      });
      
      // Productos con stock bajo
      const lowStockProducts = products.filter(product => 
        (product.stock || 0) <= (product.stock_minimo || 0)
      );
      setLowStockProducts(lowStockProducts);
    } catch (error) {
      throw error;
    }
  };

  const fetchSalesData = async () => {
    try {
      const sales = await salesService.getWhere('business_id', '==', currentBusiness.id);
      
      // Filtrar por rango de fechas
      const filteredSales = sales.filter(sale => {
        const saleDate = sale.fecha?.toDate ? sale.fecha.toDate() : new Date(sale.fecha);
        return saleDate >= startDate && saleDate <= endDate;
      });
      
      // Procesar datos para gráfica lineal por mes
      const salesByMonth = {};
      filteredSales.forEach(sale => {
        const date = sale.fecha?.toDate ? sale.fecha.toDate() : new Date(sale.fecha);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
        
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = { mes: monthName, ventas: 0, total: 0 };
        }
        salesByMonth[monthKey].ventas += 1;
        salesByMonth[monthKey].total += parseFloat(sale.total || 0);
      });
      
      const sortedData = Object.entries(salesByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, data]) => data);
      
      setSalesData(sortedData);
    } catch (error) {
      throw error;
    }
  };

  const fetchInventoryData = async () => {
    try {
      const [products, categories] = await Promise.all([
        productsService.getWhere('business_id', '==', currentBusiness.id),
        categoriesService.getWhere('business_id', '==', currentBusiness.id)
      ]);
      
      // Procesar datos por categorías
      const productsByCategory = {};
      
      // Inicializar todas las categorías
      categories.forEach(category => {
        productsByCategory[category.nombre] = { name: category.nombre, productos: 0, valor: 0 };
      });
      
      // Agregar categoría para productos sin categoría
      productsByCategory['Sin categoría'] = { name: 'Sin categoría', productos: 0, valor: 0 };
      
      // Contar productos por categoría
      products.forEach(product => {
        const categoryName = product.categoria_nombre || 'Sin categoría';
        if (productsByCategory[categoryName]) {
          productsByCategory[categoryName].productos += 1;
          productsByCategory[categoryName].valor += (product.stock || 0) * (product.precio_venta || 0);
        }
      });
      
      // Convertir a array y filtrar categorías vacías
      const chartData = Object.values(productsByCategory)
        .filter(category => category.productos > 0)
        .map(category => ({
          name: category.name,
          value: category.productos,
          productos: category.productos,
          valor: category.valor
        }));
      
      setProductsData(chartData);
    } catch (error) {
      throw error;
    }
  };

  const fetchCustomersData = async () => {
    try {
      const clients = await clientsService.getWhere('business_id', '==', currentBusiness.id);
      setClientsData(clients);
    } catch (error) {
      throw error;
    }
  };

  const fetchExpensesData = async () => {
    try {
      const expenses = await expensesService.getWhere('business_id', '==', currentBusiness.id);
      
      // Filtrar por rango de fechas
      const filteredExpenses = expenses.filter(expense => {
        const expenseDate = expense.fecha?.toDate ? expense.fecha.toDate() : new Date(expense.fecha);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
      
      // Procesar datos para gráficas
      const expensesByCategory = {};
      filteredExpenses.forEach(expense => {
        const category = expense.categoria || 'Sin categoría';
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += parseFloat(expense.monto || 0);
      });
      
      const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
        name,
        value: value,
        monto: value
      }));
      
      setExpensesData(chartData);
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

  const exportToPDF = async () => {
    if (!currentBusiness) {
      setError('No hay negocio seleccionado');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Cargar datos específicos para el tipo de reporte actual
      let currentData = null;
      let lowStock = [];

      // Siempre cargar datos frescos para asegurar que tengamos la información más actualizada
      switch (reportType) {
        case 'sales':
          try {
            const allSales = await salesService.getWhere('business_id', '==', currentBusiness.id);
            currentData = allSales.filter(sale => {
              const saleDate = sale.fecha?.toDate ? sale.fecha.toDate() : new Date(sale.fecha);
              return saleDate >= startDate && saleDate <= endDate;
            });
          } catch (error) {
            console.error('Error cargando datos de ventas:', error);
            currentData = salesData; // Fallback a datos existentes
          }
          break;
        case 'inventory':
          try {
            currentData = await productsService.getWhere('business_id', '==', currentBusiness.id);
          } catch (error) {
            console.error('Error cargando datos de inventario:', error);
            currentData = productsData; // Fallback a datos existentes
          }
          break;
        case 'customers':
          try {
            currentData = await clientsService.getWhere('business_id', '==', currentBusiness.id);
          } catch (error) {
            console.error('Error cargando datos de clientes:', error);
            currentData = clientsData; // Fallback a datos existentes
          }
          break;
        case 'expenses':
          try {
            const allExpenses = await expensesService.getWhere('business_id', '==', currentBusiness.id);
            currentData = allExpenses.filter(expense => {
              const expenseDate = expense.fecha?.toDate ? expense.fecha.toDate() : new Date(expense.fecha);
              return expenseDate >= startDate && expenseDate <= endDate;
            }).slice(0, 50); // Limitar para PDF
          } catch (error) {
            console.error('Error cargando datos de gastos:', error);
            currentData = expensesData; // Fallback a datos existentes
          }
          break;
        case 'dashboard':
          try {
            // Calcular datos del dashboard
            const [products, sales, clients, expenses] = await Promise.all([
              productsService.getWhere('business_id', '==', currentBusiness.id),
              salesService.getWhere('business_id', '==', currentBusiness.id),
              clientsService.getWhere('business_id', '==', currentBusiness.id),
              expensesService.getWhere('business_id', '==', currentBusiness.id)
            ]);
            
            const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
            const totalExpenses = expenses.reduce((sum, expense) => sum + (expense.monto || 0), 0);
            
            currentData = {
              totalProducts: products.length,
              totalSales: sales.length,
              totalCustomers: clients.length,
              totalRevenue,
              totalExpenses,
              netProfit: totalRevenue - totalExpenses
            };
          } catch (error) {
            console.error('Error cargando datos del dashboard:', error);
            currentData = dashboardData; // Fallback a datos existentes
          }
          break;
        default:
          currentData = dashboardData;
      }

      // Cargar productos con stock bajo
      try {
        const products = await productsService.getWhere('business_id', '==', currentBusiness.id);
        lowStock = products.filter(product => 
          (product.stock || 0) <= (product.stock_minimo || 0)
        );
      } catch (error) {
        console.log('No se pudieron cargar productos con stock bajo');
        lowStock = lowStockProducts; // Fallback a datos existentes
      }

      // Verificar que tenemos datos para generar el PDF
      if (!currentData && reportType !== 'dashboard') {
        setError('No hay datos disponibles para generar el PDF');
        setLoading(false);
        return;
      }

      // Generar el PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;

      // Cargar y agregar logo
      try {
        const logoImg = new Image();
        logoImg.onload = function() {
          // Agregar logo
          doc.addImage(this, 'PNG', margin, 15, 20, 20);
          
          // Continuar con el resto del PDF
          generatePDFContent();
        };
        logoImg.src = logoZarzify;
      } catch (error) {
        console.log('No se pudo cargar el logo, continuando sin él');
        generatePDFContent();
      }

      function generatePDFContent() {
        // Encabezado del documento
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('ZARZIFY', margin + 25, 30);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Negocio: ${currentBusiness?.nombre}`, margin, 45);
        
        doc.setFontSize(12);
        doc.text(`Reporte: ${reportTypes.find(type => type.value === reportType)?.label}`, margin, 55);
        doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, margin, 65);
        
        // Mostrar rango de fechas si no es dashboard
        if (reportType !== 'dashboard') {
          doc.text(`Período: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, margin, 75);
        }

        let yPosition = reportType !== 'dashboard' ? 90 : 80;

        // Alertas de stock bajo (siempre mostrar si hay)
        if (lowStock && lowStock.length > 0) {
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 100, 100);
          doc.text('⚠ ALERTAS DE STOCK BAJO', margin, yPosition);
          yPosition += 10;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0);
          
          lowStock.slice(0, 5).forEach(product => {
            doc.text(`• ${product.nombre} - Stock: ${product.stock} (Mín: ${product.stock_minimo})`, margin + 5, yPosition);
            yPosition += 8;
          });
          yPosition += 10;
        }

        // Contenido específico por tipo de reporte
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);

        switch (reportType) {
          case 'sales':
            doc.text('REPORTE DE VENTAS', margin, yPosition);
            yPosition += 15;

            if (currentData && currentData.length > 0) {
              const tableData = currentData.slice(0, 50).map(sale => [
                new Date(sale.fecha_venta || sale.created_at).toLocaleDateString(),
                sale.cliente_nombre || 'Cliente General',
                `$${parseFloat(sale.total || 0).toFixed(2)}`,
                sale.metodo_pago || 'N/A'
              ]);

              autoTable(doc, {
                head: [['Fecha', 'Cliente', 'Total', 'Método de Pago']],
                body: tableData,
                startY: yPosition,
                styles: { 
                  fontSize: 9,
                  cellPadding: 4,
                  overflow: 'linebreak',
                  columnWidth: 'wrap'
                },
                headStyles: { 
                  fillColor: [66, 139, 202],
                  textColor: 255,
                  fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: margin, right: margin }
              });
            } else {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'normal');
              doc.text('No hay datos de ventas disponibles para el período seleccionado', margin, yPosition);
            }
            break;

          case 'inventory':
            doc.text('REPORTE DE INVENTARIO', margin, yPosition);
            yPosition += 15;

            if (currentData && currentData.length > 0) {
              const tableData = currentData.map(product => [
                product.nombre || 'N/A',
                product.categoria_nombre || 'Sin categoría',
                (product.stock || 0).toString(),
                `$${parseFloat(product.precio_venta || 0).toFixed(2)}`,
                getStockStatusText(product.stock || 0, product.stock_minimo || 0)
              ]);

              autoTable(doc, {
                head: [['Producto', 'Categoría', 'Stock', 'Precio', 'Estado']],
                body: tableData,
                startY: yPosition,
                styles: { 
                  fontSize: 9,
                  cellPadding: 4,
                  overflow: 'linebreak',
                  columnWidth: 'wrap'
                },
                headStyles: { 
                  fillColor: [76, 175, 80],
                  textColor: 255,
                  fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: margin, right: margin }
              });
            } else {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'normal');
              doc.text('No hay datos de inventario disponibles', margin, yPosition);
            }
            break;

          case 'customers':
            doc.text('REPORTE DE CLIENTES', margin, yPosition);
            yPosition += 15;

            if (currentData && currentData.length > 0) {
              const tableData = currentData.map(client => [
                client.nombre || 'N/A',
                client.email || '-',
                client.telefono || '-',
                `$${parseFloat(client.credito_disponible || 0).toFixed(2)}`
              ]);

              autoTable(doc, {
                head: [['Nombre', 'Email', 'Teléfono', 'Crédito Disponible']],
                body: tableData,
                startY: yPosition,
                styles: { 
                  fontSize: 9,
                  cellPadding: 4,
                  overflow: 'linebreak',
                  columnWidth: 'wrap'
                },
                headStyles: { 
                  fillColor: [156, 39, 176],
                  textColor: 255,
                  fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: margin, right: margin }
              });
            } else {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'normal');
              doc.text('No hay datos de clientes disponibles', margin, yPosition);
            }
            break;

          case 'expenses':
            doc.text('REPORTE DE GASTOS', margin, yPosition);
            yPosition += 15;

            if (currentData && currentData.length > 0) {
              const tableData = currentData.map(expense => [
                new Date(expense.fecha || expense.created_at).toLocaleDateString(),
                expense.concepto || 'N/A',
                expense.categoria || 'N/A',
                `$${parseFloat(expense.monto || 0).toFixed(2)}`,
                expense.metodo_pago || 'N/A'
              ]);

              autoTable(doc, {
                head: [['Fecha', 'Concepto', 'Categoría', 'Monto', 'Método de Pago']],
                body: tableData,
                startY: yPosition,
                styles: { 
                  fontSize: 9,
                  cellPadding: 4,
                  overflow: 'linebreak',
                  columnWidth: 'wrap'
                },
                headStyles: { 
                  fillColor: [255, 152, 0],
                  textColor: 255,
                  fontStyle: 'bold'
                },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { left: margin, right: margin }
              });
            } else {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'normal');
              doc.text('No hay datos de gastos disponibles para el período seleccionado', margin, yPosition);
            }
            break;

          case 'dashboard':
            doc.text('RESUMEN GENERAL', margin, yPosition);
            yPosition += 15;

            if (currentData) {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'normal');
              doc.text(`Total de Productos: ${currentData.totalProducts || 0}`, margin, yPosition);
              yPosition += 10;
              doc.text(`Total de Ventas: ${currentData.totalSales || 0}`, margin, yPosition);
              yPosition += 10;
              doc.text(`Total de Clientes: ${currentData.totalCustomers || 0}`, margin, yPosition);
              yPosition += 10;
              doc.text(`Ingresos Totales: $${(currentData.totalRevenue || 0).toFixed(2)}`, margin, yPosition);
              yPosition += 10;
              doc.text(`Valor de Inventario: $${(currentData.inventoryValue || 0).toFixed(2)}`, margin, yPosition);
              yPosition += 10;
              doc.text(`Ganancia Neta: $${(currentData.netProfit || 0).toFixed(2)}`, margin, yPosition);
              yPosition += 10;
              doc.text(`Margen de Ganancia: ${(currentData.profitMargin || 0).toFixed(1)}%`, margin, yPosition);
            } else {
              doc.setFontSize(12);
              doc.setFont('helvetica', 'normal');
              doc.text('No hay datos del dashboard disponibles', margin, yPosition);
            }
            break;
        }

        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(128, 128, 128);
          doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin - 30, doc.internal.pageSize.height - 10);
          doc.text(`Generado por Zarzify - ${new Date().toLocaleString()}`, margin, doc.internal.pageSize.height - 10);
        }

        // Guardar el PDF
        const fileName = `reporte_${reportType}_${currentBusiness.nombre.replace(/\s+/g, '_')}_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      }
      
    } catch (error) {
      console.error('Error al generar PDF:', error);
      setError(`Error al generar el PDF: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderSalesReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Tendencia de Ventas</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [
                name === 'total' ? `$${value.toFixed(2)}` : value,
                name === 'total' ? 'Total Vendido' : 'Número de Ventas'
              ]}
            />
            <Legend />
            <Line type="monotone" dataKey="ventas" stroke="#8884d8" name="Cantidad de Ventas" strokeWidth={2} />
            <Line type="monotone" dataKey="total" stroke="#82ca9d" name="Total $" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderInventoryReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Distribución de Productos por Categoría</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={productsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {productsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name, props) => [`${value} productos`, 'Cantidad']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderExpensesReport = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Gastos por Categoría</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={expensesData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {expensesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

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

  const renderDashboardReport = () => {
    if (!dashboardData) return null;

    return (
      <Grid container spacing={3}>
        {/* Alertas de stock bajo */}
        {lowStockProducts.length > 0 && (
          <Grid item xs={12}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                ¡Atención! {lowStockProducts.length} producto(s) con stock bajo
              </Typography>
              <List dense sx={{ mt: 1 }}>
                {lowStockProducts.slice(0, 5).map((product) => (
                  <ListItem key={product.id} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      <InventoryIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${product.nombre} - Stock: ${product.stock}`}
                      secondary={`Mínimo requerido: ${product.stock_minimo}`}
                    />
                    <Chip
                      size="small"
                      label={getStockStatusText(product.stock, product.stock_minimo)}
                      color={getStockStatusColor(product.stock, product.stock_minimo)}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          </Grid>
        )}

        {/* Métricas principales */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            '&:hover': { bgcolor: 'primary.dark' },
            height: 160
          }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <InventoryIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  ...getResponsiveFontSize(dashboardData.totalProducts),
                  mb: 1
                }}
              >
                {dashboardData.totalProducts}
              </Typography>
              <Typography variant="body2">Productos</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'success.main', 
            color: 'success.contrastText',
            '&:hover': { bgcolor: 'success.dark' },
            height: 160
          }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  ...getResponsiveFontSize(dashboardData.totalSales),
                  mb: 1
                }}
              >
                {dashboardData.totalSales}
              </Typography>
              <Typography variant="body2">Ventas</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'info.main', 
            color: 'info.contrastText',
            '&:hover': { bgcolor: 'info.dark' },
            height: 160
          }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography 
                variant="h4" 
                sx={{ 
                  ...getResponsiveFontSize(dashboardData.totalCustomers),
                  mb: 1
                }}
              >
                {dashboardData.totalCustomers}
              </Typography>
              <Typography variant="body2">Clientes</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            bgcolor: 'warning.main', 
            color: 'warning.contrastText',
            '&:hover': { bgcolor: 'warning.dark' },
            height: 160
          }}>
            <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <MoneyIcon sx={{ fontSize: 40, mb: 1 }} />
              <CurrencyDisplay
                amount={dashboardData.totalRevenue}
                variant="h4"
                sx={{ 
                  ...getResponsiveFontSize(`$ ${Number(dashboardData.totalRevenue).toLocaleString()} USD`),
                  mb: 1
                }}
              />
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
                <CurrencyDisplay
                  amount={dashboardData.inventoryValue}
                  variant="h5"
                  sx={{ color: 'primary.main' }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">Ganancia Neta</Typography>
                <CurrencyDisplay
                  amount={dashboardData.netProfit}
                  variant="h5"
                  sx={{ 
                    color: dashboardData.netProfit >= 0 ? 'success.main' : 'error.main'
                  }}
                />
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Reportes y Análisis
        </Typography>
        
        <Button
          variant="contained"
          color="error"
          startIcon={<PdfIcon />}
          onClick={exportToPDF}
          sx={{ backgroundColor: '#d32f2f' }}
        >
          Descargar PDF
        </Button>
      </Box>

      {/* Selector de tipo de reporte */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
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
        </Grid>

        {/* Selectores de fecha - Solo para reportes que no sean dashboard */}
        {reportType !== 'dashboard' && reportType !== 'inventory' && (
          <>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Fecha Inicio"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue || new Date())}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={endDate}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Fecha Fin"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue || new Date())}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={startDate}
                maxDate={new Date()}
              />
            </Grid>
          </>
        )}

        {/* Indicador de rango de fechas */}
        {reportType !== 'dashboard' && reportType !== 'inventory' && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DateRangeIcon />
                  <Typography variant="body2">
                    Mostrando datos del {startDate.toLocaleDateString()} al {endDate.toLocaleDateString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

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