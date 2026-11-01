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
import { consultationService, ConsultationItem, enquiryService } from '../../api/services';
import { ConsultationStatus, ConsultationType } from '@grand-bandhan/shared';
import { formatDate, formatTime, formatINR } from '../../utils/formatters';
import { queryClient } from '../../api/queryClient';

const STATUS_FILTERS = ['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'];

export const ConsultationsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Complete Consultation Modal
  const [completingConsultation, setCompletingConsultation] = useState<ConsultationItem | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [coupleVision, setCoupleVision] = useState('');
  const [themePreferences, setThemePreferences] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budgetDiscussed, setBudgetDiscussed] = useState('');
  const [venuePreferences, setVenuePreferences] = useState('');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingType, setMeetingType] = useState<ConsultationType>(ConsultationType.ONLINE_VIDEO);
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/grb-wed-royal');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmittingSchedule, setIsSubmittingSchedule] = useState(false);

  // Fetch Consultations
  const {
    data: consultations = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => consultationService.list(),
  });

  // Fetch Enquiries for scheduling dropdown
  const { data: enquiries = [] } = useQuery({
    queryKey: ['enquiries'],
    queryFn: () => enquiryService.list(),
  });

  const handleOpenCompleteModal = (item: ConsultationItem) => {
    setCompletingConsultation(item);
    setCompleteNotes(item.meetingNotes || '');
    setCoupleVision(item.coupleVision || '');
    setThemePreferences(item.themePreferences || '');
    setGuestCount(item.guestCountConfirmed ? String(item.guestCountConfirmed) : '');
    setBudgetDiscussed(item.budgetDiscussed ? String(item.budgetDiscussed) : '');
    setVenuePreferences(item.venuePreferences || '');
  };

  const handleSaveCompletion = async () => {
    if (!completingConsultation) return;
    if (!completeNotes.trim() && !coupleVision.trim()) {
      Alert.alert('Required Fields', 'Please record summary notes or the couple vision from the consultation session.');
      return;
    }

    try {
      setIsSubmittingComplete(true);
      await consultationService.complete(completingConsultation.id, {
        meetingNotes: completeNotes.trim(),
        coupleVision: coupleVision.trim() || undefined,
        themePreferences: themePreferences.trim() || undefined,
        guestCountConfirmed: guestCount ? parseInt(guestCount, 10) : undefined,
        budgetDiscussed: budgetDiscussed ? parseFloat(budgetDiscussed) : undefined,
        venuePreferences: venuePreferences.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['weddings'] });

      Alert.alert('Consultation Completed ⚜️', 'Studio intake notes saved. You can now generate the official legal agreement!');
      setCompletingConsultation(null);
    } catch (err: any) {
      Alert.alert('Completion Error', err.message || 'Could not complete consultation.');
    } finally {
      setIsSubmittingComplete(false);
    }
  };

  const handleScheduleSubmit = async () => {
    if (!selectedEnquiryId) {
      Alert.alert('Selection Required', 'Please select a wedding enquiry to schedule.');
      return;
    }
    if (!meetingDate.trim()) {
      Alert.alert('Date Required', 'Please provide a scheduled date and time (e.g. 2026-11-15 15:00).');
      return;
    }

    try {
      setIsSubmittingSchedule(true);
      const parsedDate = new Date(meetingDate.trim()).toISOString();
      await consultationService.schedule({
        enquiryId: selectedEnquiryId,
        scheduledAt: parsedDate,
        meetingType,
        meetingLink: meetingType === ConsultationType.ONLINE_VIDEO ? meetingLink : undefined,
        meetingLocation: meetingType === ConsultationType.IN_PERSON ? meetingLocation : undefined,
        notes: notes.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });

      Alert.alert('Consultation Scheduled 👑', 'The couple has been scheduled for their bespoke first consultation session.');
      setShowScheduleModal(false);
      setSelectedEnquiryId('');
      setMeetingDate('');
      setNotes('');
    } catch (err: any) {
      Alert.alert('Scheduling Error', err.message || 'Could not schedule consultation. Verify date format.');
    } finally {
      setIsSubmittingSchedule(false);
    }
  };

  const filteredConsultations = consultations.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Consultation Studio"
        subtitle="Intake Notes, Vision Discovery & Package Advisory"
        onBackPress={() => navigation.goBack()}
        rightAction={{
          label: '+ Schedule',
          onPress: () => setShowScheduleModal(true),
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

      {/* Content Body */}
      {isLoading ? (
        <View style={styles.content}>
          <LoadingSkeleton height={140} style={styles.skeleton} />
          <LoadingSkeleton height={140} style={styles.skeleton} />
          <LoadingSkeleton height={140} style={styles.skeleton} />
        </View>
      ) : error ? (
        <ErrorView message="Could not load consultation appointments." onRetry={() => refetch()} />
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
          {filteredConsultations.length === 0 ? (
            <EmptyState
              title="No Consultations Found"
              message={
                filterStatus === 'ALL'
                  ? 'No first consultation appointments have been scheduled yet.'
                  : `No appointments with status "${filterStatus}".`
              }
              actionLabel="+ Schedule First Consultation"
              onAction={() => setShowScheduleModal(true)}
            />
          ) : (
            filteredConsultations.map((item) => {
              const isCompleted = item.status === ConsultationStatus.COMPLETED;
              const isScheduled = item.status === ConsultationStatus.SCHEDULED;

              return (
                <ImperialCard key={item.id} variant="elevated" style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={styles.clientGroup}>
                      <Text style={styles.clientName}>
                        {item.enquiry?.customerName || 'Honored Couple'}
                      </Text>
                      {item.enquiry?.referenceNumber && (
                        <Text style={styles.refText}>{item.enquiry.referenceNumber}</Text>
                      )}
                    </View>
                    <ImperialBadge
                      label={item.status}
                      variant={
                        isCompleted
                          ? 'success'
                          : isScheduled
                          ? 'gold'
                          : 'neutral'
                      }
                    />
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaItem}>
                      📅 {formatDate(item.scheduledAt)} at {formatTime(item.scheduledAt)}
                    </Text>
                    <Text style={styles.metaItem}>
                      {item.meetingType === ConsultationType.ONLINE_VIDEO ? '🎥 Online Video' : '🏛️ In-Person Studio'}
                    </Text>
                  </View>

                  {item.meetingLink && item.meetingType === ConsultationType.ONLINE_VIDEO && (
                    <TouchableOpacity
                      style={styles.linkContainer}
                      onPress={() => item.meetingLink && Linking.openURL(item.meetingLink)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.linkLabel} numberOfLines={1}>
                        🔗 {item.meetingLink}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {item.meetingLocation && (
                    <Text style={styles.locationText}>📍 {item.meetingLocation}</Text>
                  )}

                  {item.coupleVision && (
                    <View style={styles.visionBox}>
                      <Text style={styles.visionHeader}>VISION & PREFERENCES:</Text>
                      <Text style={styles.visionBody} numberOfLines={3}>
                        {item.coupleVision}
                      </Text>
                      {item.budgetDiscussed && (
                        <Text style={styles.budgetDiscussed}>
                          Budget Discussed: {formatINR(item.budgetDiscussed)}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.cardActions}>
                    {isScheduled && (
                      <ImperialButton
                        title="Conduct Intake Session ⚜️"
                        variant="gold"
                        size="sm"
                        onPress={() => handleOpenCompleteModal(item)}
                        style={styles.actionBtn}
                      />
                    )}
                    {isCompleted && (
                      <ImperialButton
                        title="Review Intake Notes"
                        variant="outline"
                        size="sm"
                        onPress={() => handleOpenCompleteModal(item)}
                        style={styles.actionBtn}
                      />
                    )}
                  </View>
                </ImperialCard>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Complete Intake Modal */}
      <Modal
        visible={!!completingConsultation}
        transparent
        animationType="slide"
        onRequestClose={() => setCompletingConsultation(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>First Consultation Studio Intake</Text>
              <Text style={styles.modalSubtitle}>
                Couple: {completingConsultation?.enquiry?.customerName || 'Honored Client'}
              </Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>CEREMONIAL VISION & DESIRED VIBE</Text>
              <TextInput
                style={styles.textArea}
                placeholder="E.g., Royal Rajasthani Palace aesthetic with modern pastel florals..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={coupleVision}
                onChangeText={setCoupleVision}
              />

              <Text style={styles.inputLabel}>THEME & COLOR PALETTE</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Emerald Green, Antique Gold & Pearl Ivory"
                placeholderTextColor={colors.textMuted}
                value={themePreferences}
                onChangeText={setThemePreferences}
              />

              <View style={styles.inputRow}>
                <View style={styles.halfCol}>
                  <Text style={styles.inputLabel}>ESTIMATED GUESTS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., 500"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={guestCount}
                    onChangeText={setGuestCount}
                  />
                </View>
                <View style={styles.halfCol}>
                  <Text style={styles.inputLabel}>DISCUSSED BUDGET (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="E.g., 2500000"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={budgetDiscussed}
                    onChangeText={setBudgetDiscussed}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>VENUE PREFERENCES / REGIONS</Text>
              <TextInput
                style={styles.input}
                placeholder="E.g., Udaipur Palace or Heritage Resort, Jaipur"
                placeholderTextColor={colors.textMuted}
                value={venuePreferences}
                onChangeText={setVenuePreferences}
              />

              <Text style={styles.inputLabel}>SESSION SUMMARY & NEXT ACTIONS</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Key agreements made during video call, next steps..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={completeNotes}
                onChangeText={setCompleteNotes}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCompletingConsultation(null)}
                disabled={isSubmittingComplete}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSaveCompletion}
                disabled={isSubmittingComplete}
              >
                {isSubmittingComplete ? (
                  <ActivityIndicator size="small" color={colors.imperialNavy} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Consultation ⚜️</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Consultation Modal */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule First Consultation</Text>
              <Text style={styles.modalSubtitle}>Book a vision discovery session with an enquiry</Text>
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

              <Text style={styles.inputLabel}>SCHEDULED DATE & TIME (YYYY-MM-DD HH:mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-11-20 16:00"
                placeholderTextColor={colors.textMuted}
                value={meetingDate}
                onChangeText={setMeetingDate}
              />

              <Text style={styles.inputLabel}>MEETING FORMAT</Text>
              <View style={styles.formatRow}>
                <TouchableOpacity
                  style={[
                    styles.formatBtn,
                    meetingType === ConsultationType.ONLINE_VIDEO && styles.formatBtnActive,
                  ]}
                  onPress={() => setMeetingType(ConsultationType.ONLINE_VIDEO)}
                >
                  <Text
                    style={[
                      styles.formatBtnText,
                      meetingType === ConsultationType.ONLINE_VIDEO && styles.formatBtnTextActive,
                    ]}
                  >
                    🎥 Online Video
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.formatBtn,
                    meetingType === ConsultationType.IN_PERSON && styles.formatBtnActive,
                  ]}
                  onPress={() => setMeetingType(ConsultationType.IN_PERSON)}
                >
                  <Text
                    style={[
                      styles.formatBtnText,
                      meetingType === ConsultationType.IN_PERSON && styles.formatBtnTextActive,
                    ]}
                  >
                    🏛️ In-Person Studio
                  </Text>
                </TouchableOpacity>
              </View>

              {meetingType === ConsultationType.ONLINE_VIDEO ? (
                <>
                  <Text style={styles.inputLabel}>GOOGLE MEET / VIDEO LINK</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://meet.google.com/..."
                    placeholderTextColor={colors.textMuted}
                    value={meetingLink}
                    onChangeText={setMeetingLink}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.inputLabel}>STUDIO SUITE ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Grand Bandhan Royal Suite, Udaipur"
                    placeholderTextColor={colors.textMuted}
                    value={meetingLocation}
                    onChangeText={setMeetingLocation}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>INTERNAL PREPARATION NOTES</Text>
              <TextInput
                style={styles.textArea}
                placeholder="E.g., Couple requested emphasis on destination transport..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowScheduleModal(false)}
                disabled={isSubmittingSchedule}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleScheduleSubmit}
                disabled={isSubmittingSchedule}
              >
                {isSubmittingSchedule ? (
                  <ActivityIndicator size="small" color={colors.imperialNavy} />
                ) : (
                  <Text style={styles.saveBtnText}>Confirm Booking 👑</Text>
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
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: colors.gold,
    borderColor: colors.goldDark,
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
  clientGroup: {
    flex: 1,
  },
  clientName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  refText: {
    fontSize: 10,
    color: colors.goldDark,
    fontWeight: typography.fontWeight.bold,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: 4,
  },
  metaItem: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  linkContainer: {
    backgroundColor: '#F0F7FF',
    padding: spacing.xs + 2,
    borderRadius: borderRadius.sm,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  linkLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: '#0284C7',
    fontWeight: typography.fontWeight.semibold,
  },
  locationText: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    marginTop: 4,
  },
  visionBox: {
    backgroundColor: '#FFFDF5',
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  visionHeader: {
    fontSize: 9,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  visionBody: {
    fontSize: typography.fontSize.xs,
    color: colors.textPrimary,
    lineHeight: 16,
  },
  budgetDiscussed: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.bold,
    marginTop: 4,
  },
  cardActions: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    minWidth: 140,
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
    minHeight: 60,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfCol: {
    flex: 1,
  },
  formatRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  formatBtn: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  formatBtnActive: {
    backgroundColor: colors.imperialNavy,
    borderColor: colors.imperialNavy,
  },
  formatBtnText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  formatBtnTextActive: {
    color: colors.goldLight,
    fontWeight: typography.fontWeight.bold,
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
