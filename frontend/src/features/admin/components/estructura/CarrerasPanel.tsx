import { useState } from 'react';
import { useEstructura } from '../../hooks/useEstructura';
import type { Carrera } from '../../types';

export function CarrerasPanel() {
  const { carrerasQuery, createCarrera, updateCarrera } = useEstructura();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Carrera>>({ codigo: '', nombre: '', activa: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCarrera.mutate({ id: editingId, data: formData }, {
        onSuccess: () => setEditingId(null)
      });
    } else {
      createCarrera.mutate(formData, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({ codigo: '', nombre: '', activa: true });
        }
      });
    }
  };

  const handleEdit = (carrera: Carrera) => {
    setEditingId(carrera.id);
    setFormData({ codigo: carrera.codigo, nombre: carrera.nombre, activa: carrera.activa });
  };

  if (carrerasQuery.isLoading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Carreras</h3>
        {!isCreating && !editingId && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Nueva Carrera
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input 
                type="text" 
                required 
                value={formData.codigo || ''}
                onChange={e => setFormData({...formData, codigo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="activa"
                checked={formData.activa}
                onChange={e => setFormData({...formData, activa: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="activa" className="ml-2 block text-sm text-gray-900">Activa</label>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {carrerasQuery.data?.map(carrera => (
              <tr key={carrera.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{carrera.codigo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{carrera.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${carrera.activa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {carrera.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(carrera)} className="text-blue-600 hover:text-blue-900">Editar</button>
                </td>
              </tr>
            ))}
            {carrerasQuery.data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hay carreras registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
