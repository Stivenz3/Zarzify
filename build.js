const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Vercel...');

try {
  // Instalar dependencias
  console.log('📦 Instalando dependencias...');
  execSync('npm install', { stdio: 'inherit' });

  // Build del frontend
  console.log('🔨 Construyendo frontend...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verificar que el build se creó
  if (fs.existsSync('build')) {
    console.log('✅ Build completado exitosamente');
  } else {
    throw new Error('❌ El directorio build no se creó');
  }

} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}
