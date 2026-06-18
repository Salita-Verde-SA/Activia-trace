import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEquipos } from '../hooks/useEquipos';
import { useUsuarios } from '../../admin/hooks/useUsuarios';
import { rolesApi } from '../../avisos/api/rolesApi';

interface EquiposPanelProps {
  materiaId: string;
  materiaNombre?: string;
  onClose?: () => void;
}

export const EquiposPanel: React.FC<EquiposPanelProps> = ({ materiaId, materiaNombre, onClose }) => {
  const { equipos, isLoading, error, eliminar, asignarMasivo } = useEquipos(materiaId);
  const { usuariosQuery } = useUsuarios({ rol: 'PROFESOR' });
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    usuario_id: '',
    rol_id: '',
    desde: new Date().toISOString().split('T')[0],
    hasta: ''
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles()
  });

  if (isLoading) return <div className="p-4 text-white/50">Cargando equipos...</div>;
  if (error) return <div className="p-4 text-red-400">Error al cargar equipos</div>;

  const handleEliminar = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta asignación?')) {
      eliminar.mutate(id);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profesorRole = roles?.find(r => r.nombre === 'PROFESOR');
    if (!formData.usuario_id || !profesorRole || !formData.desde) {
      if (!profesorRole) alert("Rol PROFESOR no encontrado en el sistema.");
      return;
    }
    
    asignarMasivo.mutate({
      materia_id: materiaId,
      desde: formData.desde,
      hasta: formData.hasta || undefined,
      docentes: [{
        usuario_id: formData.usuario_id,
        rol_id: profesorRole.id
      }]
    }, {
      onSuccess: () => {
        setIsAdding(false);
        setFormData({ ...formData, usuario_id: '', rol_id: '', hasta: '' });
      }
    });
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white/90">Equipos Docentes</h2>
          {materiaNombre && <p className="text-sm text-white/70">Materia: {materiaNombre}</p>}
        </div>
        <div className="space-x-3">
          {!isAdding && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-primary-600/80 text-white px-4 py-2 rounded-md hover:bg-primary-600 border border-primary-500/50 shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] transition-colors"
            >
              Agregar Docente
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="bg-white/5 text-white/70 border border-white/10 px-4 py-2 rounded-md hover:bg-white/10 transition-colors"
            >
              Volver
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="mb-6 p-4 border border-white/10 rounded-xl bg-black/20 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70">Docente</label>
              <select 
                required
                value={formData.usuario_id}
                onChange={e => setFormData({...formData, usuario_id: e.target.value})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 [&>option]:bg-neutral-900 [&>option]:text-white"
              >
                <option value="">Seleccione un docente...</option>
                {usuariosQuery.data?.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70">Desde</label>
              <input 
                type="date"
                required
                value={formData.desde}
                onChange={e => setFormData({...formData, desde: e.target.value})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70">Hasta (Opcional)</label>
              <input 
                type="date"
                value={formData.hasta}
                onChange={e => setFormData({...formData, hasta: e.target.value})}
                className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex space-x-2 pt-2">
            <button type="submit" disabled={asignarMasivo.isPending} className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-md hover:bg-green-500/30 transition-colors disabled:opacity-50">
              {asignarMasivo.isPending ? 'Guardando...' : 'Confirmar'}
            </button>
            <button 
              type="button" 
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-white/5 text-white/70 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {!equipos || equipos.length === 0 ? (
        <div className="text-center py-12 text-white/50 bg-black/10 rounded-lg border border-dashed border-white/20">
          No hay docentes asignados a esta materia aún.
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Docente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Vigencia</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-white/10">
              {equipos.map((equipo) => (
                <tr key={equipo.asignacion_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 font-bold mr-3 border border-primary-500/30">
                        {equipo.usuario_nombre.charAt(0)}{equipo.usuario_apellido.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white/90">
                          {equipo.usuario_apellido}, {equipo.usuario_nombre}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded border border-primary-500/30 bg-primary-500/20 text-primary-300">
                      {equipo.rol_nombre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    <div className="flex flex-col">
                      <span>Desde: {new Date(equipo.desde).toLocaleDateString()}</span>
                      {equipo.hasta && <span>Hasta: {new Date(equipo.hasta).toLocaleDateString()}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEliminar(equipo.asignacion_id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
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
