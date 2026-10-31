import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { ImperialGlassCard } from './ImperialGlassCard';
import { ImperialButton } from './ImperialButton';
import { ImperialInput } from './ImperialInput';
import { useAuthStore } from '../store/authStore';
import { enquiryService } from '../api/services';
import { PlanningForSide } from '@grand-bandhan/shared';

type HelpCategory =
  | 'COMPLAINT'
  | 'PLANNING_INQUIRY'
  | 'CALLBACK_REQUEST'
  | 'GENERAL_SUPPORT';

export const FloatingHelpWidget: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory>('PLANNING_INQUIRY');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openWidget = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    const customerName = name.trim() || user?.name || 'Grand Bandhan Guest';
    const customerEmail = email.trim() || user?.email || 'guest@grandbandhan.com';
    const customerPhone = phone.trim() || user?.phone || '+91 99999 99999';

    if (!message.trim()) {
      Alert.alert('Details Required', 'Please provide a short description or inquiry.');
      return;
    }

    setSubmitting(true);
    try {
      const categoryTitles: Record<HelpCategory, string> = {
        COMPLAINT: '🚨 EMERGENCY ESCALATION & COMPLAINT',
        PLANNING_INQUIRY: '💍 ROYAL PLANNING INQUIRY',
        CALLBACK_REQUEST: '📞 CONCIERGE CALLBACK REQUEST',
        GENERAL_SUPPORT: '💬 CONCIERGE ASSISTANCE',
      };

      const enrichedNotes = `[${categoryTitles[selectedCategory]}]\n${message.trim()}\n\nSender: ${customerName} (${customerPhone})`;

      if (isAuthenticated) {
        await enquiryService.create({
          customerName,
          email: customerEmail,
          phone: customerPhone,
          location: 'Royal App Desk',
          guestCount: 200,
          minBudget: 1000000,
          maxBudget: 2500000,
          source: 'WEBSITE',
          planningFor: PlanningForSide.NOT_SPECIFIED,
          notes: enrichedNotes,
        });
      } else {
        await enquiryService.createPublic({
          customerName,
          email: customerEmail,
          phone: customerPhone,
          location: 'App Mobile In-App Help',
          guestCount: 200,
          minBudget: 1000000,
          maxBudget: 2500000,
          source: 'WEBSITE',
          planningFor: PlanningForSide.NOT_SPECIFIED,
          notes: enrichedNotes,
        });
      }

      Alert.alert(
        '👑 Royal Concierge Alerted',
        'Your request has been dispatched directly to the Imperial Management Desk. A concierge officer will contact you promptly.',
        [{ text: 'Dismiss', onPress: () => setIsOpen(false) }]
      );
      setMessage('');
    } catch (err: any) {
      Alert.alert('Assistance Desk', err?.response?.data?.message || err?.message || 'Failed to dispatch request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={openWidget}
        activeOpacity={0.85}
      >
        <View style={styles.fabInner}>
          <Text style={styles.fabIcon}>👑</Text>
        </View>
        <View style={styles.pulseBadge} />
      </TouchableOpacity>

      {/* Interactive Modal Sheet */}
      <Modal visible={isOpen} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBackdrop}>
            <ImperialGlassCard style={styles.modalCard} tone="navy">
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.headerSubtitle}>IMPERIAL 24/7 CONCIERGE</Text>
                  <Text style={styles.headerTitle}>Royal Assistance Desk</Text>
                </View>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Category Options */}
                <Text style={styles.categoryLabel}>Select Nature of Request</Text>
                <View style={styles.categoryGrid}>
                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      selectedCategory === 'PLANNING_INQUIRY' && styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategory('PLANNING_INQUIRY')}
                  >
                    <Text style={styles.catIcon}>💍</Text>
                    <Text
                      style={[
                        styles.catText,
                        selectedCategory === 'PLANNING_INQUIRY' && styles.catTextActive,
                      ]}
                    >
                      Planning Inquiry
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      selectedCategory === 'CALLBACK_REQUEST' && styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategory('CALLBACK_REQUEST')}
                  >
                    <Text style={styles.catIcon}>📞</Text>
                    <Text
                      style={[
                        styles.catText,
                        selectedCategory === 'CALLBACK_REQUEST' && styles.catTextActive,
                      ]}
                    >
                      Request Callback
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      selectedCategory === 'COMPLAINT' && styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategory('COMPLAINT')}
                  >
                    <Text style={styles.catIcon}>🚨</Text>
                    <Text
                      style={[
                        styles.catText,
                        selectedCategory === 'COMPLAINT' && styles.catTextActive,
                      ]}
                    >
                      Urgent Escalation
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryCard,
                      selectedCategory === 'GENERAL_SUPPORT' && styles.categoryCardActive,
                    ]}
                    onPress={() => setSelectedCategory('GENERAL_SUPPORT')}
                  >
                    <Text style={styles.catIcon}>💬</Text>
                    <Text
                      style={[
                        styles.catText,
                        selectedCategory === 'GENERAL_SUPPORT' && styles.catTextActive,
                      ]}
                    >
                      Custom Message
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form Inputs */}
                <ImperialInput
                  label="Your Name *"
                  placeholder="Royal Guest / Couple"
                  value={name}
                  onChangeText={setName}
                />
                <ImperialInput
                  label="Contact Phone *"
                  placeholder="+91 98765 43210"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <ImperialInput
                  label="Message / Inquiries *"
                  placeholder="Describe your requirement, issue or question..."
                  multiline
                  numberOfLines={4}
                  value={message}
                  onChangeText={setMessage}
                />

                <View style={styles.actionRow}>
                  <ImperialButton
                    title="Cancel"
                    variant="outline"
                    onPress={() => setIsOpen(false)}
                    style={styles.actionBtn}
                  />
                  <ImperialButton
                    title={submitting ? 'Dispatching...' : 'Dispatch to Desk'}
                    variant="gold"
                    loading={submitting}
                    onPress={handleSubmit}
                    style={styles.actionBtn}
                  />
                </View>
              </ScrollView>
            </ImperialGlassCard>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 74,
    zIndex: 9999,
    ...shadows.lg,
  },
  fabInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.imperialNavyDark,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 22,
  },
  pulseBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.imperialNavyDark,
  },
  modalOverlay: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: spacing.md,
  },
  modalCard: {
    maxHeight: '88%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
    paddingBottom: spacing.sm,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs - 2,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  closeText: {
    fontSize: 20,
    color: '#8E9CAE',
  },
  modalBody: {
    marginBottom: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  categoryCardActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201, 169, 106, 0.2)',
  },
  catIcon: {
    fontSize: 16,
  },
  catText: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.medium,
  },
  catTextActive: {
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
