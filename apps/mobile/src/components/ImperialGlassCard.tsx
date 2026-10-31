import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme';

export interface ImperialGlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'navy' | 'light' | 'gold';
  borderGlow?: boolean;
  padding?: keyof typeof spacing;
}

export const ImperialGlassCard: React.FC<ImperialGlassCardProps> = ({
  children,
  style,
  tone = 'navy',
  borderGlow = true,
  padding = 'base',
}) => {
  const getBackgroundColor = () => {
    switch (tone) {
      case 'light':
        return colors.glassWhite;
      case 'gold':
        return colors.glassGold;
      case 'navy':
      default:
        return colors.glassNavy;
    }
  };

  const getBorderColor = () => {
    switch (tone) {
      case 'light':
        return colors.glassBorderLight;
      case 'gold':
        return colors.gold;
      case 'navy':
      default:
        return borderGlow ? colors.glassBorderGold : colors.borderDark;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          padding: spacing[padding],
        },
        shadows.md,
        style,
      ]}
    >
      {/* Imperial subtle top reflection highlight */}
      <View style={styles.topHighlight} pointerEvents="none" />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: colors.glassShine,
  },
});
