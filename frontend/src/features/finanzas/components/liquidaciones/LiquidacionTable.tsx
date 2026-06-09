import type { Liquidacion } from '../../types';

export function LiquidacionTable({ 
  liquidaciones, 
  isLoading 
}: { 
  liquidaciones: Liquidacion[], 
  isLoading: boolean 
}) {
  if (isLoading) return <div className="p-4 text-center text-white/50">Cargando liquidaciones...</div>;

  return (
    <div className="overflow-x-auto border-t border-white/10 bg-black/10 backdrop-blur-sm">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-white/5">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Usuario ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Período</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Base</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Plus</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-white/50 uppercase tracking-wider">Total</th>
            <th className="px-6 py-3 text-center text-xs font-medium text-white/50 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {liquidaciones.map(liq => (
            <tr key={liq.id} className={`transition-colors ${liq.excluido_por_factura ? "bg-red-900/20 opacity-75" : "hover:bg-white/5"}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/90">
                {liq.usuario_id}
                {liq.es_nexo && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">NEXO</span>}
                {liq.excluido_por_factura && <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded bg-red-500/20 text-red-400 border border-red-500/30">Factura</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">{liq.periodo_mes}/{liq.periodo_anio}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white/70">${liq.monto_base.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-white/70">${liq.monto_plus.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-primary-300">${liq.monto_total.toLocaleString()}</td>
              <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded border ${liq.estado === 'CERRADA' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                  {liq.estado}
                </span>
              </td>
            </tr>
          ))}
          {liquidaciones.length === 0 && (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-white/50">No hay liquidaciones en esta vista.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
