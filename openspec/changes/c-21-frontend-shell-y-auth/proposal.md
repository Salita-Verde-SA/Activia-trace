## Why

Con la base del backend y la gestión de roles e identidades asegurada, es el momento de construir la interfaz de usuario. El `frontend-shell-y-auth` establecerá la arquitectura base de la aplicación React (SPA) para Activia-trace, configurando el enrutamiento, el manejo del estado global (React Query), el cliente HTTP, y el flujo crítico de autenticación. Este shell servirá como cimiento donde se integrarán el resto de los módulos en las siguientes fases.

## What Changes

- **Setup de Aplicación Base**: Inicialización de Vite + React + TypeScript + Tailwind CSS en el directorio `/frontend`.
- **Arquitectura de Cliente**: Configuración de TanStack Query para el estado del servidor, Axios para el cliente HTTP, y React Router para la navegación.
- **Flujo de Autenticación**: Implementación de `AuthContext` o estado de autenticación (Zustand/Jotai), integración de interceptores de Axios para inyectar y refrescar transparentemente el JWT.
- **Vistas Base**:
  - Pantalla de Login y Recuperación de contraseña.
  - Shell layout principal (protegido) con un Navbar/Sidebar dinámico que muestre opciones de menú filtradas por los roles del usuario.

## Capabilities

### New Capabilities
- `spa-architecture`: Configuración del proyecto, estructura de carpetas `feature-based` y librerías core.
- `auth-flow-ui`: Pantallas y lógica de estado para login, recuperación de clave, y refresco de tokens (interceptores).
- `app-shell`: Layouts principal (sidebar dinámico según rol), layout público, y configuración de rutas (React Router).

### Modified Capabilities

## Impact

- **Directorio**: Creación del entorno completo dentro de `/frontend`.
- **Dependencias**: Se instalarán dependencias pesadas en el entorno frontend (`react`, `react-dom`, `axios`, `@tanstack/react-query`, `react-router-dom`, `tailwindcss`, `lucide-react`, etc.).
- **Interacciones**: Esta fase consumirá intensivamente los endpoints implementados en `C-02` (Auth).
