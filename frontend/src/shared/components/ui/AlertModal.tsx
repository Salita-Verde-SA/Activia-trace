import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'info' | 'success';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title = 'Aviso',
  message,
  type = 'error',
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to ensure the element is in the DOM before animating opacity/transform
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const typeConfig = {
    error: {
      icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
      bgGlow: 'bg-red-500/20',
      border: 'border-red-500/30',
      buttonBg: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30',
      titleColor: 'text-red-300'
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
      bgGlow: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      buttonBg: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30',
      titleColor: 'text-amber-300'
    },
    info: {
      icon: <Info className="w-6 h-6 text-blue-400" />,
      bgGlow: 'bg-blue-500/20',
      border: 'border-blue-500/30',
      buttonBg: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30',
      titleColor: 'text-blue-300'
    },
    success: {
      icon: <Info className="w-6 h-6 text-emerald-400" />,
      bgGlow: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      buttonBg: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30',
      titleColor: 'text-emerald-300'
    }
  };

  const config = typeConfig[type];

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ease-out
        ${isVisible ? 'bg-black/60 backdrop-blur-sm opacity-100' : 'bg-black/0 backdrop-blur-none opacity-0'}
      `}
    >
      {/* Backdrop click handler */}
      <div className="absolute inset-0" onClick={onClose} />

      <div 
        className={`relative w-full max-w-md bg-neutral-900/90 border ${config.border} rounded-2xl p-6 shadow-2xl overflow-hidden transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}
        `}
      >
        {/* Decorative background glow */}
        <div className={`absolute -top-12 -right-12 w-40 h-40 ${config.bgGlow} blur-[50px] rounded-full pointer-events-none transition-colors duration-500`} />
        
        {/* Close button (top right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <div className="flex items-start gap-4 mb-2">
            <div className={`p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md shadow-inner`}>
              {config.icon}
            </div>
            <div className="pt-1 flex-1">
              <h3 className={`text-xl font-serif tracking-wide ${config.titleColor} mb-1`}>{title}</h3>
            </div>
          </div>
          
          <div className="pl-16">
            <p className="text-white/70 text-sm leading-relaxed mb-8">
              {message}
            </p>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2 border text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-${type}-500/50 ${config.buttonBg}`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
