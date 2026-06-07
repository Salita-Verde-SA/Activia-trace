## Why

La autenticación robusta y segura es un pilar fundamental en activia-trace (ADR-001). Dado que el sistema maneja PII y opera con multi-tenancy estricto, necesitamos un sistema de sesión propio (JWT con refresh rotation) que no dependa de integraciones externas complejas en esta etapa, e incorpore opciones de seguridad avanzada como 2FA TOTP para roles con altos privilegios.

## What Changes

- Implementación del flujo de login (email + password hasheado con Argon2id) emitiendo un JWT de acceso (15 min) y un refresh token.
- Incorporación de mecanismo de rotación de refresh tokens (usar un refresh token emite uno nuevo e invalida el anterior).
- Incorporación de validación opcional 2FA (TOTP) durante el flujo de login.
- Implementación del flujo de recuperación de contraseña (forgot/reset) usando tokens de un solo uso por email.
- Creación de la dependencia central de autenticación (`get_current_user`) que valida el JWT y resuelve la identidad y el tenant_id.
- Configuración de rate limiting básico (5 intentos por 60s) para prevenir ataques de fuerza bruta en los endpoints de login y recuperación.

## Capabilities

### New Capabilities
- `jwt-authentication`: Flujo completo de login, emisión de JWT de corta duración y validación.
- `refresh-token-rotation`: Emisión y rotación segura de tokens de refresco para extender sesiones sin comprometer seguridad.
- `totp-2fa`: Soporte para segundo factor de autenticación basado en el tiempo (Authenticator apps).
- `password-recovery`: Sistema seguro para que los usuarios puedan restablecer sus contraseñas olvidadas.
- `auth-rate-limiting`: Restricciones de intentos para proteger los puntos de entrada expuestos.

### Modified Capabilities

## Impact

- **Seguridad**: Establece la barrera de entrada al sistema. Todo endpoint que requiera autenticación ahora validará el token usando la nueva dependencia.
- **Base de Datos**: Requiere persistir el hash de la contraseña, el secreto 2FA (cifrado), el último refresh token utilizado (o su hash) y un token temporal de recuperación.
- **Arquitectura**: Fija el estándar (ADR-001) para la identidad; el `tenant_id` y `user_id` fluirán hacia los repositorios exclusivamente a partir de la sesión validada aquí.
