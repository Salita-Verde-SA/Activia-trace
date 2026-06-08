## Why

La plataforma actualmente cuenta con el backend necesario para procesar calificaciones (`C-10`), analizar estudiantes atrasados y generar reportes (`C-11`), y encolar comunicaciones (`C-12`). Sin embargo, el equipo docente no cuenta aún con una interfaz gráfica para interactuar con estos flujos. Este change provee la experiencia de usuario esencial para que los docentes gestionen sus comisiones, importen notas, detecten alumnos en riesgo y se comuniquen fluidamente con ellos de forma masiva.

## What Changes

- Creación de interfaz para la gestión de comisiones por parte del PROFESOR.
- UI para importación de calificaciones desde el LMS con vista previa interactiva y selección de actividades.
- UI para visualización del listado de alumnos atrasados y configuración del umbral de notas de la materia.
- Vistas de ranking de actividades, reportes rápidos y notas finales consolidadas.
- Interfaz para vista previa, configuración y envío de comunicaciones a alumnos atrasados, con tracking de estado.
- Vistas de monitoreo general para el seguimiento de alumnos (vista tutor/profesor).

## Capabilities

### New Capabilities
- `gestion-comision-docente`: Interfaz para que docentes gestionen calificaciones, importación, y análisis de riesgo de alumnos.
- `comunicacion-masiva-ui`: Interfaz para enviar y monitorear comunicaciones a alumnos atrasados.

### Modified Capabilities
- No se modifican los requerimientos core backend existentes, solo se les da exposición en frontend.

## Impact

- **Frontend (`frontend/src/features/`):** Se crearán nuevos features como `comisiones`, `calificaciones`, y `comunicaciones` con sus respectivos componentes, hooks de React Query, páginas y tests E2E/integración.
- **Backend:** Nulo o mínimo (solo consumir rutas existentes de la API protegidas para el PROFESOR).
