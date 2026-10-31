import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

export const AgencyDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Agency Operations"
        subtitle={`Principal: ${user?.name || 'Grand Bandhan Agency'}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Agency Metrics */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>8</Text>
            <Text style={styles.metricTitle}>Active Weddings</Text>
            <ImperialBadge label="Full Service" variant="gold" size="sm" style={styles.badge} />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>14</Text>
            <Text style={styles.metricTitle}>Pipeline Enquiries</Text>
            <ImperialBadge label="4 High Priority" variant="warning" size="sm" style={styles.badge} />
          </ImperialCard>
        </View>

        {/* Lead Planners */}
        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.sectionHeading}>WEDDING PLANNERS ON ROSTER</Text>
          <View style={styles.divider} />
          <View style={styles.plannerRow}>
            <View>
              <Text style={styles.plannerName}>Priya Sharma</Text>
              <Text style={styles.plannerRole}>Senior Royal Wedding Planner</Text>
            </View>
            <ImperialBadge label="4 Active" variant="gold" />
          </View>
          <View style={styles.plannerRow}>
            <View>
              <Text style={styles.plannerName}>Vikram Malhotra</Text>
              <Text style={styles.plannerRole}>Destination Wedding Lead</Text>
            </View>
            <ImperialBadge label="3 Active" variant="gold" />
          </View>
        </ImperialCard>

        {/* Priority Action */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <Text style={styles.sectionHeading}>NEW ROYAL ENQUIRY</Text>
          <Text style={styles.enquiryTitle}>Rajput Palace Wedding • Udaipur</Text>
          <Text style={styles.enquiryDetails}>₹75,00,000 Budget • 450 Guests • Dec 2026</Text>
          <ImperialButton
            title="Review & Assign Planner"
            variant="primary"
            size="sm"
            onPress={() => {}}
            style={styles.actionBtn}
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
  sectionHeading: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 1.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE8DF',
    marginVertical: spacing.sm,
  },
  plannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3EFE6',
  },
  plannerName: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  plannerRole: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
  },
  enquiryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginTop: spacing.xs,
  },
  enquiryDetails: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    marginTop: spacing.md,
  },
});
