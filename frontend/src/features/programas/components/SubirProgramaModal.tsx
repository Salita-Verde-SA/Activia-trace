import React, { useState } from 'react';
import { useProgramas } from '../hooks/useProgramas';

interface Carrera {
  id: string;
  nombre: string;
}

interface Cohorte {
  id: string;
  nombre: string;
  anio: number;
}

interface SubirProgramaModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: string;
  carreras: Carrera[];
  cohortes: Cohorte[];
}

export const SubirProgramaModal: React.FC<SubirProgramaModalProps> = ({
  isOpen,
  onClose,
  materiaId,
  carreras,
  cohortes
}) => {
  const { uploadPrograma } = useProgramas(materiaId);
  const [carreraId, setCarreraId] = useState('');
  const [cohorteId, setCohorteId] = useState('');
  const [version, setVersion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Debe seleccionar un archivo PDF');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const formData = new FormData();
      formData.append('materia_id', materiaId);
      if (carreraId) formData.append('carrera_id', carreraId);
      if (cohorteId) formData.append('cohorte_id', cohorteId);
      if (version) formData.append('version', version);
      formData.append('file', file);

      await uploadPrograma(formData);
      onClose();
      // Reset form
      setCarreraId('');
      setCohorteId('');
      setVersion('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Error al subir el programa');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1a1a24] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">upload_file</span>
            Subir Programa
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Carrera (Opcional)</label>
            <select
              value={carreraId}
              onChange={(e) => setCarreraId(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="" className="bg-[#1a1a24]">-- Seleccionar Carrera --</option>
              {carreras.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1a1a24]">{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Cohorte (Opcional)</label>
            <select
              value={cohorteId}
              onChange={(e) => setCohorteId(e.target.value)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="" className="bg-[#1a1a24]">-- Seleccionar Cohorte --</option>
              {cohortes.map(c => (
                <option key={c.id} value={c.id} className="bg-[#1a1a24]">{c.nombre} ({c.anio})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Versión (Opcional)</label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Ej: 2024 v1"
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Archivo PDF</label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/80"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !file}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? 'Subiendo...' : 'Subir Archivo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
