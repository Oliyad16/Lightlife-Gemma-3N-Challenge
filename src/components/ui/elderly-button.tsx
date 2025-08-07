'use client';

import { Button } from './button';
import { forwardRef } from 'react';

interface ElderlyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'ghost' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  hapticFeedback?: boolean;
  doubleConfirm?: boolean;
  confirmationDelay?: number;
}

export const ElderlyButton = forwardRef<HTMLButtonElement, ElderlyButtonProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <Button
        ref={ref}
        elderlyFriendly={true}
        hapticFeedback={true}
        size="elderly"
        className={`
          text-2xl font-bold min-h-touch-target min-w-touch-target
          focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-opacity-50
          shadow-xl hover:shadow-2xl
          ${className}
        `}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ElderlyButton.displayName = 'ElderlyButton';

export default ElderlyButton;