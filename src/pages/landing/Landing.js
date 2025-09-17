import React, { useEffect, useRef } from 'react';
import { Box, Button, Container, Grid, Typography, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Pequeño hook para Intersection Observer y stagger
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
      { root: null, threshold: 0.12 }
    );

    elements.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index * 80, 800)}ms`;
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
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 48,
    });
  }, []);

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/login?mode=signup');

  return (
    <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Hero con parallax suave */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '92vh', md: '88vh' },
          display: 'flex',
          alignItems: 'center',
          background:
            'radial-gradient(1200px 500px at 10% -10%, rgba(25,118,210,0.25), rgba(25,118,210,0) 60%), radial-gradient(800px 400px at 90% 10%, rgba(236,72,153,0.20), rgba(236,72,153,0) 60%)',
          overflow: 'hidden',
        }}
      >
        {/* Parallax layers */}
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.06) 0, transparent 50%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.05) 0, transparent 50%)',
            transform: 'translateZ(0)',
            willChange: 'transform',
            animation: 'floaty 18s ease-in-out infinite',
            '@keyframes floaty': {
              '0%': { transform: 'translate3d(0,0,0)' },
              '50%': { transform: 'translate3d(0,-8px,0)' },
              '100%': { transform: 'translate3d(0,0,0)' },
            },
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                data-aos="fade-up"
                sx={{ fontWeight: 800, lineHeight: 1.1, mb: 2 }}
              >
                Zarzify
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                data-aos="fade-up"
                data-aos-delay="120"
                sx={{ mb: 3 }}
              >
                Sistema de gestión empresarial para inventario, ventas, egresos, clientes y reportes.
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} data-aos="zoom-in">
                <Button variant="contained" size="large" onClick={handleLogin}>
                  Iniciar sesión
                </Button>
                <Button variant="outlined" size="large" onClick={handleRegister}>
                  Registrarme
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
                {['Inventario', 'Ventas', 'Egresos', 'Clientes', 'Reportes'].map((feat, i) => (
                  <Chip key={feat} label={feat} color={i % 2 ? 'primary' : 'default'} variant="outlined" />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                data-aos="zoom-in"
                sx={{
                  height: 320,
                  borderRadius: 3,
                  background:
                    'linear-gradient(135deg, rgba(25,118,210,0.25), rgba(236,72,153,0.20))',
                  boxShadow: (t) => t.shadows[8],
                  backdropFilter: 'blur(6px)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Sección de características con stagger y slide-up */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }} ref={staggerRef}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }} data-aos="fade-up">
          Todo lo que puedes hacer con Zarzify
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              title: 'Control de Inventario',
              desc: 'Administra productos, categorías y stock en tiempo real.',
            },
            {
              title: 'Ventas y Facturación',
              desc: 'Registra ventas rápidas y obtén comprobantes.',
            },
            {
              title: 'Egresos y Gastos',
              desc: 'Registra y analiza tus egresos por categorías.',
            },
            {
              title: 'Clientes',
              desc: 'Gestiona tus clientes y su historial.',
            },
            {
              title: 'Reportes',
              desc: 'Visualiza métricas y exporta informes.',
            },
            {
              title: 'Multi-negocio',
              desc: 'Cambia entre negocios y controla cada uno.',
            },
          ].map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <Box
                data-stagger
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'background.paper',
                  boxShadow: (t) => t.shadows[2],
                  transform: 'translateY(16px)',
                  opacity: 0,
                  transition: 'opacity 600ms ease, transform 600ms ease',
                  '&.in-view': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.desc}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA final con zoom-in */}
      <Container maxWidth="lg" sx={{ pb: { xs: 10, md: 12 } }}>
        <Box
          data-aos="zoom-in"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: 'center',
            background:
              'linear-gradient(145deg, rgba(25,118,210,0.12), rgba(236,72,153,0.12))',
            boxShadow: (t) => t.shadows[4],
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Empieza a gestionar tu negocio con Zarzify
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button variant="contained" size="large" onClick={handleLogin}>Iniciar sesión</Button>
            <Button variant="outlined" size="large" onClick={handleRegister}>Registrarme</Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

export default Landing;


