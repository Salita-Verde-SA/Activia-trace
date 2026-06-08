## 1. Modelos de Base de Datos y Migraciones

- [x] 1.1 Crear los modelos SQLAlchemy `Aviso` y `AcknowledgmentAviso` en `backend/models/avisos.py`.
- [x] 1.2 Registrar el nuevo módulo en `backend/models/__init__.py`.
- [x] 1.3 Generar la migración de Alembic para crear las tablas correspondientes.

## 2. Esquemas Pydantic

- [x] 2.1 Crear esquemas en `backend/schemas/aviso.py` para listar, crear avisos (ej. `AvisoCreate`, `AvisoResponse`).
- [x] 2.2 Crear esquemas para acuse de recibo y métricas (ej. `AvisoAcknowledgmentCreate`, `AvisoMetrics`).

## 3. Lógica de Negocio (Servicios)

- [x] 3.1 Implementar `AvisoService.crear_aviso` en `backend/services/avisos.py` manejando el alcance (Tenant, Materia, Cohorte, Rol).
- [x] 3.2 Implementar `AvisoService.listar_activos_para_usuario` que devuelva los avisos relevantes al `Usuario` que no tengan un ack registrado.
- [x] 3.3 Implementar `AvisoService.registrar_acuse_recibo` para almacenar el ack del usuario.
- [x] 3.4 Implementar `AvisoService.obtener_metricas_aviso` calculando alcance vs leídos.

## 4. Endpoints de la API

- [x] 4.1 Crear el router en `backend/api/endpoints/avisos.py` con las rutas para avisos de usuario y avisos administrativos.
- [x] 4.2 Registrar el router en `backend/api/endpoints/__init__.py` y `backend/app/main.py`.

## 5. Pruebas Unitarias y Funcionales

- [x] 5.1 Testear que la creación de aviso y segmentación de alcance funcione.
- [x] 5.2 Testear que `listar_activos_para_usuario` retorne solo los avisos aplicables.
- [x] 5.3 Testear el registro de ack y que el aviso deje de aparecer en la lista de pendientes.
