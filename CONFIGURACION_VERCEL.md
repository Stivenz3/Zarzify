# Configuración de Vercel para Zarzify

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en tu proyecto de Vercel:

### Firebase Configuration
```
REACT_APP_FIREBASE_API_KEY=AIzaSyB-csypNKerPSGiwS-uUE5ntxNbsIQ5o3c
REACT_APP_FIREBASE_AUTH_DOMAIN=zarzify.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=zarzify
REACT_APP_FIREBASE_STORAGE_BUCKET=zarzify.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=596303695838
REACT_APP_FIREBASE_APP_ID=1:596303695838:web:60ebda64ccb0707f35974f
REACT_APP_FIREBASE_MEASUREMENT_ID=G-3V2THW4N2C
```

### API Configuration
```
REACT_APP_API_URL=/api
```

## Cómo Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Agrega cada variable de entorno con su valor correspondiente
4. Asegúrate de que estén marcadas para "Production", "Preview" y "Development"

## Estructura de la Base de Datos Firestore

### Colecciones:
- `users` - Usuarios del sistema
- `businesses` - Negocios de los usuarios
- `products` - Productos de cada negocio
- `categories` - Categorías de productos
- `clients` - Clientes de cada negocio
- `sales` - Ventas realizadas
- `expenses` - Gastos/egresos
- `employees` - Empleados de cada negocio

### Campos importantes:
- Todos los documentos tienen `business_id` para asociarlos a un negocio
- Los usuarios tienen `uid` que corresponde al UID de Firebase Auth
- Los negocios tienen `user_id` que corresponde al UID del propietario

## APIs Disponibles

- `GET /api/usuarios` - Obtener usuarios
- `POST /api/usuarios` - Crear usuario
- `GET /api/negocios?user_id={uid}` - Obtener negocios de un usuario
- `POST /api/negocios` - Crear negocio
- `GET /api/productos?businessId={id}` - Obtener productos de un negocio
- `POST /api/productos` - Crear producto
- `GET /api/categorias?businessId={id}` - Obtener categorías de un negocio
- `POST /api/categorias` - Crear categoría
- `GET /api/clientes?businessId={id}` - Obtener clientes de un negocio
- `POST /api/clientes` - Crear cliente
- `GET /api/ventas?businessId={id}` - Obtener ventas de un negocio
- `POST /api/ventas` - Crear venta
- `GET /api/egresos?businessId={id}` - Obtener egresos de un negocio
- `POST /api/egresos` - Crear egreso
- `GET /api/empleados?businessId={id}` - Obtener empleados de un negocio
- `POST /api/empleados` - Crear empleado

## Reglas de Seguridad Firestore

Las reglas están configuradas para:
- Solo usuarios autenticados pueden acceder
- Los usuarios solo pueden acceder a sus propios datos
- Los datos están aislados por negocio
- Validación de propiedad de negocios

## Despliegue

1. Haz commit de todos los cambios
2. Push a tu repositorio
3. Vercel desplegará automáticamente
4. Verifica que las variables de entorno estén configuradas
5. Prueba el registro de usuarios nuevos
