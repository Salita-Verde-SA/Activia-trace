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
    // Para simplificar, generamos una comunicacion idéntica para todos los seleccionados
    // En el futuro, el backend expandiría las variables. Por ahora enviamos a todos.
    const comunicaciones: ComunicacionCreate[] = alumnoIds.map(id => ({
      destinatario: id, // Usamos el ID como destinatario simulado (o un email lookup)
      asunto,
      cuerpo,
    }));

    try {
      const result = await loteMutation.mutateAsync(comunicaciones);
      onSuccess(result.lote_id);
    } catch (error) {
      console.error('Error enviando comunicaciones', error);
      alert('Error enviando el mensaje.');
    }
  };

  const previewBody = cuerpo
    .replace('{{nombre}}', 'Juan')
    .replace('{{apellido}}', 'Pérez');

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto border">
      <h2 className="text-2xl font-bold mb-4">Contactar Alumnos ({alumnoIds.length} destinatarios)</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Asunto</label>
        <input 
          type="text" 
          value={asunto}
          onChange={e => setAsunto(e.target.value)}
          placeholder="Aviso importante sobre tu desempeño..."
          className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo del mensaje</label>
          <p className="text-xs text-gray-500 mb-2">Puedes usar variables como {'{{nombre}}'} o {'{{apellido}}'}</p>
          <textarea 
            rows={8}
            value={cuerpo}
            onChange={e => setCuerpo(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Hola {{nombre}}, notamos que tienes actividades atrasadas..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vista Previa (Ejemplo)</label>
          <div className="bg-gray-50 border rounded-md p-3 text-sm min-h-[12rem] whitespace-pre-wrap">
            {previewBody || <span className="text-gray-400 italic">Escribe para ver la vista previa...</span>}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button 
          onClick={onCancel}
          className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button 
          onClick={handleSend}
          disabled={!asunto || !cuerpo || loteMutation.isPending}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loteMutation.isPending ? 'Enviando...' : 'Enviar Comunicaciones'}
        </button>
      </div>
    </div>
  );
};
