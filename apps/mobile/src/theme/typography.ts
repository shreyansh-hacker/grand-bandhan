import { TextStyle } from 'react-native';
import { colors } from './colors';

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    serif: 'serif',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 30,
    display: 36,
  },
  lineHeight: {
    xs: 15,
    sm: 18,
    base: 22,
    md: 24,
    lg: 26,
    xl: 28,
    xxl: 32,
    xxxl: 38,
    display: 44,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};

export const textVariants: Record<string, TextStyle> = {
  display: {
    fontSize: typography.fontSize.display,
    lineHeight: typography.lineHeight.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    letterSpacing: -0.5,
  },
  h1: {
    fontSize: typography.fontSize.xxxl,
    lineHeight: typography.lineHeight.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    letterSpacing: -0.3,
  },
  h2: {
    fontSize: typography.fontSize.xxl,
    lineHeight: typography.lineHeight.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  h3: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  body: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textPrimary,
  },
  bodyBold: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
  },
  badge: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.xs,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  goldHeader: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
};
