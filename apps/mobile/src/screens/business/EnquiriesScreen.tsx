import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import {
  ImperialHeader,
  ImperialGlassCard,
  ImperialButton,
  ImperialInput,
  ImperialBadge,
  LoadingSkeleton,
  EmptyState,
} from '../../components';
import { enquiryService, CreateEnquiryInput, CustomerEnquiry } from '../../api/services';
import { EnquiryStatus, PlanningForSide } from '@grand-bandhan/shared';
import { formatCurrency, formatDate } from '../../utils/formatters';

const STATUS_FILTERS: (EnquiryStatus | 'ALL')[] = [
  'ALL',
  EnquiryStatus.NEW,
  EnquiryStatus.CONTACTED,
  EnquiryStatus.PROPOSAL_SENT,
  EnquiryStatus.CONVERTED,
];

export const EnquiriesScreen: React.FC = () => {
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<EnquiryStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEnquiryInput>({
    customerName: '',
    email: '',
    phone: '',
    location: '',
    guestCount: 300,
    minBudget: 1500000,
    maxBudget: 3500000,
    source: 'WEBSITE',
    planningFor: PlanningForSide.NOT_SPECIFIED,
    notes: '',
  });

  const fetchEnquiries = useCallback(async () => {
    try {
      const data = await enquiryService.list();
      setEnquiries(data);
    } catch (err: any) {
      console.warn('Failed to load enquiries:', err?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEnquiries();
  };

  const handleCreateEnquiry = async () => {
    if (!formData.customerName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.location.trim()) {
      Alert.alert('Required Fields', 'Please fill in Customer Name, Email, Phone and Location.');
      return;
    }

    setSubmitting(true);
    try {
      await enquiryService.create(formData);
      Alert.alert('Success', 'Royal enquiry created successfully!');
      setModalVisible(false);
      setFormData({
        customerName: '',
        email: '',
        phone: '',
        location: '',
        guestCount: 300,
        minBudget: 1500000,
        maxBudget: 3500000,
        source: 'WEBSITE',
        planningFor: PlanningForSide.NOT_SPECIFIED,
        notes: '',
      });
      fetchEnquiries();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.message || err?.message || 'Failed to create enquiry');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEnquiries = enquiries.filter((item) => {
    const matchesFilter = activeFilter === 'ALL' || item.status === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadgeVariant = (status: EnquiryStatus) => {
    switch (status) {
      case EnquiryStatus.NEW:
        return 'gold';
      case EnquiryStatus.CONTACTED:
        return 'info';
      case EnquiryStatus.PROPOSAL_SENT:
        return 'warning';
      case EnquiryStatus.CONVERTED:
        return 'success';
      case EnquiryStatus.LOST:
      default:
        return 'muted';
    }
  };

  const renderEnquiryCard = ({ item }: { item: CustomerEnquiry }) => (
    <ImperialGlassCard style={styles.card} tone="navy">
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.refNumber}>{item.referenceNumber || 'GB-ENQ-LEAD'}</Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
        </View>
        <ImperialBadge
          label={item.status}
          variant={getStatusBadgeVariant(item.status)}
          size="sm"
        />
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>📍 Venue / City</Text>
          <Text style={styles.detailValue}>{item.location}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>👥 Guests</Text>
          <Text style={styles.detailValue}>{item.guestCount || '—'} pax</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>💰 Budget Range</Text>
          <Text style={styles.budgetHighlight}>
            {formatCurrency(item.minBudget)} – {formatCurrency(item.maxBudget)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>🏛️ Side</Text>
          <Text style={styles.detailValue}>{item.planningFor || 'BOTH'}</Text>
        </View>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.contactInfo}>
          📞 {item.phone} • ✉️ {item.email}
        </Text>
        {item.assignedPlannerId && (
          <Text style={styles.plannerAssigned}>✓ Planner Assigned</Text>
        )}
      </View>
    </ImperialGlassCard>
  );

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Royal Enquiries & CRM"
        subtitle="Active Wedding Leads & Pipeline"
      />

      <View style={styles.actionBar}>
        <ImperialInput
          placeholder="Search by client or reference..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          containerStyle={styles.searchBar}
        />
        <ImperialButton
          title="+ Add Lead"
          variant="gold"
          size="sm"
          onPress={() => setModalVisible(true)}
          style={styles.addButton}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {STATUS_FILTERS.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterPill,
                activeFilter === filter && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === filter && styles.filterPillTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingSkeleton height={140} count={3} />
        </View>
      ) : filteredEnquiries.length === 0 ? (
        <EmptyState
          title="No Enquiries Found"
          message={
            searchQuery
              ? 'No leads match your search criteria.'
              : 'There are currently no wedding enquiries in this category.'
          }
          actionLabel="Add Lead"
          onAction={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={filteredEnquiries}
          keyExtractor={(item) => item.id}
          renderItem={renderEnquiryCard}
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

      {/* Create Enquiry Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Wedding Enquiry</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <ImperialInput
                label="Customer Name *"
                placeholder="e.g. Sanya Kapoor"
                value={formData.customerName}
                onChangeText={(text) => setFormData({ ...formData, customerName: text })}
              />
              <ImperialInput
                label="Email Address *"
                placeholder="sanya@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
              <ImperialInput
                label="Phone Number *"
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
              />
              <ImperialInput
                label="Destination / City *"
                placeholder="e.g. Udaipur, Rajasthan"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
              <ImperialInput
                label="Estimated Guests"
                placeholder="300"
                keyboardType="numeric"
                value={String(formData.guestCount)}
                onChangeText={(text) =>
                  setFormData({ ...formData, guestCount: parseInt(text, 10) || 0 })
                }
              />
              <View style={styles.modalRow}>
                <View style={styles.modalHalf}>
                  <ImperialInput
                    label="Min Budget (₹)"
                    placeholder="1500000"
                    keyboardType="numeric"
                    value={String(formData.minBudget)}
                    onChangeText={(text) =>
                      setFormData({ ...formData, minBudget: parseInt(text, 10) || 0 })
                    }
                  />
                </View>
                <View style={styles.modalHalf}>
                  <ImperialInput
                    label="Max Budget (₹)"
                    placeholder="3500000"
                    keyboardType="numeric"
                    value={String(formData.maxBudget)}
                    onChangeText={(text) =>
                      setFormData({ ...formData, maxBudget: parseInt(text, 10) || 0 })
                    }
                  />
                </View>
              </View>

              <ImperialInput
                label="Planning Notes"
                placeholder="Royal palace preference, floral mandap, vintage car arrival..."
                multiline
                numberOfLines={3}
                value={formData.notes || ''}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
              />

              <View style={styles.modalActions}>
                <ImperialButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setModalVisible(false)}
                  style={styles.modalButton}
                />
                <ImperialButton
                  title={submitting ? 'Submitting...' : 'Create Lead'}
                  variant="gold"
                  loading={submitting}
                  onPress={handleCreateEnquiry}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
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
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    marginBottom: 0,
  },
  addButton: {
    minWidth: 100,
    height: 48,
  },
  filterContainer: {
    marginBottom: spacing.xs,
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
  headerLeft: {
    flex: 1,
  },
  refNumber: {
    fontSize: typography.fontSize.xs,
    color: colors.gold,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.5,
  },
  customerName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    marginTop: 2,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
  },
  detailValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    fontWeight: typography.fontWeight.medium,
    marginTop: 2,
  },
  budgetHighlight: {
    fontSize: typography.fontSize.sm,
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
    marginTop: 2,
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderDark,
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    fontSize: typography.fontSize.xs - 1,
    color: '#8E9CAE',
  },
  plannerAssigned: {
    fontSize: typography.fontSize.xs - 1,
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
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
    maxHeight: '85%',
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
  modalScroll: {
    marginBottom: spacing.sm,
  },
  modalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modalHalf: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});
