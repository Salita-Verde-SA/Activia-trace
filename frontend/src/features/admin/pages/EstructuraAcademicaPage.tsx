import { useState } from 'react';
import { CarrerasPanel } from '../components/estructura/CarrerasPanel';
import { CohortesPanel } from '../components/estructura/CohortesPanel';
import { MateriasPanel } from '../components/estructura/MateriasPanel';

export function EstructuraAcademicaPage() {
  const [activeTab, setActiveTab] = useState<'carreras' | 'cohortes' | 'materias'>('carreras');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Estructura Académica</h1>
        <p className="mt-1 text-sm text-gray-500">Gestión del catálogo de carreras, cohortes y materias del tenant.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('carreras')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'carreras'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Carreras
          </button>
          <button
            onClick={() => setActiveTab('cohortes')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cohortes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cohortes
          </button>
          <button
            onClick={() => setActiveTab('materias')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'materias'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Materias
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow">
        {activeTab === 'carreras' && <CarrerasPanel />}
        {activeTab === 'cohortes' && <CohortesPanel />}
        {activeTab === 'materias' && <MateriasPanel />}
      </div>
    </div>
  );
}
