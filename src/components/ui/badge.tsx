'use client';

import { forwardRef } from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-colors';
    
    const variants = {
      default: 'bg-primary/10 text-primary border border-primary/20',
      secondary: 'bg-secondary text-secondary-foreground border border-gray-200',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-amber-100 text-amber-800 border border-amber-200',
      destructive: 'bg-red-100 text-red-800 border border-red-200',
      outline: 'text-foreground border border-gray-200'
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base'
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;