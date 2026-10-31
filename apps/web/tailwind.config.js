/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A2540',
          50: '#F0F4F8',
          100: '#D9E2EC',
          200: '#BCCCDC',
          300: '#9FB3C8',
          400: '#627D98',
          500: '#486581',
          600: '#334E68',
          700: '#243B53',
          800: '#102A43',
          900: '#0A2540',
          950: '#061626',
        },
        royal: {
          DEFAULT: '#1E3A8A',
          hover: '#172554',
          light: '#3B82F6',
        },
        gold: {
          DEFAULT: '#C9A96A',
          light: '#E6D6B8',
          dark: '#9E7D3B',
          50: '#FCF9F2',
          100: '#F7F1E1',
          200: '#EEDDBA',
          300: '#E6D6B8',
          400: '#D7BE8A',
          500: '#C9A96A',
          600: '#B28E46',
          700: '#8C6C29',
          800: '#664C18',
          900: '#402E0A',
        },
        cream: {
          DEFAULT: '#F7F4ED',
          50: '#FFFFFF',
          100: '#FCFBF9',
          200: '#F7F4ED',
          300: '#EFEAE0',
          400: '#E5DEC8',
        },
        darkText: '#1F2937',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Playfair Display', 'Cinzel', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A96A 0%, #F5E8CB 50%, #B28E46 100%)',
        'navy-gradient': 'linear-gradient(145deg, #0A2540 0%, #102A43 50%, #061626 100%)',
        'royal-gradient': 'linear-gradient(135deg, #0A2540 0%, #1E3A8A 100%)',
        'cream-card': 'linear-gradient(180deg, #FFFFFF 0%, #F7F4ED 100%)',
      },
      boxShadow: {
        'gold-glow': '0 0 20px -3px rgba(201, 169, 106, 0.35)',
        'navy-deep': '0 10px 30px -5px rgba(10, 37, 64, 0.25)',
      },
    },
  },
  plugins: [],
};
