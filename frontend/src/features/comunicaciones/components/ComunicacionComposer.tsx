import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLote } from '../services/comunicacionesApi';
import type { ComunicacionCreate } from '../types';

interface ComunicacionComposerProps {
  alumnoIds: string[];
  materiaId: string;
  onSuccess: (loteId: string) => void;
  onCancel: () => void;
}

export const ComunicacionComposer: React.FC<ComunicacionComposerProps> = ({ alumnoIds, materiaId, onSuccess, onCancel }) => {
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const queryClient = useQueryClient();

  const loteMutation = useMutation({
    mutationFn: (comunicaciones: ComunicacionCreate[]) => createLote({ comunicaciones }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lotes'] });
    }
  });

  const handleSend = async () => {
    const comunicaciones: ComunicacionCreate[] = alumnoIds.map(email => ({
      destinatario: email,
      asunto,
      cuerpo,
    }));

    try {
      const loteId = await loteMutation.mutateAsync(comunicaciones);
      onSuccess(loteId);
    } catch (error) {
      console.error('Error enviando comunicaciones', error);
      alert('Error enviando el mensaje.');
    }
  };

  const previewBody = cuerpo
    .replace('{{nombre}}', 'Juan')
    .replace('{{apellido}}', 'Pérez');

  return (
    <div className="bg-gray-900/95 backdrop-blur-md p-6 rounded-xl shadow-xl w-full max-w-2xl mx-auto border border-white/10">
      <h2 className="text-2xl font-serif text-white/90 mb-4">Contactar Alumnos ({alumnoIds.length} destinatarios)</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-white/90 mb-1">Asunto</label>
        <input
          type="text"
          value={asunto}
          onChange={e => setAsunto(e.target.value)}
          placeholder="Aviso importante sobre tu desempeño..."
          className="w-full bg-black/20 border-white/10 rounded-md text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 placeholder:text-white/30"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Cuerpo del mensaje</label>
          <p className="text-xs text-white/50 mb-2">Puedes usar variables como {'{{nombre}}'} o {'{{apellido}}'}</p>
          <textarea
            rows={8}
            value={cuerpo}
            onChange={e => setCuerpo(e.target.value)}
            className="w-full bg-black/20 border-white/10 rounded-md text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 placeholder:text-white/30"
            placeholder="Hola {{nombre}}, notamos que tienes actividades atrasadas..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-1">Vista Previa (Ejemplo)</label>
          <div className="bg-black/20 border border-white/10 rounded-md p-3 text-sm text-white/80 min-h-[12rem] whitespace-pre-wrap">
            {previewBody || <span className="text-white/30 italic">Escribe para ver la vista previa...</span>}
          </div>
        </div>
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
          disabled={!asunto || !cuerpo || loteMutation.isPending}
          className="px-4 py-2 bg-red-600/90 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {loteMutation.isPending ? 'Enviando...' : 'Enviar Comunicaciones'}
        </button>
      </div>
    </div>
  );
};
