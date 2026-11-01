import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialButton,
  ImperialBadge,
} from '../../components';
import { weddingService, taskService, WeddingSummary } from '../../api/services';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface WeddingDetailScreenProps {
  weddingId: string;
  onBack?: () => void;
  onViewTasks?: (weddingId: string) => void;
  onViewQuotations?: (weddingId: string) => void;
}

export const WeddingDetailScreen: React.FC<WeddingDetailScreenProps> = ({
  weddingId,
  onBack,
  onViewTasks,
  onViewQuotations,
}) => {
  const [wedding, setWedding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      const data = await weddingService.getById(weddingId);
      setWedding(data);
    } catch (err: any) {
      Alert.alert('Error', 'Failed to load wedding details');
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleRegeneratePlan = async () => {
    Alert.alert(
      'Regenerate Planning Tasks',
      'This will recalculate all instant milestone tasks, dynamic vendor lead times, and scheduling benchmarks based on the wedding date. Proceed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'default',
          onPress: async () => {
            setRegenerating(true);
            try {
              const res = await taskService.regenerate(weddingId);
              Alert.alert('Plan Generated', res.message || 'Tasks successfully generated.');
              fetchDetail();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to regenerate plan.');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.loadingText}>Loading Royal Command Center...</Text>
      </View>
    );
  }

  if (!wedding) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Wedding not found.</Text>
        {onBack && (
          <ImperialButton
            title="← Back to Weddings"
            variant="outline"
            onPress={onBack}
            style={{ marginTop: spacing.md }}
          />
        )}
      </View>
    );
  }

  const tasksCount = wedding.tasks?.length || 0;
  const tasksCompleted = wedding.tasks?.filter((t: any) => t.status === 'COMPLETED').length || 0;
  const progressPct = tasksCount ? Math.round((tasksCompleted / tasksCount) * 100) : 0;

  return (
    <View style={styles.container}>
      <ImperialHeader
        title={`${wedding.brideName} & ${wedding.groomName}`}
        subtitle={`Wedding Hub • ${wedding.weddingCode || 'GB-WED'}`}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backRow}>
            <Text style={styles.backText}>← Back to Portfolio</Text>
          </TouchableOpacity>
        )}

        {/* Hero Card */}
        <ImperialGlassCard style={styles.heroCard} tone="gold">
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroCode}>{wedding.weddingCode || 'GB-IMPERIAL'}</Text>
              <Text style={styles.heroNames}>
                {wedding.brideName} & {wedding.groomName}
              </Text>
            </View>
            <ImperialBadge
              label={wedding.status}
              variant={wedding.status === 'COMPLETED' ? 'success' : 'gold'}
            />
          </View>

          <View style={styles.heroGrid}>
            <View style={styles.heroItem}>
              <Text style={styles.heroLabel}>📍 Destination</Text>
              <Text style={styles.heroVal}>{wedding.location}</Text>
            </View>
            <View style={styles.heroItem}>
              <Text style={styles.heroLabel}>📅 Date</Text>
              <Text style={styles.heroVal}>
                {wedding.weddingDate ? formatDate(wedding.weddingDate) : 'TBD'}
              </Text>
            </View>
            <View style={styles.heroItem}>
              <Text style={styles.heroLabel}>👑 Package</Text>
              <Text style={styles.heroVal}>{wedding.packageType?.replace(/_/g, ' ')}</Text>
            </View>
            <View style={styles.heroItem}>
              <Text style={styles.heroLabel}>👥 Guests</Text>
              <Text style={styles.heroVal}>{wedding.guestCount} pax</Text>
            </View>
          </View>
        </ImperialGlassCard>

        {/* Financial Escrow Breakdown */}
        <ImperialGlassCard style={styles.sectionCard} tone="navy">
          <Text style={styles.sectionTitle}>💰 Budget & Financial Escrow</Text>
          <View style={styles.financeGrid}>
            <View style={styles.financeBox}>
              <Text style={styles.financeLabel}>Total Approved Budget</Text>
              <Text style={styles.financeValueGold}>
                {formatCurrency(wedding.budgetMax || wedding.totalAmount || 0)}
              </Text>
            </View>
            <View style={styles.financeBox}>
              <Text style={styles.financeLabel}>Escrow Deposited</Text>
              <Text style={styles.financeValueGreen}>
                {formatCurrency(wedding.totalPaid || 0)}
              </Text>
            </View>
          </View>

          <View style={styles.agreementRow}>
            <Text style={styles.agreementLabel}>Digital Contract Status:</Text>
            <ImperialBadge
              label={wedding.agreement?.status || 'SIGNED'}
              variant={wedding.agreement?.status === 'SIGNED' ? 'success' : 'info'}
              size="sm"
            />
          </View>
        </ImperialGlassCard>

        {/* Milestone Progress & Task Regeneration Hub */}
        <ImperialGlassCard style={styles.sectionCard} tone="navy">
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>📋 Task Execution Board</Text>
              <Text style={styles.sectionSubtitle}>
                {tasksCompleted} of {tasksCount} milestones achieved ({progressPct}%)
              </Text>
            </View>
            <ImperialBadge
              label={`${progressPct}% DONE`}
              variant={progressPct >= 80 ? 'success' : 'warning'}
              size="sm"
            />
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>

          <View style={styles.taskActions}>
            <ImperialButton
              title={regenerating ? 'Recalculating...' : '⚡ Regenerate Dynamic Plan'}
              variant="outline"
              loading={regenerating}
              onPress={handleRegeneratePlan}
              style={styles.actionBtn}
            />
            {onViewTasks && (
              <ImperialButton
                title="Open Tasks Board →"
                variant="gold"
                onPress={() => onViewTasks(weddingId)}
                style={styles.actionBtn}
              />
            )}
          </View>
        </ImperialGlassCard>

        {/* Multi-Vendor Quotations Quick Shortcut */}
        <ImperialGlassCard style={styles.sectionCard} tone="navy">
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>🏷️ Quotations & Procurement</Text>
              <Text style={styles.sectionSubtitle}>
                Multi-Vendor Quotations comparison engine
              </Text>
            </View>
          </View>
          <Text style={styles.quotationDesc}>
            Review competing vendor bids per service category, analyze per-plate margins, and award final contracts.
          </Text>
          {onViewQuotations && (
            <ImperialButton
              title="Compare Multi-Vendor Quotations →"
              variant="gold"
              onPress={() => onViewQuotations(weddingId)}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </ImperialGlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.gold,
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.fontSize.md,
  },
  backRow: {
    marginBottom: spacing.xs,
  },
  backText: {
    color: colors.gold,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  heroCard: {
    padding: spacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  heroCode: {
    fontSize: typography.fontSize.xs,
    color: colors.goldDark,
    fontWeight: typography.fontWeight.bold,
  },
  heroNames: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavyDark,
    marginTop: 2,
  },
  heroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  heroItem: {
    width: '47%',
  },
  heroLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: '#6B7280',
  },
  heroVal: {
    fontSize: typography.fontSize.sm,
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  sectionCard: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  financeGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  financeBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  financeLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
  },
  financeValueGold: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
    marginTop: 4,
  },
  financeValueGreen: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginTop: 4,
  },
  agreementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: spacing.xs + 2,
  },
  agreementLabel: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    marginVertical: spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 4,
  },
  taskActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
  quotationDesc: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    lineHeight: 18,
    marginVertical: spacing.xs,
  },
});
