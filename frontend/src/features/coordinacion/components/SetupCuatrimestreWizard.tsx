import React, { useState } from 'react';

// Interfaces mockeadas ya que los servicios vienen de otros features (programas, calendarios)
interface SetupCuatrimestreWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const SetupCuatrimestreWizard: React.FC<SetupCuatrimestreWizardProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cohorteNombre: '',
    fechaInicio: '',
    fechaFin: '',
    programaId: '',
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se conectarían las mutaciones de inicialización (API)
    console.log('Iniciando cuatrimestre con:', formData);
    // Simular guardado
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6 max-w-3xl mx-auto mt-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Setup de Cuatrimestre</h2>
        <p className="text-gray-600 text-sm mt-1">Configurá la nueva cohorte, programa y calendario</p>
      </div>

      <div className="flex mb-8">
        <div className={`flex-1 border-b-2 pb-2 ${step >= 1 ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-400'}`}>
          <span className="font-bold">1. Cohorte y Programa</span>
        </div>
        <div className={`flex-1 border-b-2 pb-2 ${step >= 2 ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-400'}`}>
          <span className="font-bold">2. Fechas Académicas</span>
        </div>
        <div className={`flex-1 border-b-2 pb-2 ${step >= 3 ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-400'}`}>
          <span className="font-bold">3. Confirmación</span>
        </div>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Cohorte</label>
              <input
                type="text"
                required
                placeholder="Ej. 1er Cuatrimestre 2026"
                value={formData.cohorteNombre}
                onChange={(e) => setFormData({ ...formData, cohorteNombre: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Programa Académico Base</label>
              <select
                required
                value={formData.programaId}
                onChange={(e) => setFormData({ ...formData, programaId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Seleccionar un programa...</option>
                <option value="prog-1">Diseño de Sistemas - Plan 2026</option>
                <option value="prog-2">Sistemas Operativos - Plan 2026</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inicio de Clases</label>
                <input
                  type="date"
                  required
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin de Clases</label>
                <input
                  type="date"
                  required
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded text-sm mt-4">
              Las fechas de parciales y recuperatorios se generarán automáticamente en base al Programa seleccionado. Luego podrás editarlas.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Resumen del Cuatrimestre</h3>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
              <p className="mb-2"><strong>Cohorte:</strong> {formData.cohorteNombre}</p>
              <p className="mb-2"><strong>Programa:</strong> {formData.programaId === 'prog-1' ? 'Diseño de Sistemas' : 'Sistemas Operativos'}</p>
              <p className="mb-2"><strong>Inicio:</strong> {formData.fechaInicio}</p>
              <p className="mb-2"><strong>Fin:</strong> {formData.fechaFin}</p>
            </div>
            <p className="text-gray-600 text-sm">
              Al confirmar, se creará la estructura base, se asociará el programa y se generará el calendario. 
              El equipo docente podrá cargarse más tarde.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-8 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={step === 1 ? onCancel : handleBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {step === 1 ? 'Cancelar' : 'Atrás'}
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {step === 3 ? 'Confirmar e Inicializar' : 'Siguiente'}
          </button>
        </div>
      </form>
    </div>
  );
};
