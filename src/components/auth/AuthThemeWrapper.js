import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../../config/theme';

/**
 * Wrapper que fuerza el tema claro para las rutas de autenticación
 * independientemente del estado del modo oscuro global
 */
function AuthThemeWrapper({ children }) {
  // Siempre usar tema claro para autenticación
  const lightTheme = createAppTheme(false);

  return (
    <ThemeProvider theme={lightTheme}>
      {children}
    </ThemeProvider>
  );
}

export default AuthThemeWrapper;
