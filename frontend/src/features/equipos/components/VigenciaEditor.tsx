import React, { useState } from 'react';
import { useEquipos } from '../hooks/useEquipos';

interface VigenciaEditorProps {
  isOpen: boolean;
  onClose: () => void;
  asignacionIds: string[];
}

export const VigenciaEditor: React.FC<VigenciaEditorProps> = ({
  isOpen,
  onClose,
  asignacionIds,
}) => {
  const { actualizarVigencia } = useEquipos();
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  if (!isOpen) return null;

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desde) {
      alert('La fecha de inicio es obligatoria');
      return;
    }

    try {
      await actualizarVigencia.mutateAsync({
        asignacion_ids: asignacionIds,
        nuevo_desde: new Date(desde).toISOString(),
        nuevo_hasta: hasta ? new Date(hasta).toISOString() : undefined,
      });
      onClose();
    } catch (error) {
      console.error('Error al actualizar vigencia', error);
      alert('Hubo un error al actualizar la vigencia');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-xl font-bold text-white/90 mb-2">Editar Vigencia</h3>
        <p className="text-sm text-white/50 mb-4">
          Modificando {asignacionIds.length} asignaciones.
        </p>
        <form onSubmit={handleGuardar}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Vigente Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Vigente Hasta (Opcional)
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 focus:border-primary-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 bg-white/5 text-white/70 rounded-md hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actualizarVigencia.isPending}
              className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {actualizarVigencia.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
