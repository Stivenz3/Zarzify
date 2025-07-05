import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useApp } from '../../context/AppContext';
import api from '../../config/axios';

function Settings() {
  const { currentBusiness } = useApp();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notificaciones: {
      stockBajo: true,
      nuevasVentas: true,
      reportesDiarios: false,
    },
    impuestos: {
      iva: 16,
    },
    moneda: {
      simbolo: '$',
      posicion: 'before',
    },
  });

  // Cargar configuración existente al montar el componente
  useEffect(() => {
    const loadSettings = async () => {
      if (!currentBusiness?.id) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/configuracion/${currentBusiness.id}`);
        const config = response.data;
        
        // Transformar datos del backend al formato del frontend
        setSettings({
          notificaciones: {
            stockBajo: config.alertas_stock_bajo,
            nuevasVentas: config.notificaciones_email,
            reportesDiarios: false, // no está en BD
          },
          impuestos: {
            iva: config.impuesto_ventas || 16,
          },
          moneda: {
            simbolo: config.simbolo_moneda || '$',
            posicion: 'before', // no está en BD
          },
        });
      } catch (error) {
        console.log('No se pudo cargar configuración existente, usando valores por defecto');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentBusiness?.id]);

  const handleNotificationChange = (event) => {
    const { name, checked } = event.target;
    setSettings((prev) => ({
      ...prev,
      notificaciones: {
        ...prev.notificaciones,
        [name]: checked,
      },
    }));
  };

  const handleTaxChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({
      ...prev,
      impuestos: {
        ...prev.impuestos,
        [name]: value,
      },
    }));
  };

  const handleCurrencyChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({
      ...prev,
      moneda: {
        ...prev.moneda,
        [name]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      const backendData = {
        moneda: 'COP',
        simbolo_moneda: settings.moneda.simbolo,
        impuesto_ventas: parseFloat(settings.impuestos.iva) || 0,
        alertas_stock_bajo: settings.notificaciones.stockBajo,
        stock_minimo_global: 10,
        notificaciones_email: settings.notificaciones.nuevasVentas,
        tema_interfaz: 'light'
      };

      await api.put(`/configuracion/${currentBusiness.id}`, backendData);
      setSuccess('Configuración guardada exitosamente');
      setError('');
    } catch (error) {
      console.error('Error al guardar configuración:', error.response?.data || error.message);
      setError('Error al guardar la configuración: ' + (error.response?.data?.error || error.message));
      setSuccess('');
    }
  };

  if (!currentBusiness) {
    return (
      <Alert severity="info">
        Por favor, seleccione un negocio para gestionar la configuración.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom>
        Configuración
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Notificaciones
              </Typography>
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notificaciones.stockBajo}
                      onChange={handleNotificationChange}
                      name="stockBajo"
                    />
                  }
                  label="Alertas de stock bajo"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notificaciones.nuevasVentas}
                      onChange={handleNotificationChange}
                      name="nuevasVentas"
                    />
                  }
                  label="Notificar nuevas ventas"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notificaciones.reportesDiarios}
                      onChange={handleNotificationChange}
                      name="reportesDiarios"
                    />
                  }
                  label="Reportes diarios"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Impuestos
              </Typography>
              <TextField
                fullWidth
                label="IVA (%)"
                type="number"
                name="iva"
                value={settings.impuestos.iva}
                onChange={handleTaxChange}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Moneda
              </Typography>
              <TextField
                fullWidth
                label="Símbolo de moneda"
                name="simbolo"
                value={settings.moneda.simbolo}
                onChange={handleCurrencyChange}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          size="large"
        >
          Guardar Configuración
        </Button>
      </Box>
    </Box>
  );
}

export default Settings; 