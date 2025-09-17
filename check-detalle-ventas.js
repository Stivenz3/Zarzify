// Script para revisar las tablas de detalle de ventas
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zarzify',
  user: 'postgres',
  password: '1078754787'
});

async function checkDetalleVentas() {
  console.log('🔍 Revisando tablas de detalle de ventas...');
  
  try {
    // Revisar estructura de detalle_ventas
    console.log('\n📋 Estructura de detalle_ventas:');
    const detalleVentasStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'detalle_ventas' 
      ORDER BY ordinal_position;
    `);
    
    detalleVentasStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Revisar estructura de detalles_venta
    console.log('\n📋 Estructura de detalles_venta:');
    const detallesVentaStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'detalles_venta' 
      ORDER BY ordinal_position;
    `);
    
    detallesVentaStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Contar registros en cada tabla
    console.log('\n📊 Cantidad de registros:');
    const detalleVentasCount = await pool.query('SELECT COUNT(*) FROM detalle_ventas');
    const detallesVentaCount = await pool.query('SELECT COUNT(*) FROM detalles_venta');
    
    console.log(`  - detalle_ventas: ${detalleVentasCount.rows[0].count} registros`);
    console.log(`  - detalles_venta: ${detallesVentaCount.rows[0].count} registros`);
    
    // Revisar algunos registros de detalle_ventas
    if (parseInt(detalleVentasCount.rows[0].count) > 0) {
      console.log('\n💰 Primeros 3 registros de detalle_ventas:');
      const detalleVentasSample = await pool.query('SELECT * FROM detalle_ventas LIMIT 3');
      
      detalleVentasSample.rows.forEach((detalle, index) => {
        console.log(`\n  Detalle ${index + 1}:`);
        Object.keys(detalle).forEach(key => {
          console.log(`    ${key}: ${detalle[key]}`);
        });
      });
    }
    
    // Revisar algunos registros de detalles_venta
    if (parseInt(detallesVentaCount.rows[0].count) > 0) {
      console.log('\n💰 Primeros 3 registros de detalles_venta:');
      const detallesVentaSample = await pool.query('SELECT * FROM detalles_venta LIMIT 3');
      
      detallesVentaSample.rows.forEach((detalle, index) => {
        console.log(`\n  Detalle ${index + 1}:`);
        Object.keys(detalle).forEach(key => {
          console.log(`    ${key}: ${detalle[key]}`);
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkDetalleVentas().catch(console.error);
