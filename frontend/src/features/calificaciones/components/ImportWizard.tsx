import React, { useState } from 'react';
import { useUploadCalificacionesPreview, useConfirmImport } from '../hooks/useCalificaciones';
import { PreviewResponse, ColumnMap } from '../types';

interface ImportWizardProps {
  materiaId: string;
  cohorteId: string;
  versionPadronId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ materiaId, cohorteId, versionPadronId, onComplete, onCancel }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [columnConfig, setColumnConfig] = useState<ColumnMap[]>([]);
  
  const uploadMutation = useUploadCalificacionesPreview();
  const confirmMutation = useConfirmImport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      const res = await uploadMutation.mutateAsync(file);
      setPreview(res);
      setColumnConfig(res.columnas_detectadas);
      setStep(2);
    } catch (error) {
      console.error('Error uploading file', error);
      alert('Error procesando el archivo. Por favor verifica el formato.');
    }
  };

  const handleToggleColumn = (index: number) => {
    const newConfig = [...columnConfig];
    newConfig[index].ignorar = !newConfig[index].ignorar;
    setColumnConfig(newConfig);
  };

  const handleConfirm = async () => {
    try {
      await confirmMutation.mutateAsync({
        materia_id: materiaId,
        cohorte_id: cohorteId,
        version_padron_id: versionPadronId,
        columnas: columnConfig
      });
      onComplete();
    } catch (error) {
      console.error('Error confirming import', error);
      alert('Error confirmando la importación.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Importar Calificaciones</h2>
      
      {step === 1 && (
        <div>
          <p className="mb-4 text-gray-600">Selecciona el archivo exportado desde Moodle (CSV o XLSX).</p>
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={onCancel} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
              Cancelar
            </button>
            <button 
              onClick={handleUpload} 
              disabled={!file || uploadMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadMutation.isPending ? 'Procesando...' : 'Siguiente'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && preview && (
        <div>
          <p className="mb-4 text-gray-600">Se detectaron {preview.total_filas} filas. Selecciona las columnas que deseas importar como actividades.</p>
          
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Importar</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Columna</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {columnConfig.map((col, idx) => (
                  <tr key={idx} className={col.ignorar ? 'bg-gray-50' : 'bg-green-50'}>
                    <td className="px-4 py-2">
                      <input 
                        type="checkbox" 
                        checked={!col.ignorar} 
                        onChange={() => handleToggleColumn(idx)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{col.nombre_columna}</td>
                    <td className="px-4 py-2 text-sm text-gray-500">
                      {col.es_numerica ? 'Numérica' : 'Textual'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
              Atrás
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={confirmMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {confirmMutation.isPending ? 'Importando...' : 'Confirmar Importación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
