'use client';

// import { motion } from 'framer-motion';
import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'elevated';
  interactive?: boolean;
  className?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', interactive = false, className = '', ...props }, ref) => {
    const { 
      ...restProps 
    } = props;
    const baseClasses = 'bg-white text-gray-800 rounded-2xl border border-gray-100 backdrop-blur-sm';
    
    const variantClasses = {
      default: 'shadow-md hover:shadow-lg transition-all duration-300 border-gray-200/50',
      success: 'shadow-md hover:shadow-lg border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 hover:shadow-green-200/30 transition-all duration-300',
      warning: 'shadow-md hover:shadow-lg border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50/50 hover:shadow-yellow-300/30 transition-all duration-300', 
      elevated: 'shadow-lg hover:shadow-xl hover:shadow-yellow-400/20 bg-gradient-to-br from-white to-yellow-50/30 border-yellow-200/30 transition-all duration-300'
    };

    if (interactive) {
      return (
        <div
          ref={ref}
          className={`${baseClasses} ${variantClasses[variant]} ${className} cursor-pointer overflow-hidden hover:scale-105 transition-transform duration-200`}
          {...restProps}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...restProps}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  )
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </p>
  )
);

CardDescription.displayName = 'CardDescription';

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardContent.displayName = 'CardContent';

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);

CardFooter.displayName = 'CardFooter';

export default Card;