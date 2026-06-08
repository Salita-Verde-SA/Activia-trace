import { useState } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import { Usuario } from '../../types';

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
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white shadow-sm space-y-4">
      <h3 className="text-lg font-medium border-b pb-2">Nuevo Usuario</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            required 
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input 
            type="text" 
            required 
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Apellido</label>
          <input 
            type="text" 
            required 
            value={formData.apellido}
            onChange={e => setFormData({...formData, apellido: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Legajo (Opcional)</label>
          <input 
            type="text" 
            value={formData.legajo}
            onChange={e => setFormData({...formData, legajo: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      <div className="flex space-x-2 pt-2">
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
          Guardar
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Editar Roles - {usuario.nombre} {usuario.apellido}</h3>
        <p className="text-sm text-gray-500 mb-4">Seleccione los roles globales para este usuario.</p>
        
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-4 mb-4">
          {availableRoles.map(rol => (
            <div key={rol} className="flex items-center">
              <input
                type="checkbox"
                id={`rol-${rol}`}
                checked={roles.includes(rol)}
                onChange={() => toggleRole(rol)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`rol-${rol}`} className="ml-2 block text-sm text-gray-900">
                {rol}
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
            Cancelar
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none">
            Guardar Roles
          </button>
        </div>
      </div>
    </div>
  );
}
