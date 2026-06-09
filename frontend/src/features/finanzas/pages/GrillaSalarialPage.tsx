import { useState } from 'react';
import { SalariosBaseEditor } from '../components/salarios/SalariosBaseEditor';
import { SalariosPlusEditor } from '../components/salarios/SalariosPlusEditor';

export function GrillaSalarialPage() {
  const [activeTab, setActiveTab] = useState<'base' | 'plus'>('base');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Grilla Salarial</h1>
        <p className="mt-1 text-sm text-white/70">Gestión de salarios base y plus por rol para el cálculo de liquidaciones.</p>
      </div>

      <div className="border-b border-white/10">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('base')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'base'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            Salarios Base
          </button>
          <button
            onClick={() => setActiveTab('plus')}
            className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'plus'
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-white/50 hover:text-white/80 hover:border-white/20'
            }`}
          >
            Salarios Plus
          </button>
        </nav>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10">
        {activeTab === 'base' && <SalariosBaseEditor />}
        {activeTab === 'plus' && <SalariosPlusEditor />}
      </div>
    </div>
  );
}
