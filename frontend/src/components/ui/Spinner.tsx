import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => (
  <div
    className={[
      'rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin',
      sizeMap[size],
      className,
    ].join(' ')}
  />
);

export default Spinner;
