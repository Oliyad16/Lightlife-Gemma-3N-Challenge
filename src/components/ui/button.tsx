'use client';

// import { motion } from 'framer-motion';
import { forwardRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'elderly';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  // Accessibility enhancements for elderly users
  elderlyFriendly?: boolean;
  hapticFeedback?: boolean;
  doubleConfirm?: boolean;
  confirmationDelay?: number;
  ariaDescribedBy?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    children,
    className = '',
    disabled,
    elderlyFriendly = false,
    hapticFeedback = false,
    doubleConfirm = false,
    confirmationDelay = 0,
    ariaDescribedBy,
    ...props
  }, ref) => {
    const { 
      ...restProps 
    } = props;
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none touch-feedback';
    
    const variants = {
      primary: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-gray-800 hover:from-yellow-300 hover:via-amber-300 hover:to-yellow-400 shadow-lg hover:shadow-xl hover:shadow-yellow-400/30 border-0 font-semibold transform hover:scale-105 transition-all duration-200',
      secondary: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-gray-100 hover:to-gray-200 shadow-md hover:shadow-lg border border-gray-200 hover:border-gray-300 transform hover:scale-[1.02] transition-all duration-200',
      success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500 shadow-lg hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-200',
      warning: 'bg-gradient-to-r from-orange-400 to-red-500 text-white hover:from-orange-300 hover:to-red-400 shadow-lg hover:shadow-xl hover:shadow-orange-500/30 transform hover:scale-105 transition-all duration-200',
      ghost: 'hover:bg-yellow-50 text-gray-700 hover:text-gray-800 hover:shadow-md hover:shadow-yellow-400/20 transform hover:scale-[1.02] transition-all duration-200',
      outline: 'border-2 border-yellow-400 bg-white text-yellow-600 hover:bg-yellow-50 hover:border-yellow-500 hover:text-yellow-700 shadow-sm hover:shadow-md hover:shadow-yellow-400/20 transform hover:scale-[1.02] transition-all duration-200'
    };

    const sizes = {
      sm: 'h-10 px-4 text-sm min-w-[80px] font-medium',
      md: 'h-12 px-6 text-base min-w-[100px] font-medium',
      lg: 'h-14 px-8 text-lg min-w-[120px] font-semibold',
      xl: 'h-16 px-10 text-xl min-w-[140px] font-semibold',
      elderly: 'h-20 px-12 text-2xl min-w-[180px] font-bold'
    };

    const [isConfirming, setIsConfirming] = useState(false);
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
    
    const isDisabled = disabled || loading;
    
    // Enhanced click handler for elderly-friendly features
    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      // Prevent accidental double-clicks
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
        return;
      }
      
      // Haptic feedback for supported devices
      if (hapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50); // Short, gentle vibration
      }
      
      if (doubleConfirm && !isConfirming) {
        setIsConfirming(true);
        // Reset confirmation state after 3 seconds
        setTimeout(() => setIsConfirming(false), 3000);
        return;
      }
      
      const executeClick = () => {
              if (restProps.onClick) {
        restProps.onClick(event);
      }
        setIsConfirming(false);
      };
      
      if (confirmationDelay > 0) {
        const timeout = setTimeout(executeClick, confirmationDelay);
        setClickTimeout(timeout);
      } else {
        executeClick();
      }
    }, [confirmationDelay, doubleConfirm, hapticFeedback, isConfirming, clickTimeout, restProps]);
    
    // Apply elderly-friendly defaults
    const effectiveSize = elderlyFriendly ? 'elderly' : size;
    const effectiveClassName = elderlyFriendly 
      ? `${className} focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-opacity-50 shadow-lg`
      : className;

    return (
      <button
        ref={ref}
        className={`
          ${baseClasses}
          ${variants[variant]}
          ${sizes[effectiveSize]}
          ${fullWidth ? 'w-full' : ''}
          ${effectiveClassName}
          ${!isDisabled ? 'hover:scale-105 active:scale-95' : ''}
          transition-transform duration-200
        `}
        disabled={isDisabled}
        onClick={handleClick}
        aria-describedby={ariaDescribedBy}
        aria-pressed={isConfirming ? 'true' : undefined}
        type="button"
      >
        {loading && (
          <Loader2 className={`mr-2 ${elderlyFriendly ? 'h-6 w-6' : 'h-4 w-4'} animate-spin`} />
        )}
        {isConfirming ? 'Tap again to confirm' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;