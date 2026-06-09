import { Bell, Check, Clock } from 'lucide-react';
import type { AvisoAlumno } from '../types';
import { useAckAviso } from '../hooks/useAlumno';

export const AvisoCard = ({ aviso }: { aviso: AvisoAlumno }) => {
  const { mutate: ackAviso, isPending } = useAckAviso();

  const isAcked = !!aviso.ack_at;

  return (
    <div className={`p-4 rounded-lg border shadow-sm transition-colors ${isAcked ? 'bg-gray-50 border-gray-200' : 'bg-white border-primary-200'}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={`mt-1 p-2 rounded-full ${isAcked ? 'bg-gray-100 text-gray-400' : 'bg-primary-100 text-primary-600'}`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-semibold ${isAcked ? 'text-gray-600' : 'text-gray-900'}`}>{aviso.titulo}</h3>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(aviso.fecha_publicacion).toLocaleDateString()}
            </p>
            <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
              {aviso.contenido}
            </div>
          </div>
        </div>
        
        {aviso.requiere_ack && !isAcked && (
          <button
            onClick={() => ackAviso(aviso.id)}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md disabled:opacity-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            Marcar como leído
          </button>
        )}
        
        {isAcked && (
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Check className="w-4 h-4" />
            Leído
          </div>
        )}
      </div>
    </div>
  );
};
