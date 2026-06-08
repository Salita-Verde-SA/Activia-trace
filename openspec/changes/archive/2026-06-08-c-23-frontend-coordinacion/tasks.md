## 1. Setup y Tipos
- [x] 1.1 Crear tipos de TypeScript para APIs de Equipos Docentes (`Asignacion`, `Vigencia`).
- [x] 1.2 Crear tipos de TypeScript para Avisos y Tareas Internas (`Aviso`, `Acuse`, `Ticket`).
- [x] 1.3 Configurar hooks de React Query base para ambos módulos (`useAvisos`, `useTareas`, `useEquipos`).

## 2. Coordinación: Equipos Docentes
- [x] 2.1 Crear componente `EquiposPanel` para listar las asignaciones activas de la materia seleccionada.
- [x] 2.2 Crear modal `CloneAsignacionesModal` para clonar un equipo de una cohorte previa.
- [x] 2.3 Crear modal `VigenciaEditor` para editar las fechas de alta y baja de la asignación docente.

## 3. Coordinación: Avisos y Comunicados
- [x] 3.1 Crear página `AvisosAdminPage` para el ABM de comunicados institucionales.
- [x] 3.2 Desarrollar el formulario de creación de avisos con soporte para el flag `requiere_acuse` y segmentación.
- [x] 3.3 Crear componente `AckTracker` para visualizar en tiempo real quiénes han confirmado lectura.

## 4. Coordinación: Setup Cuatrimestre
- [x] 4.1 Crear el flujo wizard `SetupCuatrimestreWizard` (Paso 1: Cohortes y Programas, Paso 2: Fechas Académicas).
- [x] 4.2 Conectar el wizard con los hooks para ejecutar las mutaciones de inicialización.

## 5. Coordinación: Tareas y Workflow
- [x] 5.1 Crear vista de tablero (Kanban/Lista) `TareasBoard` para tickets internos.
- [x] 5.2 Implementar funcionalidad drag-and-drop o dropdowns para cambiar de estado (Ej: Pendiente -> En Progreso).

## 6. Monitores y Dashboards
- [x] 6.1 Crear la página principal `MonitorGlobalPage` y su ruta `/admin/monitor`.
- [x] 6.2 Integrar widgets estadísticos (KPIs de alumnos activos, % entregas corregidas, tickets abiertos).

## 7. Pruebas e Integración
- [x] 7.1 Escribir pruebas para el componente de clonado de equipos docentes.
- [x] 7.2 Escribir pruebas unitarias del formulario de publicación de Avisos garantizando su segmentación.
