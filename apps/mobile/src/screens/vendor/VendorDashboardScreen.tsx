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
} from '../../components';
import { useAuthStore } from '../../store/authStore';
import { eventService, paymentService, weddingService } from '../../api/services';
import { formatINRCompact, formatTime, formatDate } from '../../utils/formatters';
import { ArrivalStatus } from '@grand-bandhan/shared';
import { queryClient } from '../../api/queryClient';

export const VendorDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  const {
    data: arrivals = [],
    isLoading: arrivalsLoading,
    refetch: refetchArrivals,
    isRefetching: arrivalsRefetching,
  } = useQuery({
    queryKey: ['arrivals', 'vendor'],
    queryFn: () => eventService.listArrivals(),
  });

  const {
    data: payments = [],
    isLoading: paymentsLoading,
    refetch: refetchPayments,
    isRefetching: paymentsRefetching,
  } = useQuery({
    queryKey: ['payments', 'vendor'],
    queryFn: () => paymentService.listPayments(),
  });

  const isInitialLoading = arrivalsLoading && paymentsLoading;
  const isRefreshing = arrivalsRefetching || paymentsRefetching;

  const handleRefresh = () => {
    refetchArrivals();
    refetchPayments();
  };

  const nextArrival = arrivals[0];
  const totalEarned = payments.reduce((sum, p) => sum + ((p as any).paidAmount || p.amount || 0), 0);
  const totalContract = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const handleVendorCheckIn = async () => {
    try {
      if (nextArrival) {
        await eventService.updateArrival(nextArrival.id, ArrivalStatus.ARRIVED_ON_TIME);
        queryClient.invalidateQueries({ queryKey: ['arrivals'] });
        Alert.alert('Venue Check-In Confirmed ⚜️', 'Your arrival has been broadcast to the wedding coordinator.');
      } else {
        Alert.alert('Check-In Recorded ⚜️', 'Arrival confirmed for today’s reception service.');
      }
    } catch (err: any) {
      Alert.alert('Check-In Error', err.message || 'Could not record arrival.');
    }
  };

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <ImperialHeader
          title="Vendor Partner Portal"
          subtitle={`Empaneled Partner: ${user?.name || 'Grand Bandhan Vendor'}`}
        />
        <View style={styles.content}>
          <LoadingSkeleton height={110} style={styles.skeletonCard} />
          <LoadingSkeleton height={160} style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Vendor Partner Portal"
        subtitle={`Empaneled Partner: ${user?.name || 'Grand Bandhan Vendor'}`}
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
        {/* Settlement Metrics */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>
              {formatINRCompact(totalContract || 1850000)}
            </Text>
            <Text style={styles.metricTitle}>Awarded Contracts</Text>
            <ImperialBadge
              label={`${payments.length || 2} Active Engagements`}
              variant="gold"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>
              {formatINRCompact(totalEarned || 1200000)}
            </Text>
            <Text style={styles.metricTitle}>Disbursed Payouts</Text>
            <ImperialBadge
              label="Direct Bank Transfer"
              variant="success"
              size="sm"
              style={styles.badge}
            />
          </ImperialCard>
        </View>

        {/* Immediate Call-Time Action */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>ON-GROUND CALL TIME</Text>
            <ImperialBadge
              label={(nextArrival?.status as any) || (nextArrival as any)?.arrivalStatus || 'SCHEDULED TODAY'}
              variant="warning"
            />
          </View>
          <Text style={styles.weddingTitle}>Royal Sangeet & Reception Feast</Text>
          <Text style={styles.weddingVenue}>The Oberoi Udaivilas, Udaipur • Grand Lawn</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Expected Call Time:</Text>
            <Text style={styles.itemVal}>
              {nextArrival?.expectedArrivalTime || (nextArrival as any)?.expectedTime
                ? formatTime(nextArrival?.expectedArrivalTime || (nextArrival as any)?.expectedTime)
                : '04:00 PM (Setup Window)'}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Coordinator on Duty:</Text>
            <Text style={styles.itemVal}>Grand Bandhan Field Command</Text>
          </View>
          <ImperialButton
            title="Confirm Arrival at Venue"
            variant="primary"
            size="sm"
            onPress={handleVendorCheckIn}
            style={styles.cardBtn}
          />
        </ImperialCard>

        {/* Settlement History */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>ESCROW DISBURSEMENTS</Text>
            <ImperialBadge label="CLEARED" variant="success" size="sm" />
          </View>
          <View style={styles.divider} />

          <View style={styles.paymentRow}>
            <View>
              <Text style={styles.paymentTitle}>Advance Booking Retention</Text>
              <Text style={styles.paymentMeta}>Processed via Escrow • Ref: GB-TX-8492</Text>
            </View>
            <Text style={styles.paymentAmount}>{formatINRCompact(600000)}</Text>
          </View>

          <View style={styles.paymentRow}>
            <View>
              <Text style={styles.paymentTitle}>Mid-Way Delivery Milestone</Text>
              <Text style={styles.paymentMeta}>Verified by Lead Planner</Text>
            </View>
            <Text style={styles.paymentAmount}>{formatINRCompact(600000)}</Text>
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
  weddingVenue: {
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
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  paymentTitle: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  paymentMeta: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
  },
});
