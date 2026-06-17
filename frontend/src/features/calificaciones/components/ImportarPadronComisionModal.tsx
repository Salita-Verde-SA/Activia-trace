import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useImportarPadronComision } from '../hooks/useCalificaciones';
import api from '@/shared/services/api';

interface ImportarPadronComisionModalProps {
  materiaId?: string;
  cohorteId?: string;
  materiaNombre?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportarPadronComisionModal: React.FC<ImportarPadronComisionModalProps> = ({
  materiaId: propMateriaId,
  cohorteId: propCohorteId,
  materiaNombre: propMateriaNombre,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedMateriaId, setSelectedMateriaId] = useState(propMateriaId ?? '');
  const [selectedCohorteId, setSelectedCohorteId] = useState(propCohorteId ?? '');
  const mutation = useImportarPadronComision();

  const needsSelectors = !propMateriaId || !propCohorteId;

  const { data: catalogo } = useQuery({
    queryKey: ['padron-catalogo'],
    queryFn: () => api.get<{ materias: { id: string; nombre: string }[]; cohortes: { id: string; nombre: string }[] }>('/api/padron/catalogo').then(r => r.data),
    enabled: needsSelectors,
  });

  const materias = catalogo?.materias;
  const cohortes = catalogo?.cohortes;

  const materiaId = propMateriaId ?? selectedMateriaId;
  const cohorteId = propCohorteId ?? selectedCohorteId;

  const canSubmit = !!file && !!materiaId && !!cohorteId;

  const displayName = propMateriaNombre
    ?? (materias?.find(m => m.id === selectedMateriaId)?.nombre ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    mutation.mutate(
      { materiaId, cohorteId, file: file! },
      { onSuccess: () => { onSuccess(); onClose(); } }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Importar Padrón</h2>
            {displayName && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{displayName}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {needsSelectors && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Materia
                </label>
                <select
                  value={selectedMateriaId}
                  onChange={e => setSelectedMateriaId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— Seleccioná una materia —</option>
                  {materias?.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cohorte
                </label>
                <select
                  value={selectedCohorteId}
                  onChange={e => setSelectedCohorteId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">— Seleccioná un cohorte —</option>
                  {cohortes?.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Archivo CSV del padrón
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="padron-file" className="relative cursor-pointer rounded-md font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    <span>Subir archivo</span>
                    <input
                      id="padron-file"
                      type="file"
                      className="sr-only"
                      accept=".csv"
                      onChange={e => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500">{file ? file.name : 'CSV (máx. 10MB)'}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Columnas requeridas: <code>email</code>, <code>nombre</code>, <code>apellidos</code>.
              También acepta formato Moodle (<code>Email Address</code>, <code>First Name</code>, <code>Last Name</code>).
            </p>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {(mutation.error as any)?.response?.data?.detail ?? 'Error al importar el padrón.'}
            </p>
          )}

          {mutation.isSuccess && (
            <p className="text-sm text-green-600">Padrón importado correctamente.</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!canSubmit || mutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mutation.isPending ? 'Importando...' : 'Importar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImportarPadronComisionModal;
