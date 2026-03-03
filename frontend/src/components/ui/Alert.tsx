import React from 'react';

type Variant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: Variant;
  children: React.ReactNode;
  className?: string;
}

const config: Record<Variant, { bg: string; border: string; text: string; icon: string }> = {
  success: { bg: 'bg-green-50',  border: 'border-green-200', text: 'text-green-800', icon: '✓' },
  error:   { bg: 'bg-red-50',    border: 'border-red-200',   text: 'text-red-700',   icon: '!' },
  warning: { bg: 'bg-amber-50',  border: 'border-amber-200', text: 'text-amber-800', icon: '⚠' },
  info:    { bg: 'bg-brand-50',  border: 'border-brand-200', text: 'text-brand-800', icon: 'i' },
};

const Alert: React.FC<AlertProps> = ({ variant, children, className = '' }) => {
  const c = config[variant];
  return (
    <div
      className={[
        'flex items-start gap-3 px-4 py-3 rounded-xl border text-sm font-medium',
        c.bg, c.border, c.text, className,
      ].join(' ')}
    >
      <span
        className={[
          'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
          variant === 'success' ? 'bg-green-500 text-white' :
          variant === 'error'   ? 'bg-red-500 text-white'   :
          variant === 'warning' ? 'bg-amber-500 text-white' :
          'bg-brand-500 text-white',
        ].join(' ')}
      >
        {c.icon}
      </span>
      <span className="leading-5">{children}</span>
    </div>
  );
};

export default Alert;
