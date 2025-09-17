// Script para revisar si hay datos de productos de ventas en PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zarzify',
  user: 'postgres',
  password: '1078754787'
});

async function checkVentaProductos() {
  console.log('🔍 Revisando datos de productos de ventas en PostgreSQL...');
  
  try {
    // Revisar todas las tablas que podrían contener productos de ventas
    console.log('\n📋 Tablas disponibles:');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Buscar tablas que contengan 'venta' o 'producto'
    console.log('\n🔍 Buscando tablas relacionadas con ventas y productos:');
    const relatedTables = tablesResult.rows.filter(row => 
      row.table_name.toLowerCase().includes('venta') || 
      row.table_name.toLowerCase().includes('producto') ||
      row.table_name.toLowerCase().includes('sale') ||
      row.table_name.toLowerCase().includes('item')
    );
    
    relatedTables.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Revisar estructura de la tabla ventas
    console.log('\n📋 Estructura de la tabla ventas:');
    const ventasStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'ventas' 
      ORDER BY ordinal_position;
    `);
    
    ventasStructure.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Buscar si hay alguna columna que contenga productos o items
    console.log('\n🔍 Buscando columnas que podrían contener productos:');
    const productColumns = ventasStructure.rows.filter(row => 
      row.column_name.toLowerCase().includes('producto') ||
      row.column_name.toLowerCase().includes('item') ||
      row.column_name.toLowerCase().includes('detalle') ||
      row.column_name.toLowerCase().includes('json') ||
      row.column_name.toLowerCase().includes('data')
    );
    
    if (productColumns.length > 0) {
      productColumns.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('  - No se encontraron columnas obvias para productos');
    }
    
    // Revisar algunas ventas para ver si hay datos de productos
    console.log('\n💰 Revisando datos de ventas:');
    const sampleVentas = await pool.query('SELECT * FROM ventas LIMIT 3');
    
    sampleVentas.rows.forEach((venta, index) => {
      console.log(`\n  Venta ${index + 1}:`);
      console.log(`    ID: ${venta.id}`);
      console.log(`    Total: ${venta.total}`);
      console.log(`    Columnas disponibles: ${Object.keys(venta).join(', ')}`);
      
      // Buscar cualquier campo que pueda contener productos
      Object.keys(venta).forEach(key => {
        if (venta[key] && typeof venta[key] === 'object') {
          console.log(`    ${key}: ${JSON.stringify(venta[key])}`);
        } else if (venta[key] && typeof venta[key] === 'string' && venta[key].length > 50) {
          console.log(`    ${key}: ${venta[key].substring(0, 100)}...`);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkVentaProductos().catch(console.error);
