import React, { useState } from 'react';
import { useUploadCalificacionesPreview, useConfirmImport } from '../hooks/useCalificaciones';
import type { PreviewResponse, ColumnMap } from '../types';

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
    <div className="bg-black/20 backdrop-blur-md p-6 rounded-xl shadow-sm border border-white/10 max-w-3xl mx-auto">
      <h2 className="text-2xl font-serif text-white/90 mb-4">Importar Calificaciones</h2>
      
      {step === 1 && (
        <div>
          <p className="mb-4 text-white/70">Selecciona el archivo exportado desde Moodle (CSV o XLSX).</p>
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            onChange={handleFileChange}
            className="block w-full text-sm text-white/50 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-primary-500/30 file:text-sm file:font-semibold file:bg-primary-500/20 file:text-primary-300 hover:file:bg-primary-500/30 transition-colors mb-4"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={onCancel} className="px-4 py-2 border border-white/10 bg-white/5 text-white/70 rounded hover:bg-white/10 transition-colors">
              Cancelar
            </button>
            <button 
              onClick={handleUpload} 
              disabled={!file || uploadMutation.isPending}
              className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] text-white rounded hover:bg-primary-600 disabled:opacity-50 disabled:shadow-none transition-colors"
            >
              {uploadMutation.isPending ? 'Procesando...' : 'Siguiente'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && preview && (
        <div>
          <p className="mb-4 text-white/70">Se detectaron {preview.total_filas} filas. Selecciona las columnas que deseas importar como actividades.</p>
          
          <div className="overflow-x-auto mb-4 rounded-lg border border-white/10">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/50 uppercase">Importar</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/50 uppercase">Columna</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-white/50 uppercase">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {columnConfig.map((col, idx) => (
                  <tr key={idx} className={col.ignorar ? 'bg-white/5 opacity-50' : 'bg-green-500/10'}>
                    <td className="px-4 py-2">
                      <input 
                        type="checkbox" 
                        checked={!col.ignorar} 
                        onChange={() => handleToggleColumn(idx)}
                        className="h-4 w-4 text-primary-500 bg-black/20 border-white/10 rounded"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-white/90">{col.nombre_columna}</td>
                    <td className="px-4 py-2 text-sm text-white/50">
                      {col.es_numerica ? 'Numérica' : 'Textual'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 border border-white/10 bg-white/5 text-white/70 rounded hover:bg-white/10 transition-colors">
              Atrás
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={confirmMutation.isPending}
              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded hover:bg-green-500/30 disabled:opacity-50 transition-colors"
            >
              {confirmMutation.isPending ? 'Importando...' : 'Confirmar Importación'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
