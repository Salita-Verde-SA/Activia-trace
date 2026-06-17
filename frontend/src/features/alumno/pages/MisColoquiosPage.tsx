import { useState } from 'react';
import { useColoquiosAlumno, useReservarColoquio, useCancelarReserva } from '../hooks/useAlumno';
import { Calendar, Users, CheckCircle, Clock } from 'lucide-react';

export const MisColoquiosPage = () => {
  const { data: coloquios, isLoading, isError } = useColoquiosAlumno();
  const { mutate: reservar, isPending: isReserving } = useReservarColoquio();
  const { mutate: cancelar, isPending: isCanceling } = useCancelarReserva();

  const [reservaConfirm, setReservaConfirm] = useState<{ id: string, name: string } | null>(null);
  const [cancelarConfirm, setCancelarConfirm] = useState<{ id: string, name: string } | null>(null);

  if (isLoading) {
    return <div className="p-8 text-center text-white/50 animate-pulse">Cargando coloquios...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-400">Error al cargar coloquios disponibles.</div>;
  }

  const handleConfirmReservar = () => {
    if (reservaConfirm) {
      reservar(reservaConfirm.id, {
        onSuccess: () => setReservaConfirm(null),
        onError: () => setReservaConfirm(null)
      });
    }
  };

  const handleConfirmCancelar = () => {
    if (cancelarConfirm) {
      cancelar(cancelarConfirm.id, {
        onSuccess: () => setCancelarConfirm(null),
        onError: () => setCancelarConfirm(null)
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Reserva de Coloquios</h1>
        <p className="text-white/60 mt-2">Explora las convocatorias abiertas y reserva tu lugar para rendir.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coloquios?.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 border-dashed">
            <CheckCircle className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-white/60 text-lg">No hay coloquios disponibles en este momento.</p>
          </div>
        ) : (
          coloquios?.map(coloquio => {
            const isAssigned = !!coloquio.mi_reserva_id;
            return (
              <div 
                key={coloquio.turno_id} 
                className={`p-6 rounded-2xl border backdrop-blur-md flex flex-col justify-between transition-all duration-300
                  ${isAssigned 
                    ? 'bg-primary-500/10 border-primary-500/30 shadow-[0_0_20px_rgba(var(--color-primary-500),0.1)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 shadow-lg'
                  }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-white/90 text-xl">{coloquio.materia_nombre}</h3>
                    {isAssigned && (
                      <span className="bg-primary-500/20 text-primary-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 border border-primary-500/30">
                        <CheckCircle className="w-3 h-3" /> Asignado
                      </span>
                    )}
                  </div>
                  <p className="text-primary-400 text-sm font-medium mb-4">{coloquio.nombre_convocatoria}</p>
                  
                  <div className="space-y-3 text-sm text-white/70 bg-black/20 p-4 rounded-xl border border-white/5">
                    <p className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-primary-400" />
                      <span>{new Date(coloquio.fecha_hora_inicio).toLocaleDateString()}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-primary-400" />
                      <span>{new Date(coloquio.fecha_hora_inicio).toLocaleTimeString()} - {new Date(coloquio.fecha_hora_fin).toLocaleTimeString()}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-primary-400" />
                      <span>Cupo: {coloquio.cupo_disponible} / {coloquio.cupo_total} disponibles</span>
                    </p>
                  </div>
                </div>
                
                <div className="mt-6">
                  {isAssigned ? (
                    <button
                      onClick={() => setCancelarConfirm({ id: coloquio.mi_reserva_id!, name: coloquio.materia_nombre })}
                      disabled={isCanceling}
                      className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 transition-all duration-200"
                    >
                      Cancelar Reserva
                    </button>
                  ) : (
                    <button
                      onClick={() => setReservaConfirm({ id: coloquio.turno_id, name: coloquio.materia_nombre })}
                      disabled={isReserving || coloquio.cupo_disponible === 0}
                      className="w-full py-3 bg-primary-600 border border-primary-500 text-white rounded-xl font-medium hover:bg-primary-500 disabled:opacity-50 disabled:bg-white/10 disabled:border-white/10 disabled:text-white/40 transition-all duration-200 shadow-[0_0_15px_rgba(var(--color-primary-500),0.3)] hover:shadow-[0_0_25px_rgba(var(--color-primary-500),0.5)]"
                    >
                      {coloquio.cupo_disponible === 0 ? 'Sin Cupo' : 'Reservar Lugar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Reservar */}
      {reservaConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-serif text-white/90 mb-2">Confirmar Reserva</h3>
            <p className="text-white/60 text-sm mb-6">
              ¿Estás seguro que deseas reservar tu lugar para el coloquio de <span className="text-primary-400 font-medium">{reservaConfirm.name}</span>?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setReservaConfirm(null)}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmReservar}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 shadow-lg shadow-primary-500/20 transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelar */}
      {cancelarConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-red-500/20 rounded-2xl p-6 shadow-2xl max-w-sm w-full relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full pointer-events-none" />
            <h3 className="text-xl font-serif text-red-400 mb-2 relative z-10">Cancelar Reserva</h3>
            <p className="text-white/60 text-sm mb-6 relative z-10">
              Vas a cancelar tu reserva para <span className="text-white/90 font-medium">{cancelarConfirm.name}</span>. Liberarás tu cupo y podrías quedarte sin lugar si decides volver a inscribirte.
            </p>
            <div className="flex gap-3 justify-end relative z-10">
              <button 
                onClick={() => setCancelarConfirm(null)}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cerrar
              </button>
              <button 
                onClick={handleConfirmCancelar}
                className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
