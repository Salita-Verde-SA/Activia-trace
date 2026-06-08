## 1. Modelos y Migraciones

- [x] 1.1 Crear los modelos SQLAlchemy `SlotEncuentro`, `InstanciaEncuentro` y `Guardia` en `backend/models/encuentros.py`.
- [x] 1.2 Registrar los nuevos modelos en `backend/models/__init__.py`.
- [x] 1.3 Generar y revisar la migración de Alembic para crear las tablas correspondientes.

## 2. Esquemas (Pydantic)

- [x] 2.1 Crear `backend/schemas/encuentro.py` con los DTOs para creación y respuesta de slots e instancias.
- [x] 2.2 Crear `backend/schemas/guardia.py` con los DTOs para el registro y consulta de guardias.

## 3. Lógica de Negocio (Services)

- [x] 3.1 Implementar `EncuentroService.crear_recurrente` que genere el slot y proyecte las instancias calculando las fechas.
- [x] 3.2 Implementar `EncuentroService.crear_unico` para la generación directa de una instancia sin recurrencia a futuro.
- [x] 3.3 Implementar `EncuentroService.editar_instancia` para la modificación granular (estado, meet_url, video_url).
- [x] 3.4 Implementar `EncuentroService.generar_html_moodle` para construir la tabla exportable.
- [x] 3.5 Implementar `GuardiaService.registrar_guardia` y `GuardiaService.exportar_guardias`.

## 4. Endpoints (API)

- [x] 4.1 Crear el enrutador `backend/api/endpoints/encuentros.py` para los ABM y la exportación HTML (protegidos por el guard `encuentros:gestionar`).
- [x] 4.2 Crear el enrutador `backend/api/endpoints/guardias.py` (registro por tutor y consulta global).
- [x] 4.3 Registrar ambos enrutadores en `backend/app/main.py`.

## 5. Tests

- [x] 5.1 Test unitario del cálculo proyectado de fechas en instancias recurrentes.
- [x] 5.2 Test unitario de edición granular de una instancia de encuentro.
- [x] 5.3 Test del endpoint de exportación HTML garantizando el formato correcto.
- [x] 5.4 Test del registro de guardia asegurando su asignación al `tenant_id` y `usuario_id`.
