/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark theme colors (GitHub Dark Default)
        dark: {
          bg: '#0D1117',
          'bg-secondary': '#010409',
          sidebar: '#0D1117',
          card: '#161B22',
          'card-elevated': '#21262D',
          border: '#30363D',
          divider: '#21262D',
        },
        // Light theme colors
        light: {
          bg: '#F5F7F8',
          surface: '#FFFFFF',
          'surface-secondary': '#F0F3F5',
          sidebar: '#FBFCFD',
          card: '#FFFFFF',
          border: '#E3E8EE',
          divider: '#D9E1E8',
        },
        // Accent colors (GitHub themed)
        accent: {
          primary: '#58A6FF',
          'primary-hover': '#1F6FEB',
          'primary-dark': '#0D419D',
          success: '#238636',
          warning: '#D29922',
          danger: '#F85149',
          info: '#58A6FF',
        },
        // Text colors (GitHub themed)
        text: {
          primary: '#121417',
          secondary: '#4C5561',
          muted: '#7A838E',
          disabled: '#66707A',
          'dark-primary': '#C9D1D9',
          'dark-secondary': '#8B949E',
          'dark-muted': '#484F58',
          'dark-disabled': '#30363D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
        input: '12px',
        chart: '16px',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.18)',
        'soft-lg': '0 8px 32px rgba(0, 0, 0, 0.24)',
        card: '0 2px 8px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.16)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
