## 1. Cifrado y Utilidades

- [x] 1.1. Implementar funcionalidad de cifrado AES-256 en `core/security/encryption.py` o usar TypeDecorators de SQLAlchemy para campos encriptados.
- [x] 1.2. Añadir tests unitarios para las utilidades de cifrado y descifrado.

## 2. Modelado de Datos

- [x] 2.1. Crear modelo `Usuario` en `models/usuario.py` integrando la funcionalidad de cifrado para DNI, CUIL, CBU y alias.
- [x] 2.2. Crear modelo `Asignacion` en `models/asignacion.py` con dependencias a Usuario, Rol y contexto (materia_id, carrera_id, etc.).
- [x] 2.3. Configurar la migración de Alembic para ambos modelos (`005_usuario_asignacion`).

## 3. Schemas

- [x] 3.1. Definir schemas Pydantic para `Usuario` (creación, lectura, actualización).
- [x] 3.2. Definir schemas Pydantic para `Asignacion` (con fechas de vigencia obligatorias).

## 4. Lógica de Acceso a Datos y Servicios

- [x] 4.1. Implementar `UsuarioRepository` con lógica para buscar y listar usuarios y `AsignacionRepository` para manejar la jerarquía y vigencia.
- [x] 4.2. Crear `UsuarioService` para la gestión de usuarios (unicidad de email por tenant).
- [x] 4.3. Crear `AsignacionService` para validar que la asignación no pise reglas de negocio y manejar histórico.

## 5. Endpoints

- [x] 5.1. Implementar API Routers en `api/endpoints/usuarios.py` y `api/endpoints/asignaciones.py` protegidos por `require_permission` (RBAC).
- [x] 5.2. Implementar router `/api/asignaciones` para administrar los equipos de los tenants.
- [x] 5.3. Registrar ambos routers en la API principal.

## 6. Integración de RBAC (Modified Capability)

- [x] 6.1. Actualizar la función `require_permission` en `api/dependencies/auth.py` para verificar roles a través del nuevo modelo `Asignacion` considerando la vigencia (desde/hasta).ual dentro del rango `desde`/`hasta` en vez de usar directamente `UsuarioRol`.

## 7. Testing

- [x] 7.1. Implementar test E2E de usuarios comprobando que el cifrado en DB es efectivo y transparente en el API.
- [x] 7.2. Implementar test E2E de asignación asegurando restricciones jerárquicas y temporales.
- [x] 7.3. Testear permisos de RBAC denegados cuando una asignación está vencida.
