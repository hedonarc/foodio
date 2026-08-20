import nativewindPreset from 'nativewind/preset';

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF9800',
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF9800',
          600: '#FB8C00',
          700: '#F57C00',
          800: '#EF6C00',
          900: '#E65100',
        },
        /**
         * Mirrors `src/theme/colors.ts`. Absent until now, so every
         * `text-error-500` and `border-error-500` in the app resolved to
         * nothing and validation errors rendered in the default colour.
         */
        error: {
          DEFAULT: '#F44336',
          // Matches the warning scale. Without 100 and 700 a class like
          // `bg-error-100` resolves to nothing and renders unstyled — silently,
          // which is how it survived once already.
          100: '#FFE5E3',
          500: '#F44336',
          700: '#B3261E',
        },
        success: {
          DEFAULT: '#4CAF50',
          500: '#4CAF50',
        },
        warning: {
          DEFAULT: '#F59E0B',
          100: '#FEF3C7',
          500: '#F59E0B',
          700: '#B45309',
        },
      },
    },
  },
  plugins: [],
};

export default config;
