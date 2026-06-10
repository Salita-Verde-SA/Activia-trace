import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title = 'Aviso',
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Decorative subtle glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/20 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <h3 className="text-xl font-serif text-white/90 mb-3">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-primary-600/80 border border-primary-500/50 text-white shadow-[0_0_15px_rgba(var(--color-primary-500),0.2)] text-sm rounded-lg hover:bg-primary-600 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
