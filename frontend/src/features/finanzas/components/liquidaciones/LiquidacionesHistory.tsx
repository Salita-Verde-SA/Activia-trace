import { useState } from 'react';
import { useLiquidaciones } from '../../hooks/useLiquidaciones';
import { LiquidacionTable } from './LiquidacionTable';

export function LiquidacionesHistory() {
  const [filters, setFilters] = useState({
    periodo_anio: new Date().getFullYear(),
    periodo_mes: new Date().getMonth(), // Previous month as default
  });

  const { liquidacionesQuery } = useLiquidaciones({ 
    periodo_anio: filters.periodo_anio, 
    periodo_mes: filters.periodo_mes,
    estado: 'CERRADA' 
  });

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 border rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Buscar en Historial</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Año</label>
            <input 
              type="number" 
              value={filters.periodo_anio} 
              onChange={e => setFilters({...filters, periodo_anio: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mes</label>
            <select 
              value={filters.periodo_mes} 
              onChange={e => setFilters({...filters, periodo_mes: parseInt(e.target.value)})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('es', { month: 'long' })}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <LiquidacionTable 
        liquidaciones={liquidacionesQuery.data || []} 
        isLoading={liquidacionesQuery.isLoading} 
      />
    </div>
  );
}
