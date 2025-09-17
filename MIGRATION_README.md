# Migración de PostgreSQL Local a Firestore

## Objetivo

Migrar los datos existentes de tu PostgreSQL local a Firestore para hacer pruebas de CRUD.

## Pasos

### 1. Configurar PostgreSQL local

Asegúrate de que tu PostgreSQL local esté corriendo y actualiza la configuración en `migrate-to-firestore.js`:
```javascript
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'zarzify',
  user: 'postgres',
  password: 'tu-password-postgres'  // Cambia por tu password real
});
```

### 2. Instalar dependencias

```bash
npm install pg firebase-admin
```

### 3. Ejecutar migración

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
