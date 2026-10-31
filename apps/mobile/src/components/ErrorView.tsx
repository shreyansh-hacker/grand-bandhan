import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, spacing } from '../theme';
import { ImperialButton } from './ImperialButton';

export interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorIconCircle}>
        <Text style={styles.errorIcon}>⚠️</Text>
      </View>
      <Text style={styles.title}>Unable to Load Data</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <ImperialButton
          title="Try Again"
          onPress={onRetry}
          variant="secondary"
          size="sm"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: '#FFFDFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
    margin: spacing.base,
  },
  errorIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  errorIcon: {
    fontSize: 22,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.imperialNavy,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.sm,
    marginBottom: spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
});
