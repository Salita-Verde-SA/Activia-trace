import { useState } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import type { Usuario } from '../../types';

export function AddUserForm({ onClose }: { onClose: () => void }) {
  const { createUsuario } = useUsuarios();
  const [formData, setFormData] = useState<Partial<Usuario>>({
    email: '',
    nombre: '',
    apellido: '',
    legajo: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUsuario.mutate(formData, {
      onSuccess: () => onClose()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md shadow-sm space-y-4 mb-6">
      <h3 className="text-xl font-serif text-white/90 border-b border-white/10 pb-3">Nuevo Usuario</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white/70">Email</label>
          <input 
            type="email" 
            required 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="mt-1 block w-full rounded-md border-white/10 bg-black/20 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70">Nombre</label>
          <input 
            type="text" 
            required 
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            className="mt-1 block w-full rounded-md border-white/10 bg-black/20 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70">Apellido</label>
          <input 
            type="text" 
            required 
            value={formData.apellido}
            onChange={e => setFormData({...formData, apellido: e.target.value})}
            className="mt-1 block w-full rounded-md border-white/10 bg-black/20 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70">Legajo (Opcional)</label>
          <input 
            type="text" 
            value={formData.legajo}
            onChange={e => setFormData({...formData, legajo: e.target.value})}
            className="mt-1 block w-full rounded-md border-white/10 bg-black/20 text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="flex space-x-3 pt-4">
        <button type="submit" className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] rounded-md hover:bg-primary-600 transition-colors text-sm font-medium">
          Guardar Usuario
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function EditRolesModal({ usuario, onClose }: { usuario: Usuario, onClose: () => void }) {
  const { updateUsuario } = useUsuarios();
  const [roles, setRoles] = useState<string[]>(usuario.roles || []);
  const availableRoles = ['ALUMNO', 'TUTOR', 'PROFESOR', 'COORDINADOR', 'NEXO', 'ADMIN', 'FINANZAS'];

  const toggleRole = (rol: string) => {
    if (roles.includes(rol)) {
      setRoles(roles.filter(r => r !== rol));
    } else {
      setRoles([...roles, rol]);
    }
  };

  const handleSave = () => {
    updateUsuario.mutate({ id: usuario.id, data: { roles } }, {
      onSuccess: () => onClose()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-serif text-white/90 mb-2">Editar Roles</h3>
        <p className="text-sm text-white/50 mb-6">Seleccione los roles globales para {usuario.nombre} {usuario.apellido}</p>
        
        <div className="space-y-3 max-h-60 overflow-y-auto border border-white/10 bg-black/20 rounded-lg p-4 mb-6">
          {availableRoles.map(rol => (
            <div key={rol} className="flex items-center group">
              <input
                type="checkbox"
                id={`rol-${rol}`}
                checked={roles.includes(rol)}
                onChange={() => toggleRole(rol)}
                className="h-4 w-4 text-primary-500 focus:ring-primary-500/50 bg-black/50 border-white/20 rounded transition-colors"
              />
              <label htmlFor={`rol-${rol}`} className="ml-3 block text-sm font-medium text-white/70 group-hover:text-white transition-colors cursor-pointer">
                {rol}
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 bg-white/5 border border-white/10 rounded-md text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] rounded-md hover:bg-primary-600 transition-colors text-sm font-medium">
            Guardar Roles
          </button>
        </div>
      </div>
    </div>
  );
}
