import React, { createContext, useContext, useState, useCallback } from 'react';

const DashboardContext = createContext();

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard debe ser usado dentro de DashboardProvider');
  }
  return context;
}

export function DashboardProvider({ children }) {
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);

  // Función para marcar que el dashboard necesita actualizarse
  const markDashboardForRefresh = useCallback((reason = 'unknown') => {
    console.log('🔄 Dashboard marcado para actualización:', reason);
    setNeedsRefresh(true);
    setLastUpdateTimestamp(Date.now());
  }, []);

  // Función para marcar que el dashboard ya fue actualizado
  const markDashboardAsRefreshed = useCallback(() => {
    setNeedsRefresh(false);
  }, []);

  // Función para forzar actualización inmediata
  const refreshDashboard = useCallback((reason = 'manual') => {
    console.log('⚡ Dashboard actualización forzada:', reason);
    setLastUpdateTimestamp(Date.now());
    return Date.now(); // Retorna timestamp para que el componente sepa que debe refrescar
  }, []);

  const value = {
    needsRefresh,
    lastUpdateTimestamp,
    markDashboardForRefresh,
    markDashboardAsRefreshed,
    refreshDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
} 