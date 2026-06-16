/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // supports class-based dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          50: '#f6f6f7',
          100: '#eef0f2',
          200: '#d5dae1',
          300: '#adc8d6',
          400: '#8ba2b5',
          500: '#657d93',
          600: '#475e75',
          700: '#314457',
          800: '#1f2e3e',
          900: '#0f172a', // slate-900 (ultra dark slate)
          950: '#030712', // slate-950 (pure deep dark)
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Indigo-500 (premium violet blue)
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          purple: '#8b5cf6', // Violet
          teal: '#14b8a6',   // Teal
          pink: '#ec4899',   // Pink
          orange: '#f97316'  // Orange
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass-light': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
