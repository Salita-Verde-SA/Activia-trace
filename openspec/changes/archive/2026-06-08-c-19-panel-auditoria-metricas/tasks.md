## 1. Esquemas y DTOs

- [x] 1.1 Crear esquemas Pydantic `AuditoriaFiltro`, `AuditoriaMetricas` y `AuditoriaRespuesta` en `backend/schemas/auditoria.py`.

## 2. Lógica de Negocio (Servicios)

- [x] 2.1 Crear `AuditoriaService` en `backend/services/auditoria.py` e inyectarle el alcance (scope) del usuario (global o coordinado).
- [x] 2.2 Implementar método `obtener_metricas_interacciones` que sume/agrupe registros de `AuditLog` por día y rol (agrupado por docente, materia, estados).
- [x] 2.3 Implementar método `obtener_ultimas_acciones` con paginación (`limit`, `offset`) basado en fechas de inserción.
- [x] 2.4 Implementar método `explorar_logs` agregando filtros opcionales (rango de fechas, materia, usuario, accion, etc.).
- [x] 2.5 Refinar el filtro de seguridad de `AuditoriaService` para que, si el rol del usuario es COORDINADOR, el query cruce de forma implícita con sus entidades asignadas en la vista.

## 3. Endpoints de la API

- [x] 3.1 Implementar el router `backend/api/endpoints/auditoria.py` exponiendo los métodos como GETs de solo lectura.
- [x] 3.2 Proteger el router con el requerimiento de permiso explícito `Depends(require_permission("auditoria:ver"))`.
- [x] 3.3 Registrar el router de auditoria en `backend/api/endpoints/__init__.py` y `backend/app/main.py`.

## 4. Pruebas Unitarias y Funcionales

- [x] 4.1 Testear que Admin o Finanzas puedan consultar las métricas y los logs completos de auditoría sin restricciones de scope.
- [x] 4.2 Testear que un Coordinador solo reciba en las búsquedas y métricas los eventos vinculados a su propia esfera de trabajo.
- [x] 4.3 Testear que se respeten los filtros (fechas, limit, offset, accion) de la consulta `explorar_logs`.
- [x] 4.4 Testear que un usuario sin el permiso `auditoria:ver` reciba un error `403 Forbidden` al intentar invocar a `/api/auditoria/*`.
