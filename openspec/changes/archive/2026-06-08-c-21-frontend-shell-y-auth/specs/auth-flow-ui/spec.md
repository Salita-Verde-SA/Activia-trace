## ADDED Requirements

### Requirement: Autenticación global y persistencia
El sistema SHALL mantener el estado de autenticación (usuario logueado, información del perfil) accesible globalmente mediante Context o una librería de estado, inicializándose con una llamada a `/api/auth/me`.

#### Scenario: Restauración de sesión
- **WHEN** el usuario recarga la página
- **THEN** la aplicación intenta fetchear `/api/auth/me` para restaurar la sesión usando las cookies existentes.

### Requirement: Flujo de refresh transparente
El cliente HTTP SHALL interceptar automáticamente las respuestas `401 Unauthorized` originadas por token expirado, y realizar una petición de refresco (`POST /api/auth/refresh`) para reintentar la petición original sin intervención del usuario.

#### Scenario: Petición con token vencido
- **WHEN** un componente intenta leer datos pero el Access Token ha expirado
- **THEN** el interceptor de Axios pausa la petición, llama a `/refresh`, y al recibir éxito, reintenta la petición original devolviendo los datos correctamente.

#### Scenario: Sesión expirada (Refresh token inválido)
- **WHEN** el interceptor llama a `/refresh` y este devuelve un error `401` o `403`
- **THEN** se limpia el estado de autenticación local, cancelando las peticiones encoladas, y se redirige al usuario a la pantalla de Login.

### Requirement: Pantallas públicas de Login y Recuperación
El sistema SHALL proveer una ruta pública `/login` con un formulario para ingreso de email y contraseña, y una ruta `/forgot-password` para solicitar el blanqueo de clave.

#### Scenario: Login exitoso
- **WHEN** el usuario ingresa credenciales válidas en `/login`
- **THEN** el sistema envía la petición a `/api/auth/login`, recibe éxito, y redirige al dashboard protegido.
