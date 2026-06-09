import { useAvisosAlumno } from '../hooks/useAlumno';
import { AvisoCard } from '../components/AvisoCard';

export const MisAvisosPage = () => {
  const { data: avisos, isLoading, isError } = useAvisosAlumno();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando avisos...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error al cargar los avisos.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif text-white/90">Mis Avisos</h1>
      </div>

      <div className="space-y-4">
        {avisos?.length === 0 ? (
          <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 border-dashed">
            <p className="text-white/70">No tienes avisos pendientes.</p>
          </div>
        ) : (
          avisos?.map(aviso => (
            <AvisoCard key={aviso.id} aviso={aviso} />
          ))
        )}
      </div>
    </div>
  );
};
