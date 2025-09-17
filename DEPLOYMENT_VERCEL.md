# 🚀 Guía de Deployment en Vercel + Firestore

## 📋 Pasos para subir a producción

### 1. **Configurar Firestore en Firebase Console**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `zarzify`
3. En el menú lateral, ve a **Firestore Database**
4. Crea la base de datos en modo **producción**
5. Selecciona una ubicación (recomiendo `us-central1`)

### 2. **Configurar Variables de Entorno en Vercel**

En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:

```
REACT_APP_FIREBASE_API_KEY=AIzaSyB-csypNKerPSGiwS-uUE5ntxNbsIQ5o3c
REACT_APP_FIREBASE_AUTH_DOMAIN=zarzify.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=zarzify
REACT_APP_FIREBASE_STORAGE_BUCKET=zarzify.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=596303695838
REACT_APP_FIREBASE_APP_ID=1:596303695838:web:60ebda64ccb0707f35974f
REACT_APP_FIREBASE_MEASUREMENT_ID=G-3V2THW4N2C
NODE_ENV=production
```

### 3. **Deploy en Vercel**

1. Conecta tu repositorio de GitHub a Vercel
2. Selecciona el directorio raíz del proyecto
3. Framework Preset: **Create React App**
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Deploy!

### 4. **Configurar Reglas de Seguridad de Firestore**

En Firebase Console > Firestore > Rules, agrega:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. **Estructura de Datos en Firestore**

Las colecciones se crearán automáticamente:

- `products` - Inventario de productos
- `clients` - Base de datos de clientes
- `sales` - Registro de ventas
- `expenses` - Registro de gastos
- `categories` - Categorías de productos
- `employees` - Empleados
- `businesses` - Negocios del usuario

## 🔧 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Build para producción
npm run build

# Verificar build localmente
npx serve -s build
```

## 📱 Funcionalidades Migradas

- ✅ Autenticación con Firebase Auth
- ✅ Almacenamiento de imágenes con Firebase Storage
- ✅ Base de datos con Firestore
- ✅ Interfaz responsive
- ✅ Tema claro/oscuro
- ✅ Todas las páginas principales

## 🚨 Notas Importantes

1. **Backup**: Tu commit actual está guardado como respaldo
2. **Firestore**: Reemplaza completamente PostgreSQL
3. **Variables**: Configura todas las variables de entorno en Vercel
4. **Reglas**: Configura las reglas de seguridad de Firestore
5. **Testing**: Prueba todas las funcionalidades después del deploy

## 🆘 Solución de Problemas

### Error de CORS

- Verifica que las URLs estén configuradas correctamente en Firebase Console

### Error de Autenticación

- Verifica que las variables de entorno estén configuradas en Vercel

### Error de Firestore

- Verifica que las reglas de seguridad permitan acceso autenticado
- Verifica que Firestore esté habilitado en Firebase Console
