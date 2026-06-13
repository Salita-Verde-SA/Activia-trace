import React, { useState } from 'react';
import { useAvisos } from '../hooks/useAvisos';
import { useRoles } from '../hooks/useRoles';
import { AlcanceAviso, SeveridadAviso } from '../types';

interface AvisosFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
}

export const AvisosForm: React.FC<AvisosFormProps> = ({ onSuccess, onCancel }) => {
  const { crearAviso } = useAvisos();
  const { data: roles } = useRoles();
  const [titulo, setTitulo] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [severidad, setSeveridad] = useState<SeveridadAviso>(SeveridadAviso.INFO);
  const [alcanceOption, setAlcanceOption] = useState<string>(AlcanceAviso.GLOBAL);
  const [requiereAck, setRequiereAck] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let alcanceFinal = alcanceOption as AlcanceAviso;
    let rolIdFinal = undefined;
    
    if (alcanceOption.startsWith('ROL:')) {
      alcanceFinal = AlcanceAviso.ROL || 'ROL' as AlcanceAviso;
      rolIdFinal = alcanceOption.split(':')[1];
    }

    try {
      await crearAviso.mutateAsync({
        titulo,
        cuerpo,
        severidad,
        alcance: alcanceFinal,
        rol_id: rolIdFinal,
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
    <form onSubmit={handleSubmit} className="bg-black/20 backdrop-blur-md p-6 rounded-xl shadow-sm border border-white/10">
      <h3 className="text-2xl font-serif text-white/90 mb-6">Nuevo Aviso Institucional</h3>
      
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Título</label>
          <input
            type="text"
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full rounded-md border-white/10 bg-white/5 text-white/90 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Cuerpo</label>
          <textarea
            required
            rows={4}
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            className="w-full rounded-md border-white/10 bg-white/5 text-white/90 px-3 py-2 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Alcance</label>
            <select
              value={alcanceOption}
              onChange={(e) => setAlcanceOption(e.target.value)}
              className="w-full rounded-md border-white/10 bg-white/5 text-white/90 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 [&>option]:bg-neutral-900 [&>option]:text-white"
            >
              <option value={AlcanceAviso.GLOBAL}>Global</option>
              {roles?.map((rol) => (
                <option key={rol.id} value={`ROL:${rol.id}`}>
                  Rol: {rol.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Severidad</label>
            <select
              value={severidad}
              onChange={(e) => setSeveridad(e.target.value as SeveridadAviso)}
              className="w-full rounded-md border-white/10 bg-white/5 text-white/90 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 [&>option]:bg-neutral-900 [&>option]:text-white"
            >
              <option value={SeveridadAviso.INFO}>Informativo</option>
              <option value={SeveridadAviso.WARNING}>Advertencia</option>
              <option value={SeveridadAviso.URGENT}>Urgente</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Fecha Inicio</label>
            <input
              type="date"
              required
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full rounded-md border-white/10 bg-white/5 text-white/90 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Fecha Fin (Opcional)</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full rounded-md border-white/10 bg-white/5 text-white/90 px-3 py-2 focus:border-primary-500 focus:ring-primary-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
            />
          </div>
        </div>

        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            id="requiereAck"
            checked={requiereAck}
            onChange={(e) => setRequiereAck(e.target.checked)}
            className="h-4 w-4 bg-black/20 text-primary-500 focus:ring-primary-500 border-white/10 rounded"
          />
          <label htmlFor="requiereAck" className="ml-2 block text-sm text-white/90">
            Requerir confirmación de lectura (Ack)
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-white/10 bg-white/5 rounded-md text-white/70 hover:bg-white/10 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={crearAviso.isPending}
          className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] text-white rounded-md hover:bg-primary-600 disabled:bg-primary-600/30 disabled:border-transparent disabled:shadow-none transition-colors"
        >
          {crearAviso.isPending ? 'Publicando...' : 'Publicar Aviso'}
        </button>
      </div>
    </form>
  );
};
