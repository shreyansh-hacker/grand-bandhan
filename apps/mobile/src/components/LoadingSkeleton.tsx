import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing } from '../theme';

export interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadiusValue?: number;
  count?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadiusValue = borderRadius.sm,
  count = 1,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (count > 1) {
    return (
      <View style={{ gap: spacing.sm }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.skeleton,
              {
                width: width as any,
                height,
                borderRadius: borderRadiusValue,
              },
              animatedStyle,
              style,
            ]}
          />
        ))}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: borderRadiusValue,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  return (
    <View style={[styles.cardContainer, style]}>
      <LoadingSkeleton width="40%" height={16} style={{ marginBottom: spacing.sm }} />
      <LoadingSkeleton width="85%" height={22} style={{ marginBottom: spacing.md }} />
      <View style={styles.cardRow}>
        <LoadingSkeleton width="30%" height={14} />
        <LoadingSkeleton width="25%" height={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardContainer: {
    backgroundColor: colors.white,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.creamWarm,
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
