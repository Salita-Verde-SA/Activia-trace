## Why

El backend de gestión académica y financiera ya fue construido en C-06, C-07, C-18 y C-19. Ahora es necesario proveer la interfaz de usuario para que los administradores y responsables de finanzas operen la plataforma de forma autónoma. Esto es clave para centralizar la gestión de liquidaciones de honorarios y la auditoría de la plataforma para un tenant completo.

## What Changes

- Creación del módulo de **FINANZAS**: 
  - Panel de vista de liquidaciones segmentado por (general / NEXO / factura) con sus respectivos KPIs.
  - Flujo para el cierre inmutable de liquidaciones.
  - Vistas del historial de liquidaciones pasadas.
  - Interfaz ABM para configurar la grilla salarial (Salarios Base y Plus).
  - Vistas de gestión y exclusión contable para las facturas de los docentes.
- Creación del módulo de **ADMIN**:
  - ABM de estructura académica (carreras, cohortes, materias).
  - Gestión integral de usuarios del tenant (creación, bloqueo, asignación a roles).
  - Panel de métricas y visualización de registros de auditoría (AuditLog) con filtros avanzados.
- Se consumirán los servicios construidos previamente (`api/liquidaciones`, `api/admin/carreras`, `api/admin/usuarios`, `api/auditoria`, etc.).

## Capabilities

### New Capabilities
- `finanzas-liquidaciones`: Gestión de cálculo, KPIs, segmentación y cierre inmutable de liquidaciones.
- `finanzas-grilla-salarial`: Configuración de Salarios Base y Plus.
- `admin-estructura-academica`: ABM de Carreras, Cohortes y Materias por tenant.
- `admin-gestion-usuarios`: Alta, modificación de roles y visualización de usuarios.
- `admin-auditoria`: Monitores y log completo filtrable de auditoría (E-AUD).

### Modified Capabilities

## Impact

- **UI/UX**: Nuevas rutas bajo `/admin/*` y `/finanzas/*` en la SPA central (construida en C-21).
- **Backend**: Solo se consumen endpoints ya implementados, no hay modificaciones estructurales a la API.
- **Testing**: Incorporación de nuevas pruebas de componentes para asegurar correctas visualizaciones y cierres de liquidación.
