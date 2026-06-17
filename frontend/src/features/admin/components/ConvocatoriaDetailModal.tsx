import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { obtenerAgendaConvocatoria } from '../services/adminApi';
import { Button } from '@/shared/components/ui/Button';
import type { ConvocatoriaColoquio } from '../types/coloquios';

interface ConvocatoriaDetailModalProps {
  convocatoria: ConvocatoriaColoquio;
  onClose: () => void;
}

const ConvocatoriaDetailModal: React.FC<ConvocatoriaDetailModalProps> = ({ convocatoria, onClose }) => {
  const { data: agenda, isLoading } = useQuery({
    queryKey: ['admin-agenda', convocatoria.id],
    queryFn: () => obtenerAgendaConvocatoria(convocatoria.id),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Agenda: {convocatoria.nombre}</h2>
            <p className="text-sm text-gray-500 mt-1">{convocatoria.materia_nombre}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {convocatoria.turnos?.map(turno => {
                const reservasTurno = agenda?.filter(r => r.turno_id === turno.id) || [];
                
                return (
                  <div key={turno.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          Turno: {new Date(turno.fecha_hora_inicio).toLocaleString()} a {new Date(turno.fecha_hora_fin).toLocaleTimeString()}
                        </h4>
                      </div>
                      <div className="text-sm text-gray-500">
                        Cupos: <span className="font-semibold text-gray-900 dark:text-white">{turno.cupos_ocupados}</span> / {turno.cupo_maximo}
                      </div>
                    </div>
                    
                    {reservasTurno.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alumno</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                          {reservasTurno.map((reserva: any) => (
                            <tr key={reserva.reserva_id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                {reserva.alumno_apellido}, {reserva.alumno_nombre}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {reserva.alumno_email}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {reserva.estado_reserva}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Aún no hay inscriptos en este turno.
                      </div>
                    )}
                  </div>
                );
              })}
              
              {(!convocatoria.turnos || convocatoria.turnos.length === 0) && (
                <div className="text-center text-gray-500">No hay turnos creados.</div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 shrink-0 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
};

export default ConvocatoriaDetailModal;
