import { Bell, Check, Clock } from 'lucide-react';
import type { AvisoAlumno } from '../types';
import { useAckAviso } from '../hooks/useAlumno';
import { Button } from '@/shared/components/ui/Button';

export const AvisoCard = ({ aviso }: { aviso: AvisoAlumno }) => {
  const { mutate: ackAviso, isPending } = useAckAviso();

  const isAcked = !!aviso.ack_at;

  return (
    <div className={`p-4 rounded-xl border backdrop-blur-md transition-colors ${isAcked ? 'bg-white/5 border-white/5 opacity-70' : 'bg-white/10 border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]'}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${isAcked ? 'bg-white/5 text-white/40' : 'bg-primary/20 text-primary'}`}>
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`font-semibold text-lg ${isAcked ? 'text-white/50' : 'text-white/90'}`}>{aviso.titulo}</h3>
            <p className="text-sm text-white/50 mt-1 flex items-center gap-1 font-data-mono">
              <Clock className="w-3.5 h-3.5" />
              {new Date(aviso.fecha_publicacion).toLocaleDateString()}
            </p>
            <div className={`mt-3 text-sm whitespace-pre-wrap ${isAcked ? 'text-white/40' : 'text-white/70'}`}>
              {aviso.contenido}
            </div>
          </div>
        </div>
        
        {aviso.requiere_ack && !isAcked && (
          <Button
            onClick={() => ackAviso(aviso.id)}
            isLoading={isPending}
            variant="outline"
            size="sm"
            className="flex-shrink-0 ml-4"
          >
            <Check className="w-4 h-4 mr-2" />
            Marcar como leído
          </Button>
        )}
        
        {isAcked && (
          <div className="flex items-center gap-1.5 text-sm text-white/40 font-label-caps uppercase ml-4">
            <Check className="w-4 h-4" />
            Leído
          </div>
        )}
      </div>
    </div>
  );
};
