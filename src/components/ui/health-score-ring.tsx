'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface HealthScoreRingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAnimation?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24', 
  lg: 'w-32 h-32',
  xl: 'w-40 h-40'
};

const strokeWidths = {
  sm: 3,
  md: 4,
  lg: 6,
  xl: 8
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
  xl: 'text-xl'
};

export function HealthScoreRing({ 
  score, 
  maxScore = 100, 
  size = 'lg',
  showAnimation = true,
  className = ''
}: HealthScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Calculate dimensions
  const radius = size === 'sm' ? 26 : size === 'md' ? 38 : size === 'lg' ? 50 : 62;
  const strokeWidth = strokeWidths[size];
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  // Calculate percentage and stroke offset
  const percentage = (score / maxScore) * 100;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on score - green for good health
  const getColor = (currentScore: number) => {
    if (currentScore >= 85) return '#10b981'; // Green - Excellent
    if (currentScore >= 70) return '#F59E0B'; // Amber - Good  
    if (currentScore >= 50) return '#FF9800'; // Orange - Fair
    return '#FF6B6B'; // Red - Needs Improvement
  };

  // Animate score on mount
  useEffect(() => {
    if (showAnimation) {
      const timer = setTimeout(() => {
        setAnimatedScore(score);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setAnimatedScore(score);
    }
  }, [score, showAnimation]);

  const displayScore = showAnimation ? animatedScore : score;
  const currentColor = getColor(displayScore);

  return (
    <div className={`relative health-ring ${sizeClasses[size]} ${className}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="#E0E0E0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        
        {/* Progress circle */}
        <motion.circle
          stroke={currentColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          animate={{
            strokeDashoffset: showAnimation ? strokeDashoffset : circumference - ((displayScore / maxScore) * circumference)
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut"
          }}
        />
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className={`font-semibold ${textSizes[size]} leading-none`}
          style={{ color: currentColor }}
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {Math.round(displayScore)}
        </motion.span>
        <span className={`text-muted-foreground ${size === 'sm' ? 'text-[10px]' : size === 'md' ? 'text-xs' : 'text-sm'} leading-none mt-0.5`}>
          Score
        </span>
      </div>
    </div>
  );
}

interface ProgressRingProps {
  progress: number;
  maxProgress?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  className?: string;
}

export function ProgressRing({
  progress,
  maxProgress = 100,
  size = 'md',
  color = '#FBD24D',
  label,
  className = ''
}: ProgressRingProps) {
  const radius = size === 'sm' ? 20 : size === 'md' ? 30 : 40;
  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percentage = (progress / maxProgress) * 100;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        <circle
          stroke="#E0E0E0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <motion.circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>
      
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'}`}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

export default HealthScoreRing;