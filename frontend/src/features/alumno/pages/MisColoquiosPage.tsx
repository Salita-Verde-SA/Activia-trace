import { useColoquiosAlumno, useReservarColoquio } from '../hooks/useAlumno';
import { Calendar, Users } from 'lucide-react';

export const MisColoquiosPage = () => {
  const { data: coloquios, isLoading, isError } = useColoquiosAlumno();
  const { mutate: reservar, isPending } = useReservarColoquio();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando coloquios...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error al cargar coloquios disponibles.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-serif text-white/90">Reserva de Coloquios</h1>
      <p className="text-white/70">Explora los llamados abiertos y reserva tu lugar.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coloquios?.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white/5 backdrop-blur-md rounded-xl border border-white/10 border-dashed">
            <p className="text-white/70">No hay coloquios disponibles para inscribirse en este momento.</p>
          </div>
        ) : (
          coloquios?.map(coloquio => (
            <div key={coloquio.id} className="bg-white/5 backdrop-blur-md p-5 rounded-xl border border-white/10 shadow-sm flex flex-col justify-between hover:bg-white/10 transition-colors">
              <div>
                <h3 className="font-semibold text-white/90 text-lg">{coloquio.materia_nombre}</h3>
                <div className="mt-4 space-y-2 text-sm text-white/70">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-white/50" />
                    {new Date(coloquio.fecha).toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/50" />
                    Cupo: {coloquio.cupo_disponible} / {coloquio.cupo_total} disponibles
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => reservar(coloquio.id)}
                disabled={isPending || coloquio.cupo_disponible === 0}
                className="mt-6 w-full py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-md font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)]"
              >
                {coloquio.cupo_disponible === 0 ? 'Sin Cupo' : 'Reservar Lugar'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
