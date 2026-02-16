/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
        colors: {
          pink: {
            50: '#fff0f6',
            100: '#ffe4ef',
            200: '#ffb6d9',
            300: '#ff7eb9',
            400: '#ff49a6',
            500: '#e1306c',
            600: '#c81e5c',
            700: '#a61c4d',
            800: '#861944',
            900: '#70163a',
          },
          purple: {
            50: '#f3e8ff',
            100: '#e9d5ff',
            200: '#d8b4fe',
            300: '#c084fc',
            400: '#a855f7',
            500: '#9333ea',
            600: '#7e22ce',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
          },
          mint: {
            50: '#f0fff4',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
          },
          gold: {
            50: '#fffbe6',
            100: '#fff3c4',
            200: '#ffe066',
            300: '#ffd700',
            400: '#ffc300',
            500: '#ffb300',
            600: '#ff9900',
            700: '#ff8000',
            800: '#cc6600',
            900: '#b38600',
          },
          pastel: {
            50: '#fce7f3',
            100: '#fbcfe8',
            200: '#f9a8d4',
            300: '#f472b6',
            400: '#e879f9',
            500: '#a7f3d0',
            600: '#6ee7b7',
            700: '#34d399',
            800: '#fef9c3',
            900: '#fde68a',
          },
          primary: '#ff49a6', // Hot pink
          secondary: '#a855f7', // Purple
          accent: '#ffd700', // Gold
          background: '#fff0f6', // Pastel pink
          surface: '#f3e8ff', // Pastel purple
          text: '#70163a', // Deep pink
        },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
