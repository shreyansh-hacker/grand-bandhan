import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

interface OfflineStatusBarProps {
  isOffline?: boolean;
  lastSyncedAt?: string | null;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({
  isOffline = false,
  lastSyncedAt,
}) => {
  if (!isOffline) {
    return null;
  }

  const formattedTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>
        <Text style={styles.bold}>Offline Mode:</Text> Viewing cached data (Synced at {formattedTime}). Read-only mode active.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#8C1D2F', // Deep Royal Crimson Alert
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: typography.fontSize.xs - 1,
    color: '#FFF8EA',
    fontWeight: typography.fontWeight.medium,
  },
  bold: {
    fontWeight: typography.fontWeight.bold,
    color: colors.goldLight,
  },
});
