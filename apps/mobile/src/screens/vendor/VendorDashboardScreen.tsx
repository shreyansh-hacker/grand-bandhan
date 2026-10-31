import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

export const VendorDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Vendor Partner Portal"
        subtitle={`Empaneled Partner: ${user?.name || 'Sharma Royal Catering'}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Settlement Metrics */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>₹18.5L</Text>
            <Text style={styles.metricTitle}>Awarded Contracts</Text>
            <ImperialBadge label="2 Active" variant="gold" size="sm" style={styles.badge} />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>₹12.0L</Text>
            <Text style={styles.metricTitle}>Disbursed Payouts</Text>
            <ImperialBadge label="All Cleared" variant="success" size="sm" style={styles.badge} />
          </ImperialCard>
        </View>

        {/* Immediate Action */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>UPCOMING WEDDING EVENT</Text>
            <ImperialBadge label="TODAY" variant="warning" />
          </View>
          <Text style={styles.weddingTitle}>Aarav & Ananya • Royal Reception</Text>
          <Text style={styles.weddingVenue}>The Oberoi Udaivilas, Udaipur</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Expected Arrival:</Text>
            <Text style={styles.itemVal}>04:00 PM (Setup Window)</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Service Scope:</Text>
            <Text style={styles.itemVal}>Royal Rajasthani & Continental Feast</Text>
          </View>
          <ImperialButton
            title="Confirm Arrival Check-In"
            variant="primary"
            size="sm"
            onPress={() => {}}
            style={styles.cardBtn}
          />
        </ImperialCard>

        {/* Active Quotation Invitations */}
        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.sectionHeading}>NEW QUOTATION INVITATION</Text>
          <View style={styles.divider} />
          <View style={styles.quoteRow}>
            <View>
              <Text style={styles.quoteTitle}>Singhania Wedding • Sangeet Gala</Text>
              <Text style={styles.quoteMeta}>500 Guests • Live Culinary Counters</Text>
            </View>
            <ImperialBadge label="INVITED" variant="info" />
          </View>
          <ImperialButton
            title="Submit Quotation Proposal"
            variant="outline"
            size="sm"
            onPress={() => {}}
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
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    padding: spacing.md,
  },
  metricNumber: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
  },
  metricTitle: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  badge: {
    marginTop: 4,
  },
  card: {
    marginBottom: spacing.base,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  sectionHeading: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 1.2,
  },
  weddingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginTop: spacing.xs,
  },
  weddingVenue: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE8DF',
    marginVertical: spacing.sm,
  },
  itemLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  itemVal: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  cardBtn: {
    marginTop: spacing.md,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  quoteTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  quoteMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
