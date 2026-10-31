import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialBadge,
  ImperialButton,
  LoadingSkeleton,
  EmptyState,
} from '../../components';
import { eventService, weddingService, WeddingSummary } from '../../api/services';
import { WeddingEvent, VendorArrival, ArrivalStatus } from '@grand-bandhan/shared';
import { formatTime, formatDate } from '../../utils/formatters';

interface TimelineScreenProps {
  initialWeddingId?: string;
}

export const TimelineScreen: React.FC<TimelineScreenProps> = ({ initialWeddingId }) => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(initialWeddingId || '');
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [arrivals, setArrivals] = useState<VendorArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'ARRIVALS'>('TIMELINE');

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
      const [eventsData, arrivalsData] = await Promise.all([
        eventService.listEvents(selectedWeddingId),
        eventService.listArrivals(selectedWeddingId),
      ]);
      setEvents(eventsData);
      setArrivals(arrivalsData);
    } catch (err: any) {
      console.warn('Failed to load events/arrivals:', err?.message);
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

  const handleUpdateArrivalStatus = async (arrivalId: string, status: ArrivalStatus) => {
    try {
      await eventService.updateArrival(arrivalId, status);
      Alert.alert('Status Updated', `Vendor marked as ${status.replace(/_/g, ' ')}`);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to update arrival status');
    }
  };

  const getArrivalVariant = (status: ArrivalStatus) => {
    switch (status) {
      case ArrivalStatus.ARRIVED_ON_TIME:
        return 'success';
      case ArrivalStatus.DELAYED:
      case ArrivalStatus.NO_SHOW:
        return 'danger';
      case ArrivalStatus.PENDING:
      default:
        return 'warning';
    }
  };

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Day-of Command"
        subtitle="Minute-by-Minute Timeline & Vendor Arrival Radar"
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

      {/* Mode Switcher */}
      <View style={styles.modeTabBar}>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'TIMELINE' && styles.modeTabActive]}
          onPress={() => setActiveTab('TIMELINE')}
        >
          <Text style={[styles.modeTabText, activeTab === 'TIMELINE' && styles.modeTabTextActive]}>
            ⏱️ Minute-by-Minute Timeline ({events.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeTab, activeTab === 'ARRIVALS' && styles.modeTabActive]}
          onPress={() => setActiveTab('ARRIVALS')}
        >
          <Text style={[styles.modeTabText, activeTab === 'ARRIVALS' && styles.modeTabTextActive]}>
            📡 Vendor Arrival Radar ({arrivals.length})
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
          <LoadingSkeleton height={110} count={3} />
        ) : activeTab === 'TIMELINE' ? (
          events.length === 0 ? (
            <EmptyState
              title="No Scheduled Events"
              message="No timeline ceremonies scheduled for this wedding yet."
            />
          ) : (
            events.map((event) => (
              <ImperialGlassCard key={event.id} style={styles.timelineCard} tone="navy">
                <View style={styles.timeCol}>
                  <Text style={styles.timeText}>
                    {event.startTime ? formatTime(event.startTime) : '18:00'}
                  </Text>
                  <View style={styles.timeDivider} />
                </View>

                <View style={styles.eventBody}>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.name}</Text>
                    <ImperialBadge
                      label={event.status || 'SCHEDULED'}
                      variant={event.status === 'COMPLETED' ? 'success' : 'gold'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.eventVenue}>📍 {event.location || 'Royal Palace Courtyard'}</Text>
                  {(event.notes || (event as any).description) && (
                    <Text style={styles.eventDesc}>{event.notes || (event as any).description}</Text>
                  )}
                </View>
              </ImperialGlassCard>
            ))
          )
        ) : arrivals.length === 0 ? (
          <EmptyState
            title="No Vendor Arrivals Logged"
            message="No vendor arrivals registered on the radar."
          />
        ) : (
          arrivals.map((arr) => (
            <ImperialGlassCard key={arr.id} style={styles.arrivalCard} tone="navy">
              <View style={styles.arrivalTop}>
                <View>
                  <Text style={styles.vendorName}>{arr.vendor?.name || 'Assigned Vendor'}</Text>
                  <Text style={styles.vendorRole}>🏷️ {arr.vendor?.category || 'Service Partner'}</Text>
                </View>
                <ImperialBadge
                  label={arr.status || 'PENDING'}
                  variant={getArrivalVariant(arr.status)}
                />
              </View>

              <View style={styles.arrivalTimes}>
                <Text style={styles.arrivalTimeText}>
                  Scheduled: {arr.expectedArrivalTime ? formatTime(arr.expectedArrivalTime) : '16:00'}
                </Text>
                {arr.actualArrivalTime && (
                  <Text style={styles.actualTimeText}>
                    Actual: {formatTime(arr.actualArrivalTime)}
                  </Text>
                )}
              </View>

              {/* 1-Tap Check-In Actions */}
              <View style={styles.checkInActions}>
                <ImperialButton
                  title="✓ Confirm On-Site"
                  variant="gold"
                  size="sm"
                  onPress={() => handleUpdateArrivalStatus(arr.id, ArrivalStatus.ARRIVED_ON_TIME)}
                  style={styles.actionBtn}
                />
                <ImperialButton
                  title="⚠️ Flag Delayed"
                  variant="outline"
                  size="sm"
                  onPress={() => handleUpdateArrivalStatus(arr.id, ArrivalStatus.DELAYED)}
                  style={styles.actionBtn}
                />
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
  modeTabBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.xs,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  modeTabActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201, 169, 106, 0.15)',
  },
  modeTabText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.semibold,
  },
  modeTabTextActive: {
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 40,
  },
  timelineCard: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  timeCol: {
    alignItems: 'center',
    width: 60,
  },
  timeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
  },
  timeDivider: {
    width: 2,
    flex: 1,
    backgroundColor: colors.borderDark,
    marginTop: 6,
  },
  eventBody: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    flex: 1,
  },
  eventVenue: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    marginTop: 4,
  },
  eventDesc: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
    marginTop: 4,
    lineHeight: 16,
  },
  arrivalCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  arrivalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
  },
  vendorRole: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    marginTop: 2,
  },
  arrivalTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs + 2,
  },
  arrivalTimeText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
  },
  actualTimeText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  checkInActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
  },
});
