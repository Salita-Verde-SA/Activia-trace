## Why

La plataforma Activia-trace ha madurado su backend para múltiples procesos clave (equipos docentes, tareas, fechas académicas, avisos, coloquios y monitor transversal) a través de los changes `C-08`, `C-13`, `C-14`, `C-15`, `C-16` y `C-17`. Sin embargo, los roles de **COORDINADOR** y **ADMIN** carecen de una interfaz gráfica que les permita orquestar estos procesos, configurar el cuatrimestre y gestionar la operación global. Se necesita consolidar estas herramientas en el frontend administrativo.

## What Changes

- Creación de interfaz gráfica para el Setup de Cuatrimestre (Flujo FL-03), integrando programas, calendarios y asignaciones.
- Vistas de gestión de Equipos Docentes: asignaciones masivas, clonado de asignaciones de cohortes anteriores, configuración de vigencia y exportación.
- Panel de Avisos Institucionales: ABM con configuración de scope (quién lo ve) y tracking de lectura (ack).
- Panel de Tareas Internas y Workflow: Gestión y seguimiento del progreso de tickets/tareas de backoffice.
- Monitores Transversales: Dashboards para seguimiento global de actividad en la plataforma (F2.7, F2.9).
- Vistas de administración para Encuentros y Convocatorias a Coloquios.

## Capabilities

### New Capabilities
- `coordinacion-equipos-docentes`: UI para gestionar asignaciones, vigencias y operaciones masivas de profesores.
- `coordinacion-avisos`: UI para publicar comunicados y avisos con seguimiento de lectura.
- `coordinacion-tareas-workflow`: UI para gestionar las tareas internas del backoffice.
- `coordinacion-setup-cuatrimestre`: Interfaz de Setup (FL-03) unificando programas y fechas académicas.
- `coordinacion-monitor-global`: Dashboard transversal de métricas y seguimientos.

### Modified Capabilities
- No se modifican los requerimientos core backend existentes, solo se habilitan paneles frontend para exponer estos flujos y consumirlos.

## Impact

- **Frontend (`frontend/src/features/`):** Se crearán sub-features orientados a la administración (equipos, avisos, tareas, setup y monitores). Habrá un impacto significativo en el enrutado interno del layout principal de `C-21` agregando los módulos de coordinación.
- **Backend:** Impacto mínimo. Posiblemente solo ajustes de validación de CORS o permisos de CORS si es necesario, pero las rutas ya están implementadas bajo sus respectivos changes.
