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
  Grid,
  Card,
  CardContent,
  Paper,
} from '@mui/material';
import { 
  Google as GoogleIcon, 
  Store as StoreIcon, 
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
} from '@mui/icons-material';
import api from '../../config/axios';
import logoZarzify from '../../logo zarzify.png';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const features = [
    {
      icon: <InventoryIcon sx={{ fontSize: 30 }} />,
      title: 'Gestión de Inventario',
      description: 'Control total de tu stock con alertas automáticas'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 30 }} />,
      title: 'Análisis de Ventas',
      description: 'Reportes detallados y gráficas interactivas'
    },
    {
      icon: <AssessmentIcon sx={{ fontSize: 30 }} />,
      title: 'Reportes Inteligentes',
      description: 'Exporta tus datos a PDF con un solo clic'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 30 }} />,
      title: 'Seguridad Garantizada',
      description: 'Tus datos protegidos con autenticación segura'
    }
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: theme.palette.grey[50],
      }}
    >
      <Grid container sx={{ minHeight: '100vh' }}>
        
        {/* Lado Izquierdo - Bienvenida */}
        {!isMobile && (
          <Grid item xs={12} md={7} lg={8}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                position: 'relative',
                overflow: 'hidden',
                color: 'white',
                px: 6,
              }}
            >
              {/* Elementos gráficos de fondo */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '10%',
                  left: '10%',
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  filter: 'blur(1px)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '60%',
                  right: '15%',
                  width: '150px',
                  height: '150px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  transform: 'rotate(45deg)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '20%',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.12)',
                }}
              />
              
              {/* Contenido principal */}
              <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px' }}>
                
                {/* Logo y título */}
                <Box sx={{ mb: 6 }}>
                  <img 
                    src={logoZarzify} 
                    alt="Zarzify Logo" 
                    style={{ width: '80px', height: '80px', marginBottom: '24px' }}
                  />
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      mb: 2,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    }}
                  >
                    ¡Bienvenido a Zarzify!
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 400,
                      opacity: 0.9,
                      fontSize: { xs: '1.2rem', md: '1.5rem' },
                      mb: 4,
                    }}
                  >
                    La plataforma todo-en-uno para gestionar tu negocio
                  </Typography>
                </Box>

                {/* Tarjetas de funcionalidades */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        sx={{
                          background: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            background: 'rgba(255, 255, 255, 0.2)',
                          }
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', p: 3 }}>
                          <Box sx={{ color: 'white', mb: 2 }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                {/* Estadísticas rápidas */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <SpeedIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      Rápido
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Configuración en 5 minutos
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                      <CloudIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                      En la Nube
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Accede desde cualquier lugar
                    </Typography>
                  </Box>
                </Box>

              </Box>
            </Box>
          </Grid>
        )}

        {/* Lado Derecho - Formulario */}
        <Grid item xs={12} md={5} lg={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              backgroundColor: theme.palette.background.paper,
              px: 4,
              py: 6,
            }}
          >
            <Paper
              elevation={isMobile ? 0 : 3}
              sx={{
                p: 4,
                width: '100%',
                maxWidth: 400,
                backgroundColor: isMobile ? 'transparent' : theme.palette.background.paper,
              }}
            >
              
              {/* Logo para móviles */}
              {isMobile && (
                <Box sx={{ textAlign: 'center', mb: 4 }}>
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
                    variant="body1"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    Sistema de Gestión de Inventario
                  </Typography>
                </Box>
              )}

              {/* Título de sección */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
                  mb: 1,
                  textAlign: 'center',
                }}
              >
                Iniciar Sesión
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.secondary,
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                Ingresa a tu cuenta para continuar
              </Typography>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Tabs de autenticación */}
              <Box sx={{ width: '100%', mb: 3 }}>
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
                      fontSize: '0.9rem',
                    }}
                  />
                  <Tab 
                    label="Crear Cuenta" 
                    sx={{ 
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: '0.9rem',
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 3 }}
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
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    sx={{ 
                      mb: 2, 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 2 }}
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
                    sx={{ mb: 3 }}
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
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                  </Button>
                </Box>
              </TabPanel>

              {/* Divider y Google */}
              <Divider sx={{ width: '100%', my: 3 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                  textTransform: 'none',
                  fontSize: '1rem',
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
                  mt: 4, 
                  textAlign: 'center',
                  color: 'text.secondary',
                  lineHeight: 1.6,
                }}
              >
                Al registrarte, aceptas nuestros{' '}
                <Typography component="span" color="primary" sx={{ fontWeight: 600 }}>
                  términos y condiciones
                </Typography>
              </Typography>

            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Login; 