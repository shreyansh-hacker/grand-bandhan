import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialBadge,
  ImperialButton,
  LoadingSkeleton,
  EmptyState,
} from '../../components';
import { taskService, weddingService, WeddingSummary } from '../../api/services';
import { Task, TaskStatus, TaskPriority } from '@grand-bandhan/shared';
import { formatDate } from '../../utils/formatters';

interface TasksScreenProps {
  initialWeddingId?: string;
}

export const TasksScreen: React.FC<TasksScreenProps> = ({ initialWeddingId }) => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(initialWeddingId || '');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [regenerating, setRegenerating] = useState(false);

  const loadWeddings = useCallback(async () => {
    try {
      const list = await weddingService.list();
      setWeddings(list);
      if (!selectedWeddingId && list.length > 0) {
        setSelectedWeddingId(list[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load weddings:', err?.message);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    loadWeddings();
  }, [loadWeddings]);

  const fetchTasks = useCallback(async () => {
    if (!selectedWeddingId) {
      setLoading(false);
      return;
    }
    try {
      const data = await taskService.list(selectedWeddingId);
      setTasks(data);
    } catch (err: any) {
      console.warn('Failed to load tasks:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const handleToggleTask = async (task: Task) => {
    const isDone = task.status === TaskStatus.DONE;
    const nextStatus = isDone ? TaskStatus.TO_PLAN : TaskStatus.DONE;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
    );

    try {
      await taskService.updateStatus(task.id, nextStatus);
    } catch (err: any) {
      // Revert on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: task.status } : t))
      );
      Alert.alert('Error', 'Failed to update task status.');
    }
  };

  const handleRegeneratePlan = async () => {
    if (!selectedWeddingId) return;
    setRegenerating(true);
    try {
      const res = await taskService.regenerate(selectedWeddingId);
      Alert.alert('AI Plan Generated', res.message || 'Tasks regenerated successfully.');
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to generate plan.');
    } finally {
      setRegenerating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    return activeFilter === 'ALL' || t.status === activeFilter;
  });

  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'danger';
      case TaskPriority.HIGH:
        return 'warning';
      case TaskPriority.MEDIUM:
        return 'info';
      case TaskPriority.LOW:
      default:
        return 'default';
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const isDone = item.status === TaskStatus.DONE;

    return (
      <ImperialGlassCard style={styles.card} tone="navy">
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.checkbox, isDone && styles.checkboxDone]}
            onPress={() => handleToggleTask(item)}
            activeOpacity={0.7}
          >
            {isDone && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>

          <View style={styles.taskBody}>
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                {item.title}
              </Text>
              <ImperialBadge
                label={item.priority}
                variant={getPriorityVariant(item.priority)}
                size="sm"
              />
            </View>

            {(item.notes || (item as any).description) && (
              <Text style={styles.taskDescription}>{item.notes || (item as any).description}</Text>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.categoryBadge}>🏷️ {item.category}</Text>
              <Text style={styles.deadlineText}>
                ⏰ {item.dueDate || (item as any).deadline ? formatDate(item.dueDate || (item as any).deadline) : 'No Deadline'}
              </Text>
            </View>
          </View>
        </View>
      </ImperialGlassCard>
    );
  };

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Task Board"
        subtitle="Operational Milestones & Lead Times"
      />

      {/* Wedding Selector */}
      {weddings.length > 0 && (
        <View style={styles.selectorBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
            {weddings.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.selectorPill,
                  selectedWeddingId === w.id && styles.selectorPillActive,
                ]}
                onPress={() => setSelectedWeddingId(w.id)}
              >
                <Text
                  style={[
                    styles.selectorPillText,
                    selectedWeddingId === w.id && styles.selectorPillTextActive,
                  ]}
                >
                  {w.brideName} & {w.groomName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Status Filter & Action Bar */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', TaskStatus.TO_PLAN, TaskStatus.IN_PROGRESS, TaskStatus.DONE].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterPill,
                activeFilter === status && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(status as any)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === status && styles.filterPillTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.subActionRow}>
        <ImperialButton
          title={regenerating ? 'Generating...' : '⚡ Instant Plan Generator'}
          variant="outline"
          size="sm"
          loading={regenerating}
          onPress={handleRegeneratePlan}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={100} count={4} />
        </View>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          title="No Tasks Found"
          message="No milestones found matching your filter. Use the Instant Plan Generator to calculate tasks dynamically."
          actionLabel="Generate Plan"
          onAction={handleRegeneratePlan}
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.gold}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  selectorBar: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  selectorScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  selectorPill: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  selectorPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  selectorPillText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.medium,
  },
  selectorPillTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  filterBar: {
    paddingVertical: spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  filterPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterPillText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.medium,
  },
  filterPillTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  subActionRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    marginBottom: spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkMark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskBody: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  taskTitle: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    flex: 1,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#8E9CAE',
  },
  taskDescription: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    marginTop: 2,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  categoryBadge: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
  },
  deadlineText: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
  },
});
