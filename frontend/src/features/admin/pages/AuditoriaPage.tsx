import { useState } from 'react';
import { useAuditoria } from '../hooks/useAuditoria';
import type { AuditLog } from '../types';

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
        <h1 className="text-3xl font-serif text-white/90">Panel de Auditoría (E-AUD)</h1>
        <p className="mt-1 text-sm text-white/70">Consulta del registro histórico inmutable de acciones del sistema.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md p-4 border border-white/10 rounded-xl shadow-sm space-y-4">
        <h3 className="text-sm font-medium text-white/90">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-white/70">Desde</label>
            <input 
              type="date" 
              name="desde" 
              value={filters.desde} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70">Hasta</label>
            <input 
              type="date" 
              name="hasta" 
              value={filters.hasta} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70">Acción</label>
            <input 
              type="text" 
              name="accion" 
              placeholder="Ej. LOGIN, CREATE_USER..."
              value={filters.accion} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70">ID Actor</label>
            <input 
              type="text" 
              name="actor_id" 
              value={filters.actor_id} 
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleClearFilters}
              className="w-full px-4 py-2 bg-white/5 text-white/70 text-sm rounded-md hover:bg-white/10 border border-white/10 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-white/10 rounded-xl bg-black/10 backdrop-blur-sm shadow-sm">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Fecha/Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Actor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Acción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Detalle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Contexto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {auditoriaQuery.isLoading ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-white/50">Cargando logs...</td></tr>
            ) : auditoriaQuery.data?.items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-4 text-center text-white/50">No se encontraron registros.</td></tr>
            ) : (
              auditoriaQuery.data?.items.map((log: AuditLog) => (
                <tr key={log.id} className="transition-colors hover:bg-white/5">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {new Date(log.fecha_hora).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                    {log.actor_id}
                    {log.impersonado_id && <span className="block text-xs text-red-400">Imp: {log.impersonado_id}</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-300">
                    {log.accion}
                  </td>
                  <td className="px-6 py-4 text-sm text-white/70 font-mono text-xs max-w-xs truncate" title={JSON.stringify(log.detalle)}>
                    {JSON.stringify(log.detalle)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {log.ip && <span className="block text-xs">IP: {log.ip}</span>}
                    {log.materia_id && <span className="block text-xs">Mat: {log.materia_id}</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        
        {auditoriaQuery.data && (
          <div className="bg-white/5 backdrop-blur-md px-4 py-3 border-t border-white/10 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/70">
                  Mostrando <span className="font-medium">{(page - 1) * size + 1}</span> a <span className="font-medium">{Math.min(page * size, auditoriaQuery.data.total)}</span> de <span className="font-medium">{auditoriaQuery.data.total}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-white/10 bg-white/5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page * size >= auditoriaQuery.data.total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-white/10 bg-white/5 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors disabled:opacity-50"
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
