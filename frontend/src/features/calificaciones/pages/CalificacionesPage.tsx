import React, { useState } from 'react';
import { ImportWizard } from '../components/ImportWizard';
import { UmbralPanel } from '../components/UmbralPanel';
import { AtrasadosPanel } from '../components/AtrasadosPanel';
import { SabanaPanel } from '../components/SabanaPanel';
import ImportarPadronComisionModal from '../components/ImportarPadronComisionModal';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ComunicacionComposer } from '@/features/comunicaciones/components/ComunicacionComposer';
import { EnvioTracker } from '@/features/comunicaciones/components/EnvioTracker';
import { usePadronesActivos } from '../hooks/useCalificaciones';
import type { PadronActivoItem } from '../types';

export const CalificacionesPage: React.FC = () => {
  const { user } = useAuth();
  const { data: padrones, isLoading: loadingPadrones } = usePadronesActivos();
  const [selectedPadron, setSelectedPadron] = useState<PadronActivoItem | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [showImportPadron, setShowImportPadron] = useState(false);
  const [comunicacionDestinatarios, setComunicacionDestinatarios] = useState<string[] | null>(null);
  const [activeLoteId, setActiveLoteId] = useState<string | null>(null);

  const materiaId = selectedPadron?.materia_id ?? '';
  const cohorteId = selectedPadron?.cohorte_id ?? '';
  const versionPadronId = selectedPadron?.version_padron_id ?? '';

  const handlePadronChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const item = padrones?.find(p => p.version_padron_id === e.target.value) ?? null;
    setSelectedPadron(item);
    setShowImport(false);
  };

  const handleContactar = (alumnoId: string) => setComunicacionDestinatarios([alumnoId]);
  const handleContactarTodos = (alumnoIds: string[]) => setComunicacionDestinatarios(alumnoIds);
  const handleComunicacionSuccess = (loteId: string) => {
    setComunicacionDestinatarios(null);
    setActiveLoteId(loteId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Gestión de Comisión</h1>
          <p className="text-white/70">Profesor {user?.nombre}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportPadron(true)}
            className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-md hover:bg-white/20 transition-colors text-sm"
          >
            Importar Padrón
          </button>
          <button
            onClick={() => setShowImport(!showImport)}
            disabled={!selectedPadron}
            className="bg-primary-600/80 border border-primary-500/50 text-white px-4 py-2 rounded-md shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showImport ? 'Ocultar Importación' : 'Importar Calificaciones'}
          </button>
        </div>
      </div>

      {/* Selector de materia */}
      <div className="mb-6 bg-white/5 rounded-xl border border-white/10 p-4">
        <label className="block text-sm font-medium text-white/70 mb-2">Materia activa</label>
        {loadingPadrones ? (
          <p className="text-white/40 text-sm">Cargando materias...</p>
        ) : !padrones || padrones.length === 0 ? (
          <p className="text-white/40 text-sm">No hay materias con padrón activo. Importá un padrón primero.</p>
        ) : (
          <select
            value={selectedPadron?.version_padron_id ?? ''}
            onChange={handlePadronChange}
            className="w-full md:w-auto bg-black/30 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          >
            <option value="">— Seleccioná una materia —</option>
            {padrones.map(p => (
              <option key={p.version_padron_id} value={p.version_padron_id}>
                {p.materia_nombre} · {p.cohorte_nombre}
              </option>
            ))}
          </select>
        )}
        {!selectedPadron && padrones && padrones.length > 0 && (
          <p className="mt-2 text-xs text-white/40">Seleccioná una materia para ver calificaciones e importar notas.</p>
        )}
      </div>

      {showImport && selectedPadron && (
        <div className="mb-8">
          <ImportWizard
            materiaId={materiaId}
            cohorteId={cohorteId}
            versionPadronId={versionPadronId}
            onComplete={() => setShowImport(false)}
            onCancel={() => setShowImport(false)}
          />
        </div>
      )}

      {selectedPadron && (
        <>
          <UmbralPanel materiaId={materiaId} />
          <div className="mt-6">
            <SabanaPanel materiaId={materiaId} />
          </div>
          <div className="mt-6">
            <AtrasadosPanel
              materiaId={materiaId}
              onContactar={handleContactar}
              onContactarTodos={handleContactarTodos}
            />
          </div>
        </>
      )}

      {comunicacionDestinatarios && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <ComunicacionComposer
            alumnoIds={comunicacionDestinatarios}
            materiaId={materiaId}
            onSuccess={handleComunicacionSuccess}
            onCancel={() => setComunicacionDestinatarios(null)}
          />
        </div>
      )}

      {activeLoteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <EnvioTracker
            loteId={activeLoteId}
            onClose={() => setActiveLoteId(null)}
          />
        </div>
      )}

      {showImportPadron && (
        <ImportarPadronComisionModal
          materiaId={selectedPadron?.materia_id}
          cohorteId={selectedPadron?.cohorte_id}
          materiaNombre={selectedPadron ? `${selectedPadron.materia_nombre} · ${selectedPadron.cohorte_nombre}` : undefined}
          onClose={() => setShowImportPadron(false)}
          onSuccess={() => setShowImportPadron(false)}
        />
      )}
    </div>
  );
};
