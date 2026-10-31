/**
 * Grand Bandhan Imperial Luxury Theme Design Tokens
 */
export const imperialTheme = {
  colors: {
    primaryNavy: '#0A2540',
    secondaryBlue: '#1E3A8A',
    accentGold: '#C9A96A',
    lightGold: '#E6D6B8',
    backgroundCream: '#F7F4ED',
    darkText: '#1F2937',
    mutedCream: '#EAE5D9',
  },
  typography: {
    serif: 'var(--font-serif), "Playfair Display", Georgia, serif',
    sans: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
  },
  transitions: {
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    spring: { type: 'spring', stiffness: 300, damping: 25 },
  },
};

export default imperialTheme;
