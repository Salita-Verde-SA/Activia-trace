## 1. Modelo y Migración

- [x] 1.1 Crear el modelo SQLAlchemy `Comunicacion` (campos: id, tenant_id, lote_id, destinatario_cifrado, asunto, cuerpo, estado, fecha_envio, error_msg).
- [x] 1.2 Generar la migración con Alembic para la nueva tabla `comunicaciones`.
- [x] 1.3 Implementar utilidades de cifrado/descifrado simétrico para el destinatario.

## 2. Servicios y API

- [x] 2.1 Crear `ComunicacionService.encolar_lote` para insertar mensajes en estado `Pendiente`.
- [x] 2.2 Crear `ComunicacionService.obtener_pendientes_por_lote` para previsualización (desencriptando el destinatario).
- [x] 2.3 Crear `ComunicacionService.aprobar_lote` que marque las comunicaciones como listas para el worker y loguee el audit event `COMUNICACION_ENVIAR`.
- [x] 2.4 Crear router `backend/api/endpoints/comunicaciones.py` con los endpoints respectivos (con RBAC `comunicacion:aprobar` donde corresponda).

## 3. Worker Asíncrono

- [x] 3.1 Implementar la lógica del worker en `backend/workers/comunicaciones.py`.
- [x] 3.2 El worker debe buscar comunicaciones pendientes (aprobadas), transicionar a `Enviando`, simular el envío asíncrono (log) y pasar a `Enviado` o `Error`.
- [x] 3.3 Integrar el inicio del worker en el ciclo de vida de la aplicación FastAPI (`main.py`).

## 4. Tests

- [x] 4.1 Test unitario para cifrado/descifrado y creación de comunicaciones.
- [x] 4.2 Test de previsualización (verificando que retorna el correo descifrado).
- [x] 4.3 Test de aprobación validando el guard `comunicacion:aprobar`.
- [x] 4.4 Test del loop del worker asíncrono asegurando que procese y actualice la BD.
