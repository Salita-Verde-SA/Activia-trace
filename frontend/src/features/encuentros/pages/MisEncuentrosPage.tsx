import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { encuentrosApi } from '../services/encuentrosApi';
import { InstanciaCard } from '../components/InstanciaCard';
import { SlotGroup } from '../components/SlotGroup';
import type { InstanciaEncuentro } from '../types';

function groupBySlot(instancias: InstanciaEncuentro[]): Array<InstanciaEncuentro[]> {
  const map = new Map<string, InstanciaEncuentro[]>();
  for (const inst of instancias) {
    const key = inst.slot_id ?? inst.id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(inst);
  }
  return Array.from(map.values());
}

export function MisEncuentrosPage() {
  const queryKey = ['mis-instancias-encuentros'];

  const { data: instancias = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: () => encuentrosApi.getMisInstancias(),
  });

  const grupos = useMemo(() => groupBySlot(instancias), [instancias]);

  if (isLoading) return <div className="p-6 text-white/40">Cargando encuentros...</div>;
  if (error) return <div className="p-6 text-red-400">Error al cargar encuentros</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-serif text-white/90">Mis Encuentros</h1>
        <p className="text-sm text-white/50 mt-0.5">Próximas clases y reuniones</p>
      </div>

      {instancias.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/20">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3 block">event</span>
          <p className="text-white/50 text-lg">No tenés encuentros próximos</p>
          <p className="text-white/30 text-sm mt-1">Los encuentros aparecerán aquí cuando sean programados</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grupos.map(grupo =>
            grupo.length === 1 ? (
              <InstanciaCard
                key={grupo[0].id}
                instancia={grupo[0]}
                queryKey={queryKey}
                readonly
              />
            ) : (
              <SlotGroup
                key={grupo[0].slot_id!}
                instancias={grupo}
                queryKey={queryKey}
                readonly
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
