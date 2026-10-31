import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

export const PlannerDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Planner Desk"
        subtitle={`Lead Planner: ${user?.name || 'Grand Bandhan'}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Quick Stats */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>3</Text>
            <Text style={styles.metricTitle}>Assigned Weddings</Text>
            <ImperialBadge label="In Planning" variant="gold" size="sm" style={styles.badge} />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>11</Text>
            <Text style={styles.metricTitle}>Pending Tasks</Text>
            <ImperialBadge label="2 Urgent" variant="danger" size="sm" style={styles.badge} />
          </ImperialCard>
        </View>

        {/* Active Wedding Feature */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>FEATURED WEDDING</Text>
            <ImperialBadge label="EXECUTION PHASE" variant="gold" />
          </View>
          <Text style={styles.weddingTitle}>Aarav Singhania & Ananya Birla</Text>
          <Text style={styles.weddingMeta}>The Oberoi Udaivilas, Udaipur • 500 Guests</Text>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Package Type:</Text>
            <Text style={styles.itemVal}>Full-Service Royal</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Budget Utilization:</Text>
            <Text style={styles.itemVal}>₹1,20,00,000 / ₹1,50,00,000</Text>
          </View>
          <ImperialButton
            title="Manage Wedding Operations"
            variant="secondary"
            size="sm"
            onPress={() => {}}
            style={styles.cardBtn}
          />
        </ImperialCard>

        {/* Priority Tasks */}
        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.sectionHeading}>HIGH PRIORITY TASKS</Text>
          <View style={styles.divider} />
          <View style={styles.taskItem}>
            <View>
              <Text style={styles.taskTitle}>Finalize Sangeet Choreography Quotation</Text>
              <Text style={styles.taskDue}>Due Tomorrow • Sangeet Ceremony</Text>
            </View>
            <ImperialBadge label="URGENT" variant="danger" />
          </View>
          <View style={styles.taskItem}>
            <View>
              <Text style={styles.taskTitle}>Confirm Catering Vendor Arrival Schedule</Text>
              <Text style={styles.taskDue}>Due in 3 days • Reception</Text>
            </View>
            <ImperialBadge label="HIGH" variant="warning" />
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
  weddingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginTop: spacing.xs,
  },
  weddingMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#EDE8DF',
    marginVertical: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
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
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3EFE6',
  },
  taskTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  taskDue: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
