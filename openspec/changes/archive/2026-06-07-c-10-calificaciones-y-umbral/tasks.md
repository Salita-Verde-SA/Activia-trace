## 1. Modelos y Base de Datos

- [x] 1.1 Crear el modelo `UmbralMateria` (id, tenant_id, materia_id, docente_id, umbral_pct, valores_aprobatorios).
- [x] 1.2 Crear el modelo `Calificacion` (id, tenant_id, entrada_padron_id, actividad_nombre, nota_numerica, nota_textual, aprobado, origen).
- [x] 1.3 Generar migración Alembic para agregar ambas tablas a la base de datos (Nota: se requiere ejecución en el entorno Docker).

## 2. Pydantic Schemas

- [x] 2.1 Definir esquemas para `UmbralMateria` (`UmbralCreate`, `UmbralResponse`).
- [x] 2.2 Definir esquemas para importación de calificaciones (`PreviewResponse`, `ColumnMap`, `ImportConfirmRequest`).

## 3. Lógica de Negocio (Servicios)

- [x] 3.1 Implementar `UmbralService` para consultar y establecer los umbrales de cada asignación (materia/docente).
- [x] 3.2 Implementar función de parseo `generar_vista_previa` en `CalificacionService` que lea un archivo CSV y sugiera columnas numéricas/textuales a importar.
- [x] 3.3 Implementar función `calcular_aprobacion` que tome el valor de la nota, verifique contra el `UmbralMateria` y decida `aprobado = True/False`.
- [x] 3.4 Implementar función `confirmar_importacion` en `CalificacionService` que guarde efectivamente los registros evaluando las notas o forzando el `aprobado = True` si es reporte de finalización.
- [x] 3.5 Integrar registro de auditoría (`CALIFICACIONES_IMPORTAR`) al insertar notas.

## 4. API Endpoints

- [x] 4.1 Crear router `backend/api/endpoints/calificaciones.py` y registrarlo en `main.py`.
- [x] 4.2 Endpoint PUT `/api/calificaciones/umbral` para que un docente establezca su regla.
- [x] 4.3 Endpoint POST `/api/calificaciones/importar/preview` que reciba el archivo y devuelva las columnas detectadas.
- [x] 4.4 Endpoint POST `/api/calificaciones/importar/confirm` que procese las notas finales.

## 5. Testing y Calidad

- [x] 5.1 Escribir tests unitarios para la función `calcular_aprobacion` verificando las reglas de umbral numérico y textual.
- [x] 5.2 Testear los endpoints de `UmbralMateria` validando aislamiento de tenant y permisos.
- [x] 5.3 Testear el proceso de importación mockeando un archivo CSV y validando los registros insertados.
