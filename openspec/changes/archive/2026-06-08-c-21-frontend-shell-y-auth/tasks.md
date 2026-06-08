## 1. Setup Base del Proyecto Frontend

- [x] 1.1 Ejecutar `npm create vite@latest frontend -- --template react-ts` o equivalente.
- [x] 1.2 Instalar dependencias core: `react-router-dom`, `@tanstack/react-query`, `axios`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`.
- [x] 1.3 Configurar Tailwind CSS v4 (`index.css` y `vite.config.ts`).
- [x] 1.4 Configurar cliente de Axios (`src/shared/services/api.ts`) con URL base.

## 2. Configuración de Estado y Providers

- [x] 2.1 Crear `AuthContext` en `src/features/auth/context/AuthContext.tsx` o usar un store de Zustand para el estado global del usuario autenticado.
- [x] 2.2 Integrar Interceptores de Axios para tokens: capturar `401`, llamar a `/api/auth/refresh`, y reintentar, en `src/shared/services/api.ts`.
- [x] 2.3 Configurar `QueryClient` en `src/App.tsx`.
- [x] 2.4 Envolver la aplicación en `App.tsx` con `QueryClientProvider` y `AuthProvider`.

## 3. Rutas Públicas (Auth)

- [x] 3.1 Crear página de Login `src/features/auth/pages/LoginPage.tsx`.
- [x] 3.2 Crear hook `useLogin` usando React Query para la mutación contra `/api/auth/login`.
- [x] 3.3 Crear página de Recuperación de Clave `src/features/auth/pages/ForgotPasswordPage.tsx` (placeholder visual o funcional).

## 4. App Shell (Layout y Rutas Protegidas)

- [x] 4.1 Crear componente `Sidebar` en `src/features/shell/components/Sidebar.tsx` que filtre ítems según los roles del usuario.
- [x] 4.2 Crear componente `Header` en `src/features/shell/components/Header.tsx`.
- [x] 4.3 Crear `MainLayout` en `src/features/shell/layouts/MainLayout.tsx` integrando Sidebar y Header.
- [x] 4.4 Configurar `React Router` en `src/App.tsx` (o un archivo `routes.tsx`) definiendo el `MainLayout` para rutas protegidas y redirigiendo `/login` si no hay sesión.
- [x] 4.5 Crear una página Dashboard temporal (`src/features/dashboard/pages/DashboardPage.tsx`) para verificar el acceso protegido.

## 5. Testing

- [x] 5.1 Configurar Vitest y React Testing Library en el proyecto frontend.
- [x] 5.2 Escribir tests para el flujo de autenticación (renderizado de login y simulación de submit).
- [x] 5.3 Escribir tests para el guard de rutas (verificar redirección a `/login` si no hay sesión).
- [x] 5.4 Escribir tests para el interceptor de Axios (verificar que reintente tras un 401 usando el refresh token).
