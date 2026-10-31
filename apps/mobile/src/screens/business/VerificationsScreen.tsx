import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialBadge,
  ImperialButton,
  ImperialInput,
  LoadingSkeleton,
  EmptyState,
} from '../../components';
import {
  verificationService,
  weddingService,
  vendorService,
  ServiceVerificationItem,
  WeddingSummary,
} from '../../api/services';
import { Vendor } from '@grand-bandhan/shared';
import { formatTime, formatDate } from '../../utils/formatters';

interface VerificationsScreenProps {
  initialWeddingId?: string;
  onOpenRespondModal?: (item: ServiceVerificationItem) => void;
}

export const VerificationsScreen: React.FC<VerificationsScreenProps> = ({
  initialWeddingId,
  onOpenRespondModal,
}) => {
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(initialWeddingId || '');
  const [verifications, setVerifications] = useState<ServiceVerificationItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Trigger Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState('');

  const loadInitialData = useCallback(async () => {
    try {
      const [weddingList, vendorList] = await Promise.all([
        weddingService.list(),
        vendorService.list(),
      ]);
      setWeddings(weddingList);
      setVendors(vendorList);
      if (!selectedWeddingId && weddingList.length > 0) {
        setSelectedWeddingId(weddingList[0].id);
      }
      if (vendorList.length > 0) {
        setSelectedVendorId(vendorList[0].id);
      }
    } catch (err: any) {
      console.warn('Failed to load initial data:', err?.message);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const fetchVerifications = useCallback(async () => {
    if (!selectedWeddingId) {
      setLoading(false);
      return;
    }
    try {
      const data = await verificationService.list(selectedWeddingId);
      setVerifications(data);
    } catch (err: any) {
      console.warn('Failed to load verifications:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedWeddingId]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchVerifications();
  };

  const handleTriggerVerification = async () => {
    if (!serviceName.trim() || !selectedVendorId || !selectedWeddingId) {
      Alert.alert('Required Fields', 'Please select a vendor and enter service name.');
      return;
    }

    setTriggering(true);
    try {
      await verificationService.trigger({
        weddingId: selectedWeddingId,
        vendorId: selectedVendorId,
        serviceName: serviceName.trim(),
        scheduledConfirmationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      });
      Alert.alert('Success', 'On-demand verification protocol triggered!');
      setModalVisible(false);
      setServiceName('');
      fetchVerifications();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to trigger verification.');
    } finally {
      setTriggering(false);
    }
  };

  const filtered = verifications.filter((v) => {
    return activeFilter === 'ALL' || v.status === activeFilter;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'DISPUTED':
      case 'ESCALATED':
        return 'danger';
      case 'PENDING':
      default:
        return 'warning';
    }
  };

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Service Verification Queue"
        subtitle="Live Audit & Automatic Escalation Desk"
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

      {/* Action Bar */}
      <View style={styles.actionRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {['ALL', 'PENDING', 'VERIFIED', 'ESCALATED', 'DISPUTED'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[
                styles.filterPill,
                activeFilter === st && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(st)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === st && styles.filterPillTextActive,
                ]}
              >
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ImperialButton
          title="+ Trigger"
          variant="gold"
          size="sm"
          onPress={() => setModalVisible(true)}
          style={styles.triggerBtn}
        />
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
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Verifications in Queue"
            message="No services currently queued for audit. You can trigger an immediate verification protocol."
            actionLabel="Trigger Audit"
            onAction={() => setModalVisible(true)}
          />
        ) : (
          filtered.map((item) => (
            <ImperialGlassCard key={item.id} style={styles.card} tone="navy">
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.serviceTitle}>{item.serviceName}</Text>
                  <Text style={styles.vendorName}>
                    🏢 {item.vendor?.name || 'Assigned Vendor Partner'}
                  </Text>
                </View>
                <ImperialBadge
                  label={item.status}
                  variant={getStatusVariant(item.status)}
                />
              </View>

              <View style={styles.timeRow}>
                <Text style={styles.scheduledLabel}>
                  ⏰ Scheduled Confirmation: {item.scheduledConfirmationTime ? formatTime(item.scheduledConfirmationTime) : '18:00'}
                </Text>
                {item.status === 'ESCALATED' && (
                  <Text style={styles.escalatedWarning}>🚨 30M+ Overdue - Escalated</Text>
                )}
              </View>

              {item.issueNotes && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>⚠️ Issue: {item.issueNotes}</Text>
                </View>
              )}

              {item.status === 'PENDING' && onOpenRespondModal && (
                <ImperialButton
                  title="Submit Audit Response →"
                  variant="gold"
                  size="sm"
                  onPress={() => onOpenRespondModal(item)}
                  style={styles.respondBtn}
                />
              )}
            </ImperialGlassCard>
          ))
        )}
      </ScrollView>

      {/* Trigger Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Trigger Service Audit</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ImperialInput
              label="Service Checklist Name *"
              placeholder="e.g. Mandap Floral Architecture"
              value={serviceName}
              onChangeText={setServiceName}
            />

            <Text style={styles.pickerLabel}>Select Vendor Partner *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorSelectScroll}>
              {vendors.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.vendorOption,
                    selectedVendorId === v.id && styles.vendorOptionActive,
                  ]}
                  onPress={() => setSelectedVendorId(v.id)}
                >
                  <Text
                    style={[
                      styles.vendorOptionText,
                      selectedVendorId === v.id && styles.vendorOptionTextActive,
                    ]}
                  >
                    {v.name} ({v.category})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <ImperialButton
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={styles.modalBtn}
              />
              <ImperialButton
                title={triggering ? 'Triggering...' : 'Dispatch Audit'}
                variant="gold"
                loading={triggering}
                onPress={handleTriggerVerification}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    gap: spacing.sm,
  },
  filterScroll: {
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
  triggerBtn: {
    minWidth: 80,
    height: 38,
  },
  scrollContent: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: 40,
  },
  card: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
  },
  vendorName: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    marginTop: 2,
  },
  timeRow: {
    marginTop: spacing.xs + 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scheduledLabel: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
  },
  escalatedWarning: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    fontWeight: typography.fontWeight.bold,
  },
  notesBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    marginTop: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  notesText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
  },
  respondBtn: {
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalContent: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold,
  },
  modalClose: {
    fontSize: 22,
    color: '#8E9CAE',
    padding: 4,
  },
  pickerLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  vendorSelectScroll: {
    marginBottom: spacing.md,
  },
  vendorOption: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: spacing.xs,
  },
  vendorOptionActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201, 169, 106, 0.2)',
  },
  vendorOptionText: {
    fontSize: typography.fontSize.xs,
    color: '#8E9CAE',
  },
  vendorOptionTextActive: {
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
