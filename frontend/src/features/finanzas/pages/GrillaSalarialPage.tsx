import { useState } from 'react';
import { SalariosBaseEditor } from '../components/salarios/SalariosBaseEditor';
import { SalariosPlusEditor } from '../components/salarios/SalariosPlusEditor';

export function GrillaSalarialPage() {
  const [activeTab, setActiveTab] = useState<'base' | 'plus'>('base');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Grilla Salarial</h1>
        <p className="mt-1 text-sm text-gray-500">Gestión de salarios base y plus por rol para el cálculo de liquidaciones.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('base')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'base'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Salarios Base
          </button>
          <button
            onClick={() => setActiveTab('plus')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plus'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Salarios Plus
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow">
        {activeTab === 'base' && <SalariosBaseEditor />}
        {activeTab === 'plus' && <SalariosPlusEditor />}
      </div>
    </div>
  );
}
