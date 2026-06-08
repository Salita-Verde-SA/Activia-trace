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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4">Editar Vigencia</h3>
        <p className="text-sm text-gray-600 mb-4">
          Modificando {asignacionIds.length} asignaciones.
        </p>
        <form onSubmit={handleGuardar}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigente Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vigente Hasta (Opcional)
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actualizarVigencia.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {actualizarVigencia.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
