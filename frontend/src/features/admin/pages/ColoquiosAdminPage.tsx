import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listarConvocatoriasAdmin, publicarConvocatoria } from '../services/adminApi';
import { Button } from '@/shared/components/ui/Button';
import CreateConvocatoriaModal from '../components/CreateConvocatoriaModal';
import ImportarPadronModal from '../components/ImportarPadronModal';
import ConvocatoriaDetailModal from '../components/ConvocatoriaDetailModal';
import type { ConvocatoriaColoquio } from '../types/coloquios';

const ColoquiosAdminPage = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPadron, setSelectedPadron] = useState<string | null>(null);
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<ConvocatoriaColoquio | null>(null);

  const queryClient = useQueryClient();

  const { data: convocatorias, isLoading, refetch } = useQuery<ConvocatoriaColoquio[]>({
    queryKey: ['admin-convocatorias'],
    queryFn: listarConvocatoriasAdmin,
  });

  const publicarMutation = useMutation({
    mutationFn: (id: string) => publicarConvocatoria(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-convocatorias'] }),
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Coloquios</h1>
          <p className="text-gray-500 mt-2">Administra convocatorias, padrones y turnos.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Crear Convocatoria
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Convocatoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Turnos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {convocatorias?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">{c.nombre}</div>
                    <div className="text-sm text-gray-500">{c.descripcion}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {c.materia_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {c.turnos?.length || 0} turnos
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {c.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                    {c.estado === 'Borrador' && (
                      <button
                        onClick={() => publicarMutation.mutate(c.id)}
                        disabled={publicarMutation.isPending}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                      >
                        Publicar
                      </button>
                    )}
                    <button onClick={() => setSelectedConvocatoria(c)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                      Ver Agenda
                    </button>
                    <button onClick={() => setSelectedPadron(c.id)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      Padrón
                    </button>
                  </td>
                </tr>
              ))}
              {convocatorias?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No hay convocatorias creadas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isCreateModalOpen && (
        <CreateConvocatoriaModal 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false);
            refetch();
          }}
        />
      )}
      
      {selectedPadron && (
        <ImportarPadronModal
          convocatoriaId={selectedPadron}
          onClose={() => setSelectedPadron(null)}
          onSuccess={() => {
            setSelectedPadron(null);
            refetch();
          }}
        />
      )}
      
      {selectedConvocatoria && (
        <ConvocatoriaDetailModal
          convocatoria={selectedConvocatoria}
          onClose={() => setSelectedConvocatoria(null)}
        />
      )}
    </div>
  );
};

export default ColoquiosAdminPage;
