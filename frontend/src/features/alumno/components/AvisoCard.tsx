import { Bell, Check, Clock } from 'lucide-react';
import type { AvisoAlumno } from '../types';
import { useAckAviso } from '../hooks/useAlumno';

export const AvisoCard = ({ aviso }: { aviso: AvisoAlumno }) => {
  const { mutate: ackAviso, isPending } = useAckAviso();

  const isAcked = !!aviso.ack_at;

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md transition-colors ${isAcked ? 'bg-white/5 border-white/5 opacity-70' : 'bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={`mt-1 p-2 rounded-full ${isAcked ? 'bg-white/5 text-white/40' : 'bg-primary-500/20 text-primary-400'}`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-semibold ${isAcked ? 'text-white/50' : 'text-white/90'}`}>{aviso.titulo}</h3>
            <p className="text-sm text-white/50 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(aviso.fecha_publicacion).toLocaleDateString()}
            </p>
            <div className={`mt-3 text-sm whitespace-pre-wrap ${isAcked ? 'text-white/40' : 'text-white/70'}`}>
              {aviso.contenido}
            </div>
          </div>
        </div>
        
        {aviso.requiere_ack && !isAcked && (
          <button
            onClick={() => ackAviso(aviso.id)}
            disabled={isPending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-primary-600/80 hover:bg-primary-600 rounded-md border border-primary-500/50 disabled:opacity-50 transition-colors"
          >
            <Check className="w-4 h-4" />
            Marcar como leído
          </button>
        )}
        
        {isAcked && (
          <div className="flex items-center gap-1.5 text-sm text-white/40">
            <Check className="w-4 h-4" />
            Leído
          </div>
        )}
      </div>
    </div>
  );
};
