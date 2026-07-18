import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export default function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

  const variants = {
    default: 'bg-dark-card-elevated dark:bg-dark-card-elevated text-text-primary dark:text-white border border-dark-border dark:border-dark-border',
    success: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20',
    warning: 'bg-accent-warning/10 text-accent-warning border border-accent-warning/20',
    danger: 'bg-accent-danger/10 text-accent-danger border border-accent-danger/20',
    info: 'bg-accent-info/10 text-accent-info border border-accent-info/20',
    outline: 'bg-transparent text-text-secondary dark:text-text-dark-secondary border border-light-border dark:border-dark-border',
  };

  const sizes = {
    sm: 'h-5 px-2 text-xs',
    md: 'h-6 px-2.5 text-xs',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
