import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { db } from '../../config/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useApp } from '../../context/AppContext';

function SimpleTest() {
  const { currentBusiness } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setError('');
    setResult('');

    try {
      console.log('🔍 Iniciando prueba de conexión...');
      console.log('📊 Firebase config:', {
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      });
      console.log('🏢 Business actual:', currentBusiness);

      // Probar conexión básica
      const testCollection = collection(db, 'test');
      console.log('📝 Colección test creada:', testCollection);

      // Intentar agregar un documento
      const docRef = await addDoc(testCollection, {
        message: 'Hola desde Vercel!',
        timestamp: new Date(),
        business_id: currentBusiness?.id || 'no-business',
        test: true
      });
      
      console.log('✅ Documento creado con ID:', docRef.id);
      setResult(`✅ Éxito! Documento creado con ID: ${docRef.id}`);

      // Intentar leer documentos
      const snapshot = await getDocs(testCollection);
      console.log('📖 Documentos encontrados:', snapshot.size);
      
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('📋 Datos:', docs);
      setResult(prev => prev + `\n📖 Documentos leídos: ${docs.length}`);

    } catch (error) {
      console.error('❌ Error en prueba:', error);
      setError(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔧 Prueba Simple de Firestore
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Información de Debug
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            <strong>Business ID:</strong> {currentBusiness?.id || 'No seleccionado'}<br/>
            <strong>Project ID:</strong> {process.env.REACT_APP_FIREBASE_PROJECT_ID}<br/>
            <strong>Auth Domain:</strong> {process.env.REACT_APP_FIREBASE_AUTH_DOMAIN}<br/>
            <strong>NODE_ENV:</strong> {process.env.NODE_ENV}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Prueba de Conexión
          </Typography>
          
          <Button
            variant="contained"
            onClick={testConnection}
            disabled={loading || !currentBusiness}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Probar Conexión'}
          </Button>

          {!currentBusiness && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Selecciona un negocio primero
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Alert severity="success">
              <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                {result}
              </pre>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Instrucciones
          </Typography>
          <Typography variant="body2">
            1. Abre la consola del navegador (F12)<br/>
            2. Haz clic en "Probar Conexión"<br/>
            3. Revisa los logs en la consola<br/>
            4. Verifica en Firebase Console > Firestore si aparece la colección "test"
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SimpleTest;
