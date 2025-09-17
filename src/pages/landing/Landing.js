import React, { useEffect, useRef } from 'react';
import { Box, Button, Container, Grid, Typography, Chip, Stack, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Inventory, 
  PointOfSale, 
  MoneyOff, 
  People, 
  Assessment, 
  Business,
  ArrowForward,
  Star,
  CheckCircle
} from '@mui/icons-material';

// Hook para animaciones con Intersection Observer
function useStaggerOnView(selector) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(selector);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, threshold: 0.1 }
    );

    elements.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index * 100, 800)}ms`;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [selector]);

  return containerRef;
}

function Landing() {
  const navigate = useNavigate();
  const staggerRef = useStaggerOnView('[data-stagger]');

  useEffect(() => {
    // Animaciones personalizadas sin AOS
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);

    // Observar elementos con data-animate
    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/login?mode=signup');

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      color: 'text.primary',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background animado */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 20%, rgba(25,118,210,0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(236,72,153,0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 60%, rgba(76,175,80,0.1) 0%, transparent 50%)
          `,
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '50%': { transform: 'translateY(-20px) rotate(1deg)' }
          }
        }}
      />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: 8, pb: 6 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box
              data-animate
              sx={{
                opacity: 0,
                transform: 'translateY(30px)',
                transition: 'all 0.8s ease-out'
              }}
            >
              <Typography
                variant="h1"
                sx={{ 
                  fontWeight: 900, 
                  fontSize: { xs: '3rem', md: '4rem' },
                  lineHeight: 1.1, 
                  mb: 2,
                  background: 'linear-gradient(45deg, #1976d2, #ec4899)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Zarzify
              </Typography>
              
              <Typography
                variant="h4"
                color="text.secondary"
                sx={{ mb: 3, fontWeight: 400 }}
              >
                Sistema de gestión empresarial completo
              </Typography>
              
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 4, opacity: 0.8 }}
              >
                Controla inventario, ventas, egresos, clientes y genera reportes en una sola plataforma
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={handleLogin}
                  endIcon={<ArrowForward />}
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    boxShadow: 3,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 6
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Iniciar sesión
                </Button>
                <Button 
                  variant="outlined" 
                  size="large" 
                  onClick={handleRegister}
                  sx={{ 
                    py: 1.5, 
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 3,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Registrarme
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                {['Inventario', 'Ventas', 'Egresos', 'Clientes', 'Reportes'].map((feat, i) => (
                  <Chip 
                    key={feat} 
                    label={feat} 
                    color={i % 2 ? 'primary' : 'secondary'} 
                    variant="filled"
                    sx={{ 
                      fontWeight: 600,
                      '&:hover': {
                        transform: 'scale(1.05)'
                      },
                      transition: 'transform 0.2s ease'
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box
              data-animate
              sx={{
                opacity: 0,
                transform: 'translateX(30px)',
                transition: 'all 0.8s ease-out 0.2s'
              }}
            >
              {/* Mockup realista estilo SaaS */}
              <Box sx={{ position: 'relative' }}>
                {/* Ilustración abstracta al fondo */}
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    inset: -24,
                    background:
                      'radial-gradient(600px 300px at 10% 10%, rgba(25,118,210,0.15), transparent 60%), radial-gradient(500px 260px at 90% 20%, rgba(236,72,153,0.12), transparent 60%)',
                    filter: 'blur(6px)'
                  }}
                />

                {/* Dispositivo / ventana de dashboard */}
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.18)',
                    border: '1px solid rgba(255,255,255,0.25)'
                  }}
                >
                  {/* Barra superior de ventana */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.2, bgcolor: 'background.paper' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#27c93f' }} />
                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>Zarzify Dashboard</Typography>
                  </Box>

                  {/* Contenido simulado */}
                  <Box sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.6)' }}>
                    <Grid container spacing={2}>
                      {/* Tarjetas resumen */}
                      {[ 'Ventas', 'Ingresos', 'Clientes', 'Stock' ].map((label, i) => (
                        <Grid item xs={6} key={label}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              background: 'linear-gradient(135deg, rgba(25,118,210,0.08), rgba(236,72,153,0.08))',
                              border: '1px solid rgba(0,0,0,0.06)'
                            }}
                          >
                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}> {['124','$12.4k','58','842'][i]} </Typography>
                          </Box>
                        </Grid>
                      ))}

                      {/* Gráfico simulado */}
                      <Grid item xs={12}>
                        <Box sx={{
                          height: 140,
                          borderRadius: 2,
                          background: 'linear-gradient(180deg, rgba(25,118,210,0.08), rgba(236,72,153,0.08))',
                          position: 'relative',
                          overflow: 'hidden',
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                          <Box sx={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 40px), repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 32px)'
                          }} />
                          <Box sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 16,
                            height: 60,
                            background: 'linear-gradient(90deg, rgba(25,118,210,0.45), rgba(236,72,153,0.45))',
                            clipPath: 'polygon(0% 70%, 10% 60%, 20% 70%, 30% 40%, 40% 50%, 50% 35%, 60% 55%, 70% 45%, 80% 65%, 90% 50%, 100% 60%)',
                            opacity: 0.8
                          }} />
                        </Box>
                      </Grid>

                      {/* Tabla simulada */}
                      <Grid item xs={12}>
                        <Box sx={{
                          borderRadius: 2,
                          border: '1px solid rgba(0,0,0,0.06)'
                        }}>
                          {[1,2,3,4].map((row) => (
                            <Box key={row} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 2, p: 1.2, bgcolor: row % 2 ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
                              <Typography variant="body2">Producto {row}</Typography>
                              <Typography variant="body2" color="text.secondary">Cat {row}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>$ {(row*12.5).toFixed(2)}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800, 
            mb: 6, 
            textAlign: 'center',
            dataAnimate: true,
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.8s ease-out'
          }}
        >
          Todo lo que necesitas para tu negocio
        </Typography>
        
        <Grid container spacing={4}>
          {[
            { icon: <Inventory />, title: 'Control de Inventario', desc: 'Administra productos, categorías y stock en tiempo real con alertas automáticas.' },
            { icon: <PointOfSale />, title: 'Ventas y Facturación', desc: 'Registra ventas rápidas, genera comprobantes y maneja diferentes métodos de pago.' },
            { icon: <MoneyOff />, title: 'Egresos y Gastos', desc: 'Registra y categoriza todos tus gastos para un control financiero completo.' },
            { icon: <People />, title: 'Gestión de Clientes', desc: 'Mantén un registro detallado de tus clientes y su historial de compras.' },
            { icon: <Assessment />, title: 'Reportes Avanzados', desc: 'Visualiza métricas importantes y exporta informes en PDF para análisis.' },
            { icon: <Business />, title: 'Multi-negocio', desc: 'Gestiona múltiples negocios desde una sola cuenta con total independencia.' },
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                data-animate
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 3,
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  opacity: 0,
                  transform: 'translateY(30px)',
                  transition: `all 0.6s ease-out ${idx * 0.1}s`,
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
                    background: 'rgba(255,255,255,0.08)'
                  }
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2, fontSize: '2.5rem' }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {feature.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 2 }}>
        <Card
          data-animate
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(25,118,210,0.1), rgba(236,72,153,0.1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            opacity: 0,
            transform: 'translateY(30px)',
            transition: 'all 0.8s ease-out'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            ¿Listo para transformar tu negocio?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Únete a cientos de empresarios que ya están usando Zarzify para hacer crecer sus negocios
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              size="large" 
              onClick={handleLogin}
              endIcon={<ArrowForward />}
              sx={{ 
                py: 1.5, 
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 3,
                boxShadow: 3
              }}
            >
              Iniciar sesión
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={handleRegister}
              sx={{ 
                py: 1.5, 
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 3,
                borderWidth: 2
              }}
            >
              Registrarme
            </Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}

export default Landing;