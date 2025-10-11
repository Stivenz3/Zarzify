// API route para manejar operaciones de ventas
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
        // Obtener ventas por negocio
        const { businessId } = req.query;
        let ventasQuery = collection(db, 'sales');
        
        if (businessId) {
          ventasQuery = query(ventasQuery, where('business_id', '==', businessId));
        }
        
        const ventasSnapshot = await getDocs(
          query(ventasQuery, orderBy('fecha', 'desc'))
        );
        const ventas = [];
        ventasSnapshot.forEach((doc) => {
          ventas.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ success: true, data: ventas });
        break;

      case 'POST':
        // Crear nueva venta
        const { 
          business_id, 
          cliente_id, 
          metodo_pago, 
          descuento = 0, 
          total, 
          subtotal,
          productos,
          fecha_venta 
        } = req.body;
        
        if (!business_id || !total || !productos || !Array.isArray(productos)) {
          return res.status(400).json({ 
            success: false, 
            error: 'business_id, total y productos son requeridos' 
          });
        }

        const ventaData = {
          business_id,
          cliente_id: cliente_id || null,
          metodo_pago: metodo_pago || 'efectivo',
          descuento: parseFloat(descuento) || 0,
          total: parseFloat(total),
          subtotal: parseFloat(subtotal) || parseFloat(total),
          productos: productos.map(p => ({
            ...p,
            cantidad: parseInt(p.cantidad),
            precio: parseFloat(p.precio)
          })),
          fecha: fecha_venta ? new Date(fecha_venta) : serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'sales'), ventaData);
        
        res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...ventaData },
          message: 'Venta creada exitosamente'
        });
        break;

      case 'PUT':
        // Actualizar venta
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID de la venta es requerido' 
          });
        }

        // Limpiar datos de actualización
        const cleanUpdateData = {};
        if (updateData.cliente_id !== undefined) cleanUpdateData.cliente_id = updateData.cliente_id;
        if (updateData.metodo_pago !== undefined) cleanUpdateData.metodo_pago = updateData.metodo_pago;
        if (updateData.descuento !== undefined) cleanUpdateData.descuento = parseFloat(updateData.descuento);
        if (updateData.total !== undefined) cleanUpdateData.total = parseFloat(updateData.total);
        if (updateData.subtotal !== undefined) cleanUpdateData.subtotal = parseFloat(updateData.subtotal);
        if (updateData.productos !== undefined) {
          cleanUpdateData.productos = updateData.productos.map(p => ({
            ...p,
            cantidad: parseInt(p.cantidad),
            precio: parseFloat(p.precio)
          }));
        }
        if (updateData.fecha_venta !== undefined) {
          cleanUpdateData.fecha = new Date(updateData.fecha_venta);
        }

        cleanUpdateData.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'sales', id), cleanUpdateData);
        
        res.status(200).json({ 
          success: true, 
          message: 'Venta actualizada exitosamente' 
        });
        break;

      case 'DELETE':
        // Eliminar venta
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID de la venta es requerido' 
          });
        }

        await deleteDoc(doc(db, 'sales', deleteId));
        
        res.status(200).json({ 
          success: true, 
          message: 'Venta eliminada exitosamente' 
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
    console.error('Error en API ventas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
