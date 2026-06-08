# panel-interacciones Specification

## Purpose
TBD - created by archiving change c-19-panel-auditoria-metricas. Update Purpose after archive.
## Requirements
### Requirement: Métricas de interacciones diarias
El sistema SHALL proveer una agregación de la cantidad de acciones agrupadas por día para mostrar tendencias operativas.

#### Scenario: Visualización de métricas
- **WHEN** el usuario accede al endpoint de métricas diarias
- **THEN** se retorna un listado con fecha y conteo total de acciones

### Requirement: Métricas de estado por docente
El sistema SHALL permitir consultar el estado de las comunicaciones (pendientes, enviadas, fallidas) agrupadas por docente.

#### Scenario: Consulta de estado de comunicaciones
- **WHEN** se solicita el resumen por docente
- **THEN** el sistema retorna el conteo de comunicaciones clasificadas por estado para cada docente activo en el alcance del usuario

### Requirement: Visor de últimas acciones
El sistema SHALL proveer un endpoint para listar las N acciones más recientes del `AuditLog` de forma simplificada, con límite configurable por parámetro (defecto 200).

#### Scenario: Consulta con límite predeterminado
- **WHEN** se pide el visor de últimas acciones sin especificar límite
- **THEN** retorna los últimos 200 registros de auditoría ordenados descendentemente por fecha

#### Scenario: Consulta con límite explícito
- **WHEN** se pide el visor de últimas acciones con `limit=50`
- **THEN** retorna exactamente las últimas 50 acciones

