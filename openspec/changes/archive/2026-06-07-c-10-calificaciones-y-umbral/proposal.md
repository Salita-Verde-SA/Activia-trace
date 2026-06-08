## Why

Una vez que el sistema cuenta con el padrón de alumnos (C-09), el siguiente paso crítico es procesar sus calificaciones. Se necesita la capacidad de importar reportes de notas desde plataformas LMS (Moodle u otras) o archivos Excel, procesarlos y determinar automáticamente si cada estudiante aprobó o no una actividad, basándose en reglas y umbrales configurables por cada docente. Esto es vital para el posterior cálculo de honorarios y alertas tempranas de atrasos.

## What Changes

- **Modelos**: Se crearán los modelos `Calificacion` y `UmbralMateria`.
  - `Calificacion` guardará notas numéricas y/o textuales, determinando dinámicamente si el alumno está "aprobado" basado en el umbral.
  - `UmbralMateria` permitirá configurar porcentajes y palabras clave aprobatorias (ej. "Satisfactorio") por cada asignación docente, permitiendo personalizar los criterios de evaluación.
- **Importación de Calificaciones**: Nuevo flujo para subir reportes de calificaciones del LMS (F1.1), que detecte automáticamente columnas numéricas (RN-01) y textuales (RN-02), y permita al usuario previsualizar y seleccionar qué actividades importar.
- **Importación de Reportes de Finalización**: Nuevo flujo para detectar trabajos prácticos o actividades que constan como entregadas o finalizadas pero que no tienen nota numérica (F1.2).
- **Configuración de Umbrales**: Endpoints para que los docentes establezcan su porcentaje mínimo de aprobación (por defecto 60%) y sus valores textuales válidos (F2.1, RN-03).
- **Auditoría**: Generación de logs `CALIFICACIONES_IMPORTAR` al importar notas.

## Capabilities

### New Capabilities
- `calificaciones-importacion`: Lógica y endpoints para subir y procesar archivos de calificaciones y reportes de finalización, incluyendo la vista previa y selección de columnas.
- `criterios-aprobacion`: Lógica y endpoints para configurar los umbrales de materia (`UmbralMateria`) y derivar el estado de aprobación de las notas.

### Modified Capabilities
- (Sin capacidades modificadas. Se introducen nuevas capacidades independientes).

## Impact

- **API**: Se agregan rutas bajo `/api/calificaciones/*` para importaciones y configuración de umbrales.
- **Base de Datos**: Nuevas tablas `calificacion` y `umbral_materia`.
- **Reglas de Negocio**: Implementación de las lógicas complejas de RN-01, RN-02 y RN-03 para el parseo dinámico de planillas y la determinación automática del estado de aprobación según la configuración específica del docente asignado.
