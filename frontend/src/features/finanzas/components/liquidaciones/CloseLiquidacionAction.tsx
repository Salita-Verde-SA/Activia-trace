import { useState } from 'react';
import { useLiquidaciones } from '../../hooks/useLiquidaciones';

export function CloseLiquidacionAction({ periodoAnio, periodoMes }: { periodoAnio: number, periodoMes: number }) {
  const [showModal, setShowModal] = useState(false);
  const { cerrarLiquidacion } = useLiquidaciones();

  const handleClose = () => {
    // In a real scenario, this might call an API endpoint that closes ALL open liquidaciones for the period
    // For this prototype, we'll simulate it by showing a notification
    alert(`Se ha solicitado el cierre del período ${periodoMes}/${periodoAnio}.`);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-3 bg-pale-rose/10 border border-pale-rose/30 text-pale-rose rounded-xl hover:bg-pale-rose/20 hover:border-pale-rose/50 transition-all text-label-caps font-label-caps uppercase tracking-widest shadow-[0_0_10px_rgba(224,142,121,0.1)]"
      >
        Cerrar Período {periodoMes}/{periodoAnio}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-charcoal rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 p-8 w-full max-w-md">
            <h3 className="text-title-lg font-display-lg text-alabaster uppercase tracking-widest drop-shadow-[0_2px_15px_rgba(255,255,255,0.2)] mb-4">Confirmar Cierre</h3>
            <p className="text-body-main font-body-main text-on-surface-variant tracking-wide mb-6">
              ¿Está seguro que desea cerrar la liquidación del período <strong className="text-alabaster">{periodoMes}/{periodoAnio}</strong>?
            </p>
            <div className="bg-muted-gold/10 border-l-4 border-muted-gold p-4 mb-6 rounded-r-xl">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-body-sm font-body-main text-muted-gold tracking-wide">
                    Esta acción es irreversible. Se generarán los recibos y se marcarán todas las liquidaciones abiertas del período como CERRADA.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-4 mt-8">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-alabaster hover:bg-white/10 hover:border-white/20 transition-all font-label-caps text-label-caps uppercase tracking-widest">
                Cancelar
              </button>
              <button onClick={handleClose} className="px-6 py-3 bg-pale-rose/20 border border-pale-rose/50 rounded-xl text-pale-rose hover:bg-pale-rose hover:text-charcoal shadow-[0_0_15px_rgba(224,142,121,0.2)] hover:shadow-[0_0_20px_rgba(224,142,121,0.6)] transition-all font-label-caps text-label-caps uppercase tracking-widest">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
