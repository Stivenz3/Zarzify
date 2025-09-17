import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Servicio base para operaciones CRUD con Firestore
export class FirestoreService {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.collectionRef = collection(db, collectionName);
  }

  // Crear documento
  async create(data) {
    try {
      const docRef = await addDoc(this.collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error(`Error creating document in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Obtener documento por ID
  async getById(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Obtener todos los documentos
  async getAll() {
    try {
      const querySnapshot = await getDocs(this.collectionRef);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting all documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Obtener documentos con filtros
  async getWhere(field, operator, value) {
    try {
      const q = query(this.collectionRef, where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting documents with filter from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Actualizar documento
  async update(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return { id, ...data };
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Eliminar documento
  async delete(id) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Obtener documentos ordenados
  async getOrdered(orderField, direction = 'asc', limitCount = null) {
    try {
      let q = query(this.collectionRef, orderBy(orderField, direction));
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error(`Error getting ordered documents from ${this.collectionName}:`, error);
      throw error;
    }
  }
}

// Servicios específicos para cada entidad
export const productsService = new FirestoreService('products');
export const clientsService = new FirestoreService('clients');
export const salesService = new FirestoreService('sales');
export const expensesService = new FirestoreService('expenses');
export const categoriesService = new FirestoreService('categories');
export const employeesService = new FirestoreService('employees');
export const businessesService = new FirestoreService('businesses');

export default FirestoreService;
