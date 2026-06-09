import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const MainLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-noir">
        <div className="text-muted-gold font-label-caps tracking-widest">LOADING...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen overflow-hidden bg-noir relative w-full">
      {/* Ambient Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-noir">
        <div className="ambient-glow-gold top-[-10%] right-[-10%]"></div>
        <div className="ambient-glow-rose bottom-[-10%] left-[-10%]"></div>
        <div className="ambient-glow-primary top-[20%] left-[10%]"></div>
      </div>
      
      <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col lg:ml-72 relative min-h-screen z-10 w-full">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto pt-32 pb-12 px-4 md:px-margin-x max-w-[1440px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
