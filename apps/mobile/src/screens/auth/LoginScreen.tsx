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
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { ImperialButton, ImperialInput, ImperialCard, ImperialBadge, ImperialLogo } from '../../components';
import { useAuthStore } from '../../store/authStore';

const loginFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

// Seeded demo accounts for quick role-switching in development
const DEMO_ROLES = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', email: 'admin@grandbandhan.com', pass: 'GrandBandhan@2025' },
  { role: 'AGENCY_ADMIN', label: 'Agency Principal', email: 'agency@grandbandhan.com', pass: 'GrandBandhan@2025' },
  { role: 'WEDDING_PLANNER', label: 'Wedding Planner', email: 'planner@grandbandhan.com', pass: 'GrandBandhan@2025' },
  { role: 'COORDINATOR', label: 'Coordinator', email: 'coordinator@grandbandhan.com', pass: 'GrandBandhan@2025' },
  { role: 'VENDOR', label: 'Vendor', email: 'vendor@sharma-catering.com', pass: 'Vendor@123' },
  { role: 'CLIENT', label: 'Royal Couple', email: 'client@grandbandhan.com', pass: 'GrandBandhan@2025' },
];

export const LoginScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [selectedDemoRole, setSelectedDemoRole] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      await login(data);
    } catch (err: any) {
      Alert.alert('Authentication Failed', err.message || 'Please check your email and password.');
    }
  };

  const handleSelectDemoAccount = (acc: typeof DEMO_ROLES[0]) => {
    setSelectedDemoRole(acc.role);
    setValue('email', acc.email, { shouldValidate: true });
    setValue('password', acc.pass, { shouldValidate: true });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Crest & Luxury Title */}
        <View style={styles.brandContainer}>
          <ImperialLogo size="xl" showText textColor={colors.imperialNavy} withGlow />
          <View style={styles.goldDivider} />
        </View>

        {/* Login Form Card */}
        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Access your imperial wedding planner workspace
          </Text>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Email Address"
                placeholder="name@grandbandhan.com"
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
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Password"
                placeholder="••••••••••••"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                error={errors.password?.message}
              />
            )}
          />

          <TouchableOpacity
            style={styles.forgotPasswordContainer}
            onPress={() => navigation?.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <ImperialButton
            title="Authenticate & Enter"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            size="lg"
            style={styles.loginButton}
          />

          <View style={styles.registerPrompt}>
            <Text style={styles.registerPromptText}>New to Grand Bandhan? </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLink}>Register Account</Text>
            </TouchableOpacity>
          </View>
        </ImperialCard>

        {/* Development Quick Role Switcher */}
        {__DEV__ && (
          <View style={styles.demoSection}>
          <Text style={styles.demoSectionTitle}>DEMO ROLE SELECTOR</Text>
          <Text style={styles.demoSectionSubtitle}>
            Tap a role to populate verified backend credentials:
          </Text>
          <View style={styles.demoPillsContainer}>
            {DEMO_ROLES.map((acc) => {
              const isSelected = selectedDemoRole === acc.role;
              return (
                <TouchableOpacity
                  key={acc.role}
                  onPress={() => handleSelectDemoAccount(acc)}
                  style={[
                    styles.demoPill,
                    isSelected && styles.demoPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.demoPillText,
                      isSelected && styles.demoPillTextSelected,
                    ]}
                  >
                    {acc.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        )}

        {/* Backend & Neon Security Info */}
        <View style={styles.securityInfo}>
          <Text style={styles.securityText}>
            🔒 Protected by Android Keystore hardware-backed encryption
          </Text>
          <Text style={styles.endpointText}>
            API: grand-bandhan.onrender.com • DB: Neon PostgreSQL
          </Text>
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
    marginVertical: spacing.lg,
  },
  crestCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.imperialNavy,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.goldGlow,
  },
  crestIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.heavy,
    color: colors.imperialNavy,
    letterSpacing: 3,
  },
  brandSubtitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.goldDark,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  goldDivider: {
    width: 48,
    height: 3,
    backgroundColor: colors.gold,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.xs,
    color: colors.goldDark,
    fontWeight: typography.fontWeight.semibold,
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  registerPromptText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.fontSize.sm,
    color: colors.imperialNavy,
    fontWeight: typography.fontWeight.bold,
    textDecorationLine: 'underline',
  },
  demoSection: {
    backgroundColor: '#FAF5EA',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderGold,
    padding: spacing.md,
    marginBottom: spacing.base,
  },
  demoSectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.heavy,
    color: colors.goldDark,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  demoSectionSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  demoPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  demoPill: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderGold,
    borderRadius: borderRadius.round,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm + 2,
  },
  demoPillSelected: {
    backgroundColor: colors.imperialNavy,
    borderColor: colors.imperialNavy,
  },
  demoPillText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
  demoPillTextSelected: {
    color: colors.gold,
  },
  securityInfo: {
    alignItems: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.base,
  },
  securityText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  endpointText: {
    fontSize: 10,
    color: colors.goldDark,
    marginTop: 3,
    letterSpacing: 0.5,
  },
});
