// Script simple para migrar datos de PostgreSQL local a Firestore
// Ejecutar con: node migrate-simple.js

const { Pool } = require('pg');
const admin = require('firebase-admin');

// Configuración de PostgreSQL local - CAMBIA ESTOS VALORES
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zarzify',
  user: 'postgres',
  password: '1078754787'
});

// Tu clave privada de Firebase (ya está configurada)
const serviceAccount = {
  "type": "service_account",
  "project_id": "zarzify",
  "private_key_id": "65bd6af1341571f53b281f9461cc75f8814c3854",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCS0RhCVKxgHGXo\n4Q8QQuSNS14mORhafz6wFbrafSbcw9rRcGG2ibVtbyTx5CzwYJQlW3Vx8xMmDFsz\n0Pdmgo0C/X7ebYAcUG+T4Hiw2fVtxaba8UjH5l71xepsIVXml5RbuuoPQWzIEcDo\nMaeGi/e+HT7/qEBPxuKsZVXLZpV4RybFx/9pJvZ+Kn/Fxec23KphJUnVIelQWjum\nrfvTqsCMkqpDtARIHkl+FOh8S3tt7H4C/VqP4ZRMsJm41qkXS3rUBs2q9qSnVoPq\nytcXh6P+Tu96P0o1Y5jjw39+eAeRvGo6hnceRHFFLENfN1rlBWURIGHlm0FPl7S/\nKHrHvZkrAgMBAAECggEABozltC/q8O7TbSx9a5BQei1eqf3qJD+BIIIXsB/dWAQ1\nAxssgORr/9HxqAkyKBdnBLOr7cWWmR/8AbfVEfHJMNT2kB36lUjRcZuWRu2ykY87\n/pC9Wo3gtr550xE5r+wbZmxUfRHCNLr2DGYKv2oHR6guY2GyXNzWyDJNPaH6ET+q\nHF83NA6unZBBXPP4PXVEGRPyOSQNc/xsq2RdVDwyltZZCdUAoqNP34EIF5zvp/hV\ncfg16ZgHrK4h2ivtxmvhKwXYDGxeEGFEI5I7lMbaSbZVyxx3IvnApcT/pThHVIMf\nD/XXK5bWdoYXvZHvk+5KgZ9hIvo9g70E0jteQghEQQKBgQDMVz0hjocjG9dtv+C4\nBNtA38m1vL+vTCDIf5TkvE+ZXz/Xg4hy+fUzQJ5ID02HhMrAvgUjDVkK9CMHiq62\np/a5Iu+2SKvlxQkXuuXtKjXCWAFnTC8B33uER9Deoz3h8+7cUYD+Ky147ElboXLM\n/UeduQoFkRrN1SL5xFJ5L3UjmQKBgQC37vOdetptGkf1M04kNsbKqDoFHcmpBzY9\nll9rFoWhe6/9HBhwxIjSwQ+zoW7IZ+guiMOyRiDDxJu1LJlrDMdPRVBBj26ZWLr9\nzJQXMLJFDvWseYKaVSDYxBPGIlNQRa/S+ycrFC70YDEnKG8A9ZX9+9F6l3IMseqz\nV0YHbPydYwKBgH2GfcwWZReBK+aEf4Qrn5CLqLqWl14VMvJXxVx5/Z/m7i3y5ChV\nOnZglJsJo4PDZFXgpQEyWueqr7YbUFZuedajCoR8wfQlBP/p1QLK8jlPnJUbLKlG\n4vaQs1OBDiu2kJ4RB1+boJRu+mVqmT4pvQu7ttdSmxekfZbXLh65s4jJAoGAdVNK\nuk0/PxDgjZvoYFlAfMzKFbFmjRc4lhhxTRHUs6j+HWnqfSQgUq8roN18mQEOrYA3\ntGPfSoEDAZItWoeQKxR/mRIw7kgXHwV8AT7iuAJO23G2yVM73IlWQ7BpjG6nNOFX\nnrcFLISfVecIx4ff4V7bxGMOMOLcXwFwfhQbHxkCgYB3gqRyfFVy5Wy5mHJIn6WL\ntpCeL1vOIfXHK4iavgWgiEYnnThs6sq6+ZKpI7pzQIY/HOCbf1f4twSIZDsT2TZ0\nOadySWXbz54Z/L01p9PKmDxGLWtNg3eYwmemmSkPPBA93vLPrn2tWPie4cKaGdVK\nMdxtiCaT0ozuUTjVls5gqw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@zarzify.iam.gserviceaccount.com",
  "client_id": "117905629515098321451",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40zarzify.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de PostgreSQL local a Firestore...');
    console.log('📝 Asegúrate de cambiar la password de PostgreSQL en el script');

    // Verificar conexión a PostgreSQL
    console.log('🔍 Verificando conexión a PostgreSQL...');
    const testQuery = await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL exitosa');

    // Migrar usuarios
    console.log('👥 Migrando usuarios...');
    const usersResult = await pool.query('SELECT * FROM usuarios');
    console.log(`📊 Encontrados ${usersResult.rows.length} usuarios`);
    
    for (const user of usersResult.rows) {
      await db.collection('users').doc(user.id).set({
        email: user.email,
        nombre: user.nombre,
        foto_url: user.foto_url,
        created_at: user.created_at || new Date()
      });
      console.log(`✅ Usuario migrado: ${user.nombre}`);
    }

    // Migrar negocios
    console.log('🏢 Migrando negocios...');
    const businessesResult = await pool.query('SELECT * FROM negocios');
    console.log(`📊 Encontrados ${businessesResult.rows.length} negocios`);
    
    for (const business of businessesResult.rows) {
      await db.collection('businesses').doc(business.id).set({
        nombre: business.nombre,
        direccion: business.direccion,
        telefono: business.telefono,
        user_id: business.usuario_id,
        created_at: business.created_at || new Date()
      });
      console.log(`✅ Negocio migrado: ${business.nombre}`);
    }

    // Migrar categorías
    console.log('📁 Migrando categorías...');
    const categoriesResult = await pool.query('SELECT * FROM categorias');
    console.log(`📊 Encontrados ${categoriesResult.rows.length} categorías`);
    
    for (const category of categoriesResult.rows) {
      await db.collection('categories').doc(category.id).set({
        nombre: category.nombre,
        descripcion: category.descripcion,
        imagen_url: category.imagen_url,
        business_id: category.negocio_id,
        created_at: category.created_at || new Date()
      });
      console.log(`✅ Categoría migrada: ${category.nombre}`);
    }

    // Migrar productos
    console.log('📦 Migrando productos...');
    const productsResult = await pool.query('SELECT * FROM productos');
    console.log(`📊 Encontrados ${productsResult.rows.length} productos`);
    
    for (const product of productsResult.rows) {
      await db.collection('products').doc(product.id).set({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio_venta: product.precio_venta,
        precio_compra: product.precio_compra,
        stock: product.stock,
        categoria_id: product.categoria_id,
        codigo_barras: product.codigo_barras,
        impuesto: product.impuesto,
        stock_minimo: product.stock_minimo,
        imagen_url: product.imagen_url,
        business_id: product.negocio_id,
        created_at: product.created_at || new Date()
      });
      console.log(`✅ Producto migrado: ${product.nombre}`);
    }

    // Migrar clientes
    console.log('👥 Migrando clientes...');
    const clientsResult = await pool.query('SELECT * FROM clientes');
    console.log(`📊 Encontrados ${clientsResult.rows.length} clientes`);
    
    for (const client of clientsResult.rows) {
      await db.collection('clients').doc(client.id).set({
        nombre: client.nombre,
        telefono: client.telefono,
        direccion: client.direccion,
        email: client.email,
        credito_disponible: client.credito_disponible,
        business_id: client.negocio_id,
        created_at: client.created_at || new Date()
      });
      console.log(`✅ Cliente migrado: ${client.nombre}`);
    }

    // Migrar ventas
    console.log('💰 Migrando ventas...');
    const salesResult = await pool.query('SELECT * FROM ventas');
    console.log(`📊 Encontradas ${salesResult.rows.length} ventas`);
    
    for (const sale of salesResult.rows) {
      await db.collection('sales').doc(sale.id).set({
        cliente_id: sale.cliente_id,
        total: sale.total,
        fecha: sale.fecha,
        estado: sale.estado,
        business_id: sale.negocio_id,
        created_at: sale.created_at || new Date()
      });
      console.log(`✅ Venta migrada: ${sale.id}`);
    }

    // Migrar gastos
    console.log('💸 Migrando gastos...');
    const expensesResult = await pool.query('SELECT * FROM egresos');
    console.log(`📊 Encontrados ${expensesResult.rows.length} gastos`);
    
    for (const expense of expensesResult.rows) {
      await db.collection('expenses').doc(expense.id).set({
        concepto: expense.concepto,
        monto: expense.monto,
        fecha: expense.fecha,
        empleado_id: expense.empleado_id,
        business_id: expense.negocio_id,
        created_at: expense.created_at || new Date()
      });
      console.log(`✅ Gasto migrado: ${expense.concepto}`);
    }

    // Migrar empleados
    console.log('👷 Migrando empleados...');
    const employeesResult = await pool.query('SELECT * FROM empleados');
    console.log(`📊 Encontrados ${employeesResult.rows.length} empleados`);
    
    for (const employee of employeesResult.rows) {
      await db.collection('employees').doc(employee.id).set({
        nombre: employee.nombre,
        telefono: employee.telefono,
        email: employee.email,
        direccion: employee.direccion,
        cargo: employee.cargo,
        salario: employee.salario,
        fecha_contratacion: employee.fecha_contratacion,
        imagen_url: employee.imagen_url,
        business_id: employee.negocio_id,
        created_at: employee.created_at || new Date()
      });
      console.log(`✅ Empleado migrado: ${employee.nombre}`);
    }

    console.log('🎉 ¡Migración completada exitosamente!');
    console.log('📱 Ahora puedes probar tu app con los datos migrados a Firestore');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    console.log('💡 Verifica que:');
    console.log('   1. PostgreSQL esté corriendo');
    console.log('   2. La password esté correcta en el script');
    console.log('   3. La base de datos "zarzify" exista');
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar migración
migrateData();
