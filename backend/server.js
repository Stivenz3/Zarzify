const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();

// Middleware global para capturar errores no manejados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // No terminar el proceso inmediatamente, log y continuar
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // No terminar el proceso inmediatamente, log y continuar
});

// CORS configuration para producción y desarrollo
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://zarzify.up.railway.app', 'https://zarzify.web.app'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

app.use(express.json());

// Middleware de timeout para evitar requests colgados
app.use((req, res, next) => {
  // Timeout de 30 segundos para todas las requests
  req.setTimeout(30000, () => {
    console.error('❌ Request timeout:', req.method, req.path);
    if (!res.headersSent) {
      res.status(408).json({ 
        error: 'Request timeout',
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  res.setTimeout(30000, () => {
    console.error('❌ Response timeout:', req.method, req.path);
    if (!res.headersSent) {
      res.status(408).json({ 
        error: 'Response timeout',
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
}

// Configuración de la conexión a PostgreSQL con mejor manejo de errores
const pool = new Pool({
  // Usar variables de entorno para producción
  connectionString: process.env.DATABASE_URL,
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'zarzify',
  password: process.env.DB_PASSWORD || '1078754787',
  port: process.env.DB_PORT || 5432,
  // SSL para producción
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Configuraciones para estabilidad
  max: 10, // Máximo 10 conexiones concurrentes
  idleTimeoutMillis: 30000, // Cerrar conexiones inactivas después de 30s
  connectionTimeoutMillis: 10000, // Timeout de conexión de 10s
});

// Verificar conexión con mejor manejo de errores
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Conexión a PostgreSQL exitosa'))
  .catch(err => {
    console.error('❌ Error de conexión a PostgreSQL:', err.message);
    // No terminar el proceso, seguir intentando
  });

// Manejo de errores del pool
pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  // No terminar el proceso
});

// Helper para notificar cambios en el dashboard
const invalidateDashboardCache = (businessId, reason = 'datos actualizados') => {
  // Solo mostrar log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔄 Dashboard actualizado para negocio ${businessId}: ${reason}`);
  }
  // Aquí se podría agregar WebSocket notification en el futuro
};

// --- USUARIOS ---
app.post('/api/usuarios', async (req, res) => {
  const { id, email, nombre, foto_url } = req.body;
  try {
    // Upsert: insertar o actualizar si ya existe
    const result = await pool.query(`
      INSERT INTO usuarios (id, email, nombre, foto_url) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nombre = EXCLUDED.nombre,
        foto_url = EXCLUDED.foto_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [id, email, nombre, foto_url]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear/actualizar usuario:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/usuarios/:googleId', async (req, res) => {
  const { googleId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE google_id = $1', [googleId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- NEGOCIOS ---
app.get('/api/businesses/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM negocios WHERE usuario_id = $1 ORDER BY created_at', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener negocios:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/businesses/google/:googleId', async (req, res) => {
  const { googleId } = req.params;
  try {
    // Primero obtenemos el usuario
    const userResult = await pool.query('SELECT id FROM usuarios WHERE google_id = $1', [googleId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const userId = userResult.rows[0].id;
    const result = await pool.query('SELECT * FROM negocios WHERE usuario_id = $1 ORDER BY created_at', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener negocios:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/businesses', async (req, res) => {
  const { nombre, direccion, telefono, usuario_id, moneda, impuesto_default } = req.body;
  try {
    console.log('Creando negocio:', { nombre, direccion, telefono, usuario_id });
    
    const result = await pool.query(
      'INSERT INTO negocios (nombre, direccion, telefono, usuario_id, moneda, impuesto_default) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, direccion, telefono, usuario_id, moneda || 'USD', impuesto_default || 0.00]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear negocio:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/businesses/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono, moneda, impuesto_default } = req.body;
  try {
    const result = await pool.query(
      'UPDATE negocios SET nombre = $1, direccion = $2, telefono = $3, moneda = $4, impuesto_default = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [nombre, direccion, telefono, moneda, impuesto_default, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar negocio:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/businesses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el negocio tiene datos asociados
    const checks = await Promise.all([
      pool.query('SELECT COUNT(*) FROM productos WHERE negocio_id = $1', [id]),
      pool.query('SELECT COUNT(*) FROM clientes WHERE negocio_id = $1', [id]),
      pool.query('SELECT COUNT(*) FROM ventas WHERE negocio_id = $1', [id])
    ]);
    
    const hasData = checks.some(check => parseInt(check.rows[0].count) > 0);
    
    if (hasData) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el negocio porque tiene datos asociados' 
      });
    }

    const result = await pool.query('DELETE FROM negocios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Negocio no encontrado' });
    }
    res.json({ message: 'Negocio eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar negocio:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CATEGORIAS ---
app.get('/api/categorias/:businessId', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM categorias WHERE negocio_id = $1 ORDER BY nombre', [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categorias', async (req, res) => {
  const { nombre, descripcion, negocio_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre, descripcion, negocio_id) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, negocio_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear categoría:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categorias SET nombre = $1, descripcion = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar categoría:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categorias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si la categoría tiene productos asociados
    const productCheck = await pool.query('SELECT COUNT(*) FROM productos WHERE categoria_id = $1', [id]);
    const hasProducts = parseInt(productCheck.rows[0].count) > 0;

    if (hasProducts) {
      return res.status(400).json({ 
        error: 'No se puede eliminar la categoría porque tiene productos asociados' 
      });
    }

    const result = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    console.error('Error al eliminar categoría:', err);
    res.status(500).json({ error: err.message });
  }
});

// API para obtener valor de inventario por categoría
app.get('/api/categorias/:businessId/inventory-value', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.nombre as categoria,
        COUNT(p.id) as productos_count,
        COALESCE(SUM(p.stock * p.precio_compra), 0) as valor_inventario,
        COALESCE(SUM(p.stock), 0) as stock_total
      FROM categorias c
      LEFT JOIN productos p ON c.id = p.categoria_id AND p.negocio_id = $1
      WHERE c.negocio_id = $1
      GROUP BY c.id, c.nombre
      ORDER BY valor_inventario DESC
    `, [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener valor de inventario por categoría:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- PRODUCTOS ---
app.get('/api/productos/:businessId', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p 
      LEFT JOIN categorias c ON p.categoria_id = c.id 
      WHERE p.negocio_id = $1
      ORDER BY p.nombre
    `, [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/productos', async (req, res) => {
  const { 
    nombre, 
    descripcion, 
    precio_venta, 
    precio_compra,
    stock, 
    categoria_id, 
    negocio_id,
    codigo_barras,
    impuesto,
    stock_minimo,
    imagen_url
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO productos (
        nombre, descripcion, precio_venta, precio_compra, stock, 
        categoria_id, negocio_id, codigo_barras, impuesto, stock_minimo, imagen_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        nombre, 
        descripcion, 
        precio_venta, 
        precio_compra || 0,
        stock || 0, 
        categoria_id, 
        negocio_id,
        codigo_barras,
        impuesto || 0,
        stock_minimo || 0,
        imagen_url
      ]
    );
    
    // Invalidar caché del dashboard
    invalidateDashboardCache(negocio_id, 'nuevo producto');
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear producto:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    descripcion, 
    precio_venta, 
    precio_compra,
    stock, 
    categoria_id,
    codigo_barras,
    impuesto,
    stock_minimo,
    imagen_url
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos SET 
        nombre = $1, descripcion = $2, precio_venta = $3, precio_compra = $4, 
        stock = $5, categoria_id = $6, codigo_barras = $7, impuesto = $8, 
        stock_minimo = $9, imagen_url = $10, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $11 RETURNING *`,
      [
        nombre, descripcion, precio_venta, precio_compra, stock, 
        categoria_id, codigo_barras, impuesto, stock_minimo, imagen_url, id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Invalidar caché del dashboard si cambió precio o stock
    invalidateDashboardCache(result.rows[0].negocio_id, 'producto actualizado');
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar producto:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar producto:', err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para obtener productos con stock bajo
app.get('/api/productos/:businessId/low-stock', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        p.*, 
        c.nombre as categoria_nombre,
        CASE 
          WHEN p.stock <= 0 THEN 'agotado'
          WHEN p.stock <= p.stock_minimo THEN 'stock_bajo'
          ELSE 'disponible'
        END as estado_stock
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.negocio_id = $1 
        AND p.stock_minimo > 0 
        AND p.stock <= p.stock_minimo
      ORDER BY 
        CASE 
          WHEN p.stock <= 0 THEN 1
          WHEN p.stock <= p.stock_minimo THEN 2
          ELSE 3
        END,
        p.stock ASC
    `, [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productos con stock bajo:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- CLIENTES ---
app.get('/api/clientes/:businessId', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM clientes WHERE negocio_id = $1 ORDER BY nombre', [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  const { 
    nombre, 
    telefono, 
    direccion, 
    email, 
    credito_disponible, 
    negocio_id 
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO clientes (
        nombre, telefono, direccion, email, credito_disponible, negocio_id
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        nombre, 
        telefono, 
        direccion, 
        email, 
        credito_disponible || 0.00, 
        negocio_id
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear cliente:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    telefono, 
    direccion, 
    email, 
    credito_disponible 
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE clientes SET 
        nombre = $1, telefono = $2, direccion = $3, email = $4, 
        credito_disponible = $5, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $6 RETURNING *`,
      [nombre, telefono, direccion, email, credito_disponible, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar cliente:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar si el cliente tiene ventas asociadas
    const ventasCheck = await pool.query('SELECT COUNT(*) FROM ventas WHERE cliente_id = $1', [id]);
    const hasVentas = parseInt(ventasCheck.rows[0].count) > 0;

    if (hasVentas) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el cliente porque tiene ventas asociadas' 
      });
    }

    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- EMPLEADOS ---
app.get('/api/empleados/:businessId', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM empleados WHERE negocio_id = $1 ORDER BY nombre', [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener empleados:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/empleados', async (req, res) => {
  const { nombre, cargo, telefono, email, salario, direccion, fecha_contratacion, negocio_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO empleados (
        nombre, cargo, telefono, email, salario, direccion, fecha_contratacion, negocio_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [nombre, cargo, telefono, email, salario || 0, direccion, fecha_contratacion, negocio_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear empleado:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/empleados/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, telefono, email, salario, direccion, fecha_contratacion } = req.body;
  try {
    const result = await pool.query(
      `UPDATE empleados SET 
        nombre = $1, cargo = $2, telefono = $3, email = $4, 
        salario = $5, direccion = $6, fecha_contratacion = $7, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $8 RETURNING *`,
      [nombre, cargo, telefono, email, salario, direccion, fecha_contratacion, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar empleado:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/empleados/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM empleados WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }
    res.json({ message: 'Empleado eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar empleado:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- VENTAS ---
app.get('/api/ventas/:businessId', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query(`
      SELECT v.*, c.nombre as cliente_nombre
      FROM ventas v 
      LEFT JOIN clientes c ON v.cliente_id = c.id 
      WHERE v.negocio_id = $1
      ORDER BY v.created_at DESC
    `, [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener ventas:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ventas', async (req, res) => {
  const { 
    cliente_id, 
    total, 
    subtotal,
    impuesto,
    descuento, 
    metodo_pago, 
    productos, 
    negocio_id 
  } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Insertar la venta usando nombres correctos de columnas
    const ventaResult = await client.query(
      `INSERT INTO ventas (
        cliente_id, negocio_id, total, subtotal, impuesto, descuento, metodo_pago
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [cliente_id, negocio_id, total, subtotal || 0, impuesto || 0, descuento || 0, metodo_pago]
    );
    const ventaId = ventaResult.rows[0].id;

    // Insertar los detalles de la venta usando el nombre correcto de tabla
    for (const producto of productos) {
      const subtotalProducto = producto.cantidad * producto.precio_unitario;
      
      await client.query(
        `INSERT INTO detalle_ventas (
          venta_id, producto_id, cantidad, precio_unitario, subtotal
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          ventaId, 
          producto.id, 
          producto.cantidad, 
          producto.precio_unitario,
          subtotalProducto
        ]
      );

      // Actualizar el stock
      await client.query(
        'UPDATE productos SET stock = stock - $1 WHERE id = $2',
        [producto.cantidad, producto.id]
      );
    }

    await client.query('COMMIT');
    
    // Invalidar caché del dashboard después de venta exitosa
    invalidateDashboardCache(negocio_id, 'nueva venta');
    
    res.status(201).json({ id: ventaId, message: 'Venta registrada con éxito' });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear venta:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.delete('/api/ventas/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Obtener los detalles de la venta para restaurar el stock
    const detallesResult = await client.query(
      'SELECT producto_id, cantidad FROM detalle_ventas WHERE venta_id = $1',
      [id]
    );

    // Restaurar el stock de los productos
    for (const detalle of detallesResult.rows) {
      await client.query(
        'UPDATE productos SET stock = stock + $1 WHERE id = $2',
        [detalle.cantidad, detalle.producto_id]
      );
    }

    // Eliminar los detalles de la venta
    await client.query('DELETE FROM detalle_ventas WHERE venta_id = $1', [id]);

    // Eliminar la venta
    const result = await client.query('DELETE FROM ventas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Venta eliminada correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar venta:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Obtener detalles completos de una venta con productos
app.get('/api/ventas/:saleId/details', async (req, res) => {
  const { saleId } = req.params;
  try {
    // Obtener datos de la venta
    const ventaResult = await pool.query(`
      SELECT v.*, c.nombre as cliente_nombre
      FROM ventas v 
      LEFT JOIN clientes c ON v.cliente_id = c.id 
      WHERE v.id = $1
    `, [saleId]);

    if (ventaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    const venta = ventaResult.rows[0];

    // Obtener productos de la venta
    const productosResult = await pool.query(`
      SELECT 
        dv.cantidad, 
        dv.precio_unitario, 
        dv.subtotal,
        p.nombre,
        p.codigo_barras
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1
    `, [saleId]);

    // Combinar datos
    const ventaCompleta = {
      ...venta,
      productos: productosResult.rows
    };

    res.json(ventaCompleta);
  } catch (err) {
    console.error('Error al obtener detalles de venta:', err);
    res.status(500).json({ error: err.message });
  }
});

// Obtener solo productos de una venta (para edición)
app.get('/api/ventas/:saleId/products', async (req, res) => {
  const { saleId } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        dv.cantidad,
        dv.precio_unitario,
        p.impuesto
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.producto_id = p.id
      WHERE dv.venta_id = $1
    `, [saleId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener productos de venta:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- EGRESOS/GASTOS ---
app.get('/api/egresos/:businessId', async (req, res) => {
  const { businessId } = req.params;
  try {
    const result = await pool.query(`
      SELECT e.*, emp.nombre as empleado_nombre, p.nombre as proveedor_nombre
      FROM egresos e 
      LEFT JOIN empleados emp ON e.empleado_id = emp.id 
      LEFT JOIN proveedores p ON e.proveedor_id = p.id
      WHERE e.negocio_id = $1
      ORDER BY e.created_at DESC
    `, [businessId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener egresos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/egresos', async (req, res) => {
  const { 
    concepto, 
    descripcion, 
    monto, 
    categoria, 
    metodo_pago, 
    empleado_id,
    proveedor_id,
    fecha_pago,
    negocio_id 
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO egresos (
        concepto, descripcion, monto, categoria, metodo_pago, 
        empleado_id, proveedor_id, fecha, negocio_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        concepto, 
        descripcion, 
        monto, 
        categoria, 
        metodo_pago || 'efectivo',
        empleado_id || null,
        proveedor_id || null,
        fecha_pago || new Date(),
        negocio_id
      ]
    );
    
    // Invalidar caché del dashboard después de crear egreso
    invalidateDashboardCache(negocio_id, 'nuevo egreso');
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear egreso:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/egresos/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    concepto, 
    descripcion, 
    monto, 
    categoria, 
    metodo_pago, 
    empleado_id,
    proveedor_id,
    fecha_pago
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE egresos SET 
        concepto = $1, descripcion = $2, monto = $3, categoria = $4, 
        metodo_pago = $5, empleado_id = $6, proveedor_id = $7, 
        fecha = $8, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $9 RETURNING *`,
      [concepto, descripcion, monto, categoria, metodo_pago, empleado_id, proveedor_id, fecha_pago, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Egreso no encontrado' });
    }
    
    // Invalidar caché del dashboard después de actualizar egreso
    invalidateDashboardCache(result.rows[0].negocio_id, 'egreso actualizado');
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar egreso:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/egresos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM egresos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Egreso no encontrado' });
    }
    res.json({ message: 'Egreso eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar egreso:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- DASHBOARD STATS ---
app.get('/api/dashboard/:businessId', async (req, res) => {
  const { businessId } = req.params;
  try {
    // Solo log de debug si está habilitado
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Dashboard consultado para negocio:', businessId);
    }
    
    // Obtener estadísticas del negocio con mayor precisión
    const [products, sales, customers, revenue, expenses, inventoryValue] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM productos WHERE negocio_id = $1', [businessId]),
      pool.query('SELECT COUNT(*) FROM ventas WHERE negocio_id = $1', [businessId]),
      pool.query('SELECT COUNT(*) FROM clientes WHERE negocio_id = $1', [businessId]),
      pool.query('SELECT COALESCE(SUM(total), 0) as total FROM ventas WHERE negocio_id = $1', [businessId]),
      pool.query('SELECT COALESCE(SUM(monto), 0) as total FROM egresos WHERE negocio_id = $1', [businessId]),
      // Mejorar el cálculo de valor de inventario para mayor precisión
      pool.query(`
        SELECT 
          COALESCE(SUM(CAST(precio_compra AS DECIMAL(12,2)) * CAST(stock AS INTEGER)), 0) as valor_inventario,
          COUNT(*) as productos_con_precio
        FROM productos 
        WHERE negocio_id = $1 AND precio_compra > 0
      `, [businessId])
    ]);

    const inventoryData = inventoryValue.rows[0];

    // Ingresos vs Egresos mensuales de los últimos 6 meses con mayor precisión
    const monthlyStats = await pool.query(`
      SELECT 
        TO_CHAR(fecha, 'Mon YYYY') as mes,
        DATE_TRUNC('month', fecha) as mes_fecha,
        COALESCE(SUM(CAST(ingresos AS DECIMAL(12,2))), 0) as ingresos,
        COALESCE(SUM(CAST(egresos AS DECIMAL(12,2))), 0) as egresos
      FROM (
        SELECT created_at as fecha, total as ingresos, 0 as egresos
        FROM ventas 
        WHERE negocio_id = $1 AND created_at >= CURRENT_DATE - INTERVAL '6 months'
        UNION ALL
        SELECT fecha as fecha, 0 as ingresos, monto as egresos
        FROM egresos 
        WHERE negocio_id = $1 AND fecha >= CURRENT_DATE - INTERVAL '6 months'
      ) combined
      GROUP BY DATE_TRUNC('month', fecha), TO_CHAR(fecha, 'Mon YYYY')
      ORDER BY DATE_TRUNC('month', fecha)
    `, [businessId]);

    // Calcular estadísticas financieras precisas
    const totalRevenue = parseFloat(revenue.rows[0].total) || 0;
    const totalExpenses = parseFloat(expenses.rows[0].total) || 0;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    res.json({
      totalProducts: parseInt(products.rows[0].count),
      totalSales: parseInt(sales.rows[0].count),
      totalCustomers: parseInt(customers.rows[0].count),
      totalRevenue: totalRevenue,
      totalExpenses: totalExpenses,
      inventoryValue: parseFloat(inventoryData.valor_inventario),
      netProfit: netProfit,
      profitMargin: profitMargin,
      monthlyStats: monthlyStats.rows.map(row => ({
        mes: row.mes,
        ingresos: parseFloat(row.ingresos),
        egresos: parseFloat(row.egresos)
      }))
    });
  } catch (err) {
    console.error('❌ Error al obtener estadísticas del dashboard:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- CONFIGURACIONES ---
// Obtener configuración del negocio
app.get('/api/configuracion/:businessId', async (req, res) => {
  const { businessId } = req.params;
  console.log('📖 Obteniendo configuración para negocio:', businessId);
  
  try {
    const result = await pool.query(
      'SELECT * FROM configuraciones WHERE negocio_id = $1',
      [businessId]
    );
    
    console.log('🔍 Configuraciones encontradas:', result.rows.length);
    
    if (result.rows.length === 0) {
      // Crear configuración por defecto si no existe
      console.log('➕ Creando configuración por defecto...');
      const defaultConfig = await pool.query(`
        INSERT INTO configuraciones (
          negocio_id, moneda, simbolo_moneda, impuesto_ventas, 
          alertas_stock_bajo, stock_minimo_global, 
          notificaciones_email, tema_interfaz
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [businessId, 'COP', '$', 19.0, true, 10, true, 'light']
      );
      console.log('✅ Configuración por defecto creada:', defaultConfig.rows[0]);
      return res.json(defaultConfig.rows[0]);
    }
    
    console.log('📋 Configuración encontrada:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al obtener configuración:', err.message);
    console.error('🔍 Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Actualizar configuración del negocio
app.put('/api/configuracion/:businessId', async (req, res) => {
  const { businessId } = req.params;
  const {
    moneda,
    simbolo_moneda,
    impuesto_ventas,
    alertas_stock_bajo,
    stock_minimo_global,
    notificaciones_email,
    tema_interfaz
  } = req.body;

  console.log('🔧 Actualizando configuración para negocio:', businessId);
  console.log('📊 Datos recibidos:', req.body);

  try {
    // Verificar si existe configuración
    const existing = await pool.query(
      'SELECT id FROM configuraciones WHERE negocio_id = $1',
      [businessId]
    );

    console.log('🔍 Configuración existente:', existing.rows.length > 0 ? 'SÍ' : 'NO');

    let result;
    if (existing.rows.length === 0) {
      // Crear nueva configuración
      console.log('➕ Creando nueva configuración...');
      result = await pool.query(`
        INSERT INTO configuraciones (
          negocio_id, moneda, simbolo_moneda, impuesto_ventas,
          alertas_stock_bajo, stock_minimo_global, notificaciones_email,
          tema_interfaz, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`,
        [businessId, moneda, simbolo_moneda, impuesto_ventas, alertas_stock_bajo, stock_minimo_global, notificaciones_email, tema_interfaz]
      );
    } else {
      // Actualizar configuración existente
      console.log('🔄 Actualizando configuración existente...');
      result = await pool.query(`
        UPDATE configuraciones SET 
          moneda = $2, simbolo_moneda = $3, impuesto_ventas = $4,
          alertas_stock_bajo = $5, stock_minimo_global = $6, 
          notificaciones_email = $7, tema_interfaz = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE negocio_id = $1 RETURNING *`,
        [businessId, moneda, simbolo_moneda, impuesto_ventas, alertas_stock_bajo, stock_minimo_global, notificaciones_email, tema_interfaz]
      );
    }

    console.log('✅ Configuración guardada exitosamente:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error al actualizar configuración:', err.message);
    console.error('🔍 Stack trace:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Ruta de prueba de conexión
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: 'Conexión exitosa', 
      timestamp: result.rows[0].now,
      database: 'zarzify'
    });
  } catch (err) {
    console.error('Error de conexión:', err);
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint para Railway
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a DB rápida
    await pool.query('SELECT 1');
    
    res.status(200).json({ 
      status: 'healthy',
      service: 'Zarzify API',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      port: PORT,
      env: process.env.NODE_ENV,
      database: 'connected'
    });
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    res.status(503).json({ 
      status: 'unhealthy',
      service: 'Zarzify API',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      env: process.env.NODE_ENV
    });
  }
});

// Health check simple en raíz también
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send('OK');
  } catch (error) {
    res.status(503).send('SERVICE_UNAVAILABLE');
  }
});

// Servir frontend React para todas las rutas que no sean API (solo en producción)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    // Si no es una ruta de API, servir el frontend React
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(__dirname, '../build', 'index.html'));
    }
  });
}

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);
  
  // No exponer detalles de error en producción
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Error interno del servidor' 
    : err.message;
  
  res.status(500).json({ 
    error: errorMessage,
    timestamp: new Date().toISOString(),
    path: req.path
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Puerto dinámico para servicios de hosting
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Zarzify Full-Stack corriendo en puerto ${PORT}`);
  console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📡 Health check disponible en /api/health`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`📱 Frontend React: Servido desde /build`);
    console.log(`🔌 Backend API: Disponible en /api/*`);
  }
}); 