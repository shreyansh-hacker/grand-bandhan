import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import {
  ImperialHeader,
  ImperialCard,
  ImperialBadge,
  ImperialButton,
  LoadingSkeleton,
  EmptyState,
  ErrorView,
} from '../../components';
import { agreementService, AgreementItem, enquiryService } from '../../api/services';
import { AgreementStatus } from '@grand-bandhan/shared';
import { formatDate, formatINR } from '../../utils/formatters';
import { queryClient } from '../../api/queryClient';
import { API_BASE_URL } from '../../api/endpoints';

const STATUS_FILTERS = ['ALL', 'DRAFT', 'SENT', 'SIGNED', 'VERIFIED', 'REJECTED'];

export const AgreementsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Generate Agreement Modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');
  const [totalAmount, setTotalAmount] = useState('2500000');
  const [depositAmount, setDepositAmount] = useState('500000');
  const [isGenerating, setIsGenerating] = useState(false);

  // Rejection Modal
  const [rejectingAgreement, setRejectingAgreement] = useState<AgreementItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Action Loading ID
  const [actionId, setActionId] = useState<string | null>(null);

  // Fetch Agreements
  const {
    data: agreements = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['agreements'],
    queryFn: () => agreementService.list(),
  });

  // Fetch Enquiries for generating dropdown
  const { data: enquiries = [] } = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => enquiryService.list(),
  });

  const handleGenerateAgreement = async () => {
    if (!selectedEnquiryId) {
      Alert.alert('Selection Required', 'Please select a wedding enquiry to generate the 20-section agreement.');
      return;
    }

    try {
      setIsGenerating(true);
      await agreementService.generate({
        enquiryId: selectedEnquiryId,
        totalAmount: parseFloat(totalAmount) || 2500000,
        depositAmount: parseFloat(depositAmount) || 500000,
      });

      queryClient.invalidateQueries({ queryKey: ['agreements'] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });

      Alert.alert('Agreement Generated 📜', '20-section legal wedding contract generated with customized statutory schedules and payment milestones.');
      setShowGenerateModal(false);
      setSelectedEnquiryId('');
    } catch (err: any) {
      Alert.alert('Generation Error', err.message || 'Could not generate agreement.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToCouple = async (id: string) => {
    setActionId(id);
    try {
      await agreementService.send(id);
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
      Alert.alert('Agreement Dispatched ✉️', 'Contract review link sent to the couple portal for digital signature verification.');
    } catch (err: any) {
      Alert.alert('Dispatch Error', err.message || 'Could not send agreement.');
    } finally {
      setActionId(null);
    }
  };

  const handleVerifyAgreement = async (id: string) => {
    Alert.alert(
      'Formally Verify Agreement?',
      'Executing and countersigning this agreement will verify deposit escrow and unlock all 26 lifecycle wedding execution tasks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify & Countersign ⚜️',
          onPress: async () => {
            setActionId(id);
            try {
              await agreementService.verify(id, 'VERIFIED');
              queryClient.invalidateQueries({ queryKey: ['agreements'] });
              queryClient.invalidateQueries({ queryKey: ['weddings'] });
              queryClient.invalidateQueries({ queryKey: ['tasks'] });
              Alert.alert('Agreement Executed 👑', 'Service agreement verified and countersigned! Active operations unlocked.');
            } catch (err: any) {
              Alert.alert('Verification Error', err.message || 'Could not verify agreement.');
            } finally {
              setActionId(null);
            }
          },
        },
      ]
    );
  };

  const handleRejectSubmit = async () => {
    if (!rejectingAgreement || !rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please provide specific reasons or clauses requiring amendment.');
      return;
    }

    try {
      setIsRejecting(true);
      await agreementService.verify(rejectingAgreement.id, 'REJECTED', rejectionReason.trim());
      queryClient.invalidateQueries({ queryKey: ['agreements'] });
      Alert.alert('Agreement Rejected', 'Notice sent to couple with requested corrections.');
      setRejectingAgreement(null);
      setRejectionReason('');
    } catch (err: any) {
      Alert.alert('Rejection Error', err.message || 'Could not update agreement status.');
    } finally {
      setIsRejecting(false);
    }
  };

  const filteredAgreements = agreements.filter((a) => {
    if (filterStatus === 'ALL') return true;
    return a.status === filterStatus;
  });

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Legal Agreements"
        subtitle="20-Section Statutory Contracts & Digital Countersignatures"
        onBackPress={() => navigation.goBack()}
        rightAction={{
          label: '+ Generate',
          onPress: () => setShowGenerateModal(true),
        }}
      />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filterStatus === status && styles.filterTabActive,
              ]}
              onPress={() => setFilterStatus(status)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterStatus === status && styles.filterTabTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.content}>
          <LoadingSkeleton height={160} style={styles.skeleton} />
          <LoadingSkeleton height={160} style={styles.skeleton} />
          <LoadingSkeleton height={160} style={styles.skeleton} />
        </View>
      ) : error ? (
        <ErrorView message="Could not load wedding agreements." onRetry={() => refetch()} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => refetch()}
              tintColor={colors.gold}
            />
          }
        >
          {filteredAgreements.length === 0 ? (
            <EmptyState
              title="No Agreements Found"
              message={
                filterStatus === 'ALL'
                  ? 'No statutory contracts generated yet. Convert an enquiry to draft an agreement.'
                  : `No agreements found with status "${filterStatus}".`
              }
              actionLabel="+ Generate 20-Section Contract"
              onAction={() => setShowGenerateModal(true)}
            />
          ) : (
            filteredAgreements.map((agreement) => {
              const isDraft = agreement.status === AgreementStatus.DRAFT;
              const isSent = agreement.status === AgreementStatus.SENT;
              const isSigned =
                agreement.status === AgreementStatus.SIGNED ||
                agreement.status === AgreementStatus.PENDING_VERIFICATION;
              const isVerified = agreement.status === AgreementStatus.VERIFIED;
              const isRejected = agreement.status === AgreementStatus.REJECTED;
              const isActionLoading = actionId === agreement.id;

              return (
                <ImperialCard key={agreement.id} variant="elevated" style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={styles.titleCol}>
                      <Text style={styles.contractNumber}>{agreement.agreementNumber}</Text>
                      <Text style={styles.clientName}>
                        {agreement.enquiry?.customerName || 'Honored Couple'}
                      </Text>
                      {agreement.enquiry?.referenceNumber && (
                        <Text style={styles.refNumber}>{agreement.enquiry.referenceNumber}</Text>
                      )}
                    </View>
                    <ImperialBadge
                      label={agreement.status}
                      variant={
                        isVerified
                          ? 'success'
                          : isSigned
                          ? 'gold'
                          : isRejected
                          ? 'danger'
                          : isSent
                          ? 'info'
                          : 'neutral'
                      }
                    />
                  </View>

                  <View style={styles.financialRow}>
                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>TOTAL CONTRACT</Text>
                      <Text style={styles.financialVal}>{formatINR(agreement.totalAmount)}</Text>
                    </View>
                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>DEPOSIT ESCROW</Text>
                      <Text style={[styles.financialVal, { color: colors.goldDark }]}>
                        {formatINR(agreement.depositAmount)}
                      </Text>
                    </View>
                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>VERSION</Text>
                      <Text style={styles.financialVal}>v{agreement.version}.0</Text>
                    </View>
                  </View>

                  {/* Signatures & Execution Status */}
                  <View style={styles.signatureBox}>
                    <View style={styles.sigRow}>
                      <Text style={styles.sigLabel}>Couple Digital Signature:</Text>
                      <Text style={[styles.sigVal, agreement.signedAt ? styles.sigSigned : styles.sigPending]}>
                        {agreement.signedAt
                          ? `✓ Signed by ${agreement.clientSignatureName || 'Couple'} (${formatDate(agreement.signedAt)})`
                          : '⏳ Pending Digital Signature'}
                      </Text>
                    </View>
                    <View style={styles.sigRow}>
                      <Text style={styles.sigLabel}>Imperial Countersignature:</Text>
                      <Text style={[styles.sigVal, agreement.verifiedAt ? styles.sigSigned : styles.sigPending]}>
                        {agreement.verifiedAt
                          ? `✓ Executed by Agency (${formatDate(agreement.verifiedAt)})`
                          : '⏳ Pending Verification'}
                      </Text>
                    </View>
                  </View>

                  {/* Preview Link */}
                  <TouchableOpacity
                    style={styles.previewBtn}
                    onPress={() => Linking.openURL(`${API_BASE_URL}/api/agreements/download/${agreement.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.previewBtnText}>👁️ View 20-Section Contract Document</Text>
                  </TouchableOpacity>

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    {isDraft && (
                      <ImperialButton
                        title="Send to Couple ✉️"
                        variant="gold"
                        size="sm"
                        loading={isActionLoading}
                        onPress={() => handleSendToCouple(agreement.id)}
                        style={styles.actionBtn}
                      />
                    )}

                    {isSigned && (
                      <>
                        <TouchableOpacity
                          style={styles.rejectBtn}
                          onPress={() => setRejectingAgreement(agreement)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.rejectBtnText}>Require Revision</Text>
                        </TouchableOpacity>

                        <ImperialButton
                          title="Verify & Countersign ⚜️"
                          variant="gold"
                          size="sm"
                          loading={isActionLoading}
                          onPress={() => handleVerifyAgreement(agreement.id)}
                          style={styles.actionBtn}
                        />
                      </>
                    )}

                    {isVerified && (
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedText}>✓ ACTIVE WEDDING OPERATIONS UNLOCKED</Text>
                      </View>
                    )}
                  </View>
                </ImperialCard>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Generate Agreement Modal */}
      <Modal
        visible={showGenerateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenerateModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate 20-Section Agreement</Text>
              <Text style={styles.modalSubtitle}>Statutory Wedding Contract Generator</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>SELECT WEDDING ENQUIRY</Text>
              <ScrollView horizontal style={styles.enquiryPills} showsHorizontalScrollIndicator={false}>
                {enquiries.slice(0, 10).map((e) => (
                  <TouchableOpacity
                    key={e.id}
                    style={[
                      styles.enquiryPill,
                      selectedEnquiryId === e.id && styles.enquiryPillActive,
                    ]}
                    onPress={() => setSelectedEnquiryId(e.id)}
                  >
                    <Text
                      style={[
                        styles.enquiryPillText,
                        selectedEnquiryId === e.id && styles.enquiryPillTextActive,
                      ]}
                    >
                      {e.customerName} ({e.referenceNumber || e.id.slice(0, 6)})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>TOTAL CONTRACT VALUE (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="2500000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={totalAmount}
                onChangeText={setTotalAmount}
              />

              <Text style={styles.inputLabel}>INITIAL DEPOSIT / ESCROW AMOUNT (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="500000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />

              <View style={styles.statutoryInfoBox}>
                <Text style={styles.statutoryTitle}>INCLUDES 20 STATUTORY LEGAL CLAUSES:</Text>
                <Text style={styles.statutoryText}>
                  • Scope of Services & Exclusions{'\n'}
                  • Milestone Escrow Payment Schedule{'\n'}
                  • Force Majeure & Weather Resilience{'\n'}
                  • Vendor Mediation & Non-Solicitation{'\n'}
                  • Cancellation & Postponement Policy{'\n'}
                  • Digital Countersignature & Audit Trail
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowGenerateModal(false)}
                disabled={isGenerating}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleGenerateAgreement}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color={colors.imperialNavyDark} />
                ) : (
                  <Text style={styles.saveBtnText}>Draft Contract 📜</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Revision Modal */}
      <Modal
        visible={!!rejectingAgreement}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectingAgreement(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Agreement Revision</Text>
              <Text style={styles.modalSubtitle}>Specify clauses or changes needed before execution</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>REVISION INSTRUCTIONS FOR COUPLE</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Detail required modifications (e.g., incorrect guest count, requested custom dietary clause)..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                value={rejectionReason}
                onChangeText={setRejectionReason}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setRejectingAgreement(null)}
                disabled={isRejecting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.danger }]}
                onPress={handleRejectSubmit}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={[styles.saveBtnText, { color: colors.white }]}>Send Revision Request</Text>
                )}
              </TouchableOpacity>
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
    backgroundColor: colors.backgroundLight,
  },
  headerBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: borderRadius.sm,
  },
  headerBtnText: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.xs,
  },
  filterBar: {
    backgroundColor: colors.imperialNavy,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  filterScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterTabActive: {
    backgroundColor: colors.gold,
  },
  filterTabText: {
    fontSize: typography.fontSize.xs,
    color: '#CBD5E1',
    fontWeight: typography.fontWeight.medium,
  },
  filterTabTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    padding: spacing.base,
    paddingBottom: spacing.xxl,
  },
  skeleton: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  titleCol: {
    flex: 1,
  },
  contractNumber: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 0.8,
  },
  clientName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginTop: 2,
  },
  refNumber: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
    marginTop: 1,
  },
  financialRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginVertical: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  financialCol: {
    flex: 1,
  },
  financialLabel: {
    fontSize: 8,
    fontWeight: typography.fontWeight.heavy,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  financialVal: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginTop: 2,
  },
  signatureBox: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  sigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  sigLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  sigVal: {
    fontSize: 10,
    fontWeight: typography.fontWeight.semibold,
  },
  sigSigned: {
    color: colors.success,
  },
  sigPending: {
    color: colors.warning,
  },
  previewBtn: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: spacing.sm,
  },
  previewBtnText: {
    fontSize: typography.fontSize.xs,
    color: '#0284C7',
    fontWeight: typography.fontWeight.semibold,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    alignItems: 'center',
  },
  actionBtn: {
    minWidth: 140,
  },
  rejectBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  rejectBtnText: {
    color: colors.danger,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  verifiedBadge: {
    backgroundColor: '#ECFDF5',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#10B981',
    width: '100%',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: '#047857',
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 24, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderGold,
    maxHeight: '85%',
  },
  modalHeader: {
    backgroundColor: colors.imperialNavy,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  modalTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.goldLight,
    marginTop: 2,
  },
  modalBody: {
    padding: spacing.base,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavy,
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    fontSize: typography.fontSize.xs + 1,
    color: colors.textPrimary,
  },
  textArea: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.xs + 1,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  enquiryPills: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  enquiryPill: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: 6,
  },
  enquiryPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.goldDark,
  },
  enquiryPillText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  enquiryPillTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  statutoryInfoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statutoryTitle: {
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavy,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statutoryText: {
    fontSize: 10,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FAFAFA',
    gap: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: colors.gold,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  saveBtnText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
});
