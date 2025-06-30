-- Agregar tablas faltantes para egresos y proveedores

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(255),
    direccion TEXT,
    contacto VARCHAR(255),
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de egresos/gastos
CREATE TABLE IF NOT EXISTS egresos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concepto VARCHAR(255) NOT NULL,
    descripcion TEXT,
    monto DECIMAL(12,2) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- 'sueldos', 'servicios', 'proveedores', 'gastos_operativos', 'otros'
    metodo_pago VARCHAR(50) DEFAULT 'efectivo',
    empleado_id UUID REFERENCES empleados(id) ON DELETE SET NULL,
    proveedor_id UUID REFERENCES proveedores(id) ON DELETE SET NULL,
    fecha_pago DATE DEFAULT CURRENT_DATE,
    negocio_id UUID NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_egresos_negocio_id ON egresos(negocio_id);
CREATE INDEX IF NOT EXISTS idx_egresos_fecha_pago ON egresos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_egresos_categoria ON egresos(categoria);
CREATE INDEX IF NOT EXISTS idx_proveedores_negocio_id ON proveedores(negocio_id);

COMMIT; 