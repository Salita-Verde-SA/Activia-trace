## ADDED Requirements

### Requirement: Importar CSV de calificaciones Moodle
El sistema SHALL permitir subir un archivo CSV (formato Moodle) para extraer calificaciones numéricas o textuales de las actividades.

#### Scenario: Vista previa exitosa
- **WHEN** un docente sube un archivo de calificaciones y selecciona la materia/cohorte.
- **THEN** el sistema parsea los headers, filtra datos basuras ("Nombre", "Email") y devuelve una vista previa con las actividades detectadas para que el docente seleccione cuáles importar.

#### Scenario: Importación confirmada
- **WHEN** el docente confirma las columnas seleccionadas desde la vista previa.
- **THEN** el sistema inserta registros en la tabla `calificacion` por cada estudiante en el padrón, calculando el campo `aprobado` con base al `UmbralMateria` vigente, e inserta un log de auditoría `CALIFICACIONES_IMPORTAR`.

### Requirement: Importar Reporte de Finalización
El sistema SHALL permitir subir un archivo de "reporte de finalización" donde las actividades constan como entregadas sin nota numérica.

#### Scenario: Parseo de reporte de finalización
- **WHEN** el usuario sube el reporte indicando que es modo "finalización".
- **THEN** las columnas seleccionadas se guardan con una nota textual genérica (ej. "Entregado") y el campo `aprobado` se fuerza a True, omitiendo la verificación numérica.
