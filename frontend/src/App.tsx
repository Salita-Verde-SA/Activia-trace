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
import { MisEquiposPage } from '@/features/equipos/pages/MisEquiposPage';
import { GestionEquiposPage } from '@/features/equipos/pages/GestionEquiposPage';
import { BandejaMensajesPage } from '@/features/mensajeria/pages/BandejaMensajesPage';
import { HiloMensajesPage } from '@/features/mensajeria/pages/HiloMensajesPage';
import { EncuentrosPage } from '@/features/encuentros/pages/EncuentrosPage';
import { MisEncuentrosPage } from '@/features/encuentros/pages/MisEncuentrosPage';
import { MisClasesPage } from '@/features/alumno/pages/MisClasesPage';
import { ProgramasPage } from '@/features/programas/pages/ProgramasPage';
import { PerfilPage } from '@/features/perfil/pages/PerfilPage';
import { GuardiasPage } from '@/features/guardias/pages/GuardiasPage';
import { GuardiasAdminPage } from '@/features/guardias/pages/GuardiasAdminPage';
import { ComunicacionesAdminPage } from '@/features/comunicaciones/pages/ComunicacionesAdminPage';
import { ComunicacionesPage } from '@/features/comunicaciones/pages/ComunicacionesPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RequireEquiposAdmin = () => {
  const { user } = useAuth();
  if (!user?.roles) return <Navigate to="/login" replace />;
  if (user.roles.includes('COORDINADOR') || user.roles.includes('ADMIN')) {
    return <GestionEquiposPage />;
  }
  return <Navigate to="/mis-equipos" replace />;
};

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
              <Route path="alumno/clases" element={<MisClasesPage />} />
              
              {/* Admin Panel routes */}
              <Route path="admin/estructura" element={<EstructuraAcademicaPage />} />
              <Route path="admin/materias" element={<MateriasPage />} />
              <Route path="admin/programas" element={<ProgramasPage />} />
              <Route path="perfil" element={<PerfilPage />} />
              <Route path="guardias" element={<GuardiasPage />} />
              <Route path="admin/guardias" element={<GuardiasAdminPage />} />
              <Route path="admin/comunicaciones" element={<ComunicacionesAdminPage />} />
              <Route path="comunicaciones" element={<ComunicacionesPage />} />
              <Route path="admin/usuarios" element={<GestionUsuariosPage />} />
              <Route path="admin/coloquios" element={<ColoquiosAdminPage />} />
              <Route path="auditoria" element={<AuditoriaPage />} />
              
              {/* Equipos routes */}
              <Route path="mis-equipos" element={<MisEquiposPage />} />
              <Route path="admin/equipos" element={<RequireEquiposAdmin />} />

              {/* Mensajería interna */}
              <Route path="mensajes" element={<BandejaMensajesPage />} />
              <Route path="mensajes/:hiloId" element={<HiloMensajesPage />} />

              {/* Encuentros */}
              <Route path="encuentros" element={<EncuentrosPage />} />
              <Route path="mis-encuentros" element={<MisEncuentrosPage />} />

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
