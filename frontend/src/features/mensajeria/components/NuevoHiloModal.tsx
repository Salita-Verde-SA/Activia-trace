import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { mensajeriaApi } from '../services/mensajeriaApi';

interface UsuarioItem {
  id: string;
  nombre: string;
  apellido: string;
}

interface NuevoHiloModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NuevoHiloModal({ isOpen, onClose }: NuevoHiloModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [asunto, setAsunto] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [filtro, setFiltro] = useState('');
  const [seleccionados, setSeleccionados] = useState<string[]>([]);

  const { data: usuarios = [] } = useQuery<UsuarioItem[]>({
    queryKey: ['usuarios-mensajeria'],
    queryFn: () => mensajeriaApi.getUsuariosTenant(),
    enabled: isOpen,
  });

  const mutation = useMutation({
    mutationFn: () => mensajeriaApi.iniciarHilo({
      asunto: asunto.trim() || undefined,
      mensaje_inicial: mensaje.trim(),
      destinatarios_ids: seleccionados,
    }),
    onSuccess: (hilo) => {
      queryClient.invalidateQueries({ queryKey: ['bandeja-mensajes'] });
      queryClient.invalidateQueries({ queryKey: ['no-leidos-mensajes'] });
      onClose();
      navigate(`/mensajes/${hilo.id}`);
    },
  });

  const toggleSeleccion = (id: string) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const usuariosFiltrados = usuarios.filter(u =>
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const puedeEnviar = seleccionados.length > 0 && mensaje.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-white/90 mb-4">Nuevo mensaje</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-1">
            Destinatarios <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            placeholder="Buscar usuario..."
            className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 mb-2 focus:border-primary-500 focus:outline-none text-sm"
          />
          <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border border-white/10 bg-white/5 p-2">
            {usuariosFiltrados.length === 0 && (
              <p className="text-xs text-white/40 text-center py-2">Sin resultados</p>
            )}
            {usuariosFiltrados.map(u => (
              <label key={u.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded px-1 py-0.5">
                <input
                  type="checkbox"
                  checked={seleccionados.includes(u.id)}
                  onChange={() => toggleSeleccion(u.id)}
                  className="accent-primary-500"
                />
                <span className="text-sm text-white/80">{u.nombre} {u.apellido}</span>
              </label>
            ))}
          </div>
          {seleccionados.length > 0 && (
            <p className="text-xs text-primary-400 mt-1">{seleccionados.length} seleccionado(s)</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-white/70 mb-1">Asunto (opcional)</label>
          <input
            type="text"
            value={asunto}
            onChange={e => setAsunto(e.target.value)}
            className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 focus:border-primary-500 focus:outline-none text-sm"
            placeholder="Asunto del mensaje"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-white/70 mb-1">
            Mensaje <span className="text-red-400">*</span>
          </label>
          <textarea
            value={mensaje}
            onChange={e => setMensaje(e.target.value)}
            rows={4}
            className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 focus:border-primary-500 focus:outline-none text-sm resize-none"
            placeholder="Escribí tu mensaje..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-white/10 bg-white/5 text-white/70 rounded-md hover:bg-white/10 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!puedeEnviar || mutation.isPending}
            className="px-4 py-2 bg-primary-600/80 border border-primary-500/50 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-40 text-sm"
          >
            {mutation.isPending ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}
