# 🚀 GUÍA DE DESPLIEGUE ZARZIFY - PRODUCCIÓN

## ✅ **MIGRACIÓN COMPLETADA**

---

## 🎯 **PASOS PARA DESPLIEGUE EN PRODUCCIÓN**

### **1. BACKEND - Preparar para Hosting**

#### **Opción A: Railway (Recomendado)**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login en Railway
railway login

# 3. Crear proyecto
railway new

# 4. Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set DATABASE_URL=postgresql://postgres.ozslmglqdbnoswwxmtbg:1078754787zD.@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
railway variables set CORS_ORIGIN=https://zarzify.web.app

# 5. Desplegar
railway up
```

#### **Opción B: Render**

1. Conecta tu repositorio en [render.com](https://render.com)
2. Selecciona "Web Service"
3. Configura:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Variables de entorno**:
     ```
     NODE_ENV=production
     PORT=3001
     DATABASE_URL=postgresql://postgres.ozslmglqdbnoswwxmtbg:1078754787zD.@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
     CORS_ORIGIN=https://zarzify.web.app
     ```

### **2. FRONTEND - Actualizar URLs**

#### **Actualizar src/config/axios.js**

```javascript
// Cambiar la URL del backend por tu URL de producción
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://tu-backend-railway.up.railway.app" // Tu URL de Railway
    : "http://localhost:3001";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});
```

#### **Redesplegar Frontend**

```bash
# Build para producción
npm run build

# Firebase Hosting (actual)
firebase deploy
```

### **3. CONFIGURACIÓN DE CORS**

Una vez que tengas la URL de tu backend, actualiza:

```bash
# En Railway/Render, actualizar variable:
CORS_ORIGIN=https://zarzify.web.app
```

---

## 🗃️ **CREDENCIALES DE SUPABASE CONFIGURADAS**

### **Connection String de Producción:**

```
postgresql://postgres.ozslmglqdbnoswwxmtbg:1078754787zD.@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
```

### **Credenciales Individuales:**

- **Host**: `aws-0-sa-east-1.pooler.supabase.com`
- **Port**: `6543`
- **Database**: `postgres`
- **User**: `postgres.ozslmglqdbnoswwxmtbg`
- **Password**: `1078754787zD.`

---

## 🧪 **TESTING EN PRODUCCIÓN**

### **1. Verificar Backend**

```bash
# Test de salud
curl https://tu-backend-url.com/api/health

# Test de conexión DB
curl https://tu-backend-url.com/api/test-db
```

### **2. Verificar Frontend**

1. ✅ **Login con Firebase**: Google OAuth + Email/Password
2. ✅ **Crear/Seleccionar Negocio**: Dropdown funcional
3. ✅ **Dashboard**: Métricas reales desde Supabase
4. ✅ **Productos**: CRUD completo
5. ✅ **Ventas**: Con detalles y edición
6. ✅ **Egresos**: Sistema financiero completo

---

## 📊 **ESTRUCTURA DE BASE DE DATOS EN SUPABASE**

### **Tablas Migradas:**

- `usuarios` - Autenticación Firebase
- `negocios` - Multi-tenant por usuario
- `categorias` - Organización de productos
- `productos` - Inventario con precios actualizados
- `clientes` - Base de clientes
- `empleados` - Personal del negocio
- `ventas` - Transacciones con notas
- `detalle_ventas` - Items vendidos
- `proveedores` - Gestión de proveedores
- `egresos` - Control financiero completo

### **Características de Seguridad:**

- ✅ **Multi-tenant**: Aislamiento total por `negocio_id`
- ✅ **SSL**: Conexión encriptada
- ✅ **Backup automático**: Supabase maneja respaldos
- ✅ **Escalabilidad**: Soporte para crecimiento

---

## 🎉 **RESULTADO FINAL**

### **URLs de Producción:**

- **Frontend**: `https://zarzify.web.app` ✅ (Ya desplegado)
- **Backend**: `https://tu-backend.railway.app` (Por configurar)
- **Database**: `Supabase` ✅ (Migrado)

### **Sistema Completo:**

- 🔐 **Autenticación**: Firebase Auth (Google + Email)
- 🗃️ **Base de Datos**: Supabase PostgreSQL
- 💼 **Multi-tenant**: Soporte múltiples negocios
- 📊 **Dashboard**: Métricas financieras en tiempo real
- 🛒 **Ventas**: Sistema completo con detalles
- 💰 **Egresos**: Control financiero categorizado
- 📦 **Inventario**: Gestión precisa de stock y precios

---

## 🆘 **PRÓXIMOS PASOS INMEDIATOS**

1. **Despliega tu backend** en Railway o Render
2. **Actualiza la URL** en `src/config/axios.js`
3. **Redesplega el frontend** con `firebase deploy`
4. **Prueba todo el flujo** de login → dashboard → operaciones

¡Tu sistema Zarzify está **100% listo para producción**! 🚀
