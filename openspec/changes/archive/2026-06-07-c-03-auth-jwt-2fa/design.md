## Context

El sistema activia-trace maneja información PII, notas, padrones y requiere de un flujo robusto de autenticación. Como se definió en ADR-001, implementaremos nuestra propia gestión de identidad (Identity Provider) sin delegar en plataformas externas, asegurando control total sobre la residencia de los datos.

## Goals / Non-Goals

**Goals:**
- Proteger el sistema mediante JWT de acceso de corta duración (15 min).
- Implementar Refresh Token rotation en la base de datos para detectar reuso de tokens robados.
- Permitir 2FA usando TOTP.
- Bloquear intentos abusivos en los endpoints públicos (Rate Limit).

**Non-Goals:**
- Integración con SSO, Google, Microsoft o LDAP.
- Manejo de roles o permisos granulares (corresponde a C-04 `rbac-permisos-finos`, aquí solo guardamos un scope básico o dejamos el terreno preparado).

## Decisions

1. **Argon2id para contraseñas**
   - *Decisión*: Usar `argon2-cffi` para el hashing de contraseñas.
   - *Racional*: Es el algoritmo ganador del Password Hashing Competition y es mucho más resistente a GPU cracking que bcrypt.

2. **Refresh Token Rotation (Detection)**
   - *Decisión*: El refresh token será una cadena aleatoria persistida en la DB en una tabla `Session` o dentro del mismo usuario. Al usar un refresh token, este se invalida y se emite uno nuevo. Si se detecta un intento de uso de un token ya invalidado (revocado), se invalidará automáticamente TODA la cadena (todas las sesiones activas del usuario) asumiendo robo de sesión.
   - *Racional*: Reduce radicalmente la ventana de oportunidad para un atacante.

3. **2FA - TOTP**
   - *Decisión*: Usar la librería estándar o `pyotp` para generar un secreto base32 (cifrado en DB con `EncryptedString`) y validar tokens de 6 dígitos.
   - *Flujo*: Si un usuario tiene 2FA activo, `/login` devuelve un status especial o un "pre-auth token" en vez del JWT final, forzando a llamar a `/login/2fa` para completar.

4. **Identidad como Dependencia Central**
   - *Decisión*: `get_current_user` será la dependencia inyectada en FastAPI. Parseará el JWT, validará la firma, extraerá `user_id` y `tenant_id`, y proveerá esta data al request.
   - *Racional*: Estandariza y centraliza la extracción de la identidad según la Regla de Oro.

## Risks / Trade-offs

- **[Risk] Complejidad del Refresh Rotation** → *Mitigación*: Implementaremos una tabla `RefreshToken` simple: `id`, `user_id`, `token_hash`, `expires_at`, `revoked_at`.
- **[Risk] Desincronización de reloj en 2FA** → *Mitigación*: Permitiremos una ventana de validez estándar (±1 periodo de 30s).
