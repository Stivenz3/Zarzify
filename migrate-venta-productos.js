// Script para migrar productos de ventas desde PostgreSQL a Firestore
const { Pool } = require('pg');
const admin = require('firebase-admin');

// Configurar PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zarzify',
  user: 'postgres',
  password: '1078754787'
});

// Configurar Firebase
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

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function migrateVentaProductos() {
  console.log('🛍️ Migrando productos de ventas desde PostgreSQL...');
  
  try {
    // Obtener todos los detalles de ventas con información de productos
    const detalleVentasQuery = `
      SELECT 
        dv.venta_id,
        dv.producto_id,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal,
        p.nombre as producto_nombre
      FROM detalle_ventas dv
      LEFT JOIN productos p ON dv.producto_id = p.id
      ORDER BY dv.venta_id;
    `;
    
    const detalleVentasResult = await pool.query(detalleVentasQuery);
    console.log(`📊 Encontrados ${detalleVentasResult.rows.length} productos de ventas`);
    
    // Agrupar productos por venta
    const productosPorVenta = {};
    
    detalleVentasResult.rows.forEach(detalle => {
      const ventaId = detalle.venta_id;
      
      if (!productosPorVenta[ventaId]) {
        productosPorVenta[ventaId] = [];
      }
      
      productosPorVenta[ventaId].push({
        id: detalle.producto_id,
        nombre: detalle.producto_nombre || 'Producto sin nombre',
        precio: parseFloat(detalle.precio_unitario) || 0,
        cantidad: parseInt(detalle.cantidad) || 0,
        subtotal: parseFloat(detalle.subtotal) || 0
      });
    });
    
    console.log(`📦 Productos agrupados en ${Object.keys(productosPorVenta).length} ventas`);
    
    // Actualizar cada venta en Firestore con sus productos
    let updatedCount = 0;
    
    for (const [ventaId, productos] of Object.entries(productosPorVenta)) {
      try {
        const ventaRef = db.collection('sales').doc(ventaId);
        const ventaDoc = await ventaRef.get();
        
        if (ventaDoc.exists) {
          await ventaRef.update({
            productos: productos,
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });
          
          console.log(`✅ Venta ${ventaId} actualizada con ${productos.length} productos`);
          updatedCount++;
        } else {
          console.log(`⚠️ Venta ${ventaId} no encontrada en Firestore`);
        }
      } catch (error) {
        console.error(`❌ Error actualizando venta ${ventaId}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Migración completada. ${updatedCount} ventas actualizadas con productos reales.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

migrateVentaProductos().catch(console.error);
