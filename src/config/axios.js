// Axios deshabilitado - Ahora usamos Firestore directamente
// Este archivo se mantiene para compatibilidad con imports existentes

const api = {
  get: () => Promise.reject(new Error('API deshabilitada - Usar Firestore')),
  post: () => Promise.reject(new Error('API deshabilitada - Usar Firestore')),
  put: () => Promise.reject(new Error('API deshabilitada - Usar Firestore')),
  delete: () => Promise.reject(new Error('API deshabilitada - Usar Firestore')),
};

console.log('🔗 API deshabilitada - Usando Firestore directamente');

export default api; 