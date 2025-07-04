import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import theme from './config/theme';
import { AppProvider } from './context/AppContext';
import { DashboardProvider } from './context/DashboardContext';

// Layout Components
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/products/Products';
import Sales from './pages/sales/Sales';
import Reports from './pages/reports/Reports';
import Settings from './pages/settings/Settings';
import Business from './pages/business/Business';
import Clients from './pages/clients/Clients';
import Expenses from './pages/expenses/Expenses';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return null; // El loading está manejado por el HTML
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {!user ? (
          // Usuario no autenticado - Mostrar Landing Page y Login
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        ) : (
          // Usuario autenticado - Mostrar App
          <AppProvider>
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
                <Route path="/reports" element={
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                } />
                <Route path="/expenses" element={
                  <MainLayout>
                    <Expenses />
                  </MainLayout>
                } />
                <Route path="/settings" element={
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                } />
                
                {/* Catch all other routes */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardProvider>
          </AppProvider>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
