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

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setLoading(true);
      const message = await authService.forgotPassword(data.email.trim());
      setSubmittedEmail(data.email.trim());
      Alert.alert('Reset Instructions Dispatched', message, [
        {
          text: 'Enter Reset Token',
          onPress: () =>
            navigation.navigate('ResetPassword', { email: data.email.trim() }),
        },
        { text: 'OK', style: 'cancel' },
      ]);
    } catch (err: any) {
      Alert.alert('Request Failed', err.message || 'Could not process request');
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
          <Text style={styles.cardTitle}>Imperial Password Recovery</Text>
          <Text style={styles.cardSubtitle}>
            Enter your registered email address to receive password reset authorization credentials.
          </Text>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <ImperialInput
                label="Registered Email Address"
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

          <ImperialButton
            title="Dispatch Reset Instructions"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            size="lg"
            style={styles.submitBtn}
          />

          {submittedEmail && (
            <TouchableOpacity
              style={styles.haveTokenBtn}
              onPress={() =>
                navigation.navigate('ResetPassword', { email: submittedEmail })
              }
            >
              <Text style={styles.haveTokenText}>
                Have your reset authorization token? Tap here to reset password →
              </Text>
            </TouchableOpacity>
          )}
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
  haveTokenBtn: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: '#FAF5EA',
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  haveTokenText: {
    fontSize: 11,
    color: colors.goldDark,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
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
