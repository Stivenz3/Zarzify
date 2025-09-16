import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB-csypNKerPSGiwS-uUE5ntxNbsIQ5o3c",
  authDomain: "zarzify.firebaseapp.com",
  projectId: "zarzify",
  storageBucket: "zarzify.appspot.com",
  messagingSenderId: "596303695838",
  appId: "1:596303695838:web:60ebda64ccb0707f35974f",
  measurementId: "G-3V2THW4N2C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.languageCode = 'es';
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();

// Configuración adicional del proveedor de Google
googleProvider.setCustomParameters({
  prompt: 'select_account' // Fuerza la selección de cuenta cada vez
});

export default app; 