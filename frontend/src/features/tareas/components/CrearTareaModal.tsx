import React, { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUsuarios } from '@/features/admin/hooks/useUsuarios';
import { PrioridadTarea } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { titulo: string; descripcion: string; prioridad: PrioridadTarea; asignado_a: string }) => void;
}

export const CrearTareaModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const isProfesor = user?.roles?.includes('PROFESOR') && !user?.roles?.includes('ADMIN') && !user?.roles?.includes('COORDINADOR');
  
  // Si es profesor, solo puede asignar a tutores. Sino, a cualquiera
  const { usuariosQuery } = useUsuarios(isProfesor ? { rol: 'TUTOR' } : undefined);
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState<PrioridadTarea>(PrioridadTarea.MEDIUM);
  const [asignadoA, setAsignadoA] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      titulo,
      descripcion,
      prioridad,
      asignado_a: asignadoA
    });
    setTitulo('');
    setDescripcion('');
    setAsignadoA('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-serif text-white/90 mb-4">Nueva Tarea</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label-caps uppercase tracking-wider text-white/50 mb-1">Título</label>
            <input 
              required
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs font-label-caps uppercase tracking-wider text-white/50 mb-1">Descripción</label>
            <textarea 
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white/90 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
            />
          </div>
          <div>
            <label className="block text-xs font-label-caps uppercase tracking-wider text-white/50 mb-1">Prioridad</label>
            <select 
              value={prioridad}
              onChange={e => setPrioridad(e.target.value as PrioridadTarea)}
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg p-2 text-white/90 focus:border-primary focus:outline-none"
            >
              <option value={PrioridadTarea.LOW}>Baja</option>
              <option value={PrioridadTarea.MEDIUM}>Media</option>
              <option value={PrioridadTarea.HIGH}>Alta</option>
              <option value={PrioridadTarea.URGENT}>Urgente</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-label-caps uppercase tracking-wider text-white/50 mb-1">Asignar a</label>
            <select 
              required
              value={asignadoA}
              onChange={e => setAsignadoA(e.target.value)}
              className="w-full bg-[#2A2A2A] border border-white/10 rounded-lg p-2 text-white/90 focus:border-primary focus:outline-none"
            >
              <option value="">Seleccione un usuario...</option>
              {usuariosQuery.data?.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} {u.apellido}</option>
              ))}
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-white/70 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(242,202,80,0.3)]"
            >
              Crear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
