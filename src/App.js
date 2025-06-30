import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AppProvider } from './context/AppContext';
import LoadingScreen from './components/common/LoadingScreen';
import Login from './pages/auth/Login';
import ProtectedRoutes from './routes/ProtectedRoutes';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <CssBaseline />
        <AppProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<ProtectedRoutes />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AppProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
