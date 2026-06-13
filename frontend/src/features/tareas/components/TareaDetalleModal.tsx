import React, { useState } from 'react';
import { useTarea } from '../hooks/useTareas';
import { useComentarios } from '../hooks/useComentarios';

interface TareaDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  tareaId: string | null;
}

export const TareaDetalleModal: React.FC<TareaDetalleModalProps> = ({ isOpen, onClose, tareaId }) => {
  const { data: tarea, isLoading: loadingTarea } = useTarea(tareaId || undefined);
  const { comentarios, isLoading: loadingComentarios, agregarComentario } = useComentarios(tareaId || undefined);
  const [nuevoComentario, setNuevoComentario] = useState('');

  if (!isOpen || !tareaId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;

    await agregarComentario.mutateAsync({ texto: nuevoComentario });
    setNuevoComentario('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-white/10 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-serif text-white/90 mb-2">
              {loadingTarea ? 'Cargando...' : tarea?.titulo}
            </h2>
            <div className="flex gap-2 text-xs">
              <span className={`font-bold px-2 py-1 rounded border ${
                tarea?.prioridad === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                tarea?.prioridad === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                'bg-white/10 text-white/70 border-white/20'
              }`}>
                {tarea?.prioridad || 'Cargando...'}
              </span>
              <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-1 rounded">
                Estado: {tarea?.estado}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white/90 transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-white/80 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-2">Descripción</h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {tarea?.descripcion || 'Sin descripción'}
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Comentarios</h3>
            
            {loadingComentarios ? (
              <div className="text-sm text-white/40">Cargando comentarios...</div>
            ) : (
              <div className="space-y-4">
                {comentarios?.length === 0 ? (
                  <p className="text-sm text-white/40 italic">No hay comentarios aún.</p>
                ) : (
                  comentarios?.map((comentario) => (
                    <div key={comentario.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-primary">Usuario</span>
                        <span className="text-xs text-white/40">
                          {new Date(comentario.fecha_hora).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/80 whitespace-pre-wrap">{comentario.texto}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe un comentario..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/90 focus:outline-none focus:border-primary/50 text-sm"
              disabled={agregarComentario.isPending}
            />
            <button
              type="submit"
              disabled={!nuevoComentario.trim() || agregarComentario.isPending}
              className="bg-primary text-black px-4 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {agregarComentario.isPending ? 'Enviando...' : 'Comentar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
