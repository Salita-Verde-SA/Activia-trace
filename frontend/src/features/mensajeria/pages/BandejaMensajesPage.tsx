import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mensajeriaApi } from '../services/mensajeriaApi';
import { HiloCard } from '../components/HiloCard';
import { NuevoHiloModal } from '../components/NuevoHiloModal';

export function BandejaMensajesPage() {
  const navigate = useNavigate();
  const [nuevoOpen, setNuevoOpen] = useState(false);

  const { data: hilos = [], isLoading, error } = useQuery({
    queryKey: ['bandeja-mensajes'],
    queryFn: () => mensajeriaApi.getBandeja(),
  });

  if (isLoading) return <div className="p-6 text-white/50">Cargando mensajes...</div>;
  if (error) return <div className="p-6 text-red-400">Error al cargar mensajes</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Mensajes</h1>
          <p className="text-sm text-white/50 mt-0.5">Bandeja de entrada interna</p>
        </div>
        <button
          onClick={() => setNuevoOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">edit</span>
          Nuevo mensaje
        </button>
      </div>

      {hilos.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/20">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3 block">forum</span>
          <p className="text-white/50 text-lg">No tenés mensajes aún</p>
          <p className="text-white/30 text-sm mt-1">Iniciá una conversación con el equipo docente</p>
          <button
            onClick={() => setNuevoOpen(true)}
            className="mt-4 px-4 py-2 border border-white/20 text-white/60 rounded-lg hover:bg-white/5 transition-colors text-sm"
          >
            Enviar primer mensaje
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {hilos.map(hilo => (
            <HiloCard
              key={hilo.id}
              hilo={hilo}
              onClick={() => navigate(`/mensajes/${hilo.id}`)}
            />
          ))}
        </div>
      )}

      <NuevoHiloModal isOpen={nuevoOpen} onClose={() => setNuevoOpen(false)} />
    </div>
  );
}
