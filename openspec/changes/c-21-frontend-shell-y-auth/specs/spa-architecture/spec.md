## ADDED Requirements

### Requirement: Estructura de proyecto y cliente HTTP
La aplicación SHALL estructurarse utilizando Vite y TypeScript, e incorporar un cliente HTTP (Axios) configurado con la URL base de la API y soporte para interceptores.

#### Scenario: Cliente HTTP configurado
- **WHEN** la aplicación inicializa
- **THEN** el cliente HTTP global está disponible, apuntando a `/api` y pre-configurado para enviar credenciales (cookies HTTP-only).

### Requirement: Configuración de estado asíncrono
La aplicación SHALL utilizar `@tanstack/react-query` para manejar el estado del servidor, proveyendo un `QueryClientProvider` global.

#### Scenario: Petición cacheadada
- **WHEN** un componente realiza un query a través de un hook
- **THEN** React Query maneja el estado de carga y cachea la respuesta
