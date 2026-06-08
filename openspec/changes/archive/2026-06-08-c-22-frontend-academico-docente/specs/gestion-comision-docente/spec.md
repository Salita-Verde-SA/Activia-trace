## ADDED Requirements

### Requirement: Importación de padrón y calificaciones
El sistema SHALL proveer una interfaz para que el PROFESOR importe planillas del LMS con alumnos y calificaciones, con previsualización interactiva.

#### Scenario: Vista previa exitosa
- **WHEN** el profesor sube un archivo CSV/XLSX válido a través del formulario de importación.
- **THEN** la UI muestra una vista previa con las actividades detectadas (numéricas y textuales) para que seleccione cuáles importar.

### Requirement: Panel de alumnos atrasados y umbrales
El sistema SHALL mostrar un panel donde el PROFESOR pueda ver a los alumnos atrasados y configurar el umbral aprobatorio de su comisión.

#### Scenario: Configuración de umbral
- **WHEN** el profesor ajusta el porcentaje del umbral de notas (ej. de 60% a 70%).
- **THEN** la UI recalcula y actualiza la lista de estudiantes en riesgo que caen por debajo de este nuevo límite.

#### Scenario: Visualización de notas y ranking
- **WHEN** el profesor accede al panel de seguimiento.
- **THEN** la UI muestra la tabla consolidada de calificaciones, un ranking de estudiantes y alertas de TP faltantes.
