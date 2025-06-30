# Usar Node.js oficial
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias del backend primero
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar todo el código del backend
COPY backend/ ./

# Exponer puerto (Railway asigna dinámicamente)
EXPOSE 3001

# Variables de entorno
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "const http = require('http'); const req = http.request({hostname: 'localhost', port: process.env.PORT || 3001, path: '/health', timeout: 5000}, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Comando de inicio
CMD ["node", "server.js"] 