// Script para revisar datos reales de ventas en PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zarzify',
  user: 'postgres',
  password: '1078754787'
});

async function checkPostgresSales() {
  console.log('🔍 Revisando datos reales de ventas en PostgreSQL...');
  
  try {
    // Revisar estructura de la tabla ventas
    console.log('\n📋 Estructura de la tabla ventas:');
    const structureResult = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ventas' 
      ORDER BY ordinal_position;
    `);
    
    structureResult.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Revisar algunos registros de ventas
    console.log('\n💰 Primeras 5 ventas:');
    const salesResult = await pool.query('SELECT * FROM ventas LIMIT 5');
    
    salesResult.rows.forEach((sale, index) => {
      console.log(`\n  Venta ${index + 1}:`);
      console.log(`    ID: ${sale.id}`);
      console.log(`    Cliente ID: ${sale.cliente_id}`);
      console.log(`    Total: ${sale.total}`);
      console.log(`    Fecha: ${sale.fecha}`);
      console.log(`    Estado: ${sale.estado}`);
      console.log(`    Método de pago: ${sale.metodo_pago}`);
      console.log(`    Created at: ${sale.created_at}`);
    });
    
    // Contar ventas por estado
    console.log('\n📊 Ventas por estado:');
    const statusResult = await pool.query(`
      SELECT estado, COUNT(*) as cantidad 
      FROM ventas 
      GROUP BY estado 
      ORDER BY cantidad DESC;
    `);
    
    statusResult.rows.forEach(row => {
      console.log(`  - ${row.estado}: ${row.cantidad} ventas`);
    });
    
    // Contar ventas por método de pago
    console.log('\n💳 Ventas por método de pago:');
    const paymentResult = await pool.query(`
      SELECT metodo_pago, COUNT(*) as cantidad 
      FROM ventas 
      GROUP BY metodo_pago 
      ORDER BY cantidad DESC;
    `);
    
    paymentResult.rows.forEach(row => {
      console.log(`  - ${row.metodo_pago}: ${row.cantidad} ventas`);
    });
    
    // Revisar fechas
    console.log('\n📅 Rango de fechas:');
    const dateResult = await pool.query(`
      SELECT 
        MIN(fecha) as fecha_minima,
        MAX(fecha) as fecha_maxima,
        COUNT(*) as total_ventas
      FROM ventas;
    `);
    
    const dateInfo = dateResult.rows[0];
    console.log(`  - Fecha mínima: ${dateInfo.fecha_minima}`);
    console.log(`  - Fecha máxima: ${dateInfo.fecha_maxima}`);
    console.log(`  - Total ventas: ${dateInfo.total_ventas}`);
    
    // Revisar si hay tabla de productos de ventas
    console.log('\n🛍️ Revisando tabla de productos de ventas...');
    try {
      const productsResult = await pool.query('SELECT * FROM venta_productos LIMIT 3');
      console.log(`  - Encontrados ${productsResult.rows.length} productos de ventas`);
      if (productsResult.rows.length > 0) {
        console.log('  - Estructura de venta_productos:');
        const productStructure = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'venta_productos' 
          ORDER BY ordinal_position;
        `);
        productStructure.rows.forEach(row => {
          console.log(`    - ${row.column_name}: ${row.data_type}`);
        });
      }
    } catch (error) {
      console.log('  - No se encontró tabla venta_productos o error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkPostgresSales().catch(console.error);
