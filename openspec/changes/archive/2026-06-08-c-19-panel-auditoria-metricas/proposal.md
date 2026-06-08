## Why

El sistema ya registra exhaustivamente acciones a través del AuditLog (C-05) y las interacciones de comunicaciones (C-07 a C-12). Sin embargo, carecemos de una interfaz para explotar y monitorear estos datos, dificultando la supervisión operativa y la trazabilidad requerida por la institución y el soporte de auditorías. Implementar este panel centraliza la visibilidad de todas las interacciones y acciones del sistema.

## What Changes

- **Panel de Interacciones (Dashboard de métricas)**: Agregaciones de acciones por día, estado de comunicaciones agrupadas por docente y cruces de interacciones por docente y materia.
- **Visor de últimas acciones operativas**: Listado rápido con límite configurable (defecto: 200 registros) para un pantallazo de la actividad reciente.
- **Explorador del Log de Auditoría Completo**: Buscador y filtro avanzado sobre `AuditLog` por rango de fechas, materia, usuario y estado.
- **Endpoints de solo lectura para auditoría**: Exposición de `/api/auditoria/*`.
- **Seguridad y Scoping**: Integración de permisos `auditoria:ver`. El ADMIN y FINANZAS ven globalmente, mientras que el COORDINADOR solo ve las acciones dentro de su scope (propio/coordinado).

## Capabilities

### New Capabilities
- `panel-interacciones`: Agregaciones de datos y log de últimas acciones (dashboard operativo).
- `explorador-auditoria`: Filtros avanzados y paginación sobre el historial completo de `AuditLog`.
- `api-auditoria-lectura`: Endpoints seguros con scoping basado en RBAC para consulta de métricas y registros.

### Modified Capabilities

## Impact

- **API**: Nuevos endpoints de lectura bajo `/api/auditoria/`.
- **Servicios**: Creación de servicios de analítica que ejecuten agregaciones eficientes sobre las tablas de `AuditLog` y tablas relacionadas con la mensajería.
- **RBAC**: Nuevo permiso explícito (`auditoria:ver`) en el modelo, y validación contextual de scope para el rol de Coordinador.
