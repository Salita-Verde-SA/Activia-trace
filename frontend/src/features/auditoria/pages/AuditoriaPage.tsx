import React, { useState, useEffect, useCallback } from 'react';
import { AuditoriaFiltros } from '../components/AuditoriaFiltros';
import { AuditoriaTable } from '../components/AuditoriaTable';
import type { AuditoriaFiltro, AuditoriaRegistro } from '../types';
import { auditoriaService } from '../services/auditoriaService';
import { Button } from '@/shared/components/ui/Button';

export const AuditoriaPage: React.FC = () => {
  const [filtros, setFiltros] = useState<AuditoriaFiltro>({ limit: 50, offset: 0 });
  const [registros, setRegistros] = useState<AuditoriaRegistro[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await auditoriaService.explorarLogs(filtros);
      setRegistros(resp.items);
      setTotal(resp.total);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los registros de auditoría');
    } finally {
      setIsLoading(false);
    }
  }, [filtros]);

  useEffect(() => {
    // Debounce simple para los filtros, o cargar cuando cambien limit/offset
    const timer = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const handleFiltroChange = (nuevosFiltros: AuditoriaFiltro) => {
    setFiltros({ ...nuevosFiltros, offset: 0 }); // Reset page on filter change
  };

  const handleClear = () => {
    setFiltros({ limit: 50, offset: 0 });
  };

  const handleNextPage = () => {
    setFiltros((prev) => ({ ...prev, offset: (prev.offset || 0) + (prev.limit || 50) }));
  };

  const handlePrevPage = () => {
    setFiltros((prev) => ({ ...prev, offset: Math.max(0, (prev.offset || 0) - (prev.limit || 50)) }));
  };

  return (
    <div className="min-h-screen bg-noir p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-serif text-alabaster font-light tracking-wide mb-2">
            Panel de Auditoría (E-AUD)
          </h1>
          <p className="text-on-surface-variant text-sm font-light">
            Consulta del registro histórico inmutable de acciones del sistema.
          </p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-4 mb-8">
            <p className="text-red-400 text-sm font-body-sm">{error}</p>
          </div>
        )}

        <AuditoriaFiltros
          filtros={filtros}
          onFiltroChange={handleFiltroChange}
          onClear={handleClear}
        />

        <div className="mb-4 flex justify-between items-center px-2">
          <p className="text-sm text-on-surface-variant">
            Mostrando {registros.length} registros de {total} en total
          </p>
        </div>

        <AuditoriaTable
          registros={registros}
          isLoading={isLoading}
        />

        <div className="mt-8 flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={handlePrevPage} 
            disabled={!filtros.offset || filtros.offset === 0 || isLoading}
          >
            Anterior
          </Button>
          <Button 
            variant="outline" 
            onClick={handleNextPage} 
            disabled={((filtros.offset || 0) + (filtros.limit || 50)) >= total || isLoading}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};
