import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRole, VendorCategory } from '@grand-bandhan/shared';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import {
  ImperialButton,
  ImperialInput,
  ImperialCard,
  ImperialBadge,
  ImperialLogo,
} from '../../components';
import { useAuthStore } from '../../store/authStore';

const VENDOR_CATEGORIES = [
  { value: VendorCategory.CATERING, label: 'Royal Banquets & Catering' },
  { value: VendorCategory.PHOTOGRAPHY, label: 'Imperial Photography & Cinema' },
  { value: VendorCategory.DECORATION, label: 'Palace Decor & Scenography' },
  { value: VendorCategory.VENUE, label: 'Heritage Venues & Palaces' },
  { value: VendorCategory.DJ_MUSIC, label: 'Live Orchestration, DJs & Artists' },
  { value: VendorCategory.MAKEUP_ARTIST, label: 'Bridal Couture & Makeup Styling' },
  { value: VendorCategory.TRANSPORTATION, label: 'Royal Guest Logistics & Valet' },
  { value: VendorCategory.FLORIST, label: 'Luxury Floral Design' },
  { value: VendorCategory.CHOREOGRAPHY, label: 'Sangeet Choreography' },
  { value: VendorCategory.MEHENDI_ARTIST, label: 'Royal Mehendi Artists' },
  { value: VendorCategory.OTHER, label: 'Bespoke Wedding Services' },
];

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Enter a valid 10-digit phone number').optional().or(z.literal('')),
  agencyName: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<UserRole.CLIENT | UserRole.VENDOR>(
    route?.params?.defaultRole === 'VENDOR' ? UserRole.VENDOR : UserRole.CLIENT
  );
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>(
    VendorCategory.CATERING
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      agencyName: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await register({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone || undefined,
        role: selectedRole,
        agencyName:
          selectedRole === UserRole.VENDOR
            ? data.agencyName || data.name
            : 'Grand Bandhan Imperial Weddings',
      });
      Alert.alert(
        'Imperial Welcome',
        selectedRole === UserRole.CLIENT
          ? 'Your Royal Couple account has been created! Welcome to Grand Bandhan.'
          : 'Your Vendor Empanelment application has been received and logged for review.'
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Please check your information and try again.');
    }
  };

  const isClient = selectedRole === UserRole.CLIENT;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Crest */}
        <View style={styles.brandContainer}>
          <ImperialLogo size="lg" showText textColor={colors.imperialNavy} withGlow />
          <View style={styles.goldDivider} />
        </View>

        {/* Role Selector Tabs */}
        <View style={styles.roleTabs}>
          <TouchableOpacity
            style={[styles.roleTab, isClient && styles.roleTabActive]}
            onPress={() => setSelectedRole(UserRole.CLIENT)}
          >
            <Text style={[styles.roleTabText, isClient && styles.roleTabTextActive]}>
              👑 Royal Couple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, !isClient && styles.roleTabActive]}
            onPress={() => setSelectedRole(UserRole.VENDOR)}
          >
            <Text style={[styles.roleTabText, !isClient && styles.roleTabTextActive]}>
              ⚜️ Wedding Vendor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Registration Card */}
        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>
            {isClient ? 'Royal Couple Registration' : 'Vendor Empanelment Application'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {isClient
              ? 'Begin curating your imperial wedding operations'
              : 'Empanel your luxury wedding business with Grand Bandhan'}
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label={isClient ? 'Couple Full Name (e.g. Rhea & Siddharth)' : 'Business / Brand Name'}
                placeholder={isClient ? 'Rhea Kapoor & Siddharth Malhotra' : 'Royal Rajputana Culinary & Banquets'}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />

          {!isClient && (
            <View style={styles.categorySection}>
              <Text style={styles.inputLabel}>Vendor Discipline / Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {VENDOR_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.value;
                  return (
                    <TouchableOpacity
                      key={cat.value}
                      style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
                      onPress={() => setSelectedCategory(cat.value)}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isSelected && styles.categoryPillTextSelected,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Email Address"
                placeholder={isClient ? 'couple@royalwedding.com' : 'concierge@vendor.com'}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="email-address"
                autoComplete="email"
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Contact Phone Number"
                placeholder="+91 98200 12345"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Password"
                placeholder="Minimum 6 characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                error={errors.password?.message}
              />
            )}
          />

          <ImperialButton
            title={isClient ? 'Create Royal Account' : 'Submit Empanelment Application'}
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            size="lg"
            style={styles.submitBtn}
          />
        </ImperialCard>

        {/* Staff Policy Notice */}
        <View style={styles.staffNotice}>
          <Text style={styles.staffNoticeTitle}>INTERNAL STAFF POLICY</Text>
          <Text style={styles.staffNoticeText}>
            Planner, Coordinator, and Agency Administrator accounts cannot be created publicly.
            Staff credentials are issued directly via authorized Agency Administrator invitation.
          </Text>
        </View>

        {/* Back to Login Link */}
        <View style={styles.loginLinkRow}>
          <Text style={styles.loginLinkText}>Already have an imperial account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkAction}>Sign In Here</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.base,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  goldDivider: {
    width: 48,
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#EDE8DF',
    borderRadius: borderRadius.md,
    padding: 3,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderGold,
  },
  roleTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md - 2,
  },
  roleTabActive: {
    backgroundColor: colors.imperialNavy,
    ...shadows.sm,
  },
  roleTabText: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
  },
  roleTabTextActive: {
    color: colors.gold,
    fontWeight: typography.fontWeight.heavy,
  },
  card: {
    marginBottom: spacing.base,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  inputLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  categorySection: {
    marginBottom: spacing.md,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryPill: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.round,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  categoryPillSelected: {
    backgroundColor: colors.imperialNavy,
    borderColor: colors.gold,
  },
  categoryPillText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  categoryPillTextSelected: {
    color: colors.gold,
    fontWeight: typography.fontWeight.bold,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  staffNotice: {
    backgroundColor: '#FAF5EA',
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  staffNoticeTitle: {
    fontSize: 10,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 1,
    marginBottom: 3,
  },
  staffNoticeText: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loginLinkText: {
    fontSize: typography.fontSize.xs + 1,
    color: colors.textSecondary,
  },
  loginLinkAction: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    textDecorationLine: 'underline',
  },
});
