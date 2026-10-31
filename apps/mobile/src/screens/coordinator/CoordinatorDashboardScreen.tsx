import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { useAuthStore } from '../../store/authStore';

export const CoordinatorDashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="On-Ground Command"
        subtitle={`Field Officer: ${user?.name || 'Grand Bandhan Coordinator'}`}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Live Event Banner */}
        <ImperialCard variant="navySurface" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.bannerBadge}>LIVE ON-GROUND CEREMONY</Text>
            <ImperialBadge label="IN PROGRESS" variant="gold" />
          </View>
          <Text style={styles.eventTitle}>Royal Sangeet & Musical Night</Text>
          <Text style={styles.eventLocation}>Grand Ballroom, The Oberoi Udaivilas</Text>
          <Text style={styles.eventTime}>07:00 PM – 11:30 PM • 450 Attendees</Text>
        </ImperialCard>

        {/* Vendor Arrival Tracking */}
        <ImperialCard variant="elevated" style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionHeading}>VENDOR ARRIVALS</Text>
            <ImperialBadge label="3 OF 5 ARRIVED" variant="info" />
          </View>
          <View style={styles.divider} />

          <View style={styles.arrivalRow}>
            <View>
              <Text style={styles.vendorName}>Sharma Royal Caterers</Text>
              <Text style={styles.arrivalMeta}>Setup Time: 04:00 PM</Text>
            </View>
            <ImperialBadge label="ARRIVED ON TIME" variant="success" />
          </View>

          <View style={styles.arrivalRow}>
            <View>
              <Text style={styles.vendorName}>Elite Sound & Lighting</Text>
              <Text style={styles.arrivalMeta}>Expected: 05:00 PM (15 min delay)</Text>
            </View>
            <ImperialBadge label="DELAYED" variant="warning" />
          </View>

          <View style={styles.arrivalRow}>
            <View>
              <Text style={styles.vendorName}>Vogue Floral Designers</Text>
              <Text style={styles.arrivalMeta}>Expected: 05:30 PM</Text>
            </View>
            <ImperialBadge label="PENDING" variant="neutral" />
          </View>
        </ImperialCard>

        {/* Real-time Verification Actions */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <Text style={styles.sectionHeading}>SCHEDULED SERVICE VERIFICATION</Text>
          <Text style={styles.verificationTitle}>Stage Decor & Mandap Floral Quality</Text>
          <Text style={styles.verificationNote}>
            Mandatory coordinator audit 30 minutes before ceremony commencement.
          </Text>
          <ImperialButton
            title="Perform Verification Audit"
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
  card: {
    marginBottom: spacing.base,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bannerBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 1.5,
  },
  eventTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginTop: spacing.xs,
  },
  eventLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.goldLight,
    marginTop: 2,
  },
  eventTime: {
    fontSize: typography.fontSize.xs,
    color: '#CBD5E1',
    marginTop: 4,
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
  arrivalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3EFE6',
  },
  vendorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  arrivalMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  verificationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginTop: spacing.xs,
  },
  verificationNote: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actionBtn: {
    marginTop: spacing.md,
  },
});
