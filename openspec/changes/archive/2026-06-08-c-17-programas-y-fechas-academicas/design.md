## Context

El sistema gestiona la información académica de las materias y necesita poder estructurar los programas oficiales (documentos en formato PDF u otros) y el cronograma de fechas académicas (parciales, trabajos prácticos y coloquios). Esta información es fundamental no solo para la gestión interna de la institución, sino también porque el objetivo final (épica 5) es exportar este contenido a las aulas virtuales de Moodle correspondientes a cada materia.

## Goals / Non-Goals

**Goals:**
- Extender el modelo de base de datos para soportar los programas de materia (`ProgramaMateria`) y el cronograma de eventos (`FechaAcademica`).
- Proveer endpoints CRUD seguros con soporte multi-tenant (RBAC y aislamiento por `tenant_id`).
- Permitir asociar fechas y programas a entidades académicas específicas (materia, carrera y cohorte).
- Preparar la estructura de datos que alimentará la futura integración con Moodle (Fragmentos F5.4).

**Non-Goals:**
- Integrar con Moodle directamente en este change (la sincronización en sí se abordará en un change de la Épica 5).
- Almacenamiento complejo o motor de búsqueda sobre el contenido de los documentos PDF. Solo almacenaremos la metadata y la referencia o el bucket donde viven.

## Decisions

1. **Gestión de Archivos**: Por ahora el campo `referencia_archivo` de `ProgramaMateria` será un string opaco. Si se decide usar Amazon S3, Azure Blob, o el FS local, el código tratará la referencia de forma agnóstica. La API aceptará el archivo vía `UploadFile` y devolverá una URL o path.
2. **Aislamiento Multi-tenant**: Ambas tablas llevarán el campo `tenant_id` que es obligatorio y no puede quedar vacío. Los *repositories* deben filtrar automáticamente por el tenant en sesión.
3. **Manejo de Auditoría**: En vez de deletes físicos (hard delete), se aplicará `is_deleted` o borrado lógico para asegurar trazabilidad.
4. **Relaciones en Base de Datos**:
   - `ProgramaMateria`: Relacionado a `Materia`, `Carrera` y `Cohorte`.
   - `FechaAcademica`: Relacionado a `Materia`, `Cohorte` y maneja un Enum o String para el tipo (PARCIAL, TP, RECUPERATORIO, COLOQUIO).

## Risks / Trade-offs

- **[Risk] Complejidad en las FKs**: Manejar múltiples asociaciones (materia, carrera, cohorte) puede requerir chequeos de integridad cruzados (e.g., ¿la materia pertenece a la carrera?).
  **Mitigación**: Implementar validaciones en la capa de servicios antes de insertar en la BD para asegurar que la tríada (Materia-Carrera-Cohorte) sea válida según la base.
- **[Risk] Escalamiento del almacenamiento de archivos**: Al subir muchos programas, el storage local puede saturarse si no se limpia.
  **Mitigación**: Se diseñará la lógica de subida con abstracciones, permitiendo conectar a un bucket S3 en producción más adelante.
