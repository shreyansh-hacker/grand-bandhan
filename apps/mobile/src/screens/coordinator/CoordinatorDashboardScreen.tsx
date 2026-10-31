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
import { eventService, weddingService, verificationService } from '../../api/services';
import { formatTime, formatDate } from '../../utils/formatters';
import { ArrivalStatus } from '@grand-bandhan/shared';
import { queryClient } from '../../api/queryClient';
import { useVerificationManager } from '../../hooks';

export const CoordinatorDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { openVerification } = useVerificationManager();

  const { data: weddings = [] } = useQuery({
    queryKey: ['weddings'],
    queryFn: () => weddingService.list(),
  });

  const activeWedding = weddings[0];

  const {
    data: events = [],
    isLoading: eventsLoading,
    refetch: refetchEvents,
    isRefetching: eventsRefetching,
  } = useQuery({
    queryKey: ['events', activeWedding?.id],
    queryFn: () => eventService.listEvents(activeWedding?.id),
    enabled: true,
  });

  const {
    data: arrivals = [],
    isLoading: arrivalsLoading,
    refetch: refetchArrivals,
    isRefetching: arrivalsRefetching,
  } = useQuery({
    queryKey: ['arrivals', activeWedding?.id],
    queryFn: () => eventService.listArrivals(activeWedding?.id),
    enabled: true,
  });

  const {
    data: verifications = [],
    isLoading: verificationsLoading,
    refetch: refetchVerifications,
  } = useQuery({
    queryKey: ['verifications', activeWedding?.id],
    queryFn: () => (activeWedding?.id ? verificationService.list(activeWedding.id) : []),
    enabled: !!activeWedding?.id,
  });

  const isInitialLoading = eventsLoading && arrivalsLoading;
  const isRefreshing = eventsRefetching || arrivalsRefetching;

  const handleRefresh = () => {
    refetchEvents();
    refetchArrivals();
    refetchVerifications();
  };

  const handleCheckInArrival = async (arrivalId: string) => {
    try {
      await eventService.updateArrival(arrivalId, ArrivalStatus.ARRIVED_ON_TIME);
      queryClient.invalidateQueries({ queryKey: ['arrivals'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      Alert.alert('Arrival Confirmed', 'Vendor marked as arrived on-site.');
    } catch (err: any) {
      Alert.alert('Check-In Error', err.message || 'Could not update vendor arrival.');
    }
  };

  if (isInitialLoading) {
    return (
      <View style={styles.container}>
        <ImperialHeader
          title="On-Ground Command"
          subtitle={`Field Officer: ${user?.name || 'Grand Bandhan Coordinator'}`}
        />
        <View style={styles.content}>
          <LoadingSkeleton height={120} style={styles.skeletonCard} />
          <LoadingSkeleton height={180} style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  const currentEvent = events[0];
  const arrivedCount = arrivals.filter(
    (a) => (a.status as any) === ArrivalStatus.ARRIVED_ON_TIME || (a as any).arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME
  ).length;

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="On-Ground Command"
        subtitle={`Field Officer: ${user?.name || 'Grand Bandhan Coordinator'}`}
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
        {/* Live Event Ceremony Banner */}
        <ImperialCard variant="navySurface" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.bannerBadge}>LIVE CEREMONY RADAR</Text>
            <ImperialBadge
              label={currentEvent?.status || 'IN PLANNING'}
              variant="gold"
            />
          </View>
          <Text style={styles.eventTitle}>
            {currentEvent?.name || (currentEvent as any)?.title || 'Royal Sangeet & Musical Evening'}
          </Text>
          <Text style={styles.eventLocation}>
            {currentEvent?.location || activeWedding?.location || 'The Oberoi Udaivilas, Udaipur'}
          </Text>
          <Text style={styles.eventTime}>
            {currentEvent?.startTime ? formatTime(currentEvent.startTime) : '07:00 PM'} –{' '}
            {currentEvent?.endTime ? formatTime(currentEvent.endTime) : '11:30 PM'} •{' '}
            {activeWedding?.guestCount || 450} Honored Guests
          </Text>
        </ImperialCard>

        {/* Real-Time Vendor Arrival Tracking */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionHeading}>VENDOR ARRIVAL RADAR</Text>
              <Text style={styles.subtext}>Live call-time tracking & venue check-ins</Text>
            </View>
            <ImperialBadge
              label={`${arrivedCount} / ${arrivals.length || 3} ARRIVED`}
              variant={arrivedCount === (arrivals.length || 3) ? 'success' : 'info'}
            />
          </View>
          <View style={styles.divider} />

          {arrivals.length === 0 ? (
            <View style={styles.arrivalRow}>
              <View style={styles.arrivalInfo}>
                <Text style={styles.vendorName}>Sharma Royal Banquet & Catering</Text>
                <Text style={styles.arrivalMeta}>Setup Window: 04:00 PM • Food & Beverage</Text>
              </View>
              <ImperialBadge label="ON SCHEDULE" variant="gold" size="sm" />
            </View>
          ) : (
            arrivals.map((arr) => {
              const isArrived =
                (arr.status as any) === ArrivalStatus.ARRIVED_ON_TIME ||
                (arr as any).arrivalStatus === ArrivalStatus.ARRIVED_ON_TIME;
              const expected = arr.expectedArrivalTime || (arr as any).expectedTime;
              const actual = arr.actualArrivalTime || (arr as any).actualTime;
              return (
                <View key={arr.id} style={styles.arrivalRow}>
                  <View style={styles.arrivalInfo}>
                    <Text style={styles.vendorName}>
                      {arr.vendor?.name || arr.vendorId || 'Empaneled Vendor'}
                    </Text>
                    <Text style={styles.arrivalMeta}>
                      Expected: {expected ? formatTime(expected) : '04:00 PM'} •{' '}
                      {actual ? `Arrived at ${formatTime(actual)}` : 'Pending Check-In'}
                    </Text>
                  </View>
                  {isArrived ? (
                    <ImperialBadge label="ARRIVED" variant="success" size="sm" />
                  ) : (
                    <TouchableOpacity
                      style={styles.checkInBtn}
                      onPress={() => handleCheckInArrival(arr.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.checkInBtnText}>Check In</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </ImperialCard>

        {/* Scheduled Service Verifications Queue */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionHeading}>SCHEDULED SERVICE VERIFICATIONS</Text>
              <Text style={styles.subtext}>Mandatory client & coordinator confirmations</Text>
            </View>
            <ImperialBadge
              label={`${verifications.length} QUEUED`}
              variant="gold"
              size="sm"
            />
          </View>
          <View style={styles.divider} />

          {verifications.length === 0 ? (
            <View style={styles.verificationEmptyBox}>
              <Text style={styles.emptyVerificationText}>
                No pending verifications for current milestone.
              </Text>
              <ImperialButton
                title="Trigger Test Verification Popup"
                variant="secondary"
                size="sm"
                onPress={() => {
                  openVerification({
                    id: 'test-v-1',
                    weddingId: activeWedding?.id || 'w-1',
                    vendorId: 'v-1',
                    serviceName: 'Grand Shehnai & Nagada Procession',
                    scheduledConfirmationTime: new Date().toISOString(),
                    status: 'AWAITING_CONFIRMATION',
                    vendor: {
                      id: 'v-1',
                      name: 'Royal Heritage Orchestration',
                      category: 'DJ_MUSIC',
                    },
                  });
                }}
                style={styles.cardBtn}
              />
            </View>
          ) : (
            verifications.map((v) => (
              <TouchableOpacity
                key={v.id}
                style={styles.verificationRow}
                onPress={() => openVerification(v)}
                activeOpacity={0.7}
              >
                <View style={styles.verificationInfo}>
                  <Text style={styles.verificationService}>{v.serviceName}</Text>
                  <Text style={styles.verificationVendor}>
                    {v.vendor?.name || 'Vendor Partner'} • {v.vendor?.category || 'Service'}
                  </Text>
                </View>
                <ImperialBadge
                  label={v.status}
                  variant={v.status === 'CONFIRMED' ? 'success' : 'warning'}
                  size="sm"
                />
              </TouchableOpacity>
            ))
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
  card: {
    marginBottom: spacing.md,
  },
  bannerBadge: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
    letterSpacing: 1.5,
  },
  eventTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  eventLocation: {
    fontSize: typography.fontSize.xs,
    color: colors.goldLight,
    marginTop: 2,
  },
  eventTime: {
    fontSize: typography.fontSize.xs,
    color: '#D1D5DB',
    marginTop: 4,
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
  arrivalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  arrivalInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  vendorName: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  arrivalMeta: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkInBtn: {
    backgroundColor: colors.imperialNavy,
    borderRadius: borderRadius.sm,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  checkInBtnText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.goldLight,
  },
  verificationEmptyBox: {
    paddingVertical: spacing.xs,
  },
  emptyVerificationText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  verificationInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  verificationService: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  verificationVendor: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardBtn: {
    marginTop: spacing.sm,
  },
});
