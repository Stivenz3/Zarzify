// Script para configurar CORS en Firebase Storage
// Ejecutar con: node setup-firebase-cors.js

const { exec } = require('child_process');
const fs = require('fs');

console.log('🔧 Configurando CORS para Firebase Storage...');

// Verificar que gsutil esté instalado
exec('gsutil version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ gsutil no está instalado. Instalando Google Cloud SDK...');
    console.log('📝 Por favor instala Google Cloud SDK desde: https://cloud.google.com/sdk/docs/install');
    console.log('📝 Luego ejecuta: gcloud auth login');
    console.log('📝 Y después: gsutil cors set cors.json gs://zarzify.appspot.com');
    return;
  }

  console.log('✅ gsutil encontrado');
  
  // Configurar CORS
  exec('gsutil cors set cors.json gs://zarzify.appspot.com', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error configurando CORS:', error);
      console.log('💡 Asegúrate de estar autenticado con: gcloud auth login');
      return;
    }
    
    console.log('✅ CORS configurado exitosamente para Firebase Storage');
    console.log('📱 Ahora las imágenes deberían cargar correctamente');
  });
});
