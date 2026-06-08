# explorador-auditoria Specification

## Purpose
TBD - created by archiving change c-19-panel-auditoria-metricas. Update Purpose after archive.
## Requirements
### Requirement: Filtro de auditoría avanzado
El sistema SHALL exponer endpoints para filtrar el historial de la tabla `AuditLog` combinando múltiples parámetros (rango de fechas, materia, usuario, estado/accion).

#### Scenario: Búsqueda por rango de fechas
- **WHEN** el usuario envía parámetros `fecha_desde` y `fecha_hasta`
- **THEN** retorna los registros de auditoría ocurridos estrictamente dentro del rango de fechas

#### Scenario: Búsqueda por múltiples filtros combinados
- **WHEN** el usuario filtra por una `accion` específica ("COMUNICACION_ENVIADA") y un `usuario_id` determinado
- **THEN** retorna registros donde coinciden ambos filtros

### Requirement: Paginación en explorador de auditoría
El sistema SHALL implementar paginación (limit/offset o basado en cursor) en la búsqueda de logs para evitar sobrecarga en bases de datos con alto volumen transaccional.

#### Scenario: Petición de página específica
- **WHEN** el usuario pide los logs saltando los primeros 50 (`offset=50`, `limit=50`)
- **THEN** recibe la segunda página de resultados correctamente

