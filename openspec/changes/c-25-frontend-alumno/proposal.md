## Why

El sistema cuenta actualmente con toda la lógica de backend para los alumnos (visualizar su estado académico, confirmar lectura de avisos, reservar turnos para evaluación/coloquio), pero nunca se implementaron las pantallas frontend correspondientes en la planificación original. Para que los alumnos puedan interactuar con Activia Trace, necesitamos construir un portal del alumno con sus vistas específicas, cerrando así el ciclo completo del usuario.

## What Changes

- Construcción del portal del alumno con rutas protegidas (`/alumno/*`).
- Modificación del menú de navegación (Sidebar) para incluir las opciones propias del alumno.
- Pantalla de inicio "Mi Estado Académico": vista de sus calificaciones finales y materias en curso.
- Pantalla "Mis Avisos": vista centralizada para leer y confirmar (`acknowledgment`) los avisos enviados por docentes y coordinación.
- Pantalla "Mis Turnos/Coloquios": vista para buscar llamados activos a evaluación y efectuar/cancelar reservas de cupos.
- Actualización de `CHANGES.md` para registrar formalmente el change `C-25` en la documentación del proyecto.

## Capabilities

### New Capabilities
- `frontend-alumno-avisos`: Visualización y confirmación de lectura de avisos dirigidos al rol ALUMNO o a su cohorte/materia.
- `frontend-alumno-estado`: Visualización de calificaciones finales obtenidas en materias.
- `frontend-alumno-reservas`: Búsqueda de coloquios abiertos y gestión de reserva de cupo por parte del estudiante.

### Modified Capabilities
- `frontend-shell`: Modificación del layout y sidebar para acomodar las nuevas rutas exclusivas del rol ALUMNO.

## Impact

- **Frontend**: Se agregan nuevos componentes, vistas y rutas dentro de `src/features/alumno/`. Se modifica `Sidebar.tsx` y `App.tsx`.
- **Backend**: No hay impacto en backend; los endpoints de avisos, calificaciones y coloquios requeridos por el rol ALUMNO ya existen.
- **Documentación**: Modificación de `CHANGES.md` para asentar `C-25`.
