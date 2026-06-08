import { useState } from 'react';
import { useLiquidaciones } from '../../hooks/useLiquidaciones';
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
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard de Liquidaciones</h1>
          <p className="mt-1 text-sm text-gray-500">Gestión de liquidaciones del período actual y consulta histórica.</p>
        </div>
        {activeTab === 'actual' && (
          <CloseLiquidacionAction periodoAnio={currentYear} periodoMes={currentMonth} />
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('actual')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'actual'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Período Actual ({currentMonth}/{currentYear})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Historial de Liquidaciones
          </button>
        </nav>
      </div>

      {activeTab === 'actual' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 border rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Total Liquidación Base</h4>
              <p className="mt-2 text-2xl font-bold text-gray-900">${totalBase.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 border rounded-lg shadow-sm">
              <h4 className="text-sm font-medium text-gray-500 uppercase">Total Liquidación Plus</h4>
              <p className="mt-2 text-2xl font-bold text-gray-900">${totalPlus.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 border rounded-lg shadow-sm border-blue-200 bg-blue-50">
              <h4 className="text-sm font-medium text-blue-800 uppercase">Total Período</h4>
              <p className="mt-2 text-2xl font-bold text-blue-900">${totalGeneral.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex space-x-4">
              <button 
                onClick={() => setSegment('general')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${segment === 'general' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                General
              </button>
              <button 
                onClick={() => setSegment('nexo')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${segment === 'nexo' ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                NEXO
              </button>
              <button 
                onClick={() => setSegment('factura')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${segment === 'factura' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
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
