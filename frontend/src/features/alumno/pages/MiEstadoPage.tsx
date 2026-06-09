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
      <h1 className="text-2xl font-bold text-gray-900">Mi Estado Académico</h1>
      
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-3 px-4 font-semibold text-gray-900">Materia</th>
              <th className="py-3 px-4 font-semibold text-gray-900">Estado</th>
              <th className="py-3 px-4 font-semibold text-gray-900 text-right">Nota Final</th>
            </tr>
          </thead>
          <tbody>
            {estados?.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-gray-500">
                  No estás inscripto en ninguna materia actualmente.
                </td>
              </tr>
            ) : (
              estados?.map(estado => (
                <tr key={estado.materia_id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      {estado.materia_nombre}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${estado.estado === 'promocionado' ? 'bg-green-100 text-green-800' :
                        estado.estado === 'regular' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}`}>
                      {estado.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
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
