# 🚀 Scripts de Zarzify

## 📋 **Para Desarrollo Diario**

### **Ejecutar Backend + Frontend juntos:**

```bash
npm run dev
```

**¿Qué hace?**

- ✅ Inicia el backend (puerto 3001)
- ✅ Inicia el frontend (puerto 3000/3002)
- ✅ Ambos en una sola terminal
- ✅ Se actualizan automáticamente cuando cambies código

### **Ejecutar por separado (si necesitas):**

```bash
# Solo backend
npm run backend

# Solo frontend
npm run frontend
```

---

## 🌐 **Para Publicar en Internet**

### **Publicar solo la web (recomendado):**

```bash
npm run deploy
```

**¿Qué hace?**

- 🔨 Construye la versión optimizada (`npm run build`)
- 🚀 Sube solo el hosting a Firebase (`firebase deploy --only hosting`)

### **Publicar todo (web + funciones + database):**

```bash
npm run deploy:full
```

**¿Qué hace?**

- 🔨 Construye la versión optimizada
- 🚀 Sube TODO a Firebase (`firebase deploy`)

---

## 📝 **Comandos Originales (siguen funcionando)**

```bash
npm start        # Solo frontend
npm run build    # Solo construir
npm test         # Ejecutar tests
```

---

## 🔧 **Setup Inicial para Deploy (solo la primera vez)**

Si aún no has configurado Firebase:

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login a Firebase
firebase login

# 3. Inicializar proyecto
firebase init

# 4. Ya puedes usar npm run deploy
npm run deploy
```

---

## 💡 **Flujo de Trabajo Recomendado**

### **Día a día:**

1. `npm run dev` → Desarrollar
2. Probar todo funcione
3. `npm run deploy` → Publicar

### **Si algo falla:**

1. Revisar que PostgreSQL esté corriendo
2. Verificar que la base de datos 'zarzify' exista
3. `npm run dev` para probar localmente primero

---

## 🆘 **Solución de Problemas**

**Backend no inicia:**

- Verificar PostgreSQL corriendo
- Verificar base de datos 'zarzify' existe

**Frontend no carga:**

- Verificar puerto 3001 (backend) disponible
- Revisar archivo `.env` con `REACT_APP_API_URL=http://localhost:3001/api`

**Deploy falla:**

- `firebase login` para verificar autenticación
- `firebase projects:list` para ver proyectos disponibles
