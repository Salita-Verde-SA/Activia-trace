## Context

Activia-trace ahora cuenta con el padrón de alumnos (gracias al change C-09). Para poder trazar el rendimiento académico y generar liquidaciones precisas, necesitamos registrar las calificaciones. Las fuentes de estas calificaciones son variadas: pueden provenir de Moodle u otras plataformas LMS exportadas como Excel/CSV. Además, diferentes docentes o materias tienen distintos criterios de aprobación (porcentajes de nota numérica o palabras clave en evaluaciones cualitativas). 

## Goals / Non-Goals

**Goals:**
- Definir un modelo unificado `Calificacion` que soporte notas numéricas, cualitativas (textuales), y determine si el estudiante aprobó dicha actividad (campo derivado).
- Crear el modelo `UmbralMateria` que almacena los porcentajes y valores textuales aprobatorios.
- Proveer un mecanismo dinámico para parsear archivos de calificaciones (F1.1) y reportes de finalización sin nota (F1.2), detectando columnas clave.
- Proveer vista previa de importación.

**Non-Goals:**
- Procesamiento en tiempo real o integraciones continuas/Webhooks con el LMS para calificaciones (se hace por importación manual / on-demand en esta fase).
- Lógica de liquidación de honorarios (C-18), este change solo prepara los datos.

## Decisions

1. **Determinación de `aprobado` (Derivación)**: 
   - *Decisión*: El campo `aprobado` en `Calificacion` se calculará en el backend en el momento de la ingesta (importación) basado en el `UmbralMateria` vigente en ese instante, guardándose como un booleano duro en la base de datos.
   - *Rationale*: Evita recálculos masivos costosos cada vez que se leen las notas. Si el umbral cambia, no afecta retroactivamente a las notas ya subidas a menos que se re-importen o se solicite una recalibración explícita.
   
2. **Columnas dinámicas vs fijas (RN-01 y RN-02)**:
   - *Decisión*: El servicio de parsing leerá los headers del archivo. Retornará al frontend una vista previa que intenta inferir columnas de actividades (ignora "Nombre", "Email"). El usuario deberá confirmar qué columnas importar.
   - *Rationale*: Los exportes de Moodle varían enormemente según cómo el docente arme las actividades. Un mapeo heurístico + confirmación manual reduce errores y flexibiliza el uso.

3. **Reportes de Finalización (F1.2)**:
   - *Decisión*: Si un archivo se marca como "reporte de finalización", las columnas seleccionadas se guardan como `nota_textual = "Entregado"` (o similar) y se marcan como `aprobado = True` de forma directa, saltándose la lógica del umbral numérico.
   - *Rationale*: Aborda directamente los casos donde Moodle solo marca con un "check" o estado "Finalizado" a los TPs.

## Risks / Trade-offs

- **[Riesgo] Formatos de exportación impredecibles** → *Mitigación*: Fuerte dependencia en la fase de "vista previa" y selección humana. El backend sugerirá mapeos, pero el docente/coordinador tendrá la palabra final antes de confirmar la inserción de las filas a la tabla `Calificacion`.
- **[Riesgo] Recálculo si cambia el umbral** → *Mitigación*: Se asume que el umbral se configura *antes* de cargar las notas. Se puede plantear un endpoint de recalcular en un issue futuro si el requerimiento surge.
