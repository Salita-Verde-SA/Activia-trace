## Context

Activia-trace es una aplicación SPA compleja que manejará múltiples roles (Admin, Docente, Coordinador, etc.) y un backend robusto basado en FastAPI que emite tokens JWT de corta duración y refresh tokens en cookies HTTP-only. Necesitamos sentar las bases del Frontend React con herramientas modernas de build (Vite), ruteo (React Router), estilos (Tailwind) y fetching de datos (TanStack Query + Axios) para asegurar mantenibilidad a largo plazo.

## Goals / Non-Goals

**Goals:**
- Establecer un setup reproducible del frontend con Vite, TypeScript, React, TailwindCSS.
- Implementar el estado global de autenticación (`AuthContext` + estado local).
- Implementar interceptores de Axios para adjuntar el JWT en cada petición y manejar el flujo de refresh token (401 -> refresh -> retry) de forma transparente.
- Crear las pantallas básicas de login y recuperación, y un shell protegido (`Layout`) con un Sidebar navegable.

**Non-Goals:**
- No desarrollaremos pantallas de negocio completas (Auditoría, Liquidaciones) en este change; solo la estructura base de enrutamiento.
- No se implementará Redux; todo el estado del servidor estará manejado por TanStack Query y el estado local UI por Context o Zustand/hooks básicos.

## Decisions

- **Framework**: Vite + React (TypeScript). Razón: Rapidez de build y HMR; estricto control de tipos.
- **Data Fetching**: `@tanstack/react-query` y `axios`. Razón: React Query maneja caché, reintentos y mutaciones de manera excelente; Axios simplifica los interceptores comparado con `fetch` nativo.
- **Estructura de Carpetas (Feature-based)**: Se utilizará un esquema `src/features/{feature-name}/{components,hooks,services,types}` para escalar adecuadamente.
- **Refresh Token Flow**: El interceptor de Axios capturará errores `401 Unauthorized`. Si ocurre, llamará al endpoint estático estipulado `/api/auth/refresh` (que confía en la cookie httpOnly). Si es exitoso, actualizará el `access_token` en memoria y reintentará la petición fallida original.
- **Estilos**: TailwindCSS. Razón: Rapidez y sistema de diseño unificado, como se exige en las reglas del sistema.

## Risks / Trade-offs

- **Risk: Token Refresh Racing Conditions** → Si varias peticiones fallan simultáneamente por expiración del token, pueden causar llamadas redundantes al endpoint de refresh. *Mitigation*: El interceptor de Axios usará un booleano (o promesa) `isRefreshing` para encolar peticiones pendientes mientras el token se refresca.
- **Risk: Estado de Auth Desincronizado** → El token podría expirar o la sesión cerrarse en otra pestaña. *Mitigation*: Confiar en TanStack Query para el re-fetching de `me` en focus, y limpiar el estado de Auth globalmente si el refresh falla.
