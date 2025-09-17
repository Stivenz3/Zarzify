import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyB-csypNKerPSGiwS-uUE5ntxNbsIQ5o3c",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "zarzify.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "zarzify",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "zarzify.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "596303695838",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:596303695838:web:60ebda64ccb0707f35974f",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-3V2THW4N2C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'es';
export const storage = getStorage(app);
export const db = getFirestore(app);
// Configurar Analytics con configuración específica para el dominio
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    
    // Configurar para el dominio correcto
    const domain = window.location.hostname;
    if (domain === 'zarzify.vercel.app' || domain === 'localhost') {
      console.log('Analytics configurado para:', domain);
    }
  } catch (error) {
    console.warn('Error al inicializar Analytics:', error);
    analytics = null;
  }
} else {
  analytics = null;
}

export { analytics };
export const googleProvider = new GoogleAuthProvider();

// Configuración adicional del proveedor de Google
googleProvider.setCustomParameters({
  prompt: 'select_account' // Fuerza la selección de cuenta cada vez
});

export default app; 