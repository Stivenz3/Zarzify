// Script para iniciar el servidor local con configuración de Supabase
process.env.DATABASE_URL = 'postgresql://postgres.ozslmglqdbnoswwxmtbg:1078754787zD.@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';
process.env.DB_USER = 'postgres.ozslmglqdbnoswwxmtbg';
process.env.DB_HOST = 'aws-0-sa-east-1.pooler.supabase.com';
process.env.DB_NAME = 'postgres';
process.env.DB_PASSWORD = '1078754787zD.';
process.env.DB_PORT = '6543';
process.env.NODE_ENV = 'development';
process.env.CORS_ORIGIN = 'http://localhost:3000';

console.log('🔗 Configurando conexión a Supabase...');
console.log('📡 Host:', process.env.DB_HOST);
console.log('📊 Base de datos:', process.env.DB_NAME);

// Importar y ejecutar el servidor usando ES modules
import('./server.js'); 