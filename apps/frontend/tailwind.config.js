/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgba(var(--color-primary-rgb), 0.1)',
          100: 'rgba(var(--color-primary-rgb), 0.2)',
          200: 'rgba(var(--color-primary-rgb), 0.3)',
          300: 'rgba(var(--color-primary-rgb), 0.4)',
          400: 'rgba(var(--color-primary-rgb), 0.6)',
          500: 'var(--color-primary)',
          600: 'rgba(var(--color-primary-rgb), 0.8)',
          700: 'rgba(var(--color-primary-rgb), 0.9)',
          800: 'rgba(var(--color-primary-rgb), 0.95)',
          900: 'rgba(var(--color-primary-rgb), 1)',
          950: 'rgba(var(--color-primary-rgb), 1)',
        },
        secondary: {
          50: 'rgba(var(--color-secondary-rgb), 0.1)',
          100: 'rgba(var(--color-secondary-rgb), 0.2)',
          200: 'rgba(var(--color-secondary-rgb), 0.3)',
          300: 'rgba(var(--color-secondary-rgb), 0.4)',
          400: 'rgba(var(--color-secondary-rgb), 0.6)',
          500: 'var(--color-secondary)',
          600: 'rgba(var(--color-secondary-rgb), 0.8)',
          700: 'rgba(var(--color-secondary-rgb), 0.9)',
          800: 'rgba(var(--color-secondary-rgb), 0.95)',
          900: 'rgba(var(--color-secondary-rgb), 1)',
          950: 'rgba(var(--color-secondary-rgb), 1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
