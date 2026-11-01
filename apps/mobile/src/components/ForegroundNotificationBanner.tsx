import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBannerStore, BannerData } from '../store/bannerStore';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ImperialLogo } from './ImperialLogo';

interface ForegroundNotificationBannerProps {
  onBannerPress?: (banner: BannerData) => void;
}

export const ForegroundNotificationBanner: React.FC<ForegroundNotificationBannerProps> = ({
  onBannerPress,
}) => {
  const insets = useSafeAreaInsets();
  const { banner, dismissBanner } = useBannerStore();
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (banner) {
      // Slide down animation
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      // Persistent in-app alert: Remains visible until user taps to act or dismisses
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -150,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [banner]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -150,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissBanner();
    });
  };

  const handlePress = () => {
    if (banner) {
      const current = banner;
      handleDismiss();
      onBannerPress?.(current);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy < -10; // Trigger on upward swipe
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -15) {
          handleDismiss();
        }
      },
    })
  ).current;

  if (!banner) {
    return null;
  }

  const getBadgeIcon = (type: BannerData['type']) => {
    switch (type) {
      case 'VERIFICATION':
        return '⚠️';
      case 'PAYMENT':
        return '💰';
      case 'TASK':
        return '📋';
      case 'ARRIVAL':
        return '📍';
      default:
        return '⚜️';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top + 6,
          transform: [{ translateY }],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={styles.bannerContent}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Glow & Border Container */}
        <View style={styles.cardInner}>
          <View style={styles.headerRow}>
            <View style={styles.badgeGroup}>
              <ImperialLogo size="xs" withGlow={false} />
              <Text style={styles.badgeText}>REAL-TIME RADAR</Text>
            </View>
            <TouchableOpacity
              onPress={handleDismiss}
              style={styles.closeHitArea}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeIcon}>✕ Dismiss</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bodyRow}>
            <View style={styles.iconContainer}>
              <Text style={styles.typeIcon}>{getBadgeIcon(banner.type)}</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>
                {banner.title}
              </Text>
              <Text style={styles.message} numberOfLines={2}>
                {banner.message}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.base,
    right: spacing.base,
    zIndex: 99999,
    elevation: 99999,
  },
  bannerContent: {
    borderRadius: borderRadius.md,
    ...shadows.goldGlow,
  },
  cardInner: {
    backgroundColor: colors.imperialNavyDark,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.gold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    shadowColor: colors.goldDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 1.2,
    marginLeft: 6,
  },
  closeHitArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  closeIcon: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '700',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 169, 106, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 106, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  typeIcon: {
    fontSize: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.white,
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
  },
  message: {
    color: colors.goldLight,
    fontSize: typography.fontSize.xs - 1,
    lineHeight: 16,
    marginTop: 2,
  },
});
