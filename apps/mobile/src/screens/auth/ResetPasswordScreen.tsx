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
import { colors, typography, spacing, borderRadius } from '../../theme';
import {
  ImperialButton,
  ImperialInput,
  ImperialCard,
  ImperialLogo,
} from '../../components';
import { authService } from '../../api/services/auth.service';

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: route?.params?.token || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      setLoading(true);
      const message = await authService.resetPassword(data.token.trim(), data.newPassword);
      Alert.alert('Imperial Password Reset Complete', message, [
        {
          text: 'Sign In Now',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Reset Failed', err.message || 'Could not reset password. Your token may have expired.');
    } finally {
      setLoading(false);
    }
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
        <View style={styles.brandContainer}>
          <ImperialLogo size="lg" showText textColor={colors.imperialNavy} withGlow />
          <View style={styles.goldDivider} />
        </View>

        <ImperialCard variant="elevated" style={styles.card}>
          <Text style={styles.cardTitle}>Set New Imperial Password</Text>
          <Text style={styles.cardSubtitle}>
            Enter your authorization reset token and your new confidential password.
          </Text>

          <Controller
            control={control}
            name="token"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Reset Authorization Token"
                placeholder="Paste token received via email/sms"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.token?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="New Password"
                placeholder="Minimum 6 characters"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                error={errors.newPassword?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Confirm New Password"
                placeholder="Re-enter your new password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                isPassword
                error={errors.confirmPassword?.message}
              />
            )}
          />

          <ImperialButton
            title="Update & Secure Password"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />
        </ImperialCard>

        <View style={styles.backRow}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backLink}>← Return to Imperial Sign In</Text>
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
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
  backRow: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  backLink: {
    fontSize: typography.fontSize.xs + 1,
    fontWeight: typography.fontWeight.semibold,
    color: colors.imperialNavy,
  },
});
