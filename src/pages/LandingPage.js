import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Rating,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Cloud as CloudIcon,
  Star as StarIcon,
  ArrowForward as ArrowForwardIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import AOS from 'aos';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
    });
  }, []);

  const features = [
    {
      icon: <InventoryIcon sx={{ fontSize: 40 }} />,
      title: "Control de Inventario",
      description: "Gestiona tu stock en tiempo real con alertas automáticas de productos agotados",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      title: "Reportes Avanzados",
      description: "Visualiza las tendencias de tu negocio con gráficos interactivos y métricas clave",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
      title: "Dashboard Inteligente",
      description: "Panel de control que se actualiza automáticamente con la información más relevante",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Seguridad Total",
      description: "Tus datos protegidos con encriptación de nivel bancario y respaldos automáticos",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: "Ultra Rápido",
      description: "Interfaz optimizada que responde instantáneamente a cada acción",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    {
      icon: <CloudIcon sx={{ fontSize: 40 }} />,
      title: "En la Nube",
      description: "Accede desde cualquier dispositivo, en cualquier lugar del mundo",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      business: "Ferretería Central",
      rating: 5,
      comment: "Zarzify revolucionó mi negocio. Ahora controlo todo mi inventario desde mi celular.",
      avatar: "MG"
    },
    {
      name: "Carlos Rodríguez",
      business: "Supermercado Familiar",
      rating: 5,
      comment: "Los reportes son increíbles. Puedo ver exactamente qué productos vender más.",
      avatar: "CR"
    },
    {
      name: "Ana Martínez",
      business: "Boutique Eleganza",
      rating: 5,
      comment: "Interface súper fácil de usar. Mi equipo aprendió en menos de una hora.",
      avatar: "AM"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Negocios Activos" },
    { number: "500K+", label: "Productos Gestionados" },
    { number: "99.9%", label: "Uptime Garantizado" },
    { number: "24/7", label: "Soporte Técnico" }
  ];

  const handleGetStarted = () => {
    // Forzar navegación a login con window.location como fallback
    try {
      navigate('/login');
    } catch (error) {
      window.location.href = '/login';
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box data-aos="fade-right">
                <Chip
                  label="🚀 Sistema de Gestión Completo"
                  sx={{
                    mb: 3,
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    backdropFilter: 'blur(10px)',
                  }}
                />
                
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '4rem' },
                    fontWeight: 900,
                    color: 'white',
                    mb: 3,
                    lineHeight: 1.1,
                  }}
                >
                  Revoluciona
                  <Box component="span" sx={{ display: 'block', color: '#FFD700' }}>
                    Tu Negocio
                  </Box>
                  con Zarzify
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 4,
                    fontWeight: 400,
                    lineHeight: 1.6,
                  }}
                >
                  El sistema de gestión de inventario más inteligente del mercado.
                  Controla ventas, stock y reportes desde una sola plataforma.
                </Typography>

                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '1.3rem',
                    textTransform: 'none',
                    boxShadow: '0 10px 40px rgba(255, 107, 107, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 15px 50px rgba(255, 107, 107, 0.4)',
                    },
                  }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Ingresar a Zarzify
                </Button>

                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', mr: 1 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} sx={{ color: '#FFD700', fontSize: '1.2rem' }} />
                    ))}
                  </Box>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    5.0 • Más de 1,000 reseñas
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                data-aos="fade-left"
                sx={{
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                {/* Dashboard Preview */}
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    p: 3,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    animation: 'float 4s ease-in-out infinite',
                  }}
                >
                  <StoreIcon sx={{ fontSize: 80, color: 'white', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                    Dashboard en Tiempo Real
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>
                    Monitorea tu negocio 24/7
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Floating CSS Animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
          }
        `}</style>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, background: 'rgba(102, 126, 234, 0.05)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  sx={{ textAlign: 'center' }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 12, background: 'white' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              data-aos="fade-up"
              sx={{
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Funcionalidades Épicas
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Todo lo que necesitas para hacer crecer tu negocio
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: feature.gradient,
                    }}
                  />
                  <CardContent sx={{ p: 4 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: feature.gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: 'white',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 12, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              data-aos="fade-up"
              sx={{
                fontWeight: 800,
                mb: 3,
                color: '#2c3e50',
              }}
            >
              Lo Que Dicen Nuestros Clientes
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  data-aos="fade-up"
                  data-aos-delay={index * 200}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 25px 70px rgba(0, 0, 0, 0.15)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        mr: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 700,
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.business}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  
                  <Typography
                    sx={{
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: 'text.secondary',
                    }}
                  >
                    "{testimonial.comment}"
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 12,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Box data-aos="fade-up">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: 'white',
                mb: 3,
              }}
            >
              ¿Listo Para Revolucionar Tu Negocio?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Únete a miles de empresarios que ya están creciendo con Zarzify.
              Prueba gratis por 30 días, sin tarjeta de crédito.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                px: 6,
                py: 2,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: '1.3rem',
                textTransform: 'none',
                boxShadow: '0 10px 40px rgba(255, 107, 107, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 15px 50px rgba(255, 107, 107, 0.4)',
                },
              }}
              endIcon={<ArrowForwardIcon />}
            >
              Comenzar Ahora Gratis
            </Button>

            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mt: 3,
                fontSize: '0.9rem',
              }}
            >
              ✓ Sin tarjeta de crédito  ✓ Configuración en 2 minutos  ✓ Soporte 24/7
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, background: '#2c3e50', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Zarzify
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
            El futuro de la gestión empresarial está aquí
          </Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>
            © 2025 Zarzify. Todos los derechos reservados.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 