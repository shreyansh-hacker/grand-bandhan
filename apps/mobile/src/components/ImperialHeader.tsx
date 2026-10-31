import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { colors, typography, spacing, shadows, borderRadius } from '../theme';
import { ImperialLogo } from './ImperialLogo';
import { useSocket } from '../hooks/useSocket';
import { useNotificationStore } from '../store/notificationStore';
import { NotificationModal } from './NotificationModal';

export interface ImperialHeaderProps {
  title: string;
  subtitle?: string;
  showLiveSync?: boolean;
  showBell?: boolean;
  rightAction?: {
    icon?: string;
    label?: string;
    onPress: () => void;
  };
}

export const ImperialHeader: React.FC<ImperialHeaderProps> = ({
  title,
  subtitle,
  showLiveSync = true,
  showBell = true,
  rightAction,
}) => {
  const { status, isConnected } = useSocket();
  const { unreadCount } = useNotificationStore();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.imperialNavyDark} />
      <View style={styles.headerContent}>
        <View style={styles.titleArea}>
          <View style={styles.brandRow}>
            <View style={styles.crestRow}>
              <ImperialLogo size="xs" withGlow={false} />
              <Text style={styles.brandTitle}>GRAND BANDHAN</Text>
            </View>
            {showLiveSync && (
              <View style={styles.radarPill}>
                <View
                  style={[
                    styles.radarDot,
                    isConnected
                      ? styles.radarDotConnected
                      : status === 'connecting'
                      ? styles.radarDotConnecting
                      : styles.radarDotDisconnected,
                  ]}
                />
                <Text style={styles.radarText}>
                  {isConnected ? 'LIVE SYNC' : status === 'connecting' ? 'SYNCING...' : 'OFFLINE'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle && <Text style={styles.screenSubtitle}>{subtitle}</Text>}
        </View>

        {/* Right Actions: Custom Action + Notification Bell */}
        <View style={styles.rightActionsRow}>
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

          {showBell && (
            <TouchableOpacity
              style={styles.bellButton}
              onPress={() => setModalVisible(true)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.goldDivider} />

      <NotificationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
    marginBottom: 4,
  },
  crestRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 106, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  radarDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  radarDotConnected: {
    backgroundColor: '#10B981',
  },
  radarDotConnecting: {
    backgroundColor: '#F59E0B',
  },
  radarDotDisconnected: {
    backgroundColor: '#9CA3AF',
  },
  radarText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
    letterSpacing: 0.8,
  },
  brandTitle: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 2,
    marginLeft: 6,
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
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  bellButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 8,
    padding: 6,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 16,
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: borderRadius.round,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeCountText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  goldDivider: {
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0.85,
  },
});
