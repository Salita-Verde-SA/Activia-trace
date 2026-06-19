import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { encuentrosApi } from '../services/encuentrosApi';
import { InstanciaCard } from '../components/InstanciaCard';
import { SlotGroup } from '../components/SlotGroup';
import { NuevoEncuentroModal } from '../components/NuevoEncuentroModal';
import { HtmlLmsModal } from '../components/HtmlLmsModal';
import type { InstanciaEncuentro } from '../types';

interface Materia { id: string; nombre: string; }
interface AsignacionItem {
  asignacion_id: string;
  usuario_nombre: string;
  usuario_apellido: string;
  rol_nombre: string;
}

function groupBySlot(instancias: InstanciaEncuentro[]): Array<InstanciaEncuentro[]> {
  const map = new Map<string, InstanciaEncuentro[]>();
  for (const inst of instancias) {
    const key = inst.slot_id ?? inst.id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(inst);
  }
  return Array.from(map.values());
}

export function EncuentrosPage() {
  const [materiaId, setMateriaId] = useState<string>('');
  const [nuevoOpen, setNuevoOpen] = useState(false);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);

  const { data: materias = [] } = useQuery<Materia[]>({
    queryKey: ['admin-materias'],
    queryFn: () => api.get<Materia[]>('/api/admin/materias').then(r => r.data),
  });

  const { data: asignaciones = [] } = useQuery<AsignacionItem[]>({
    queryKey: ['equipo-materia', materiaId],
    queryFn: () => api.get<AsignacionItem[]>(`/api/equipos/materia/${materiaId}`).then(r => r.data),
    enabled: !!materiaId,
  });

  const instanciasKey = ['instancias-materia', materiaId];
  const { data: instancias = [], isLoading } = useQuery({
    queryKey: instanciasKey,
    queryFn: () => encuentrosApi.getInstanciasPorMateria(materiaId),
    enabled: !!materiaId,
  });

  const grupos = useMemo(() => groupBySlot(instancias), [instancias]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Encuentros</h1>
          <p className="text-sm text-white/50 mt-0.5">Gestión de clases y reuniones</p>
        </div>
        <div className="flex items-center gap-2">
          {materiaId && (
            <button
              onClick={() => setHtmlModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-base">code</span>
              Exportar para LMS
            </button>
          )}
          {materiaId && asignaciones.length > 0 && (
            <button
              onClick={() => setNuevoOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo encuentro
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm text-white/70 mb-2">Materia</label>
        <select
          value={materiaId}
          onChange={e => setMateriaId(e.target.value)}
          className="w-full max-w-sm border border-white/10 bg-white/5 text-white/90 rounded-xl px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="" className="bg-neutral-900">— Seleccioná una materia —</option>
          {materias.map(m => (
            <option key={m.id} value={m.id} className="bg-neutral-900">{m.nombre}</option>
          ))}
        </select>
      </div>

      {!materiaId && (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-dashed border-white/20">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3 block">event</span>
          <p className="text-white/40">Seleccioná una materia para ver sus encuentros</p>
        </div>
      )}

      {materiaId && isLoading && (
        <p className="text-white/40 text-sm">Cargando instancias...</p>
      )}

      {materiaId && !isLoading && instancias.length === 0 && (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-dashed border-white/20">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3 block">event_busy</span>
          <p className="text-white/50">Sin encuentros para esta materia</p>
          {asignaciones.length > 0 && (
            <button
              onClick={() => setNuevoOpen(true)}
              className="mt-4 px-4 py-2 border border-white/20 text-white/60 rounded-lg hover:bg-white/5 transition-colors text-sm"
            >
              Crear el primero
            </button>
          )}
        </div>
      )}

      {grupos.length > 0 && (
        <div className="space-y-3">
          {grupos.map(grupo =>
            grupo.length === 1 ? (
              <InstanciaCard
                key={grupo[0].id}
                instancia={grupo[0]}
                queryKey={instanciasKey}
              />
            ) : (
              <SlotGroup
                key={grupo[0].slot_id!}
                instancias={grupo}
                queryKey={instanciasKey}
              />
            )
          )}
        </div>
      )}

      {materiaId && nuevoOpen && (
        <NuevoEncuentroModal
          isOpen={nuevoOpen}
          onClose={() => setNuevoOpen(false)}
          materiaId={materiaId}
          asignaciones={asignaciones}
          queryKey={instanciasKey}
        />
      )}

      {materiaId && (
        <HtmlLmsModal
          materiaId={materiaId}
          isOpen={htmlModalOpen}
          onClose={() => setHtmlModalOpen(false)}
        />
      )}
    </div>
  );
}
