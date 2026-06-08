## Context

El sistema cuenta con un backend maduro para el manejo transversal y administrativo de Activia-trace. Sin embargo, toda la operativa global de configuración del cuatrimestre, publicación de avisos institucionales y gestión de equipos y tareas internas, aún no cuenta con representación visual. Esto limita al COORDINADOR y al ADMIN a depender de llamadas directas a la API o interacciones sin interfaz.

## Goals / Non-Goals

**Goals:**
- Estructurar el menú lateral del `MainLayout` para roles `COORDINADOR` y `ADMIN` exponiendo los nuevos módulos.
- Implementar vistas CRUD y tableros operativos para: Avisos, Tareas, Equipos Docentes y Setup del Cuatrimestre.
- Proveer paneles unificados para monitores globales.

**Non-Goals:**
- No se realizarán implementaciones de backend, excepto configuraciones mínimas requeridas por Pydantic/CORS si surge algún error de consumo.
- No se incluirán vistas exclusivas del estudiante, estas pertenecen a un change independiente (como el de inscripciones u otros).
- No se añadirán nuevas entidades a la base de datos.

## Decisions

- **Estructuración por Sub-features:** Se usarán dominios en `src/features/` como `avisos`, `tareas`, `coordinacion` y `equipos`.
- **Integración con Router:** Se agregarán rutas hijas a `/` con protección de roles (verificando `require_permission` a nivel de vista o confiando en el 403 del backend más un handler de error global).
- **Widgets y Dashboards:** Para los monitores transversales, se construirán tarjetas de resumen de Tailwind que hagan llamadas concurrentes a las APIs analíticas y de auditoría.
- **Formularios Dinámicos:** El setup de cuatrimestre será un formulario multi-paso (Wizard) similar al `ImportWizard` pero diseñado para flujos más densos.

## Risks / Trade-offs

- **Carga de Red Excesiva en Monitores:** Hacer llamados masivos a endpoints de auditoría/reportes simultáneamente puede lentificar el navegador.
  **Mitigación:** Usar `useQueries` de React Query con configuración de `staleTime` elevada para evitar un re-fetch automático descontrolado.
- **Complejidad del Setup Cuatrimestre:** Integrar programas y fechas académicas puede requerir una UX compleja.
  **Mitigación:** Dividir la carga cognitiva en pestañas claras (Ej: 1. Programas, 2. Calendario, 3. Docentes).
