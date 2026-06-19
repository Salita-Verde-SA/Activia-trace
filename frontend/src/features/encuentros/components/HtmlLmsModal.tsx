import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { encuentrosApi } from '../services/encuentrosApi';

interface Props {
  materiaId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function HtmlLmsModal({ materiaId, isOpen, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const { data: html, isLoading, error } = useQuery({
    queryKey: ['encuentros-html', materiaId],
    queryFn: () => encuentrosApi.getEncuentrosHtml(materiaId),
    enabled: isOpen && !!materiaId,
  });

  const handleCopy = async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-serif text-white/90">Exportar para LMS</h2>
            <p className="text-xs text-white/40 mt-0.5">Copiá el HTML para pegarlo en Moodle u otro LMS</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 gap-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/40" />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              Error al cargar el HTML del cronograma.
            </p>
          )}

          {html && (
            <textarea
              readOnly
              value={html}
              className="flex-1 min-h-48 bg-black/30 border border-white/10 text-white/70 text-xs font-mono rounded-lg p-3 resize-none focus:outline-none"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={handleCopy}
            disabled={!html || isLoading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600/80 hover:bg-primary-600 border border-primary-500/50 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-base">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? '¡Copiado!' : 'Copiar HTML'}
          </button>
        </div>
      </div>
    </div>
  );
}
