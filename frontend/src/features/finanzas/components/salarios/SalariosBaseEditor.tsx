import { useState } from 'react';
import { useSalarios } from '../../hooks/useSalarios';
import { SalarioBase } from '../../types';

export function SalariosBaseEditor() {
  const { salariosBaseQuery, createSalarioBase, updateSalarioBase } = useSalarios();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<SalarioBase>>({ rol: '', monto: 0, vigente_desde: new Date().toISOString().split('T')[0] });

  const roles = ['PROFESOR', 'TUTOR', 'COORDINADOR'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateSalarioBase.mutate({ id: editingId, data: formData }, {
        onSuccess: () => setEditingId(null)
      });
    } else {
      createSalarioBase.mutate(formData, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({ rol: '', monto: 0, vigente_desde: new Date().toISOString().split('T')[0] });
        }
      });
    }
  };

  const handleEdit = (salario: SalarioBase) => {
    setEditingId(salario.id);
    setFormData({ 
      rol: salario.rol, 
      monto: salario.monto, 
      vigente_desde: salario.vigente_desde ? new Date(salario.vigente_desde).toISOString().split('T')[0] : '',
      vigente_hasta: salario.vigente_hasta ? new Date(salario.vigente_hasta).toISOString().split('T')[0] : undefined
    });
  };

  if (salariosBaseQuery.isLoading) return <div className="p-4">Cargando...</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Salarios Base por Rol</h3>
        {!isCreating && !editingId && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Nuevo Valor Base
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 border rounded bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <label className="block text-sm font-medium text-gray-700">Monto Base ($)</label>
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
              <label className="block text-sm font-medium text-gray-700">Vigente Hasta (Opcional)</label>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigente Desde</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigente Hasta</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salariosBaseQuery.data?.map(salario => (
              <tr key={salario.id} className={salario.vigente_hasta ? "bg-gray-50 opacity-75" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{salario.rol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${salario.monto.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(salario.vigente_desde).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{salario.vigente_hasta ? new Date(salario.vigente_hasta).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(salario)} className="text-blue-600 hover:text-blue-900">Editar</button>
                </td>
              </tr>
            ))}
            {salariosBaseQuery.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hay salarios base configurados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
