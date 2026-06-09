import React, { useState } from 'react';
import { useAvisos } from '../hooks/useAvisos';
import { AlcanceAviso, SeveridadAviso } from '../types';

interface AvisosFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export const AvisosForm: React.FC<AvisosFormProps> = ({ onSuccess, onCancel }) => {
  const { crearAviso } = useAvisos();
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [severidad, setSeveridad] = useState<SeveridadAviso>(SeveridadAviso.INFO);
  const [alcance, setAlcance] = useState<AlcanceAviso>(AlcanceAviso.GLOBAL);
  const [requiereAck, setRequiereAck] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await crearAviso.mutateAsync({
        titulo,
        cuerpo,
        severidad,
        alcance,
        requiere_ack: requiereAck,
        fecha_inicio: new Date(fechaInicio).toISOString(),
        fecha_fin: fechaFin ? new Date(fechaFin).toISOString() : undefined,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error al crear aviso', error);
      alert('Error al crear el aviso');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Nuevo Aviso Institucional</h3>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo</label>
          <textarea
            required
            rows={4}
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alcance</label>
            <select
              value={alcance}
              onChange={(e) => setAlcance(e.target.value as AlcanceAviso)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value={AlcanceAviso.GLOBAL}>Global</option>
              <option value={AlcanceAviso.ALUMNOS}>Solo Alumnos</option>
              <option value={AlcanceAviso.DOCENTES}>Solo Docentes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severidad</label>
            <select
              value={severidad}
              onChange={(e) => setSeveridad(e.target.value as SeveridadAviso)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value={SeveridadAviso.INFO}>Informativo</option>
              <option value={SeveridadAviso.WARNING}>Advertencia</option>
              <option value={SeveridadAviso.URGENT}>Urgente</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              required
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin (Opcional)</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="requiereAck"
            checked={requiereAck}
            onChange={(e) => setRequiereAck(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="requiereAck" className="ml-2 block text-sm text-gray-900">
            Requerir confirmación de lectura (Ack)
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={crearAviso.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {crearAviso.isPending ? 'Publicando...' : 'Publicar Aviso'}
        </button>
      </div>
    </form>
  );
};
