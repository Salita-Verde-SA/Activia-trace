## Context

Activia Trace fue diseñado como una plataforma multi-tenant con múltiples roles. Si bien se completó la construcción de la lógica del backend para los alumnos (ver avisos, ver estado, gestionar coloquios), en el roadmap original (`CHANGES.md`) no se prescribió ninguna épica o tarea para la interfaz (SPA) del alumno. Al ingresar, un usuario con el rol `ALUMNO` puede ver el dashboard genérico pero carece de cualquier menú lateral funcional o página dedicada. Este diseño resuelve esa deuda implementando vistas enfocadas y consumiendo la API existente.

## Goals / Non-Goals

**Goals:**
- Implementar la interfaz visual para que el ALUMNO interactúe con el backend existente.
- Acomodar `Sidebar.tsx` y `App.tsx` para exponer rutas exclusivas bajo `/alumno`.
- Componentes para leer y hacer "ack" de avisos, visualizar notas consolidadas, y realizar reservas.

**Non-Goals:**
- Realizar cambios estructurales en el backend o en el modelo de base de datos.
- Proveer una app móvil (sólo PWA/Web responsiva).
- Agregar nuevas lógicas de negocio; el alcance es puramente consumo de API.

## Decisions

1. **Estructura Modular**: Todos los componentes y vistas estarán aislados dentro de `frontend/src/features/alumno/`. Esto mantiene el patrón feature-based adoptado en `C-21`.
2. **React Query para Re-fetch**: Al ser datos que cambian (como el estado de un aviso no leído), se utilizarán tags de react-query y mutation onSuccess para hacer el invalidate de queries, evitando recargas completas.
3. **Sidebar Condicional**: Se agregará explícitamente en `Sidebar.tsx` las opciones "Mis Materias", "Mis Avisos", "Coloquios" y se acotarán al rol `ALUMNO` en el arreglo de `roles`.

## Risks / Trade-offs

- **[Risk]** Consumo excesivo de la API al montar el portal si hay muchos avisos no leídos.
  → **Mitigation**: Paginación y uso eficiente de useInfiniteQuery o listas virtuales si es estrictamente necesario, aunque al tratarse de avisos académicos activos, la cantidad usualmente es manejable (10-20).
- **[Risk]** Error en el guard que permita a alumnos ver rutas de docentes.
  → **Mitigation**: El Router de `App.tsx` debe envolver correctamente las rutas. De todas maneras, el backend ya responde 403.
