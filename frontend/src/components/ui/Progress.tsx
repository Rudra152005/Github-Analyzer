import { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export default function Progress({
  className,
  value,
  max = 100,
  size = 'md',
  showValue = false,
  variant = 'default',
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    default: 'bg-accent-primary',
    success: 'bg-accent-success',
    warning: 'bg-accent-warning',
    danger: 'bg-accent-danger',
  };

  return (
    <div className={cn('relative', className)} {...props}>
      <div className={cn(
        'w-full rounded-full bg-light-border dark:bg-dark-border overflow-hidden',
        sizes[size]
      )}>
        <motion.div
          className={cn('h-full rounded-full', variants[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      {showValue && (
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-medium text-text-secondary dark:text-text-dark-secondary pl-2">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
