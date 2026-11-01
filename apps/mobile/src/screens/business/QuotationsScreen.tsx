import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialButton,
  ImperialBadge,
  EmptyState,
} from '../../components';
import { quotationService, weddingService, QuotationComparison, WeddingSummary, QuotationRequest } from '../../api/services';
import { useAuthStore } from '../../store/authStore';
import { QuotationStatus, UserRole } from '@grand-bandhan/shared';
import { formatCurrency } from '../../utils/formatters';

interface QuotationsScreenProps {
  initialWeddingId?: string;
}

export const QuotationsScreen: React.FC<QuotationsScreenProps> = ({ initialWeddingId }) => {
  const { user, role } = useAuthStore();
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(initialWeddingId || '');
  const [requests, setRequests] = useState<QuotationRequest[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [comparison, setComparison] = useState<QuotationComparison | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [awarding, setAwarding] = useState(false);

  // Load weddings first if no wedding selected
  const loadInitialData = useCallback(async () => {
    try {
      const weddingList = await weddingService.list();
      setWeddings(weddingList);
      if (!selectedWeddingId && weddingList.length > 0) {
        setSelectedWeddingId(weddingList[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load initial weddings:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load requests when wedding changes
  const fetchRequests = useCallback(async () => {
    if (!selectedWeddingId) return;
    try {
      setLoading(true);
      const data = await quotationService.listRequests(selectedWeddingId);
      setRequests(data);
      if (data.length > 0) {
        setSelectedRequestId(data[0].id);
      } else {
        setSelectedRequestId('');
        setComparison(null);
      }
    } catch (err: any) {
      console.warn('Failed to load quotation requests:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Load 3-way comparison when selectedRequestId changes
  const fetchComparison = useCallback(async () => {
    if (!selectedRequestId) return;
    try {
      const data = await quotationService.getComparison(selectedRequestId);
      setComparison(data);
    } catch (err: any) {
      console.warn('Failed to fetch quotation comparison:', err?.message);
    }
  }, [selectedRequestId]);

  useEffect(() => {
    fetchComparison();
  }, [fetchComparison]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRequests();
    if (selectedRequestId) {
      fetchComparison();
    }
  };

  const handleSelectAndAward = async (quotationId: string, vendorName: string) => {
    Alert.alert(
      'Confirm Royal Award',
      `Are you sure you want to award this contract to ${vendorName}? Other competing quotations for this request will automatically be closed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Award Contract',
          style: 'default',
          onPress: async () => {
            setAwarding(true);
            try {
              await quotationService.selectQuotation(selectedRequestId, quotationId);
              Alert.alert('Contract Awarded', `Successfully awarded to ${vendorName}!`);
              fetchComparison();
              fetchRequests();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to award contract.');
            } finally {
              setAwarding(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Multi-Vendor Quotations Matrix"
        subtitle="3-Way Quotation Comparison Engine"
      />

      {/* Wedding Selector Pills */}
      {weddings.length > 1 && (
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

      {/* Requests Tabs */}
      {requests.length > 0 && (
        <View style={styles.requestTabsBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.requestTabsScroll}>
            {requests.map((req) => (
              <TouchableOpacity
                key={req.id}
                style={[
                  styles.requestTab,
                  selectedRequestId === req.id && styles.requestTabActive,
                ]}
                onPress={() => setSelectedRequestId(req.id)}
              >
                <Text
                  style={[
                    styles.requestTabText,
                    selectedRequestId === req.id && styles.requestTabTextActive,
                  ]}
                >
                  {req.category}
                </Text>
                <ImperialBadge
                  label={req.status}
                  variant={req.status === 'AWARDED' ? 'success' : 'gold'}
                  size="sm"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={styles.loadingText}>Comparing Vendor Quotes...</Text>
          </View>
        ) : !selectedRequestId || requests.length === 0 ? (
          <EmptyState
            title="No Quotation Requests"
            message="There are no 3-way quotation requests created for this wedding yet."
          />
        ) : !comparison ? (
          <View style={styles.centerBox}>
            <Text style={styles.loadingText}>Loading 3-way comparison matrix...</Text>
          </View>
        ) : (
          <View>
            {/* Request Summary Banner */}
            <ImperialGlassCard style={styles.summaryBanner} tone="gold">
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryCategory}>{comparison.request.category} Bid Comparison</Text>
                  <Text style={styles.summaryMeta}>
                    Guest Count: {comparison.request.guestCount || 400} pax • Status: {comparison.request.status}
                  </Text>
                </View>
                <ImperialBadge
                  label={`${comparison.quotations?.length || 0} Quotes Received`}
                  variant="gold"
                />
              </View>
              {comparison.recommendation && (
                <View style={styles.recommendationBox}>
                  <Text style={styles.recTitle}>👑 Planner Recommendation:</Text>
                  <Text style={styles.recBody}>{comparison.recommendation.rationale}</Text>
                </View>
              )}
            </ImperialGlassCard>

            {/* 3-Way Comparative Vendor Cards */}
            <Text style={styles.sectionHeader}>Side-by-Side Competitive Bids</Text>

            {comparison.quotations.map((quote, index) => {
              const isRecommended = comparison.recommendation?.recommendedQuotationId === quote.id;
              const isSelected = quote.status === QuotationStatus.SELECTED;
              const canAward =
                role !== UserRole.VENDOR &&
                comparison.request.status !== 'AWARDED' &&
                quote.status !== QuotationStatus.CLOSED;

              return (
                <ImperialGlassCard
                  key={quote.id}
                  style={[
                    styles.quoteCard,
                    isRecommended && styles.recommendedBorder,
                    isSelected && styles.selectedBorder,
                  ]}
                  tone={isRecommended ? 'gold' : 'navy'}
                >
                  <View style={styles.quoteHeader}>
                    <View style={styles.vendorInfo}>
                      <Text style={styles.vendorSlot}>Vendor Option #{index + 1}</Text>
                      <Text style={styles.vendorName}>{quote.vendor?.name || 'Verified Vendor'}</Text>
                      <Text style={styles.vendorCategory}>🏷️ {quote.vendor?.category || comparison.request.category}</Text>
                    </View>
                    <View style={styles.badgesCol}>
                      {isRecommended && (
                        <ImperialBadge label="⭐ RECOMMENDED" variant="gold" size="sm" />
                      )}
                      <ImperialBadge
                        label={quote.status}
                        variant={isSelected ? 'success' : quote.status === 'CLOSED' ? 'muted' : 'info'}
                        size="sm"
                      />
                    </View>
                  </View>

                  {/* Financial Breakdown Table */}
                  <View style={styles.costTable}>
                    <View style={styles.costRow}>
                      <Text style={styles.costLabel}>Base Fee / Setup</Text>
                      <Text style={styles.costValue}>{formatCurrency(quote.baseAmount)}</Text>
                    </View>
                    {Boolean(quote.pricePerPlate) && (
                      <View style={styles.costRow}>
                        <Text style={styles.costLabel}>
                          Price per Plate ({quote.guestCountUsed} pax)
                        </Text>
                        <Text style={styles.costValue}>
                          ₹{quote.pricePerPlate}/plate = {formatCurrency(quote.pricePerPlate! * quote.guestCountUsed)}
                        </Text>
                      </View>
                    )}
                    {Boolean(quote.additionalCosts) && (
                      <View style={styles.costRow}>
                        <Text style={styles.costLabel}>Logistics & Taxes</Text>
                        <Text style={styles.costValue}>{formatCurrency(quote.additionalCosts!)}</Text>
                      </View>
                    )}
                    <View style={[styles.costRow, styles.totalRow]}>
                      <Text style={styles.totalLabel}>Grand Total Computed</Text>
                      <Text style={styles.totalAmount}>
                        {formatCurrency(quote.computedTotal)}
                      </Text>
                    </View>
                  </View>

                  {/* Notes & Inclusions */}
                  {quote.notes && (
                    <Text style={styles.quoteNotes}>📝 {quote.notes}</Text>
                  )}

                  {/* Award Contract Button */}
                  {canAward && (
                    <ImperialButton
                      title={awarding ? 'Awarding Contract...' : '✓ Select & Award This Vendor'}
                      variant={isRecommended ? 'gold' : 'secondary'}
                      loading={awarding}
                      onPress={() => handleSelectAndAward(quote.id, quote.vendor?.name || 'Vendor')}
                      style={styles.awardButton}
                    />
                  )}
                  {isSelected && (
                    <View style={styles.awardedBanner}>
                      <Text style={styles.awardedText}>✓ CONTRACT AWARDED TO THIS VENDOR</Text>
                    </View>
                  )}
                </ImperialGlassCard>
              );
            })}
          </View>
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
  requestTabsBar: {
    paddingVertical: spacing.xs + 2,
  },
  requestTabsScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  requestTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  requestTabActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201, 169, 106, 0.15)',
  },
  requestTabText: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontWeight: typography.fontWeight.semibold,
  },
  requestTabTextActive: {
    color: colors.gold,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 40,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    color: colors.gold,
    fontSize: typography.fontSize.sm,
    marginTop: spacing.md,
  },
  summaryBanner: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryCategory: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavyDark,
  },
  summaryMeta: {
    fontSize: typography.fontSize.xs,
    color: '#4B5563',
    marginTop: 2,
  },
  recommendationBox: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.goldDark,
  },
  recTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavyDark,
  },
  recBody: {
    fontSize: typography.fontSize.xs,
    color: '#374151',
    marginTop: 2,
    lineHeight: 16,
  },
  sectionHeader: {
    fontSize: typography.fontSize.sm,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  quoteCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  recommendedBorder: {
    borderColor: colors.gold,
    borderWidth: 2,
  },
  selectedBorder: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  quoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorSlot: {
    fontSize: typography.fontSize.xs - 2,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  vendorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    marginTop: 2,
  },
  vendorCategory: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    marginTop: 2,
  },
  badgesCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  costTable: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costLabel: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
  },
  costValue: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontWeight: typography.fontWeight.semibold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    paddingTop: spacing.xs,
    marginTop: 2,
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  totalAmount: {
    fontSize: typography.fontSize.md,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  quoteNotes: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    marginVertical: spacing.xs,
    fontStyle: 'italic',
  },
  awardButton: {
    marginTop: spacing.sm,
  },
  awardedBanner: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
  },
  awardedText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
