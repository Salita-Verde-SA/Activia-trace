import React from 'react';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import type { AuditoriaFiltro } from '../types';

interface AuditoriaFiltrosProps {
  filtros: AuditoriaFiltro;
  onFiltroChange: (filtros: AuditoriaFiltro) => void;
  onClear: () => void;
}

export const AuditoriaFiltros: React.FC<AuditoriaFiltrosProps> = ({ filtros, onFiltroChange, onClear }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onFiltroChange({ ...filtros, [name]: value });
  };

  return (
    <div className="bg-surface border border-white/5 rounded-3xl p-6 mb-8 backdrop-blur-xl">
      <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-4">Filtros</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <Input
          label="Desde"
          type="date"
          name="fecha_desde"
          value={filtros.fecha_desde || ''}
          onChange={handleChange}
        />
        <Input
          label="Hasta"
          type="date"
          name="fecha_hasta"
          value={filtros.fecha_hasta || ''}
          onChange={handleChange}
        />
        <Input
          label="Acción"
          type="text"
          name="accion"
          placeholder="Ej. LOGIN, CREATE_USER..."
          value={filtros.accion || ''}
          onChange={handleChange}
        />
        <Input
          label="ID Actor"
          type="text"
          name="actor_id"
          placeholder="UUID..."
          value={filtros.actor_id || ''}
          onChange={handleChange}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="secondary" onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </div>
  );
};
