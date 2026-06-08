## 1. Modelos de Base de Datos y Migraciones

- [x] 1.1 Crear los modelos `HiloMensajeInterno` y `MensajeInterno` en `backend/models/mensajeria_interna.py`.
- [x] 1.2 Actualizar el modelo `Usuario` en `backend/models/user.py` para establecer la relación bidireccional si es necesario, o registrar los nuevos modelos en `backend/models/__init__.py`.
- [x] 1.3 Generar migración de Alembic para crear las nuevas tablas de mensajería interna.

## 2. Esquemas Pydantic

- [x] 2.1 Crear esquemas de edición de perfil `UsuarioPerfilUpdate` en `backend/schemas/user.py`.
- [x] 2.2 Crear esquemas para mensajería interna (`HiloCreate`, `MensajeInternoCreate`, `HiloResponse`, `MensajeInternoResponse`) en `backend/schemas/mensajeria_interna.py`.

## 3. Lógica de Negocio (Servicios)

- [x] 3.1 Implementar `UsuarioService.actualizar_perfil` con validación de inmutabilidad en campos DNI/CUIL y logueo en `AuditLog`.
- [x] 3.2 Implementar `MensajeriaInternaService.iniciar_hilo` y `MensajeriaInternaService.responder_hilo`.
- [x] 3.3 Implementar `MensajeriaInternaService.listar_bandeja_entrada` con conteo de no leídos.
- [x] 3.4 Implementar `MensajeriaInternaService.obtener_mensajes_hilo` que marque automáticamente como leídos los mensajes no propios.
- [x] 3.5 Implementar `MensajeriaInternaService.contar_no_leidos_global` para devolver un solo número (badge).

## 4. Endpoints de la API

- [x] 4.1 Crear router en `backend/api/endpoints/perfil.py` para exponer `PUT /api/perfil/me`.
- [x] 4.2 Crear router en `backend/api/endpoints/mensajeria_interna.py` para los endpoints de inbox e hilos.
- [x] 4.3 Registrar los nuevos routers en `backend/api/endpoints/__init__.py` y `backend/app/main.py`.

## 5. Pruebas Unitarias y Funcionales

- [x] 5.1 Testear que `PUT /api/perfil/me` permita cambiar banco pero rechace/ignore modificación de DNI/CUIL, y que registre en auditoría.
- [x] 5.2 Testear el flujo completo de inicio de hilo y respuesta.
- [x] 5.3 Testear que el conteo de no leídos disminuya al leer un hilo específico.
- [x] 5.4 Testear que un usuario que no pertenece a un hilo no pueda listar sus mensajes ni enviar una respuesta.
