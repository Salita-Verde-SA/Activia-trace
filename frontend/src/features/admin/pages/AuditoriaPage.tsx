import { useState } from 'react';
import { useAuditoria } from '../../hooks/useAuditoria';
import { AuditLog } from '../../types';

export function AuditoriaPage() {
  const [filters, setFilters] = useState({
    desde: '',
    hasta: '',
    accion: '',
    actor_id: '',
    materia_id: '',
  });
  
  const [page, setPage] = useState(1);
  const size = 50;

  const { auditoriaQuery } = useAuditoria({ ...filters, page, size });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilters = () => {
    setFilters({ desde: '', hasta: '', accion: '', actor_id: '', materia_id: '' });
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Panel de Auditoría (E-AUD)</h1>
        <p className="mt-1 text-sm text-gray-500">Consulta del registro histórico inmutable de acciones del sistema.</p>
      </div>

      <div className="bg-white p-4 border rounded-lg shadow-sm space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700">Desde</label>
            <input 
              type="date" 
              name="desde" 
              value={filters.desde} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Hasta</label>
            <input 
              type="date" 
              name="hasta" 
              value={filters.hasta} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">Acción</label>
            <input 
              type="text" 
              name="accion" 
              placeholder="Ej. LOGIN, CREATE_USER..."
              value={filters.accion} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700">ID Actor</label>
            <input 
              type="text" 
              name="actor_id" 
              value={filters.actor_id} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 border border-gray-300"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contexto</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {auditoriaQuery.isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Cargando logs...</td></tr>
            ) : auditoriaQuery.data?.items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No se encontraron registros.</td></tr>
            ) : (
              auditoriaQuery.data?.items.map((log: AuditLog) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.fecha_hora).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.actor_id}
                    {log.impersonado_id && <span className="block text-xs text-red-500">Imp: {log.impersonado_id}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {log.accion}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs max-w-xs truncate" title={JSON.stringify(log.detalle)}>
                    {JSON.stringify(log.detalle)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip && <span className="block text-xs">IP: {log.ip}</span>}
                    {log.materia_id && <span className="block text-xs">Mat: {log.materia_id}</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {auditoriaQuery.data && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(page - 1) * size + 1}</span> a <span className="font-medium">{Math.min(page * size, auditoriaQuery.data.total)}</span> de <span className="font-medium">{auditoriaQuery.data.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * size >= auditoriaQuery.data.total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
