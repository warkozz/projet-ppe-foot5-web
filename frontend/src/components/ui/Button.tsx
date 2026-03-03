import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'dangerGhost';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:     'bg-brand-500 hover:bg-brand-600 text-white shadow-sm hover:shadow disabled:bg-brand-300',
  secondary:   'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 shadow-sm',
  danger:      'bg-red-500 hover:bg-red-600 text-white shadow-sm disabled:bg-red-300',
  ghost:       'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900',
  outline:     'bg-transparent hover:bg-brand-50 text-brand-600 border border-brand-300 hover:border-brand-500',
  dangerGhost: 'bg-transparent hover:bg-red-50 text-red-500 hover:text-red-700',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  className = '',
  ...rest
}) => (
  <button
    disabled={disabled || loading}
    className={[
      'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150',
      'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].join(' ')}
    {...rest}
  >
    {loading && (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    )}
    {children}
  </button>
);

export default Button;
