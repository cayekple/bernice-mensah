/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx,html}',
    './public/index.html'
  ],
  theme: {
    extend: {
      colors: {
        // Core funeral palette
        primary: '#1a1a2e', // deep navy/charcoal
        accent: '#C88F4B', // warm bronze/gold
        cream: '#f5f5f0', // soft off-white

        // Expanded semantic palette for funeral
        secondary: '#4a4a5e', // slate gray
        blush: '#d4c5d8', // soft lavender
        peach: '#c9b8a8', // muted beige
        gold: '#8b7355', // subdued bronze
        sage: '#8b9a88', // muted sage green
        lavender: '#9b8fa8', // gentle purple-gray
        sky: '#a8b5c8', // muted blue-gray
        navy: '#2c2c44', // deep navy
        slate: '#5a5a6e', // darker slate
      },
      fontFamily: {
        display: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
        body: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
};