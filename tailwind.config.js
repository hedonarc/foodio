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
      },
    },
  },
  plugins: [],
};

export default config;
