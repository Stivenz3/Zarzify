import React, { useEffect, useRef, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Chip, 
  Stack, 
  Card, 
  Avatar,
  Rating,
  Fade,
  Grow
} from '@mui/material';
import { 
  Inventory, 
  PointOfSale, 
  MoneyOff, 
  People, 
  Assessment, 
  Business,
  ArrowForward,
  Star,
  CheckCircle,
  TrendingUp,
  Security,
  Speed,
  CloudDone,
  PlayArrow
} from '@mui/icons-material';

// Hook mejorado para animaciones
function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, {
      threshold: 0.1,
      rootMargin: '-50px',
      ...options
    });

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return [targetRef, isIntersecting];
}

// Componente de contador animado
function AnimatedCounter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useIntersectionObserver();

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// Componente de partículas flotantes
function FloatingParticles() {
  return (
    <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {[...Array(15)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            backgroundColor: i % 3 === 0 ? 'primary.main' : i % 3 === 1 ? 'secondary.main' : 'success.main',
            borderRadius: '50%',
            opacity: 0.1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `float-${i} ${Math.random() * 10 + 15}s ease-in-out infinite`,
            '@keyframes float-0, @keyframes float-1, @keyframes float-2, @keyframes float-3, @keyframes float-4, @keyframes float-5, @keyframes float-6, @keyframes float-7, @keyframes float-8, @keyframes float-9, @keyframes float-10, @keyframes float-11, @keyframes float-12, @keyframes float-13, @keyframes float-14': {
              '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
              '33%': { transform: `translateY(${Math.random() * 30 - 15}px) translateX(${Math.random() * 30 - 15}px)` },
              '66%': { transform: `translateY(${Math.random() * 30 - 15}px) translateX(${Math.random() * 30 - 15}px)` }
            }
          }}
        />
      ))}
    </Box>
  );
}

