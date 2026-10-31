import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialBadge,
  LoadingSkeleton,
  EmptyState,
} from '../../components';
import { paymentService, weddingService, WeddingSummary } from '../../api/services';
import { Payment, PaymentStatus } from '@grand-bandhan/shared';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface PaymentsScreenProps {
  initialWeddingId?: string;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ initialWeddingId }) => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(initialWeddingId || '');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'MILESTONES' | 'SETTLEMENTS'>('MILESTONES');

  const loadWeddings = useCallback(async () => {
    try {
      const list = await weddingService.list();
      setWeddings(list);
      if (!selectedWeddingId && list.length > 0) {
        setSelectedWeddingId(list[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load weddings:', err?.message);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    loadWeddings();
  }, [loadWeddings]);

  const fetchData = useCallback(async () => {
    if (!selectedWeddingId) {
      setLoading(false);
      return;
    }
    try {
      const [paymentsData, settlementsData] = await Promise.all([
        paymentService.listPayments(selectedWeddingId),
        paymentService.listSettlements(selectedWeddingId),
      ]);
      setPayments(paymentsData);
      setSettlements(settlementsData);
    } catch (err: any) {
      console.warn('Failed to load payments/settlements:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const totalPaid = payments
    .filter((p) => p.status === PaymentStatus.PAID)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = payments
    .filter((p) => p.status === PaymentStatus.PENDING)
    .reduce((sum, p) => sum + p.amount, 0);

  const getPaymentVariant = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'success';
      case PaymentStatus.OVERDUE:
        return 'danger';
      case PaymentStatus.PENDING:
      default:
        return 'warning';
    }
  };

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Escrow & Payments"
        subtitle="Milestone Tranches & Vendor Settlements"
      />

      {/* Wedding Selector */}
      {weddings.length > 0 && (
        <View style={styles.selectorBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectorScroll}>
            {weddings.map((w) => (
              <TouchableOpacity
                key={w.id}
                style={[
                  styles.selectorPill,
                  selectedWeddingId === w.id && styles.selectorPillActive,
                ]}
                onPress={() => setSelectedWeddingId(w.id)}
              >
                <Text
                  style={[
                    styles.selectorPillText,
                    selectedWeddingId === w.id && styles.selectorPillTextActive,
                  ]}
                >
                  {w.brideName} & {w.groomName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Overview Escrow Banner */}
      <View style={styles.bannerContainer}>
        <ImperialGlassCard style={styles.bannerCard} tone="gold">
          <View style={styles.bannerRow}>
            <View style={styles.bannerCol}>
              <Text style={styles.bannerLabel}>Total Disbursed</Text>
              <Text style={styles.bannerGreen}>{formatCurrency(totalPaid)}</Text>
            </View>
            <View style={styles.bannerDivider} />
            <View style={styles.bannerCol}>
              <Text style={styles.bannerLabel}>Escrow Pending</Text>
              <Text style={styles.bannerGold}>{formatCurrency(totalPending)}</Text>
            </View>
          </View>
        </ImperialGlassCard>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'MILESTONES' && styles.tabItemActive]}
          onPress={() => setActiveTab('MILESTONES')}
        >
          <Text style={[styles.tabText, activeTab === 'MILESTONES' && styles.tabTextActive]}>
            💰 Client Milestones ({payments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'SETTLEMENTS' && styles.tabItemActive]}
          onPress={() => setActiveTab('SETTLEMENTS')}
        >
          <Text style={[styles.tabText, activeTab === 'SETTLEMENTS' && styles.tabTextActive]}>
            🤝 Vendor Settlements ({settlements.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.gold}
          />
        }
      >
        {loading ? (
          <LoadingSkeleton height={100} count={3} />
        ) : activeTab === 'MILESTONES' ? (
          payments.length === 0 ? (
            <EmptyState
              title="No Payment Milestones"
              message="No milestone payments registered for this wedding."
            />
          ) : (
            payments.map((p) => (
              <ImperialGlassCard key={p.id} style={styles.paymentCard} tone="navy">
                <View style={styles.paymentHeader}>
                  <View>
                    <Text style={styles.paymentTitle}>{p.notes || p.milestone?.replace(/_/g, ' ') || 'Milestone Tranche'}</Text>
                    <Text style={styles.paymentDueDate}>
                      Due: {p.dueDate ? formatDate(p.dueDate) : 'On Scheduling'}
                    </Text>
                  </View>
                  <View style={styles.paymentRight}>
                    <Text style={styles.paymentAmount}>{formatCurrency(p.amount)}</Text>
                    <ImperialBadge
                      label={p.status}
                      variant={getPaymentVariant(p.status)}
                      size="sm"
                    />
                  </View>
                </View>
              </ImperialGlassCard>
            ))
          )
        ) : settlements.length === 0 ? (
          <EmptyState
            title="No Vendor Settlements"
            message="No vendor settlements pending reconciliation."
          />
        ) : (
          settlements.map((s) => (
            <ImperialGlassCard key={s.id} style={styles.paymentCard} tone="navy">
              <View style={styles.paymentHeader}>
                <View>
                  <Text style={styles.paymentTitle}>{s.vendor?.name || 'Partner Vendor'}</Text>
                  <Text style={styles.paymentDueDate}>Category: {s.vendor?.category || 'Services'}</Text>
                </View>
                <View style={styles.paymentRight}>
                  <Text style={styles.paymentAmount}>{formatCurrency(s.totalAmount || s.agreedAmount || 0)}</Text>
                  <ImperialBadge
                    label={s.status || 'PENDING'}
                    variant={s.status === 'CLOSED' ? 'success' : 'warning'}
                    size="sm"
                  />
                </View>
              </View>
            </ImperialGlassCard>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  selectorBar: {
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  selectorScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  selectorPill: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  selectorPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  selectorPillText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.medium,
  },
  selectorPillTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  bannerContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs + 2,
  },
  bannerCard: {
    padding: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerCol: {
    flex: 1,
    alignItems: 'center',
  },
  bannerDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  bannerLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.medium,
  },
  bannerGreen: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
    marginTop: 2,
  },
  bannerGold: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.goldDark,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  tabItemActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201, 169, 106, 0.15)',
  },
  tabText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.semibold,
  },
  tabTextActive: {
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 40,
  },
  paymentCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  paymentTitle: {
    fontSize: typography.fontSize.sm + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
  },
  paymentDueDate: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  paymentAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
  },
});
