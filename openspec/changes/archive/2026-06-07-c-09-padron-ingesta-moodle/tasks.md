## 1. Modelos y Base de Datos

- [x] 1.1 Crear los modelos SQLAlchemy `VersionPadron` y `EntradaPadron` en `backend/models/padron.py` (o añadir al módulo existente si corresponde).
- [ ] 1.2 Generar la migración Alembic correspondiente a `VersionPadron` y `EntradaPadron`.

## 2. Pydantic Schemas

- [x] 2.1 Definir esquemas para la creación de versiones y carga de alumnos (`VersionPadronCreate`, `EntradaPadronCreate`).
- [x] 2.2 Definir esquemas para las respuestas de API (`VersionPadronResponse`, `EntradaPadronResponse`).

## 3. Integración con Moodle Web Services

- [x] 3.1 Crear el archivo `backend/integrations/moodle_ws.py` y estructurar el cliente `MoodleClient` usando `httpx.AsyncClient`.
- [x] 3.2 Implementar manejo de errores y transformación de repuestas 200 de Moodle con payloads de error interno a excepciones propias (mapeando a 502 Bad Gateway).
- [x] 3.3 Desarrollar la función `fetch_padron` en el cliente para traer usuarios enrolados de un ID de curso.

## 4. Servicios de Negocio

- [x] 4.1 Crear `PadronService` en `backend/services/padron.py`.
- [x] 4.2 Implementar método para activar una nueva `VersionPadron` que simultáneamente desactive la versión anterior para esa materia y cohorte.
- [x] 4.3 Implementar lógica de ingesta manual (parsing de `.xlsx` / `.csv`).
- [x] 4.4 Implementar lógica de sincronización on-demand utilizando `MoodleClient`.
- [x] 4.5 Implementar funcionalidad de vaciado de emergencia (soft delete de todas las entradas y versiones de una materia).

## 5. API Endpoints

- [x] 5.1 Crear router `backend/api/endpoints/padron.py` y agregarlo en `main.py`.
- [x] 5.2 Endpoint POST `/api/padron/importar-manual` (subida de archivos con vista previa).
- [x] 5.3 Endpoint POST `/api/padron/sincronizar-moodle` (on-demand usando el Web Service).
- [x] 5.4 Endpoint DELETE `/api/padron/vaciar` (vaciado de emergencia protegido por permisos).

## 6. Testing y Aseguramiento de Calidad

- [x] 6.1 Escribir tests para el comportamiento inmutable de `VersionPadron` (desactivación automática de la anterior).
- [x] 6.2 Testear el cliente `moodle_ws.py` mockeando respuestas de la API de Moodle (incluyendo el caso de fallo disfrazado de 200 OK).
- [x] 6.3 Testear los endpoints de ingesta y vaciado, validando la emisión correcta de logs de auditoría (`PADRON_CARGAR`).
