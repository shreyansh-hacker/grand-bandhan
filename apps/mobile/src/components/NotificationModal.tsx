import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ImperialLogo } from './ImperialLogo';
import { useNotificationStore, AppNotification } from '../store/notificationStore';
import { formatTime } from '../utils/formatters';

export interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();

  const getIcon = (type: AppNotification['type']) => {
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
        return '📡';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.brandRow}>
                <ImperialLogo size="xs" withGlow={false} />
                <Text style={styles.headerBadge}>IMPERIAL NOTIFICATION RADAR</Text>
              </View>
              {unreadCount > 0 && (
                <View style={styles.unreadPill}>
                  <Text style={styles.unreadPillText}>{unreadCount} NEW</Text>
                </View>
              )}
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={markAllAsRead} activeOpacity={0.7}>
                <Text style={styles.actionLink}>Mark All Read</Text>
              </TouchableOpacity>
              <Text style={styles.actionDivider}>•</Text>
              <TouchableOpacity onPress={clearAll} activeOpacity={0.7}>
                <Text style={styles.actionLink}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptySubtitle}>
                  Real-time alerts from the wedding operations radar will appear here.
                </Text>
              </View>
            ) : (
              notifications.map((n) => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.notificationCard, !n.read && styles.notificationCardUnread]}
                  onPress={() => markAsRead(n.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.notifHeader}>
                    <Text style={styles.notifIcon}>{getIcon(n.type)}</Text>
                    <View style={styles.notifTitleContainer}>
                      <Text style={[styles.notifTitle, !n.read && styles.notifTitleBold]}>
                        {n.title}
                      </Text>
                      <Text style={styles.notifTime}>{formatTime(n.timestamp)}</Text>
                    </View>
                    {!n.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notifMessage}>{n.message}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 24, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    backgroundColor: colors.imperialNavy,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  unreadPill: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  unreadPillText: {
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavy,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  actionLink: {
    fontSize: 11,
    color: colors.goldLight,
    fontWeight: typography.fontWeight.semibold,
  },
  actionDivider: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 8,
  },
  body: {
    padding: spacing.base,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: spacing.xl,
  },
  notificationCard: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  notificationCardUnread: {
    backgroundColor: '#FAF5EA',
    borderColor: colors.borderGold,
    borderWidth: 1.5,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifIcon: {
    fontSize: 16,
    marginRight: spacing.xs + 2,
  },
  notifTitleContainer: {
    flex: 1,
  },
  notifTitle: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  notifTitleBold: {
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  notifTime: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.goldDark,
  },
  notifMessage: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  closeBtn: {
    backgroundColor: colors.imperialNavy,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  closeBtnText: {
    color: colors.goldLight,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xs + 1,
    letterSpacing: 0.5,
  },
});
