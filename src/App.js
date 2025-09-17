import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { createAppTheme } from './config/theme';
import { AppProvider, useApp } from './context/AppContext';
import { DashboardProvider } from './context/DashboardContext';

// Layout Components
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AuthThemeWrapper from './components/auth/AuthThemeWrapper';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/products/Products';
import Sales from './pages/sales/Sales';
import Reports from './pages/reports/Reports';
import Business from './pages/business/Business';
import Clients from './pages/clients/Clients';
import Expenses from './pages/expenses/Expenses';
import Categories from './pages/categories/Categories';
import Employees from './pages/employees/Employees';
import Settings from './pages/settings/Settings';
import TestFirestore from './pages/test/TestFirestore';
import SimpleTest from './pages/test/SimpleTest';

// Componente wrapper para gestionar el tema dinámico
function AppContent() {
  const { darkMode } = useApp();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detectar estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Solo aplicar tema dinámico cuando el usuario esté autenticado
  const theme = user ? createAppTheme(darkMode) : createAppTheme(false);

  // Actualizar el atributo data-theme en el body solo para usuarios autenticados
  React.useEffect(() => {
    if (user) {
      document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    } else {
      document.body.setAttribute('data-theme', 'light');
    }
  }, [darkMode, user]);

  if (loading) {
    return null; // El loading está manejado por el HTML
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AppRoutes user={user} />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

// Componente para las rutas
function AppRoutes({ user }) {

  return (
    <Router>
      {!user ? (
        // Usuario no autenticado - Mostrar solo Login (siempre en modo claro)
        <AuthThemeWrapper>
          <Routes>
            <Route path="/login" element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthThemeWrapper>
      ) : (
        // Usuario autenticado - Mostrar App
        <DashboardProvider>
          <Routes>
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            
            {/* Business */}
            <Route path="/business" element={
              <MainLayout>
                <Business />
              </MainLayout>
            } />
            
            {/* Main App Routes */}
            <Route path="/dashboard" element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            } />
            <Route path="/products" element={
              <MainLayout>
                <Products />
              </MainLayout>
            } />
            <Route path="/clients" element={
              <MainLayout>
                <Clients />
              </MainLayout>
            } />
            <Route path="/sales" element={
              <MainLayout>
                <Sales />
              </MainLayout>
            } />
            <Route path="/expenses" element={
              <MainLayout>
                <Expenses />
              </MainLayout>
            } />
            <Route path="/employees" element={
              <MainLayout>
                <Employees />
              </MainLayout>
            } />
            <Route path="/reports" element={
              <MainLayout>
                <Reports />
              </MainLayout>
            } />
            <Route path="/categories" element={
              <MainLayout>
                <Categories />
              </MainLayout>
            } />
            <Route path="/settings" element={
              <MainLayout>
                <Settings />
              </MainLayout>
            } />
            <Route path="/test-firestore" element={
              <MainLayout>
                <TestFirestore />
              </MainLayout>
            } />
            <Route path="/simple-test" element={
              <MainLayout>
                <SimpleTest />
              </MainLayout>
            } />
            
            {/* Catch all other routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </DashboardProvider>
      )}
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
