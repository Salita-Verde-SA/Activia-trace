import { useState } from 'react';
import { useFacturas } from '../../finanzas/hooks/useFacturas';
import { useAuth } from '@/features/auth/context/AuthContext';

export function FacturasDocentePage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const [mes, setMes] = useState(currentMonth);
  const [anio, setAnio] = useState(currentYear);
  const [monto, setMonto] = useState('');
  const [detalle, setDetalle] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const { facturasQuery, uploadFactura, descargarFactura } = useFacturas({
    periodo_anio: anio,
    periodo_mes: mes,
  });

  const { user } = useAuth();
  
  // Filtrar solo las del usuario actual
  const misFacturas = (facturasQuery.data || []).filter(f => f.usuario_id === user?.id);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !monto) return;

    const formData = new FormData();
    formData.append('periodo_mes', mes.toString());
    formData.append('periodo_anio', anio.toString());
    formData.append('monto', monto);
    if (detalle) formData.append('detalle', detalle);
    formData.append('file', file);

    uploadFactura.mutate(formData, {
      onSuccess: () => {
        setFile(null);
        setMonto('');
        setDetalle('');
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Mis Facturas</h1>
        <p className="mt-1 text-sm text-white/70">Sube tus facturas correspondientes a cada período.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-medium text-white/90 mb-4">Subir Factura</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Mes</label>
                <select 
                  value={mes} 
                  onChange={(e) => setMes(Number(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m} className="bg-slate-900">{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Año</label>
                <select 
                  value={anio} 
                  onChange={(e) => setAnio(Number(e.target.value))}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                >
                  {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                    <option key={y} value={y} className="bg-slate-900">{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Monto ($)</label>
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Detalle (Opcional)</label>
              <textarea
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                rows={2}
                className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Archivo PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-300 hover:file:bg-primary-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={!file || !monto || uploadFactura.isPending}
              className="w-full mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {uploadFactura.isPending ? 'Subiendo...' : 'Registrar Factura'}
            </button>
          </form>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/10 bg-black/20">
            <h2 className="text-lg font-medium text-white/90">Historial del Período</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {facturasQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : misFacturas.length === 0 ? (
              <div className="text-center text-white/50 py-8">
                No tienes facturas en este período.
              </div>
            ) : (
              <div className="space-y-3">
                {misFacturas.map((factura) => (
                  <div key={factura.id} className="bg-black/20 border border-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-white/90">${factura.monto.toLocaleString()}</div>
                      <div className="text-xs text-white/50">{new Date(factura.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-full ${
                        factura.estado === 'Abonada' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {factura.estado}
                      </span>
                      <button
                        onClick={() => descargarFactura.mutate({ id: factura.id, mes: factura.periodo_mes, anio: factura.periodo_anio })}
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                        title="Descargar PDF"
                      >
                        <span className="material-symbols-outlined text-sm">download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
