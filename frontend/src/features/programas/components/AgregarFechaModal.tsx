import React, { useState } from 'react';
import { useFechas } from '../hooks/useFechas';
import { TipoFechaAcademica } from '../types';

interface Cohorte {
  id: string;
  nombre: string;
  anio: number;
}

interface AgregarFechaModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: string;
  cohortes: Cohorte[];
}

export const AgregarFechaModal: React.FC<AgregarFechaModalProps> = ({
  isOpen,
  onClose,
  materiaId,
  cohortes
}) => {
  const { createFecha } = useFechas(materiaId);
  const [tipo, setTipo] = useState<TipoFechaAcademica>(TipoFechaAcademica.PARCIAL);
  const [fecha, setFecha] = useState('');
  const [cohorteId, setCohorteId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fecha) {
      setError('La fecha es obligatoria');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await createFecha({
        materia_id: materiaId,
        tipo,
        fecha,
        cohorte_id: cohorteId || undefined,
        titulo: titulo || undefined,
      });

      onClose();
      // Reset form
      setTipo(TipoFechaAcademica.PARCIAL);
      setFecha('');
      setCohorteId('');
      setTitulo('');
    } catch (err: any) {
      setError(err.message || 'Error al agregar la fecha');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">event_available</span>
            Agregar Fecha
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de Evaluación *</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoFechaAcademica)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
              required
            >
              {Object.values(TipoFechaAcademica).map(t => (
                <option key={t} value={t} className="bg-[#1a1a24]">{t}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Título (Opcional)</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: 1er Parcial"
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cohorte (Opcional)</label>
            <select
              value={cohorteId}
              onChange={(e) => setCohorteId(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="" className="bg-[#1a1a24]">-- Para todas las cohortes --</option>
              {cohortes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1a1a24]">{c.nombre} ({c.anio})</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Fecha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
