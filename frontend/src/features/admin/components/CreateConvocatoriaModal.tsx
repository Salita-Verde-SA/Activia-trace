import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { crearConvocatoria } from '../services/adminApi';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import api from '@/shared/services/api';

interface CreateConvocatoriaModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateConvocatoriaModal: React.FC<CreateConvocatoriaModalProps> = ({ onClose, onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [materiaId, setMateriaId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [turnos, setTurnos] = useState([{ fecha_hora_inicio: '', fecha_hora_fin: '', cupo_maximo: 10 }]);

  const { data: materias } = useQuery<{ id: string; codigo: string; nombre: string }[]>({
    queryKey: ['admin-materias'],
    queryFn: async () => {
      const res = await api.get('/api/admin/materias');
      return res.data;
    },
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: crearConvocatoria,
    onSuccess: () => {
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      nombre,
      materia_id: materiaId,
      descripcion,
      turnos: turnos.map(t => ({
        ...t,
        fecha_hora_inicio: new Date(t.fecha_hora_inicio).toISOString(),
        fecha_hora_fin: new Date(t.fecha_hora_fin).toISOString(),
      })),
    });
  };

  const addTurno = () => {
    setTurnos([...turnos, { fecha_hora_inicio: '', fecha_hora_fin: '', cupo_maximo: 10 }]);
  };

  const updateTurno = (index: number, field: string, value: any) => {
    const newTurnos = [...turnos];
    newTurnos[index] = { ...newTurnos[index], [field]: value };
    setTurnos(newTurnos);
  };

  const removeTurno = (index: number) => {
    setTurnos(turnos.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Nueva Convocatoria a Coloquio</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre (ej. Coloquio Final)</label>
              <Input required value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre de la instancia" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Materia</label>
              <select
                required
                value={materiaId}
                onChange={e => setMateriaId(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar materia...</option>
                {materias?.map(m => (
                  <option key={m.id} value={m.id}>{m.codigo} — {m.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción (Opcional)</label>
              <textarea 
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                rows={3} 
                value={descripcion} 
                onChange={e => setDescripcion(e.target.value)} 
                placeholder="Detalles sobre el coloquio..." 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4 mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Turnos</h3>
              <Button type="button" variant="outline" size="sm" onClick={addTurno}>+ Agregar Turno</Button>
            </div>
            
            <div className="space-y-4">
              {turnos.map((turno, index) => (
                <div key={index} className="flex gap-4 items-end bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Inicio</label>
                    <Input type="datetime-local" required value={turno.fecha_hora_inicio} onChange={e => updateTurno(index, 'fecha_hora_inicio', e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Fin</label>
                    <Input type="datetime-local" required value={turno.fecha_hora_fin} onChange={e => updateTurno(index, 'fecha_hora_fin', e.target.value)} />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-gray-500 mb-1">Cupo</label>
                    <Input type="number" min="1" required value={turno.cupo_maximo} onChange={e => updateTurno(index, 'cupo_maximo', parseInt(e.target.value))} />
                  </div>
                  <button type="button" onClick={() => removeTurno(index)} className="text-red-500 hover:text-red-700 p-2" disabled={turnos.length === 1}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creando...' : 'Crear Convocatoria'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateConvocatoriaModal;
