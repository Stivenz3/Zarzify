// Script para migrar datos locales a Firestore
import { 
  businessesService, 
  productsService, 
  categoriesService, 
  clientsService, 
  salesService, 
  expensesService, 
  employeesService 
} from '../services/firestoreService';

// Datos de ejemplo para migrar
const sampleData = {
  businesses: [
    {
      nombre: 'Mi Negocio Principal',
      direccion: 'Calle Principal 123',
      telefono: '+1234567890',
      user_id: 'current-user-id' // Se reemplazará con el ID real del usuario
    }
  ],
  categories: [
    { nombre: 'Electrónicos', descripcion: 'Dispositivos electrónicos', business_id: 'business-id' },
    { nombre: 'Ropa', descripcion: 'Vestimenta y accesorios', business_id: 'business-id' },
    { nombre: 'Hogar', descripcion: 'Artículos para el hogar', business_id: 'business-id' }
  ],
  products: [
    {
      nombre: 'Laptop Dell',
      descripcion: 'Laptop Dell Inspiron 15',
      precio_venta: 800,
      precio_compra: 600,
      stock: 5,
      categoria_id: 'category-id',
      codigo_barras: '123456789',
      impuesto: 0.16,
      stock_minimo: 2,
      imagen_url: '',
      business_id: 'business-id'
    },
    {
      nombre: 'Camiseta Básica',
      descripcion: 'Camiseta de algodón 100%',
      precio_venta: 25,
      precio_compra: 15,
      stock: 50,
      categoria_id: 'category-id',
      codigo_barras: '987654321',
      impuesto: 0.16,
      stock_minimo: 10,
      imagen_url: '',
      business_id: 'business-id'
    }
  ],
  clients: [
    {
      nombre: 'Juan Pérez',
      telefono: '+1234567890',
      direccion: 'Calle Cliente 456',
      email: 'juan@email.com',
      credito_disponible: 1000,
      business_id: 'business-id'
    },
    {
      nombre: 'María García',
      telefono: '+0987654321',
      direccion: 'Avenida Cliente 789',
      email: 'maria@email.com',
      credito_disponible: 500,
      business_id: 'business-id'
    }
  ]
};

export const migrateSampleData = async (userId, businessId) => {
  try {
    console.log('🚀 Iniciando migración de datos de ejemplo...');
    
    // Migrar categorías
    console.log('📁 Migrando categorías...');
    const categories = [];
    for (const category of sampleData.categories) {
      const categoryData = { ...category, business_id: businessId };
      const createdCategory = await categoriesService.create(categoryData);
      categories.push(createdCategory);
      console.log('✅ Categoría creada:', createdCategory.nombre);
    }
    
    // Migrar productos
    console.log('📦 Migrando productos...');
    for (const product of sampleData.products) {
      const productData = { 
        ...product, 
        business_id: businessId,
        categoria_id: categories[0].id // Usar la primera categoría
      };
      const createdProduct = await productsService.create(productData);
      console.log('✅ Producto creado:', createdProduct.nombre);
    }
    
    // Migrar clientes
    console.log('👥 Migrando clientes...');
    for (const client of sampleData.clients) {
      const clientData = { ...client, business_id: businessId };
      const createdClient = await clientsService.create(clientData);
      console.log('✅ Cliente creado:', createdClient.nombre);
    }
    
    console.log('🎉 Migración completada exitosamente!');
    return true;
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    return false;
  }
};

export const checkIfDataExists = async (businessId) => {
  try {
    const [products, clients, categories] = await Promise.all([
      productsService.getWhere('business_id', '==', businessId),
      clientsService.getWhere('business_id', '==', businessId),
      categoriesService.getWhere('business_id', '==', businessId)
    ]);
    
    return {
      hasProducts: products.length > 0,
      hasClients: clients.length > 0,
      hasCategories: categories.length > 0,
      counts: {
        products: products.length,
        clients: clients.length,
        categories: categories.length
      }
    };
  } catch (error) {
    console.error('Error verificando datos existentes:', error);
    return { hasProducts: false, hasClients: false, hasCategories: false, counts: { products: 0, clients: 0, categories: 0 } };
  }
};

export default { migrateSampleData, checkIfDataExists };
