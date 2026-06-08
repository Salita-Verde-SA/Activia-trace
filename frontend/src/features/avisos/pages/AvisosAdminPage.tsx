import React, { useState } from 'react';
import { useAvisos } from '../hooks/useAvisos';
import { AvisosForm } from '../components/AvisosForm';
import { AckTracker } from '../components/AckTracker';

export const AvisosAdminPage: React.FC = () => {
  const { avisos, isLoading, error } = useAvisos();
  const [showForm, setShowForm] = useState(false);
  const [selectedAvisoId, setSelectedAvisoId] = useState<string | null>(null);

  if (isLoading) return <div className="p-8 text-gray-500">Cargando avisos...</div>;
  if (error) return <div className="p-8 text-red-500">Error al cargar avisos</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Avisos Institucionales</h1>
          <p className="text-gray-600">Gestión de comunicados y notificaciones</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700"
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
              <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300 text-gray-500">
                No hay avisos publicados.
              </div>
            ) : (
              avisos.map((aviso) => (
                <div 
                  key={aviso.id} 
                  className={`bg-white p-5 rounded-lg border cursor-pointer transition-colors ${
                    selectedAvisoId === aviso.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setSelectedAvisoId(aviso.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{aviso.titulo}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      aviso.severidad === 'urgent' ? 'bg-red-100 text-red-800' :
                      aviso.severidad === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {aviso.severidad}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">{aviso.cuerpo}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Alcance: {aviso.alcance}</span>
                    <span>{new Date(aviso.fecha_inicio).toLocaleDateString()}</span>
                  </div>
                  {aviso.requiere_ack && (
                    <div className="mt-3 text-xs font-medium text-blue-600">
                      ▶ Requiere confirmación de lectura
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          <div>
            {selectedAvisoId ? (
              <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
                <h3 className="font-bold text-lg mb-4">Detalles del Aviso</h3>
                <AckTracker avisoId={selectedAvisoId} />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 text-center text-gray-500 text-sm">
                Seleccioná un aviso para ver sus métricas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
