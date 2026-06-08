## Context

Tras establecer los modelos base `Usuario` y `Asignacion` (C-07), el sistema requiere la capacidad de gestionar estas asignaciones en bloque para modelar "equipos docentes" enteros. En las instituciones educativas, los equipos suelen trasladarse casi idénticos de un período lectivo a otro, por lo que la carga manual uno a uno es ineficiente y propensa a errores.

## Goals / Non-Goals

**Goals:**
- Implementar asignación masiva transaccional.
- Proveer endpoints específicos para que los docentes consulten sus asignaciones (`/api/equipos/mis-equipos`).
- Implementar clonado de equipos de una cohorte o período a otro.
- Proveer soporte para exportar un equipo a CSV/Excel de forma genérica.
- Asegurar que cualquier modificación emita un evento de auditoría `ASIGNACION_MODIFICAR`.

**Non-Goals:**
- No se implementarán vistas frontend aún.
- No se manejarán las liquidaciones u honorarios en este change (eso corresponde a C-09 o C-18).

## Decisions

1. **Clonado vs Re-vinculación**: Al clonar, se crearán nuevas entidades `Asignacion` en base de datos. No reutilizamos asignaciones pasadas cambiándoles las fechas, para mantener inmutabilidad y trazas históricas claras.
2. **Endpoint `mis-equipos`**: Agrupará las asignaciones vigentes del usuario autenticado, cruzando con la tabla de materias y roles. Retornará un payload optimizado (DTO `EquipoDocenteView`).
3. **Auditoría Transaccional**: La modificación masiva utilizará el sistema de base de datos asíncrono y los eventos de SQLAlchemy (o triggers en su defecto) para asegurar que se cree un log de auditoría por cada `Asignacion` tocada, dentro de la misma transacción.

## Risks / Trade-offs

- **Performance en Clonado Masivo**: Si los equipos son gigantes (miles de docentes), el clonado HTTP síncrono podría causar un timeout.
  - *Mitigación*: Se evaluará si se puede hacer asíncrono o, dado que un equipo de cátedra promedio no excede las 50 personas, un endpoint síncrono que inserte en bulk es totalmente razonable para esta fase.
- **Conflictos Temporales**: Puede haber traslape de fechas si un usuario es asignado al mismo rol en el mismo contexto con diferentes fechas.
  - *Mitigación*: En el backend, validar que no existan overlaps de fechas en la base de datos al momento de crear o clonar asignaciones, o permitirlo bajo ciertas reglas explícitas de negocio (RN-12).
