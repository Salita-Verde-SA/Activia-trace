## Context

El sistema gestiona múltiples tenants, y cada uno cuenta con una oferta académica particular. Para que módulos como Padrón, Calificaciones y Liquidaciones funcionen, es imperativo establecer el catálogo de Materias, las Carreras a las que pertenecen y las Cohortes (ciclos lectivos) activas.
Existen preguntas fundacionales registradas (PA-01 y PA-07) sobre si una cohorte puede pertenecer a más de una carrera, y si existe separación entre materia teórica e instancia de cursada.

## Goals / Non-Goals

**Goals:**
- Establecer un esquema central y único para `Carrera`, `Cohorte` y `Materia`, con aislamiento multi-tenant implícito por defecto.
- Exponer y proteger estas entidades con endpoints ABM bajo `/api/admin/...` y guardias de permisos para el rol `ADMIN` (`estructura:gestionar`).
- Garantizar la unicidad lógica de nombres/códigos mediante constraints en base de datos.

**Non-Goals:**
- No se implementa aún un versionado profundo de planes de estudio (materias ligadas a un plan particular con correlatividades complejas). Se mantiene simple.
- No se maneja el concepto de "Comisión" en este change, ya que es parte de la entidad `Asignacion` (E5) y el `Padron` (E6).

## Decisions

- **Cohorte vinculada a Carrera:** Se consolida que la `Cohorte` tiene una FK directa a `carrera_id`. Una cohorte pertenece a una única carrera, respondiendo afirmativamente a la restricción básica y cerrando PA-07 con el enfoque más seguro.
- **Catálogo único de Materias:** Se mantiene un solo catálogo de materias (`Materia`). Las instancias de dictado se inferirán a partir de la asociación de docentes a comisiones y materias o mediante slots de encuentros. No se crea una entidad separada para `InstanciaDictado`, cerrando PA-01.
- **Auditoría obligatoria:** Todas las creaciones o modificaciones de estas entidades generarán su respectivo `AuditLog`.
- **Restricción de Estado Carrera:** Para la regla "carrera inactiva no admite cohortes", se implementará la validación a nivel de la capa `Service`. Si se intenta crear o actualizar una cohorte en una carrera inactiva para abrirla, arrojará `HTTP 400`.

## Risks / Trade-offs

- **Risk:** Cambios futuros en el modelo institucional (ej. cohortes transversales) podrían requerir una migración de esquema compleja.
  - **Mitigation:** Mantener la relación explícita. Si luego se requiere, se podrá transicionar a una tabla intermedia, pero por ahora se sigue el principio YAGNI (You Aren't Gonna Need It).
