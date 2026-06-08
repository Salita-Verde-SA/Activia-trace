## Why

El módulo de liquidaciones y honorarios es el corazón administrativo del negocio para instituciones académicas. Automatizar el cálculo de los pagos a docentes en función de sus roles, asignaciones vigentes y conceptos adicionales (Plus) elimina errores manuales, mejora la transparencia financiera y reduce la carga administrativa a fin de mes.

## What Changes

- Creación de los modelos `SalarioBase`, `SalarioPlus`, `Liquidacion` y `Factura`.
- Implementación del motor de cálculo de liquidaciones mensuales para docentes.
- Aplicación de las reglas de negocio (RN-21, RN-22, RN-31 a RN-38), especialmente la definición de que el Plus se aplica una sola vez por clave para cada rol, y la diferenciación contable de docentes que emiten factura.
- Implementación del ABM de la grilla salarial (SalarioBase y SalarioPlus con vigencias).
- Endpoints para generar la liquidación preliminar y realizar el cierre contable (inmutable).

## Capabilities

### New Capabilities
- `calculo-liquidaciones`: Motor de cálculo que evalúa asignaciones vigentes, aplica salario base y plus, y excluye a docentes que facturan.
- `cierre-liquidaciones`: Transición de estado de una liquidación a "Cerrada", haciéndola inmutable y generando eventos de auditoría.
- `grilla-salarial`: ABM administrativo para gestionar los valores de Salario Base y Plus con rangos de fechas de vigencia.
- `gestion-facturas`: Registro de facturas para aquellos docentes bajo modalidad contractual externa.

### Modified Capabilities
- N/A

## Impact

- **Bases de datos**: Nuevas tablas `salarios_base`, `salarios_plus`, `liquidaciones` y `facturas`.
- **APIs**: Nuevos endpoints en `/api/liquidaciones` y `/api/facturas` resguardados por el permiso `liquidaciones:gestionar` y `liquidaciones:leer` exclusivo para el rol de FINANZAS.
- **Auditoría**: Evento crítico `LIQUIDACION_CERRAR` registrado en el `AuditLog`.
