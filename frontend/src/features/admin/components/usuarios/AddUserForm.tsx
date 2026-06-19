import { useState } from 'react';
import { useUsuarios } from '../../hooks/useUsuarios';
import type { Usuario } from '../../types';

const inputCls = 'w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-white/20';
const labelCls = 'block text-sm font-medium text-white/70 mb-1';

const DEFAULT_PASSWORD = 'ActiviaTemp123!';

export function AddUserForm({ onClose }: { onClose: () => void }) {
  const { createUsuario } = useUsuarios();
  const [formData, setFormData] = useState<Partial<Usuario> & { password?: string }>({
    email: '',
    nombre: '',
    apellido: '',
    legajo: '',
    dni: '',
    cuil: '',
    cbu: '',
    alias_cbu: '',
    password: '',
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUsuario.mutate(formData, { onSuccess: () => onClose() });
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm p-6 mb-6 space-y-6">
      <h3 className="text-xl font-serif text-white/90 border-b border-white/10 pb-3">Nuevo Usuario</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos básicos */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Datos de acceso</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Email</label>
              <input type="email" required value={formData.email} onChange={set('email')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Nombre</label>
              <input type="text" required value={formData.nombre} onChange={set('nombre')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Apellido</label>
              <input type="text" required value={formData.apellido} onChange={set('apellido')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Legajo <span className="text-white/30">(opcional)</span></label>
              <input type="text" value={formData.legajo} onChange={set('legajo')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                Contraseña inicial <span className="text-white/30">(opcional)</span>
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={set('password')}
                placeholder={DEFAULT_PASSWORD}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-white/30">
                Si se deja vacío, se usa <span className="font-mono">{DEFAULT_PASSWORD}</span>
              </p>
            </div>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Datos de identidad */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Identidad <span className="normal-case font-normal text-white/30">(opcional)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>DNI</label>
              <input type="text" value={formData.dni} onChange={set('dni')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>CUIL</label>
              <input type="text" value={formData.cuil} onChange={set('cuil')} className={inputCls} />
            </div>
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Datos bancarios */}
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Datos bancarios <span className="normal-case font-normal text-white/30">(opcional)</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>CBU</label>
              <input type="text" value={formData.cbu} onChange={set('cbu')} placeholder="22 dígitos" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Alias CBU</label>
              <input type="text" value={formData.alias_cbu} onChange={set('alias_cbu')} placeholder="alias.banco.ejemplo" className={inputCls} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={createUsuario.isPending}
            className="px-5 py-2 bg-primary-600/80 hover:bg-primary-600 border border-primary-500/50 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {createUsuario.isPending ? 'Guardando...' : 'Guardar usuario'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditRolesModal({ usuario, onClose }: { usuario: Usuario, onClose: () => void }) {
  const { updateUsuario } = useUsuarios();
  const [roles, setRoles] = useState<string[]>(usuario.roles || []);
  const availableRoles = ['ALUMNO', 'TUTOR', 'PROFESOR', 'COORDINADOR', 'NEXO', 'ADMIN', 'FINANZAS'];

  const toggleRole = (rol: string) => {
    setRoles(prev => prev.includes(rol) ? prev.filter(r => r !== rol) : [...prev, rol]);
  };

  const handleSave = () => {
    updateUsuario.mutate({ id: usuario.id, data: { roles } }, { onSuccess: () => onClose() });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-serif text-white/90 mb-1">Editar Roles</h3>
        <p className="text-sm text-white/40 mb-5">
          {usuario.nombre} {usuario.apellido}
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto border border-white/10 bg-black/20 rounded-lg p-3 mb-6">
          {availableRoles.map(rol => (
            <label key={rol} className="flex items-center gap-3 py-1 cursor-pointer group">
              <input
                type="checkbox"
                checked={roles.includes(rol)}
                onChange={() => toggleRole(rol)}
                className="h-4 w-4 rounded border-white/20 bg-black/50 text-primary-500 focus:ring-primary-500/50"
              />
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">{rol}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={updateUsuario.isPending}
            className="px-4 py-2 bg-primary-600/80 hover:bg-primary-600 border border-primary-500/50 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {updateUsuario.isPending ? 'Guardando...' : 'Guardar roles'}
          </button>
        </div>
      </div>
    </div>
  );
}
