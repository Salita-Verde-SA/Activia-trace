import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/features/auth/context/AuthContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/features/shell/layouts/MainLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { CalificacionesPage } from '@/features/calificaciones/pages/CalificacionesPage';
import { MonitorGlobalPage } from '@/features/coordinacion/pages/MonitorGlobalPage';
import { AvisosAdminPage } from '@/features/avisos/pages/AvisosAdminPage';
import { TareasBoard } from '@/features/tareas/components/TareasBoard';
import { SetupCuatrimestreWizard } from '@/features/coordinacion/components/SetupCuatrimestreWizard';
import { EstructuraAcademicaPage } from '@/features/admin/pages/EstructuraAcademicaPage';
import { MateriasPage } from '@/features/admin/pages/MateriasPage';
import { GestionUsuariosPage } from '@/features/admin/pages/GestionUsuariosPage';
import { AuditoriaPage } from '@/features/auditoria/pages/AuditoriaPage';
import { GrillaSalarialPage } from '@/features/finanzas/pages/GrillaSalarialPage';
import { LiquidacionesDashboardPage } from '@/features/finanzas/pages/LiquidacionesDashboardPage';
import { FacturasAdminPage } from '@/features/finanzas/pages/FacturasAdminPage';
import { MiEstadoPage } from '@/features/alumno/pages/MiEstadoPage';
import { MisAvisosPage } from '@/features/alumno/pages/MisAvisosPage';
import { MisColoquiosPage } from '@/features/alumno/pages/MisColoquiosPage';
import { FacturasDocentePage } from '@/features/profesor/pages/FacturasDocentePage';
import ColoquiosAdminPage from '@/features/admin/pages/ColoquiosAdminPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user || !user.roles || user.roles.length === 0) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.roles.includes('ADMIN') || user.roles.includes('COORDINADOR')) {
    return <Navigate to="/admin/monitor" replace />;
  }
  if (user.roles.includes('FINANZAS')) {
    return <Navigate to="/finanzas/salarios" replace />;
  }
  if (user.roles.includes('PROFESOR') || user.roles.includes('TUTOR')) {
    return <Navigate to="/calificaciones" replace />;
  }
  if (user.roles.includes('ALUMNO')) {
    return <Navigate to="/alumno/estado" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<RoleBasedRedirect />} />
              <Route path="calificaciones" element={<CalificacionesPage />} />
              <Route path="admin/monitor" element={<MonitorGlobalPage />} />
              <Route path="admin/avisos" element={<AvisosAdminPage />} />
              <Route path="admin/tareas" element={<TareasBoard mode="globales" />} />
              <Route path="profesor/tareas" element={<TareasBoard mode="asignadas-por-mi" />} />
              <Route path="admin/setup" element={<SetupCuatrimestreWizard onComplete={() => {}} onCancel={() => {}} />} />
              
              {/* Alumno Panel routes */}
              <Route path="alumno/estado" element={<MiEstadoPage />} />
              <Route path="mis-avisos" element={<MisAvisosPage />} />
              <Route path="alumno/coloquios" element={<MisColoquiosPage />} />
              
              {/* Admin Panel routes */}
              <Route path="admin/estructura" element={<EstructuraAcademicaPage />} />
              <Route path="admin/materias" element={<MateriasPage />} />
              <Route path="admin/usuarios" element={<GestionUsuariosPage />} />
              <Route path="admin/coloquios" element={<ColoquiosAdminPage />} />
              <Route path="auditoria" element={<AuditoriaPage />} />
              
              {/* Profesor routes */}
              <Route path="profesor/facturas" element={<FacturasDocentePage />} />
              
              {/* Finanzas routes */}
              <Route path="finanzas/salarios" element={<GrillaSalarialPage />} />
              <Route path="finanzas/liquidaciones" element={<LiquidacionesDashboardPage />} />
              <Route path="finanzas/facturas" element={<FacturasAdminPage />} />
            </Route>
            
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
