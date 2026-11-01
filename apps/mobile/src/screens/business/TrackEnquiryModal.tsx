import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ImperialLogo } from '../../components/ImperialLogo';
import { enquiryService } from '../../api/services';
import { formatDate, formatINR } from '../../utils/formatters';

export interface TrackEnquiryModalProps {
  visible: boolean;
  onClose: () => void;
  initialReference?: string;
}

const LIFECYCLE_STEPS = [
  { step: 1, key: 'ENQUIRY_REGISTERED', title: '1. Enquiry Registered', desc: 'Logged in Grand Bandhan Registry' },
  { step: 2, key: 'PLANNER_ASSIGNED', title: '2. Planner Assigned', desc: 'Wedding specialist reviewing ceremonial vision' },
  { step: 3, key: 'FIRST_CONSULTATION', title: '3. First Consultation', desc: 'Bespoke design intake & budget discovery' },
  { step: 4, key: 'BESPOKE_PROPOSAL', title: '4. Bespoke Proposal', desc: '3-way quotation comparison & packages' },
  { step: 5, key: 'AGREEMENT_DEPOSIT', title: '5. Service Agreement & Deposit', desc: '20-section contract sign-off & escrow' },
  { step: 6, key: 'ACTIVE_OPERATIONS', title: '6. Active Operations', desc: '26+ auto tasks & live vendor radar' },
];

