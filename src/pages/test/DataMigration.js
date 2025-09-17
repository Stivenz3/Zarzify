import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { migrateSampleData, checkIfDataExists } from '../../utils/migrateLocalData';

function DataMigration() {
  const { currentBusiness, user } = useApp();
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [dataStatus, setDataStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentBusiness) {
      checkDataStatus();
    }
  }, [currentBusiness]);

  const checkDataStatus = async () => {
    if (!currentBusiness) return;
    
    setLoading(true);
    setError('');
    try {
      const status = await checkIfDataExists(currentBusiness.id);
      setDataStatus(status);
    } catch (error) {
      console.error('Error verificando datos:', error);
      setError('Error al verificar datos existentes');
    } finally {
      setLoading(false);
    }
  };

  const handleMigrateData = async () => {
    if (!currentBusiness || !user) {
      setError('No hay negocio o usuario seleccionado');
      return;
    }

    setMigrating(true);
    setError('');
    setSuccess('');

    try {
      const success = await migrateSampleData(user.uid, currentBusiness.id);
      if (success) {
        setSuccess('Datos migrados exitosamente!');
        await checkDataStatus(); // Actualizar estado
      } else {
        setError('Error durante la migración');
      }
    } catch (error) {
      console.error('Error migrando datos:', error);
      setError('Error durante la migración: ' + error.message);
    } finally {
      setMigrating(false);
    }
  };

  if (!currentBusiness) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Selecciona un negocio para verificar y migrar datos
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        📊 Migración de Datos a Firestore
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Negocio: <strong>{currentBusiness.nombre}</strong> (ID: {currentBusiness.id})
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
        {/* Estado de Datos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Estado de Datos
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={checkDataStatus}
                  disabled={loading}
                  size="small"
                >
                  {loading ? <CircularProgress size={20} /> : 'Verificar'}
                </Button>
              </Box>

              {dataStatus ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {dataStatus.hasProducts ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                    <Typography sx={{ ml: 1 }}>
                      Productos: {dataStatus.counts.products}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {dataStatus.hasClients ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                    <Typography sx={{ ml: 1 }}>
                      Clientes: {dataStatus.counts.clients}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {dataStatus.hasCategories ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                    <Typography sx={{ ml: 1 }}>
                      Categorías: {dataStatus.counts.categories}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {dataStatus.hasProducts && dataStatus.hasClients && dataStatus.hasCategories ? (
                    <Chip 
                      label="Datos completos" 
                      color="success" 
                      icon={<CheckIcon />}
                    />
                  ) : (
                    <Chip 
                      label="Datos incompletos" 
                      color="warning" 
                      icon={<ErrorIcon />}
                    />
                  )}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  {loading ? 'Verificando...' : 'Haz clic en "Verificar" para ver el estado'}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Migración de Datos */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Migrar Datos de Ejemplo
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Este botón creará datos de ejemplo en Firestore para probar la aplicación:
              </Typography>
              
              <ul style={{ fontSize: '0.875rem', color: '#666', marginBottom: '16px' }}>
                <li>2 categorías (Electrónicos, Ropa, Hogar)</li>
                <li>2 productos (Laptop Dell, Camiseta Básica)</li>
                <li>2 clientes (Juan Pérez, María García)</li>
              </ul>

              <Button
                variant="contained"
                startIcon={migrating ? <CircularProgress size={20} /> : <UploadIcon />}
                onClick={handleMigrateData}
                disabled={migrating}
                fullWidth
              >
                {migrating ? 'Migrando...' : 'Migrar Datos de Ejemplo'}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Instrucciones
          </Typography>
          <Typography variant="body2">
            1. <strong>Verificar:</strong> Revisa qué datos ya existen en Firestore<br/>
            2. <strong>Migrar:</strong> Si no hay datos, crea datos de ejemplo para probar<br/>
            3. <strong>Probar:</strong> Ve a las páginas de Productos, Clientes, etc. para verificar que funcionen<br/>
            4. <strong>Firebase Console:</strong> Verifica en <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a> que aparezcan las colecciones
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DataMigration;
