import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { avisosApi } from '@/features/avisos/services/avisosApi';

interface AvisoRiesgoComposerProps {
  usuarioIds: string[];
  onSuccess: () => void;
  onCancel: () => void;
}

export const AvisoRiesgoComposer: React.FC<AvisoRiesgoComposerProps> = ({ usuarioIds, onSuccess, onCancel }) => {
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');

  const mutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        usuarioIds.map((usuario_id) => avisosApi.contactarAlumno({ usuario_id, titulo, cuerpo })),
      );
    },
  });

  const handleSend = async () => {
    try {
      await mutation.mutateAsync();
      onSuccess();
    } catch (error) {
      console.error('Error enviando aviso', error);
      alert('Error enviando el aviso.');
    }
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur-md p-6 rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-white/10">
      <h2 className="text-2xl font-serif text-white/90 mb-1">Avisar a Alumnos en Riesgo ({usuarioIds.length})</h2>
      <p className="text-sm text-white/50 mb-4">El aviso aparece en "Mis Avisos" del alumno y requiere acuse de recibo.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium text-white/90 mb-1">Título</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Estás en riesgo en la materia"
          className="w-full bg-black/20 border-white/10 rounded-md text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 placeholder:text-white/30"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-white/90 mb-1">Mensaje</label>
        <textarea
          rows={6}
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
          placeholder="Tenés actividades atrasadas. Acercate a la cátedra para regularizar tu situación."
          className="w-full bg-black/20 border-white/10 rounded-md text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 placeholder:text-white/30"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-white/10 rounded text-white/70 hover:bg-white/5 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSend}
          disabled={!titulo || !cuerpo || mutation.isPending}
          className="px-4 py-2 bg-red-600/90 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Enviando...' : 'Enviar Aviso'}
        </button>
      </div>
    </div>
  );
};
