/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          50: '#fdfbf7',
          100: '#faf7f2',
          200: '#f2ede4',
          300: '#e5dcce',
          800: '#2c2523',
          900: '#1b1716',
        },
        royal: {
          wine: '#6e1f2f',
          'wine-dark': '#4b121e',
          'wine-deep': '#350a13',
          gold: '#c99a3e',
          'gold-light': '#dfba6a',
          'gold-champagne': '#ecd599',
          ivory: '#fcf8f0',
          blush: '#f9eee8',
          emerald: '#1b4332',
          navy: '#1d2a44',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        devanagari: ['"Noto Serif Devanagari"', '"Rozha One"', 'serif'],
        heading: ['"Playfair Display"', '"Noto Serif Devanagari"', 'serif'],
        cinzel: ['"Cinzel"', 'serif'],
        sans: ['"Montserrat"', 'system-ui', '-apple-system', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      boxShadow: {
        'book': '0 25px 50px -12px rgba(44, 18, 25, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.3)',
        'book-spine': 'inset 12px 0 18px -6px rgba(0,0,0,0.6), inset -2px 0 4px rgba(255,255,255,0.1)',
        'scroll': '0 15px 35px -5px rgba(0,0,0,0.3)',
        'card-lux': '0 10px 30px -5px rgba(44, 18, 25, 0.15), 0 0 0 1px rgba(212, 175, 55, 0.2)',
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
};
