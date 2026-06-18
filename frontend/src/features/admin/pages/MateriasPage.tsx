import { MateriasPanel } from '../components/estructura/MateriasPanel';

export function MateriasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Materias y Equipos Docentes</h1>
        <p className="mt-1 text-sm text-white/70">Gestión de materias del catálogo y asignación de profesores a equipos docentes.</p>
      </div>

      <div className="bg-white/5 backdrop-blur-md rounded-xl shadow-sm border border-white/10 p-1">
        <MateriasPanel />
      </div>
    </div>
  );
}
