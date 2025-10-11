// API route para manejar operaciones de clientes
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
        // Obtener clientes por negocio
        const { businessId } = req.query;
        let clientesQuery = collection(db, 'clients');
        
        if (businessId) {
          clientesQuery = query(clientesQuery, where('business_id', '==', businessId));
        }
        
        const clientesSnapshot = await getDocs(
          query(clientesQuery, orderBy('nombre', 'asc'))
        );
        const clientes = [];
        clientesSnapshot.forEach((doc) => {
          clientes.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ success: true, data: clientes });
        break;

      case 'POST':
        // Crear nuevo cliente
        const { 
          nombre, 
          telefono, 
          direccion, 
          email, 
          credito_disponible, 
          business_id 
        } = req.body;
        
        if (!nombre || !business_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Nombre y business_id son requeridos' 
          });
        }

        const clienteData = {
          nombre: nombre.trim(),
          telefono: telefono?.trim() || '',
          direccion: direccion?.trim() || '',
          email: email?.trim() || '',
          credito_disponible: parseFloat(credito_disponible) || 0.00,
          business_id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'clients'), clienteData);
        
        res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...clienteData },
          message: 'Cliente creado exitosamente'
        });
        break;

      case 'PUT':
        // Actualizar cliente
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del cliente es requerido' 
          });
        }

        // Limpiar datos de actualización
        const cleanUpdateData = {};
        if (updateData.nombre) cleanUpdateData.nombre = updateData.nombre.trim();
        if (updateData.telefono !== undefined) cleanUpdateData.telefono = updateData.telefono.trim();
        if (updateData.direccion !== undefined) cleanUpdateData.direccion = updateData.direccion.trim();
        if (updateData.email !== undefined) cleanUpdateData.email = updateData.email.trim();
        if (updateData.credito_disponible !== undefined) cleanUpdateData.credito_disponible = parseFloat(updateData.credito_disponible);

        cleanUpdateData.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'clients', id), cleanUpdateData);
        
        res.status(200).json({ 
          success: true, 
          message: 'Cliente actualizado exitosamente' 
        });
        break;

      case 'DELETE':
        // Eliminar cliente
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del cliente es requerido' 
          });
        }

        await deleteDoc(doc(db, 'clients', deleteId));
        
        res.status(200).json({ 
          success: true, 
          message: 'Cliente eliminado exitosamente' 
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
    console.error('Error en API clientes:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
