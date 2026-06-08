import { useState } from 'react';
import { useEstructura } from '../../hooks/useEstructura';
import { Cohorte } from '../../types';

export function CohortesPanel() {
  const { cohortesQuery, carrerasQuery, createCohorte, updateCohorte } = useEstructura();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Cohorte>>({ carrera_id: '', nombre: '', anio: new Date().getFullYear(), activa: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCohorte.mutate({ id: editingId, data: formData }, {
        onSuccess: () => setEditingId(null)
      });
    } else {
      createCohorte.mutate(formData, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({ carrera_id: '', nombre: '', anio: new Date().getFullYear(), activa: true });
        }
      });
    }
  };

  const handleEdit = (cohorte: Cohorte) => {
    setEditingId(cohorte.id);
    setFormData({ carrera_id: cohorte.carrera_id, nombre: cohorte.nombre, anio: cohorte.anio, activa: cohorte.activa });
  };

  if (cohortesQuery.isLoading || carrerasQuery.isLoading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Cohortes</h3>
        {!isCreating && !editingId && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Nueva Cohorte
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Carrera</label>
              <select 
                required
                value={formData.carrera_id || ''}
                onChange={e => setFormData({...formData, carrera_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Seleccione carrera...</option>
                {carrerasQuery.data?.filter(c => c.activa).map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input 
                type="text" 
                required 
                value={formData.nombre || ''}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Año</label>
              <input 
                type="number" 
                required 
                value={formData.anio || ''}
                onChange={e => setFormData({...formData, anio: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="activa_cohorte"
                checked={formData.activa}
                onChange={e => setFormData({...formData, activa: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="activa_cohorte" className="ml-2 block text-sm text-gray-900">Activa</label>
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Guardar
            </button>
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setEditingId(null); }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrera</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cohortesQuery.data?.map(cohorte => {
              const carrera = carrerasQuery.data?.find(c => c.id === cohorte.carrera_id);
              return (
                <tr key={cohorte.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{carrera?.codigo || 'Desconocida'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{cohorte.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cohorte.anio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cohorte.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {cohorte.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(cohorte)} className="text-blue-600 hover:text-blue-900">Editar</button>
                  </td>
                </tr>
              );
            })}
            {cohortesQuery.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay cohortes registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
