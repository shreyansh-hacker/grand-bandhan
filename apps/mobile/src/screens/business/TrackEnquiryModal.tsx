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
  Linking,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ImperialLogo } from '../../components/ImperialLogo';
import { enquiryService } from '../../api/services';
import { formatDate, formatTime, formatINR } from '../../utils/formatters';
import { API_BASE_URL } from '../../api/endpoints';

export interface TrackEnquiryModalProps {
  visible: boolean;
  onClose: () => void;
  initialReference?: string;
}

const LIFECYCLE_STEPS = [
  { step: 1, key: 'ENQUIRY_REGISTERED', title: '1. Enquiry Registered', desc: 'Logged in Grand Bandhan Registry' },
  { step: 2, key: 'PLANNER_ASSIGNED', title: '2. Planner Assigned', desc: 'Senior wedding specialist reviewing vision' },
  { step: 3, key: 'FIRST_CONSULTATION', title: '3. First Consultation', desc: 'Bespoke design session & ceremonial vision discovery' },
  { step: 4, key: 'BESPOKE_PROPOSAL', title: '4. Bespoke Proposal', desc: 'Quotation comparison & package prepared' },
  { step: 5, key: 'AGREEMENT_DEPOSIT', title: '5. Service Agreement & Deposit', desc: 'Contract sign-off & milestone confirmation' },
  { step: 6, key: 'ACTIVE_OPERATIONS', title: '6. Active Operations', desc: '26+ auto tasks & live vendor coordination' },
];

