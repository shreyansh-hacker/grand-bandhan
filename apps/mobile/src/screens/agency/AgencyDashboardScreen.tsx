import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialCard,
  ImperialBadge,
  ImperialButton,
  LoadingSkeleton,
} from '../../components';
import { useAuthStore } from '../../store/authStore';
import { analyticsService, weddingService } from '../../api/services';
import { formatINRCompact, formatDate } from '../../utils/formatters';

export const AgencyDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  const {
    data,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
    isRefetching: analyticsRefetching,
  } = useQuery({
    queryKey: ['analytics', 'agency'],
    queryFn: () => analyticsService.getDashboard(),
  });

  const {
    data: weddings = [],
    isLoading: weddingsLoading,
    refetch: refetchWeddings,
    isRefetching: weddingsRefetching,
  } = useQuery({
    queryKey: ['weddings', 'agency'],
    queryFn: () => weddingService.list(),
  });

  const isInitialLoading = analyticsLoading && weddingsLoading;
  const isRefreshing = analyticsRefetching || weddingsRefetching;

  const handleRefresh = () => {
    refetchAnalytics();
    refetchWeddings();
  };

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <ImperialHeader
          title="Agency Operations"
          subtitle={`Principal: ${user?.name || 'Grand Bandhan Agency'}`}
        />
        <View style={styles.content}>
          <LoadingSkeleton height={110} style={styles.skeletonCard} />
          <LoadingSkeleton height={160} style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  const metrics = data?.metrics;

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Agency Operations"
        subtitle={`Principal: ${user?.name || 'Grand Bandhan Agency'}`}
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
        {/* Agency Metrics */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>{metrics?.activeWeddings ?? weddings.length}</Text>
            <Text style={styles.metricTitle}>Active Weddings</Text>
            <ImperialBadge
              label={`${metrics?.totalWeddings ?? weddings.length} Contracted`}
              variant="gold"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>
              {metrics?.totalEnquiries ?? 0}
            </Text>
            <Text style={styles.metricTitle}>Pipeline Enquiries</Text>
            <ImperialBadge
              label={`${metrics?.brideSideEnquiries ?? 0} Bride • ${metrics?.groomSideEnquiries ?? 0} Groom`}
              variant="warning"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>
        </View>

        {/* Lifecycle Governance Quick Suite */}
        <View style={styles.suiteContainer}>
          <TouchableOpacity
            style={styles.suitePill}
            onPress={() => navigation.navigate('Consultations')}
            activeOpacity={0.8}
          >
            <Text style={styles.suiteIcon}>📅</Text>
            <View>
              <Text style={styles.suiteTitle}>Consultations</Text>
              <Text style={styles.suiteDesc}>Intake Sessions</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.suitePill}
            onPress={() => navigation.navigate('Agreements')}
            activeOpacity={0.8}
          >
            <Text style={styles.suiteIcon}>📜</Text>
            <View>
              <Text style={styles.suiteTitle}>Agreements</Text>
              <Text style={styles.suiteDesc}>20-Section Contracts</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.suitePill}
            onPress={() => navigation.navigate('VendorsDirectory')}
            activeOpacity={0.8}
          >
            <Text style={styles.suiteIcon}>🏛️</Text>
            <View>
              <Text style={styles.suiteTitle}>Vendors</Text>
              <Text style={styles.suiteDesc}>Directory & Approval</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Agency Portfolio Summary */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>ACTIVE AGENCY ENGAGEMENTS</Text>
            <ImperialBadge label="PORTFOLIO" variant="info" size="sm" />
          </View>
          <View style={styles.divider} />

          {weddings.length === 0 ? (
            <Text style={styles.emptyText}>No active weddings under current agency.</Text>
          ) : (
            weddings.slice(0, 4).map((w) => (
              <View key={w.id} style={styles.weddingRow}>
                <View style={styles.weddingInfo}>
                  <Text style={styles.weddingNames}>
                    {w.brideName} & {w.groomName}
                  </Text>
                  <Text style={styles.weddingMeta}>
                    {w.weddingCode || 'GB-WEDDING'} • {w.location} • {formatDate(w.weddingDate || w.startDate)}
                  </Text>
                </View>
                <ImperialBadge
                  label={w.status}
                  variant={w.status === 'CONFIRMED' || w.status === 'EXECUTION' ? 'gold' : 'neutral'}
                  size="sm"
                />
              </View>
            ))
          )}
        </ImperialCard>

        {/* Financial Flow Snapshot */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>GROSS VOLUME & SETTLEMENTS</Text>
            <ImperialBadge label="AGENCY ACCOUNT" variant="gold" size="sm" />
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Total Cleared Revenue:</Text>
            <Text style={[styles.itemVal, { color: colors.success }]}>
              {formatINRCompact(metrics?.totalRevenue ?? 0)}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Vendor Disbursements:</Text>
            <Text style={styles.itemVal}>
              {formatINRCompact(metrics?.totalExpenses ?? 0)}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Agency Net Margin:</Text>
            <Text style={[styles.itemVal, { color: colors.goldDark, fontWeight: typography.fontWeight.heavy }]}>
              {formatINRCompact(metrics?.netGrossProfit ?? 0)}
            </Text>
          </View>
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
  suiteContainer: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  suitePill: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.md,
    padding: spacing.xs + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suiteIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  suiteTitle: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    textAlign: 'center',
  },
  suiteDesc: {
    fontSize: 8,
    color: colors.textSecondary,
    textAlign: 'center',
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
  divider: {
    height: 1,
    backgroundColor: colors.borderGold,
    opacity: 0.5,
    marginVertical: spacing.sm,
  },
  weddingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  weddingInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  weddingNames: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  weddingMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
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
  emptyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
});
