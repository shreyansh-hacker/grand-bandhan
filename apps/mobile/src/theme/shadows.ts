import { ViewStyle, Platform } from 'react-native';
import { colors } from './colors';

export const shadows: Record<string, ViewStyle> = {
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,

  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,

  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },
    android: {
      elevation: 8,
    },
    default: {},
  }) as ViewStyle,

  goldGlow: Platform.select({
    ios: {
      shadowColor: colors.gold,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
    default: {},
  }) as ViewStyle,
};
