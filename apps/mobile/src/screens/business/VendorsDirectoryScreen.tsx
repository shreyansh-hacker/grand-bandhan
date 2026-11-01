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
import { vendorService } from '../../api/services';
import { VendorCategory, Vendor } from '@grand-bandhan/shared';
import { queryClient } from '../../api/queryClient';
import { useAuthStore } from '../../store/authStore';

const CATEGORIES = [
  'ALL',
  ...Object.values(VendorCategory),
];

export const VendorsDirectoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuthStore();
  const isAdminOrAgency = user?.role === 'SUPER_ADMIN' || user?.role === 'AGENCY_ADMIN';

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterApproval, setFilterApproval] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');

  // Add Vendor Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState<string>(VendorCategory.CATERING);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [city, setCity] = useState('');
  const [isSubmittingVendor, setIsSubmittingVendor] = useState(false);

  // Approval Loading ID
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const {
    data: vendors = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => vendorService.list(),
  });

  const handleApproveVendor = async (id: string, name: string) => {
    Alert.alert(
      'Approve Royal Vendor Partner?',
      `Are you sure you want to approve "${name}" into the Grand Bandhan directory? They will become eligible for 3-vendor RFP bidding.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve Vendor ⚜️',
          onPress: async () => {
            setApprovingId(id);
            try {
              await vendorService.approve(id);
              queryClient.invalidateQueries({ queryKey: ['vendors'] });
              Alert.alert('Vendor Approved 🎉', `"${name}" has been approved! Onboarding email dispatched to vendor.`);
            } catch (err: any) {
              Alert.alert('Approval Error', err.message || 'Could not approve vendor.');
            } finally {
              setApprovingId(null);
            }
          },
        },
      ]
    );
  };

  const handleAddVendorSubmit = async () => {
    if (!vendorName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      Alert.alert('Required Fields', 'Please provide company name, contact email, and phone number.');
      return;
    }

    try {
      setIsSubmittingVendor(true);
      await vendorService.create({
        name: vendorName.trim(),
        category: vendorCategory,
        contactName: contactName.trim() || vendorName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        city: city.trim() || undefined,
      });

      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      Alert.alert('Vendor Added ⚜️', 'New vendor partner created in directory.');
      setShowAddModal(false);
      setVendorName('');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setCity('');
    } catch (err: any) {
      Alert.alert('Creation Error', err.message || 'Could not add vendor.');
    } finally {
      setIsSubmittingVendor(false);
    }
  };

  const filteredVendors = vendors.filter((v: any) => {
    if (selectedCategory !== 'ALL' && v.category !== selectedCategory) return false;
    if (filterApproval === 'PENDING' && v.isApproved !== false) return false;
    if (filterApproval === 'APPROVED' && v.isApproved === false) return false;
    return true;
  });

  const pendingCount = vendors.filter((v: any) => v.isApproved === false).length;

  return (
    <View style={styles.container}>
      <ImperialHeader
        title="Vendor Ecosystem"
        subtitle="Approved Luxury Artisans, Caterers & Decorators"
        onBackPress={() => navigation.goBack()}
        rightAction={{
          label: '+ Partner',
          onPress: () => setShowAddModal(true),
        }}
      />

      {/* Approval Status Toggle Bar */}
      <View style={styles.statusBar}>
        <TouchableOpacity
          style={[styles.statusBtn, filterApproval === 'ALL' && styles.statusBtnActive]}
          onPress={() => setFilterApproval('ALL')}
        >
          <Text style={[styles.statusBtnText, filterApproval === 'ALL' && styles.statusBtnTextActive]}>
            All ({vendors.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusBtn, filterApproval === 'APPROVED' && styles.statusBtnActive]}
          onPress={() => setFilterApproval('APPROVED')}
        >
          <Text style={[styles.statusBtnText, filterApproval === 'APPROVED' && styles.statusBtnTextActive]}>
            Verified ({vendors.filter((v: any) => v.isApproved !== false).length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusBtn, filterApproval === 'PENDING' && styles.statusBtnActive]}
          onPress={() => setFilterApproval('PENDING')}
        >
          <Text style={[styles.statusBtnText, filterApproval === 'PENDING' && styles.statusBtnTextActive]}>
            Pending Review ({pendingCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      <View style={styles.catBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catTab,
                selectedCategory === cat && styles.catTabActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.catTabText,
                  selectedCategory === cat && styles.catTabTextActive,
                ]}
              >
                {cat.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.content}>
          <LoadingSkeleton height={130} style={styles.skeleton} />
          <LoadingSkeleton height={130} style={styles.skeleton} />
          <LoadingSkeleton height={130} style={styles.skeleton} />
        </View>
      ) : error ? (
        <ErrorView message="Could not load vendor catalog." onRetry={() => refetch()} />
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
          {filteredVendors.length === 0 ? (
            <EmptyState
              title="No Vendors Found"
              message={
                selectedCategory === 'ALL'
                  ? 'No vendor partners found in this filter view.'
                  : `No partners currently registered under category "${selectedCategory}".`
              }
              actionLabel="+ Register Partner"
              onAction={() => setShowAddModal(true)}
            />
          ) : (
            filteredVendors.map((vendor: any) => {
              const isApproved = vendor.isApproved !== false;
              const isApproving = approvingId === vendor.id;

              return (
                <ImperialCard key={vendor.id} variant="elevated" style={styles.card}>
                  <View style={styles.rowBetween}>
                    <View style={styles.vendorMain}>
                      <Text style={styles.vendorName}>{vendor.name}</Text>
                      <View style={styles.catBadge}>
                        <Text style={styles.catBadgeText}>{vendor.category}</Text>
                      </View>
                    </View>
                    <ImperialBadge
                      label={isApproved ? 'VERIFIED' : 'PENDING'}
                      variant={isApproved ? 'success' : 'warning'}
                    />
                  </View>

                  <View style={styles.detailsRow}>
                    <Text style={styles.detailText}>👤 {vendor.contactName || 'Primary Liaison'}</Text>
                    {vendor.city && <Text style={styles.detailText}>📍 {vendor.city}</Text>}
                    <Text style={styles.detailText}>⭐ {vendor.rating ? `${vendor.rating} / 5.0` : '5.0 Imperial'}</Text>
                  </View>

                  <View style={styles.contactRow}>
                    <TouchableOpacity
                      style={styles.contactChip}
                      onPress={() => vendor.contactPhone && Linking.openURL(`tel:${vendor.contactPhone}`)}
                    >
                      <Text style={styles.contactChipText}>📞 {vendor.contactPhone || 'No Phone'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.contactChip}
                      onPress={() => vendor.contactEmail && Linking.openURL(`mailto:${vendor.contactEmail}`)}
                    >
                      <Text style={styles.contactChipText} numberOfLines={1}>
                        ✉️ {vendor.contactEmail}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Admin Approval Button if Pending */}
                  {isAdminOrAgency && !isApproved && (
                    <View style={styles.approveContainer}>
                      <ImperialButton
                        title="Approve Royal Partner ⚜️"
                        variant="gold"
                        size="sm"
                        loading={isApproving}
                        onPress={() => handleApproveVendor(vendor.id, vendor.name)}
                        style={styles.approveBtn}
                      />
                    </View>
                  )}
                </ImperialCard>
              );
            })
          )}
        </ScrollView>
      )}

      {/* Add Vendor Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Vendor Partner</Text>
              <Text style={styles.modalSubtitle}>Register a luxury service partner in the directory</Text>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>COMPANY / ARTISAN NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="Royal Mewar Catering & Banquets"
                placeholderTextColor={colors.textMuted}
                value={vendorName}
                onChangeText={setVendorName}
              />

              <Text style={styles.inputLabel}>CATEGORY</Text>
              <ScrollView horizontal style={styles.categoryPills} showsHorizontalScrollIndicator={false}>
                {Object.values(VendorCategory).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catPill,
                      vendorCategory === cat && styles.catPillActive,
                    ]}
                    onPress={() => setVendorCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.catPillText,
                        vendorCategory === cat && styles.catPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>PRIMARY CONTACT PERSON</Text>
              <TextInput
                style={styles.input}
                placeholder="Vikramaditya Singh"
                placeholderTextColor={colors.textMuted}
                value={contactName}
                onChangeText={setContactName}
              />

              <View style={styles.inputRow}>
                <View style={styles.halfCol}>
                  <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="phone-pad"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                  />
                </View>
                <View style={styles.halfCol}>
                  <Text style={styles.inputLabel}>CITY / REGION</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Udaipur, Rajasthan"
                    placeholderTextColor={colors.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>OFFICIAL EMAIL</Text>
              <TextInput
                style={styles.input}
                placeholder="liaison@royalbanquets.in"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                value={contactEmail}
                onChangeText={setContactEmail}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
                disabled={isSubmittingVendor}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleAddVendorSubmit}
                disabled={isSubmittingVendor}
              >
                {isSubmittingVendor ? (
                  <ActivityIndicator size="small" color={colors.imperialNavyDark} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Vendor ⚜️</Text>
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
  statusBar: {
    flexDirection: 'row',
    backgroundColor: colors.imperialNavyDark,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusBtn: {
    marginRight: spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  statusBtnActive: {
    backgroundColor: 'rgba(201, 169, 106, 0.2)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  statusBtnText: {
    fontSize: 10,
    color: '#8E9CAE',
    fontWeight: typography.fontWeight.medium,
  },
  statusBtnTextActive: {
    color: colors.goldLight,
    fontWeight: typography.fontWeight.bold,
  },
  catBar: {
    backgroundColor: colors.imperialNavy,
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGold,
  },
  catScroll: {
    paddingHorizontal: spacing.base,
    gap: spacing.xs,
  },
  catTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  catTabActive: {
    backgroundColor: colors.gold,
  },
  catTabText: {
    fontSize: typography.fontSize.xs,
    color: '#CBD5E1',
    fontWeight: typography.fontWeight.medium,
  },
  catTabTextActive: {
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
  vendorMain: {
    flex: 1,
  },
  vendorName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
  },
  catBadge: {
    backgroundColor: 'rgba(201, 169, 106, 0.15)',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: colors.borderGold,
  },
  catBadgeText: {
    fontSize: 9,
    color: colors.goldDark,
    fontWeight: typography.fontWeight.bold,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginVertical: 4,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  contactRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: 6,
  },
  contactChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 1,
  },
  contactChipText: {
    fontSize: 10,
    color: colors.textPrimary,
  },
  approveContainer: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: spacing.xs,
  },
  approveBtn: {
    width: '100%',
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
  categoryPills: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  catPill: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginRight: 6,
  },
  catPillActive: {
    backgroundColor: colors.gold,
    borderColor: colors.goldDark,
  },
  catPillText: {
    fontSize: 10,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  catPillTextActive: {
    color: colors.imperialNavyDark,
    fontWeight: typography.fontWeight.bold,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfCol: {
    flex: 1,
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
