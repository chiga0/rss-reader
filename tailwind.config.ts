import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6', // blue-500
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          50: '#f8f9fa',
          100: '#e7e8e9',
          200: '#d0d1d3',
          300: '#a8aaae',
          400: '#7b7d84',
          500: '#5d5f66',
          600: '#47484d',
          700: '#3a3b40',
          800: '#2d2e32',
          900: '#1f1f23',
          950: '#14141a',
        },
      },
      spacing: {
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      screens: {
        mobile: '375px',
        tablet: '768px',
        desktop: '1024px',
      },
    },
  },
  plugins: [],
} satisfies Config;
