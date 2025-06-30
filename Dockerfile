# Usar Node.js oficial
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json del backend
COPY backend/package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código del backend
COPY backend/ ./

# Exponer puerto dinámico
EXPOSE $PORT

# Variables de entorno por defecto
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD node -e "const http = require('http'); const req = http.request({hostname: 'localhost', port: process.env.PORT || 3001, path: '/health', timeout: 5000}, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); req.on('error', () => process.exit(1)); req.end();"

# Comando para iniciar
CMD ["npm", "start"] 