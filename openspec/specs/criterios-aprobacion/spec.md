## ADDED Requirements

### Requirement: Configurar Umbral por Materia/Asignación
El sistema SHALL permitir que un docente o coordinador defina un umbral numérico (porcentaje) y/o valores de texto que se considerarán como "Aprobado" para una materia/cohorte particular.

#### Scenario: Creación o actualización de umbral
- **WHEN** un docente autorizado envía un request a `/api/calificaciones/umbral` indicando un `umbral_pct` de 60% y palabras `["Satisfactorio", "Aprobado"]`.
- **THEN** el sistema guarda o actualiza el registro en `umbral_materia` vinculado a su asignación, aislando esta regla del resto de los docentes o materias.

### Requirement: Derivación de estado de aprobación
El sistema SHALL calcular y almacenar el estado `aprobado` (booleano) automáticamente para cada calificación nueva basándose en el `UmbralMateria` activo de esa materia.

#### Scenario: Evaluación de nota numérica
- **WHEN** se importa una calificación numérica con valor `6.5` (sobre 10) y el umbral_pct configurado es `60`%.
- **THEN** el sistema guarda la `Calificacion` con `aprobado = True`.

#### Scenario: Evaluación de nota textual
- **WHEN** se importa una calificación textual con valor `"Regular"` y los valores aprobatorios del umbral son `["Satisfactorio", "Aprobado"]`.
- **THEN** el sistema guarda la `Calificacion` con `aprobado = False`.
