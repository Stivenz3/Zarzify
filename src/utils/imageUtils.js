// Utilidad para construir URLs completas de imágenes

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Construir URL completa basada en el entorno
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://zarzify.up.railway.app'  // URL de Railway en producción
    : 'http://localhost:3001';  // URL local en desarrollo
  
  // Asegurar que el path comience con /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${baseUrl}${normalizedPath}`;
};

export default getImageUrl;
