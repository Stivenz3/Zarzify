// Script para migrar datos de PostgreSQL a Firestore
// Ejecutar con: node migrate-to-firestore.js

const { Pool } = require('pg');
const admin = require('firebase-admin');

// Configuración de PostgreSQL (Railway)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/zarzify'
});

// Configuración de Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "zarzify",
  private_key_id: "tu-private-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\ntu-clave-privada-aqui\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-xxxxx@zarzify.iam.gserviceaccount.com",
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs/firebase-adminsdk-xxxxx%40zarzify.iam.gserviceaccount.com"
};

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de PostgreSQL a Firestore...');

    // Migrar usuarios
    console.log('👥 Migrando usuarios...');
    const usersResult = await pool.query('SELECT * FROM usuarios');
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

    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Ejecutar migración
migrateData();
