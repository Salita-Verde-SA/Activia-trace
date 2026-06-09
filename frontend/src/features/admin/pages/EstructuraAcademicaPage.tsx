import { useState } from 'react';
import { CarrerasPanel } from '../components/estructura/CarrerasPanel';
import { CohortesPanel } from '../components/estructura/CohortesPanel';
import { MateriasPanel } from '../components/estructura/MateriasPanel';

export function EstructuraAcademicaPage() {
  const [activeTab, setActiveTab] = useState<'carreras' | 'cohortes' | 'materias'>('carreras');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Estructura Académica</h1>
        <p className="mt-1 text-sm text-white/70">Gestión del catálogo de carreras, cohortes y materias del tenant.</p>
      </div>

      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('carreras')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'carreras'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            Carreras
          </button>
          <button
            onClick={() => setActiveTab('cohortes')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'cohortes'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            Cohortes
          </button>
          <button
            onClick={() => setActiveTab('materias')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'materias'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            Materias
          </button>
        </nav>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-1">
        {activeTab === 'carreras' && <CarrerasPanel />}
        {activeTab === 'cohortes' && <CohortesPanel />}
        {activeTab === 'materias' && <MateriasPanel />}
      </div>
    </div>
  );
}
