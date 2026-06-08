import React, { useState } from 'react';
import { useEquipos } from '../hooks/useEquipos';

interface CloneAsignacionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: string;
}

export const CloneAsignacionesModal: React.FC<CloneAsignacionesModalProps> = ({
  isOpen,
  onClose,
  materiaId,
}) => {
  const { clonar } = useEquipos();
  const [cohorteOrigen, setCohorteOrigen] = useState('');
  const [cohorteDestino, setCohorteDestino] = useState('');
  const [nuevoDesde, setNuevoDesde] = useState('');

  if (!isOpen) return null;

  const handleClonar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cohorteOrigen || !cohorteDestino || !nuevoDesde) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    try {
      await clonar.mutateAsync({
        materia_id: materiaId,
        cohorte_id_origen: cohorteOrigen,
        cohorte_id_destino: cohorteDestino,
        nuevo_desde: new Date(nuevoDesde).toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error al clonar', error);
      alert('Hubo un error al clonar el equipo');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Clonar Equipo Docente</h3>
        <form onSubmit={handleClonar}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cohorte de Origen (ID)
            </label>
            <input
              type="text"
              value={cohorteOrigen}
              onChange={(e) => setCohorteOrigen(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="UUID cohorte previa"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cohorte de Destino (ID)
            </label>
            <input
              type="text"
              value={cohorteDestino}
              onChange={(e) => setCohorteDestino(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="UUID cohorte nueva"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nueva Fecha de Inicio
            </label>
            <input
              type="date"
              value={nuevoDesde}
              onChange={(e) => setNuevoDesde(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
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
              disabled={clonar.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {clonar.isPending ? 'Clonando...' : 'Clonar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
