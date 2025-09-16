# 🚀 Guía de Despliegue en Vercel + Firebase (100% Gratuito)

## 📋 Resumen del Plan Gratuito

| Servicio               | Límite Gratuito                      | Uso Estimado                         |
| ---------------------- | ------------------------------------ | ------------------------------------ |
| **Vercel**             | 100GB bandwidth/mes                  | ✅ Suficiente para miles de usuarios |
| **Firebase Firestore** | 1GB almacenamiento, 50K lecturas/día | ✅ Perfecto para PYMES               |
| **Firebase Auth**      | Usuarios ilimitados                  | ✅ Sin límites                       |
| **Firebase Storage**   | 1GB para archivos                    | ✅ Para imágenes de productos        |

## 🔧 Paso 1: Configurar Firebase

### 1.1 Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Crear un proyecto"**
3. Nombre del proyecto: `zarzify-prod` (o el que prefieras)
4. Desactiva Google Analytics (opcional, para ahorrar recursos)
5. Haz clic en **"Crear proyecto"**

### 1.2 Configurar Firestore Database

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (gratuito)
4. Elige una ubicación cercana (ej: `us-central1`)
5. Haz clic en **"Siguiente"** y luego **"Habilitar"**

### 1.3 Configurar Authentication

1. Ve a **"Authentication"** en el menú lateral
2. Haz clic en **"Comenzar"**
3. Ve a la pestaña **"Sign-in method"**
4. Habilita **"Correo electrónico/contraseña"**
5. Haz clic en **"Guardar"**

### 1.4 Obtener Credenciales

1. Ve a **"Configuración del proyecto"** (ícono de engranaje)
2. Ve a la pestaña **"Cuentas de servicio"**
3. Haz clic en **"Generar nueva clave privada"**
4. Descarga el archivo JSON
5. **¡IMPORTANTE!** Guarda este archivo de forma segura

### 1.5 Configurar Firebase Web App

1. En **"Configuración del proyecto"**, ve a **"Tus aplicaciones"**
2. Haz clic en **"</>"** (Web)
3. Nombre de la app: `zarzify-web`
4. **NO** marques "También configura Firebase Hosting"
5. Haz clic en **"Registrar app"**
6. Copia la configuración que aparece (la necesitarás después)

## 🚀 Paso 2: Desplegar en Vercel

### 2.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2.2 Iniciar Sesión

```bash
vercel login
```

### 2.3 Desplegar Proyecto

```bash
# Desde la raíz del proyecto
vercel
```

Sigue las instrucciones:

- **¿En qué directorio está tu código?** → `.`
- **¿Quieres modificar la configuración?** → `N`
- **¿Cuál es el directorio de salida?** → `build`

### 2.4 Configurar Variables de Entorno

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **"Settings"** → **"Environment Variables"**
4. Agrega las siguientes variables:

#### Variables del Backend (Firebase Admin):

```
FIREBASE_PROJECT_ID = tu-proyecto-id
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\ntu-clave-privada-completa\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
```

#### Variables del Frontend (Firebase Web):

```
REACT_APP_FIREBASE_API_KEY = tu-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN = tu-proyecto.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = tu-proyecto-id
REACT_APP_FIREBASE_STORAGE_BUCKET = tu-proyecto.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = 123456789
REACT_APP_FIREBASE_APP_ID = 1:123456789:web:abcdef
```

### 2.5 Redesplegar

```bash
vercel --prod
```

## 🔍 Paso 3: Verificar Despliegue

### 3.1 Verificar Frontend

- Visita la URL que te dio Vercel
- Deberías ver la página de login de Zarzify

### 3.2 Verificar Backend

- Visita `https://tu-url.vercel.app/api/health`
- Deberías ver: `{"status":"OK","message":"Zarzify Backend funcionando"}`

### 3.3 Probar Autenticación

1. Intenta registrarte con un email
2. Verifica que aparezca en Firebase Console → Authentication
3. Intenta hacer login

## 🛠️ Paso 4: Configurar Dominio Personalizado (Opcional)

1. En Vercel Dashboard, ve a **"Settings"** → **"Domains"**
2. Agrega tu dominio personalizado
3. Configura los DNS según las instrucciones de Vercel

## 📊 Monitoreo y Límites

### Firebase Console

- Ve a **"Usage"** para monitorear el uso
- **Firestore**: Verifica lecturas/escrituras diarias
- **Storage**: Verifica espacio usado

### Vercel Dashboard

- Ve a **"Analytics"** para ver tráfico
- **Bandwidth**: Monitorea uso mensual

## 🚨 Solución de Problemas

### Error: "Firebase not initialized"

- Verifica que todas las variables de entorno estén configuradas
- Asegúrate de que `FIREBASE_PRIVATE_KEY` tenga el formato correcto

### Error: "CORS policy"

- Verifica que el dominio esté en la lista de dominios autorizados en Firebase

### Error: "Build failed"

- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Vercel Dashboard

## 💡 Optimizaciones para el Plan Gratuito

1. **Firestore**: Usa índices compuestos para reducir lecturas
2. **Storage**: Comprime imágenes antes de subirlas
3. **Vercel**: Usa CDN para archivos estáticos
4. **Caching**: Implementa cache en el frontend

## 🎯 Próximos Pasos

1. Configurar monitoreo con Sentry (gratuito)
2. Implementar backup automático de Firestore
3. Configurar notificaciones de límites
4. Optimizar queries para reducir costos

---

**¡Felicidades! 🎉 Tu aplicación Zarzify está ahora desplegada completamente gratis en Vercel con Firebase!**
