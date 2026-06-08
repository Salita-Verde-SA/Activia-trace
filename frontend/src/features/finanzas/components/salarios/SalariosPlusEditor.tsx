import { useState } from 'react';
import { useSalarios } from '../../hooks/useSalarios';
import { SalarioPlus } from '../../types';

export function SalariosPlusEditor() {
  const { salariosPlusQuery, createSalarioPlus, updateSalarioPlus } = useSalarios();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<SalarioPlus>>({ grupo_nombre: '', rol: '', monto: 0, vigente_desde: new Date().toISOString().split('T')[0] });

  const roles = ['PROFESOR', 'TUTOR', 'COORDINADOR'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSalarioPlus.mutate({ id: editingId, data: formData }, {
        onSuccess: () => setEditingId(null)
      });
    } else {
      createSalarioPlus.mutate(formData, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({ grupo_nombre: '', rol: '', monto: 0, vigente_desde: new Date().toISOString().split('T')[0] });
        }
      });
    }
  };

  const handleEdit = (salario: SalarioPlus) => {
    setEditingId(salario.id);
    setFormData({ 
      grupo_nombre: salario.grupo_nombre,
      rol: salario.rol, 
      monto: salario.monto, 
      vigente_desde: salario.vigente_desde ? new Date(salario.vigente_desde).toISOString().split('T')[0] : '',
      vigente_hasta: salario.vigente_hasta ? new Date(salario.vigente_hasta).toISOString().split('T')[0] : undefined
    });
  };

  if (salariosPlusQuery.isLoading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Salarios Plus (por Grupo)</h3>
        {!isCreating && !editingId && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Nuevo Valor Plus
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Grupo</label>
              <input 
                type="text" 
                required
                placeholder="Ej: Antigüedad, Título"
                value={formData.grupo_nombre || ''}
                onChange={e => setFormData({...formData, grupo_nombre: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select 
                required
                value={formData.rol || ''}
                onChange={e => setFormData({...formData, rol: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar...</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto Plus ($)</label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                value={formData.monto || ''}
                onChange={e => setFormData({...formData, monto: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vigente Desde</label>
              <input 
                type="date" 
                required 
                value={formData.vigente_desde || ''}
                onChange={e => setFormData({...formData, vigente_desde: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vigente Hasta</label>
              <input 
                type="date" 
                value={formData.vigente_hasta || ''}
                onChange={e => setFormData({...formData, vigente_hasta: e.target.value || undefined})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              Guardar
            </button>
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setEditingId(null); }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Plus</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigente Desde</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigente Hasta</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salariosPlusQuery.data?.map(salario => (
              <tr key={salario.id} className={salario.vigente_hasta ? "bg-gray-50 opacity-75" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{salario.grupo_nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salario.rol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${salario.monto.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(salario.vigente_desde).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salario.vigente_hasta ? new Date(salario.vigente_hasta).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(salario)} className="text-blue-600 hover:text-blue-900">Editar</button>
                </td>
              </tr>
            ))}
            {salariosPlusQuery.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay salarios plus configurados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
