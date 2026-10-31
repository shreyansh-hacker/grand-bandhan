import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing, shadows } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

export const AdminDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Imperial Administration"
        subtitle={`Welcome, ${user?.name || 'Administrator'}`}
        rightAction={{
          label: 'Health',
          icon: '⚡',
          onPress: () => navigation.navigate('AdminHealth'),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top Metric Cards */}
        <View style={styles.metricsGrid}>
          <ImperialCard variant="navySurface" style={styles.metricCard}>
            <Text style={styles.metricNumber}>12</Text>
            <Text style={styles.metricTitle}>Active Weddings</Text>
            <ImperialBadge label="+3 this month" variant="gold" size="sm" style={styles.badge} />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>48</Text>
            <Text style={styles.metricTitle}>Total Enquiries</Text>
            <ImperialBadge label="7 pending" variant="warning" size="sm" style={styles.badge} />
          </ImperialCard>
        </View>

        <View style={styles.metricsGrid}>
          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>36</Text>
            <Text style={styles.metricTitle}>Empaneled Vendors</Text>
            <ImperialBadge label="100% Verified" variant="success" size="sm" style={styles.badge} />
          </ImperialCard>

          <ImperialCard variant="elevated" style={styles.metricCard}>
            <Text style={[styles.metricNumber, { color: colors.imperialNavy }]}>₹1.4Cr</Text>
            <Text style={styles.metricTitle}>Platform Volume</Text>
            <ImperialBadge label="Settled" variant="gold" size="sm" style={styles.badge} />
          </ImperialCard>
        </View>

        {/* System Health Snapshot */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionHeading}>INFRASTRUCTURE STATUS</Text>
              <Text style={styles.subtext}>Render Cloud & Neon PostgreSQL</Text>
            </View>
            <ImperialBadge label="HEALTHY" variant="success" />
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Database Driver:</Text>
            <Text style={styles.itemVal}>prisma-client (PostgreSQL 18.6)</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.itemLabel}>Keystore Security:</Text>
            <Text style={[styles.itemVal, { color: colors.success }]}>Hardware-Backed (AES-256)</Text>
          </View>
          <ImperialButton
            title="View Real-Time Telemetry"
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
    alignSelf: 'flex-start',
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
    letterSpacing: 1,
  },
  subtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
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
});
