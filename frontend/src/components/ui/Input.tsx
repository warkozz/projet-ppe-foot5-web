import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className = '', ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    return (
      <div>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder-gray-400 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition',
            error ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 hover:border-gray-300',
            className,
          ].join(' ')}
          {...rest}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        {!error && hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
