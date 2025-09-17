# Migración de PostgreSQL a Firestore

## Objetivo

Migrar los datos existentes de PostgreSQL (Railway) a Firestore para hacer pruebas de CRUD.

## Pasos

### 1. Configurar Firebase Admin

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto `zarzify`
3. Ve a Project Settings > Service Accounts
4. Genera una nueva clave privada
5. Reemplaza el contenido de `serviceAccount` en `migrate-to-firestore.js`

### 2. Configurar variables de entorno

```bash
export DATABASE_URL="tu-url-de-railway"
```

### 3. Instalar dependencias

```bash
npm install pg firebase-admin
```

### 4. Ejecutar migración

```bash
node migrate-to-firestore.js
```

## Datos que se migran

- Usuarios
- Negocios
- Categorías
- Productos
- Clientes
- Ventas
- Gastos
- Empleados

## Nota

Este script mantiene los IDs originales de PostgreSQL para mantener la integridad de las relaciones.
