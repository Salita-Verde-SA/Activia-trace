## ADDED Requirements

### Requirement: Configurar Umbral por Materia/Asignación
El sistema SHALL permitir que un docente o coordinador defina un umbral numérico (porcentaje) y/o valores de texto que se considerarán como "Aprobado" para una materia/cohorte particular.

#### Scenario: Creación o actualización de umbral
- **WHEN** un docente autorizado envía un request a `/api/calificaciones/umbral` indicando un `umbral_pct` de 60% y palabras `["Satisfactorio", "Aprobado"]`.
- **THEN** el sistema guarda o actualiza el registro en `umbral_materia` vinculado a su asignación, aislando esta regla del resto de los docentes o materias.

### Requirement: Derivación de estado de aprobación
El sistema SHALL calcular el estado de aprobación de una calificación tanto en tiempo de importación (guardando en `Calificacion.aprobado`) como en tiempo de consulta de análisis (recalculando contra el umbral vigente). Los reportes de análisis (atrasados, ranking, sábana) SHALL usar el umbral vigente al momento de la consulta como fuente de verdad, no el valor almacenado en `Calificacion.aprobado`.

#### Scenario: Evaluación de nota numérica en importación
- **WHEN** se importa una calificación numérica con valor `6.5` (sobre 10) y el umbral_pct configurado es `60`%.
- **THEN** el sistema guarda la `Calificacion` con `aprobado = True` (65 >= 60).

#### Scenario: Evaluación de nota textual en importación
- **WHEN** se importa una calificación textual con valor `"Regular"` y los valores aprobatorios del umbral son `["Satisfactorio", "Aprobado"]`.
- **THEN** el sistema guarda la `Calificacion` con `aprobado = False`.

#### Scenario: Cambio de umbral recalcula análisis sin re-importar
- **WHEN** un docente modifica el umbral de 60% a 50% sin re-importar el CSV.
- **THEN** el reporte de atrasados refleja el nuevo umbral inmediatamente, mostrando como aprobados a alumnos que antes figuraban como reprobados por el umbral anterior.
