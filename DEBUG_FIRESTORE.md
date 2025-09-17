# 🔍 Diagnóstico de Firestore

## 🚨 **Problema:** No se ven datos en Firestore

## 📋 **Pasos para Diagnosticar:**

### 1. **Verificar Variables de Entorno en Vercel:**

Ve a Vercel Dashboard > Settings > Environment Variables y verifica que tengas:

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

### 2. **Verificar Firestore en Firebase Console:**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona proyecto `zarzify`
3. Ve a **Firestore Database**
4. Verifica que esté **habilitado** y en modo **producción**

### 3. **Configurar Reglas de Firestore:**

En Firebase Console > Firestore > Rules, pega esto:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. **Probar con la Página Simple:**

1. Ve a tu app en Vercel
2. Inicia sesión
3. Ve a **🔧 Simple Test** en el menú
4. Haz clic en "Probar Conexión"
5. Abre la consola del navegador (F12) y revisa los logs

### 5. **Verificar en Consola del Navegador:**

Busca estos mensajes:

- ✅ `🔍 Iniciando prueba de conexión...`
- ✅ `📊 Firebase config:`
- ✅ `✅ Documento creado con ID:`
- ❌ Si hay errores, cópialos aquí

### 6. **Verificar en Firebase Console:**

Después de la prueba, ve a Firestore y busca:

- Colección `test` con documentos
- Colección `products` (si usaste la página de productos)

## 🚨 **Errores Comunes:**

### **Error: "Missing or insufficient permissions"**

- **Solución:** Configura las reglas de Firestore (paso 3)

### **Error: "Firebase App named '[DEFAULT]' already exists"**

- **Solución:** Recarga la página

### **Error: "Permission denied"**

- **Solución:** Verifica que estés autenticado y las reglas estén configuradas

### **No aparecen datos en Firebase Console:**

- **Solución:** Verifica que Firestore esté habilitado y en modo producción

## 📱 **URLs de Prueba:**

- **Simple Test:** `https://tu-app.vercel.app/simple-test`
- **Test Firestore:** `https://tu-app.vercel.app/test-firestore`

## 🔧 **Si nada funciona:**

1. **Verifica que Firestore esté habilitado** en Firebase Console
2. **Verifica las variables de entorno** en Vercel
3. **Verifica las reglas de seguridad** de Firestore
4. **Revisa la consola del navegador** para errores específicos
5. **Prueba en modo incógnito** para descartar problemas de caché

## 📞 **Información para Debug:**

Cuando reportes el problema, incluye:

1. Screenshot de la consola del navegador
2. Screenshot de Firebase Console > Firestore
3. Screenshot de Vercel > Environment Variables
4. El error exacto que aparece
