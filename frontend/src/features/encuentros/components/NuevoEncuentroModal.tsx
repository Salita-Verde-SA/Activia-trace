import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { encuentrosApi } from '../services/encuentrosApi';
import type { DiaSemana } from '../types';

const DIAS: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface AsignacionItem {
  asignacion_id: string;
  usuario_nombre: string;
  usuario_apellido: string;
  rol_nombre: string;
}

interface NuevoEncuentroModalProps {
  isOpen: boolean;
  onClose: () => void;
  materiaId: string;
  asignaciones: AsignacionItem[];
  queryKey: unknown[];
}

export function NuevoEncuentroModal({
  isOpen,
  onClose,
  materiaId,
  asignaciones,
  queryKey,
}: NuevoEncuentroModalProps) {
  const queryClient = useQueryClient();
  const [tipo, setTipo] = useState<'unico' | 'recurrente'>('unico');
  const [titulo, setTitulo] = useState('');
  const [hora, setHora] = useState('');
  const [meetUrl, setMeetUrl] = useState('');
  const [asignacionId, setAsignacionId] = useState(asignaciones[0]?.asignacion_id ?? '');
  // Único
  const [fechaUnica, setFechaUnica] = useState('');
  // Recurrente
  const [diaSemana, setDiaSemana] = useState<DiaSemana>('Lunes');
  const [fechaInicio, setFechaInicio] = useState('');
  const [cantSemanas, setCantSemanas] = useState(4);

  const mutation = useMutation({
    mutationFn: () =>
      encuentrosApi.crearEncuentro(asignacionId, {
        materia_id: materiaId,
        titulo: titulo.trim(),
        hora,
        meet_url: meetUrl.trim() || undefined,
        ...(tipo === 'unico'
          ? { cant_semanas: 0, fecha_unica: fechaUnica }
          : { cant_semanas: cantSemanas, dia_semana: diaSemana, fecha_inicio: fechaInicio }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      onClose();
    },
  });

  const puedeEnviar =
    titulo.trim() &&
    hora &&
    asignacionId &&
    (tipo === 'unico' ? !!fechaUnica : !!(fechaInicio && cantSemanas > 0));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-xl">
        <h3 className="text-xl font-bold text-white/90 mb-4">Nuevo encuentro</h3>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['unico', 'recurrente'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`py-2 rounded-lg text-sm border transition-colors ${
                tipo === t
                  ? 'bg-primary-600/80 border-primary-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              {t === 'unico' ? 'Único' : 'Recurrente'}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          <div>
            <label className="block text-sm text-white/70 mb-1">Docente asignado <span className="text-red-400">*</span></label>
            <select
              value={asignacionId}
              onChange={e => setAsignacionId(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              {asignaciones.map(a => (
                <option key={a.asignacion_id} value={a.asignacion_id} className="bg-neutral-900">
                  {a.usuario_apellido}, {a.usuario_nombre} — {a.rol_nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Título <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ej: Clase teórica N°1"
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-white/70 mb-1">Hora <span className="text-red-400">*</span></label>
            <input
              type="time"
              value={hora}
              onChange={e => setHora(e.target.value)}
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>

          {tipo === 'unico' ? (
            <div>
              <label className="block text-sm text-white/70 mb-1">Fecha <span className="text-red-400">*</span></label>
              <input
                type="date"
                value={fechaUnica}
                onChange={e => setFechaUnica(e.target.value)}
                className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white/70 mb-1">Día <span className="text-red-400">*</span></label>
                  <select
                    value={diaSemana}
                    onChange={e => setDiaSemana(e.target.value as DiaSemana)}
                    className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  >
                    {DIAS.map(d => (
                      <option key={d} value={d} className="bg-neutral-900">{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1">Semanas <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={cantSemanas}
                    onChange={e => setCantSemanas(Number(e.target.value))}
                    className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1">Fecha de inicio <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm text-white/70 mb-1">URL de Meet (opcional)</label>
            <input
              type="url"
              value={meetUrl}
              onChange={e => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full border border-white/10 bg-white/5 text-white/90 rounded-md px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
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
            {mutation.isPending ? 'Creando...' : 'Crear encuentro'}
          </button>
        </div>
      </div>
    </div>
  );
}
