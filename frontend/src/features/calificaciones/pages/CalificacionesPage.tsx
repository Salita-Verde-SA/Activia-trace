import React, { useState } from 'react';
import { PLACEHOLDER_UUID } from '@/shared/constants';
import { ImportWizard } from '../components/ImportWizard';
import { UmbralPanel } from '../components/UmbralPanel';
import { AtrasadosPanel } from '../components/AtrasadosPanel';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ComunicacionComposer } from '@/features/comunicaciones/components/ComunicacionComposer';
import { EnvioTracker } from '@/features/comunicaciones/components/EnvioTracker';

export const CalificacionesPage: React.FC = () => {
  const { user } = useAuth();
  // TODO: Obtener materiaId dinámicamente según la asignación del profesor
  const materiaId = PLACEHOLDER_UUID; // Placeholder
  const cohorteId = PLACEHOLDER_UUID; // Placeholder
  const versionPadronId = PLACEHOLDER_UUID; // Placeholder

  const [showImport, setShowImport] = useState(false);
  
  // Estado para la comunicación
  const [comunicacionDestinatarios, setComunicacionDestinatarios] = useState<string[] | null>(null);
  const [activeLoteId, setActiveLoteId] = useState<string | null>(null);

  const handleContactar = (alumnoId: string) => {
    setComunicacionDestinatarios([alumnoId]);
  };

  const handleContactarTodos = (alumnoIds: string[]) => {
    setComunicacionDestinatarios(alumnoIds);
  };

  const handleComunicacionSuccess = (loteId: string) => {
    setComunicacionDestinatarios(null);
    setActiveLoteId(loteId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Gestión de Comisión</h1>
          <p className="text-white/70">Materia Activa - Profesor {user?.nombre}</p>
        </div>
        <button 
          onClick={() => setShowImport(!showImport)}
          className="bg-primary-600/80 border border-primary-500/50 text-white px-4 py-2 rounded-md shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] hover:bg-primary-600 transition-colors"
        >
          {showImport ? 'Ocultar Importación' : 'Importar Calificaciones'}
        </button>
      </div>

      {showImport && (
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

      <UmbralPanel materiaId={materiaId} />

      <AtrasadosPanel 
        materiaId={materiaId} 
        onContactar={handleContactar}
        onContactarTodos={handleContactarTodos}
      />

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
    </div>
  );
};
