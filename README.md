# 🚀 Zarzify - Sistema de Gestión de Inventario Inteligente

<div align="center">
  <img src="src/logo zarzify.png" alt="Zarzify Logo" width="120" height="120">
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://postgresql.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-Auth-orange.svg)](https://firebase.google.com/)
  [![Material-UI](https://img.shields.io/badge/Material--UI-5.x-blue.svg)](https://mui.com/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📋 Descripción

**Zarzify** es una aplicación web moderna y completa para la gestión de inventarios, diseñada para pequeñas y medianas empresas. Ofrece un dashboard intuitivo, control de productos, gestión de ventas, reportes avanzados y mucho más, todo con una interfaz elegante y fácil de usar.

### ✨ Características Principales

- 🏢 **Gestión Multi-Negocio**: Administra múltiples negocios desde una sola cuenta
- 📦 **Control de Inventario**: Gestión completa de productos, categorías y stock
- 💰 **Sistema de Ventas**: Registro y seguimiento de ventas con múltiples métodos de pago
- 👥 **Gestión de Clientes**: Base de datos de clientes con historial de compras
- 👨‍💼 **Gestión de Empleados**: Control de usuarios y permisos
- 📊 **Reportes Avanzados**: Análisis detallados de ventas, inventario y rendimiento
- 💸 **Control de Gastos**: Seguimiento de gastos operativos
- 🎨 **Interfaz Moderna**: Diseño responsive con modo oscuro/claro
- 🔐 **Autenticación Segura**: Login con Firebase Authentication

## 🛠️ Tecnologías Utilizadas

### Frontend

- **React 18.2.0** - Biblioteca de interfaz de usuario
- **Material-UI (MUI) 5.x** - Componentes de interfaz
- **React Router** - Navegación entre páginas
- **Redux Toolkit** - Gestión de estado global
- **Axios** - Cliente HTTP para APIs
- **Firebase Auth** - Autenticación de usuarios

### Backend

- **Node.js 18.x** - Runtime de JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Multer** - Manejo de archivos
- **CORS** - Configuración de políticas de origen cruzado

### Herramientas de Desarrollo

- **Concurrently** - Ejecución simultánea de procesos
- **Nodemon** - Reinicio automático del servidor
- **PostCSS** - Procesamiento de CSS

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18.x o superior
- PostgreSQL 15.x o superior
- npm o yarn

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/zarzify.git
cd zarzify
```

### 2. Instalar Dependencias

```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd backend
npm install
cd ..
```

### 3. Configurar Base de Datos

1. Crear una base de datos PostgreSQL llamada `zarzify`
2. Configurar las variables de entorno en `.env`:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=zarzify
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña

# Firebase
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_dominio
FIREBASE_PROJECT_ID=tu_proyecto_id

# Servidor
PORT=3001
NODE_ENV=development
```

### 4. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication con Email/Password
3. Obtener las credenciales y agregarlas al archivo `.env`

### 5. Ejecutar la Aplicación

```bash
# Desarrollo (Backend + Frontend)
npm run dev:local

# Solo Backend
npm run start-backend-local

# Solo Frontend
npm run start-frontend

# Producción
npm run build
npm start
```

La aplicación estará disponible en:

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 📁 Estructura del Proyecto

```
zarzify/
├── 📁 backend/                 # Servidor backend
│   ├── 📄 server.js           # Servidor principal
│   ├── 📄 start-local-db.js   # Script de inicio local
│   ├── 📄 upload-handler.js   # Manejo de archivos
│   └── 📁 uploads/            # Archivos subidos
├── 📁 src/                    # Código fuente frontend
│   ├── 📁 components/         # Componentes reutilizables
│   ├── 📁 pages/              # Páginas principales
│   ├── 📁 context/            # Context API
│   ├── 📁 config/             # Configuraciones
│   └── 📁 utils/              # Utilidades
├── 📁 public/                 # Archivos públicos
├── 📁 build/                  # Build de producción
├── 📄 package.json            # Configuración del proyecto
├── 📄 server.js               # Punto de entrada principal
├── 📄 Dockerfile              # Configuración Docker
├── 📄 render.yaml             # Configuración Render
└── 📄 firebase.json           # Configuración Firebase
```

## 🎯 Scripts Disponibles

| Comando                       | Descripción                                  |
| ----------------------------- | -------------------------------------------- |
| `npm run dev:local`           | Inicia backend y frontend en modo desarrollo |
| `npm run start-backend-local` | Inicia solo el servidor backend              |
| `npm run start-frontend`      | Inicia solo el frontend                      |
| `npm run build`               | Construye la aplicación para producción      |
| `npm start`                   | Inicia la aplicación en modo producción      |
| `npm test`                    | Ejecuta las pruebas                          |

### 🚀 Vercel (Recomendado - Gratuito)

#### 1. Configurar Firebase Firestore

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita **Firestore Database** en modo de prueba
4. Habilita **Authentication** con Email/Password
5. Ve a **Project Settings > Service Accounts**
6. Genera una nueva clave privada (JSON)
7. Copia los valores necesarios

#### 2. Desplegar en Vercel

1. Instala Vercel CLI:

```bash
npm i -g vercel
```

2. Inicia sesión en Vercel:

```bash
vercel login
```

3. Despliega el proyecto:

```bash
vercel
```

4. Configura las variables de entorno en Vercel Dashboard:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

#### 3. Límites del Plan Gratuito

- **Vercel**: 100GB bandwidth/mes, deployments ilimitados
- **Firebase Firestore**: 1GB almacenamiento, 50K lecturas/día, 20K escrituras/día
- **Firebase Auth**: Usuarios ilimitados
- **Firebase Storage**: 1GB para archivos/imágenes

### 🐳 Docker (Alternativo)

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 🔥 Firebase Hosting (Solo Frontend)

```json
// firebase.json
{
  "hosting": {
    "public": "build",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 📊 API Endpoints

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registro de usuario
- `GET /api/auth/me` - Obtener usuario actual

### Negocios

- `GET /api/businesses` - Listar negocios del usuario
- `POST /api/businesses` - Crear nuevo negocio
- `PUT /api/businesses/:id` - Actualizar negocio
- `DELETE /api/businesses/:id` - Eliminar negocio

### Productos

- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Ventas

- `GET /api/sales` - Listar ventas
- `POST /api/sales` - Registrar venta
- `GET /api/sales/reports` - Reportes de ventas

## 🎨 Características de la Interfaz

- **Modo Oscuro/Claro**: Toggle automático con persistencia
- **Sidebar Colapsible**: Navegación optimizada para diferentes tamaños de pantalla
- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Glassmorphism**: Efectos visuales modernos en diálogos y botones
- **Animaciones Suaves**: Transiciones fluidas entre estados
- **Temas Personalizables**: Colores y estilos adaptables

## 🔐 Seguridad

- Autenticación con Firebase
- Validación de datos en frontend y backend
- Sanitización de inputs
- CORS configurado correctamente
- Variables de entorno para credenciales sensibles

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Stiven Zarza](https://github.com/Stivenz3)

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

- 📧 Email: zarzalol@hotmail.com

## 🚀 Roadmap

- [ ] Integración con sistemas de pago
- [ ] App móvil nativa
- [ ] Integración con contabilidad
- [ ] Sistema de notificaciones push
- [ ] Análisis de IA para predicciones
- [ ] API pública para integraciones

---

<div align="center">
  <p>Hecho con ❤️ por el equipo de Zarzify</p>
  <p>⭐ Si te gusta este proyecto, ¡dale una estrella!</p>
</div>
