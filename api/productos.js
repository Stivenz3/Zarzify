// API route para manejar operaciones de productos
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB-csypNKerPSGiwS-uUE5ntxNbsIQ5o3c",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "zarzify.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "zarzify",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "zarzify.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "596303695838",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:596303695838:web:60ebda64ccb0707f35974f",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-3V2THW4N2C"
};

// Inicializar Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method } = req;

    switch (method) {
      case 'GET':
        // Obtener productos por negocio
        const { businessId } = req.query;
        let productosQuery = collection(db, 'products');
        
        if (businessId) {
          productosQuery = query(productosQuery, where('business_id', '==', businessId));
        }
        
        const productosSnapshot = await getDocs(
          query(productosQuery, orderBy('nombre', 'asc'))
        );
        const productos = [];
        productosSnapshot.forEach((doc) => {
          productos.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ success: true, data: productos });
        break;

      case 'POST':
        // Crear nuevo producto
        const { 
          nombre, 
          descripcion, 
          precio_venta, 
          precio_compra,
          stock, 
          categoria_id, 
          business_id,
          codigo_barras,
          impuesto,
          stock_minimo,
          imagen_url
        } = req.body;
        
        if (!nombre || !business_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Nombre y business_id son requeridos' 
          });
        }

        const productoData = {
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || '',
          precio_venta: parseFloat(precio_venta) || 0,
          precio_compra: parseFloat(precio_compra) || 0,
          stock: parseInt(stock) || 0,
          categoria_id: categoria_id || null,
          business_id,
          codigo_barras: codigo_barras?.trim() || null,
          impuesto: parseFloat(impuesto) || 0,
          stock_minimo: parseInt(stock_minimo) || 0,
          imagen_url: imagen_url || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'products'), productoData);
        
        res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...productoData },
          message: 'Producto creado exitosamente'
        });
        break;

      case 'PUT':
        // Actualizar producto
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del producto es requerido' 
          });
        }

        // Limpiar datos de actualización
        const cleanUpdateData = {};
        if (updateData.nombre) cleanUpdateData.nombre = updateData.nombre.trim();
        if (updateData.descripcion !== undefined) cleanUpdateData.descripcion = updateData.descripcion.trim();
        if (updateData.precio_venta !== undefined) cleanUpdateData.precio_venta = parseFloat(updateData.precio_venta);
        if (updateData.precio_compra !== undefined) cleanUpdateData.precio_compra = parseFloat(updateData.precio_compra);
        if (updateData.stock !== undefined) cleanUpdateData.stock = parseInt(updateData.stock);
        if (updateData.categoria_id !== undefined) cleanUpdateData.categoria_id = updateData.categoria_id;
        if (updateData.codigo_barras !== undefined) cleanUpdateData.codigo_barras = updateData.codigo_barras?.trim();
        if (updateData.impuesto !== undefined) cleanUpdateData.impuesto = parseFloat(updateData.impuesto);
        if (updateData.stock_minimo !== undefined) cleanUpdateData.stock_minimo = parseInt(updateData.stock_minimo);
        if (updateData.imagen_url !== undefined) cleanUpdateData.imagen_url = updateData.imagen_url;

        cleanUpdateData.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'products', id), cleanUpdateData);
        
        res.status(200).json({ 
          success: true, 
          message: 'Producto actualizado exitosamente' 
        });
        break;

      case 'DELETE':
        // Eliminar producto
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del producto es requerido' 
          });
        }

        await deleteDoc(doc(db, 'products', deleteId));
        
        res.status(200).json({ 
          success: true, 
          message: 'Producto eliminado exitosamente' 
        });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ 
          success: false, 
          error: `Método ${method} no permitido` 
        });
    }
  } catch (error) {
    console.error('Error en API productos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
