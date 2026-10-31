import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

export interface ImperialButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const ImperialButton: React.FC<ImperialButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
    };

    // Size
    switch (size) {
      case 'sm':
        Object.assign(base, { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md });
        break;
      case 'lg':
        Object.assign(base, { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.xl });
        break;
      case 'md':
      default:
        Object.assign(base, { paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.base });
        break;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        Object.assign(base, {
          backgroundColor: colors.imperialNavy,
          borderWidth: 1,
          borderColor: colors.borderGold,
          ...shadows.sm,
        });
        break;
      case 'outline':
        Object.assign(base, {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: colors.gold,
        });
        break;
      case 'ghost':
        Object.assign(base, {
          backgroundColor: 'transparent',
        });
        break;
      case 'danger':
        Object.assign(base, {
          backgroundColor: colors.danger,
        });
        break;
      case 'primary':
      default:
        Object.assign(base, {
          backgroundColor: colors.gold,
          ...shadows.goldGlow,
        });
        break;
    }

    if (disabled || loading) {
      Object.assign(base, { opacity: 0.55 });
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: typography.fontWeight.semibold,
      textAlign: 'center',
    };

    switch (size) {
      case 'sm':
        Object.assign(base, { fontSize: typography.fontSize.sm });
        break;
      case 'lg':
        Object.assign(base, { fontSize: typography.fontSize.lg, letterSpacing: 0.5 });
        break;
      case 'md':
      default:
        Object.assign(base, { fontSize: typography.fontSize.base });
        break;
    }

    switch (variant) {
      case 'secondary':
        Object.assign(base, { color: colors.white });
        break;
      case 'outline':
        Object.assign(base, { color: colors.gold });
        break;
      case 'ghost':
        Object.assign(base, { color: colors.imperialNavy });
        break;
      case 'danger':
        Object.assign(base, { color: colors.white });
        break;
      case 'primary':
      default:
        Object.assign(base, { color: colors.imperialNavyDark, fontWeight: typography.fontWeight.bold });
        break;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.imperialNavyDark : colors.gold}
          style={styles.spinner}
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={[getTextStyle(), icon ? { marginLeft: spacing.sm } : undefined, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  spinner: {
    paddingVertical: 2,
  },
});
