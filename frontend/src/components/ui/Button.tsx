import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-dark-bg dark:focus:ring-offset-dark-bg disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-accent-primary text-dark-bg hover:bg-accent-primary-hover active:scale-[0.98]',
      secondary: 'bg-dark-card-elevated dark:bg-dark-card-elevated text-white dark:text-white hover:bg-dark-border dark:hover:bg-dark-border border border-dark-border dark:border-dark-border',
      outline: 'bg-transparent text-accent-primary border-2 border-accent-primary hover:bg-accent-primary/10',
      ghost: 'bg-transparent text-text-primary dark:text-text-dark-secondary hover:bg-dark-card dark:hover:bg-dark-card',
      danger: 'bg-accent-danger text-white hover:bg-accent-danger/90',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-lg',
      md: 'h-10 px-4 text-sm rounded-button',
      lg: 'h-12 px-6 text-base rounded-button',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
