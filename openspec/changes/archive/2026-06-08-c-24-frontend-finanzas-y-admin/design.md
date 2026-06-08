## Context

La plataforma Active Trace cuenta con su core de backend completo (C-01 a C-20) y un frontend shell (`C-21`) con flujos académicos (`C-22` y `C-23`). El objetivo actual es implementar los módulos de Finanzas (liquidaciones de honorarios, grilla salarial) y Administración (estructura académica, usuarios, log de auditoría). Esto consumirá endpoints como `/api/liquidaciones`, `/api/admin/*`, y `/api/auditoria`.

## Goals / Non-Goals

**Goals:**
- Implementar la UI para el área de Finanzas, permitiendo cerrar liquidaciones, administrar salarios base/plus y separar facturaciones.
- Implementar la UI para Administración, permitiendo gestionar catálogos (carreras, cohortes, materias) y usuarios (roles, altas).
- Implementar visores para la auditoría (E-AUD).

**Non-Goals:**
- Modificar el backend de las liquidaciones o alterar la forma en la que se calculan.
- Implementar pasarelas de pago. La plataforma solo "liquida" y genera el reporte.

## Decisions

- **Estructuración por Sub-features**: Se crearán dos grandes features `src/features/finanzas/` y `src/features/admin/`. Cada una tendrá sus hooks de React Query apuntando a los endpoints del backend.
- **Componentes de Finanzas**: Las liquidaciones se manejarán con tablas de datos particionadas (General, Factura, NEXO). Se usará react-table o componentes similares simples con Tailwind CSS.
- **Auditoría**: Debido a que la auditoría puede tener muchos registros, se implementará con paginación delegada o virtual scrolling asumiendo el endpoint `/api/auditoria` del backend.

## Risks / Trade-offs

- **Risk**: Complejidad en la visualización segmentada de liquidaciones. → **Mitigation**: Mantener vistas tabulares claras usando filtros predefinidos por pestaña (Factura, General, Nexo).
- **Risk**: Rendimiento al cargar el log de auditoría global. → **Mitigation**: El backend ya implementa límites configurables (ej: 200 registros) y filtros server-side que serán expuestos en la UI.
