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
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
      >
        Cerrar Período {periodoMes}/{periodoAnio}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Cierre de Liquidación</h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Está seguro que desea cerrar la liquidación del período <strong>{periodoMes}/{periodoAnio}</strong>?
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Esta acción es irreversible. Se generarán los recibos y se marcarán todas las liquidaciones abiertas del período como CERRADA.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                Cancelar
              </button>
              <button onClick={handleClose} className="px-4 py-2 bg-red-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none">
                Confirmar Cierre
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
