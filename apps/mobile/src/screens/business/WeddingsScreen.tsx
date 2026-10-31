import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialBadge,
  ImperialInput,
  LoadingSkeleton,
  EmptyState,
} from '../../components';
import { weddingService, WeddingSummary } from '../../api/services';
import { WeddingPackageType, WeddingStatus } from '@grand-bandhan/shared';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface WeddingsScreenProps {
  onSelectWedding?: (wedding: WeddingSummary) => void;
}

export const WeddingsScreen: React.FC<WeddingsScreenProps> = ({ onSelectWedding }) => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const fetchWeddings = useCallback(async () => {
    try {
      const data = await weddingService.list();
      setWeddings(data);
    } catch (err: any) {
      console.warn('Failed to load weddings:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWeddings();
  }, [fetchWeddings]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeddings();
  };

  const getPackageBadgeVariant = (pkg?: WeddingPackageType | string) => {
    switch (pkg) {
      case WeddingPackageType.FULL_SERVICE:
      case 'ROYAL_HERITAGE':
        return 'gold';
      case WeddingPackageType.PARTIAL_DAY_OF:
      case 'PALACE_LUXURY':
        return 'info';
      default:
        return 'gold';
    }
  };

  const filteredWeddings = weddings.filter((w) => {
    const matchesSearch =
      !searchQuery.trim() ||
      `${w.brideName} ${w.groomName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.weddingCode?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || w.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const renderWeddingCard = ({ item }: { item: WeddingSummary }) => {
    const progress = item.tasksProgress ?? (item.tasksCount ? Math.round(((item.tasksCompleted || 0) / item.tasksCount) * 100) : 0);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onSelectWedding?.(item)}
      >
        <ImperialGlassCard style={styles.card} tone="navy">
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.codeText}>{item.weddingCode || 'GB-WED'}</Text>
              <Text style={styles.coupleTitle}>
                {item.brideName} & {item.groomName}
              </Text>
            </View>
            <ImperialBadge
              label={item.packageType?.replace(/_/g, ' ') || 'ROYAL HERITAGE'}
              variant={getPackageBadgeVariant(item.packageType)}
              size="sm"
            />
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>📅 Wedding Date</Text>
              <Text style={styles.detailVal}>
                {item.weddingDate ? formatDate(item.weddingDate) : 'Date Pending'}
              </Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>📍 Royal Destination</Text>
              <Text style={styles.detailVal}>{item.location}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>👥 Guest List</Text>
              <Text style={styles.detailVal}>{item.guestCount} Imperial Guests</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>💰 Total Budget</Text>
              <Text style={styles.budgetVal}>
                {formatCurrency(item.budgetMax || item.totalAmount || 0)}
              </Text>
            </View>
          </View>

          {/* Planning Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressText}>Planning Milestones</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]} />
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.plannerName}>
              🤵 Planner: {item.plannerName || 'Grand Bandhan Concierge'}
            </Text>
            <Text style={styles.viewHubText}>Manage Wedding →</Text>
          </View>
        </ImperialGlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Weddings Portfolio"
        subtitle="Active Weddings, Milestones & Budgets"
      />

      <View style={styles.searchSection}>
        <ImperialInput
          placeholder="Search by couple, city or wedding code..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchBar}
        />
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'PLANNING', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterPill,
                selectedStatus === status && styles.filterPillActive,
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedStatus === status && styles.filterPillTextActive,
                ]}
              >
                {status.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={170} count={3} />
        </View>
      ) : filteredWeddings.length === 0 ? (
        <EmptyState
          title="No Weddings Found"
          message="No active royal wedding projects match your selection."
        />
      ) : (
        <FlatList
          data={filteredWeddings}
          keyExtractor={(item) => item.id}
          renderItem={renderWeddingCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.gold}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  searchSection: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  searchBar: {
    marginBottom: spacing.xs,
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  filterPill: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDark,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  filterPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterPillText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.medium,
  },
  filterPillTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingContainer: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  codeText: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  coupleTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs - 2,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
  },
  detailVal: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  budgetVal: {
    fontSize: typography.fontSize.sm,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  progressContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
  },
  progressPercentage: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.gold,
    borderRadius: 3,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    marginTop: spacing.sm,
    paddingTop: spacing.xs + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plannerName: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
  },
  viewHubText: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
});
