import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-text-dark-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full h-10 px-3 rounded-input border bg-light-surface dark:bg-dark-card border-light-border dark:border-dark-border text-text-primary dark:text-white placeholder:text-text-muted dark:placeholder:text-text-dark-muted transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent',
            icon && 'pl-10',
            error && 'border-accent-danger focus:ring-accent-danger',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-accent-danger">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
