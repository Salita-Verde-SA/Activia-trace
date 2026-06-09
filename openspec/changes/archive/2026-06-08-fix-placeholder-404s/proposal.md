## Why

Cuando se navega en el dashboard frontend de Activia Trace, ciertas vistas (como Calificaciones o Monitor Global) intentan cargar datos usando un ID de `materia` por defecto o "placeholder" (`00000000-0000-0000-0000-000000000000`). Como esa materia no existe en la base de datos, el backend devuelve un error `404 Not Found` en los endpoints de `umbral` y `atrasados`, llenando la consola de errores y previniendo que la interfaz maneje un estado inicial vacío limpio. 

## What Changes

- Modificación de los endpoints del backend para manejar adecuadamente el caso del placeholder sin arrojar un error HTTP que rompa la carga de la UI, o bien:
- Validación en el frontend para evitar llamadas a la API si el `materiaId` es el placeholder `00000000-0000-0000-0000-000000000000`.
- Retornar estados iniciales o vacíos consistentes para evitar cuelgues de interfaz en el dashboard y vistas de calificaciones/monitor.

## Capabilities

### New Capabilities
- `ui-empty-states`: Manejo de estados vacíos y placeholders en el frontend de Activia Trace para evitar errores 404 durante navegación sin contexto inicial.

### Modified Capabilities

## Impact

- **Frontend**: Componentes y servicios de fetching en `features/calificaciones` y `features/analisis` que hacen polling o llamadas on-mount.
- **Backend**: (Opcional, si se elige resolver ahí) Endpoints de `analisis` y `calificaciones` para responder `200 OK` con datos vacíos ante el UUID `00000000-0000-0000-0000-000000000000`.
