import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '../config/axios';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState([]);
  const [currentBusiness, setCurrentBusiness] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  const loadBusinesses = async (firebaseUser = null) => {
    const userToUse = firebaseUser || user;
    if (!userToUse?.uid) return;

    try {
      const response = await api.get(`/businesses/${userToUse.uid}`);
      setBusinesses(response.data);
      
      // Si hay negocios y no hay uno seleccionado, seleccionar el primero
      if (response.data.length > 0 && !currentBusiness) {
        setCurrentBusiness(response.data[0]);
        localStorage.setItem('currentBusinessId', response.data[0].id);
      }
    } catch (error) {
      console.error('Error al cargar los negocios:', error);
      if (error.response?.status === 404) {
        console.log('Usuario no encontrado en base de datos, se creará al crear el primer negocio');
      }
      setBusinesses([]);
    }
  };

  const switchBusiness = (businessId) => {
    const business = businesses.find(b => b.id === businessId);
    if (business) {
      setCurrentBusiness(business);
      localStorage.setItem('currentBusinessId', businessId);
    }
  };

  const refreshCurrentBusiness = async () => {
    if (!user?.uid || !currentBusiness?.id) return;
    
    try {
      const response = await api.get(`/businesses/${user.uid}`);
      const updatedBusinesses = response.data;
      setBusinesses(updatedBusinesses);
      
      // Actualizar el negocio actual con los datos más recientes
      const updatedCurrentBusiness = updatedBusinesses.find(b => b.id === currentBusiness.id);
      if (updatedCurrentBusiness) {
        setCurrentBusiness(updatedCurrentBusiness);
      }
    } catch (error) {
      console.error('Error al refrescar el negocio actual:', error);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Cargar negocios del usuario
        await loadBusinesses(firebaseUser);
        
        // Intentar restaurar el negocio seleccionado previamente
        const savedBusinessId = localStorage.getItem('currentBusinessId');
        if (savedBusinessId) {
          // Este se ejecutará después de que loadBusinesses complete
          setTimeout(() => {
            const savedBusiness = businesses.find(b => b.id === savedBusinessId);
            if (savedBusiness) {
              setCurrentBusiness(savedBusiness);
            }
          }, 100);
        }
      } else {
        setBusinesses([]);
        setCurrentBusiness(null);
        localStorage.removeItem('currentBusinessId');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Actualizar currentBusiness cuando cambie la lista de businesses
  useEffect(() => {
    const savedBusinessId = localStorage.getItem('currentBusinessId');
    if (savedBusinessId && businesses.length > 0) {
      const savedBusiness = businesses.find(b => b.id === savedBusinessId);
      if (savedBusiness && (!currentBusiness || currentBusiness.id !== savedBusiness.id)) {
        setCurrentBusiness(savedBusiness);
      }
    }
  }, [businesses]);

  const value = {
    user,
    loading,
    businesses,
    currentBusiness,
    setCurrentBusiness,
    loadBusinesses,
    switchBusiness,
    refreshCurrentBusiness,
    darkMode,
    toggleDarkMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}

export default AppContext; 