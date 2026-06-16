import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isDestructive = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl transition-all">
        <div className="p-6">
          <h3 className="text-lg font-medium text-white mb-2">
            {title}
          </h3>
          <p className="text-sm text-white/70">
            {message}
          </p>
        </div>
        
        <div className="bg-black/20 px-6 py-4 flex justify-end space-x-3 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 shadow-sm hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-colors ${
              isDestructive 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 focus:ring-red-500' 
                : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
