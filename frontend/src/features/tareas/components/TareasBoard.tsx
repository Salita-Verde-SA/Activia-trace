import React, { useState } from 'react';
import { useTareas } from '../hooks/useTareas';
import { EstadoTarea } from '../types';

export const TareasBoard: React.FC = () => {
  const { tareas, isLoading, error, actualizarEstado } = useTareas();
  const [draggedTareaId, setDraggedTareaId] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-gray-500">Cargando tareas...</div>;
  if (error || !tareas) return <div className="p-8 text-red-500">Error al cargar tareas</div>;

  const columnas = [
    { id: EstadoTarea.PENDING, title: 'Pendientes', color: 'bg-white/5' },
    { id: EstadoTarea.IN_PROGRESS, title: 'En Progreso', color: 'bg-blue-500/10' },
    { id: EstadoTarea.BLOCKED, title: 'Bloqueadas', color: 'bg-red-500/10' },
    { id: EstadoTarea.COMPLETED, title: 'Completadas', color: 'bg-green-500/10' },
  ];

  const handleDragStart = (e: React.DragEvent, tareaId: string) => {
    setDraggedTareaId(tareaId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, nuevoEstado: EstadoTarea) => {
    e.preventDefault();
    if (draggedTareaId) {
      const tarea = tareas.find(t => t.id === draggedTareaId);
      if (tarea && tarea.estado !== nuevoEstado) {
        await actualizarEstado.mutateAsync({
          id: draggedTareaId,
          payload: { estado: nuevoEstado }
        });
      }
      setDraggedTareaId(null);
    }
  };

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {columnas.map(col => (
        <div 
          key={col.id}
          className={`flex-1 min-w-[280px] rounded-xl p-4 ${col.color} border border-white/10 backdrop-blur-sm`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.id)}
        >
          <h3 className="font-serif text-white/90 text-lg mb-4 flex justify-between items-center">
            {col.title}
            <span className="bg-black/40 text-white/70 border border-white/10 text-xs px-2 py-1 rounded-full shadow-sm">
              {tareas.filter(t => t.estado === col.id).length}
            </span>
          </h3>
          
          <div className="space-y-3 min-h-[150px]">
            {tareas
              .filter(t => t.estado === col.id)
              .map(tarea => (
                <div
                  key={tarea.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tarea.id)}
                  className="bg-black/20 p-3 rounded-lg border border-white/10 cursor-move hover:bg-white/5 transition-colors backdrop-blur-md"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded border ${
                      tarea.prioridad === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      tarea.prioridad === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-white/10 text-white/70 border-white/20'
                    }`}>
                      {tarea.prioridad}
                    </span>
                  </div>
                  <h4 className="font-semibold text-white/90 text-sm mb-1">{tarea.titulo}</h4>
                  {tarea.descripcion && (
                    <p className="text-xs text-white/60 line-clamp-2">{tarea.descripcion}</p>
                  )}
                  <div className="mt-3 flex justify-between items-center text-xs text-white/40">
                    <span>{new Date(tarea.fecha_creacion).toLocaleDateString()}</span>
                    <span>{tarea.comentarios?.length || 0} msjs</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};
