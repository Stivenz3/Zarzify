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

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando para iniciar
CMD ["npm", "start"] 