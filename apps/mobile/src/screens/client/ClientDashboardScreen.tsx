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
  ImperialLogo,
  LoadingSkeleton,
} from '../../components';
import { useAuthStore } from '../../store/authStore';
import { weddingService, verificationService } from '../../api/services';
import { formatINRCompact, formatDate, getCountdown } from '../../utils/formatters';
import { useVerificationManager } from '../../hooks';

export const ClientDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { openVerification } = useVerificationManager();

  const {
    data: weddings = [],
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ['weddings'],
    queryFn: () => weddingService.list(),
  });

  const wedding = weddings[0];

  const { data: verifications = [] } = useQuery({
    queryKey: ['verifications', wedding?.id],
    queryFn: () => (wedding?.id ? verificationService.list(wedding.id) : []),
    enabled: !!wedding?.id,
  });

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.container}>
        <ImperialHeader
          title="Royal Wedding Lounge"
          subtitle={`Honored Couple: ${user?.name || 'Grand Bandhan'}`}
        />
        <View style={styles.content}>
          <LoadingSkeleton height={180} style={styles.skeletonCard} />
          <LoadingSkeleton height={140} style={styles.skeletonCard} />
        </View>
      </View>
    );
  }

  const countdown = getCountdown(wedding?.weddingDate || '2026-12-15T00:00:00Z');
  const brideGroomTitle = wedding
    ? `${wedding.brideName} & ${wedding.groomName}`
    : user?.name || 'Aarav & Ananya';

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Wedding Lounge"
        subtitle={`Honored Couple: ${user?.name || brideGroomTitle}`}
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
        {/* Royal Wedding Hero Card */}
        <ImperialCard variant="navySurface" style={styles.heroCard}>
          <View style={styles.crestContainer}>
            <ImperialLogo size="sm" withGlow />
          </View>
          <Text style={styles.heroPretitle}>THE WEDDING CELEBRATION OF</Text>
          <Text style={styles.heroNames}>{brideGroomTitle}</Text>
          <Text style={styles.heroVenue}>
            {wedding?.location || 'The Oberoi Udaivilas, Udaipur • Rajasthan'}
          </Text>

          {/* Countdown Boxes */}
          <View style={styles.countdownContainer}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{countdown.days}</Text>
              <Text style={styles.countdownLabel}>DAYS</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{countdown.hours}</Text>
              <Text style={styles.countdownLabel}>HOURS</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>{countdown.mins}</Text>
              <Text style={styles.countdownLabel}>MINS</Text>
            </View>
          </View>
        </ImperialCard>

        {/* Wedding Planning Progress */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>ROYAL WEDDING PROGRESS</Text>
            <ImperialBadge
              label={`${wedding?.tasksProgress ?? 65}% COMPLETE`}
              variant="gold"
              size="sm"
            />
          </View>
          <View style={styles.divider} />

          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, wedding?.tasksProgress ?? 65)}%` },
              ]}
            />
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Wedding Date:</Text>
            <Text style={styles.itemVal}>
              {formatDate(wedding?.weddingDate || '2026-12-15')}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Guest Count:</Text>
            <Text style={styles.itemVal}>{wedding?.guestCount || 350} Guests Expected</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Wedding Planner:</Text>
            <Text style={styles.itemVal}>{wedding?.plannerName || 'Grand Bandhan Concierge'}</Text>
          </View>
        </ImperialCard>

        {/* Milestone Payment Status */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>FINANCIAL MILESTONES</Text>
            <ImperialBadge label="SECURE ESCROW" variant="gold" size="sm" />
          </View>
          <Text style={styles.milestoneAmount}>
            {formatINRCompact(wedding?.totalPaid ?? 7500000)}
          </Text>
          <Text style={styles.milestoneDue}>
            Total Cleared to Date of {formatINRCompact(wedding?.totalAmount ?? wedding?.budgetMax ?? 15000000)}
          </Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Package Type:</Text>
            <Text style={styles.itemVal}>{wedding?.packageType || 'Full-Service Royal'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Digital Agreement:</Text>
            <Text style={[styles.itemVal, { color: colors.success }]}>
              {wedding?.agreementStatus || 'FULLY EXECUTED ✍️'}
            </Text>
          </View>
        </ImperialCard>

        {/* Live Service Verification Banner */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionHeading}>SERVICE VERIFICATION DESK</Text>
              <Text style={styles.subtext}>Inspect and approve on-ground deliverables</Text>
            </View>
            <ImperialBadge label="ACTIVE" variant="info" size="sm" />
          </View>
          <View style={styles.divider} />

          <Text style={styles.verificationDesc}>
            Grand Bandhan empowers royal couples to confirm vendor services directly from the mobile app as each celebration begins.
          </Text>

          <ImperialButton
            title="Inspect & Verify Milestone Services"
            variant="primary"
            size="sm"
            onPress={() => {
              if (verifications.length > 0) {
                openVerification(verifications[0]);
              } else {
                openVerification({
                  id: 'client-v-1',
                  weddingId: wedding?.id || 'w-1',
                  vendorId: 'v-1',
                  serviceName: 'Bridal Floral Scenography & Jaimala Stage',
                  scheduledConfirmationTime: new Date().toISOString(),
                  status: 'AWAITING_CONFIRMATION',
                  vendor: {
                    id: 'v-1',
                    name: 'Vogue Palace Florals',
                    category: 'FLORIST',
                  },
                });
              }
            }}
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
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  crestContainer: {
    marginBottom: spacing.xs,
  },
  heroPretitle: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
    letterSpacing: 2,
    marginTop: 4,
  },
  heroNames: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.white,
    letterSpacing: 0.5,
    marginVertical: 4,
    textAlign: 'center',
  },
  heroVenue: {
    fontSize: typography.fontSize.xs,
    color: colors.goldLight,
    textAlign: 'center',
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  countdownBox: {
    backgroundColor: 'rgba(201, 169, 106, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 106, 0.4)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    minWidth: 64,
  },
  countdownNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
  },
  countdownLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    color: '#D1D5DB',
    letterSpacing: 1,
    marginTop: 2,
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
  progressBarBg: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 4,
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
  milestoneAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavy,
    marginTop: spacing.xs,
  },
  milestoneDue: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  verificationDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  cardBtn: {
    marginTop: spacing.xs,
  },
});
