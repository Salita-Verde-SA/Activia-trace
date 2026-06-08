import React from 'react';
import { useEquipos } from '../hooks/useEquipos';

interface EquiposPanelProps {
  materiaId: string;
}

export const EquiposPanel: React.FC<EquiposPanelProps> = ({ materiaId }) => {
  const { equipos, isLoading, error, eliminar } = useEquipos(materiaId);

  if (isLoading) return <div className="p-4 text-gray-500">Cargando equipos...</div>;
  if (error) return <div className="p-4 text-red-500">Error al cargar equipos</div>;

  const handleEliminar = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      eliminar.mutate(id);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Equipos Docentes</h2>
        <div className="space-x-3">
          <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors">
            Asignar Masivo
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
            Clonar Equipo
          </button>
        </div>
      </div>

      {!equipos || equipos.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          No hay docentes asignados a esta materia aún.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipos.map((equipo) => (
                <tr key={equipo.asignacion_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                        {equipo.usuario_nombre.charAt(0)}{equipo.usuario_apellido.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {equipo.usuario_apellido}, {equipo.usuario_nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {equipo.rol_nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>Desde: {new Date(equipo.desde).toLocaleDateString()}</span>
                      {equipo.hasta && <span>Hasta: {new Date(equipo.hasta).toLocaleDateString()}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">Editar</button>
                    <button 
                      onClick={() => handleEliminar(equipo.asignacion_id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
