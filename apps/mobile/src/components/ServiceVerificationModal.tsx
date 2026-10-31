import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { ImperialLogo } from './ImperialLogo';
import { VerificationResponse } from '@grand-bandhan/shared';
import {
  verificationService,
  ServiceVerificationItem,
} from '../api/services/verification.service';
import { queryClient } from '../api/queryClient';

export interface ServiceVerificationModalProps {
  visible: boolean;
  verification: ServiceVerificationItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const ISSUE_CATEGORIES = [
  'Vendor Delayed / Absent',
  'Service Quality Deficit',
  'Missing Equipment / Materials',
  'Staff Count Discrepancy',
  'Client Requirement Unmet',
  'Other Operational Concern',
];

export const ServiceVerificationModal: React.FC<ServiceVerificationModalProps> = ({
  visible,
  verification,
  onClose,
  onSuccess,
}) => {
  const [selectedResponse, setSelectedResponse] = useState<VerificationResponse | null>(null);
  const [issueCategory, setIssueCategory] = useState<string>(ISSUE_CATEGORIES[0]);
  const [issueNotes, setIssueNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!verification) {
    return null;
  }

  const handleSelectOption = (response: VerificationResponse) => {
    setSelectedResponse(response);
  };

  const handleSubmit = async () => {
    if (!selectedResponse) {
      Alert.alert('Selection Required', 'Please select a verification option before submitting.');
      return;
    }

    if (
      (selectedResponse === VerificationResponse.ISSUE_REPORTED ||
        selectedResponse === VerificationResponse.INCOMPLETE) &&
      !issueNotes.trim()
    ) {
      Alert.alert(
        'Details Required',
        'Please describe the discrepancy or incomplete aspects so the team can take immediate action.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const combinedNotes =
        selectedResponse === VerificationResponse.ISSUE_REPORTED
          ? `[${issueCategory}] ${issueNotes.trim()}`
          : issueNotes.trim() || undefined;

      const result = await verificationService.respond(verification.id, {
        response: selectedResponse,
        issueNotes: combinedNotes,
        evidencePhotos: [],
      });

      queryClient.invalidateQueries({ queryKey: ['verifications'] });
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      Alert.alert(
        selectedResponse === VerificationResponse.COMPLETED
          ? 'Service Verified ⚜️'
          : 'Verification Logged ⚠️',
        result.message || 'Verification update successfully recorded on the Grand Bandhan network.'
      );

      // Reset state
      setSelectedResponse(null);
      setIssueNotes('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Could not record verification response.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormExpanded =
    selectedResponse === VerificationResponse.INCOMPLETE ||
    selectedResponse === VerificationResponse.ISSUE_REPORTED ||
    selectedResponse === VerificationResponse.NOT_DELIVERED;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <ImperialLogo size="xs" withGlow={false} />
              <Text style={styles.headerBadge}>SCHEDULED SERVICE VERIFICATION</Text>
            </View>
            <Text style={styles.serviceName}>{verification.serviceName}</Text>
            <View style={styles.vendorRow}>
              <Text style={styles.vendorName}>
                Vendor: {verification.vendor?.name || 'Assigned Partner'}
              </Text>
              {verification.vendor?.category && (
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {verification.vendor.category}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={styles.prompt}>
              Confirm whether this scheduled milestone service has been fulfilled to standard:
            </Text>

            {/* Option 1: COMPLETED */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedResponse === VerificationResponse.COMPLETED && styles.optionCardSelectedGreen,
              ]}
              onPress={() => handleSelectOption(VerificationResponse.COMPLETED)}
              activeOpacity={0.8}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconCircle, styles.iconCircleGreen]}>
                  <Text style={styles.iconText}>✓</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Yes, Service Completed</Text>
                  <Text style={styles.optionSubtitle}>
                    Vendor fulfilled duties flawlessly to royal imperial standard.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 2: INCOMPLETE */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedResponse === VerificationResponse.INCOMPLETE && styles.optionCardSelectedAmber,
              ]}
              onPress={() => handleSelectOption(VerificationResponse.INCOMPLETE)}
              activeOpacity={0.8}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconCircle, styles.iconCircleAmber]}>
                  <Text style={styles.iconText}>⏳</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Service Incomplete</Text>
                  <Text style={styles.optionSubtitle}>
                    Work is underway or partially finished; pending final touchups.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 3: NOT DELIVERED */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedResponse === VerificationResponse.NOT_DELIVERED && styles.optionCardSelectedRed,
              ]}
              onPress={() => handleSelectOption(VerificationResponse.NOT_DELIVERED)}
              activeOpacity={0.8}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconCircle, styles.iconCircleRed]}>
                  <Text style={styles.iconText}>✕</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>No, Service Not Delivered</Text>
                  <Text style={styles.optionSubtitle}>
                    Vendor has not arrived on venue or failed to perform duties.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Option 4: ISSUE REPORTED */}
            <TouchableOpacity
              style={[
                styles.optionCard,
                selectedResponse === VerificationResponse.ISSUE_REPORTED && styles.optionCardSelectedRed,
              ]}
              onPress={() => handleSelectOption(VerificationResponse.ISSUE_REPORTED)}
              activeOpacity={0.8}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.iconCircle, styles.iconCircleRed]}>
                  <Text style={styles.iconText}>🚨</Text>
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Report an Issue / Discrepancy</Text>
                  <Text style={styles.optionSubtitle}>
                    Quality deficit, delay, or requirement violation requiring escalation.
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Expanded notes section if not completed */}
            {isFormExpanded && (
              <View style={styles.discrepancyBox}>
                <Text style={styles.inputLabel}>
                  {selectedResponse === VerificationResponse.ISSUE_REPORTED
                    ? 'DISCREPANCY CATEGORY & NOTES'
                    : 'OBSERVATIONS & STATUS NOTES'}
                </Text>

                {selectedResponse === VerificationResponse.ISSUE_REPORTED && (
                  <View style={styles.pillsRow}>
                    {ISSUE_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setIssueCategory(cat)}
                        style={[
                          styles.catPill,
                          issueCategory === cat && styles.catPillActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.catPillText,
                            issueCategory === cat && styles.catPillTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <TextInput
                  style={styles.textInput}
                  placeholder="Detail the issue, vendor remarks, or what remains to be completed..."
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  value={issueNotes}
                  onChangeText={setIssueNotes}
                />
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.postponeButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.postponeButtonText}>Remind Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                !selectedResponse && styles.confirmButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selectedResponse || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.confirmButtonText}>Record Verification</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 24, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalCard: {
    width: '100%',
    maxHeight: '88%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gold,
    overflow: 'hidden',
    ...shadows.lg,
  },
  header: {
    backgroundColor: colors.imperialNavy,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  headerBadge: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.gold,
    letterSpacing: 1.5,
    marginLeft: 6,
  },
  serviceName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.2,
  },
  vendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  vendorName: {
    fontSize: typography.fontSize.xs,
    color: colors.goldLight,
    fontWeight: typography.fontWeight.medium,
  },
  categoryBadge: {
    backgroundColor: 'rgba(201, 169, 106, 0.25)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: colors.gold,
  },
  categoryBadgeText: {
    fontSize: 9,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  body: {
    padding: spacing.base,
  },
  prompt: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionCardSelectedGreen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1.5,
  },
  optionCardSelectedAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#D97706',
    borderWidth: 1.5,
  },
  optionCardSelectedRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconCircleGreen: {
    backgroundColor: '#D1FAE5',
  },
  iconCircleAmber: {
    backgroundColor: '#FEF3C7',
  },
  iconCircleRed: {
    backgroundColor: '#FEE2E2',
  },
  iconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  discrepancyBox: {
    backgroundColor: '#FFFBF0',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.sm + 2,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  catPill: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.round,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  catPillActive: {
    backgroundColor: colors.imperialNavy,
    borderColor: colors.imperialNavy,
  },
  catPillText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  catPillTextActive: {
    color: colors.goldLight,
    fontWeight: typography.fontWeight.bold,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: typography.fontSize.xs + 1,
    color: colors.textPrimary,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  postponeButton: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
    backgroundColor: colors.white,
  },
  postponeButtonText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.semibold,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: colors.imperialNavy,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    ...shadows.goldGlow,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.goldLight,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
});
