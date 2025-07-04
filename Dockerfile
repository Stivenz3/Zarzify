# Usar Node.js oficial
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del proyecto principal (incluye dependencias de frontend)
COPY package*.json ./

# Instalar todas las dependencias (frontend + backend)
RUN npm install

# Copiar todo el código fuente
COPY . .

# Construir el frontend React
RUN npm run build

# Copiar las dependencias específicas del backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --production

# Volver al directorio principal
WORKDIR /app

# Variables de entorno
ENV NODE_ENV=production

# Exponer puerto dinámico de Railway
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "const http = require('http'); const req = http.request({hostname: 'localhost', port: process.env.PORT || 3001, path: '/api/health', timeout: 5000}, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Comando de inicio - usar el servidor backend que también sirve frontend
CMD ["npm", "start"] 