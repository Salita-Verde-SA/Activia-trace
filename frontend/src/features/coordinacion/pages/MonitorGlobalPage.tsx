import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/services/api';

// Widget component para reutilización
const StatWidget = ({ title, value, description, isLoading, colorClass }: any) => (
  <div className={`bg-white rounded-lg p-6 shadow border-l-4 ${colorClass}`}>
    <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
    <div className="mt-2 flex items-baseline">
      {isLoading ? (
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
      ) : (
        <span className="text-3xl font-bold text-gray-900">{value}</span>
      )}
    </div>
    <p className="mt-1 text-sm text-gray-600">{description}</p>
  </div>
);

export const MonitorGlobalPage: React.FC = () => {
  // Ejemplos de endpoints analíticos que la API de monitores de coordinación provee
  const { data: statsAlumnos, isLoading: isLoadingAlumnos } = useQuery({
    queryKey: ['monitor', 'alumnos-activos'],
    queryFn: async () => {
      // Mock para la UI, idealmente: await api.get('/api/v1/monitor/alumnos-activos')
      return { total: 1245, crecimiento: '+5% vs mes anterior' };
    },
    staleTime: 60000,
  });

  const { data: statsEntregas, isLoading: isLoadingEntregas } = useQuery({
    queryKey: ['monitor', 'entregas'],
    queryFn: async () => {
      return { porcentajeCorregido: 87, pendientes: 342 };
    },
    staleTime: 60000,
  });

  const { data: statsTickets, isLoading: isLoadingTickets } = useQuery({
    queryKey: ['monitor', 'tickets'],
    queryFn: async () => {
      return { abiertos: 45, criticos: 3 };
    },
    staleTime: 60000,
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Monitor Global (Admin)</h1>
        <p className="text-gray-600">Visión transversal del cuatrimestre y estado de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatWidget
          title="Alumnos Activos"
          value={statsAlumnos?.total || 0}
          description={statsAlumnos?.crecimiento || 'Actualizado hace instantes'}
          isLoading={isLoadingAlumnos}
          colorClass="border-blue-500"
        />
        
        <StatWidget
          title="Entregas Corregidas"
          value={`${statsEntregas?.porcentajeCorregido || 0}%`}
          description={`${statsEntregas?.pendientes || 0} entregas pendientes en total`}
          isLoading={isLoadingEntregas}
          colorClass="border-green-500"
        />
        
        <StatWidget
          title="Tickets Internos"
          value={statsTickets?.abiertos || 0}
          description={`${statsTickets?.criticos || 0} requieren atención urgente`}
          isLoading={isLoadingTickets}
          colorClass={statsTickets?.criticos && statsTickets.criticos > 0 ? "border-red-500" : "border-yellow-500"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4">Actividad Reciente (Auditoría)</h3>
          <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-200 rounded">
            El gráfico de actividad se renderizaría aquí
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-800 mb-4">Estado de Comisiones</h3>
          <div className="text-center text-gray-500 py-12 border-2 border-dashed border-gray-200 rounded">
            El listado de comisiones en riesgo se renderizaría aquí
          </div>
        </div>
      </div>
    </div>
  );
};
