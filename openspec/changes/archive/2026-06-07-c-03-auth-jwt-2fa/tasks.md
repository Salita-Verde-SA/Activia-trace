## 1. Configuración y Utilidades de Seguridad

- [x] 1.1 Modificar `backend/pyproject.toml` para agregar dependencias de seguridad: `passlib[argon2]`, `python-jose[cryptography]`, `pyotp` (si no están).
- [x] 1.2 Crear el módulo `backend/core/security/password.py` con utilidades para hashear y verificar contraseñas con Argon2id.
- [x] 1.3 Crear el módulo `backend/core/security/jwt.py` con utilidades para crear JWT access tokens (`create_access_token`) e inyectarlos.

## 2. Modelos y Repositorios de Identidad y Sesión

- [x] 2.1 Crear el modelo `Session` (o `RefreshToken`) en `backend/models/session.py` para almacenar tokens de refresco, incluyendo campos: `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`.
- [x] 2.2 Crear el modelo simplificado `UserAuth` (o expandir si ya existe) para manejar `password_hash`, `totp_secret` y `totp_enabled`.
- [x] 2.3 Generar migración Alembic (`alembic revision --autogenerate -m "002_auth_models"`) para reflejar los nuevos campos/modelos y aplicarla.

## 3. Flujos de Login y Refresh Rotation

- [x] 3.1 Implementar el endpoint `POST /api/auth/login` para validar email y password.
- [x] 3.2 Extender `/api/auth/login` para emitir access JWT y un refresh token seguro almacenado en base de datos.
- [x] 3.3 Implementar el endpoint `POST /api/auth/refresh` que rota el token de refresco (lo invalida y emite uno nuevo).
- [x] 3.4 Implementar detección de reuso de token en `/refresh`: si se presenta un token revocado, invalidar todos los tokens del usuario correspondiente.

## 4. Dependencia Central (Regla de Oro)

- [x] 4.1 Crear el módulo `backend/api/dependencies/auth.py`.
- [x] 4.2 Implementar la dependencia `get_current_user` que extrae el JWT, lo valida y devuelve los claims (ej: `user_id`, `tenant_id`).

## 5. TOTP (2FA)

- [x] 5.1 Implementar endpoints de setup de 2FA: `POST /api/auth/2fa/setup` (genera secreto) y `POST /api/auth/2fa/verify` (confirma y activa el flag en el usuario).
- [x] 5.2 Modificar `POST /api/auth/login` para devolver un token intermedio si el usuario tiene `totp_enabled`.
- [x] 5.3 Crear el endpoint `POST /api/auth/login/2fa` que reciba el token intermedio y el código TOTP para emitir finalmente el JWT de acceso y el refresh token.

## 6. Recuperación de Contraseña

- [x] 6.1 Implementar modelo/tabla o mecanismo para tokens temporales de recuperación.
- [x] 6.2 Crear endpoint `POST /api/auth/forgot-password` que reciba el email y genere un token seguro de un solo uso.
- [x] 6.3 Crear endpoint `POST /api/auth/reset-password` que reciba el token válido y la nueva contraseña para actualizarla.

## 7. Pruebas y Validación Final

- [x] 7.1 Escribir test unitario para la verificación y hashing de Argon2id.
- [x] 7.2 Escribir tests de integración para el endpoint de `/login` con credenciales correctas e incorrectas.
- [x] 7.3 Escribir tests de integración para `/refresh` simulando un reuso de token revocado y validando el bloqueo.
- [x] 7.4 Verificar comportamiento en `/api/auth/login/2fa` y validación TOTP.
