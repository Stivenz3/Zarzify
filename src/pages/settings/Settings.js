import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Grid,
  Divider,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Palette as PaletteIcon,
  AttachMoney as MoneyIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { getCurrencyOptions, formatCurrency } from '../../utils/currency';
import { businessesService } from '../../services/firestoreService';

function Settings() {
  const { currentBusiness, darkMode, toggleDarkMode, loadBusinesses, refreshCurrentBusiness, setCurrentBusiness } = useApp();
  const [businessSettings, setBusinessSettings] = useState({
    divisa: 'COP',
    impuesto_default: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentBusiness) {
      setBusinessSettings({
        divisa: currentBusiness.moneda || 'COP',
        impuesto_default: currentBusiness.impuesto_default || 0,
      });
    }
  }, [currentBusiness]);

  const handleSaveSettings = async () => {
    if (!currentBusiness) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await businessesService.update(currentBusiness.id, {
        nombre: currentBusiness.nombre,
        direccion: currentBusiness.direccion,
        telefono: currentBusiness.telefono,
        moneda: businessSettings.divisa,
        impuesto_default: businessSettings.impuesto_default,
      });

      setSuccess('Configuración guardada exitosamente');
      
      
      // Actualizar el negocio actual localmente con los nuevos datos
      const updatedBusiness = {
        ...currentBusiness,
        moneda: businessSettings.divisa,
        impuesto_default: businessSettings.impuesto_default,
      };
      
      
      // Actualizar el contexto global
      setCurrentBusiness(updatedBusiness);
      
      // También refrescar desde el servidor para asegurar consistencia
      await refreshCurrentBusiness();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error al guardar configuración:', err);
      setError('Error al guardar la configuración');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const currencyOptions = getCurrencyOptions();
  const selectedCurrency = currencyOptions.find(c => c.value === businessSettings.divisa);

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Selecciona un negocio para acceder a la configuración
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          <SettingsIcon sx={{ fontSize: 40, mr: 2, verticalAlign: 'middle' }} />
          Configuración
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gestiona la configuración de tu negocio y preferencias del sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configuración del Negocio */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BusinessIcon sx={{ fontSize: 28, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Configuración del Negocio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentBusiness.nombre}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Divisa del Negocio</InputLabel>
                  <Select
                    value={businessSettings.divisa}
                    onChange={(e) => setBusinessSettings({ 
                      ...businessSettings, 
                      divisa: e.target.value 
                    })}
                    label="Divisa del Negocio"
                  >
                    {currencyOptions.map((currency) => (
                      <MenuItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider', 
                  borderRadius: 1,
                  bgcolor: 'action.hover'
                }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Vista Previa
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MoneyIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6">
                      {formatCurrency(1234567.89, businessSettings.divisa)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Así se mostrarán los precios en tu sistema
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveSettings}
                    disabled={loading}
                    sx={{ px: 4 }}
                  >
                    {loading ? 'Guardando...' : 'Guardar Configuración'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Configuración de Apariencia */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PaletteIcon sx={{ fontSize: 28, mr: 2, color: 'secondary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Apariencia
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleDarkMode}
                  color="primary"
                />
              }
              label="Modo Oscuro"
              sx={{ mb: 2 }}
            />

            <Typography variant="body2" color="text.secondary">
              Cambia entre el tema claro y oscuro de la aplicación
            </Typography>
          </Paper>

          {/* Información de la Divisa */}
          {selectedCurrency && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Información de Divisa
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Código
                </Typography>
                <Typography variant="h6">
                  {selectedCurrency.value}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre
                </Typography>
                <Typography>
                  {selectedCurrency.label.split(' (')[0]}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Símbolo
                </Typography>
                <Typography variant="h4" sx={{ color: 'primary.main' }}>
                  {selectedCurrency.symbol}
                </Typography>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

export default Settings;