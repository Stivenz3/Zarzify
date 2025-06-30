import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  TextField,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  Google as GoogleIcon, 
  Store as StoreIcon, 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
} from '@mui/icons-material';
import api from '../../config/axios';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estados para el formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      nombre: '',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveUserToDatabase = async (user) => {
    try {
      await api.post('/usuarios', {
        id: user.uid,
        email: user.email,
        nombre: user.displayName || formData.nombre || user.email.split('@')[0],
        foto_url: user.photoURL || null,
      });
    } catch (error) {
      console.error('Error al guardar usuario en BD:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Guardar usuario en la base de datos
      await saveUserToDatabase(user);
      
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));

      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Error al iniciar sesión con Google. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Por favor, completa todos los campos');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = result.user;
      
      // Guardar usuario en la base de datos
      await saveUserToDatabase(user);
      
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));

      navigate('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Usuario no encontrado');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta');
          break;
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        default:
          setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.nombre) {
      setError('Por favor, completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = result.user;
      
      // Actualizar el perfil con el nombre
      await updateProfile(user, {
        displayName: formData.nombre
      });
      
      // Guardar usuario en la base de datos
      await saveUserToDatabase({
        ...user,
        displayName: formData.nombre
      });
      
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: formData.nombre,
        photoURL: user.photoURL,
      }));

      navigate('/dashboard');
    } catch (error) {
      console.error('Error al crear cuenta:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Este email ya está registrado');
          break;
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        case 'auth/weak-password':
          setError('La contraseña es muy débil');
          break;
        default:
          setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              padding: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
                flexDirection: 'column',
              }}
            >
              <StoreIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              />
              <Typography
                component="h1"
                variant={isMobile ? 'h5' : 'h4'}
                sx={{
                  fontWeight: 'bold',
                  color: theme.palette.primary.main,
                  textAlign: 'center',
                }}
              >
                Zarzify
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1, textAlign: 'center' }}
              >
                Sistema de Gestión de Inventario
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  width: '100%',
                  borderRadius: 1,
                }}
              >
                {error}
              </Alert>
            )}

            {/* Tabs de autenticación */}
            <Box sx={{ width: '100%', mb: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="Iniciar Sesión" />
                <Tab label="Crear Cuenta" />
              </Tabs>
            </Box>

            {/* Panel de Iniciar Sesión */}
            <TabPanel value={tabValue} index={0}>
              <Box component="form" onSubmit={handleEmailSignIn} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </Box>
            </TabPanel>

            {/* Panel de Crear Cuenta */}
            <TabPanel value={tabValue} index={1}>
              <Box component="form" onSubmit={handleEmailSignUp} sx={{ width: '100%' }}>
                <TextField
                  fullWidth
                  name="nombre"
                  label="Nombre completo"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  label="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ py: 1.5, mb: 2 }}
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </Box>
            </TabPanel>

            {/* Divider y Google */}
            <Divider sx={{ width: '100%', my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                o
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              sx={{
                py: 1.5,
                backgroundColor: '#fff',
                color: '#757575',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                },
                border: '1px solid #dadce0',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                boxShadow: 1,
              }}
            >
              {isLoading ? 'Conectando...' : 'Continuar con Google'}
            </Button>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 3, textAlign: 'center' }}
            >
              Al registrarte, aceptas nuestros términos y condiciones
            </Typography>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default Login; 