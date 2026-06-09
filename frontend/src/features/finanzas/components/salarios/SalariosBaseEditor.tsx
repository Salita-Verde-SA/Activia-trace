import { useState } from 'react';
import { useSalarios } from '../../hooks/useSalarios';
import type { SalarioBase } from '../../types';

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
      // Validate overlapping dates for new records
      const existingRecord = salariosBaseQuery.data?.find(s => s.rol === formData.rol);
      if (existingRecord) {
        alert(`Error: Ya existe un salario base configurado para el rol ${formData.rol}. Por favor, edite el registro existente en lugar de crear uno nuevo.`);
        return;
      }

      createSalarioBase.mutate(formData, {
        onSuccess: () => {
          setIsCreating(false);
          setFormData({ rol: '', monto: 0, vigente_desde: new Date().toISOString().split('T')[0] });
        },
        onError: (err: any) => {
          alert(err?.response?.data?.detail || "Ocurrió un error al guardar.");
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
        <h3 className="text-lg font-serif text-white/90">Salarios Base por Rol</h3>
        {!isCreating && !editingId && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] text-sm rounded-md hover:bg-primary-600 transition-colors"
          >
            Nuevo Valor Base
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70">Rol</label>
              <select 
                required
                value={formData.rol || ''}
                onChange={e => setFormData({...formData, rol: e.target.value})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                <option value="">Seleccionar...</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70">Monto Base ($)</label>
              <input 
                type="number" 
                required 
                min="0"
                step="0.01"
                value={formData.monto || ''}
                onChange={e => setFormData({...formData, monto: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70">Vigente Desde</label>
              <input 
                type="date" 
                required 
                value={formData.vigente_desde || ''}
                onChange={e => setFormData({...formData, vigente_desde: e.target.value})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70">Vigente Hasta (Opcional)</label>
              <input 
                type="date" 
                value={formData.vigente_hasta || ''}
                onChange={e => setFormData({...formData, vigente_hasta: e.target.value || undefined})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md hover:bg-green-500/30 text-sm transition-colors">
              Guardar
            </button>
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setEditingId(null); }}
              className="px-4 py-2 bg-white/5 text-white/70 border border-white/10 rounded-md hover:bg-white/10 text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto border border-white/10 rounded-xl shadow-sm bg-black/10 backdrop-blur-sm">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Monto Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Vigente Desde</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Vigente Hasta</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {salariosBaseQuery.data?.map(salario => (
              <tr key={salario.id} className={`transition-colors ${salario.vigente_hasta ? "bg-black/40 opacity-75" : "hover:bg-white/5"}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/90">{salario.rol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">${salario.monto.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{new Date(salario.vigente_desde).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/50">{salario.vigente_hasta ? new Date(salario.vigente_hasta).toLocaleDateString() : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(salario)} className="text-primary-400 hover:text-primary-300">Editar</button>
                </td>
              </tr>
            ))}
            {salariosBaseQuery.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-white/50">No hay salarios base configurados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
