import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full h-10 px-3 rounded-input border bg-light-surface dark:bg-dark-card border-light-border dark:border-dark-border flex items-center justify-between transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary',
          isOpen && 'ring-2 ring-accent-primary'
        )}
      >
        <span className={cn(
          'text-sm',
          selectedOption ? 'text-text-primary dark:text-white' : 'text-text-muted dark:text-text-dark-muted'
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className={cn(
          'w-4 h-4 text-text-muted dark:text-text-dark-muted transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-light-surface dark:bg-dark-card-elevated border border-light-border dark:border-dark-border rounded-input shadow-soft-lg z-50 overflow-hidden"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left transition-colors hover:bg-light-surface-secondary dark:hover:bg-dark-card',
                  option.value === value && 'text-accent-primary bg-accent-primary/5'
                )}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
