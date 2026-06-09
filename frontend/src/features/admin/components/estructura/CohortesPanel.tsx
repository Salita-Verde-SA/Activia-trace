import { useState } from 'react';
import { useEstructura } from '../../hooks/useEstructura';
import type { Cohorte } from '../../types';

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
        <h3 className="text-lg font-serif text-white/90">Cohortes</h3>
        {!isCreating && !editingId && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Nueva Cohorte
          </button>
        )}
      </div>

      {(isCreating || editingId) && (
        <form onSubmit={handleSubmit} className="p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70">Carrera</label>
              <select 
                required
                value={formData.carrera_id || ''}
                onChange={e => setFormData({...formData, carrera_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                <option value="">Seleccione carrera...</option>
                {carrerasQuery.data?.filter(c => c.activa).map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70">Nombre</label>
              <input 
                type="text" 
                required 
                value={formData.nombre || ''}
                onChange={e => setFormData({...formData, nombre: e.target.value})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70">Año</label>
              <input 
                type="number" 
                required 
                value={formData.anio || ''}
                onChange={e => setFormData({...formData, anio: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="activa_cohorte"
                checked={formData.activa}
                onChange={e => setFormData({...formData, activa: e.target.checked})}
                className="rounded border-white/10 bg-black/20 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="activa_cohorte" className="ml-2 block text-sm text-white/90">Activa</label>
            </div>
          </div>
          <div className="flex space-x-2">
            <button type="submit" className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md hover:bg-green-500/30 transition-colors">
              Guardar
            </button>
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setEditingId(null); }}
              className="px-4 py-2 bg-white/5 text-white/70 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5 border-y border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Carrera</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Año</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {cohortesQuery.data?.map(cohorte => {
              const carrera = carrerasQuery.data?.find(c => c.id === cohorte.carrera_id);
              return (
                <tr key={cohorte.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">{carrera?.codigo || 'Desconocida'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">{cohorte.nombre}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{cohorte.anio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded border ${cohorte.activa ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                      {cohorte.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(cohorte)} className="text-primary-400 hover:text-primary-300 transition-colors">Editar</button>
                  </td>
                </tr>
              );
            })}
            {cohortesQuery.data?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-white/50">No hay cohortes registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
