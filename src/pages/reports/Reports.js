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
} from 'recharts';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';

function Reports() {
  const { currentBusiness } = useApp();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'sales', label: 'Ventas' },
    { value: 'inventory', label: 'Inventario' },
    { value: 'customers', label: 'Clientes' },
    { value: 'expenses', label: 'Gastos' },
  ];

  useEffect(() => {
    if (currentBusiness) {
      fetchReportData();
    }
  }, [currentBusiness, reportType, dateRange]);

  const fetchReportData = async () => {
    if (!currentBusiness) return;

    setLoading(true);
    try {
      const response = await api.get(`/reports/${reportType}`, {
        params: {
          businessId: currentBusiness.id,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error al cargar los datos del reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/reports/${reportType}/export`, {
        params: {
          businessId: currentBusiness.id,
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
          format,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte_${reportType}_${format}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al exportar el reporte:', error);
    }
  };

  const renderChart = () => {
    if (!data.length) return null;

    switch (reportType) {
      case 'sales':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8884d8" name="Ventas" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'inventory':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="stock" fill="#82ca9d" name="Stock" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Reportes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
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

              <DatePicker
                label="Fecha Inicial"
                value={dateRange.startDate}
                onChange={(newValue) =>
                  setDateRange((prev) => ({ ...prev, startDate: newValue }))
                }
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />

              <DatePicker
                label="Fecha Final"
                value={dateRange.endDate}
                onChange={(newValue) =>
                  setDateRange((prev) => ({ ...prev, endDate: newValue }))
                }
                renderInput={(params) => (
                  <TextField {...params} fullWidth sx={{ mb: 2 }} />
                )}
              />

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Exportar Reporte
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => handleExport('xlsx')}
                  sx={{ mr: 1 }}
                >
                  Excel
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {reportTypes.find((type) => type.value === reportType)?.label}
              </Typography>
              {loading ? (
                <Typography>Cargando...</Typography>
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