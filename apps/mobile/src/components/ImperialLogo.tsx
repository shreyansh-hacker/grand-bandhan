import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors, typography, spacing, shadows } from '../theme';

export interface ImperialLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  textPosition?: 'bottom' | 'right';
  textColor?: string;
  withGlow?: boolean;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

const SIZE_MAP = {
  xs: { width: 28, height: 28 },
  sm: { width: 40, height: 40 },
  md: { width: 64, height: 64 },
  lg: { width: 90, height: 90 },
  xl: { width: 120, height: 120 },
  hero: { width: 160, height: 160 },
};

export const ImperialLogo: React.FC<ImperialLogoProps> = ({
  size = 'md',
  showText = false,
  textPosition = 'bottom',
  textColor = colors.gold,
  withGlow = true,
  style,
  imageStyle,
}) => {
  const dimensions = SIZE_MAP[size];

  const logoImage = (
    <View
      style={[
        styles.imageContainer,
        withGlow && styles.glow,
        style,
      ]}
    >
      <Image
        source={require('../assets/images/logo.png')}
        style={[
          styles.image,
          dimensions,
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );

  if (!showText) {
    return logoImage;
  }

  const isHorizontal = textPosition === 'right';

  return (
    <View style={[isHorizontal ? styles.rowContainer : styles.columnContainer, style]}>
      {logoImage}
      <View style={[isHorizontal ? styles.rightTextContainer : styles.bottomTextContainer]}>
        <Text style={[styles.brandTitle, { color: textColor }]}>
          GRAND BANDHAN
        </Text>
        <Text style={styles.brandSubtitle}>ROYAL WEDDING OPERATIONS</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    ...shadows.goldGlow,
  },
  image: {
    // Proportional containment
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  columnContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightTextContainer: {
    justifyContent: 'center',
  },
  bottomTextContainer: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  brandTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 3,
    color: colors.gold,
  },
  brandSubtitle: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 2,
    color: colors.goldLight,
    marginTop: 2,
  },
});
