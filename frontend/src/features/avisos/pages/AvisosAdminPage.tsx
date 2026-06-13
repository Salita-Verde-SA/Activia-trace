import React, { useState } from 'react';
import { useTodosAvisos } from '../hooks/useAvisos';
import { useRoles } from '../hooks/useRoles';
import { AvisosForm } from '../components/AvisosForm';
import { AckTracker } from '../components/AckTracker';

export const AvisosAdminPage: React.FC = () => {
  const { data: avisos, isLoading, error } = useTodosAvisos();
  const { data: roles } = useRoles();
  const [showForm, setShowForm] = useState(false);
  const [selectedAvisoId, setSelectedAvisoId] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-gray-500">Cargando avisos...</div>;
  if (error) return <div className="p-8 text-red-500">Error al cargar avisos</div>;

  const getAlcanceDisplay = (aviso: any) => {
    if (aviso.alcance === 'ROL' && aviso.rol_id && roles) {
      const role = roles.find(r => r.id === aviso.rol_id);
      return `Rol: ${role ? role.nombre : 'Desconocido'}`;
    }
    return `Alcance: ${aviso.alcance}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Avisos Institucionales</h1>
          <p className="text-white/70">Gestión de comunicados y notificaciones</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600/80 border border-primary-500/50 text-white px-4 py-2 rounded-md shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] hover:bg-primary-600 transition-colors"
        >
          {showForm ? 'Volver a la lista' : 'Nuevo Aviso'}
        </button>
      </div>

      {showForm ? (
        <AvisosForm 
          onCancel={() => setShowForm(false)} 
          onSuccess={() => setShowForm(false)} 
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {!avisos || avisos.length === 0 ? (
              <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border border-dashed border-white/20 text-white/50">
                No hay avisos publicados.
              </div>
            ) : (
              avisos.map((aviso) => (
                <div 
                  key={aviso.id} 
                  className={`bg-white/5 backdrop-blur-md p-5 rounded-xl border cursor-pointer transition-colors hover:bg-white/10 ${
                    selectedAvisoId === aviso.id ? 'border-primary-500 ring-1 ring-primary-500/50' : 'border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setSelectedAvisoId(aviso.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-lg text-white/90">{aviso.titulo}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded border ${
                      aviso.severidad === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      aviso.severidad === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {aviso.severidad}
                    </span>
                  </div>
                  <p className="text-white/70 text-sm line-clamp-2 mb-3">{aviso.cuerpo}</p>
                  <div className="flex justify-between text-xs text-white/50">
                    <span>{getAlcanceDisplay(aviso)}</span>
                    <span>{new Date(aviso.fecha_inicio).toLocaleDateString()}</span>
                  </div>
                  {aviso.requiere_ack && (
                    <div className="mt-3 text-xs font-medium text-primary-400">
                      ▶ Requiere confirmación de lectura
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div>
            {selectedAvisoId ? (
              <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-5 sticky top-6">
                <h3 className="font-serif text-lg text-white/90 mb-4">Detalles del Aviso</h3>
                <AckTracker avisoId={selectedAvisoId} />
              </div>
            ) : (
              <div className="bg-black/20 rounded-xl border border-white/10 p-5 text-center text-white/50 text-sm backdrop-blur-md">
                Seleccioná un aviso para ver sus métricas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
