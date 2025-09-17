import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth, googleProvider } from '../../config/firebase';
import {
  Box,
  Button,
  Typography,
  Alert,
  TextField,
  Tabs,
  Tab,
  Divider,
  InputAdornment,
  IconButton,
  Link,
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
import { usersService } from '../../services/firestoreService';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && children}
    </div>
  );
}

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [info, setInfo] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError('');
    setInfo('');
    setFormData({ email: '', password: '', confirmPassword: '', nombre: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveUserToDatabase = async (user) => {
    try {
      const userData = {
        email: user.email,
        nombre: user.displayName || formData.nombre || user.email.split('@')[0],
        foto_url: user.photoURL || null,
        created_at: new Date(),
      };

      // Guardar usuario en Firestore
      await usersService.create(userData);
      console.log('✅ Usuario guardado en Firestore');
    } catch (error) {
      console.error('Error al guardar usuario en Firestore:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
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
      console.error('Error en Google Sign In:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Inicio de sesión cancelado');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup bloqueado. Permite ventanas emergentes para este sitio');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('Dominio no autorizado. Contacta al administrador');
      } else {
        setError(`Error al iniciar sesión con Google: ${error.message}`);
      }
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
    setInfo('');
    try {
      const result = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = result.user;
      
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
          setError('Error al iniciar sesión');
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
    setInfo('');
    try {
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = result.user;
      
      await updateProfile(user, { displayName: formData.nombre });
      
      await saveUserToDatabase({ ...user, displayName: formData.nombre });
      
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
          setError('Error al crear la cuenta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Ingresa tu email para restablecer la contraseña');
      return;
    }
    setIsLoading(true);
    setError('');
    setInfo('');
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setInfo('Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja.');
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No existe un usuario con ese email');
          break;
        case 'auth/invalid-email':
          setError('Email inválido');
          break;
        default:
          setError('No se pudo enviar el correo de restablecimiento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: { xs: '0%', sm: '700px' },
          maxWidth: '500px',
          height: { xs: '20vh', sm: '0' },
          maxHeight: '120vh',
          backgroundColor: 'rgba(242, 242, 242, 0.72)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header - MÁS COMPACTO */}
        <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 1 }, flexShrink: 0 }}>
          <Box sx={{ mb: 2 }}>
            <img 
              src={logoZarzify} 
              alt="Zarzify Logo" 
              style={{ 
                width: '70px', 
                height: '70px',
                margin:0
              }}
            />
          </Box>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.7rem', sm: '1.9rem' },
              mb: 0.1,
            }}
          >
            Zarzify
          </Typography>
          <Typography
            variant="caption"
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              opacity: 1,
              padding:0
              
            }}
          >
            Sistema de Gestión de Inventario
          </Typography>
        </Box>

        {/* Mensajes */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 1.5,
              borderRadius: 2,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              flexShrink: 0,
              py: 0.5,
              '& .MuiAlert-message': {
                py: 0,
              },
            }}
          >
            {error}
          </Alert>
        )}
        {info && (
          <Alert
            severity="success"
            sx={{
              mb: 1.5,
              borderRadius: 2,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              flexShrink: 0,
              py: 0.5,
              '& .MuiAlert-message': {
                py: 0,
              },
            }}
          >
            {info}
          </Alert>
        )}

        {/* Tabs - MÁS COMPACTOS */}
        <Box sx={{ width: '100%', mb: 2, mt: -0.5, flexShrink: 0 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider',
              minHeight: 'auto',
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                height: 2,
              },
              '& .MuiTab-root': {
                minHeight: { xs: 36, sm: 40 },
                fontSize: { xs: '0.75rem', sm: '0.8rem' },
                textTransform: 'none',
                fontWeight: 600,
                py: 1,
              },
            }}
          >
            <Tab label="Iniciar Sesión" />
            <Tab label="Crear Cuenta" />
          </Tabs>
        </Box>

        {/* Forms Container - OPTIMIZADO PARA NO SCROLL */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Login Panel */}
          <TabPanel value={tabValue} index={0}>
            <Box 
              component="form" 
              onSubmit={handleEmailSignIn} 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1.2, sm: 1.5 },
                height: '100%',
                pt: 1, // Padding superior para que no se corten las etiquetas
              }}
            >
              <TextField
                required
                fullWidth
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" sx={{ fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: { xs: 40, sm: 44 },
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" sx={{ fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? 
                          <VisibilityOff sx={{ fontSize: '1rem' }} /> : 
                          <Visibility sx={{ fontSize: '1rem' }} />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: { xs: 40, sm: 44 },
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Link
                  component="button"
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  underline="hover"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  py: { xs: 1, sm: 1.2 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </Box>
          </TabPanel>

          {/* Register Panel */}
          <TabPanel value={tabValue} index={1}>
            <Box 
              component="form" 
              onSubmit={handleEmailSignUp} 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1, sm: 1 },
                height: '100%',
                pt: 1, // Padding superior para que no se corten las etiquetas
              }}
            >
              <TextField
                required
                fullWidth
                name="nombre"
                label="Nombre completo"
                value={formData.nombre}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" sx={{ fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: { xs: 38, sm: 42 },
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" sx={{ fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: { xs: 38, sm: 42 },
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="password"
                label="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" sx={{ fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? 
                          <VisibilityOff sx={{ fontSize: '1rem' }} /> : 
                          <Visibility sx={{ fontSize: '1rem' }} />
                        }
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: { xs: 38, sm: 42 },
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
              />
              <TextField
                required
                fullWidth
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                label="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" sx={{ fontSize: '1rem' }} />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: { xs: 38, sm: 42 },
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
                InputLabelProps={{
                  sx: {
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{ 
                  py: { xs: 1, sm: 1.2 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1565c0 0%, #7b1fa2 100%)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </Box>
          </TabPanel>
        </Box>

        {/* Botón para ir al landing */}
        <Box sx={{ mt: { xs: 1, sm: 1.5 }, flexShrink: 0, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/')}
            sx={{
              textTransform: 'none',
              fontSize: { xs: '0.75rem', sm: '0.8rem' },
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'transparent'
              }
            }}
          >
            ← Volver al inicio
          </Button>
        </Box>

        {/* Google Button - FOOTER FIJO Y COMPACTO */}
        <Box sx={{ mt: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
          <Divider sx={{ mb: { xs: 1, sm: 1.5 } }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                px: 1,
              }}
            >
              o continúa con
            </Typography>
          </Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon sx={{ fontSize: '1rem' }} />}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            sx={{
              py: { xs: 1, sm: 1.2 },
              textTransform: 'none',
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              fontWeight: 500,
              borderRadius: 2,
              borderColor: 'rgba(0, 0, 0, 0.12)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {isLoading ? 'Conectando...' : 'Google'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;