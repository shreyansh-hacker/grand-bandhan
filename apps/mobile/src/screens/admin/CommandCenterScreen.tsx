import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../api/client';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, LoadingSkeleton, ErrorView } from '../../components';
import { formatINRCompact } from '../../utils/formatters';

export const CommandCenterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'delays' | 'tasks' | 'escalations' | 'payments'>('verifications');

  const { data, isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['analytics', 'command-center'],
    queryFn: async () => {
      const res = await apiClient.get<any>('/api/analytics/command-center');
      return res.data;
    },
    refetchInterval: 15000, // Auto-poll every 15s for live command updates
  });

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.container}>
        <ImperialHeader title="Imperial Command Center" subtitle="Loading live operational radar..." />
        <View style={styles.content}>
          <LoadingSkeleton height={100} style={styles.skeleton} />
          <LoadingSkeleton height={100} style={styles.skeleton} />
          <LoadingSkeleton height={200} style={styles.skeleton} />
        </View>
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View style={styles.container}>
        <ImperialHeader title="Imperial Command Center" subtitle="Operations Telemetry" />
        <ErrorView message={error?.message || 'Could not fetch operational status'} onRetry={refetch} />
      </View>
    );
  }

  const summary = data?.summary || {};
  const operationalData = data?.data || {};

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Imperial Command Center"
        subtitle="Live Operations Radar • Neon Telemetry"
        rightAction={{
          label: 'Notices',
          icon: '🔔',
          onPress: () => navigation.navigate('NotificationInbox'),
        }}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.gold}
            colors={[colors.imperialNavy, colors.gold]}
          />
        }
      >
        {/* KPI Grid */}
        <View style={styles.kpiGrid}>
          <ImperialCard variant="navySurface" style={styles.kpiCard}>
            <Text style={styles.kpiNum}>{summary.pendingVerificationsCount ?? 0}</Text>
            <Text style={styles.kpiLabel}>Verifications Due</Text>
            <ImperialBadge
              label={summary.escalationsCount > 0 ? `${summary.escalationsCount} Escalated` : 'All On Track'}
              variant={summary.escalationsCount > 0 ? 'danger' : 'success'}
              size="sm"
            />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.kpiCard}>
            <Text style={[styles.kpiNum, { color: colors.danger }]}>{summary.delayedVendorsCount ?? 0}</Text>
            <Text style={styles.kpiLabel}>Delayed Vendors</Text>
            <ImperialBadge label="Radar Alert" variant="warning" size="sm" />
          </ImperialCard>
        </View>

        <View style={styles.kpiGrid}>
          <ImperialCard variant="elevated" style={styles.kpiCard}>
            <Text style={[styles.kpiNum, { color: colors.imperialNavy }]}>{summary.overdueTasksCount ?? 0}</Text>
            <Text style={styles.kpiLabel}>Overdue Tasks</Text>
            <ImperialBadge label="Action Required" variant="danger" size="sm" />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.kpiCard}>
            <Text style={[styles.kpiNum, { color: colors.goldDark }]}>
              {formatINRCompact(summary.pendingPaymentsSum ?? 0)}
            </Text>
            <Text style={styles.kpiLabel}>Pending Escrow</Text>
            <ImperialBadge label={`${summary.pendingPaymentsCount ?? 0} Milestones`} variant="gold" size="sm" />
          </ImperialCard>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'verifications' && styles.tabItemActive]}
            onPress={() => setActiveTab('verifications')}
          >
            <Text style={[styles.tabText, activeTab === 'verifications' && styles.tabTextActive]}>
              Verifications ({summary.pendingVerificationsCount ?? 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'delays' && styles.tabItemActive]}
            onPress={() => setActiveTab('delays')}
          >
            <Text style={[styles.tabText, activeTab === 'delays' && styles.tabTextActive]}>
              Delays ({summary.delayedVendorsCount ?? 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'tasks' && styles.tabItemActive]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={[styles.tabText, activeTab === 'tasks' && styles.tabTextActive]}>
              Tasks ({summary.overdueTasksCount ?? 0})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'escalations' && styles.tabItemActive]}
            onPress={() => setActiveTab('escalations')}
          >
            <Text style={[styles.tabText, activeTab === 'escalations' && styles.tabTextActive]}>
              Escalations ({summary.escalationsCount ?? 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'verifications' && (
          <View>
            {(operationalData.pendingVerifications || []).length === 0 ? (
              <Text style={styles.emptyText}>All on-ground service verifications are fully confirmed.</Text>
            ) : (
              (operationalData.pendingVerifications || []).map((v: any) => (
                <View key={v.id} style={styles.rowCard}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowTitle}>{v.serviceName}</Text>
                    <ImperialBadge label="PENDING" variant="warning" size="sm" />
                  </View>
                  <Text style={styles.rowSub}>
                    Vendor: {v.vendor?.name} • Wedding: {v.wedding?.weddingCode}
                  </Text>
                  <Text style={styles.rowTime}>
                    Scheduled Confirmation: {new Date(v.scheduledConfirmationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'delays' && (
          <View>
            {(operationalData.delayedVendors || []).length === 0 ? (
              <Text style={styles.emptyText}>Zero vendor delays logged. All partners checked in on schedule.</Text>
            ) : (
              (operationalData.delayedVendors || []).map((d: any) => (
                <View key={d.id} style={[styles.rowCard, { borderLeftColor: colors.danger, borderLeftWidth: 4 }]}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowTitle}>{d.vendor?.name}</Text>
                    <ImperialBadge label={d.arrivalStatus} variant="danger" size="sm" />
                  </View>
                  <Text style={styles.rowSub}>Category: {d.vendor?.category} • Wedding: {d.eventTimeline?.wedding?.weddingCode}</Text>
                  {d.vendor?.phone && (
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${d.vendor.phone}`)}>
                      <Text style={styles.callLink}>📞 Call Vendor: {d.vendor.phone}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'tasks' && (
          <View>
            {(operationalData.overdueTasks || []).length === 0 ? (
              <Text style={styles.emptyText}>Zero overdue tasks in agency wedding portfolio.</Text>
            ) : (
              (operationalData.overdueTasks || []).map((t: any) => (
                <View key={t.id} style={styles.rowCard}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowTitle}>{t.title}</Text>
                    <ImperialBadge label="OVERDUE" variant="danger" size="sm" />
                  </View>
                  <Text style={styles.rowSub}>Wedding: {t.wedding?.weddingCode} • Assigned: {t.assignedUser?.name || 'Unassigned'}</Text>
                  <Text style={styles.rowTime}>Deadline was: {new Date(t.deadline).toLocaleDateString()}</Text>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'escalations' && (
          <View>
            {(operationalData.escalations || []).length === 0 ? (
              <Text style={styles.emptyText}>Zero unattended escalations. All verifications resolved promptly.</Text>
            ) : (
              (operationalData.escalations || []).map((e: any) => (
                <View key={e.id} style={[styles.rowCard, { borderLeftColor: '#E63946', borderLeftWidth: 4 }]}>
                  <View style={styles.rowHeader}>
                    <Text style={styles.rowTitle}>{e.serviceName}</Text>
                    <ImperialBadge label="ESCALATED >30M" variant="danger" size="sm" />
                  </View>
                  <Text style={styles.rowSub}>Vendor: {e.vendor?.name} • Wedding: {e.wedding?.weddingCode}</Text>
                  <Text style={styles.rowTime}>
                    Auto-escalated by background scheduler to Agency Administrator.
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
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
  skeleton: {
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  kpiCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  kpiNum: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
  },
  kpiLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginVertical: 4,
    fontWeight: typography.fontWeight.medium,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.imperialNavyDark,
    borderRadius: borderRadius.md,
    padding: 3,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabItemActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    fontSize: 10,
    color: '#D4C4A8',
    fontWeight: typography.fontWeight.semibold,
  },
  tabTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  rowCard: {
    backgroundColor: colors.cardBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    flex: 1,
    marginRight: spacing.xs,
  },
  rowSub: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  rowTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  callLink: {
    fontSize: typography.fontSize.xs,
    color: colors.goldDark,
    fontWeight: typography.fontWeight.bold,
    marginTop: 4,
  },
  emptyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
