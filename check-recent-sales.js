// Script para verificar ventas recientes en Firestore
const admin = require('firebase-admin');

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

async function checkRecentSales() {
  console.log('🔍 Verificando ventas recientes en Firestore...');
  
  try {
    // Obtener todas las ventas
    const salesRef = db.collection('sales');
    const snapshot = await salesRef.orderBy('created_at', 'desc').limit(10).get();
    
    console.log(`📊 Encontradas ${snapshot.docs.length} ventas recientes:`);
    
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n💰 Venta ${index + 1}:`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Business ID: ${data.business_id}`);
      console.log(`   Cliente ID: ${data.cliente_id}`);
      console.log(`   Total: ${data.total}`);
      console.log(`   Fecha: ${data.fecha_venta}`);
      console.log(`   Estado: ${data.estado}`);
      console.log(`   Método pago: ${data.metodo_pago}`);
      console.log(`   Productos: ${data.productos ? data.productos.length : 0}`);
      console.log(`   Created at: ${data.created_at?.toDate ? data.created_at.toDate() : data.created_at}`);
      
      if (data.productos && data.productos.length > 0) {
        console.log(`   📦 Productos:`);
        data.productos.forEach((product, pIndex) => {
          console.log(`     ${pIndex + 1}. ${product.nombre || 'Sin nombre'} - Cantidad: ${product.cantidad} - Precio: ${product.precio}`);
        });
      }
    });
    
    // Verificar ventas por business_id específico
    const businessId = '64085497-fa2a-438d-8926-150a21b2bac1'; // Ferrezar
    console.log(`\n🏢 Ventas para Ferrezar (${businessId}):`);
    const businessSales = await salesRef.where('business_id', '==', businessId).get();
    console.log(`   Total ventas: ${businessSales.docs.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRecentSales().catch(console.error);