function Landing() {
  const [heroRef, heroVisible] = useIntersectionObserver();
  const [featuresRef, featuresVisible] = useIntersectionObserver();
  const [statsRef, statsVisible] = useIntersectionObserver();

  const handleLogin = () => console.log('Login');
  const handleRegister = () => console.log('Register');

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      color: 'text.primary',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <FloatingParticles />

      {/* Background mejorado con glassmorphism */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 20% -20%, rgba(120, 119, 198, 0.3), transparent),
            radial-gradient(ellipse 80% 50% at 80% -20%, rgba(255, 119, 198, 0.3), transparent),
            radial-gradient(ellipse 80% 50% at 40% 120%, rgba(120, 200, 255, 0.3), transparent)
          `,
          animation: 'backgroundMove 20s ease-in-out infinite',
          '@keyframes backgroundMove': {
            '0%, 100%': { filter: 'hue-rotate(0deg)' },
            '50%': { filter: 'hue-rotate(45deg)' }
          }
        }}
      />

      {/* Hero Section Mejorado */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: 8, pb: 8 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Fade in={heroVisible} timeout={1000}>
              <Box ref={heroRef}>
                {/* Badge de novedad */}
                <Chip 
                  label="🚀 Nuevo: Dashboard con IA" 
                  variant="outlined"
                  sx={{ 
                    mb: 3,
                    backdropFilter: 'blur(10px)',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    animation: 'pulse 2s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.05)' }
                    }
                  }} 
                />

                <Typography
                  variant="h1"
                  sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '3rem', md: '4.5rem' },
                    lineHeight: 1.1, 
                    mb: 2,
                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: 0,
                      width: '60%',
                      height: 4,
                      background: 'linear-gradient(90deg, #667eea, #764ba2)',
                      borderRadius: 2,
                      animation: 'expandWidth 1s ease-out 0.5s both',
                      '@keyframes expandWidth': {
                        from: { width: 0 },
                        to: { width: '60%' }
                      }
                    }
                  }}
                >
                  Zarzify
                </Typography>
                
                <Typography
                  variant="h4"
                  color="text.secondary"
                  sx={{ 
                    mb: 3, 
                    fontWeight: 400,
                    opacity: 0,
                    animation: 'fadeInUp 1s ease-out 0.3s both',
                    '@keyframes fadeInUp': {
                      from: { opacity: 0, transform: 'translateY(30px)' },
                      to: { opacity: 1, transform: 'translateY(0)' }
                    }
                  }}
                >
                  La suite empresarial que potencia tu negocio
                </Typography>
                
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ 
                    mb: 4, 
                    opacity: 0.8,
                    animation: 'fadeInUp 1s ease-out 0.6s both'
                  }}
                >
                  Inventario inteligente, ventas automatizadas, reportes en tiempo real y mucho más
                </Typography>

                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  sx={{ 
                    mb: 4,
                    opacity: 0,
                    animation: 'fadeInUp 1s ease-out 0.9s both'
                  }}
                >
                  <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleLogin}
                    endIcon={<PlayArrow />}
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      fontSize: '1.1rem',
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.37)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        transition: 'left 0.5s ease',
                      },
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
                        '&::before': {
                          left: '100%'
                        }
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Ver Demo
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
                      backdropFilter: 'blur(10px)',
                      background: 'rgba(255,255,255,0.05)',
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-3px)',
                        background: 'rgba(255,255,255,0.1)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Prueba Gratis
                  </Button>
                </Stack>

                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {[
                    { number: "500", suffix: "+", label: "Empresas" },
                    { number: "50", suffix: "K+", label: "Productos" },
                    { number: "99.9", suffix: "%", label: "Uptime" }
                  ].map((stat, i) => (
                    <Grid item xs={4} key={stat.label}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main' }}>
                          <AnimatedCounter end={parseInt(stat.number)} suffix={stat.suffix} />
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stat.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" gap={1}>
                  {[
                    { label: 'Inventario IA', icon: <Inventory sx={{ fontSize: 16 }} /> },
                    { label: 'Ventas Cloud', icon: <CloudDone sx={{ fontSize: 16 }} /> },
                    { label: 'Reportes RT', icon: <TrendingUp sx={{ fontSize: 16 }} /> },
                    { label: 'Seguro SSL', icon: <Security sx={{ fontSize: 16 }} /> }
                  ].map((feat, i) => (
                    <Chip 
                      key={feat.label}
                      icon={feat.icon}
                      label={feat.label} 
                      variant="filled"
                      sx={{ 
                        fontWeight: 600,
                        backdropFilter: 'blur(10px)',
                        background: i % 2 ? 'rgba(102, 126, 234, 0.15)' : 'rgba(118, 75, 162, 0.15)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                          transform: 'scale(1.05) translateY(-2px)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Fade>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Grow in={heroVisible} timeout={1500}>
              <Box sx={{ position: 'relative' }}>
                {/* Glow effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: -40,
                    background: 'radial-gradient(ellipse, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                    animation: 'glow 4s ease-in-out infinite alternate'
                  }}
                />

                {/* Dashboard mockup mejorado */}
                <Card
                  sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.25)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(255,255,255,0.05)',
                    transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)',
                    '&:hover': {
                      transform: 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale(1.02)',
                    },
                    transition: 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)'
                  }}
                >
                  {/* Barra superior mejorada */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    p: 2, 
                    background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))'
                  }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#27c93f' }} />
                    </Box>
                    <Typography variant="body2" sx={{ ml: 2, fontWeight: 600 }}>
                      Zarzify Dashboard Pro
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip size="small" label="LIVE" color="success" />
                    </Box>
                  </Box>

                  {/* Contenido del dashboard */}
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {/* KPI Cards mejoradas */}
                      {[
                        { label: 'Ventas Hoy', value: '$12,847', change: '+12%', icon: <TrendingUp /> },
                        { label: 'Órdenes', value: '324', change: '+8%', icon: <PointOfSale /> },
                        { label: 'Productos', value: '1,247', change: '+3%', icon: <Inventory /> },
                        { label: 'Clientes', value: '856', change: '+15%', icon: <People /> }
                      ].map((kpi, i) => (
                        <Grid item xs={6} key={kpi.label}>
                          <Card
                            sx={{
                              p: 2,
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 2,
                              position: 'relative',
                              overflow: 'hidden',
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 2,
                                background: `linear-gradient(90deg, ${i % 2 ? '#667eea' : '#764ba2'}, transparent)`
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {kpi.label}
                              </Typography>
                              <Box sx={{ color: 'success.main', fontSize: '1rem' }}>
                                {kpi.icon}
                              </Box>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                              {kpi.value}
                            </Typography>
                            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                              {kpi.change}
                            </Typography>
                          </Card>
                        </Grid>
                      ))}

                      {/* Gráfico animado */}
                      <Grid item xs={12}>
                        <Card sx={{
                          p: 2,
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2
                        }}>
                          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            Ventas de la Semana
                          </Typography>
                          <Box sx={{
                            height: 120,
                            position: 'relative',
                            background: 'linear-gradient(180deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
                            borderRadius: 1,
                            overflow: 'hidden'
                          }}>
                            {/* Líneas de fondo */}
                            <Box sx={{
                              position: 'absolute',
                              inset: 0,
                              backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.1) 0 1px, transparent 1px 24px)'
                            }} />
                            
                            {/* Gráfico de barras animado */}
                            <Box sx={{ 
                              position: 'absolute', 
                              bottom: 0, 
                              left: 0, 
                              right: 0, 
                              height: '100%',
                              display: 'flex',
                              alignItems: 'end',
                              gap: 0.5,
                              p: 1
                            }}>
                              {[0.3, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((height, i) => (
                                <Box
                                  key={i}
                                  sx={{
                                    flex: 1,
                                    height: `${height * 100}%`,
                                    background: `linear-gradient(180deg, ${i === 3 ? '#667eea' : '#764ba2'}, transparent)`,
                                    borderRadius: '2px 2px 0 0',
                                    opacity: 0,
                                    animation: `barGrow 1s ease-out ${i * 0.1 + 1}s both`,
                                    '@keyframes barGrow': {
                                      from: { height: 0, opacity: 0 },
                                      to: { height: `${height * 100}%`, opacity: 1 }
                                    }
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Box>
            </Grow>
          </Grid>
        </Grid>
      </Container>

      {/* Features mejorado */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Box ref={featuresRef} sx={{ textAlign: 'center', mb: 8 }}>
          <Fade in={featuresVisible} timeout={800}>
            <Box>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.9rem' }}>
                CARACTERÍSTICAS
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 800, 
                  mb: 2,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                Todo lo que necesitas en un solo lugar
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Descubre por qué miles de empresas confían en Zarzify para gestionar sus operaciones
              </Typography>
            </Box>
          </Fade>
        </Box>
        
        <Grid container spacing={4}>
          {[
            { 
              icon: <Inventory />, 
              title: 'Inventario Inteligente', 
              desc: 'IA que predice demanda, alertas automáticas de stock bajo y sincronización multi-canal en tiempo real.',
              gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            { 
              icon: <Speed />, 
              title: 'Ventas Ultra-Rápidas', 
              desc: 'Procesa ventas en segundos con código de barras, múltiples métodos de pago y facturación automática.',
              gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            },
            { 
              icon: <Assessment />, 
              title: 'Analytics Avanzado', 
              desc: 'Dashboards interactivos, reportes predictivos y métricas de negocio que impulsan tus decisiones.',
              gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
            },
            { 
              icon: <CloudDone />, 
              title: 'Cloud Seguro', 
              desc: 'Acceso desde cualquier lugar, backups automáticos y seguridad de nivel bancario para tus datos.',
              gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
            },
            { 
              icon: <People />, 
              title: 'CRM Integrado', 
              desc: 'Gestiona clientes, historial de compras y campañas de marketing desde una sola plataforma.',
              gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
            },
            { 
              icon: <Business />, 
              title: 'Multi-Sucursal', 
              desc: 'Controla múltiples ubicaciones, transfiere inventario y consolida reportes globales.',
              gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            }
          ].map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Grow in={featuresVisible} timeout={600} style={{ transitionDelay: `${idx * 100}ms` }}>
                <Card
                  sx={{
                    p: 4,
                    height: '100%',
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: feature.gradient,
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    },
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                      '&::before': {
                        opacity: 1
                      },
                      '& .feature-icon': {
                        background: feature.gradient,
                        transform: 'scale(1.1) rotate(5deg)'
                      }
                    },
                    transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
                  }}
                >
                  <Box 
                    className="feature-icon"
                    sx={{ 
                      width: 60,
                      height: 60,
                      borderRadius: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 3,
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)',
                      color: 'primary.main',
                      fontSize: '2rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {feature.desc}
                  </Typography>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: 'relative', zIndex: 2 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            textAlign: 'center',
            fontWeight: 800, 
            mb: 6,
            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Lo que dicen nuestros clientes
        </Typography>
        
        <Grid container spacing={4}>
          {[
            {
              name: "María González",
              role: "CEO, TechStore",
              avatar: "M",
              rating: 5,
              text: "Zarzify transformó completamente nuestra operación. El inventario inteligente nos ahorró 40% en costos."
            },
            {
              name: "Carlos Ruiz",
              role: "Gerente, SuperMart",
              avatar: "C", 
              rating: 5,
              text: "La mejor inversión que hemos hecho. Los reportes en tiempo real nos ayudan a tomar decisiones más inteligentes."
            },
            {
              name: "Ana López",
              role: "Propietaria, Fashion Boutique",
              avatar: "A",
              rating: 5,
              text: "Súper fácil de usar y el soporte es excepcional. Mis ventas aumentaron 60% desde que uso Zarzify."
            }
          ].map((testimonial, i) => (
            <Grid item xs={12} md={4} key={testimonial.name}>
              <Grow in={true} timeout={800} style={{ transitionDelay: `${i * 200}ms` }}>
                <Card sx={{
                  p: 4,
                  height: '100%',
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                      mr: 2, 
                      width: 50, 
                      height: 50,
                      background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                    }}>
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Rating value={testimonial.rating} readOnly sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ 
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    position: 'relative',
                    '&::before': {
                      content: '"',
                      fontSize: '3rem',
                      position: 'absolute',
                      top: -10,
                      left: -10,
                      color: 'primary.main',
                      opacity: 0.3
                    }
                  }}>
                    {testimonial.text}
                  </Typography>
                </Card>
              </Grow>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section Mejorado */}
      <Container maxWidth="lg" sx={{ pb: 8, position: 'relative', zIndex: 2 }}>
        <Card
          sx={{
            p: { xs: 6, md: 8 },
            borderRadius: 6,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -2,
              left: -2,
              right: -2,
              bottom: -2,
              background: 'linear-gradient(45deg, #667eea, #764ba2, #667eea)',
              borderRadius: 6,
              zIndex: -1,
              animation: 'borderGlow 3s ease-in-out infinite alternate',
              '@keyframes borderGlow': {
                from: { opacity: 0.5 },
                to: { opacity: 1 }
              }
            }
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 900, 
              mb: 2,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              ¿Listo para revolucionar tu negocio?
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ 
              mb: 6, 
              maxWidth: 600, 
              mx: 'auto',
              opacity: 0.9 
            }}>
              Únete a más de 500 empresas que ya están creciendo con Zarzify. 
              Prueba gratis por 30 días, sin tarjeta de crédito.
            </Typography>

            {/* Beneficios destacados */}
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={4} 
              justifyContent="center" 
              sx={{ mb: 6 }}
            >
              {[
                { icon: <CheckCircle />, text: 'Configuración en 5 minutos' },
                { icon: <Security />, text: 'Datos 100% seguros' },
                { icon: <Speed />, text: 'Soporte 24/7' }
              ].map((benefit, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: 'success.main' }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {benefit.text}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center"
              alignItems="center"
            >
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleRegister}
                endIcon={<ArrowForward />}
                sx={{ 
                  py: 2, 
                  px: 6,
                  fontSize: '1.2rem',
                  borderRadius: 4,
                  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.37)',
                  minWidth: 200,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.6s ease',
                  },
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
                    '&::before': {
                      left: '100%'
                    }
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}
              >
                Empezar Gratis
              </Button>

              <Button 
                variant="text" 
                size="large" 
                onClick={handleLogin}
                startIcon={<PlayArrow />}
                sx={{ 
                  py: 2, 
                  px: 4,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.05)',
                    transform: 'translateX(5px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Ver Demo en Vivo
              </Button>
            </Stack>

            {/* Trust indicators */}
            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Empresas que confían en Zarzify:
              </Typography>
              <Stack 
                direction="row" 
                spacing={4} 
                justifyContent="center" 
                alignItems="center"
                flexWrap="wrap"
                gap={2}
              >
                {['TechCorp', 'RetailMax', 'StorePlus', 'ShopPro'].map((company, i) => (
                  <Typography 
                    key={company}
                    variant="subtitle2" 
                    sx={{ 
                      opacity: 0.6,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      '&:hover': { opacity: 1 },
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    {company}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Box>
        </Card>
      </Container>

      {/* Footer Section */}
      <Container maxWidth="lg" sx={{ pb: 6, position: 'relative', zIndex: 2 }}>
        <Box sx={{ 
          textAlign: 'center', 
          pt: 6, 
          borderTop: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
            Zarzify
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            La suite empresarial que potencia tu negocio
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={4} 
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            {['Producto', 'Precios', 'Soporte', 'Contacto'].map((link) => (
              <Typography 
                key={link}
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  cursor: 'pointer',
                  '&:hover': { 
                    color: 'primary.main',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {link}
              </Typography>
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary">
            © 2025 Zarzify. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Landing;