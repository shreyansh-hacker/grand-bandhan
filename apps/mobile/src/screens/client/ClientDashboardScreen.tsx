import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

export const ClientDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Wedding Lounge"
        subtitle={`Honored Couple: ${user?.name || 'Aarav & Ananya'}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Royal Wedding Hero Card */}
        <ImperialCard variant="navySurface" style={styles.card}>
          <Text style={styles.heroPretitle}>THE WEDDING CELEBRATION OF</Text>
          <Text style={styles.heroNames}>Aarav & Ananya</Text>
          <Text style={styles.heroVenue}>The Oberoi Udaivilas, Udaipur • Rajasthan</Text>
          <View style={styles.countdownContainer}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>24</Text>
              <Text style={styles.countdownLabel}>DAYS</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>16</Text>
              <Text style={styles.countdownLabel}>HOURS</Text>
            </View>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNumber}>45</Text>
              <Text style={styles.countdownLabel}>MINS</Text>
            </View>
          </View>
        </ImperialCard>

        {/* Milestone Payment Status */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>PAYMENT MILESTONE</Text>
            <ImperialBadge label="STAGE PAYMENT" variant="gold" />
          </View>
          <Text style={styles.milestoneAmount}>₹25,00,000</Text>
          <Text style={styles.milestoneDue}>Pre-Event Milestone Due in 10 Days</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Total Package Budget:</Text>
            <Text style={styles.itemVal}>₹1,50,00,000</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Total Cleared to Date:</Text>
            <Text style={[styles.itemVal, { color: colors.success }]}>₹75,00,000 (50%)</Text>
          </View>
          <ImperialButton
            title="Review Milestone Invoice"
            variant="secondary"
            size="sm"
            onPress={() => {}}
            style={styles.cardBtn}
          />
        </ImperialCard>

        {/* Pending Approvals */}
        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.sectionHeading}>PENDING APPROVALS</Text>
          <View style={styles.divider} />
          <View style={styles.approvalItem}>
            <View>
              <Text style={styles.approvalTitle}>Floral Mandap Design Selection</Text>
              <Text style={styles.approvalDesc}>3 Curated Vendor Concepts Ready</Text>
            </View>
            <ImperialBadge label="2 DAYS LEFT" variant="warning" />
          </View>
          <ImperialButton
            title="Compare Vendor Quotations"
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
  card: {
    marginBottom: spacing.base,
  },
  heroPretitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  heroNames: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroVenue: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.goldLight,
    textAlign: 'center',
    marginTop: 2,
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  countdownBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 64,
  },
  countdownNumber: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
  },
  countdownLabel: {
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 1,
    marginTop: 2,
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
  milestoneAmount: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavy,
    marginTop: spacing.xs,
  },
  milestoneDue: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
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
  approvalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  approvalTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  approvalDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
