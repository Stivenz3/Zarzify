// Utilidad para construir URLs completas de imágenes

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si es una URL de Firebase Storage, devolverla tal como está
  if (imagePath.includes('firebasestorage.googleapis.com')) {
    return imagePath;
  }
  
  // Para imágenes subidas localmente, usar Firebase Storage
  // Las imágenes se suben a Firebase Storage y se guarda la URL completa
  return imagePath;
};

export default getImageUrl;
