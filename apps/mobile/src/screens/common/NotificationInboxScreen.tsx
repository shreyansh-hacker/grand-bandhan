import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useInboxStore } from '../../store/inboxStore';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ImperialHeader, ImperialBadge, LoadingSkeleton } from '../../components';
import { OfflineStatusBar } from '../../components/OfflineStatusBar';
import { AppNotificationItem, NotificationCategory } from '@grand-bandhan/shared';

const CATEGORIES = [
  { key: 'ALL', label: 'All Alerts' },
  { key: NotificationCategory.SERVICE_VERIFICATION, label: 'Verifications' },
  { key: NotificationCategory.VENDOR_DELAY, label: 'Vendor Delays' },
  { key: NotificationCategory.PAYMENT_DUE, label: 'Payments' },
  { key: NotificationCategory.WEDDING_TIMELINE, label: 'Ceremonies' },
  { key: NotificationCategory.TASK_DEADLINE, label: 'Tasks' },
  { key: NotificationCategory.COMPLAINT, label: 'Complaints' },
  { key: NotificationCategory.ESCALATION, label: 'Escalations' },
];

export const NotificationInboxScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    notifications,
    unreadCount,
    selectedCategory,
    isLoading,
    isOffline,
    lastSyncedAt,
    setCategory,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useInboxStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = async (item: AppNotificationItem) => {
    if (!item.isRead) {
      await markAsRead(item.id);
    }
    // Deep-link resolution
    if (item.deepLinkUri) {
      if (item.deepLinkUri.includes('verifications')) {
        navigation.navigate('CoordinatorRoot', { screen: 'CoordinatorCheckpoints' });
      } else if (item.deepLinkUri.includes('payments')) {
        navigation.navigate('AdminSettlements');
      } else if (item.deepLinkUri.includes('tasks')) {
        navigation.navigate('WeddingPlannerRoot', { screen: 'PlannerTasks' });
      } else if (item.deepLinkUri.includes('events')) {
        navigation.navigate('CoordinatorRoot', { screen: 'CoordinatorTimeline' });
      }
    }
  };

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat) {
      case NotificationCategory.SERVICE_VERIFICATION:
      case NotificationCategory.ESCALATION:
        return 'danger';
      case NotificationCategory.VENDOR_DELAY:
      case NotificationCategory.COMPLAINT:
        return 'warning';
      case NotificationCategory.PAYMENT_DUE:
        return 'gold';
      case NotificationCategory.WEDDING_TIMELINE:
        return 'info';
      default:
        return 'neutral';
    }
  };

  const renderItem = ({ item }: { item: AppNotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <ImperialBadge
            label={item.category.replace(/_/g, ' ')}
            variant={getCategoryBadgeVariant(item.category) as any}
            size="sm"
          />
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      <Text style={[styles.title, !item.isRead && styles.unreadTitle]}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Notification Desk"
        subtitle={unreadCount > 0 ? `${unreadCount} unread imperial notices` : 'All notices up to date'}
        rightAction={{
          label: 'Mark Read',
          icon: '✓✓',
          onPress: markAllAsRead,
        }}
      />

      <OfflineStatusBar isOffline={isOffline} lastSyncedAt={lastSyncedAt} />

      {/* Category Pills Bar */}
      <View style={styles.categoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryPill, isSelected && styles.categoryPillActive]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={90} style={styles.skeleton} />
          <LoadingSkeleton height={90} style={styles.skeleton} />
          <LoadingSkeleton height={90} style={styles.skeleton} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => fetchNotifications()}
              tintColor={colors.gold}
              colors={[colors.imperialNavy, colors.gold]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>⚜️</Text>
              <Text style={styles.emptyTitle}>No Notifications Found</Text>
              <Text style={styles.emptySubtitle}>
                You have no active alerts in this category. All wedding milestones are clear.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  categoriesContainer: {
    backgroundColor: colors.imperialNavyDark,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(212, 168, 83, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.25)',
  },
  categoryPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.goldLight,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    color: '#D4C4A8',
    fontWeight: typography.fontWeight.semibold,
  },
  categoryTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  notificationCard: {
    backgroundColor: colors.cardBg,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  unreadCard: {
    backgroundColor: '#FFFDF9',
    borderColor: colors.gold,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  title: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  message: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loadingContainer: {
    padding: spacing.base,
  },
  skeleton: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
