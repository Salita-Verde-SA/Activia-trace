import { useState } from 'react';

import { useFacturas } from '../hooks/useFacturas';

export function FacturasAdminPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [mes, setMes] = useState(currentMonth);
  const [anio, setAnio] = useState(currentYear);

  const { facturasQuery, abonarFactura, descargarFactura } = useFacturas({
    periodo_anio: anio,
    periodo_mes: mes,
  });

  const facturas = facturasQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Gestión de Facturas</h1>
          <p className="mt-1 text-sm text-white/70">Revisión y marcado de facturas abonadas.</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={mes} 
            onChange={(e) => setMes(Number(e.target.value))}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m} className="bg-slate-900">Mes {m}</option>
            ))}
          </select>
          <select 
            value={anio} 
            onChange={(e) => setAnio(Number(e.target.value))}
            className="bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map(y => (
              <option key={y} value={y} className="bg-slate-900">{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm overflow-hidden">
        {facturasQuery.isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : facturas.length === 0 ? (
          <div className="p-8 text-center text-white/50">
            No hay facturas registradas en este período.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-black/20">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Fecha</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Usuario ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Monto</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Estado</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {facturas.map((factura) => (
                <tr key={factura.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">
                    {new Date(factura.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/70">
                    {factura.usuario_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white/90">
                    ${factura.monto.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      factura.estado === 'Abonada' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {factura.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2 flex items-center">
                    <button
                      onClick={() => descargarFactura.mutate({ id: factura.id, mes: factura.periodo_mes, anio: factura.periodo_anio })}
                      className="text-primary-400 hover:text-primary-300 font-medium"
                      title="Descargar PDF"
                    >
                      <span className="material-symbols-outlined text-xl">download</span>
                    </button>
                    {factura.estado === 'Pendiente' && (
                      <button
                        onClick={() => {
                          if (window.confirm('¿Seguro que quieres aprobar y marcar como abonada esta factura? Esta acción no se puede deshacer.')) {
                            abonarFactura.mutate(factura.id);
                          }
                        }}
                        disabled={abonarFactura.isPending}
                        className="text-green-400 hover:text-green-300 font-medium disabled:opacity-50 ml-2"
                        title="Marcar Abonada"
                      >
                        <span className="material-symbols-outlined text-xl">check_circle</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
