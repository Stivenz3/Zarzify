import React, { useState } from 'react';
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
  const [settings, setSettings] = useState({
    notificaciones: {
      stockBajo: true,
      nuevasVentas: true,
      reportesDiarios: false,
    },
    impuestos: {
      iva: 16,
      ieps: 0,
    },
    moneda: {
      simbolo: '$',
      posicion: 'before',
    },
    impresion: {
      formatoTicket: 'termica',
      impresora: 'default',
      copias: 1,
    },
  });

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

  const handlePrintingChange = (event) => {
    const { name, value } = event.target;
    setSettings((prev) => ({
      ...prev,
      impresion: {
        ...prev.impresion,
        [name]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await api.put(`/settings/${currentBusiness.id}`, settings);
      setSuccess('Configuración guardada exitosamente');
      setError('');
    } catch (error) {
      setError('Error al guardar la configuración');
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
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="IVA (%)"
                    type="number"
                    name="iva"
                    value={settings.impuestos.iva}
                    onChange={handleTaxChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="IEPS (%)"
                    type="number"
                    name="ieps"
                    value={settings.impuestos.ieps}
                    onChange={handleTaxChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Moneda
              </Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Símbolo"
                    name="simbolo"
                    value={settings.moneda.simbolo}
                    onChange={handleCurrencyChange}
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Posición</InputLabel>
                    <Select
                      name="posicion"
                      value={settings.moneda.posicion}
                      onChange={handleCurrencyChange}
                      label="Posición"
                    >
                      <MenuItem value="before">Antes del monto</MenuItem>
                      <MenuItem value="after">Después del monto</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Impresión
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Formato de Ticket</InputLabel>
                    <Select
                      name="formatoTicket"
                      value={settings.impresion.formatoTicket}
                      onChange={handlePrintingChange}
                      label="Formato de Ticket"
                    >
                      <MenuItem value="termica">Impresora Térmica</MenuItem>
                      <MenuItem value="carta">Tamaño Carta</MenuItem>
                      <MenuItem value="media">Media Carta</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Copias por impresión"
                    type="number"
                    name="copias"
                    value={settings.impresion.copias}
                    onChange={handlePrintingChange}
                  />
                </Grid>
              </Grid>
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