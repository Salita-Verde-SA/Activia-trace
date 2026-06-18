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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold text-white/90 mb-4">Clonar Equipo Docente</h3>
        <form onSubmit={handleClonar}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Cohorte de Origen (ID)
            </label>
            <input
              type="text"
              value={cohorteOrigen}
              onChange={(e) => setCohorteOrigen(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 focus:border-primary-500 focus:outline-none"
              placeholder="UUID cohorte previa"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Cohorte de Destino (ID)
            </label>
            <input
              type="text"
              value={cohorteDestino}
              onChange={(e) => setCohorteDestino(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 focus:border-primary-500 focus:outline-none"
              placeholder="UUID cohorte nueva"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/70 mb-1">
              Nueva Fecha de Inicio
            </label>
            <input
              type="date"
              value={nuevoDesde}
              onChange={(e) => setNuevoDesde(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 focus:border-primary-500 focus:outline-none"
              required
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
              disabled={clonar.isPending}
              className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {clonar.isPending ? 'Clonando...' : 'Clonar Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
