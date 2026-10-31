import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { colors, typography, spacing, shadows } from '../theme';
import { ImperialLogo } from './ImperialLogo';

export interface ImperialHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: {
    icon?: string;
    label?: string;
    onPress: () => void;
  };
}

export const ImperialHeader: React.FC<ImperialHeaderProps> = ({
  title,
  subtitle,
  rightAction,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.imperialNavyDark} />
      <View style={styles.headerContent}>
        <View style={styles.titleArea}>
          <View style={styles.crestRow}>
            <ImperialLogo size="xs" withGlow={false} />
            <Text style={styles.brandTitle}>GRAND BANDHAN</Text>
          </View>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={rightAction.onPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightAction.icon ? (
              <Text style={styles.actionIcon}>{rightAction.icon}</Text>
            ) : null}
            {rightAction.label ? (
              <Text style={styles.actionLabel}>{rightAction.label}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.goldDivider} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.imperialNavy,
    paddingTop: spacing.base,
    ...shadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  titleArea: {
    flex: 1,
  },
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  crest: {
    fontSize: 14,
    marginRight: 6,
  },
  brandTitle: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 2,
  },
  screenTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: -0.2,
  },
  screenSubtitle: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.goldLight,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: 4,
  },
  goldDivider: {
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0.85,
  },
});
