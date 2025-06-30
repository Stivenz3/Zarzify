import pkg from 'pg';
const { Pool } = pkg;

// CONFIGURACIÓN LOCAL (origen)
const localPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'zarzify',
  password: '1078754787',
  port: 5432,
});

// CONFIGURACIÓN SUPABASE (destino)
// ✅ CREDENCIALES ACTUALIZADAS PARA TU PROYECTO - CONNECTION POOLER
const supabasePool = new Pool({
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.ozslmglqdbnoswwxmtbg',
  password: '1078754787zD.',
  ssl: { rejectUnauthorized: false }
});

async function migrateToSupabase() {
  try {
    console.log('🚀 INICIANDO MIGRACIÓN A SUPABASE\n');

    // 1. Crear todas las tablas en Supabase
    console.log('📋 Creando estructura de tablas...');
    
    const createTablesSQL = `
      -- Tabla usuarios
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        nombre VARCHAR(255),
        foto_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla negocios
      CREATE TABLE IF NOT EXISTS negocios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        direccion TEXT,
        telefono VARCHAR(20),
        usuario_id VARCHAR(255) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        moneda VARCHAR(10) DEFAULT 'USD',
        impuesto_default DECIMAL(5,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla categorias
      CREATE TABLE IF NOT EXISTS categorias (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla productos
      CREATE TABLE IF NOT EXISTS productos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        precio_venta DECIMAL(12,2) NOT NULL,
        precio_compra DECIMAL(12,2) DEFAULT 0.00,
        stock INTEGER DEFAULT 0,
        codigo_barras VARCHAR(100),
        impuesto DECIMAL(5,2) DEFAULT 0.00,
        stock_minimo INTEGER DEFAULT 0,
        imagen_url TEXT,
        categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
        negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla clientes
      CREATE TABLE IF NOT EXISTS clientes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        direccion TEXT,
        email VARCHAR(255),
        credito_disponible DECIMAL(12,2) DEFAULT 0.00,
        negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla empleados
      CREATE TABLE IF NOT EXISTS empleados (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        cargo VARCHAR(100),
        telefono VARCHAR(20),
        email VARCHAR(255),
        salario DECIMAL(12,2) DEFAULT 0.00,
        direccion TEXT,
        fecha_contratacion DATE,
        negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla ventas
      CREATE TABLE IF NOT EXISTS ventas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
        negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        total DECIMAL(12,2) NOT NULL,
        subtotal DECIMAL(12,2) DEFAULT 0.00,
        impuesto DECIMAL(12,2) DEFAULT 0.00,
        descuento DECIMAL(12,2) DEFAULT 0.00,
        metodo_pago VARCHAR(50) DEFAULT 'efectivo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla detalle_ventas
      CREATE TABLE IF NOT EXISTS detalle_ventas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
        producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(12,2) NOT NULL,
        subtotal DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla proveedores
      CREATE TABLE IF NOT EXISTS proveedores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(20),
        email VARCHAR(255),
        direccion TEXT,
        contacto VARCHAR(255),
        negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla egresos
      CREATE TABLE IF NOT EXISTS egresos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        concepto VARCHAR(255) NOT NULL,
        descripcion TEXT,
        monto DECIMAL(12,2) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        metodo_pago VARCHAR(50) DEFAULT 'efectivo',
        empleado_id UUID REFERENCES empleados(id) ON DELETE SET NULL,
        proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
        fecha DATE DEFAULT CURRENT_DATE,
        negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para mejorar rendimiento
      CREATE INDEX IF NOT EXISTS idx_negocios_usuario_id ON negocios(usuario_id);
      CREATE INDEX IF NOT EXISTS idx_productos_negocio_id ON productos(negocio_id);
      CREATE INDEX IF NOT EXISTS idx_ventas_negocio_id ON ventas(negocio_id);
      CREATE INDEX IF NOT EXISTS idx_clientes_negocio_id ON clientes(negocio_id);
      CREATE INDEX IF NOT EXISTS idx_egresos_negocio_id ON egresos(negocio_id);
    `;

    await supabasePool.query(createTablesSQL);
    console.log('✅ Tablas creadas en Supabase\n');

    // 2. Migrar datos tabla por tabla
    const tables = ['usuarios', 'negocios', 'categorias', 'productos', 'clientes', 'empleados', 'ventas', 'detalle_ventas', 'proveedores', 'egresos'];
    
    for (const table of tables) {
      console.log(`📦 Migrando tabla: ${table}`);
      
      // Obtener datos de la tabla local
      const localData = await localPool.query(`SELECT * FROM ${table}`);
      console.log(`   • Registros encontrados: ${localData.rows.length}`);
      
      if (localData.rows.length > 0) {
        // Obtener nombres de columnas
        const columns = Object.keys(localData.rows[0]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const columnNames = columns.join(', ');
        
        // Insertar datos en Supabase
        for (const row of localData.rows) {
          const values = columns.map(col => row[col]);
          
          await supabasePool.query(
            `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
            values
          );
        }
        console.log(`   ✅ ${localData.rows.length} registros migrados\n`);
      } else {
        console.log(`   • Tabla vacía, continuando...\n`);
      }
    }

    // 3. Verificar migración
    console.log('🔍 VERIFICACIÓN DE MIGRACIÓN:\n');
    
    for (const table of tables) {
      const supabaseCount = await supabasePool.query(`SELECT COUNT(*) FROM ${table}`);
      const localCount = await localPool.query(`SELECT COUNT(*) FROM ${table}`);
      
      const supabaseTotal = parseInt(supabaseCount.rows[0].count);
      const localTotal = parseInt(localCount.rows[0].count);
      
      console.log(`📊 ${table}:`);
      console.log(`   Local: ${localTotal} registros`);
      console.log(`   Supabase: ${supabaseTotal} registros`);
      console.log(`   Status: ${supabaseTotal === localTotal ? '✅ OK' : '❌ ERROR'}\n`);
    }

    console.log('🎉 MIGRACIÓN COMPLETADA\n');
    console.log('📝 PRÓXIMOS PASOS:');
    console.log('1. Actualiza las credenciales en tu backend');
    console.log('2. Modifica las variables de entorno');
    console.log('3. Despliega tu aplicación');
    console.log('4. ¡Tu sistema estará en la nube! 🚀');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await localPool.end();
    await supabasePool.end();
  }
}

// ⚠️ IMPORTANTE: Actualiza las credenciales de Supabase antes de ejecutar
console.log('⚠️  ANTES DE EJECUTAR:');
console.log('1. Reemplaza [TU_PASSWORD] y [TU_HOST] con tus credenciales de Supabase');
console.log('2. Confirma que quieres migrar todos los datos');
console.log('3. Ejecuta: node migrate_to_supabase.js\n');

// ✅ EJECUTAR MIGRACIÓN:
migrateToSupabase(); 