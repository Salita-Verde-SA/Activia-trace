import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createLote } from '../services/comunicacionesApi';
import type { ComunicacionCreate } from '../types';

const inputCls = 'w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-white/20';
const labelCls = 'block text-sm font-medium text-white/70 mb-1';

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map(e => e.trim())
    .filter(e => e.includes('@'));
}

type Step = 'compose' | 'success';

export function ComunicacionesPage() {
  const [step, setStep] = useState<Step>('compose');
  const [destinatariosRaw, setDestinatariosRaw] = useState('');
  const [asunto, setAsunto] = useState('');
  const [cuerpo, setCuerpo] = useState('');
  const [loteId, setLoteId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const emails = parseEmails(destinatariosRaw);

  const preview = cuerpo
    .replace(/\{\{nombre\}\}/g, 'Juan')
    .replace(/\{\{apellido\}\}/g, 'Pérez');

  const mutation = useMutation({
    mutationFn: (comunicaciones: ComunicacionCreate[]) =>
      createLote({ comunicaciones }),
    onSuccess: (id: string) => {
      setLoteId(id);
      setStep('success');
    },
    onError: () => {
      setErrorMsg('No se pudo enviar el lote. Verificá los destinatarios e intentá de nuevo.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (emails.length === 0) {
      setErrorMsg('Agregá al menos un destinatario válido.');
      return;
    }
    const comunicaciones: ComunicacionCreate[] = emails.map(email => ({
      destinatario: email,
      asunto,
      cuerpo,
    }));
    mutation.mutate(comunicaciones);
  };

  const handleReset = () => {
    setStep('compose');
    setDestinatariosRaw('');
    setAsunto('');
    setCuerpo('');
    setLoteId('');
    setErrorMsg('');
    mutation.reset();
  };

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-serif text-white/90">Comunicaciones</h1>
        </div>
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-green-400">mark_email_read</span>
          <div>
            <h2 className="text-xl font-serif text-white/90">Lote enviado para aprobación</h2>
            <p className="text-sm text-white/50 mt-1">
              Tu mensaje fue encolado y está esperando aprobación del coordinador.
            </p>
          </div>
          <div className="bg-black/20 border border-white/10 rounded-lg px-4 py-3 inline-block">
            <p className="text-xs text-white/40 mb-0.5">ID del lote</p>
            <p className="font-mono text-sm text-white/70">{loteId}</p>
          </div>
          <div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600/80 hover:bg-primary-600 border border-primary-500/50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Nuevo mensaje
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-serif text-white/90">Comunicaciones</h1>
        <p className="mt-1 text-sm text-white/50">
          Redactá un mensaje para tus alumnos. Quedará pendiente de aprobación del coordinador antes de enviarse.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda — formulario */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Redactar</h2>

          {/* Destinatarios */}
          <div>
            <label className={labelCls}>
              Destinatarios
              {emails.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-primary-600/30 border border-primary-500/30 text-primary-300 text-xs rounded-full">
                  {emails.length}
                </span>
              )}
            </label>
            <textarea
              rows={4}
              value={destinatariosRaw}
              onChange={e => setDestinatariosRaw(e.target.value)}
              placeholder={"alumno1@ejemplo.com\nalumno2@ejemplo.com\n..."}
              className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-white/20 resize-none font-mono"
            />
            <p className="mt-1 text-xs text-white/30">Separados por salto de línea, coma o punto y coma.</p>
          </div>

          {/* Asunto */}
          <div>
            <label className={labelCls}>Asunto</label>
            <input
              type="text"
              value={asunto}
              onChange={e => setAsunto(e.target.value)}
              required
              placeholder="Aviso importante sobre tu desempeño..."
              className={inputCls}
            />
          </div>

          {/* Cuerpo */}
          <div>
            <label className={labelCls}>Mensaje</label>
            <textarea
              rows={8}
              value={cuerpo}
              onChange={e => setCuerpo(e.target.value)}
              required
              placeholder={"Hola {{nombre}},\n\nTe escribimos para informarte que..."}
              className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder:text-white/20 resize-none"
            />
            <p className="mt-1 text-xs text-white/30">
              Podés usar <span className="font-mono text-white/40">{'{{nombre}}'}</span> y <span className="font-mono text-white/40">{'{{apellido}}'}</span> como variables.
            </p>
          </div>

          {errorMsg && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending || !asunto || !cuerpo || emails.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600/80 hover:bg-primary-600 border border-primary-500/50 text-white rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {mutation.isPending && (
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            <span className="material-symbols-outlined text-base">send</span>
            {mutation.isPending
              ? 'Enviando...'
              : `Enviar a ${emails.length > 0 ? emails.length : '—'} destinatario${emails.length !== 1 ? 's' : ''}`}
          </button>
        </div>

        {/* Columna derecha — preview */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Vista previa</h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-white/40 mb-1">Para</p>
              {emails.length === 0 ? (
                <p className="text-sm text-white/20 italic">Sin destinatarios</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {emails.slice(0, 20).map(e => (
                    <span key={e} className="px-2 py-0.5 bg-white/10 border border-white/10 text-white/60 text-xs rounded-full font-mono">
                      {e}
                    </span>
                  ))}
                  {emails.length > 20 && (
                    <span className="px-2 py-0.5 text-white/30 text-xs">+{emails.length - 20} más</span>
                  )}
                </div>
              )}
            </div>

            <hr className="border-white/10" />

            <div>
              <p className="text-xs text-white/40 mb-1">Asunto</p>
              <p className="text-sm text-white/80">
                {asunto || <span className="text-white/20 italic">Sin asunto</span>}
              </p>
            </div>

            <hr className="border-white/10" />

            <div>
              <p className="text-xs text-white/40 mb-1">Mensaje (ejemplo con Juan Pérez)</p>
              <div className="bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white/70 whitespace-pre-wrap min-h-32">
                {preview || <span className="text-white/20 italic">Escribí el mensaje para ver la vista previa...</span>}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-start gap-2 text-xs text-white/40">
              <span className="material-symbols-outlined text-sm text-yellow-400/70 mt-0.5">info</span>
              El mensaje quedará <strong className="text-white/60">Pendiente</strong> hasta que el coordinador lo apruebe. Una vez aprobado, el sistema lo envía automáticamente.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
