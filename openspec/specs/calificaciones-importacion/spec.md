## Purpose

Importación de calificaciones (CSV Moodle y reportes de finalización) al padrón real de una materia, de forma idempotente y con cálculo de aprobación según el umbral vigente.
## Requirements
### Requirement: Importar CSV de calificaciones Moodle
El sistema SHALL permitir subir un archivo CSV (formato Moodle) para extraer calificaciones numéricas o textuales de las actividades. El import SHALL usar `version_padron_id` real obtenido del selector de materia, nunca un UUID placeholder. La confirmación de importación SHALL ser idempotente: re-importar el mismo conjunto de actividades para una versión de padrón SHALL dejar exactamente una calificación viva por `(entrada_padron_id, actividad_nombre)`, reemplazando (soft delete + insert) las calificaciones previas del mismo origen en lugar de acumularlas.

#### Scenario: Vista previa exitosa
- **WHEN** un docente sube un archivo de calificaciones y selecciona la materia/cohorte.
- **THEN** el sistema parsea los headers, filtra datos basura ("Nombre", "Email") y devuelve una vista previa con las actividades detectadas para que el docente seleccione cuáles importar.

#### Scenario: Importación confirmada con padrón real
- **WHEN** el docente confirma las columnas seleccionadas con una materia real seleccionada desde el selector
- **THEN** el sistema inserta registros en la tabla `calificacion` para los alumnos en el padrón real (`version_padron_id` válido), calculando el campo `aprobado` con base al `UmbralMateria` vigente, e inserta un log de auditoría `CALIFICACIONES_IMPORTAR`.

#### Scenario: Re-importación no duplica calificaciones
- **WHEN** el docente confirma una importación de las mismas actividades para una versión de padrón que ya tenía calificaciones de esas actividades
- **THEN** el sistema soft-deletea las calificaciones vivas previas de cada `(entrada_padron_id, actividad_nombre)` afectada antes de insertar las nuevas, dejando exactamente una calificación viva por alumno y actividad.

#### Scenario: Unicidad garantizada por la base
- **WHEN** se intenta insertar una segunda calificación viva con el mismo `(tenant_id, entrada_padron_id, actividad_nombre)`
- **THEN** la restricción de unicidad parcial (`deleted_at IS NULL`) de la base rechaza la inserción, impidiendo duplicados aun ante fallas del servicio.

#### Scenario: Importación sin padrón seleccionado
- **WHEN** el docente intenta confirmar el import sin haber seleccionado una materia
- **THEN** el botón de confirmación está deshabilitado y la UI muestra "Seleccioná una materia primero"

### Requirement: Importar Reporte de Finalización
El sistema SHALL permitir subir un archivo de "reporte de finalización" donde las actividades constan como entregadas sin nota numérica.

#### Scenario: Parseo de reporte de finalización
- **WHEN** el usuario sube el reporte indicando que es modo "finalización".
- **THEN** las columnas seleccionadas se guardan con una nota textual genérica (ej. "Entregado") y el campo `aprobado` se fuerza a True, omitiendo la verificación numérica.

