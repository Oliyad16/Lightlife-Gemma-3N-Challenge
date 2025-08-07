'use client';

import { motion } from 'framer-motion';
import { Camera, Plus } from 'lucide-react';
import Link from 'next/link';

interface FloatingActionButtonProps {
  href?: string;
  onClick?: () => void;
  icon?: 'camera' | 'plus';
  className?: string;
  ariaLabel?: string;
}

export function FloatingActionButton({
  href = '/scan',
  onClick,
  icon = 'camera',
  className = '',
  ariaLabel = 'Scan medication'
}: FloatingActionButtonProps) {
  const IconComponent = icon === 'camera' ? Camera : Plus;
  
  const buttonContent = (
    <motion.button
      className={`
        fixed bottom-24 right-4 z-40
        w-16 h-16 bg-primary text-primary-foreground
        rounded-full shadow-lg hover:shadow-xl
        flex items-center justify-center
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 
        border-4 border-white touch-feedback
        ${className}
      `}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}
    >
      <IconComponent size={26} strokeWidth={2.5} />
      
      {/* Pulse animation for attention */}
      <motion.div
        className="absolute inset-1 rounded-full bg-primary/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0, 0.3]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );

  if (href && !onClick) {
    return (
      <Link href={href} className="inline-block">
        {buttonContent}
      </Link>
    );
  }

  return buttonContent;
}

export default FloatingActionButton;