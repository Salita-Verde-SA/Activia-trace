## 1. Setup Base del Proyecto Frontend

- [ ] 1.1 Ejecutar `npm create vite@latest frontend -- --template react-ts` o equivalente.
- [ ] 1.2 Instalar dependencias core: `react-router-dom`, `@tanstack/react-query`, `axios`, `lucide-react`, `tailwindcss`, `@tailwindcss/vite`.
- [ ] 1.3 Configurar Tailwind CSS v4 (`index.css` y `vite.config.ts`).
- [ ] 1.4 Configurar cliente de Axios (`src/shared/services/api.ts`) con URL base.

## 2. Configuración de Estado y Providers

- [ ] 2.1 Crear `AuthContext` en `src/features/auth/context/AuthContext.tsx` o usar un store de Zustand para el estado global del usuario autenticado.
- [ ] 2.2 Integrar Interceptores de Axios para tokens: capturar `401`, llamar a `/api/auth/refresh`, y reintentar, en `src/shared/services/api.ts`.
- [ ] 2.3 Configurar `QueryClient` en `src/App.tsx`.
- [ ] 2.4 Envolver la aplicación en `App.tsx` con `QueryClientProvider` y `AuthProvider`.

## 3. Rutas Públicas (Auth)

- [ ] 3.1 Crear página de Login `src/features/auth/pages/LoginPage.tsx`.
- [ ] 3.2 Crear hook `useLogin` usando React Query para la mutación contra `/api/auth/login`.
- [ ] 3.3 Crear página de Recuperación de Clave `src/features/auth/pages/ForgotPasswordPage.tsx` (placeholder visual o funcional).

## 4. App Shell (Layout y Rutas Protegidas)

- [ ] 4.1 Crear componente `Sidebar` en `src/features/shell/components/Sidebar.tsx` que filtre ítems según los roles del usuario.
- [ ] 4.2 Crear componente `Header` en `src/features/shell/components/Header.tsx`.
- [ ] 4.3 Crear `MainLayout` en `src/features/shell/layouts/MainLayout.tsx` integrando Sidebar y Header.
- [ ] 4.4 Configurar `React Router` en `src/App.tsx` (o un archivo `routes.tsx`) definiendo el `MainLayout` para rutas protegidas y redirigiendo `/login` si no hay sesión.
- [ ] 4.5 Crear una página Dashboard temporal (`src/features/dashboard/pages/DashboardPage.tsx`) para verificar el acceso protegido.
