/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        // YouTube-inspired red / red-magenta ramp
        red: {
          50: '#fff0f2',
          100: '#ffe0e5',
          200: '#ffc2cc',
          300: '#ff8da1',
          400: '#ff4d6e',
          500: '#ff0033',
          600: '#e6002e',
          700: '#b80024',
          800: '#990020',
          900: '#80001a',
          950: '#4d0010',
        },
        // Cyan accent ramp
        cyan: {
          50: '#e9feff',
          100: '#c8fcff',
          200: '#92f9ff',
          300: '#48f3ff',
          400: '#00e5ff',
          500: '#00c8e0',
          600: '#00a4bd',
          700: '#0087a0',
          800: '#006d80',
          900: '#005868',
          950: '#003644',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease forwards',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
