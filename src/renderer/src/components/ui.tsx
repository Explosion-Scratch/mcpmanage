import React from 'react';
import { cn } from '../lib/utils';
import { Box } from 'lucide-react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
  }
>(({ className, variant = 'secondary', size = 'md', children, ...props }, ref) => {
  const variants = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm border-transparent',
    secondary: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 border-transparent',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100',
  };
  const sizes = {
    sm: 'h-7 px-2 text-xs',
    md: 'h-8 px-3 text-sm',
    lg: 'h-10 px-4 text-sm',
    icon: 'h-7 w-7 p-0 flex items-center justify-center',
  };
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-gray-900/10 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
Button.displayName = 'Button';

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-8 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';

export const Label = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={cn('text-xs font-medium text-gray-700 mb-1.5 block', className)}>
    {children}
  </label>
);

export const Switch = ({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={cn(
      'relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
      checked ? 'bg-green-500' : 'bg-gray-200',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        checked ? 'translate-x-3' : 'translate-x-0'
      )}
    />
  </button>
);

export const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600',
      className
    )}
  >
    {children}
  </span>
);

export const ServerIcon = ({
  url,
  className,
}: {
  url?: string;
  className?: string;
}) => {
  if (url) {
    return (
      <img
        src={url}
        alt=""
        className={cn('w-5 h-5 object-contain', className)}
        onError={(e) => (e.currentTarget.style.display = 'none')}
      />
    );
  }
  return <Box className={cn('w-5 h-5 text-gray-400', className)} />;
};

