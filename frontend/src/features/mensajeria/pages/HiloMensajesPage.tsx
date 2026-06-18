import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { mensajeriaApi } from '../services/mensajeriaApi';

export function HiloMensajesPage() {
  const { hiloId } = useParams<{ hiloId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [respuesta, setRespuesta] = useState('');

  const { data: hilo, isLoading, error } = useQuery({
    queryKey: ['hilo-mensajes', hiloId],
    queryFn: () => mensajeriaApi.getHilo(hiloId!),
    enabled: !!hiloId,
  });

  const mutation = useMutation({
    mutationFn: () => mensajeriaApi.responderHilo(hiloId!, { contenido: respuesta.trim() }),
    onSuccess: () => {
      setRespuesta('');
      queryClient.invalidateQueries({ queryKey: ['hilo-mensajes', hiloId] });
      queryClient.invalidateQueries({ queryKey: ['bandeja-mensajes'] });
      queryClient.invalidateQueries({ queryKey: ['no-leidos-mensajes'] });
    },
  });

  if (isLoading) return <div className="p-6 text-white/50">Cargando conversación...</div>;
  if (error) return (
    <div className="p-6">
      <p className="text-red-400 mb-4">No pudiste acceder a este hilo.</p>
      <button onClick={() => navigate('/mensajes')} className="text-sm text-white/50 hover:text-white/80">
        ← Volver a la bandeja
      </button>
    </div>
  );
  if (!hilo) return null;

  const participantesNombres = hilo.participantes
    .map(p => p.username)
    .join(', ');

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header del hilo */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/mensajes')}
          className="text-sm text-white/40 hover:text-white/70 transition-colors mb-3 flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Bandeja
        </button>
        <h1 className="text-2xl font-serif text-white/90">
          {hilo.asunto ?? 'Sin asunto'}
        </h1>
        <p className="text-xs text-white/40 mt-0.5">Con: {participantesNombres}</p>
      </div>

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {hilo.mensajes.length === 0 && (
          <p className="text-center text-white/30 text-sm py-8">No hay mensajes aún</p>
        )}
        {hilo.mensajes.map(msg => {
          const esPropio = msg.emisor_id === user?.id;
          return (
            <div
              key={msg.id}
              className={`flex ${esPropio ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  esPropio
                    ? 'bg-primary-500/20 border border-primary-500/30 text-white/90'
                    : 'bg-white/5 border border-white/10 text-white/80'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.contenido}</p>
                <p className={`text-[10px] mt-1 ${esPropio ? 'text-primary-300/60' : 'text-white/30'} text-right`}>
                  {new Date(msg.created_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  {new Date(msg.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Campo de respuesta */}
      <div className="border-t border-white/10 pt-4 flex gap-3">
        <textarea
          value={respuesta}
          onChange={e => setRespuesta(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && respuesta.trim()) {
              mutation.mutate();
            }
          }}
          rows={2}
          placeholder="Escribí tu respuesta... (Ctrl+Enter para enviar)"
          className="flex-1 border border-white/10 bg-white/5 text-white/90 rounded-xl px-3 py-2 focus:border-primary-500 focus:outline-none text-sm resize-none"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={!respuesta.trim() || mutation.isPending}
          className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-40 self-end text-sm"
        >
          {mutation.isPending ? '...' : 'Enviar'}
        </button>
      </div>
    </div>
  );
}
