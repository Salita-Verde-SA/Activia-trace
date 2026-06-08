import type { Liquidacion } from '../../types';

export function LiquidacionTable({ 
  liquidaciones, 
  isLoading 
}: { 
  liquidaciones: Liquidacion[], 
  isLoading: boolean 
}) {
  if (isLoading) return <div className="p-4 text-center text-gray-500">Cargando liquidaciones...</div>;

  return (
    <div className="overflow-x-auto border rounded-lg shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Base</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Plus</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {liquidaciones.map(liq => (
            <tr key={liq.id} className={liq.excluido_por_factura ? "bg-red-50 opacity-75" : "hover:bg-gray-50"}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {liq.usuario_id}
                {liq.es_nexo && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">NEXO</span>}
                {liq.excluido_por_factura && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Factura</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{liq.periodo_mes}/{liq.periodo_anio}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">${liq.monto_base.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">${liq.monto_plus.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">${liq.monto_total.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${liq.estado === 'CERRADA' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {liq.estado}
                </span>
              </td>
            </tr>
          ))}
          {liquidaciones.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay liquidaciones en esta vista.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