export function getStepState(
  stepNumber: number,
  enquiry: any
): 'completed' | 'current' | 'pending' | 'upcoming' | 'rejected' {
  if (!enquiry) return 'upcoming';

  const latestConsultation = enquiry.consultations?.[0];
  const latestProposal = enquiry.proposals?.[0];
  const latestAgreement = enquiry.agreements?.[0] || enquiry.convertedWedding?.agreement;
  const isConverted = enquiry.status === 'CONVERTED' || !!enquiry.convertedWeddingId;

  switch (stepNumber) {
    case 1:
      return 'completed';

    case 2:
      if (enquiry.assignedPlanner) {
        const hasPastStage =
          latestConsultation?.status === 'COMPLETED' ||
          enquiry.status === 'CONSULTATION_COMPLETED' ||
          latestProposal ||
          latestAgreement ||
          isConverted;
        return hasPastStage ? 'completed' : 'current';
      }
      return 'current';

    case 3:
      if (
        latestConsultation?.status === 'COMPLETED' ||
        enquiry.status === 'CONSULTATION_COMPLETED' ||
        latestProposal ||
        latestAgreement ||
        isConverted
      ) {
        return 'completed';
      }
      if (
        latestConsultation?.status === 'SCHEDULED' ||
        latestConsultation?.status === 'RESCHEDULED' ||
        enquiry.status === 'CONSULTATION_SCHEDULED'
      ) {
        return 'current';
      }
      return enquiry.assignedPlanner ? 'pending' : 'upcoming';

    case 4:
      if (
        latestProposal?.status === 'ACCEPTED' ||
        isConverted ||
        enquiry.status === 'BOOKING_PENDING'
      ) {
        return 'completed';
      }
      if (latestProposal?.status === 'SENT' || enquiry.status === 'PROPOSAL_SENT') {
        return 'current';
      }
      return latestConsultation?.status === 'COMPLETED' || enquiry.status === 'CONSULTATION_COMPLETED'
        ? 'pending'
        : 'upcoming';

    case 5:
      if (
        latestAgreement?.verificationStatus === 'VERIFIED' ||
        latestAgreement?.status === 'VERIFIED' ||
        isConverted
      ) {
        return 'completed';
      }
      if (latestAgreement?.verificationStatus === 'REJECTED') {
        return 'rejected';
      }
      if (
        latestAgreement?.status === 'SIGNED' ||
        latestAgreement?.status === 'PENDING_VERIFICATION' ||
        latestAgreement?.verificationStatus === 'PENDING'
      ) {
        return 'current';
      }
      if (latestAgreement?.status === 'SENT' || latestAgreement?.status === 'DRAFT') {
        return 'current';
      }
      return latestProposal?.status === 'ACCEPTED' ? 'pending' : 'upcoming';

    case 6:
      if (isConverted || enquiry.status === 'CONVERTED') {
        return 'completed';
      }
      return latestAgreement?.verificationStatus === 'VERIFIED' || latestAgreement?.status === 'VERIFIED'
        ? 'current'
        : 'upcoming';

    default:
      return 'upcoming';
  }
}

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
      Alert.alert('Reference Required', 'Please enter your wedding enquiry reference number (e.g., GB-ENQ-2026-1097).');
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

  const latestConsultation = enquiryData?.consultations?.[0];
  const latestProposal = enquiryData?.proposals?.[0];
  const latestAgreement = enquiryData?.agreements?.[0] || enquiryData?.convertedWedding?.agreement;

  // Safe budget normalization (ensuring low to high)
  const rawMin = enquiryData?.minBudget ?? 0;
  const rawMax = enquiryData?.maxBudget ?? 0;
  const budgetLow = Math.min(rawMin, rawMax);
  const budgetHigh = Math.max(rawMin, rawMax);

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
                placeholder="Enter reference (e.g. GB-ENQ-2026-1097)"
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
                  <View style={styles.summaryHeader}>
                    <View style={styles.titleGroup}>
                      <Text style={styles.coupleNames}>
                        {enquiryData.customerName}
                        {enquiryData.partnerName ? ` & ${enquiryData.partnerName}` : ''}
                      </Text>
                      <Text style={styles.refBadge}>Ref: {enquiryData.referenceNumber}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{enquiryData.status}</Text>
                    </View>
                  </View>

                  <View style={styles.metaGrid}>
                    <Text style={styles.metaItem}>
                      📅 {formatDate(enquiryData.weddingDate || enquiryData.createdAt)}
                    </Text>
                    <Text style={styles.metaItem}>
                      📍 {enquiryData.location || 'Heritage Destination'}
                    </Text>
                    <Text style={styles.metaItem}>
                      👥 {enquiryData.guestCount || '400'} Honored Guests
                    </Text>
                    <Text style={styles.metaItem}>
                      💰 {budgetLow > 0 && budgetHigh > budgetLow
                        ? `${formatINR(budgetLow)} – ${formatINR(budgetHigh)}`
                        : formatINR(budgetHigh || budgetLow)}
                    </Text>
                  </View>
                </View>

                {/* 6-Step Lifecycle Stepper */}
                <View style={styles.stepperContainer}>
                  <View style={styles.stepperHeader}>
                    <Text style={styles.sectionHeader}>6-STEP WEDDING EXECUTION LIFECYCLE</Text>
                    <Text style={styles.liveSyncBadge}>LIVE STATUS TRACKING</Text>
                  </View>

                  <View style={styles.timelineList}>
                    {LIFECYCLE_STEPS.map((stepItem, index) => {
                      const state = getStepState(stepItem.step, enquiryData);
                      const isCompleted = state === 'completed';
                      const isCurrent = state === 'current';
                      const isRejected = state === 'rejected';

                      return (
                        <View key={stepItem.key} style={styles.timelineItem}>
                          {/* Left node & connector */}
                          <View style={styles.timelineLeftCol}>
                            <View
                              style={[
                                styles.stepNode,
                                isCompleted && styles.stepNodeDone,
                                isCurrent && styles.stepNodeCurrent,
                                isRejected && styles.stepNodeRejected,
                                !isCompleted && !isCurrent && !isRejected && styles.stepNodePending,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.stepNodeText,
                                  isCompleted && styles.stepNodeTextDone,
                                  isCurrent && styles.stepNodeTextCurrent,
                                ]}
                              >
                                {isCompleted ? '✓' : isRejected ? '✕' : stepItem.step}
                              </Text>
                            </View>
                            {index < LIFECYCLE_STEPS.length - 1 && (
                              <View
                                style={[
                                  styles.stepLine,
                                  isCompleted && styles.stepLineDone,
                                ]}
                              />
                            )}
                          </View>

                          {/* Right Content */}
                          <View style={styles.timelineRightCol}>
                            <View style={styles.stepTitleRow}>
                              <Text
                                style={[
                                  styles.stepTitle,
                                  isCompleted && styles.stepTitleDone,
                                  isCurrent && styles.stepTitleCurrent,
                                  isRejected && styles.stepTitleRejected,
                                ]}
                              >
                                {stepItem.title}
                              </Text>

                              <View
                                style={[
                                  styles.badgePill,
                                  isCompleted && styles.badgePillDone,
                                  isCurrent && styles.badgePillCurrent,
                                  isRejected && styles.badgePillRejected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.badgePillText,
                                    isCompleted && styles.badgePillTextDone,
                                    isCurrent && styles.badgePillTextCurrent,
                                    isRejected && styles.badgePillTextRejected,
                                  ]}
                                >
                                  {isCompleted
                                    ? 'COMPLETED'
                                    : isCurrent
                                    ? 'IN PROGRESS'
                                    : isRejected
                                    ? 'ACTION REQUIRED'
                                    : 'PENDING'}
                                </Text>
                              </View>
                            </View>

                            <Text style={styles.stepDesc}>{stepItem.desc}</Text>

                            {/* STEP 2: Dedicated Planner Details Card */}
                            {stepItem.step === 2 && enquiryData.assignedPlanner && (
                              <View style={styles.stepDetailCard}>
                                <View style={styles.plannerAvatarRow}>
                                  <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarInitial}>
                                      {enquiryData.assignedPlanner.name?.[0] || 'P'}
                                    </Text>
                                  </View>
                                  <View style={styles.plannerInfo}>
                                    <Text style={styles.plannerTag}>ASSIGNED SENIOR PLANNER</Text>
                                    <Text style={styles.plannerName}>
                                      👑 {enquiryData.assignedPlanner.name}
                                    </Text>
                                    <Text style={styles.plannerEmail}>
                                      {enquiryData.assignedPlanner.email}
                                    </Text>
                                  </View>
                                </View>
                                <View style={styles.verifiedSpecialistBadge}>
                                  <Text style={styles.verifiedSpecialistText}>Verified Specialist</Text>
                                </View>
                              </View>
                            )}

                            {/* STEP 3: Consultation Details Card */}
                            {stepItem.step === 3 && latestConsultation && (
                              <View style={styles.stepDetailCard}>
                                <View style={styles.consultHeader}>
                                  <Text style={styles.consultType}>
                                    {latestConsultation.meetingType === 'IN_PERSON'
                                      ? '🏛️ IN-PERSON PALACE SESSION'
                                      : '🎥 VIRTUAL DESIGN VIDEO SESSION'}
                                  </Text>
                                  <Text style={styles.consultTime}>
                                    {formatDate(latestConsultation.scheduledAt)} • {formatTime(latestConsultation.scheduledAt)}
                                  </Text>
                                </View>

                                {latestConsultation.status === 'COMPLETED' ? (
                                  <View style={styles.completedNoticeRow}>
                                    <Text style={styles.checkIconGreen}>✓</Text>
                                    <Text style={styles.completedNoticeText}>
                                      Session Completed: Vision, Palace Themes & Guest Count Recorded
                                    </Text>
                                  </View>
                                ) : latestConsultation.meetingLink ? (
                                  <TouchableOpacity
                                    style={styles.joinLinkBtn}
                                    onPress={() => Linking.openURL(latestConsultation.meetingLink)}
                                  >
                                    <Text style={styles.joinLinkText}>
                                      🎥 Join Video Consultation
                                    </Text>
                                  </TouchableOpacity>
                                ) : null}
                              </View>
                            )}

                            {/* STEP 4: Bespoke Proposal Card */}
                            {stepItem.step === 4 && latestProposal && (
                              <View style={styles.stepDetailCard}>
                                <View style={styles.consultHeader}>
                                  <Text style={styles.consultType}>
                                    PROPOSAL #{latestProposal.proposalNumber}
                                  </Text>
                                  <Text style={styles.consultTime}>
                                    {formatINR(latestProposal.estimatedBudget)}
                                  </Text>
                                </View>
                                <Text style={styles.proposalStatus}>
                                  Status: {latestProposal.status}
                                  {latestProposal.acceptedAt &&
                                    ` (Accepted on ${formatDate(latestProposal.acceptedAt)})`}
                                </Text>
                              </View>
                            )}

                            {/* STEP 5: Service Agreement Card */}
                            {stepItem.step === 5 && latestAgreement && (
                              <View style={styles.stepDetailCard}>
                                <View style={styles.consultHeader}>
                                  <Text style={styles.consultType}>
                                    CONTRACT #{latestAgreement.agreementNumber}
                                  </Text>
                                  <Text style={styles.consultTime}>
                                    {latestAgreement.verificationStatus || latestAgreement.status}
                                  </Text>
                                </View>
                                {latestAgreement.rejectionReason && (
                                  <Text style={styles.rejectionNotice}>
                                    Notice: {latestAgreement.rejectionReason}
                                  </Text>
                                )}
                                <TouchableOpacity
                                  style={styles.viewContractBtn}
                                  onPress={() =>
                                    Linking.openURL(
                                      `${API_BASE_URL}/api/agreements/download/${latestAgreement.id}`
                                    )
                                  }
                                >
                                  <Text style={styles.viewContractText}>
                                    📄 Inspect 20-Section Contract Document
                                  </Text>
                                </TouchableOpacity>
                              </View>
                            )}

                            {/* STEP 6: Active Operations Card */}
                            {stepItem.step === 6 && enquiryData.convertedWedding && (
                              <View style={styles.stepDetailCard}>
                                <Text style={styles.consultType}>
                                  WEDDING PROJECT: {enquiryData.convertedWedding.weddingCode}
                                </Text>
                                <Text style={styles.completedNoticeText}>
                                  ✓ Live vendor arrivals, 26 auto tasks & ceremony radar unlocked.
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
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
    maxHeight: '92%',
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
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleGroup: {
    flex: 1,
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
  statusPill: {
    backgroundColor: 'rgba(201, 169, 106, 0.2)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: borderRadius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusPillText: {
    fontSize: 9,
    color: colors.imperialNavy,
    fontWeight: typography.fontWeight.heavy,
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
  stepperContainer: {
    backgroundColor: colors.imperialNavy,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  stepperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(201, 169, 106, 0.25)',
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
    letterSpacing: 1,
  },
  liveSyncBadge: {
    fontSize: 8,
    color: colors.gold,
    fontWeight: typography.fontWeight.heavy,
    letterSpacing: 0.8,
  },
  timelineList: {
    paddingLeft: 2,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  timelineLeftCol: {
    alignItems: 'center',
    width: 28,
  },
  stepNode: {
    width: 24,
    height: 24,
    borderRadius: 12,
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
    backgroundColor: colors.gold,
    borderColor: colors.white,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 4,
  },
  stepNodeRejected: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  stepNodePending: {
    backgroundColor: colors.imperialNavyDark,
    borderColor: '#475569',
  },
  stepNodeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  stepNodeTextDone: {
    color: colors.imperialNavyDark,
    fontWeight: '900',
  },
  stepNodeTextCurrent: {
    color: colors.imperialNavyDark,
    fontWeight: '900',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginVertical: 3,
  },
  stepLineDone: {
    backgroundColor: '#10B981',
  },
  timelineRightCol: {
    flex: 1,
    paddingLeft: spacing.sm,
  },
  stepTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: '#94A3B8',
    flex: 1,
  },
  stepTitleDone: {
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  stepTitleCurrent: {
    color: colors.goldLight,
    fontWeight: typography.fontWeight.bold,
  },
  stepTitleRejected: {
    color: '#F87171',
    fontWeight: typography.fontWeight.bold,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  badgePillDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 0.5,
    borderColor: '#10B981',
  },
  badgePillCurrent: {
    backgroundColor: colors.gold,
  },
  badgePillRejected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 0.5,
    borderColor: '#EF4444',
  },
  badgePillText: {
    fontSize: 8,
    fontWeight: typography.fontWeight.heavy,
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  badgePillTextDone: {
    color: '#34D399',
  },
  badgePillTextCurrent: {
    color: colors.imperialNavyDark,
  },
  badgePillTextRejected: {
    color: '#F87171',
  },
  stepDesc: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
  stepDetailCard: {
    backgroundColor: colors.imperialNavyDark,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 106, 0.35)',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs + 2,
  },
  plannerAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: colors.imperialNavyDark,
    fontWeight: 'bold',
    fontSize: 12,
  },
  plannerInfo: {
    flex: 1,
  },
  plannerTag: {
    fontSize: 8,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
    letterSpacing: 0.5,
  },
  plannerName: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  plannerEmail: {
    fontSize: 9,
    color: '#94A3B8',
  },
  verifiedSpecialistBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201, 169, 106, 0.15)',
    borderWidth: 0.5,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  verifiedSpecialistText: {
    fontSize: 8,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  consultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  consultType: {
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldLight,
    letterSpacing: 0.5,
  },
  consultTime: {
    fontSize: 9,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  completedNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  checkIconGreen: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: 'bold',
  },
  completedNoticeText: {
    fontSize: 10,
    color: '#34D399',
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
  joinLinkBtn: {
    backgroundColor: colors.gold,
    borderRadius: borderRadius.sm,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    marginTop: 4,
  },
  joinLinkText: {
    fontSize: 10,
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  proposalStatus: {
    fontSize: 10,
    color: '#CBD5E1',
    marginTop: 2,
  },
  rejectionNotice: {
    fontSize: 9,
    color: '#F87171',
    fontStyle: 'italic',
    marginTop: 2,
  },
  viewContractBtn: {
    marginTop: 4,
    paddingVertical: 3,
  },
  viewContractText: {
    fontSize: 10,
    color: colors.goldLight,
    textDecorationLine: 'underline',
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
