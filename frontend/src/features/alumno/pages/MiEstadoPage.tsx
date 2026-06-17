import { useState } from 'react';
import { useEstadoAlumno } from '../hooks/useAlumno';
import { BookOpen, ChevronDown, ChevronRight } from 'lucide-react';

const estadoColor: Record<string, string> = {
  promocionado: 'bg-green-500/10 text-green-400 border-green-500/20',
  regular: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  en_riesgo: 'bg-red-500/10 text-red-400 border-red-500/20',
  sin_datos: 'bg-white/10 text-white/70 border-white/20',
};

export const MiEstadoPage = () => {
  const { data: estados, isLoading, isError } = useEstadoAlumno();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando estado académico...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Error al cargar estado académico.</div>;
  }

  if (!estados || estados.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-serif text-white/90">Mi Estado Académico</h1>
        <div className="bg-white/5 rounded-xl border border-white/10 p-8 text-center text-white/60">
          Tus notas no están vinculadas a tu cuenta, consultá con tu profesor.
        </div>
      </div>
    );
  }

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-serif text-white/90">Mi Estado Académico</h1>

      <div className="space-y-3">
        {estados.map(estado => {
          const isOpen = expanded.has(estado.materia_id);
          return (
            <div key={estado.materia_id} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={() => toggle(estado.materia_id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isOpen ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
                  <BookOpen className="w-4 h-4 text-white/50" />
                  <span className="font-medium text-white/90">{estado.materia_nombre}</span>
                </div>
                <div className="flex items-center gap-4">
                  {estado.nota_final !== null && (
                    <span className="text-sm font-semibold text-white/80">Prom: {estado.nota_final}</span>
                  )}
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoColor[estado.estado] ?? estadoColor.sin_datos}`}>
                    {estado.estado.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-white/10">
                  {estado.calificaciones.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-white/50">Sin calificaciones registradas.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-5 py-2 text-left text-xs font-medium text-white/50 uppercase">Actividad</th>
                          <th className="px-5 py-2 text-right text-xs font-medium text-white/50 uppercase">Nota</th>
                          <th className="px-5 py-2 text-center text-xs font-medium text-white/50 uppercase">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {estado.calificaciones.map((c, i) => (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-2.5 text-white/80">{c.actividad_nombre}</td>
                            <td className="px-5 py-2.5 text-right font-mono text-white/90">
                              {c.nota_numerica !== null ? c.nota_numerica : (c.nota_textual ?? '—')}
                            </td>
                            <td className="px-5 py-2.5 text-center">
                              <span className={`inline-block w-2 h-2 rounded-full ${c.aprobado ? 'bg-green-400' : 'bg-red-400'}`} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
