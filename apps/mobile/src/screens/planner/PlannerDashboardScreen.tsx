import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import {
  ImperialHeader,
  ImperialCard,
  ImperialBadge,
  ImperialButton,
  LoadingSkeleton,
  ErrorView,
} from '../../components';
import { useAuthStore } from '../../store/authStore';
import { weddingService, taskService } from '../../api/services';
import { formatINRCompact, formatDate } from '../../utils/formatters';
import { TaskStatus } from '@grand-bandhan/shared';
import { queryClient } from '../../api/queryClient';

export const PlannerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  const {
    data: weddings = [],
    isLoading: weddingsLoading,
    isRefetching: weddingsRefetching,
    refetch: refetchWeddings,
  } = useQuery({
    queryKey: ['weddings'],
    queryFn: () => weddingService.list(),
  });

  const {
    data: tasks = [],
    isLoading: tasksLoading,
    isRefetching: tasksRefetching,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.list(),
  });

  const isInitialLoading = weddingsLoading && tasksLoading;
  const isRefreshing = weddingsRefetching || tasksRefetching;

  const handleRefresh = () => {
    refetchWeddings();
    refetchTasks();
  };

  const handleToggleTaskStatus = async (taskId: string, currentStatus: TaskStatus) => {
    try {
      const nextStatus =
        currentStatus === TaskStatus.DONE
          ? TaskStatus.IN_PROGRESS
          : TaskStatus.DONE;
      await taskService.updateStatus(taskId, nextStatus);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['weddings'] });
    } catch (err: any) {
      Alert.alert('Task Update Error', err.message || 'Could not update task status.');
    }
  };

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <ImperialHeader
          title="Planner Desk"
          subtitle={`Lead Planner: ${user?.name || 'Grand Bandhan'}`}
        />
        <View style={styles.content}>
          <LoadingSkeleton height={100} style={styles.skeletonCard} />
          <LoadingSkeleton height={180} style={styles.skeletonCard} />
          <LoadingSkeleton height={160} style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  const activeWedding = weddings[0];
  const pendingTasks = tasks.filter((t) => t.status !== TaskStatus.DONE);
  const urgentTasks = pendingTasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Planner Desk"
        subtitle={`Lead Planner: ${user?.name || 'Grand Bandhan'}`}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
            colors={[colors.imperialNavy, colors.gold]}
          />
        }
      >
        {/* Quick Operational Metrics */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>{weddings.length}</Text>
            <Text style={styles.metricTitle}>Assigned Weddings</Text>
            <ImperialBadge
              label={`${weddings.filter((w) => w.status === 'CONFIRMED' || w.status === 'EXECUTION').length} Active`}
              variant="gold"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>
              {pendingTasks.length}
            </Text>
            <Text style={styles.metricTitle}>Pending Tasks</Text>
            <ImperialBadge
              label={`${urgentTasks.length} Urgent`}
              variant={urgentTasks.length > 0 ? 'danger' : 'success'}
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>
        </View>

        {/* Featured Wedding Operations Card */}
        {activeWedding ? (
          <ImperialCard variant="goldAccent" style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeading}>ACTIVE WEDDING OPERATIONS</Text>
              <ImperialBadge label={activeWedding.status} variant="gold" />
            </View>
            <Text style={styles.weddingTitle}>
              {activeWedding.brideName} & {activeWedding.groomName}
            </Text>
            <Text style={styles.weddingMeta}>
              {activeWedding.weddingCode} • {activeWedding.location} • {formatDate(activeWedding.weddingDate)}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressText}>Planning Progress</Text>
                <Text style={styles.progressPercent}>{activeWedding.tasksProgress ?? 0}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, activeWedding.tasksProgress ?? 0)}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <Text style={styles.itemLabel}>Guest Count:</Text>
              <Text style={styles.itemVal}>{activeWedding.guestCount} Honored Guests</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.itemLabel}>Package Type:</Text>
              <Text style={styles.itemVal}>{activeWedding.packageType}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.itemLabel}>Milestone Payments Cleared:</Text>
              <Text style={[styles.itemVal, { color: colors.success }]}>
                {formatINRCompact(activeWedding.totalPaid ?? 0)} / {formatINRCompact(activeWedding.totalAmount ?? activeWedding.budgetMax)}
              </Text>
            </View>
          </ImperialCard>
        ) : (
          <ImperialCard variant="elevated" style={styles.card}>
            <Text style={styles.emptyText}>No weddings assigned to this planner account.</Text>
          </ImperialCard>
        )}

        {/* Live Priority Tasks */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>PRIORITY WEDDING TASKS</Text>
            <ImperialBadge label={`${pendingTasks.length} OPEN`} variant="info" size="sm" />
          </View>
          <View style={styles.divider} />

          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>All wedding tasks are completed!</Text>
          ) : (
            tasks.slice(0, 5).map((task) => {
              const isDone = task.status === TaskStatus.DONE;
              return (
                <View key={task.id} style={styles.taskRow}>
                  <TouchableOpacity
                    style={[styles.taskCheckbox, isDone && styles.taskCheckboxDone]}
                    onPress={() => handleToggleTaskStatus(task.id, task.status)}
                    activeOpacity={0.7}
                  >
                    {isDone && <Text style={styles.checkIcon}>✓</Text>}
                  </TouchableOpacity>
                  <View style={styles.taskTextContent}>
                    <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskDeadline}>
                      Due: {formatDate((task as any).deadline || task.dueDate)} • {task.category}
                    </Text>
                  </View>
                  <ImperialBadge
                    label={task.priority}
                    variant={
                      task.priority === 'URGENT'
                        ? 'danger'
                        : task.priority === 'HIGH'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                  />
                </View>
              );
            })
          )}
        </ImperialCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  skeletonCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  metricNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
  },
  metricTitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    marginTop: spacing.xs,
  },
  card: {
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  sectionHeading: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 1.2,
  },
  weddingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginTop: spacing.xs,
  },
  weddingMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    marginVertical: spacing.xs,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.goldDark,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderGold,
    opacity: 0.5,
    marginVertical: spacing.sm,
  },
  itemLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  itemVal: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  taskCheckboxDone: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  checkIcon: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  taskTextContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  taskTitle: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  taskDeadline: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
});
