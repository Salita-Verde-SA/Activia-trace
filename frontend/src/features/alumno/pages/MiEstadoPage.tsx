import { useEstadoAlumno } from '../hooks/useAlumno';
import { BookOpen } from 'lucide-react';

export const MiEstadoPage = () => {
  const { data: estados, isLoading, isError } = useEstadoAlumno();

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando estado académico...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error al cargar estado académico.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-serif text-white/90">Mi Estado Académico</h1>
      
      <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3 px-4 font-semibold text-white/90">Materia</th>
              <th className="py-3 px-4 font-semibold text-white/90">Estado</th>
              <th className="py-3 px-4 font-semibold text-white/90 text-right">Nota Final</th>
            </tr>
          </thead>
          <tbody>
            {estados?.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-white/70">
                  No estás inscripto en ninguna materia actualmente.
                </td>
              </tr>
            ) : (
              estados?.map(estado => (
                <tr key={estado.materia_id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-white/90">
                      <BookOpen className="w-4 h-4 text-white/50" />
                      {estado.materia_nombre}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${estado.estado === 'promocionado' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        estado.estado === 'regular' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-white/10 text-white/70 border-white/20'}`}>
                      {estado.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-white/90">
                    {estado.nota_final ?? '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
