## 1. Setup y Tipos (Calificaciones y Atrasados)

- [x] 1.1 Crear tipos de TypeScript para la importación y previsualización de calificaciones en `src/features/calificaciones/types/`.
- [x] 1.2 Configurar servicios de Axios para endpoints de calificaciones (`/api/calificaciones`) y umbrales.
- [x] 1.3 Configurar hooks de React Query (`useImportarCalificaciones`, `useConfigurarUmbral`, etc.).

## 2. UI: Importación y Análisis

- [x] 2.1 Crear componente `ImportWizard` que permite subir el CSV/XLSX, enviar a `/preview` y mostrar resultados seleccionables.
- [x] 2.2 Crear panel de configuración de `Umbral` donde el profesor puede modificar y guardar el porcentaje (0-100%).
- [x] 2.3 Crear componente `AtrasadosPanel` que muestra la lista de alumnos en riesgo tras aplicar el umbral.
- [x] 2.4 Integrar vistas en `CalificacionesPage.tsx` accesible bajo el rol de `PROFESOR`.

## 3. Comunicaciones y Tracking

- [x] 3.1 Crear tipos y servicios Axios para `/api/comunicaciones` en `src/features/comunicaciones/`.
- [x] 3.2 Crear componente de redacción de mensaje masivo (`ComunicacionComposer`) con preview dinámico usando hooks.
- [x] 3.3 Crear componente de estado de encolado (`EnvioTracker`) que haga polling/refetch sobre el `lote_id` para ver progreso.
- [x] 3.4 Integrar flujos de comunicación con el botón "Contactar Atrasados" en el `AtrasadosPanel`.

## 4. Tests y Validación

- [x] 4.1 Escribir test de componentes para el `ImportWizard`.
- [x] 4.2 Escribir test de integración (con mocks) para la actualización interactiva de la lista de atrasados al cambiar el umbral.
- [x] 4.3 Escribir test de componentes para `ComunicacionComposer` validando el reemplazo de placeholders en la vista previa.
