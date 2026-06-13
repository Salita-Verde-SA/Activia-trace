import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2" htmlFor={props.id || props.name}>
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`block w-full rounded-2xl bg-white/5 border px-4 py-3 text-sm text-alabaster shadow-inner placeholder-on-surface-variant/50 focus:bg-white/10 focus:outline-none focus:ring-1 transition-all duration-300 ${
              error 
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500' 
                : 'border-white/10 focus:border-primary focus:ring-primary'
            } ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400 font-body-sm animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
