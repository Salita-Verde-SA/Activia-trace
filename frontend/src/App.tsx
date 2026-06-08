import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/features/shell/layouts/MainLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { CalificacionesPage } from '@/features/calificaciones/pages/CalificacionesPage';
import { MonitorGlobalPage } from '@/features/coordinacion/pages/MonitorGlobalPage';
import { AvisosAdminPage } from '@/features/avisos/pages/AvisosAdminPage';
import { TareasBoard } from '@/features/tareas/components/TareasBoard';
import { SetupCuatrimestreWizard } from '@/features/coordinacion/components/SetupCuatrimestreWizard';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="calificaciones" element={<CalificacionesPage />} />
              <Route path="admin/monitor" element={<MonitorGlobalPage />} />
              <Route path="admin/avisos" element={<AvisosAdminPage />} />
              <Route path="admin/tareas" element={<TareasBoard />} />
              <Route path="admin/setup" element={<SetupCuatrimestreWizard onComplete={() => {}} onCancel={() => {}} />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
