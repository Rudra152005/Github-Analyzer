import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-full flex items-center justify-center text-text-secondary dark:text-text-dark-secondary hover:bg-light-surface-secondary dark:hover:bg-dark-card transition-colors"
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5 text-accent-warning" />
        )}
      </motion.div>
    </motion.button>
  );
}
