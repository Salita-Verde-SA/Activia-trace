## Context

Actualmente, las interacciones en el sistema (como envío de comunicaciones o acciones de cambio de estado en liquidaciones) quedan registradas en la tabla `AuditLog`. Sin embargo, no se ofrecen herramientas al rol de Coordinador, Finanzas o Admin para explorar y analizar estos datos, limitando las capacidades de supervisión y control operativo de la institución. Este módulo proporcionará una capa analítica y exploratoria sobre esos logs.

## Goals / Non-Goals

**Goals:**
- Centralizar la visibilidad de todas las interacciones realizadas en la plataforma (acciones operativas y comunicaciones).
- Proveer endpoints agregados para dashboards de métricas operativas diarias.
- Desarrollar un explorador filtrable sobre la tabla `AuditLog`.
- Garantizar que los Coordinadores solo vean las interacciones pertenecientes a su `scope` (materias en las que operan como coordinadores o docentes).

**Non-Goals:**
- Construir herramientas de exportación avanzada a Excel o PDF en esta fase inicial.
- Crear un motor de alertas automáticas basado en auditoría (eso se gestionaría como otro proceso si se requiere).

## Decisions

- **Uso de la tabla `AuditLog` como fuente de verdad**: En lugar de consultar múltiples tablas dispersas, el explorador y las métricas se construirán agregando los datos existentes en `AuditLog`. Esto implica que las métricas (por ejemplo, comunicaciones enviadas) dependerán de eventos específicos registrados como `"COMUNICACION_ENVIADA"` o `"LIQUIDACION_CERRAR"`.
- **Nuevo Router Analítico**: Se implementará `backend/api/endpoints/auditoria.py` que proveerá rutas como `/api/auditoria/metricas` y `/api/auditoria/logs`.
- **Filtros y Scoping Dinámico**: El servicio construirá la `where` clause condicionalmente. Si el rol es Admin o Finanzas, no se aplican restricciones adicionales de materia. Si es Coordinador, se agregará un filtro dinámico cruzando `Asignacion` para restringir los resultados a las entidades (materias) que el coordinador gestiona.

## Risks / Trade-offs

- **Risk: Performance en agregaciones sobre `AuditLog`** → La tabla `AuditLog` puede crecer rápidamente (miles de registros al día). *Mitigation*: Crearemos índices en las columnas `tenant_id, fecha, accion` y, para las consultas operativas más frecuentes, se utilizarán límites (defecto 200). En caso de necesitar analíticas históricas extensas, se evaluará paginación o vistas materializadas a futuro.
- **Risk: Extracción de campos del JSONB `detalles`** → Algunas métricas pueden depender de datos serializados en JSON. Filtrar por propiedades JSON es más lento. *Mitigation*: Indexaremos el campo JSONB con GIN si es necesario, o extraeremos las llaves esenciales en las queries con `->>`.
