## 1. Setup y Enrutamiento

- [x] 1.1 Crear directorio `src/features/alumno` con subcarpetas `components`, `hooks`, `pages`, `services`, `types`.
- [x] 1.2 Agregar las rutas del alumno en `App.tsx` bajo `/alumno/*` y protegidas por un rol o layout genérico (`MiEstadoPage`, `MisAvisosPage`, `MisColoquiosPage`).
- [x] 1.3 Modificar `Sidebar.tsx` para inyectar "Mi Estado", "Mis Avisos" y "Coloquios" con el rol `ALUMNO`.

## 2. API Services

- [x] 2.1 Crear `alumnoApi.ts` en `src/features/alumno/services/` para interactuar con las APIs existentes de backend de avisos y coloquios (`/api/v1/avisos/mis-avisos`, `/api/coloquios/...`).
- [x] 2.2 Crear custom hooks de React Query (`useAvisosAlumno`, `useColoquiosAlumno`) para abstraer el fetching.

## 3. UI: Mis Avisos

- [x] 3.1 Construir `AvisoCard.tsx` que reciba el aviso y permita marcar como leído (botón "Confirmar Lectura").
- [x] 3.2 Construir `MisAvisosPage.tsx` que liste los avisos activos. Al clickear "Confirmar Lectura", se llama a la API de acknowledgment y se refresca la vista.

## 4. UI: Mis Coloquios y Estado

- [x] 4.1 Construir `MisColoquiosPage.tsx` que muestre una tabla o tarjetas de turnos de coloquios disponibles.
- [x] 4.2 Agregar funcionalidad de reserva (botón "Reservar") con alerta de éxito/error.
- [x] 4.3 Construir `MiEstadoPage.tsx` que muestre un listado de materias y estado final/promedio consumiendo la API de calificaciones.

## 5. Integración Final y Documentación

- [x] 5.1 Modificar `CHANGES.md` para asentar el change `C-25` en el listado de fases, y marcarlo como `[x] completado`.
