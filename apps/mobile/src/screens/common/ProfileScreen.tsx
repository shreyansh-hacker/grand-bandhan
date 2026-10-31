import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { useAuthStore } from '../../store/authStore';
import { formatRoleLabel } from '../../utils/formatters';

export const ProfileScreen: React.FC = () => {
  const { user, role, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Confirm Sign Out',
      'Are you sure you want to end your imperial session? Your Keystore session will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Profile"
        subtitle="Account & Keystore Security Credentials"
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <ImperialCard variant="goldAccent" style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Grand Bandhan User'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'user@grandbandhan.com'}</Text>
              <ImperialBadge
                label={formatRoleLabel(role || 'USER')}
                variant="gold"
                style={styles.badge}
              />
            </View>
          </View>
        </ImperialCard>

        {/* Security & Credentials Details */}
        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.sectionTitle}>SESSION DETAILS</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>User ID</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {user?.id || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Agency ID</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {user?.agencyId || 'N/A'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned Role</Text>
            <Text style={styles.detailValue}>{role || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hardware Keystore</Text>
            <Text style={[styles.detailValue, { color: colors.success }]}>
              Active (AES-256 GCM)
            </Text>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Connected Backend</Text>
            <Text style={styles.detailValue}>Render Cloud (HTTPS)</Text>
          </View>
        </ImperialCard>

        {/* Logout Button */}
        <ImperialButton
          title="Sign Out of Session"
          onPress={handleLogout}
          loading={isLoading}
          variant="danger"
          size="lg"
          style={styles.logoutButton}
        />
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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.imperialNavy,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  badge: {
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDE8DF',
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
    maxWidth: 200,
    textAlign: 'right',
  },
  logoutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
