import React, { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-label-caps text-label-caps uppercase tracking-widest rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-noir disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "bg-primary text-black hover:bg-primary/90 shadow-[0_0_15px_rgba(242,202,80,0.15)] hover:shadow-[0_0_25px_rgba(242,202,80,0.3)] border border-transparent focus:ring-primary/50",
      secondary: "bg-white/10 text-alabaster hover:bg-white/20 border border-white/5 hover:border-white/10 focus:ring-white/30",
      outline: "bg-transparent text-primary hover:bg-primary/10 border border-primary/50 hover:border-primary focus:ring-primary/50",
      ghost: "bg-transparent text-on-surface hover:text-white hover:bg-white/5 border border-transparent focus:ring-white/20",
      danger: "bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 focus:ring-red-500/50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-3 text-sm",
      lg: "px-6 py-4 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
