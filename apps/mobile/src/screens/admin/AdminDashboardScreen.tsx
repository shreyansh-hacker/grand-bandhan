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
import { analyticsService } from '../../api/services';
import { formatINRCompact, formatDate } from '../../utils/formatters';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: () => analyticsService.getDashboard(),
  });

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.container}>
        <ImperialHeader
          title="Imperial Administration"
          subtitle={`Welcome, ${user?.name || 'Administrator'}`}
        />
        <View style={styles.content}>
          <LoadingSkeleton height={110} style={styles.skeletonCard} />
          <LoadingSkeleton height={110} style={styles.skeletonCard} />
          <LoadingSkeleton height={180} style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  if (isError && !data) {
    return (
      <View style={styles.container}>
        <ImperialHeader
          title="Imperial Administration"
          subtitle={`Welcome, ${user?.name || 'Administrator'}`}
        />
        <ErrorView
          message={error?.message || 'Could not fetch platform telemetry'}
          onRetry={refetch}
        />
      </View>
    );
  }

  const metrics = data?.metrics;
  const financials = data?.weddingFinancials || [];

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Imperial Administration"
        subtitle={`Command Center • ${user?.name || 'Principal Administrator'}`}
        rightAction={{
          label: 'Health',
          icon: '⚡',
          onPress: () => navigation.navigate('AdminHealth'),
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
        {/* Top Metric Cards: Real Live Telemetry */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>{metrics?.activeWeddings ?? 0}</Text>
            <Text style={styles.metricTitle}>Active Weddings</Text>
            <ImperialBadge
              label={`${metrics?.totalWeddings ?? 0} Total in Portfolio`}
              variant="gold"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>
              {formatINRCompact(metrics?.totalRevenue ?? 0)}
            </Text>
            <Text style={styles.metricTitle}>Gross Platform Revenue</Text>
            <ImperialBadge
              label={`Net: ${formatINRCompact(metrics?.netGrossProfit ?? 0)}`}
              variant="success"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>
        </View>

        <View style={styles.metricsGrid}>
          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>
              {metrics?.totalEnquiries ?? 0}
            </Text>
            <Text style={styles.metricTitle}>Total Enquiries</Text>
            <ImperialBadge
              label={`${metrics?.brideSideEnquiries ?? 0} Bride • ${metrics?.groomSideEnquiries ?? 0} Groom`}
              variant="warning"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>
              {metrics?.onTimeArrivalRate ?? 100}%
            </Text>
            <Text style={styles.metricTitle}>On-Time Vendor Radar</Text>
            <ImperialBadge
              label={`${metrics?.vendorCount ?? 0} Empaneled Partners`}
              variant="gold"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>
        </View>

        {/* Live Wedding Portfolio & Financial Ledger */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionHeading}>ROYAL WEDDING PORTFOLIO</Text>
              <Text style={styles.subtext}>Live financial ledger & operational status</Text>
            </View>
            <ImperialBadge
              label={`${financials.length} WEDDINGS`}
              variant="gold"
              size="sm"
            />
          </View>
          <View style={styles.divider} />

          {financials.length === 0 ? (
            <Text style={styles.emptyText}>No weddings recorded in current agency.</Text>
          ) : (
            financials.map((w) => (
              <View key={w.id} style={styles.weddingRow}>
                <View style={styles.weddingInfo}>
                  <Text style={styles.weddingCouple}>{w.couple}</Text>
                  <Text style={styles.weddingMeta}>
                    {w.code} • {w.location} • {formatDate(w.weddingDate)}
                  </Text>
                </View>
                <View style={styles.weddingFigures}>
                  <Text style={styles.weddingRevenue}>{formatINRCompact(w.revenue)}</Text>
                  <ImperialBadge
                    label={w.status}
                    variant={w.status === 'CONFIRMED' || w.status === 'EXECUTION' ? 'gold' : 'neutral'}
                    size="sm"
                  />
                </View>
              </View>
            ))
          )}
        </ImperialCard>

        {/* System Health Snapshot */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionHeading}>INFRASTRUCTURE TELEMETRY</Text>
              <Text style={styles.subtext}>Render Cloud & Neon PostgreSQL</Text>
            </View>
            <ImperialBadge label="ONLINE & SECURE" variant="success" />
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>API Gateway:</Text>
            <Text style={styles.itemVal}>https://grand-bandhan.onrender.com</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Keystore Encryption:</Text>
            <Text style={[styles.itemVal, { color: colors.success }]}>
              Hardware-Backed Keystore
            </Text>
          </View>
          <ImperialButton
            title="Inspect Full Telemetry & Diagnostics"
            variant="outline"
            size="sm"
            onPress={() => navigation.navigate('AdminHealth')}
            style={styles.cardBtn}
          />
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
  subtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
  weddingCouple: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  weddingMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  weddingFigures: {
    alignItems: 'flex-end',
  },
  weddingRevenue: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    marginBottom: 3,
  },
  emptyText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
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
  cardBtn: {
    marginTop: spacing.md,
  },
});
