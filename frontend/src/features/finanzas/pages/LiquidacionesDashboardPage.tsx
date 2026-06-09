import { useState } from 'react';
import { useLiquidaciones } from '../hooks/useLiquidaciones';
import { LiquidacionTable } from '../components/liquidaciones/LiquidacionTable';
import { CloseLiquidacionAction } from '../components/liquidaciones/CloseLiquidacionAction';
import { LiquidacionesHistory } from '../components/liquidaciones/LiquidacionesHistory';

export function LiquidacionesDashboardPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  const [activeTab, setActiveTab] = useState<'actual' | 'history'>('actual');
  const [segment, setSegment] = useState<'general' | 'nexo' | 'factura'>('general');

  const { liquidacionesQuery } = useLiquidaciones({ 
    periodo_anio: currentYear, 
    periodo_mes: currentMonth,
    estado: 'ABIERTA'
  });

  const liquidaciones = liquidacionesQuery.data || [];
  
  const filteredLiquidaciones = liquidaciones.filter(liq => {
    if (segment === 'general') return !liq.es_nexo;
    if (segment === 'nexo') return liq.es_nexo;
    if (segment === 'factura') return liq.excluido_por_factura;
    return true;
  });

  const totalBase = liquidaciones.reduce((sum, liq) => sum + liq.monto_base, 0);
  const totalPlus = liquidaciones.reduce((sum, liq) => sum + liq.monto_plus, 0);
  const totalGeneral = totalBase + totalPlus;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Dashboard de Liquidaciones</h1>
          <p className="mt-1 text-sm text-white/70">Gestión de liquidaciones del período actual y consulta histórica.</p>
        </div>
        {activeTab === 'actual' && (
          <CloseLiquidacionAction periodoAnio={currentYear} periodoMes={currentMonth} />
        )}
      </div>

      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('actual')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'actual'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            Período Actual ({currentMonth}/{currentYear})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'history'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            Historial de Liquidaciones
          </button>
        </nav>
      </div>

      {activeTab === 'actual' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-md p-4 border border-white/10 rounded-xl shadow-sm">
              <h4 className="text-sm font-medium text-white/50 uppercase">Total Liquidación Base</h4>
              <p className="mt-2 text-2xl font-bold text-white/90">${totalBase.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md p-4 border border-white/10 rounded-xl shadow-sm">
              <h4 className="text-sm font-medium text-white/50 uppercase">Total Liquidación Plus</h4>
              <p className="mt-2 text-2xl font-bold text-white/90">${totalPlus.toLocaleString()}</p>
            </div>
            <div className="bg-primary-500/10 backdrop-blur-md p-4 border border-primary-500/30 rounded-xl shadow-sm">
              <h4 className="text-sm font-medium text-primary-300 uppercase">Total Período</h4>
              <p className="mt-2 text-2xl font-bold text-primary-100">${totalGeneral.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm overflow-hidden">
            <div className="border-b border-white/10 bg-black/20 px-4 py-3 flex space-x-4">
              <button 
                onClick={() => setSegment('general')}
                className={`px-3 py-1 rounded border transition-colors text-sm font-medium ${segment === 'general' ? 'bg-primary-500/20 text-primary-300 border-primary-500/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border-transparent'}`}
              >
                General
              </button>
              <button 
                onClick={() => setSegment('nexo')}
                className={`px-3 py-1 rounded border transition-colors text-sm font-medium ${segment === 'nexo' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border-transparent'}`}
              >
                NEXO
              </button>
              <button 
                onClick={() => setSegment('factura')}
                className={`px-3 py-1 rounded border transition-colors text-sm font-medium ${segment === 'factura' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-white/70 hover:bg-white/10 border-transparent'}`}
              >
                Excluidos por Factura
              </button>
            </div>
            <div className="p-0">
              <LiquidacionTable 
                liquidaciones={filteredLiquidaciones} 
                isLoading={liquidacionesQuery.isLoading} 
              />
            </div>
          </div>
        </div>
      ) : (
        <LiquidacionesHistory />
      )}
    </div>
  );
}
