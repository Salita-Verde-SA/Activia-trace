## Context

Este change provee la interfaz gráfica para el rol PROFESOR. El backend ya tiene implementados los endpoints necesarios en `C-10`, `C-11` y `C-12`. Se requiere una SPA modular en React que utilice `react-query` para gestionar la asincronicidad, `react-hook-form` para captura de datos y validaciones, y Tailwind CSS para el diseño visual de la gestión académica.

## Goals / Non-Goals

**Goals:**
- Implementar las vistas de gestión de comisiones (importar padrón/calificaciones).
- Proveer paneles interactivos para análisis de riesgo (atrasados) y umbrales.
- Integrar la experiencia de envío de comunicaciones usando el sistema de encolado existente.
- Reutilizar el shell del frontend base (`C-21`).

**Non-Goals:**
- No se diseñarán vistas para estudiantes en este change.
- No se implementarán vistas para el rol Coordinador ni Administrador Global (eso es `C-23` y `C-24`).
- No se realizarán cambios de esquema ni lógica fuerte en el backend.

## Decisions

- **Estructura de Features:** Todo el código se organizará bajo `src/features/comisiones`, `src/features/calificaciones` y `src/features/comunicaciones`.
- **Manejo de Estado Global:** Se confiará en `@tanstack/react-query` para la sincronización con el backend. Solo se utilizará estado local (`useState`, `useReducer`) para control de UI efímero (modales, pasos del wizard de importación).
- **Componentes de UI:** Se usarán componentes controlados genéricos. Para las tablas de alumnos y atrasados se procurará un enfoque de tabla básica con ordenamiento simple local si la paginación no se maneja del lado del servidor.
- **Validación de Formularios:** Se integrará `zod` con `react-hook-form` para configurar umbrales y redactar mensajes.
- **Interacción con el backend:** Todos los hooks de datos usarán las funciones ya provistas por el cliente `Axios` autenticado, pasándole el `Bearer token` dinámicamente.

## Risks / Trade-offs

- **Carga de archivos (Preview vs Commit):** El manejo de archivos grandes en React puede trabar el thread. **Mitigación:** Enviar el archivo directo a un endpoint de parseo (`/api/calificaciones/import/preview`) y mostrar los resultados, sin parsear CSV/XLSX en JavaScript cliente puro.
- **WebSocket / SSE para Tracking de Estado:** La comunicación asíncrona (workers) actualiza el estado. **Mitigación:** Si no hay sockets configurados, usaremos polling (`refetchInterval` de react-query) en las vistas de estado de envío masivo.
