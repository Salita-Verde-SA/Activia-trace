import { useState } from 'react';
import { useUsuarios } from '../hooks/useUsuarios';
import type { Usuario } from '../types';
import { AddUserForm, EditRolesModal } from '../components/usuarios/AddUserForm';

export function GestionUsuariosPage() {
  const [filterEmail, setFilterEmail] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const { usuariosQuery } = useUsuarios({ email: filterEmail, rol: filterRol });
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-white/70">Administración de usuarios del tenant y sus roles globales.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] rounded-md hover:bg-primary-600 transition-colors"
        >
          Nuevo Usuario
        </button>
      </div>

      <div className="flex space-x-4 bg-white/5 backdrop-blur-md p-4 border border-white/10 rounded-xl">
        <div>
          <label className="block text-sm font-medium text-white/70">Email</label>
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="Buscar por email..."
            className="mt-1 block w-64 rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white/70">Rol</label>
          <select
            value={filterRol}
            onChange={(e) => setFilterRol(e.target.value)}
            className="mt-1 block w-48 rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="">Todos</option>
            <option value="ALUMNO">Alumno</option>
            <option value="TUTOR">Tutor</option>
            <option value="PROFESOR">Profesor</option>
            <option value="COORDINADOR">Coordinador</option>
            <option value="ADMIN">Admin</option>
            <option value="FINANZAS">Finanzas</option>
          </select>
        </div>
      </div>

      {isAdding && <AddUserForm onClose={() => setIsAdding(false)} />}
      
      {editingUser && (
        <EditRolesModal 
          usuario={editingUser} 
          onClose={() => setEditingUser(null)} 
        />
      )}

      {usuariosQuery.isLoading ? (
        <div className="p-4 text-center text-white/50">Cargando usuarios...</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/10 backdrop-blur-sm shadow-sm">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Roles</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {usuariosQuery.data?.map(usuario => (
                <tr key={usuario.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/90">
                    {usuario.nombre} {usuario.apellido}
                    {usuario.legajo && <span className="block text-xs text-white/50">Legajo: {usuario.legajo}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{usuario.email}</td>
                  <td className="px-6 py-4 text-sm text-white/70">
                    <div className="flex flex-wrap gap-1">
                      {usuario.roles?.map(rol => (
                        <span key={rol} className="px-2 inline-flex text-xs leading-5 font-semibold rounded border border-primary-500/30 bg-primary-500/20 text-primary-300">
                          {rol}
                        </span>
                      ))}
                      {(!usuario.roles || usuario.roles.length === 0) && (
                        <span className="text-white/40 italic text-xs">Sin roles</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setEditingUser(usuario)}
                      className="text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      Editar Roles
                    </button>
                  </td>
                </tr>
              ))}
              {usuariosQuery.data?.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-white/50">No se encontraron usuarios.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
