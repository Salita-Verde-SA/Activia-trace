import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useListarLotes, useAprobarLote, useCancelarLote } from '../hooks/useComunicaciones';
import { previewLote } from '../services/comunicacionesApi';
import type { ComunicacionResponse, EstadoComunicacion, LoteResumen } from '../types';

const ESTADO_BADGE: Record<EstadoComunicacion, string> = {
  Pendiente: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  Enviando: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  Enviado: 'bg-green-500/20 text-green-300 border border-green-500/30',
  Error: 'bg-red-500/20 text-red-300 border border-red-500/30',
  Cancelado: 'bg-white/10 text-white/50 border border-white/10',
};

function PreviewModal({
  lote,
  onClose,
}: {
  lote: LoteResumen;
  onClose: () => void;
}) {
  const previewQuery = useQuery<ComunicacionResponse[]>({
    queryKey: ['comunicaciones', 'preview', lote.lote_id],
    queryFn: () => previewLote(lote.lote_id),
  });

  const items = previewQuery.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-semibold text-white">Preview de lote</h2>
            <p className="text-xs text-white/50 mt-0.5 font-mono">{lote.lote_id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-lg leading-none px-2"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {previewQuery.isLoading && (
            <p className="text-white/50 text-sm text-center py-8">Cargando...</p>
          )}
          {!previewQuery.isLoading && items.length === 0 && (
            <p className="text-white/50 text-sm text-center py-8">Sin mensajes pendientes en este lote.</p>
          )}
          {items.slice(0, 20).map((c) => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
              <div className="text-xs text-white/50">Para: <span className="text-white/80">{c.destinatario}</span></div>
              <div className="text-sm font-medium text-white">{c.asunto}</div>
              <div className="text-xs text-white/60 line-clamp-2">{c.cuerpo}</div>
            </div>
          ))}
          {items.length > 20 && (
            <p className="text-center text-xs text-white/40 pt-2">
              Mostrando 20 de {lote.total} mensajes
            </p>
          )}
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmClass,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="text-sm text-white/60">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ComunicacionesAdminPage() {
  const [soloPendientes, setSoloPendientes] = useState(true);
  const [previewLoteItem, setPreviewLoteItem] = useState<LoteResumen | null>(null);
  const [confirmAprobar, setConfirmAprobar] = useState<LoteResumen | null>(null);
  const [confirmCancelar, setConfirmCancelar] = useState<LoteResumen | null>(null);

  const { data: lotes = [], isLoading } = useListarLotes(soloPendientes);
  const aprobar = useAprobarLote();
  const cancelar = useCancelarLote();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Comunicaciones</h1>
        <p className="mt-1 text-sm text-white/70">Revisá y aprobá los lotes de mensajes enviados por docentes.</p>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        <button
          onClick={() => setSoloPendientes(true)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            soloPendientes
              ? 'bg-white/15 text-white'
              : 'bg-white/5 text-white/50 hover:bg-white/10'
          }`}
        >
          Pendientes
        </button>
        <button
          onClick={() => setSoloPendientes(false)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            !soloPendientes
              ? 'bg-white/15 text-white'
              : 'bg-white/5 text-white/50 hover:bg-white/10'
          }`}
        >
          Todos
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-white/50 text-sm text-center py-12">Cargando...</p>
        ) : lotes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/40 text-sm">
              {soloPendientes ? 'No hay lotes pendientes de aprobación.' : 'No hay lotes registrados.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-white/50 font-medium">Lote ID</th>
                <th className="px-4 py-3 text-white/50 font-medium">Mensajes</th>
                <th className="px-4 py-3 text-white/50 font-medium">Estado</th>
                <th className="px-4 py-3 text-white/50 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lotes.map((lote) => (
                <tr key={lote.lote_id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-white/60 text-xs">
                    {lote.lote_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-white/80">{lote.total}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[lote.estado]}`}>
                      {lote.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setPreviewLoteItem(lote)}
                        className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20 text-white/70 transition-colors"
                      >
                        Ver preview
                      </button>
                      {lote.estado === 'Pendiente' && (
                        <>
                          <button
                            onClick={() => setConfirmAprobar(lote)}
                            className="px-3 py-1 text-xs rounded-lg bg-green-600/80 hover:bg-green-600 text-white transition-colors"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => setConfirmCancelar(lote)}
                            className="px-3 py-1 text-xs rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modales */}
      {previewLoteItem && (
        <PreviewModal lote={previewLoteItem} onClose={() => setPreviewLoteItem(null)} />
      )}

      {confirmAprobar && (
        <ConfirmModal
          title="Aprobar lote"
          message={`¿Aprobás el envío de ${confirmAprobar.total} mensajes? El worker los procesará inmediatamente.`}
          confirmLabel="Aprobar"
          confirmClass="bg-green-600 hover:bg-green-700"
          onConfirm={() => {
            aprobar.mutate(confirmAprobar.lote_id);
            setConfirmAprobar(null);
          }}
          onClose={() => setConfirmAprobar(null)}
        />
      )}

      {confirmCancelar && (
        <ConfirmModal
          title="Cancelar lote"
          message={`¿Cancelás el lote de ${confirmCancelar.total} mensajes? Esta acción no se puede deshacer.`}
          confirmLabel="Cancelar lote"
          confirmClass="bg-red-600 hover:bg-red-700"
          onConfirm={() => {
            cancelar.mutate(confirmCancelar.lote_id);
            setConfirmCancelar(null);
          }}
          onClose={() => setConfirmCancelar(null)}
        />
      )}
    </div>
  );
}
