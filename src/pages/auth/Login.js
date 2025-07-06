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
  Typography,
  Alert,
  useTheme,
  useMediaQuery,
  TextField,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import { 
  Google as GoogleIcon, 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
} from '@mui/icons-material';
import api from '../../config/axios';
import logoZarzify from '../../logo zarzify.png';
import fondoLogin from '../../FONDO LOGIN.png';

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
        <Box sx={{ pt: 2 }}>
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
        height: '100vh',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundImage: `url(${fondoLogin})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: 'blur(6px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1,
        },
      }}
    >
      <Card
        elevation={24}
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: 400,
          mx: 2,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(15px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          {/* Logo y título */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <img 
              src={logoZarzify} 
              alt="Zarzify Logo" 
              style={{ width: '60px', height: '60px', marginBottom: '16px' }}
            />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                mb: 1,
              }}
            >
              Zarzify
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                color: theme.palette.text.secondary,
                fontSize: '0.9rem',
              }}
            >
              Sistema de Gestión de Inventario
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2,
                fontSize: '0.875rem',
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
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTabs-indicator': {
                  backgroundColor: theme.palette.primary.main,
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab 
                label="Iniciar Sesión" 
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              />
              <Tab 
                label="Crear Cuenta" 
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              />
            </Tabs>
          </Box>

          {/* Panel de Iniciar Sesión */}
          <TabPanel value={tabValue} index={0}>
            <Box component="form" onSubmit={handleEmailSignIn} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                autoFocus
                size="small"
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="current-password"
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
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
                sx={{ 
                  mb: 2, 
                  py: 1.2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Box>
          </TabPanel>

          {/* Panel de Crear Cuenta */}
          <TabPanel value={tabValue} index={1}>
            <Box component="form" onSubmit={handleEmailSignUp} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                autoComplete="name"
                autoFocus
                size="small"
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                size="small"
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                size="small"
                sx={{ mb: 1.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                size="small"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  mb: 2, 
                  py: 1.2,
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                }}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </Box>
          </TabPanel>

          {/* Divider y Google */}
          <Divider sx={{ width: '100%', my: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
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
              py: 1.2,
              textTransform: 'none',
              fontSize: '0.95rem',
              fontWeight: 500,
              borderColor: theme.palette.divider,
              color: theme.palette.text.primary,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.primary.main + '08',
              },
            }}
          >
            {isLoading ? 'Conectando...' : 'Continuar con Google'}
          </Button>

          <Typography
            variant="body2"
            sx={{ 
              mt: 2, 
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.75rem',
              lineHeight: 1.4,
            }}
          >
            Al registrarte, aceptas nuestros{' '}
            <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
              términos y condiciones
            </Typography>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Login; 