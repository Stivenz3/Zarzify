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
import { userService } from '../../services/firestoreService';

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
      // Usar el nuevo servicio de usuarios
      await userService.createUserFromAuth(user);
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
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 },
        background: 'linear-gradient(135deg, rgba(25,118,210,0.1), rgba(236,72,153,0.1))'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: { xs: '100%', sm: '500px' },
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          p: { xs: 3, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3, flexShrink: 0 }}>
          <Box sx={{ mb: 2 }}>
            <img 
              src={logoZarzify} 
              alt="Zarzify Logo" 
              style={{ 
                width: '60px', 
                height: '60px',
                margin: 0,
                borderRadius: '50%',
                boxShadow: '0 4px 16px rgba(25,118,210,0.3)'
              }}
            />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.8rem', sm: '2.2rem' },
              mb: 0.5,
            }}
          >
            Zarzify
          </Typography>
          <Typography
            variant="body2"
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.8rem', sm: '0.9rem' },
              opacity: 0.8
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
              mb: 2,
              borderRadius: 2,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              flexShrink: 0,
              py: 1,
            }}
          >
            {error}
          </Alert>
        )}
        {info && (
          <Alert
            severity="success"
            sx={{
              mb: 2,
              borderRadius: 2,
              fontSize: { xs: '0.8rem', sm: '0.85rem' },
              flexShrink: 0,
              py: 1,
            }}
          >
            {info}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ width: '100%', mb: 3, flexShrink: 0 }}>
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
                height: 3,
              },
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: { xs: '0.9rem', sm: '1rem' },
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: 56,
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
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: 56,
                  },
                }}
              />
              <Box sx={{ textAlign: 'right', mb: 1 }}>
                <Link
                  component="button"
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  underline="hover"
                  sx={{ fontSize: '0.9rem' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                size="large"
                sx={{ 
                  py: 1.5,
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: 56,
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: 56,
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
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: 56,
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2, 
                    height: 56,
                  },
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                size="large"
                sx={{ 
                  py: 1.5,
                  fontSize: '1rem',
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
        <Box sx={{ mt: 2, flexShrink: 0, textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/')}
            sx={{
              textTransform: 'none',
              fontSize: '0.9rem',
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

        {/* Google Button */}
        <Box sx={{ mt: 2, flexShrink: 0 }}>
          <Divider sx={{ mb: 2 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'text.secondary', 
                fontSize: '0.9rem',
                px: 2,
              }}
            >
              O continúa con
            </Typography>
          </Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            size="large"
            sx={{
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 600,
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
            {isLoading ? 'Conectando...' : 'Continuar con Google'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default Login;