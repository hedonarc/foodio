/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#FF9800', // use oklch(0.65 0.18 45) when using tailwindcss v4.0.0 or higher
      },
    },
  },
  plugins: [],
};
