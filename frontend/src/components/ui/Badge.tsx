import React from 'react';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'gray' | 'brand' | 'blue';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  green:  'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  red:    'bg-red-100 text-red-600',
  gray:   'bg-gray-100 text-gray-500',
  brand:  'bg-brand-100 text-brand-700',
  blue:   'bg-blue-100 text-blue-700',
};

const Badge: React.FC<BadgeProps> = ({ variant = 'gray', children, className = '' }) => (
  <span
    className={[
      'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variantClasses[variant],
      className,
    ].join(' ')}
  >
    {children}
  </span>
);

export default Badge;