export const TrackEnquiryModal: React.FC<TrackEnquiryModalProps> = ({
  visible,
  onClose,
  initialReference = '',
}) => {
  const [referenceInput, setReferenceInput] = useState(initialReference);
  const [loading, setLoading] = useState(false);
  const [enquiryData, setEnquiryData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTrack = async () => {
    const trimmed = referenceInput.trim();
    if (!trimmed) {
      Alert.alert('Reference Required', 'Please enter your wedding enquiry reference number (e.g., GB-ENQ-2026-1001).');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await enquiryService.trackByReference(trimmed);
      if (data) {
        setEnquiryData(data);
      } else {
        setErrorMsg('No wedding enquiry found matching this reference number.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not locate enquiry reference. Please verify the code.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = enquiryData?.currentStep ?? (enquiryData?.assignedPlanner ? 2 : 1);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <ImperialLogo size="xs" withGlow={false} />
              <Text style={styles.headerBadge}>WEDDING LIFECYCLE TRACKER</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeHitArea}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.prompt}>
              Track your wedding planning lifecycle, consultation status, and milestone agreement in real time.
            </Text>

            {/* Input Bar */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter reference (e.g. GB-ENQ-2026-1001)"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="characters"
                value={referenceInput}
                onChangeText={setReferenceInput}
              />
              <TouchableOpacity
                style={styles.searchBtn}
                onPress={handleTrack}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.imperialNavyDark} />
                ) : (
                  <Text style={styles.searchBtnText}>Track ⚜️</Text>
                )}
              </TouchableOpacity>
            </View>

            {errorMsg && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {errorMsg}</Text>
              </View>
            )}

            {/* Results Section */}
            {enquiryData && (
              <View style={styles.resultsContainer}>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <Text style={styles.coupleNames}>
                    {enquiryData.customerName}
                    {enquiryData.partnerName ? ` & ${enquiryData.partnerName}` : ''}
                  </Text>
                  <Text style={styles.refBadge}>Ref: {enquiryData.referenceNumber}</Text>

                  <View style={styles.metaGrid}>
                    <Text style={styles.metaItem}>
                      📅 {formatDate(enquiryData.weddingDate || enquiryData.createdAt)}
                    </Text>
                    <Text style={styles.metaItem}>📍 {enquiryData.location || 'Heritage Destination'}</Text>
                    <Text style={styles.metaItem}>👥 {enquiryData.guestCount || '400'} Honored Guests</Text>
                    <Text style={styles.metaItem}>
                      💰 {formatINR(enquiryData.minBudget)} – {formatINR(enquiryData.maxBudget)}
                    </Text>
                  </View>

                  {enquiryData.assignedPlanner && (
                    <View style={styles.plannerBox}>
                      <Text style={styles.plannerLabel}>ASSIGNED WEDDING SPECIALIST</Text>
                      <Text style={styles.plannerName}>
                        👑 {enquiryData.assignedPlanner.name} ({enquiryData.assignedPlanner.email})
                      </Text>
                    </View>
                  )}
                </View>

                {/* 6-Step Lifecycle Timeline */}
                <Text style={styles.sectionHeader}>6-STEP WEDDING EXECUTION LIFECYCLE</Text>

                <View style={styles.timelineContainer}>
                  {LIFECYCLE_STEPS.map((stepItem, index) => {
                    const isDone = currentStep > stepItem.step;
                    const isCurrent = currentStep === stepItem.step;
                    const isPending = currentStep < stepItem.step;

                    return (
                      <View key={stepItem.key} style={styles.timelineItem}>
                        <View style={styles.timelineLeftCol}>
                          <View
                            style={[
                              styles.stepNode,
                              isDone && styles.stepNodeDone,
                              isCurrent && styles.stepNodeCurrent,
                              isPending && styles.stepNodePending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.stepNodeText,
                                isCurrent && styles.stepNodeTextCurrent,
                              ]}
                            >
                              {isDone ? '✓' : stepItem.step}
                            </Text>
                          </View>
                          {index < LIFECYCLE_STEPS.length - 1 && (
                            <View
                              style={[
                                styles.stepLine,
                                isDone && styles.stepLineDone,
                              ]}
                            />
                          )}
                        </View>

                        <View style={styles.timelineRightCol}>
                          <Text
                            style={[
                              styles.stepTitle,
                              isCurrent && styles.stepTitleCurrent,
                              isDone && styles.stepTitleDone,
                            ]}
                          >
                            {stepItem.title}
                          </Text>
                          <Text style={styles.stepDesc}>{stepItem.desc}</Text>
                          {isCurrent && (
                            <View style={styles.activePill}>
                              <Text style={styles.activePillText}>IN PROGRESS</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeBtnText}>Close Tracker</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 24, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    maxHeight: '90%',
  },
  header: {
    backgroundColor: colors.imperialNavy,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 1.2,
    marginLeft: 6,
  },
  closeHitArea: {
    padding: 4,
  },
  closeIcon: {
    color: '#8E9CAE',
    fontSize: 14,
    fontWeight: 'bold',
  },
  body: {
    padding: spacing.base,
  },
  prompt: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    fontSize: typography.fontSize.xs + 1,
    color: colors.textPrimary,
  },
  searchBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    ...shadows.goldGlow,
  },
  searchBtnText: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xs + 1,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: '#DC2626',
    fontWeight: typography.fontWeight.medium,
  },
  resultsContainer: {
    marginTop: spacing.xs,
  },
  summaryCard: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1.5,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  coupleNames: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  refBadge: {
    fontSize: 10,
    color: colors.goldDark,
    fontWeight: typography.fontWeight.heavy,
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  metaItem: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  plannerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  plannerLabel: {
    fontSize: 8,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  plannerName: {
    fontSize: typography.fontSize.xs,
    color: colors.imperialNavy,
    fontWeight: typography.fontWeight.semibold,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavy,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  timelineContainer: {
    paddingLeft: spacing.xs,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 28,
  },
  stepNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    zIndex: 2,
  },
  stepNodeDone: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  stepNodeCurrent: {
    backgroundColor: colors.imperialNavy,
    borderColor: colors.gold,
  },
  stepNodePending: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  stepNodeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#64748B',
  },
  stepNodeTextCurrent: {
    color: colors.goldLight,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: '#10B981',
  },
  timelineRightCol: {
    flex: 1,
    paddingLeft: spacing.sm,
    paddingBottom: spacing.sm + 4,
  },
  stepTitle: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textMuted,
  },
  stepTitleCurrent: {
    color: colors.imperialNavy,
    fontWeight: typography.fontWeight.bold,
  },
  stepTitleDone: {
    color: '#059669',
    fontWeight: typography.fontWeight.bold,
  },
  stepDesc: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 1,
  },
  activePill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: borderRadius.round,
    marginTop: 4,
  },
  activePillText: {
    fontSize: 8,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavyDark,
  },
  footer: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
  },
  closeBtn: {
    backgroundColor: colors.imperialNavy,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  closeBtnText: {
    color: colors.goldLight,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xs + 1,
  },
});
