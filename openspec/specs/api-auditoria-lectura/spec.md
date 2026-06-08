# api-auditoria-lectura Specification

## Purpose
TBD - created by archiving change c-19-panel-auditoria-metricas. Update Purpose after archive.
## Requirements
### Requirement: Endpoints de solo lectura
El sistema SHALL restringir todas las rutas bajo el namespace `/api/auditoria` a métodos HTTP GET exclusivamente. No se proveen endpoints para mutar auditoría manual.

#### Scenario: Petición a endpoint de lectura
- **WHEN** un cliente autorizado realiza GET sobre `/api/auditoria/metricas`
- **THEN** retorna `200 OK`

#### Scenario: Intento de escritura en endpoint
- **WHEN** un cliente realiza POST sobre `/api/auditoria/`
- **THEN** retorna `405 Method Not Allowed` o `404 Not Found`

### Requirement: Permiso auditoria:ver integrado a RBAC
El acceso a los endpoints de auditoría SHALL requerir obligatoriamente el permiso `auditoria:ver` definido en la matriz RBAC.

#### Scenario: Acceso con rol de Finanzas
- **WHEN** un usuario con rol FINANZAS accede a la API de auditoría
- **THEN** accede exitosamente sin restricciones de alcance, viendo el espectro global de auditoría (ya que el rol Finanzas tiene el permiso global por diseño).

#### Scenario: Acceso sin permiso
- **WHEN** un PROFESOR (que no tiene permiso de auditoría) intenta acceder
- **THEN** se rechaza con `403 Forbidden`

### Requirement: Visibilidad basada en alcance (Scoping para Coordinador)
El sistema SHALL filtrar las filas de auditoría devueltas para un usuario con rol COORDINADOR, de forma tal que únicamente observe registros relacionados a los usuarios asignados a las materias donde actúa como coordinador, o sus propias acciones.

#### Scenario: Coordinador solicitando registros globales
- **WHEN** el COORDINADOR consulta el registro de últimas acciones o métricas
- **THEN** el sistema inyecta un filtro cruzado en la consulta SQL base, limitando los registros a aquellos del alcance propio del coordinador (por ej. cruzando via Asignaciones) y retorna `200 OK` filtrado.

