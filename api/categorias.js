// API route para manejar operaciones de categorías
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
        // Obtener categorías por negocio
        const { businessId } = req.query;
        let categoriasQuery = collection(db, 'categories');
        
        if (businessId) {
          categoriasQuery = query(categoriasQuery, where('business_id', '==', businessId));
        }
        
        const categoriasSnapshot = await getDocs(
          query(categoriasQuery, orderBy('nombre', 'asc'))
        );
        const categorias = [];
        categoriasSnapshot.forEach((doc) => {
          categorias.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ success: true, data: categorias });
        break;

      case 'POST':
        // Crear nueva categoría
        const { 
          nombre, 
          descripcion, 
          business_id,
          imagen_url
        } = req.body;
        
        if (!nombre || !business_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Nombre y business_id son requeridos' 
          });
        }

        const categoriaData = {
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || '',
          business_id,
          imagen_url: imagen_url || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'categories'), categoriaData);
        
        res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...categoriaData },
          message: 'Categoría creada exitosamente'
        });
        break;

      case 'PUT':
        // Actualizar categoría
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID de la categoría es requerido' 
          });
        }

        // Limpiar datos de actualización
        const cleanUpdateData = {};
        if (updateData.nombre) cleanUpdateData.nombre = updateData.nombre.trim();
        if (updateData.descripcion !== undefined) cleanUpdateData.descripcion = updateData.descripcion.trim();
        if (updateData.imagen_url !== undefined) cleanUpdateData.imagen_url = updateData.imagen_url;

        cleanUpdateData.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'categories', id), cleanUpdateData);
        
        res.status(200).json({ 
          success: true, 
          message: 'Categoría actualizada exitosamente' 
        });
        break;

      case 'DELETE':
        // Eliminar categoría
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID de la categoría es requerido' 
          });
        }

        await deleteDoc(doc(db, 'categories', deleteId));
        
        res.status(200).json({ 
          success: true, 
          message: 'Categoría eliminada exitosamente' 
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
    console.error('Error en API categorías:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
