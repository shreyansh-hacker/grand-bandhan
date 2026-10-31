import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { ImperialHeader, ImperialCard, ImperialBadge, ImperialButton } from '../../components';
import { healthService } from '../../api/services/health.service';
import { ApiStatusResponse, NeonDbStatusResponse } from '../../types';

export const ApiHealthScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [healthData, setHealthData] = useState<ApiStatusResponse | null>(null);
  const [neonData, setNeonData] = useState<NeonDbStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const [health, neon] = await Promise.all([
        healthService.getHealth(),
        healthService.getNeonStatus(),
      ]);
      setHealthData(health);
      setNeonData(neon);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Infrastructure Health"
        subtitle="Live Render Backend & Neon PostgreSQL Telemetry"
      />
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchStatus} colors={[colors.gold]} />
        }
      >
        {/* Status Overview Card */}
        <ImperialCard
          variant={healthData?.neon.connected ? 'goldAccent' : 'elevated'}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Render API Backend</Text>
            <ImperialBadge
              label={healthData ? 'ONLINE' : 'UNREACHABLE'}
              variant={healthData ? 'success' : 'danger'}
            />
          </View>
          <Text style={styles.urlText}>https://grand-bandhan.onrender.com</Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Status:</Text>
            <Text style={styles.metricValue}>{healthData?.status || 'Unknown'}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Service:</Text>
            <Text style={styles.metricValue}>{healthData?.service || 'Grand Bandhan API'}</Text>
          </View>
          {lastChecked && (
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Last Checked:</Text>
              <Text style={styles.metricValue}>{lastChecked}</Text>
            </View>
          )}
        </ImperialCard>

        {/* Neon Database Telemetry Card */}
        <ImperialCard variant="navySurface" style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.goldLight }]}>
              Neon PostgreSQL Database
            </Text>
            <ImperialBadge
              label={neonData?.neon.status === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
              variant={neonData?.neon.status === 'connected' ? 'success' : 'danger'}
            />
          </View>

          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.goldMuted }]}>Database:</Text>
            <Text style={[styles.metricValue, { color: colors.white }]}>
              {neonData?.neon.database || 'neondb'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.goldMuted }]}>Branch:</Text>
            <Text style={[styles.metricValue, { color: colors.white }]}>
              {neonData?.neon.branch || 'production'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.goldMuted }]}>Engine:</Text>
            <Text style={[styles.metricValue, { color: colors.white }]}>
              {neonData?.neon.postgresVersion ? 'PostgreSQL 18.6' : 'PostgreSQL'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.goldMuted }]}>Database Driver:</Text>
            <Text style={[styles.metricValue, { color: colors.goldLight }]}>
              {healthData?.neon.driver || 'prisma-client'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.goldMuted }]}>Active Agencies:</Text>
            <Text style={[styles.metricValue, { color: colors.white, fontWeight: '700' }]}>
              {neonData?.neon.metrics.agencies ?? '...'}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.goldMuted }]}>Total Seeded Users:</Text>
            <Text style={[styles.metricValue, { color: colors.gold, fontWeight: '700' }]}>
              {neonData?.neon.metrics.users ?? '...'}
            </Text>
          </View>
        </ImperialCard>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <ImperialButton
          title="Refresh Health Telemetry"
          onPress={fetchStatus}
          loading={loading}
          variant="outline"
          style={styles.refreshButton}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  urlText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDE8DF',
  },
  metricLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  metricValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.sm,
  },
  refreshButton: {
    marginTop: spacing.sm,
  },
});
