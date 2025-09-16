const { spawn } = require('child_process');
const path = require('path');

console.log(' Iniciando servidor backend con base de datos local...');

// Iniciar el servidor principal
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit',
  shell: true
});

serverProcess.on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
});

serverProcess.on('close', (code) => {
  console.log(`🔚 Servidor backend terminado con código: ${code}`);
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log('\n🛑 Deteniendo servidor backend...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Deteniendo servidor backend...');
  serverProcess.kill('SIGTERM');
  process.exit(0);
});
