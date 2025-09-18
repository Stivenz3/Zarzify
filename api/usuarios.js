// API route para manejar operaciones de usuarios
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';

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
        // Obtener todos los usuarios
        const usersSnapshot = await getDocs(
          query(collection(db, 'usuarios'), orderBy('created_at', 'desc'))
        );
        const users = [];
        usersSnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json({ success: true, data: users });
        break;

      case 'POST':
        // Crear nuevo usuario
        const { 
          nombre, 
          email, 
          telefono, 
          direccion, 
          documento, 
          tipo_documento, 
          rol,
          password 
        } = req.body;
        
        if (!nombre || !email || !password) {
          return res.status(400).json({ 
            success: false, 
            error: 'Nombre, email y password son requeridos' 
          });
        }

        const userData = {
          nombre: nombre.trim(),
          email: email.trim().toLowerCase(),
          telefono: telefono?.trim() || null,
          direccion: direccion?.trim() || null,
          documento: documento?.trim() || null,
          tipo_documento: tipo_documento || 'cedula',
          rol: rol || 'usuario',
          password: password, // En producción debería estar hasheado
          created_at: new Date(),
          updated_at: new Date()
        };

        const docRef = await addDoc(collection(db, 'usuarios'), userData);
        
        res.status(201).json({ 
          success: true, 
          data: { id: docRef.id, ...userData },
          message: 'Usuario creado exitosamente'
        });
        break;

      case 'PUT':
        // Actualizar usuario
        const { id, ...updateData } = req.body;
        
        if (!id) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del usuario es requerido' 
          });
        }

        updateData.updated_at = new Date();
        await updateDoc(doc(db, 'usuarios', id), updateData);
        
        res.status(200).json({ 
          success: true, 
          message: 'Usuario actualizado exitosamente' 
        });
        break;

      case 'DELETE':
        // Eliminar usuario
        const { id: deleteId } = req.body;
        
        if (!deleteId) {
          return res.status(400).json({ 
            success: false, 
            error: 'ID del usuario es requerido' 
          });
        }

        await deleteDoc(doc(db, 'usuarios', deleteId));
        
        res.status(200).json({ 
          success: true, 
          message: 'Usuario eliminado exitosamente' 
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
    console.error('Error en API usuarios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}
