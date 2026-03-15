'use client';

import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={clsx(
        // Base
        'inline-flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        // Variants
        variant === 'primary' && 'btn-primary',
        variant === 'outline' && 'btn-outline',
        variant === 'ghost' && 'btn-ghost',
        variant === 'danger' && 'bg-[#FF4D6A] text-white hover:bg-opacity-90',
        // Sizes
        size === 'sm' && 'px-4 py-2 text-xs',
        size === 'lg' && 'px-8 py-4 text-base',
        // Full width
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  );
}
