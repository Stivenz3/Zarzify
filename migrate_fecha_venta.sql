-- Script para agregar columna fecha_venta a la tabla ventas
-- Ejecutar en el editor SQL de Supabase

-- 1. Agregar la columna fecha_venta
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS fecha_venta DATE;

-- 2. Actualizar registros existentes para usar la fecha de created_at como fecha_venta
UPDATE ventas 
SET fecha_venta = created_at::DATE 
WHERE fecha_venta IS NULL;

-- 3. Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ventas' AND column_name = 'fecha_venta';

-- 4. Mostrar algunas filas para verificar
SELECT id, fecha_venta, created_at 
FROM ventas 
LIMIT 5; 