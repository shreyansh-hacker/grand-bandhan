/**
 * Grand Bandhan Luxury Imperial Theme Palette
 * Specifically curated for high-end wedding operations, royal aesthetic,
 * and high-fidelity Imperial Glassmorphism surfaces.
 */

export const colors = {
  // Primary Imperial Palette
  imperialNavy: '#0A2540',
  imperialNavyDark: '#06182B',
  imperialNavyLight: '#143659',
  secondaryBlue: '#1E3A8A',
  royalBlue: '#2563EB',

  // Gold & Metallic Accents
  gold: '#C9A96A',
  goldLight: '#E6D6B8',
  goldDark: '#997D45',
  goldMuted: '#D9C8A5',
  goldHighlight: '#F3EAD8',

  // Neutrals & Surfaces
  cream: '#F7F4ED',
  creamWarm: '#F3EFE6',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  cardBgDark: '#0E2A47',
  surfaceDark: '#0A1E33',
  backgroundLight: '#F8F6F0',
  backgroundDark: '#061626',

  // Imperial Glassmorphism Surface Tokens
  glassNavy: 'rgba(10, 37, 64, 0.78)',
  glassNavyDark: 'rgba(6, 24, 43, 0.90)',
  glassWhite: 'rgba(255, 255, 255, 0.85)',
  glassWhiteLight: 'rgba(255, 255, 255, 0.55)',
  glassGold: 'rgba(201, 169, 106, 0.14)',
  glassGoldDeep: 'rgba(201, 169, 106, 0.25)',
  glassBorderGold: 'rgba(201, 169, 106, 0.40)',
  glassBorderLight: 'rgba(255, 255, 255, 0.28)',
  glassShine: 'rgba(255, 255, 255, 0.15)',

  // Typography
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#9CA3AF',
  textLight: '#F7F4ED',
  textGold: '#C9A96A',

  // Status & Feedback Colors (Luxury Hue Balanced)
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Borders & Dividers
  borderLight: '#E5E7EB',
  borderGold: 'rgba(201, 169, 106, 0.35)',
  borderDark: '#1E3A5F',
  divider: '#E2D9C8',
} as const;

export type ColorName = keyof typeof colors;
