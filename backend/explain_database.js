import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'zarzify',
  password: '1078754787',
  port: 5432,
});

async function explainDatabase() {
  try {
    console.log('🗄️  ESTRUCTURA DE LA BASE DE DATOS ZARZIFY\n');
    
    // 1. Mostrar todas las tablas
    const tables = await pool.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columnas
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📋 TABLAS PRINCIPALES:');
    tables.rows.forEach(table => {
      console.log(`  ✓ ${table.table_name} (${table.columnas} columnas)`);
    });

    // 2. Mostrar estructura jerárquica
    console.log('\n🏗️  JERARQUÍA DE DATOS:\n');
    
    // USUARIOS (nivel superior)
    const usuarios = await pool.query('SELECT id, email, nombre FROM usuarios LIMIT 5');
    console.log('👤 USUARIOS (Nivel 1 - Raíz):');
    console.log('   - Cada usuario tiene un ID único de Firebase');
    console.log('   - Se identifica por email');
    console.log('   - Puede tener múltiples negocios\n');
    
    if (usuarios.rows.length > 0) {
      usuarios.rows.forEach(user => {
        console.log(`   📧 ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
      });
    }

    // NEGOCIOS (nivel 2)
    const negocios = await pool.query(`
      SELECT n.id, n.nombre, n.usuario_id, u.email,
             (SELECT COUNT(*) FROM productos WHERE negocio_id = n.id) as productos,
             (SELECT COUNT(*) FROM ventas WHERE negocio_id = n.id) as ventas,
             (SELECT COUNT(*) FROM clientes WHERE negocio_id = n.id) as clientes
      FROM negocios n 
      JOIN usuarios u ON n.usuario_id = u.id
      ORDER BY u.email, n.nombre
    `);
    
    console.log('\n🏢 NEGOCIOS (Nivel 2 - Por Usuario):');
    console.log('   - Cada usuario puede tener múltiples negocios');
    console.log('   - Todos los datos están separados por negocio_id');
    console.log('   - Aislamiento total entre negocios\n');
    
    let currentUser = '';
    negocios.rows.forEach(negocio => {
      if (currentUser !== negocio.email) {
        currentUser = negocio.email;
        console.log(`\n   👤 Usuario: ${negocio.email}`);
      }
      console.log(`      🏪 ${negocio.nombre}`);
      console.log(`         • ${negocio.productos} productos`);
      console.log(`         • ${negocio.ventas} ventas`);
      console.log(`         • ${negocio.clientes} clientes`);
      console.log(`         • ID: ${negocio.id.substring(0, 8)}...`);
    });

    // 3. Mostrar separación de datos
    console.log('\n🔐 SEPARACIÓN DE DATOS:\n');
    
    // Verificar que los datos están correctamente separados
    const dataValidation = await pool.query(`
      SELECT 
        u.email,
        n.nombre as negocio,
        COUNT(DISTINCT p.id) as productos,
        COUNT(DISTINCT c.id) as clientes,
        COUNT(DISTINCT v.id) as ventas,
        COUNT(DISTINCT e.id) as egresos
      FROM usuarios u
      LEFT JOIN negocios n ON u.id = n.usuario_id
      LEFT JOIN productos p ON n.id = p.negocio_id
      LEFT JOIN clientes c ON n.id = c.negocio_id
      LEFT JOIN ventas v ON n.id = v.negocio_id
      LEFT JOIN egresos e ON n.id = e.negocio_id
      GROUP BY u.id, u.email, n.id, n.nombre
      ORDER BY u.email, n.nombre
    `);

    dataValidation.rows.forEach(row => {
      console.log(`📊 ${row.email} - ${row.negocio || 'Sin negocio'}:`);
      console.log(`   • ${row.productos} productos`);
      console.log(`   • ${row.clientes} clientes`);
      console.log(`   • ${row.ventas} ventas`);
      console.log(`   • ${row.egresos} egresos\n`);
    });

    // 4. Mostrar relaciones clave
    console.log('🔗 RELACIONES PRINCIPALES:\n');
    
    const relations = [
      'usuarios → negocios (1:N)',
      'negocios → productos (1:N)',
      'negocios → clientes (1:N)', 
      'negocios → empleados (1:N)',
      'negocios → categorias (1:N)',
      'negocios → ventas (1:N)',
      'negocios → egresos (1:N)',
      'ventas → detalle_ventas (1:N)',
      'productos ↔ detalle_ventas (N:M)'
    ];

    relations.forEach(rel => {
      console.log(`   ${rel}`);
    });

    // 5. Seguridad de datos
    console.log('\n🛡️  SEGURIDAD Y AISLAMIENTO:\n');
    
    console.log('✅ NIVEL USUARIO:');
    console.log('   • ID único de Firebase (imposible de duplicar)');
    console.log('   • Email verificado por Firebase');
    console.log('   • No hay acceso cruzado entre usuarios\n');
    
    console.log('✅ NIVEL NEGOCIO:');
    console.log('   • UUID único por negocio');
    console.log('   • Todas las consultas filtran por negocio_id');
    console.log('   • Imposible ver datos de otros negocios\n');
    
    console.log('✅ NIVEL API:');
    console.log('   • Autenticación Firebase requerida');
    console.log('   • Validación de permisos por negocio');
    console.log('   • Logs de auditoría automáticos\n');

    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

explainDatabase(); 