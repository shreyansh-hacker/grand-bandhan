import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

export interface ImperialCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'goldAccent' | 'navySurface' | 'glassNavy' | 'glassLight' | 'glassGold';
  padding?: keyof typeof spacing;
}

export const ImperialCard: React.FC<ImperialCardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 'base',
}) => {
  const getCardStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
    };

    switch (variant) {
      case 'outlined':
        return {
          ...base,
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.borderLight,
        };
      case 'goldAccent':
        return {
          ...base,
          backgroundColor: colors.white,
          borderLeftWidth: 4,
          borderLeftColor: colors.gold,
          borderTopWidth: 1,
          borderRightWidth: 1,
          borderBottomWidth: 1,
          borderTopColor: colors.creamWarm,
          borderRightColor: colors.creamWarm,
          borderBottomColor: colors.creamWarm,
          ...shadows.sm,
        };
      case 'navySurface':
        return {
          ...base,
          backgroundColor: colors.imperialNavy,
          borderWidth: 1,
          borderColor: colors.borderGold,
          ...shadows.md,
        };
      case 'glassNavy':
        return {
          ...base,
          backgroundColor: colors.glassNavy,
          borderWidth: 1,
          borderColor: colors.glassBorderGold,
          ...shadows.lg,
        };
      case 'glassLight':
        return {
          ...base,
          backgroundColor: colors.glassWhite,
          borderWidth: 1,
          borderColor: colors.glassBorderLight,
          ...shadows.sm,
        };
      case 'glassGold':
        return {
          ...base,
          backgroundColor: colors.glassGold,
          borderWidth: 1.5,
          borderColor: colors.gold,
          ...shadows.md,
        };
      case 'elevated':
      default:
        return {
          ...base,
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.creamWarm,
          ...shadows.md,
        };
    }
  };

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
