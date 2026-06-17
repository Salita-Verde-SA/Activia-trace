## ADDED Requirements

### Requirement: Importación de padrón y calificaciones
El sistema SHALL proveer una interfaz para que el PROFESOR importe planillas del LMS con alumnos y calificaciones, con previsualización interactiva. La materia a importar SHALL seleccionarse desde un selector dinámico cargado desde las materias con padrón activo, no desde valores hardcodeados.

#### Scenario: Vista previa exitosa
- **WHEN** el profesor selecciona una materia del selector y sube un archivo CSV/XLSX válido a través del formulario de importación.
- **THEN** la UI muestra una vista previa con las actividades detectadas (numéricas y textuales) para que seleccione cuáles importar.

#### Scenario: Importación deshabilitada sin materia seleccionada
- **WHEN** el profesor accede a la sección de importación sin haber seleccionado materia
- **THEN** el ImportWizard está deshabilitado y la UI indica que debe seleccionar una materia primero

### Requirement: Panel de alumnos atrasados y umbrales
El sistema SHALL mostrar un panel donde el PROFESOR pueda ver a los alumnos atrasados y configurar el umbral aprobatorio de su comisión. El panel SHALL cargar datos reales basados en la materia seleccionada, no datos vacíos por placeholder.

#### Scenario: Configuración de umbral
- **WHEN** el profesor ajusta el porcentaje del umbral de notas (ej. de 60% a 70%).
- **THEN** la UI recalcula y actualiza la lista de estudiantes en riesgo que caen por debajo de este nuevo límite.

#### Scenario: Visualización de notas y ranking con materia real
- **WHEN** el profesor selecciona una materia con padrón activo y calificaciones importadas
- **THEN** la UI muestra la sábana consolidada de calificaciones y el panel de alumnos atrasados con datos reales de esa materia
