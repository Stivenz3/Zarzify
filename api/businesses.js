// API route para manejar operaciones de negocios
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
        // Obtener negocios por usuario
        const { user_id } = req.query;
        let negociosQuery = collection(db, 'negocios');
        
        if (user_id) {
          negociosQuery = query(negociosQuery, where('user_id', '==', user_id));
        }
        
        const negociosSnapshot = await getDocs(
          query(negociosQuery, orderBy('createdAt', 'desc'))
        );
        const negocios = [];
        negociosSnapshot.forEach((doc) => {
          negocios.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ success: true, data: negocios });
        break;

      case 'POST':
        // Crear nuevo negocio
        const { 
          nombre, 
          descripcion, 
          direccion, 
          telefono, 
          email, 
          user_id 
        } = req.body;
        
        if (!nombre || !user_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Nombre y user_id son requeridos' 
          });
        }

        const negocioData = {
          nombre: nombre.trim(),
          descripcion: descripcion?.trim() || '',
          direccion: direccion?.trim() || '',
          telefono: telefono?.trim() || '',
          email: email?.trim() || '',
          user_id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'businesses'), negocioData);
        
        res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...negocioData },
          message: 'Negocio creado exitosamente'
        });
        break;

      case 'PUT':
        // Actualizar negocio
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del negocio es requerido' 
          });
        }

        updateData.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'businesses', id), updateData);
        
        res.status(200).json({ 
          success: true, 
          message: 'Negocio actualizado exitosamente' 
        });
        break;

      case 'DELETE':
        // Eliminar negocio
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del negocio es requerido' 
          });
        }

        await deleteDoc(doc(db, 'businesses', deleteId));
        
        res.status(200).json({ 
          success: true, 
          message: 'Negocio eliminado exitosamente' 
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
    console.error('Error en API negocios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
