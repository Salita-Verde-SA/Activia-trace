import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';
import { ProgramasList } from '../components/ProgramasList';
import { FechasList } from '../components/FechasList';
import { SubirProgramaModal } from '../components/SubirProgramaModal';
import { AgregarFechaModal } from '../components/AgregarFechaModal';

interface Materia { id: string; nombre: string; }
interface Carrera { id: string; nombre: string; }
interface Cohorte { id: string; nombre: string; anio: number; }

export function ProgramasPage() {
  const [materiaId, setMateriaId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'programas' | 'fechas'>('programas');
  
  const [subirProgramaOpen, setSubirProgramaOpen] = useState(false);
  const [agregarFechaOpen, setAgregarFechaOpen] = useState(false);

  const { data: materias = [], isError: materiasError, isLoading: materiasLoading } = useQuery<Materia[]>({
    queryKey: ['admin-materias'],
    queryFn: () => api.get<Materia[]>('/api/admin/materias').then(r => {
      console.log("Fetched materias:", r.data);
      return r.data;
    }).catch(e => {
      console.error("Error fetching materias:", e);
      throw e;
    }),
  });

  const { data: carreras = [] } = useQuery<Carrera[]>({
    queryKey: ['admin-carreras'],
    queryFn: () => api.get<Carrera[]>('/api/admin/carreras').then(r => r.data),
  });

  const { data: cohortes = [] } = useQuery<Cohorte[]>({
    queryKey: ['admin-cohortes'],
    queryFn: () => api.get<Cohorte[]>('/api/admin/cohortes').then(r => r.data),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Programas y Fechas</h1>
          <p className="text-sm text-white/50 mt-0.5">Gestión de programas de materia y calendario académico</p>
        </div>
        {materiaId && (
          <div>
            {activeTab === 'programas' ? (
              <button
                onClick={() => setSubirProgramaOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-xl hover:bg-primary-600 transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-base">upload_file</span>
                Subir Programa
              </button>
            ) : (
              <button
                onClick={() => setAgregarFechaOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600/80 border border-green-500/50 text-white rounded-xl hover:bg-green-600 transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-base">event_available</span>
                Agregar Fecha
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex-1 w-full max-w-sm">
          <label className="block text-sm text-white/70 mb-2">Materia</label>
          <select
            value={materiaId}
            onChange={e => setMateriaId(e.target.value)}
            className="w-full border border-white/10 bg-white/5 text-white/90 rounded-xl px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="" className="bg-[#1a1a24]">— Seleccioná una materia —</option>
            {materias.map(m => (
              <option key={m.id} value={m.id} className="bg-[#1a1a24]">{m.nombre}</option>
            ))}
          </select>
        </div>
        
        {materiaId && (
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-end">
            <button
              onClick={() => setActiveTab('programas')}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'programas' 
                  ? 'bg-primary-600/80 text-white shadow-lg border border-primary-500/50' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">description</span>
              Programas
            </button>
            <button
              onClick={() => setActiveTab('fechas')}
              className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'fechas' 
                  ? 'bg-primary-600/80 text-white shadow-lg border border-primary-500/50' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-base">calendar_month</span>
              Fechas
            </button>
          </div>
        )}
      </div>

      {!materiaId ? (
        <div className="text-center py-16 bg-white/5 rounded-xl border border-dashed border-white/20">
          <span className="material-symbols-outlined text-5xl text-white/20 mb-3 block">school</span>
          <p className="text-white/40">Seleccioná una materia para gestionar sus programas y fechas</p>
        </div>
      ) : (
        <div>
          {activeTab === 'programas' && <ProgramasList materiaId={materiaId} />}
          {activeTab === 'fechas' && <FechasList materiaId={materiaId} />}
        </div>
      )}

      {materiaId && subirProgramaOpen && (
        <SubirProgramaModal
          isOpen={subirProgramaOpen}
          onClose={() => setSubirProgramaOpen(false)}
          materiaId={materiaId}
          carreras={carreras}
          cohortes={cohortes}
        />
      )}

      {materiaId && agregarFechaOpen && (
        <AgregarFechaModal
          isOpen={agregarFechaOpen}
          onClose={() => setAgregarFechaOpen(false)}
          materiaId={materiaId}
          cohortes={cohortes}
        />
      )}
    </div>
  );
}
