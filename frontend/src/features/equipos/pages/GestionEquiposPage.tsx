import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEstructura } from '../../admin/hooks/useEstructura';
import { EquiposPanel } from '../components/EquiposPanel';
import { CloneAsignacionesModal } from '../components/CloneAsignacionesModal';

export function GestionEquiposPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { materiasQuery } = useEstructura();
  const materias = materiasQuery.data ?? [];

  const [selectedMateriaId, setSelectedMateriaId] = useState<string>('');
  const [cloneOpen, setCloneOpen] = useState(false);

  useEffect(() => {
    const paramId = searchParams.get('materia');
    if (paramId) setSelectedMateriaId(paramId);
  }, []);

  const handleMateriaChange = (id: string) => {
    setSelectedMateriaId(id);
    if (id) {
      setSearchParams({ materia: id });
    } else {
      setSearchParams({});
    }
  };

  const selectedMateria = materias.find(m => m.id === selectedMateriaId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Equipos Docentes</h1>
          <p className="text-sm text-white/70 mt-1">Gestión de equipos por materia</p>
        </div>
        {selectedMateriaId && (
          <button
            onClick={() => setCloneOpen(true)}
            className="bg-white/5 border border-white/10 text-white/80 px-4 py-2 rounded-md hover:bg-white/10 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">content_copy</span>
            Clonar equipo
          </button>
        )}
      </div>

      <div className="mb-6 bg-white/5 rounded-xl border border-white/10 p-4">
        <label className="block text-sm font-medium text-white/70 mb-2">Materia</label>
        {materiasQuery.isLoading ? (
          <div className="text-white/40 text-sm">Cargando materias...</div>
        ) : (
          <select
            value={selectedMateriaId}
            onChange={e => handleMateriaChange(e.target.value)}
            className="block w-full max-w-md rounded-md border-white/10 bg-white/5 text-white/90 shadow-sm focus:border-primary-500 focus:ring-primary-500 [&>option]:bg-neutral-900 [&>option]:text-white"
          >
            <option value="">Seleccioná una materia...</option>
            {materias.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        )}
      </div>

      {selectedMateriaId ? (
        <EquiposPanel
          materiaId={selectedMateriaId}
          materiaNombre={selectedMateria?.nombre}
        />
      ) : (
        <div className="text-center py-16 text-white/50 bg-white/5 rounded-xl border border-dashed border-white/20">
          <span className="material-symbols-outlined text-4xl mb-3 block">manage_accounts</span>
          <p className="text-lg">Seleccioná una materia para ver su equipo docente.</p>
        </div>
      )}

      <CloneAsignacionesModal
        isOpen={cloneOpen}
        onClose={() => setCloneOpen(false)}
        materiaId={selectedMateriaId}
      />
    </div>
  );
}
