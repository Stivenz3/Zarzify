// API route para manejar operaciones de egresos/gastos
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
        // Obtener egresos por negocio
        const { businessId } = req.query;
        let egresosQuery = collection(db, 'expenses');
        
        if (businessId) {
          egresosQuery = query(egresosQuery, where('business_id', '==', businessId));
        }
        
        const egresosSnapshot = await getDocs(
          query(egresosQuery, orderBy('fecha', 'desc'))
        );
        const egresos = [];
        egresosSnapshot.forEach((doc) => {
          egresos.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ success: true, data: egresos });
        break;

      case 'POST':
        // Crear nuevo egreso
        const { 
          concepto, 
          descripcion, 
          monto, 
          categoria, 
          metodo_pago, 
          empleado_id,
          proveedor_id,
          fecha_pago,
          business_id 
        } = req.body;
        
        if (!concepto || !monto || !business_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Concepto, monto y business_id son requeridos' 
          });
        }

        const egresoData = {
          concepto: concepto.trim(),
          descripcion: descripcion?.trim() || '',
          monto: parseFloat(monto),
          categoria: categoria?.trim() || 'General',
          metodo_pago: metodo_pago || 'efectivo',
          empleado_id: empleado_id || null,
          proveedor_id: proveedor_id || null,
          fecha: fecha_pago ? new Date(fecha_pago) : serverTimestamp(),
          business_id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'expenses'), egresoData);
        
        res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...egresoData },
          message: 'Egreso creado exitosamente'
        });
        break;

      case 'PUT':
        // Actualizar egreso
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del egreso es requerido' 
          });
        }

        // Limpiar datos de actualización
        const cleanUpdateData = {};
        if (updateData.concepto) cleanUpdateData.concepto = updateData.concepto.trim();
        if (updateData.descripcion !== undefined) cleanUpdateData.descripcion = updateData.descripcion.trim();
        if (updateData.monto !== undefined) cleanUpdateData.monto = parseFloat(updateData.monto);
        if (updateData.categoria !== undefined) cleanUpdateData.categoria = updateData.categoria.trim();
        if (updateData.metodo_pago !== undefined) cleanUpdateData.metodo_pago = updateData.metodo_pago;
        if (updateData.empleado_id !== undefined) cleanUpdateData.empleado_id = updateData.empleado_id;
        if (updateData.proveedor_id !== undefined) cleanUpdateData.proveedor_id = updateData.proveedor_id;
        if (updateData.fecha_pago !== undefined) {
          cleanUpdateData.fecha = new Date(updateData.fecha_pago);
        }

        cleanUpdateData.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'expenses', id), cleanUpdateData);
        
        res.status(200).json({ 
          success: true, 
          message: 'Egreso actualizado exitosamente' 
        });
        break;

      case 'DELETE':
        // Eliminar egreso
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del egreso es requerido' 
          });
        }

        await deleteDoc(doc(db, 'expenses', deleteId));
        
        res.status(200).json({ 
          success: true, 
          message: 'Egreso eliminado exitosamente' 
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
    console.error('Error en API egresos:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
