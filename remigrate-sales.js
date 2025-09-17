// Script para migrar correctamente las ventas desde PostgreSQL
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

async function remigrateSales() {
  console.log('🔄 Remigrando ventas desde PostgreSQL...');
  
  try {
    // Obtener todas las ventas de PostgreSQL
    const salesResult = await pool.query('SELECT * FROM ventas ORDER BY created_at');
    console.log(`📊 Encontradas ${salesResult.rows.length} ventas en PostgreSQL`);
    
    // Obtener productos de ventas si existen
    let ventaProductos = [];
    try {
      const productosResult = await pool.query('SELECT * FROM venta_productos');
      ventaProductos = productosResult.rows;
      console.log(`🛍️ Encontrados ${ventaProductos.length} productos de ventas`);
    } catch (error) {
      console.log('⚠️ No se encontró tabla venta_productos:', error.message);
    }
    
    let migratedCount = 0;
    
    for (const sale of salesResult.rows) {
      console.log(`\n💰 Migrando venta: ${sale.id}`);
      console.log(`   Cliente: ${sale.cliente_id || 'null'}`);
      console.log(`   Total: ${sale.total}`);
      console.log(`   Estado: ${sale.estado}`);
      console.log(`   Método pago: ${sale.metodo_pago}`);
      console.log(`   Created at: ${sale.created_at}`);
      
      // Buscar productos de esta venta
      const productosDeVenta = ventaProductos.filter(p => p.venta_id === sale.id);
      console.log(`   Productos: ${productosDeVenta.length}`);
      
      const saleData = {
        cliente_id: sale.cliente_id || null,
        total: sale.total || 0,
        subtotal: sale.subtotal || 0,
        impuesto: sale.impuesto || 0,
        descuento: sale.descuento || 0,
        metodo_pago: sale.metodo_pago || 'efectivo',
        notas: sale.notas || null,
        estado: sale.estado || 'completada',
        fecha_venta: sale.created_at || new Date(), // Usar created_at como fecha_venta
        productos: productosDeVenta.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad || 1,
          precio: p.precio || 0,
          subtotal: (p.cantidad || 1) * (p.precio || 0)
        })),
        business_id: sale.negocio_id,
        created_at: sale.created_at || new Date()
      };
      
      // Migrar a Firestore
      await db.collection('sales').doc(sale.id).set(saleData, { merge: true });
      console.log(`   ✅ Migrada correctamente`);
      migratedCount++;
    }
    
    console.log(`\n🎉 Migración completada. ${migratedCount} ventas migradas.`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

remigrateSales().catch(console.error);
