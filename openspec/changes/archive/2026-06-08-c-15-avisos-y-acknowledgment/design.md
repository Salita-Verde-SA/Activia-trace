## Context
La institución necesita comunicar eventos críticos (ej. cierre de cuatrimestre, cambios en mesas de examen) o información regular a grupos específicos de alumnos y docentes. El requisito no solo es emitir el aviso, sino poder asegurar legal o administrativamente que fue recibido mediante un mecanismo de "acuse de recibo".

## Goals / Non-Goals

**Goals:**
- Implementar el almacenamiento y la consulta segmentada de los avisos (`Aviso`).
- Modelar el registro de lectura explícita (`AcknowledgmentAviso`).
- Permitir segmentar el aviso a toda la institución, a una materia, cohorte o a un rol determinado.

**Non-Goals:**
- No reemplaza al módulo de comunicaciones salientes (email). Los avisos son "in-app". Se puede agregar luego la opción de que el aviso *además* dispare un correo, pero el foco inicial es la notificación dentro del sistema.

## Decisions
- **Lectura obligatoria bloqueante**: El campo `requiere_ack` forzará a la UI cliente a solicitar la lectura del aviso antes de que el usuario interactúe con el resto del sistema, aunque la lógica puramente bloqueante vivirá en el frontend mediante una comprobación al arrancar la sesión de si hay avisos críticos pendientes de lectura.
- **Acuse de recibo explícito**: Solo se registra que un aviso fue leído cuando el alumno explícitamente llama al endpoint para hacer "ack", insertando en `AcknowledgmentAviso`.
- **Métricas On-the-fly**: La métrica de cuántos leyeron vs cuántos faltan se calculará de la intersección entre el padrón del segmento afectado (materia/cohorte) y la tabla de `AcknowledgmentAviso`.

## Risks / Trade-offs
- **[Trade-off]** Cálculo del alcance: Si un aviso es global, el total de posibles lectores es todo el tenant. Si es por cohorte, solo los alumnos vigentes en esa cohorte. Calcular los pendientes requerirá joins pesados en lecturas intensivas.
  - **Mitigation**: El panel de métricas no estará hiper-optimizado para tiempo real en milisegundos; si es necesario se indexarán `materia_id` y `cohorte_id` en las asignaciones y padrones para acelerar el cálculo.
