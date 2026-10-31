import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../theme';

export interface ImperialBadgeProps {
  label: string;
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'navy' | 'neutral' | 'info';
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const ImperialBadge: React.FC<ImperialBadgeProps> = ({
  label,
  variant = 'gold',
  size = 'sm',
  style,
  textStyle,
}) => {
  const getBadgeColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'success':
        return { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' };
      case 'warning':
        return { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' };
      case 'danger':
        return { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' };
      case 'navy':
        return { bg: '#0A2540', text: '#C9A96A', border: '#1E3A8A' };
      case 'info':
        return { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' };
      case 'neutral':
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
      case 'gold':
      default:
        return { bg: '#FAF5EA', text: '#8D6E2E', border: '#E6D6B8' };
    }
  };

  const badgeColors = getBadgeColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: badgeColors.bg,
          borderColor: badgeColors.border,
          paddingVertical: isSm ? 2 : 4,
          paddingHorizontal: isSm ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: badgeColors.text,
            fontSize: isSm ? typography.fontSize.xs : typography.fontSize.sm,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: borderRadius.round,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
